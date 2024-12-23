import { Hono } from "hono";
import { describeRoute, openAPISpecs } from "hono-openapi";
import { resolver, validator as vValidator } from "hono-openapi/valibot";
import { apiReference } from "@scalar/hono-api-reference";
import * as v from "valibot";

const paramSchema = v.object({
  name: v.pipe(v.string(), v.minLength(3)),
});

const responseSchema = v.string();
const app = new Hono();

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

app.get(
  "/",
  describeRoute({
    description: "Say hello to Hono",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "text/plain": {
            schema: resolver(responseSchema),
            example: "Hello Hono!",
          },
        },
      },
    },
  }),
  (c) => {
    return c.text(`Hello Hono!`);
  },
);

app.get(
  "/hello/:name",
  describeRoute({
    description: "Say hello to the user",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "text/plain": {
            schema: resolver(responseSchema),
            example: "Hello John!",
          },
        },
      },
    },
  }),
  vValidator("param", paramSchema),
  (c) => {
    const name = c.req.param("name");
    return c.text(`Hello ${name}!`);
  },
);

export default app;
