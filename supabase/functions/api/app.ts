import { createFunctionApp } from "../shared/hono.ts";
import { registerArticleRoutes } from "./article/routes/article.routes.ts";
import { registerCommentRoutes } from "./comment/routes/comment.routes.ts";
import { registerAdminRoutes } from "./admin/routes/admin.routes.ts";
import { registerTagRoutes } from "./tag/routes/tag.routes.ts";
import { registerCategoryRoutes } from "./category/routes/category.routes.ts";
import { registerSettingsRoutes } from "./settings/routes/settings.routes.ts";

const app = createFunctionApp();

// Test route to verify API is alive
app.get("/api/ping", (c) => c.json({ status: "ok" }));

registerSettingsRoutes(app);
registerArticleRoutes(app);
registerCommentRoutes(app);
registerAdminRoutes(app);
registerTagRoutes(app);
registerCategoryRoutes(app);

export default app;
