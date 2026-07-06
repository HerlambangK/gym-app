import { redirect } from "next/navigation"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { BlogPostManager } from "@/components/owner/blog-post-manager"
import { getAllBlogPosts } from "@/lib/db/blog"
import { getCurrentUserId, getCurrentUserRole } from "@/lib/current-user"

export default async function Page() {
  const userId = await getCurrentUserId()
  if (!userId) redirect("/login")

  const role = await getCurrentUserRole()
  if (role !== "OWNER" && role !== "SUPER_ADMIN" && role !== "MARKETING") redirect("/member/dashboard")

  const posts = await getAllBlogPosts()

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Owner"
        status={`${posts.length} konten`}
        title="Blog Studio"
        description="Buat konten public dan premium subscriber dengan status draft, publish, atau archive."
      />
      <BlogPostManager posts={posts} />
    </div>
  )
}
