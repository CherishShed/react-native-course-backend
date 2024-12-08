import { createBaseElysia } from "../../base";
import db from "../../lib/db";
import { validateSession } from "../../utils/validateUser";

export const GetDetails = createBaseElysia().get("/details", async context => {
    const { set } = context;
    const loggedInUser = await validateSession(context.jwt, context);
    if (!loggedInUser) {
        set.status = 401;
        return { user: null, message: "User not authorized" };
    }

    const user = await db.user.findUnique({
        where: { username: loggedInUser },
        select: {
            first_name: true,
            last_name: true,
            username: true,
            date_of_birth: true,
            verified: true,
        },
    });
    if (!user) {
        set.status = 404;
        return { user: null, message: "User does not exist" };
    }
    set.status = 201;
    return { user, message: "Details gotten Succesfully" };
});
