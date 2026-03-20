"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { authService } from "@/services/auth-service";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Supabase redirects to /reset-password#access_token=xyz
    // We need to parse the hash since Next.js doesn't expose it directly in searchParams
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = hashParams.get("access_token");
    if (accessToken) {
      setToken(accessToken);
    } else {
      toast.error("Invalid or missing reset token. Please request a new link.");
      router.push("/admin/forgot-password" as any);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !token) return;

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(password, token);
      toast.success("Password updated successfully. You can now log in.");
      setTimeout(() => router.push("/admin/login" as any), 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) return null; // loading or redirecting

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
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
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Updating..." : "Set New Password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/20 p-6">
      <section className="w-full max-w-md space-y-6 rounded-xl border bg-card p-6 shadow-sm">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Set New Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your new secure password below.
          </p>
        </header>

        <Suspense fallback={<div className="text-sm text-center">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </section>
    </main>
  );
}
