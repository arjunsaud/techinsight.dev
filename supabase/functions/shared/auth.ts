import {
  createAuthClient,
  createPublicClient,
  getBearerToken,
} from "./client.ts";

interface CurrentUser {
  id: string;
  email: string;
  role: "superadmin" | "admin" | "user";
  accessToken: string;
}

export async function requireAuth(req: Request): Promise<CurrentUser> {
  const token = getBearerToken(req);

  if (!token) {
    throw new Error("Unauthorized");
  }

  const publicClient = createPublicClient();
  const {
    data: { user },
    error,
  } = await publicClient.auth.getUser(token);

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  const authedClient = createAuthClient(token);
  const { data: profile } = await authedClient.from("superadmins").select(
    "id,email,role",
  ).eq("id", user.id).maybeSingle();

  if (!profile) {
    throw new Error("Unauthorized");
  }

  return {
    ...(profile as Omit<CurrentUser, "accessToken">),
    accessToken: token,
  };
}

export async function getOptionalAuth(
  req: Request,
): Promise<CurrentUser | null> {
  const token = getBearerToken(req);
  if (!token) {
    return null;
  }

  try {
    return await requireAuth(req);
  } catch {
    return null;
  }
}

export async function requireAdmin(req: Request): Promise<CurrentUser> {
  const user = await requireAuth(req);

  if (user.role !== "admin" && user.role !== "superadmin") {
    throw new Error("Forbidden");
  }

  return user;
}

export async function requireSuperAdmin(req: Request): Promise<CurrentUser> {
  const user = await requireAuth(req);

  if (user.role !== "superadmin") {
    throw new Error("Forbidden");
  }

  return user;
}
