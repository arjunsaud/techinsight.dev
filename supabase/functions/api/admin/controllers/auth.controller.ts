import type { Context } from "jsr:@hono/hono";
import { createAuthClient, createPublicClient } from "../../../shared/client.ts";
import { requireAdmin, requireAuth } from "../../../shared/auth.ts";

export async function forgotPassword(c: Context) {
  const payload = (await c.req.json()) as { email?: string };

  if (!payload.email) {
    return c.json({ error: "Email is required" }, 422);
  }

  const publicClient = createPublicClient();
  
  // Send password reset email
  const { error } = await publicClient.auth.resetPasswordForEmail(payload.email, {
    redirectTo: `${new URL(c.req.url).origin}/admin/reset-password`,
  });

  if (error) {
    return c.json({ error: error.message }, 400);
  }

  return c.json({ message: "Password reset instructions sent" });
}

export async function resetPassword(c: Context) {
  const payload = (await c.req.json()) as { password?: string };
  const token = c.req.header("Authorization")?.replace("Bearer ", "");

  if (!payload.password || !token) {
    return c.json({ error: "Password and reset token are required" }, 422);
  }

  const authedClient = createAuthClient(token);
  
  const { error } = await authedClient.auth.updateUser({
    password: payload.password,
  });

  if (error) {
    return c.json({ error: error.message }, 400);
  }

  return c.json({ message: "Password successfully updated" });
}

export async function changePassword(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const payload = (await c.req.json()) as { password?: string };

  if (!payload.password) {
    return c.json({ error: "New password is required" }, 422);
  }

  const authedClient = createAuthClient(admin.accessToken);
  
  const { error } = await authedClient.auth.updateUser({
    password: payload.password,
  });

  if (error) {
    return c.json({ error: error.message }, 400);
  }

  return c.json({ message: "Password successfully changed" });
}

// --- 2FA Endpoints ---

export async function enroll2FA(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const authedClient = createAuthClient(admin.accessToken);

  const { data, error } = await authedClient.auth.mfa.enroll({
    factorType: "totp",
  });

  if (error) {
    return c.json({ error: error.message }, 400);
  }

  return c.json({
    factorId: data.id,
    secret: data.totp.secret,
    qrCode: data.totp.qr_code,
    uri: data.totp.uri,
  });
}

export async function verify2FA(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const payload = (await c.req.json()) as { factorId?: string; code?: string };

  if (!payload.factorId || !payload.code) {
    return c.json({ error: "factorId and code are required" }, 422);
  }

  const authedClient = createAuthClient(admin.accessToken);

  const challenge = await authedClient.auth.mfa.challenge({
    factorId: payload.factorId,
  });

  if (challenge.error) {
    return c.json({ error: challenge.error.message }, 400);
  }

  const verify = await authedClient.auth.mfa.verify({
    factorId: payload.factorId,
    challengeId: challenge.data.id,
    code: payload.code,
  });

  if (verify.error) {
    return c.json({ error: verify.error.message }, 400);
  }

  return c.json({ message: "2FA successfully verified" });
}

export async function unenroll2FA(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const payload = (await c.req.json()) as { factorId?: string };

  if (!payload.factorId) {
    return c.json({ error: "factorId is required" }, 422);
  }

  const authedClient = createAuthClient(admin.accessToken);

  const { error } = await authedClient.auth.mfa.unenroll({
    factorId: payload.factorId,
  });

  if (error) {
    return c.json({ error: error.message }, 400);
  }

  return c.json({ message: "2FA successfully removed" });
}

export async function getAuthenticatorStatus(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const authedClient = createAuthClient(admin.accessToken);

  const { data: { factors }, error } = await authedClient.auth.mfa.getAuthenticatorAssuranceLevel();

  if (error) {
    return c.json({ error: error.message }, 400);
  }

  const enrolledFactors = factors || [];
  const activeTotpFactor = enrolledFactors.find((f: any) => f.factor_type === "totp" && f.status === "verified");

  return c.json({
    enabled: !!activeTotpFactor,
    factorId: activeTotpFactor?.id || null,
  });
}
