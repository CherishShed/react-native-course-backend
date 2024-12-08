import { t } from "elysia";
import { createBaseElysia } from "../../base";
import db from "../../lib/db";
import { getExpTimestamp } from "../../utils/time";

export const signin = createBaseElysia().post(
    "/signin",
    async ({ body, jwt, set, cookie: { auth } }) => {
        const { username, password } = body;
        const existingUser = await db.user.findUnique({ where: { username } });
        if (!existingUser) {
            set.status = 404;
            return { message: "User does not exist", user: null };
        }

        if (!(await Bun.password.verify(password, existingUser.password))) {
            set.status = 403;
            return { message: "Incorrect password", user: null };
        }
        const jwtSign = await jwt.sign({ sub: username, exp: getExpTimestamp(60 * 120) });
        console.log("the sign is", jwtSign);
        auth.set({
            value: jwtSign,
            httpOnly: true,
            maxAge: 60 * 120,
        });
        return { username };
    },
    {
        body: t.Object({ username: t.String(), password: t.String() }),
        detail: {
            description: "Signin api for user",
            responses: {
                200: {
                    description: "successful signin",
                    content: {
                        "application/json": {
                            example: {
                                data: {
                                    username: "adsdasad",
                                },
                            },
                        },
                    },
                },
            },
        },
    }
);
