import { Hono } from "jsr:@hono/hono";
import { HTTPException } from "jsr:@hono/hono/http-exception";
import { cors } from "jsr:@hono/hono/cors";

export function createFunctionApp() {
  const app = new Hono();

  app.use(
    "*",
    cors({
      origin: "*",
      allowHeaders: [
        "authorization",
        "x-client-info",
        "apikey",
        "content-type",
      ],
      allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    }),
  );

  app.onError((err, c) => {
    if (err instanceof HTTPException) {
      return err.getResponse();
    }

    const message = err instanceof Error ? err.message : "Unexpected error";
    const status = message === "Unauthorized"
      ? 401
      : message === "Forbidden"
      ? 403
      : 500;
    return c.json({ error: message }, status);
  });

  app.notFound((c) => c.json({ error: "Not found" }, 404));

  return app;
}
