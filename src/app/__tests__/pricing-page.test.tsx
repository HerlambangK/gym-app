/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react"
import { getPlans } from "@/lib/db/plans"
import { createServerSupabaseClient } from "@/lib/supabase-server"

jest.mock("@/lib/supabase-server", () => ({
  createServerSupabaseClient: jest.fn(),
}))

jest.mock("@/lib/db/plans", () => ({
  getPlans: jest.fn(),
}))

jest.mock("@/components/public/site-header", () => ({
  SiteHeader: () => <header data-testid="site-header" />,
}))

jest.mock("@/components/public/subscribe-button", () => ({
  SubscribeButton: ({ planCode }: { planCode: string }) => (
    <button data-testid="subscribe-btn" data-plan-code={planCode}>
      Subscribe
    </button>
  ),
}))

import Page from "@/app/(public)/pricing/page"

const mockPlans = [
  {
    id: "plan-1",
    name: "Daily Pass",
    code: "DAILY_PASS",
    description: "Latihan harian dengan check-in lokasi.",
    price: 45000,
    duration_days: 1,
    type: "DAILY",
  },
  {
    id: "plan-2",
    name: "Plus Monthly",
    code: "PLUS_MONTHLY",
    description: "Akses gizi, blog premium, dan body tracking.",
    price: 449000,
    duration_days: 30,
    type: "MONTHLY",
  },
  {
    id: "plan-3",
    name: "Basic Monthly",
    code: "BASIC_MONTHLY",
    description: "Membership bulanan untuk rutinitas stabil.",
    price: 299000,
    duration_days: 30,
    type: "MONTHLY",
  },
  {
    id: "plan-4",
    name: "Pro 3 Months",
    code: "PRO_3_MONTHS",
    description: "Semua fitur Pro untuk progres jangka panjang.",
    price: 1199000,
    duration_days: 90,
    type: "MONTHLY",
  },
]

function setupMocks(options: {
  user?: { id: string; email: string } | null
  plans?: typeof mockPlans
}) {
  ;(createServerSupabaseClient as jest.Mock).mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: options.user ?? null },
        error: null,
      }),
    },
  })
  ;(getPlans as jest.Mock).mockResolvedValue(options.plans ?? mockPlans)
}

async function renderPage() {
  const pageElement = await Page()
  return render(pageElement)
}

describe("Halaman Pricing (/(public)/pricing)", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("saat user TIDAK login", () => {
    beforeEach(() => {
      setupMocks({ user: null })
    })

    it("1. menampilkan SiteHeader", async () => {
      await renderPage()
      expect(screen.getByTestId("site-header")).toBeInTheDocument()
    })

    it("2. menampilkan badge Membership", async () => {
      await renderPage()
      expect(screen.getByText("Membership")).toBeInTheDocument()
    })

    it("3. menampilkan heading h1 yang benar", async () => {
      await renderPage()
      expect(
        screen.getByRole("heading", {
          name: "Pilih paket yang tepat untuk Anda.",
          level: 1,
        }),
      ).toBeInTheDocument()
    })

    it("4. menampilkan semua paket dengan nama dan deskripsi", async () => {
      await renderPage()
      for (const plan of mockPlans) {
        expect(screen.getByText(plan.name)).toBeInTheDocument()
        expect(screen.getByText(plan.description)).toBeInTheDocument()
        expect(screen.getAllByText(`${plan.duration_days} hari`).length).toBeGreaterThanOrEqual(1)
      }
    })

    it("5. menampilkan harga dalam format Rupiah", async () => {
      await renderPage()
      const fmt = (n: number) =>
        new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(n)
      const priceTexts = screen.getAllByText(/^Rp/)
      expect(priceTexts).toHaveLength(mockPlans.length)
      const prices = priceTexts.map((el) => el.textContent)
      expect(prices).toContain(fmt(45000))
      expect(prices).toContain(fmt(449000))
      expect(prices).toContain(fmt(299000))
      expect(prices).toContain(fmt(1199000))
    })

    it("6. menampilkan tombol Daftar (link) di setiap kartu paket", async () => {
      await renderPage()
      const daftarLinks = screen.getAllByRole("link", { name: /daftar/i })
      expect(daftarLinks).toHaveLength(mockPlans.length)
      daftarLinks.forEach((link) => {
        expect(link).toHaveAttribute("href", "/?action=register")
      })
    })

    it("7. paket PLUS_MONTHLY mendapat class border-primary", async () => {
      await renderPage()
      const cardHeadings = screen.getAllByRole("heading", { level: 3 })
      const plusMonthlyCard = cardHeadings.find(
        (h) => h.textContent === "Plus Monthly",
      )
      expect(plusMonthlyCard).toBeDefined()

      const cardDiv = plusMonthlyCard!.closest('[class*="rounded-lg"]')
      expect(cardDiv?.className).toContain("border-primary")
    })

    it("8. paket non-populer tidak mendapat border-primary", async () => {
      await renderPage()
      const dailyCard = screen.getByText("Daily Pass")
        .closest('[class*="rounded-lg"]')
      expect(dailyCard?.className).not.toContain("border-primary")
    })
  })

  describe("saat user SUDAH login", () => {
    beforeEach(() => {
      setupMocks({ user: { id: "user-1", email: "member@test.com" } })
    })

    it("9. menampilkan tombol Subscribe di setiap kartu paket", async () => {
      await renderPage()
      const subscribeButtons = screen.getAllByTestId("subscribe-btn")
      expect(subscribeButtons).toHaveLength(mockPlans.length)
    })

    it("10. SubscribeButton mengirim planCode yang benar", async () => {
      await renderPage()
      const buttons = screen.getAllByTestId("subscribe-btn")
      const codes = buttons.map((b) => b.getAttribute("data-plan-code"))
      expect(codes).toEqual(mockPlans.map((p) => p.code))
    })

    it("11. tidak menampilkan tombol Daftar saat sudah login", async () => {
      await renderPage()
      expect(
        screen.queryByRole("link", { name: /daftar/i }),
      ).not.toBeInTheDocument()
    })
  })

  describe("saat tidak ada paket (empty state)", () => {
    beforeEach(() => {
      setupMocks({ user: null, plans: [] })
    })

    it("12. menampilkan pesan 'Belum ada paket tersedia.'", async () => {
      await renderPage()
      expect(screen.getByText("Belum ada paket tersedia.")).toBeInTheDocument()
    })

    it("13. tidak menampilkan kartu paket apapun", async () => {
      await renderPage()
      expect(screen.queryByText("Daily Pass")).not.toBeInTheDocument()
      expect(screen.queryByText("Subscribe")).not.toBeInTheDocument()
      expect(
        screen.queryByRole("link", { name: /daftar/i }),
      ).not.toBeInTheDocument()
    })

    it("14. tidak menampilkan harga dalam rupiah", async () => {
      await renderPage()
      expect(screen.queryByText(/^Rp/)).not.toBeInTheDocument()
    })
  })
})
