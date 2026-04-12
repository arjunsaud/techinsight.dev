"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

function SiteHeaderContent() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Series", href: "/series" },
    { name: "Featured", href: "/featured" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-6">
        {/* Wordmark */}
        <Link
          href="/"
          className="shrink-0 text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          <span>Tech</span>
          <span className="text-primary">Insight</span>
        </Link>
        {/* Center nav — hidden on mobile */}
        <nav className="hidden items-center gap-6 text-sm absolute justify-center left-1/2 -translate-x-1/2 text-muted-foreground md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href ||
                  pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.name}
                href={link.href as any}
                className={`transition-colors hover:text-foreground ${
                  isActive
                    ? "text-foreground underline underline-offset-8 decoration-2 font-bold"
                    : ""
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
        {/* Right nav — Theme toggle */}
        <div className="flex shrink-0 items-center justify-end">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function SiteHeader() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-6">
            <div
              className="shrink-0 text-xl font-bold tracking-tight text-foreground sm:text-2xl"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              <span>Tech</span>
              <span className="text-primary">Insight</span>
            </div>
          </div>
        </header>
      }
    >
      <SiteHeaderContent />
    </Suspense>
  );
}
