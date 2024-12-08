import { t } from "elysia";
import { createBaseElysia } from "../../base";
import db from "../../lib/db";
import { generateOtp } from "../../utils/otp";
import { SendEmail } from "../../utils/sendMail";
import { validateSession } from "../../utils/validateUser";

export const RequestVerification = createBaseElysia()
    .onParse(async ({ request, contentType }) => {
        try {
            if (contentType === "application/json") {
                return await request.json();
            }
        } catch (error) {
            return request.text();
        }
    })
    .post(
        "/requestverify",
        async context => {
            const { set } = context;
            const loggedInUser = await validateSession(context.jwt, context);
            if (!loggedInUser) {
                set.status = 401;
                return { user: null, message: "User not authorized" };
            }
            let optToken = generateOtp();
            console.log("in here");
            const existsOtp = await db.oTP.upsert({
                where: { value: optToken, used: true },
                update: {
                    used: false,
                    username: loggedInUser,
                    expiryDate: new Date(Date.now() + 5 * 60 * 1000),
                },
                create: {
                    value: optToken,
                    username: loggedInUser,
                    expiryDate: new Date(Date.now() + 5 * 60 * 1000),
                },
            });
            console.log(existsOtp);
            if (!existsOtp) {
                set.status = 500;
                return { user: false, message: "Fails to send email" };
            }
            const emailResponse = await SendEmail(loggedInUser, optToken);
            if (emailResponse.success) {
                set.status = 200;
                return { user: loggedInUser, message: "Otp Sent to your email" };
            }
        },
        {
            detail: {
                description: "Request for Verification OTP to be sent to user",
                responses: {
                    200: {
                        description: "successful signin",
                        content: {
                            "application/json": {
                                example: {
                                    user: "adsdasad",
                                    message: "OTP send to your email",
                                },
                            },
                        },
                    },
                },
            },
        }
    );
