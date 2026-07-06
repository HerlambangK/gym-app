export const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export const number = new Intl.NumberFormat("id-ID");

export const dateLong = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export const dateShort = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export const timeShort = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(date: string) {
  return dateShort.format(new Date(date));
}

export function formatDateLong(date: string) {
  return dateLong.format(new Date(date));
}

export function formatTime(date: string) {
  return timeShort.format(new Date(date));
}

export function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  if (hours > 0 && mins > 0) return `${hours} jam ${mins} menit`
  if (hours > 0) return `${hours} jam`
  return `${mins} menit`
}

