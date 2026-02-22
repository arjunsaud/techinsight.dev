import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-6">
        {/* Wordmark */}
        <Link
          href="/blogs"
          className="shrink-0 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          <span className="text-gray-900">Tech</span>
          <span className="text-blue-500">Insight</span>
        </Link>

        {/* Center nav — hidden on mobile */}
        <nav className="hidden items-center gap-6 text-sm text-gray-500 md:flex">
          <Link href="/blogs" className="transition-colors hover:text-gray-900">
            Home
          </Link>
          <Link href="/blogs" className="transition-colors hover:text-gray-900">
            Stories
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3"></div>
      </div>
    </header>
  );
}
