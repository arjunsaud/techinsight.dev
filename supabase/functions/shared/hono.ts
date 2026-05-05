import { Hono } from "jsr:@hono/hono";
import { HTTPException } from "jsr:@hono/hono/http-exception";
import { cors } from "jsr:@hono/hono/cors";

const APP_URL = Deno.env.get("APP_URL")?.replace(/\/+$/, "");

export function createFunctionApp() {
  const app = new Hono();

  app.use(
    "*",
    cors({
      origin: (origin) => {
        const allowedOrigins = [
          "http://localhost:3000",
          "https://www.techinsight.dev",
          "https://techinsight.dev",
        ];

        if (APP_URL) {
          allowedOrigins.push(APP_URL);
        }

        if (allowedOrigins.includes(origin) || !origin) {
          return origin;
        }

        // Fallback for local development if origin is not provided or different port
        if (
          origin.startsWith("http://localhost:") ||
          origin.startsWith("http://127.0.0.1:")
        ) {
          return origin;
        }

        return null;
      },
      allowHeaders: [
        "authorization",
        "x-client-info",
        "apikey",
        "content-type",
      ],
      allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
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
