"use client";

import { useQuery } from "@tanstack/react-query";

import { adminService } from "@/services/admin-service";

export function useAdminDashboard(accessToken: string) {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminService.getDashboard(accessToken),
    enabled: Boolean(accessToken)
  });
}
