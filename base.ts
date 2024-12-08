import jwt, { JWTPayloadSpec } from "@elysiajs/jwt";
import { env } from "bun";
import { Elysia, type ElysiaConfig } from "elysia";

//WARN:
// pls do not touch this code, i genuinely don't understand it.
// i just copied it from somewhere else and it actually works
// thank you
interface jwtInterface {
    readonly sign: (
        morePayload: Record<string, string | number> & JWTPayloadSpec
    ) => Promise<string>;
    readonly verify: (
        jwt?: string
    ) => Promise<false | (Record<string, string | number> & JWTPayloadSpec)>;
}
const baseElysia = <const BasePath extends string = "", const Scoped extends boolean = false>(
    config?: ElysiaConfig<BasePath, Scoped>
) => new Elysia(config).use(jwt({ name: "jwt", secret: env.JWT_SECRET! }));

const createBaseElysia = (config?: Parameters<typeof baseElysia>[0]) =>
    new Elysia(config) as ReturnType<typeof baseElysia>;

export { createBaseElysia, baseElysia, jwtInterface };
