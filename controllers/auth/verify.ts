import { t } from "elysia";
import { createBaseElysia } from "../../base";
import db from "../../lib/db";
import { env } from "bun";
import jwt from "@elysiajs/jwt";
import { validateSession } from "../../utils/validateUser";

export const Verify = createBaseElysia()
    .use(jwt({ name: "jwt", secret: env.JWT_SECRET! }))
    .patch(
        "/verify",
        async context => {
            const {
                jwt,
                body: { otp },
                set,
            } = context;
            const loggedInuser = await validateSession(jwt, context);
            if (!loggedInuser) {
                set.status = 401;
                return { message: "unauthorized User", user: null };
            }
            const otpObject = await db.oTP.findFirst({ where: { value: otp } });
            if (!otpObject) {
                set.status = 403;
                return { message: "Incorrect Otp", user: null };
            }
            if (otpObject.expiryDate < new Date()) {
                await db.oTP.update({ where: { value: otp }, data: { used: true } });

                set.status = 403;
                return { message: "Otp has expired", user: null };
            }
            if (otpObject.used) {
                set.status = 403;
                return { message: "Otp has Been used", user: null };
            }
            if (otpObject.username == loggedInuser) {
                await db.oTP.updateMany({
                    where: { username: loggedInuser },
                    data: { used: true },
                });
            }
            try {
                const updateUser = await db.user.update({
                    where: { username: loggedInuser },
                    data: { verified: true },
                    select: { first_name: true, last_name: true, username: true, verified: true },
                });
                set.status = 201;
                return { message: "User Verified", user: updateUser };
            } catch (error) {
                set.status = 500;
                return { message: "Failed to verify user", user: null, error };
            }
        },
        {
            body: t.Object({ otp: t.String() }),
        }
    );
