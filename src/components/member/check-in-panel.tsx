"use client";

import { useMemo, useState } from "react";
import { MapPin, Timer, Wifi } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getDistanceMeters } from "@/lib/haversine";

const branchLocation = { latitude: -6.2279, longitude: 106.8099 };

export function CheckInPanel() {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState("Ready untuk validasi lokasi.");
  const [duration, setDuration] = useState(42);

  const distance = useMemo(
    () =>
      Math.round(
        getDistanceMeters(branchLocation, {
          latitude: -6.2281,
          longitude: 106.8102,
        }),
      ),
    [],
  );

  function handleCheckIn() {
    setStatus("Memvalidasi GPS, membership, payment, dan feature attendance...");
    window.setTimeout(() => {
      setActive(true);
      setStatus(`Check-in berhasil. Lokasi ${distance}m dari cabang.`);
      toast.success("Check-in aktif");
    }, 500);
  }

  function handleCheckOut() {
    setActive(false);
    setDuration(0);
    setStatus("Check-out berhasil. Durasi latihan tersimpan.");
    toast.success("Check-out berhasil");
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>{active ? "Kamu sedang latihan" : "Check-in Gym"}</CardTitle>
            <CardDescription>{status}</CardDescription>
          </div>
          <Badge variant={active ? "success" : "warning"}>{active ? "ACTIVE SESSION" : "READY"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-border p-3">
            <MapPin size={18} className="text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Radius cabang</p>
            <p className="font-semibold">{distance}m / 100m</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <Wifi size={18} className="text-cyan-300" />
            <p className="mt-2 text-sm text-muted-foreground">GPS accuracy</p>
            <p className="font-semibold">38m</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <Timer size={18} className="text-emerald-300" />
            <p className="mt-2 text-sm text-muted-foreground">Durasi</p>
            <p className="font-semibold">{duration} menit</p>
          </div>
        </div>
        <Progress value={active ? 68 : 18} />
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleCheckIn} disabled={active}>
            Check-in Sekarang
          </Button>
          <Button variant="outline" onClick={handleCheckOut} disabled={!active}>
            Check-out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

