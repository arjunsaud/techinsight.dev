import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      <Link href="/blogs" className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
        Back to blogs
      </Link>
    </main>
  );
}
