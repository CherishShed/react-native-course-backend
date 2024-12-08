import { createBaseElysia } from "../../base";
import { GetDetails } from "./getUserDetails";
import { updateProfile } from "./updateprofile";

const appSwagger = {
    detail: {
        tags: ["User"],
        responses: {
            401: {
                description: "Unauthorized user",
                content: {
                    "application/json": {
                        example: {
                            user: null,
                            message: "User not authorized",
                        },
                    },
                },
            },
        },
    },
};

export const UserController = createBaseElysia({ prefix: "user", detail: appSwagger.detail })
    .use(updateProfile)
    .use(GetDetails);
