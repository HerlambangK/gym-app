import { createAdminSupabaseClient } from "@/lib/supabase-server"

export async function getBlogPosts(accessType?: string) {
  const supabase = await createAdminSupabaseClient()
  let query = supabase
    .from("blog_posts")
    .select("*, users(name)")
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false })

  if (accessType) query = query.eq("access_type", accessType)
  const { data } = await query
  return data || []
}

export async function getAllBlogPosts() {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase
    .from("blog_posts")
    .select("*, users(name)")
    .order("created_at", { ascending: false })
  return data || []
}

export async function getBlogPostBySlug(slug: string) {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase.from("blog_posts").select("*, users(name)").eq("slug", slug).single()
  return data
}

export async function createBlogPost(input: {
  title: string
  slug: string
  excerpt?: string
  content?: string
  accessType?: string
  authorId: string
}) {
  const supabase = await createAdminSupabaseClient()
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt || null,
      content: input.content || null,
      access_type: input.accessType || "PUBLIC",
      author_id: input.authorId,
      status: "PUBLISHED",
      published_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function upsertBlogPost(input: {
  id?: string
  title: string
  slug: string
  excerpt?: string
  content?: string
  thumbnailUrl?: string
  accessType: string
  status: string
  authorId: string
}) {
  const supabase = await createAdminSupabaseClient()
  const publishedAt = input.status === "PUBLISHED" ? new Date().toISOString() : null
  const { data, error } = await supabase
    .from("blog_posts")
    .upsert({
      ...(input.id ? { id: input.id } : {}),
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt || null,
      content: input.content || null,
      thumbnail_url: input.thumbnailUrl || null,
      access_type: input.accessType,
      status: input.status,
      author_id: input.authorId,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: input.id ? "id" : "slug",
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteBlogPost(id: string) {
  const supabase = await createAdminSupabaseClient()
  const { error } = await supabase.from("blog_posts").delete().eq("id", id)
  if (error) throw error
}
