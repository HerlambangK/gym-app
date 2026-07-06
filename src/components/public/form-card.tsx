"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { membershipPlans } from "@/data/gym";
import { gymProfile, whatsappUrl } from "@/data/company-profile";

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
        <CardDescription>Kirim pertanyaan membership, harga, lokasi, atau personal trainer.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4">
          <Input placeholder="Nama" />
          <Input placeholder="Nomor WhatsApp" />
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option>Daftar member</option>
            <option>Tanya harga</option>
            <option>Tanya lokasi</option>
            <option>Tanya trainer</option>
          </select>
          <Textarea placeholder={`Halo ${gymProfile.name}, saya ingin bertanya tentang...`} />
          <Link href={whatsappUrl()} className="w-full">
            <Button type="button" className="w-full bg-red-600 text-white hover:bg-red-700">Kirim via WhatsApp</Button>
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
