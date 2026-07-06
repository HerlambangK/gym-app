import {
  Bike,
  Car,
  CircleDot,
  Dumbbell,
  Lock,
  MapPin,
  Music2,
  ShieldCheck,
  ShowerHead,
  UserRoundCheck,
  Waves,
} from "lucide-react"

export const gymProfile = {
  name: "ForgeFit Studio",
  city: "Jakarta Selatan",
  tagline: "Gym nyaman dengan alat lengkap untuk latihan lebih maksimal.",
  description:
    "Tempat latihan modern dengan area strength, cardio, free weight, dan pendampingan ramah pemula di lokasi strategis Jakarta Selatan.",
  address: "Jl. Senopati No. 21, Jakarta Selatan",
  landmark: "Dekat area kuliner Senopati, mudah dijangkau dari SCBD dan Blok M.",
  whatsapp: "+62 812-9000-2026",
  phone: "+62 812-9000-2026",
  instagram: "@forgefit.studio",
  tiktok: "@forgefitstudio",
  email: "hello@forgefit.studio",
  hours: "Senin - Minggu, 06.00 - 22.00 WIB",
  mapsUrl: "https://maps.google.com/?q=Senopati%20Jakarta%20Selatan",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=Senopati%20Jakarta%20Selatan&output=embed",
  heroImage:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2200&q=85",
  whatsappMessage:
    "Halo ForgeFit Studio, saya ingin bertanya tentang informasi membership gym.",
}

export const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2200&q=85",
    title: "Area strength lengkap",
    caption: "Latihan beban lebih fokus dengan rack, bench, dan free weight zone.",
  },
  {
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=2200&q=85",
    title: "Suasana latihan modern",
    caption: "Ruang bersih dan atmosfer yang bikin latihan terasa konsisten.",
  },
  {
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=2200&q=85",
    title: "Cardio dan conditioning",
    caption: "Mulai dari pemanasan ringan sampai target stamina harian.",
  },
]

export const packageMarketing: Record<string, {
  image: string
  eyebrow: string
  headline: string
  copy: string
  cta: string
}> = {
  DAILY_PASS: {
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
    eyebrow: "Coba dulu hari ini",
    headline: "Masuk, rasakan tempatnya, latihan tanpa komitmen panjang.",
    copy: "Ideal untuk trial, latihan spontan, atau kamu yang ingin cek suasana dan kelengkapan alat sebelum ambil paket bulanan.",
    cta: "Ambil Daily Pass",
  },
  BASIC_MONTHLY: {
    image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=900&q=80",
    eyebrow: "Bangun rutinitas",
    headline: "Mulai konsisten 3-4 kali seminggu dengan akses bulanan.",
    copy: "Paket aman untuk pemula dan member rutin yang ingin membangun kebiasaan latihan tanpa ribet.",
    cta: "Login untuk lihat harga",
  },
  PLUS_MONTHLY: {
    image: "https://images.unsplash.com/photo-1571019613914-85f342c6a11e?auto=format&fit=crop&w=900&q=80",
    eyebrow: "Paling diminati",
    headline: "Latihan lebih terarah dengan benefit premium dan tracking.",
    copy: "Cocok untuk kamu yang ingin progres lebih jelas lewat akses konten, nutrisi, dan fitur member lanjutan.",
    cta: "Login untuk lihat harga",
  },
  PRO_3_MONTHS: {
    image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=900&q=80",
    eyebrow: "Transformasi serius",
    headline: "Komitmen 90 hari untuk progres yang terasa dan terukur.",
    copy: "Pilih ini kalau kamu mau membangun momentum latihan jangka panjang dengan akses fitur paling lengkap.",
    cta: "Login untuk lihat harga",
  },
}

export const publicNavItems = [
  { label: "Beranda", href: "/" },
  { label: "Tentang", href: "/tentang-kami" },
  { label: "Fasilitas", href: "/fasilitas" },
  { label: "Alat Gym", href: "/alat-gym" },
  { label: "Galeri", href: "/galeri" },
  { label: "Paket", href: "/pricing" },
  { label: "Lokasi", href: "/lokasi" },
  { label: "Kontak", href: "/contact" },
]

export const profileHighlights = [
  "Alat gym lengkap dan terawat",
  "Nyaman untuk pemula",
  "Area latihan bersih",
  "Staff ramah dan siap bantu",
  "Lokasi strategis",
  "Paket member fleksibel",
]

export const facilities = [
  {
    name: "Area Weight Training",
    description: "Zona latihan beban dengan bench, rack, plate, dan dumbbell untuk progres strength yang rapi.",
    benefit: "Cocok untuk hipertrofi, strength, dan latihan mandiri.",
    icon: Dumbbell,
    image: "https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Area Cardio",
    description: "Treadmill, bike, dan mesin cardio untuk pemanasan, fat loss, dan stamina harian.",
    benefit: "Membantu latihan jantung dan pembakaran kalori.",
    icon: Bike,
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Personal Trainer",
    description: "Trainer siap membantu teknik dasar, susunan program, dan arahan latihan yang aman.",
    benefit: "Pemula lebih percaya diri dan minim risiko salah gerak.",
    icon: UserRoundCheck,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Ruang Ganti & Shower",
    description: "Fasilitas pendukung untuk member yang latihan sebelum atau sesudah aktivitas harian.",
    benefit: "Latihan tetap nyaman walau jadwal padat.",
    icon: ShowerHead,
    image: "https://images.unsplash.com/photo-1623874228601-f4193c7b1818?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Loker & Keamanan",
    description: "Area penyimpanan dan pengawasan untuk menjaga barang member selama latihan.",
    benefit: "Member bisa fokus latihan tanpa khawatir.",
    icon: Lock,
    image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Parkir Mudah",
    description: "Akses motor dan mobil dengan patokan lokasi yang jelas untuk kunjungan pertama.",
    benefit: "Datang langsung lebih praktis.",
    icon: Car,
    image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=900&q=80",
  },
]

