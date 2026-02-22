import { createFunctionApp } from "../shared/hono.ts";
import { registerBlogRoutes } from "./blog/routes/blog.routes.ts";
import { registerCommentRoutes } from "./comment/routes/comment.routes.ts";
import { registerAdminRoutes } from "./admin/routes/admin.routes.ts";

const app = createFunctionApp();

registerBlogRoutes(app);
registerCommentRoutes(app);
registerAdminRoutes(app);

export default app;
