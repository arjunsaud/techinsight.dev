import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import type { Blog } from "@/types/domain";

interface RecommendedBlogsProps {
  blogs: Blog[];
  title?: string;
}

export function RecommendedBlogs({
  blogs,
  title = "Recommended Stories",
}: RecommendedBlogsProps) {
  if (blogs.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">
        {title}
      </h3>
      <div className="flex flex-col gap-6">
        {blogs.map((blog) => (
          <Link
            key={blog.id}
            href={`/blogs/${blog.slug}`}
            className="group flex items-start gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {blog.category && (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-green-700">
                    {blog.category.name}
                  </span>
                )}
                <span className="text-[10px] text-gray-400">
                  {formatDate(blog.published_at ?? blog.created_at)}
                </span>
              </div>
              <h4 className="line-clamp-2 text-sm font-bold text-gray-900 transition-colors group-hover:text-gray-600 font-serif">
                {blog.title}
              </h4>
            </div>
            {blog.featured_image_url && (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                <Image
                  src={blog.featured_image_url}
                  alt={blog.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
