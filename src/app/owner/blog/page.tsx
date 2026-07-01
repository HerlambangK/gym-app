import { redirect } from "next/navigation"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { BlogPostManager } from "@/components/owner/blog-post-manager"
import { getAllBlogPosts } from "@/lib/db/blog"
import { getUserRole } from "@/lib/db/users"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const role = await getUserRole(user.id)
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
