import type { Hono } from "jsr:@hono/hono";
import {
  listSeries,
  getSeries,
  createSeries,
  updateSeries,
  deleteSeries,
  getPostSeriesInfo,
  createSeriesPost,
  updateSeriesPost,
  deleteSeriesPost,
  getSeriesPost,
  getSeriesPostBySlug,
  reorderSeriesPosts,
} from "../controllers/series.controller.ts";

export function registerSeriesRoutes(app: Hono) {
  app.get("/api/series", listSeries);
  app.get("/api/series/:idOrSlug", getSeries);
  app.get("/api/series/post/:postSlug", getPostSeriesInfo);
  app.get("/api/series/post/slug/:slug", getSeriesPostBySlug);
  app.post("/api/series/:id/reorder", reorderSeriesPosts);
  
  app.post("/api/series", createSeries);
  app.patch("/api/series/:id", updateSeries);
  app.delete("/api/series/:id", deleteSeries);

  // Standalone Series Posts Routes
  app.get("/api/series/:id/posts/:postId", getSeriesPost);
  app.post("/api/series/:id/posts", createSeriesPost);
  app.patch("/api/series/:id/posts/:postId", updateSeriesPost);
  app.delete("/api/series/:id/posts/:postId", deleteSeriesPost);
}
