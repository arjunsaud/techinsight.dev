import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  title: string;
  description: string;
  showBack?: boolean;
  backUrl?: string;
}

export function AdminHeader({
  title,
  description,
  showBack = false,
  backUrl = "/admin",
}: AdminHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      {showBack && (
        <Link
          href={backUrl as any}
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground h-10 w-10 shrink-0"
          )}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Link>
      )}
      <header>
        <p className="text-2xl font-bold tracking-tight">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>
    </div>
  );
}
