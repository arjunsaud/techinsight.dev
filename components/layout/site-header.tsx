"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const onHome = pathname === "/" || pathname.startsWith("/articles");

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
          <Link
            href="/"
            className={`transition-colors hover:text-gray-900 ${
              onHome
                ? "text-gray-900 underline underline-offset-8 decoration-2"
                : ""
            }`}
          >
            Home
          </Link>
          <Link href="/" className="transition-colors hover:text-gray-900">
            Top
          </Link>
          <Link href="/" className="transition-colors hover:text-gray-900">
            Series
          </Link>
        </nav>
      </div>
    </header>
  );
}
