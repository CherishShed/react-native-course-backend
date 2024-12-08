import { t } from "elysia";
import { createBaseElysia } from "../../base";
import db from "../../lib/db";
import { generateOtp } from "../../utils/otp";
import { SendEmail } from "../../utils/sendMail";

export const register = createBaseElysia().post(
    "/signup",
    async ({ jwt, body, set, cookie: { auth } }) => {
        const { username, password } = body;
        if (!body || !body.username || !body.password) {
            set.status = 400;
            return { user: null, message: "Username and password are required" };
        }
        const existingUser = await db.user.findFirst({ where: { username } });
        if (existingUser) {
            set.status = 409;
            return { user: null, message: "This user already exists" };
        }

        const passwordHash = await Bun.password.hash(password);
        try {
            const newUser = await db.user.create({
                data: { username, password: passwordHash },
                select: { username: true, createdAt: true },
            });
            if (!newUser) {
                set.status = 500;
                return { user: null, message: "Failed to create profile" };
            }
            auth.set({
                value: await jwt.sign({ sub: username, exp: 50000 }),
                expires: new Date(Date.now() + 50000),
            });
            const optToken = generateOtp();
            const createdOtp = await db.oTP.upsert({
                where: { value: optToken, used: true },
                update: {
                    used: false,
                    username,
                    expiryDate: new Date(Date.now() + 5 * 60 * 1000),
                },
                create: {
                    value: optToken,
                    username,
                    expiryDate: new Date(Date.now() + 5 * 60 * 1000),
                },
            });
            if (!createdOtp) {
                set.status = 500;
                return { user: null, message: "Failed to send Otp" };
            }
            const emailResponse = await SendEmail(username, optToken);
            if (emailResponse.success) {
                set.status = 201;
                return { user: newUser, message: "Signup Successful" };
            }
        } catch (error) {
            set.status = 500;
            return { user: null, message: "An error occured", error };
        }
    },
    {
        body: t.Object({ username: t.String(), password: t.String() }),
        detail: {
            description: "Signup API for user",
            responses: {
                201: {
                    description: "Signup successful",
                    content: {
                        "application/json": {
                            example: {
                                user: { username: "negro", createdAt: "2024-01-12T00z" },
                                message: "Signup successful",
                            },
                        },
                    },
                },
                400: {
                    description: "Username and password are required",
                    content: {
                        "application/json": {
                            example: { user: null, message: "Username and password are required" },
                        },
                    },
                },
                409: {
                    description: "This user already exists",
                    content: {
                        "application/json": {
                            example: { user: null, message: "This user already exists" },
                        },
                    },
                },
                500: {
                    description: "An error occurred during signup",
                    content: {
                        "application/json": {
                            example: {
                                user: null,
                                message: "Failed to send OTP/ an error occured",
                            },
                        },
                    },
                },
            },
        },
    }
);
