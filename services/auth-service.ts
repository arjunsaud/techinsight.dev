import { apiFetch } from "./http";

export const authService = {
  forgotPassword(email: string) {
    return apiFetch<{ message: string }>("admin/forgot-password", {
      method: "POST",
      body: { email },
    });
  },

  resetPassword(password: string, accessToken: string) {
    return apiFetch<{ message: string }>("admin/reset-password", {
      method: "POST",
      body: { password },
      accessToken,
    });
  },

  changePassword(password: string, accessToken: string) {
    return apiFetch<{ message: string }>("admin/change-password", {
      method: "POST",
      body: { password },
      accessToken,
    });
  },

  enroll2FA(accessToken: string) {
    return apiFetch<{
      factorId: string;
      secret: string;
      qrCode: string;
      uri: string;
    }>("admin/2fa/enroll", {
      method: "POST",
      accessToken,
    });
  },

  verify2FA(factorId: string, code: string, accessToken: string) {
    return apiFetch<{ message: string }>("admin/2fa/verify", {
      method: "POST",
      body: { factorId, code },
      accessToken,
    });
  },

  unenroll2FA(factorId: string, accessToken: string) {
    return apiFetch<{ message: string }>("admin/2fa/unenroll", {
      method: "POST",
      body: { factorId },
      accessToken,
    });
  },

  get2FAStatus(accessToken: string) {
    return apiFetch<{ enabled: boolean; factorId: string | null }>(
      "admin/2fa/status",
      {
        method: "GET",
        accessToken,
      }
    );
  },
};
