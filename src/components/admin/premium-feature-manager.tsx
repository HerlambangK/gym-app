import { togglePremiumFeature } from "@/app/actions/features"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {features.map((feature) => (
        <Card key={feature.id} className="overflow-hidden">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>{feature.name}</CardTitle>
                <CardDescription>{feature.category || "Feature"} - {feature.code}</CardDescription>
              </div>
              <Badge variant={feature.is_active ? "success" : "muted"}>
                {feature.is_active ? "ON" : "OFF"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {feature.description || (feature.is_premium
                ? "Fitur premium hanya aktif jika sistem dan paket member mengizinkan."
                : "Fitur dasar sistem member.")}
            </p>
            <form action={togglePremiumFeature}>
              <input type="hidden" name="featureId" value={feature.id} />
              <input type="hidden" name="isActive" value={String(!feature.is_active)} />
              <Button type="submit" variant={feature.is_active ? "outline" : "default"} className="w-full">
                {feature.is_active ? "Matikan Fitur" : "Aktifkan Fitur"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