export const equipmentCategories = [
  {
    category: "Cardio Equipment",
    items: [
      { name: "Treadmill", function: "Latihan lari dan jalan cepat untuk stamina.", muscles: ["cardio", "legs"] },
      { name: "Static Bike", function: "Cardio low impact untuk kaki dan endurance.", muscles: ["quads", "calves"] },
      { name: "Elliptical", function: "Cardio seluruh tubuh dengan tekanan sendi rendah.", muscles: ["legs", "core"] },
      { name: "Rowing Machine", function: "Kombinasi cardio dan tarikan punggung.", muscles: ["back", "arms", "core"] },
    ],
  },
  {
    category: "Strength Machine",
    items: [
      { name: "Chest Press", function: "Melatih dorongan dada dengan jalur gerak stabil.", muscles: ["chest", "triceps"] },
      { name: "Lat Pulldown", function: "Membangun kekuatan punggung, bahu, dan lengan.", muscles: ["back", "biceps"] },
      { name: "Leg Press", function: "Latihan kaki terkontrol untuk quads, hamstring, dan glutes.", muscles: ["legs", "glutes"] },
      { name: "Cable Machine", function: "Gerakan fleksibel untuk upper body, core, dan isolasi otot.", muscles: ["full body"] },
    ],
  },
  {
    category: "Free Weight",
    items: [
      { name: "Dumbbell Set", function: "Latihan bebas untuk strength, stabilitas, dan isolasi.", muscles: ["arms", "shoulders", "chest"] },
      { name: "Barbell", function: "Gerakan compound seperti squat, deadlift, dan bench press.", muscles: ["full body"] },
      { name: "Squat Rack", function: "Latihan kaki dan full-body compound dengan aman.", muscles: ["legs", "core"] },
      { name: "Kettlebell", function: "Functional training untuk power, grip, dan conditioning.", muscles: ["core", "glutes"] },
    ],
  },
]

export const galleryItems = [
  { title: "Area latihan utama", category: "Area Gym", image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=80" },
  { title: "Free weight zone", category: "Alat Gym", image: "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=900&q=80" },
  { title: "Suasana latihan", category: "Suasana Latihan", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80" },
  { title: "Cardio corner", category: "Alat Gym", image: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=900&q=80" },
  { title: "Personal training", category: "Fasilitas", image: "https://images.unsplash.com/photo-1571019613914-85f342c6a11e?auto=format&fit=crop&w=900&q=80" },
  { title: "Ruang gym bersih", category: "Area Gym", image: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=900&q=80" },
]

export const testimonials = [
  {
    name: "Raka",
    role: "Member bulanan",
    text: "Tempatnya bersih, alatnya lengkap, dan staff mau bantu koreksi gerakan. Cocok buat yang baru mulai.",
  },
  {
    name: "Nadia",
    role: "Member premium",
    text: "Lokasi gampang, parkir aman, dan suasana latihannya bikin konsisten datang.",
  },
]

export const gymValues = [
  { icon: ShieldCheck, title: "Aman", text: "Area latihan tertata, alat terawat, dan staff membantu teknik dasar." },
  { icon: Waves, title: "Nyaman", text: "Ruang bersih, sirkulasi baik, dan suasana latihan tidak mengintimidasi." },
  { icon: Music2, title: "Berenergi", text: "Musik dan atmosfer dibuat mendukung latihan fokus setiap hari." },
  { icon: UserRoundCheck, title: "Komunitas", text: "Member dari berbagai level bisa berkembang tanpa rasa canggung." },
]

export const faqItems = [
  { question: "Apakah gym cocok untuk pemula?", answer: "Ya. Staff dapat membantu pengenalan alat dan dasar gerakan agar latihan pertama lebih aman." },
  { question: "Apakah tersedia personal trainer?", answer: "Tersedia. Anda bisa bertanya ke admin untuk jadwal dan paket personal trainer." },
  { question: "Bisa datang untuk lihat tempat dulu?", answer: "Bisa. Hubungi WhatsApp admin agar tim kami membantu arah lokasi dan menjelaskan paket." },
  { question: "Apakah ada paket harian?", answer: "Ada. Paket harian cocok untuk trial atau latihan sesekali sebelum mengambil paket bulanan." },
]

export const locationFacts = [
  { icon: MapPin, label: "Alamat", value: gymProfile.address },
  { icon: CircleDot, label: "Patokan", value: gymProfile.landmark },
  { icon: Car, label: "Parkir", value: "Tersedia area parkir motor dan mobil." },
  { icon: ShieldCheck, label: "Jam Operasional", value: gymProfile.hours },
]

export function whatsappUrl(message = gymProfile.whatsappMessage) {
  const number = gymProfile.whatsapp.replace(/\D/g, "")
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
