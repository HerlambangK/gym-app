import { togglePremiumFeature } from "@/app/actions/features"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShieldCheck, Star } from "lucide-react"

type Feature = {
  id: string
  code: string
  name: string
  description?: string | null
  category?: string | null
  is_premium: boolean
  is_active: boolean
}

export function PremiumFeatureManager({ features }: { features: Feature[] }) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Premium Features</CardTitle>
          <span className="ml-1 text-sm text-muted-foreground">({features.length})</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Nama Fitur</TableHead>
              <TableHead>Kode</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-40">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <ShieldCheck className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm">Belum ada fitur</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              features.map((feature, i) => (
                <TableRow key={feature.id}>
                  <TableCell className="text-center text-xs text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{feature.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{feature.code}</TableCell>
                  <TableCell className="text-muted-foreground">{feature.category || "-"}</TableCell>
                  <TableCell>
                    {feature.is_premium ? (
                      <Badge variant="default" className="gap-1">
                        <Star className="h-3 w-3" /> Premium
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Dasar</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={feature.is_active ? "success" : "muted"}>
                      {feature.is_active ? "AKTIF" : "MATI"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <form action={togglePremiumFeature}>
                      <input type="hidden" name="featureId" value={feature.id} />
                      <input type="hidden" name="isActive" value={String(!feature.is_active)} />
                      <Button type="submit" variant={feature.is_active ? "outline" : "default"} size="sm" className="w-full">
                        {feature.is_active ? "Matikan" : "Aktifkan"}
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
