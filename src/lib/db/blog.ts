import { eq, and, desc } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { blog_posts, users } from "@/db/schema"

export async function getBlogPosts(accessType?: string) {
  const conditions = [eq(blog_posts.status, "PUBLISHED")]
  if (accessType) conditions.push(eq(blog_posts.access_type, accessType as any))

  const rows = await db
    .select()
    .from(blog_posts)
    .leftJoin(users, eq(blog_posts.author_id, users.id))
    .where(and(...conditions))
    .orderBy(desc(blog_posts.published_at))

  return rows.map((row) => ({
    ...row.blog_posts,
    users: row.users ? { name: row.users.name } : null,
  }))
}

export async function getAllBlogPosts() {
  const rows = await db
    .select()
    .from(blog_posts)
    .leftJoin(users, eq(blog_posts.author_id, users.id))
    .orderBy(desc(blog_posts.created_at))

  return rows.map((row) => ({
    ...row.blog_posts,
    users: row.users ? { name: row.users.name } : null,
  }))
}

export async function getBlogPostBySlug(slug: string) {
  const rows = await db
    .select()
    .from(blog_posts)
    .leftJoin(users, eq(blog_posts.author_id, users.id))
    .where(eq(blog_posts.slug, slug))
    .limit(1)

  if (rows.length === 0) return null
  const row = rows[0]
  return { ...row.blog_posts, users: row.users ? { name: row.users.name } : null }
}

export async function createBlogPost(input: {
  title: string
  slug: string
  excerpt?: string
  content?: string
  accessType?: string
  authorId: string
}) {
  const [data] = await db
    .insert(blog_posts)
    .values({
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt || null,
      content: input.content || null,
      access_type: (input.accessType || "PUBLIC") as any,
      author_id: input.authorId,
      status: "PUBLISHED",
      published_at: new Date().toISOString(),
    })
    .returning()
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
  const now = new Date().toISOString()
  const publishedAt = input.status === "PUBLISHED" ? now : null
  const values = {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt || null,
    content: input.content || null,
    thumbnail_url: input.thumbnailUrl || null,
    access_type: input.accessType as any,
    status: input.status as any,
    author_id: input.authorId,
    published_at: publishedAt,
    updated_at: now,
  }

  if (input.id) {
    const [data] = await db
      .update(blog_posts)
      .set(values)
      .where(eq(blog_posts.id, input.id))
      .returning()
    return data
  }

  const [data] = await db
    .insert(blog_posts)
    .values(values)
    .onConflictDoUpdate({ target: blog_posts.slug, set: values })
    .returning()
  return data
}

export async function deleteBlogPost(id: string) {
  await db.delete(blog_posts).where(eq(blog_posts.id, id))
}
