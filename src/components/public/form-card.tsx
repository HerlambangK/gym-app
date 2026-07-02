"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { membershipPlans } from "@/data/gym";

export function RegisterCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Member</CardTitle>
        <CardDescription>Sistem akan membuat user, invoice, lalu mengarahkan ke pembayaran.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4">
          <Input name="name" placeholder="Nama lengkap" />
          <Input name="email" type="email" placeholder="Email" />
          <Input name="phone" placeholder="Nomor WhatsApp" />
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            {membershipPlans.map((plan) => <option key={plan.code}>{plan.name}</option>)}
          </select>
          <Button type="button">Buat Invoice</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function ContactCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kontak Gym</CardTitle>
        <CardDescription>Kirim pertanyaan membership, promo, atau corporate plan.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4">
          <Input placeholder="Nama" />
          <Input type="email" placeholder="Email" />
          <Textarea placeholder="Pesan" />
          <Button type="button">Kirim Pesan</Button>
        </form>
      </CardContent>
    </Card>
  );
}
