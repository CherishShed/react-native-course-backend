import { signin } from "./signin";
import { createBaseElysia } from "../../base";
import { register } from "./register";
import { Verify } from "./verify";
import { RequestVerification } from "./requestVerificationOtp";

const appSwagger = {
    detail: {
        tags: ["Auth"],
    },
};

export const authRoute = createBaseElysia({
    prefix: "/auth",
    detail: appSwagger.detail,
})
    .use(signin)
    .use(register)
    .use(Verify)
    .use(RequestVerification);
