import Link from "next/link";
import {
  LayoutDashboard,
  FileEdit,
  Files,
  FolderTree,
  Tags,
  MessageSquare,
  Users,
} from "lucide-react";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/blogs", label: "Write Blogs", Icon: FileEdit },
  { href: "/admin/blogs/all", label: "All Blogs", Icon: Files },
  { href: "/admin/categories", label: "Categories", Icon: FolderTree },
  { href: "/admin/tags", label: "Tags", Icon: Tags },
  { href: "/admin/comments", label: "Comments", Icon: MessageSquare },
  { href: "/admin/users", label: "Users", Icon: Users },
] as const;

export function AdminSidebar() {
  return (
    <aside className="w-full border-r bg-gray-50/50 md:w-64">
      <div className="p-6">
        <h2 className="text-xl font-bold tracking-tight text-gray-900">
          Admin Panel
        </h2>
      </div>
      <nav className="space-y-1 px-4 pb-4">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-white hover:text-gray-900 hover:shadow-sm"
          >
            <link.Icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
