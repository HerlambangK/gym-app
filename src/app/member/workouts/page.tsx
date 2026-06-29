import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Progress</CardTitle>
        <CardDescription>Pro feature: track strength, body metrics, and trainer notes.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        {["Bench Press +8kg", "Squat +12kg", "Body fat -2.1%"].map((item) => (
          <div key={item} className="rounded-md border border-border p-4">{item}</div>
        ))}
      </CardContent>
    </Card>
  )
}
