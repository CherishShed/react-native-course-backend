import { t } from "elysia";
import { createBaseElysia } from "../../base";
import { validateSession } from "../../utils/validateUser";
import db from "../../lib/db";

export const updateProfile = createBaseElysia().patch(
    "/updateprofile",
    async context => {
        const { jwt, body, set } = context;
        const loggedInuser = await validateSession(jwt, context);
        if (!loggedInuser) {
            set.status = 401;
            return { message: "unauthorized User", user: null };
        }
        const { date_of_birth, first_name, last_name } = body;
        const updatedUser = await db.user.update({
            where: { username: loggedInuser },
            data: {
                ...(first_name && { first_name }),
                ...(last_name && { last_name }),
                ...(date_of_birth && { date_of_birth }),
            },
            select: { first_name: true, last_name: true, username: true, id: true },
        });
        set.status = 201;
        return { message: "Sucessfully Updated", user: updatedUser };
    },
    {
        body: t.Object({
            first_name: t.Optional(t.String()),
            last_name: t.Optional(t.String()),
            date_of_birth: t.Optional(t.Date()),
        }),
        detail: {
            description: "Api to update the details of a user",
            responses: {
                201: {
                    description: "Successful update",
                    content: {
                        "application/json": {
                            example: {
                                user: {
                                    username: "llll",
                                    id: "23412nn1enj1e",
                                    first_name: "john",
                                    last_name: "doe",
                                },
                                message: "successfully updated",
                            },
                        },
                    },
                },
                401: {
                    description: "Unauthorized",
                    content: {
                        "application/json": {
                            example: {
                                user: null,
                                message: "Unauthorized user",
                            },
                        },
                    },
                },
            },
        },
    }
);
