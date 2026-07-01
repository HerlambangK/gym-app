"use client"

import { useActionState, useState } from "react"
import { Edit3, FileText, Plus, Trash2 } from "lucide-react"
import { removeBlogPost, saveBlogPost, type OwnerActionState } from "@/app/actions/owner-content"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/format"

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  content?: string | null
  thumbnail_url?: string | null
  access_type: "PUBLIC" | "SUBSCRIBER_ONLY"
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  created_at: string
}

const initialState: OwnerActionState = { ok: false, message: "" }

export function BlogPostManager({ posts }: { posts: BlogPost[] }) {
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [state, action, pending] = useActionState(saveBlogPost, initialState)

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>{editing ? "Edit Blog" : "Tulis Blog"}</CardTitle>
              <CardDescription>Buat artikel publik atau khusus subscriber premium.</CardDescription>
            </div>
            <Button type="button" variant="outline" size="icon-sm" onClick={() => setEditing(null)} aria-label="Blog baru">
              <Plus size={15} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <input type="hidden" name="id" value={editing?.id ?? ""} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field name="title" label="Judul" defaultValue={editing?.title ?? ""} placeholder="Strategi latihan 30 hari" />
              <Field name="slug" label="Slug" defaultValue={editing?.slug ?? ""} placeholder="strategi-latihan-30-hari" />
            </div>
            <Field name="thumbnailUrl" label="Thumbnail URL" defaultValue={editing?.thumbnail_url ?? ""} placeholder="https://..." required={false} />
            <div className="grid gap-2">
              <label className="text-sm font-medium">Ringkasan</label>
              <Textarea name="excerpt" defaultValue={editing?.excerpt ?? ""} placeholder="Kalimat singkat untuk kartu blog" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Konten</label>
              <Textarea name="content" className="min-h-52" defaultValue={editing?.content ?? ""} placeholder="Tulis konten artikel..." required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select name="accessType" label="Akses" defaultValue={editing?.access_type ?? "PUBLIC"} options={[["PUBLIC", "Public"], ["SUBSCRIBER_ONLY", "Subscriber only"]]} />
              <Select name="status" label="Status" defaultValue={editing?.status ?? "DRAFT"} options={[["DRAFT", "Draft"], ["PUBLISHED", "Published"], ["ARCHIVED", "Archived"]]} />
            </div>
            {state.message ? <p className={state.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>{state.message}</p> : null}
            <Button type="submit" disabled={pending} className="gap-2">
              <FileText size={15} /> {pending ? "Menyimpan..." : "Simpan Blog"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">Belum ada blog.</CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-semibold">{post.title}</h3>
                    <Badge variant={post.status === "PUBLISHED" ? "success" : post.status === "DRAFT" ? "warning" : "muted"}>{post.status}</Badge>
                    <Badge variant="outline">{post.access_type === "PUBLIC" ? "Public" : "Premium"}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{post.excerpt || post.slug}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Dibuat {formatDate(post.created_at)}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setEditing(post)}>
                    <Edit3 size={14} /> Edit
                  </Button>
                  <form action={removeBlogPost}>
                    <input type="hidden" name="id" value={post.id} />
                    <Button type="submit" variant="destructive" size="sm" className="gap-2">
                      <Trash2 size={14} /> Hapus
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

function Field({ label, required = true, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">{label}</label>
      <Input {...props} required={required} />
    </div>
  )
}

function Select({ label, options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: Array<[string, string]> }) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">{label}</label>
      <select {...props} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
        {options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
      </select>
    </div>
  )
}
