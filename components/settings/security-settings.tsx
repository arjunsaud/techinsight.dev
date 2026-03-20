"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { authService } from "@/services/auth-service";

export function SecuritySettings({ accessToken }: { accessToken: string }) {
  const [password, setPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [isLoading2FA, setIsLoading2FA] = useState(true);

  const [setupMode, setSetupMode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [setupCode, setSetupCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        const { enabled, factorId } = await authService.get2FAStatus(accessToken);
        setIs2FAEnabled(enabled);
        setFactorId(factorId);
      } catch (error) {
        console.error("Failed to fetch 2FA status:", error);
      } finally {
        setIsLoading2FA(false);
      }
    }
    checkStatus();
  }, [accessToken]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword(password, accessToken);
      toast.success("Password updated successfully.");
      setPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleEnroll2FA = async () => {
    setIsLoading2FA(true);
    try {
      const data = await authService.enroll2FA(accessToken);
      setFactorId(data.factorId);
      setQrCodeData(data.qrCode);
      setSetupMode(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to enroll 2FA");
    } finally {
      setIsLoading2FA(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupCode || !factorId) return;

    setIsVerifying(true);
    try {
      await authService.verify2FA(factorId, setupCode, accessToken);
      setIs2FAEnabled(true);
      setSetupMode(false);
      setQrCodeData(null);
      setSetupCode("");
      toast.success("Two-Factor Authentication successfully enabled!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid verification code");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUnenroll2FA = async () => {
    if (!factorId) return;
    if (!confirm("Are you sure you want to disable 2FA? This will make your account less secure.")) return;

    setIsLoading2FA(true);
    try {
      await authService.unenroll2FA(factorId, accessToken);
      setIs2FAEnabled(false);
      setFactorId(null);
      toast.success("Two-Factor Authentication disabled");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to disable 2FA");
    } finally {
      setIsLoading2FA(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Change Password Section */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:bg-card dark:border-border">
        <div className="border-b border-gray-100 dark:border-border px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Change Password
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Update your admin login password.
          </p>
        </div>
        <div className="px-6 py-5">
          <form className="max-w-sm space-y-4" onSubmit={handleChangePassword}>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? "Saving..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>

      {/* 2FA Section */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:bg-card dark:border-border">
        <div className="border-b border-gray-100 dark:border-border px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Two-Factor Authentication (2FA)
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Add an extra layer of security to your account using an authenticator app.
          </p>
        </div>
        <div className="px-6 py-5">
          {isLoading2FA ? (
            <p className="text-sm text-muted-foreground">Checking 2FA status...</p>
          ) : is2FAEnabled ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                  ✓
                </span>
                2FA is enabled and active
              </div>
              <Button variant="destructive" onClick={handleUnenroll2FA}>
                Disable 2FA
              </Button>
            </div>
          ) : setupMode ? (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 inline-block border border-gray-100 dark:border-border">
                <p className="text-sm font-medium mb-4">1. Scan this QR code with your Authenticator App</p>
                {qrCodeData && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrCodeData} alt="2FA QR Code" className="mx-auto rounded border bg-white p-2" />
                )}
              </div>
              
              <form onSubmit={handleVerify2FA} className="max-w-sm space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">2. Enter the 6-digit code</label>
                  <Input 
                    type="text" 
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={setupCode}
                    onChange={(e) => setSetupCode(e.target.value)}
                    className="text-center tracking-widest text-lg"
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={isVerifying || setupCode.length < 6}>
                    {isVerifying ? "Verifying..." : "Verify & Enable"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setSetupMode(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <Button onClick={handleEnroll2FA}>
              Setup 2FA
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
