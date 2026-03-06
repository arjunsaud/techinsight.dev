"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

function SiteHeaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFeatured = searchParams.get("featured") === "true";

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Featured", href: "/?featured=true" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-6">
        {/* Wordmark */}
        <Link
          href="/"
          className="shrink-0 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          <span className="text-gray-900">Tech</span>
          <span className="text-blue-500">Insight</span>
        </Link>
        {/* Center nav — hidden on mobile */}
        <nav className="hidden items-center gap-6 text-sm absolute justify-center left-1/2 -translate-x-1/2 text-gray-500 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/" && !isFeatured
                : link.href.includes("featured=true")
                  ? isFeatured
                  : pathname === link.href ||
                    pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.name}
                href={link.href as any}
                className={`transition-colors hover:text-gray-900 ${
                  isActive
                    ? "text-gray-900 underline underline-offset-8 decoration-2 font-bold"
                    : ""
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function SiteHeader() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
          <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-6">
            <div
              className="shrink-0 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              <span className="text-gray-900">Tech</span>
              <span className="text-blue-500">Insight</span>
            </div>
          </div>
        </header>
      }
    >
      <SiteHeaderContent />
    </Suspense>
  );
}
