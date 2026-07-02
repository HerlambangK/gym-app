import { test, expect } from "@playwright/test"

test.describe("Halaman Pricing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pricing")
  })

  test("1. menampilkan judul halaman dan heading utama", async ({ page }) => {
    await expect(page).toHaveTitle(/.*/)
    await expect(
      page.getByRole("heading", {
        name: "Pilih paket yang tepat untuk Anda.",
        level: 1,
      }),
    ).toBeVisible()
  })

  test("2. menampilkan badge Membership", async ({ page }) => {
    await expect(page.getByText("Membership", { exact: true })).toBeVisible()
  })

  test("3. menampilkan brand name dan navigasi di SiteHeader", async ({ page }) => {
    await expect(page.getByText("ForgeFit Studio").first()).toBeVisible()
    await expect(page.getByRole("link", { name: "Paket" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Fasilitas" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Trainer" })).toBeVisible()
  })

  test("4. menampilkan kartu paket dengan nama dan harga", async ({ page }) => {
    const cardHeadings = page.getByRole("heading", { level: 3 })
    const names = await cardHeadings.allTextContents()
    expect(names).toContain("Daily Pass")
    expect(names).toContain("Plus Monthly")
    expect(names).toContain("Basic Monthly")
    expect(names).toContain("Pro 3 Months")

    const priceTexts = await page.getByText(/^Rp/).allTextContents()
    expect(priceTexts.length).toBeGreaterThanOrEqual(4)
  })

  test("5. setiap paket memiliki tombol Daftar yang mengarah ke /?action=register", async ({ page }) => {
    const daftarLinks = page.getByRole("link", { name: /daftar/i })
    const count = await daftarLinks.count()
    expect(count).toBeGreaterThanOrEqual(4)

    const hrefs = await daftarLinks.evaluateAll((links) =>
      links.map((l) => (l as HTMLAnchorElement).href),
    )
    for (const href of hrefs) {
      expect(href).toContain("action=register")
    }
  })

  test("6. mengklik Daftar navigasi ke halaman utama dengan ?action=register", async ({ page }) => {
    const daftarLink = page.getByRole("link", { name: /daftar/i }).first()
    await daftarLink.click()
    await expect(page).toHaveURL(/\?action=register/)
  })
})
