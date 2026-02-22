import type { Blog } from "@/types/domain";
import { BlogCard } from "@/components/blog/blog-card";

interface BlogListProps {
  blogs: Blog[];
}

export function BlogList({ blogs }: BlogListProps) {
  if (blogs.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-base text-gray-400">
          No published stories yet. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div>
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </div>
  );
}
