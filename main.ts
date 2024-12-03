import { Hono } from "hono";
import { describeRoute, openAPISpecs } from "hono-openapi";
import { resolver, validator as vValidator } from "hono-openapi/valibot";
import { apiReference } from "@scalar/hono-api-reference";
import * as v from "valibot";

const querySchema = v.object({
  name: v.optional(v.string()),
});

const responseSchema = v.string();
const app = new Hono();

app.get(
  "/",
  describeRoute({
    description: "Say hello to the user",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "text/plain": { schema: resolver(responseSchema) },
        },
      },
    },
  }),
  vValidator("query", querySchema),
  (c) => {
    const query = c.req.valid("query");
    return c.text(`Hello ${query?.name ?? "Hono"}!`);
  },
);

app.get(
  "/openapi.json",
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "Hono API",
        version: "1.0.0",
        description: "Greeting API",
      },
      servers: [{ url: "http://localhost:8000", description: "Local Server" }],
    },
  }),
);

app.get(
  "/docs",
  apiReference({
    theme: "saturn",
    spec: { url: "/openapi.json" },
  }),
);

export default app;
