import type { MetadataRoute } from "next";

import { getPublicEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

function getSiteUrl() {
  const env = getPublicEnv();
  const raw = env.appUrl ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

