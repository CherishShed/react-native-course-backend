import { Context, Cookie } from "elysia";
import { jwtInterface } from "../base";

export const validateSession = async (jwt: jwtInterface, context: Context) => {
    const {
        cookie: { auth },
    } = context;
    console.log(auth.value);
    const user = await jwt.verify(auth.value);
    if (!user) {
        return null;
    }
    return user.sub;
};
