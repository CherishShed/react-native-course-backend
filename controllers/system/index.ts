import Elysia from "elysia";

const appSwagger = {
  detail: {
    tags: ["System"],
  },
};

export const system = new Elysia()
  .get(
    "/healthcheck",
    async (context) => {
      context.set.status = 200;
      return "Ok";
    },
    appSwagger
  )

  .get(
    "/heartbeat",
    async (context) => {
      context.set.status = 200;
      return "Ok";
    },
    appSwagger
  )
  .get(
    "/check",
    async (context) => {
      context.set.status = 200;
      return "Ok";
    },
    appSwagger
  );
