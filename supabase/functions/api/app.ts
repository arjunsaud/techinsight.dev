import { createFunctionApp } from "../shared/hono.ts";
import { registerArticleRoutes } from "./article/routes/article.routes.ts";
import { registerCommentRoutes } from "./comment/routes/comment.routes.ts";
import { registerAdminRoutes } from "./admin/routes/admin.routes.ts";

const app = createFunctionApp();

registerArticleRoutes(app);
registerCommentRoutes(app);
registerAdminRoutes(app);

export default app;
