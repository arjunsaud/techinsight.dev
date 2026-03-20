"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { adminService } from "@/services/admin-service";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export function AdminLoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const checkAdminRoleAndRedirect = async (accessToken: string) => {
    const supabase = createClient();
    const me = await adminService.getMe(accessToken);

    if (!me || (me.role !== "admin" && me.role !== "superadmin")) {
      await supabase.auth.signOut();
      throw new Error("Admin access required");
    }

    toast.success("Admin login successful");
    window.location.href = "/admin/dashboard";
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error || !data.user) {
        throw error ?? new Error("Invalid login credentials");
      }

      // Check if MFA is required
      const { data: mfaData, error: mfaError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      
      if (mfaError) {
        throw mfaError;
      }

      if (mfaData.nextLevel === "aal2" && mfaData.currentLevel === "aal1") {
        // 2FA is required
        const activeFactor = mfaData.currentAuthenticationMethods.find(
          (m: any) => m.method === "totp"
        );
        
        // If we can't find an active factor from currentAuthenticationMethods, 
        // fall back to listing factors
        if (!activeFactor) {
           const enrolledFactors = await supabase.auth.mfa.listFactors();
           const totpFactor = enrolledFactors.data?.totp?.[0];
           if (totpFactor) {
             setFactorId(totpFactor.id);
             setShowTwoFactor(true);
             setIsLoading(false);
             return; // Stop here and wait for TOTP input
           }
        } else {
          // Sometimes currentAuthenticationMethods format varies, let's just grab the factor list explicitly
          const enrolledFactors = await supabase.auth.mfa.listFactors();
          const totpFactor = enrolledFactors.data?.totp?.[0];
          
          if (totpFactor) {
            setFactorId(totpFactor.id);
            setShowTwoFactor(true);
            setIsLoading(false);
            return; // Stop here and wait for TOTP input
          }
        }
      }

      // No 2FA required (or already aal2), proceed
      await checkAdminRoleAndRedirect(data.session.access_token);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to login");
      setIsLoading(false);
    }
  });

  const onVerifyTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || !factorId) return;

    setIsLoading(true);
    try {
      const supabase = createClient();
      
      const challenge = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: totpCode,
      });

      if (challenge.error) {
        throw challenge.error;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Verification succeeded but no session found");

      await checkAdminRoleAndRedirect(session.access_token);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid 2FA code");
      setIsLoading(false);
    }
  };

  if (showTwoFactor) {
    return (
      <form className="space-y-4" onSubmit={onVerifyTwoFactor}>
        <div className="space-y-2">
          <label className="text-sm font-medium">Authentication Code</label>
          <p className="text-xs text-muted-foreground pb-2">
            Enter the 6-digit code from your authenticator app.
          </p>
          <Input 
            type="text" 
            required
            placeholder="123456" 
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
            maxLength={6}
            className="text-center tracking-widest text-lg"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading || totpCode.length < 6}>
          {isLoading ? "Verifying..." : "Verify"}
        </Button>
        <div className="text-center">
          <button 
            type="button" 
            onClick={() => setShowTwoFactor(false)}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input type="email" {...form.register("email")} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Password</label>
          <Link 
            href={"/admin/forgot-password" as any}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Forgot Password?
          </Link>
        </div>
        <Input type="password" {...form.register("password")} />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Admin Sign In"}
      </Button>
    </form>
  );
}
