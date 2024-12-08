import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { swaggerConfig } from "./lib/swagger";
import cors from "@elysiajs/cors";
import { authRoute } from "./controllers/auth";
import { system } from "./controllers/system";
import { baseElysia } from "./base";
import jwt from "@elysiajs/jwt";
import { env } from "bun";
import { UserController } from "./controllers/user";
import { ProductController } from "./controllers/products";

export const app = baseElysia({ prefix: "/api" })
    .use(cors({}))
    .use(jwt({ name: "jwt", secret: env.JWT_SECRET! }))
    .use(swagger(swaggerConfig))
    .use(system)
    .use(authRoute)
    .use(UserController)
    .use(ProductController);
