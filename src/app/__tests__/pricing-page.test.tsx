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

    it("2. menampilkan badge Paket Member", async () => {
      await renderPage()
      expect(screen.getByText("Paket Member")).toBeInTheDocument()
    })

    it("3. menampilkan heading h1 yang benar", async () => {
      await renderPage()
      expect(
        screen.getByRole("heading", {
          name: "Paket fleksibel untuk mulai latihan.",
          level: 1,
        }),
      ).toBeInTheDocument()
    })

    it("4. menampilkan semua paket dengan nama dan durasi", async () => {
      await renderPage()
      for (const plan of mockPlans) {
        expect(screen.getByText(plan.name)).toBeInTheDocument()
        expect(screen.getAllByText(`${plan.duration_days} hari akses`).length).toBeGreaterThanOrEqual(1)
      }
    })

    it("5. hanya menampilkan harga Daily Pass untuk user publik", async () => {
      await renderPage()
      const fmt = (n: number) =>
        new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(n)
      const priceTexts = screen.getAllByText(/^Rp/)
      expect(priceTexts).toHaveLength(1)
      const prices = priceTexts.map((el) => el.textContent)
      expect(prices).toContain(fmt(45000))
      expect(prices).not.toContain(fmt(449000))
      expect(prices).not.toContain(fmt(299000))
      expect(prices).not.toContain(fmt(1199000))
    })

    it("6. menampilkan CTA login untuk paket selain Daily Pass", async () => {
      await renderPage()
      expect(screen.getByRole("link", { name: /ambil daily pass/i })).toHaveAttribute("href", expect.stringContaining("https://wa.me/"))
      const loginLinks = screen.getAllByRole("link", { name: /login untuk lihat harga/i })
      expect(loginLinks).toHaveLength(mockPlans.length - 1)
      loginLinks.forEach((link) => expect(link).toHaveAttribute("href", "/?action=login"))
    })

    it("7. paket PLUS_MONTHLY mendapat class border-red-600", async () => {
      await renderPage()
      const cardHeadings = screen.getAllByRole("heading", { level: 3 })
      const plusMonthlyCard = cardHeadings.find(
        (h) => h.textContent === "Plus Monthly",
      )
      expect(plusMonthlyCard).toBeDefined()

      const cardDiv = plusMonthlyCard!.closest('[class*="rounded-lg"]')
      expect(cardDiv?.className).toContain("border-red-600")
    })

    it("8. paket non-populer tidak mendapat border-red-600", async () => {
      await renderPage()
      const dailyCard = screen.getByText("Daily Pass")
        .closest('[class*="rounded-lg"]')
      expect(dailyCard?.className).not.toContain("border-red-600")
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

    it("11. tidak menampilkan CTA login saat sudah login", async () => {
      await renderPage()
      expect(
        screen.queryByRole("link", { name: /login untuk lihat harga/i }),
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
        screen.queryByRole("link", { name: /login untuk lihat harga/i }),
      ).not.toBeInTheDocument()
    })

    it("14. tidak menampilkan harga dalam rupiah", async () => {
      await renderPage()
      expect(screen.queryByText(/^Rp/)).not.toBeInTheDocument()
    })
  })
})
