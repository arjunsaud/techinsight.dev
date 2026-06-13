import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";


import "@/app/globals.css";
import { Providers } from "@/app/providers";

import { getPublicEnv } from "@/lib/env";

function getAppUrl() {
  const env = getPublicEnv();
  return env.appUrl;
}

const sans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TechInsight",
  description: "Admin-managed article platform built with Next.js and Supabase",
  metadataBase: new URL(getAppUrl()),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "TechInsight",
    url: "/",
    title: "TechInsight",
    description: "Admin-managed article platform built with Next.js and Supabase",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechInsight",
    description: "Admin-managed article platform built with Next.js and Supabase",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const env = getPublicEnv();
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__ENV__ = ${JSON.stringify({
              APP_URL: env.appUrl,
              SUPABASE_URL: env.supabaseUrl,
              SUPABASE_ANON_KEY: env.supabaseAnonKey,
              GA_ID: env.gaId,
            })};`,
          }}
        />
      </head>
      <body className={`${sans.variable} ${mono.variable} antialiased`}>
        {env.gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${env.gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${env.gaId}');
              `}
            </Script>
          </>
        )}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
