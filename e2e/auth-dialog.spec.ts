import { test, expect } from "@playwright/test"

test.describe("Dialog Login & Register", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test.describe("Login dialog", () => {
    test("1. tombol Masuk di header membuka dialog login", async ({ page }) => {
      await page.getByRole("button", { name: "Masuk" }).click()
      await expect(page.getByRole("dialog", { name: "Masuk" })).toBeVisible()
    })

    test("2. URL ?action=login membuka dialog login otomatis", async ({ page }) => {
      await page.goto("/?action=login")
      await expect(page.getByRole("dialog", { name: "Masuk" })).toBeVisible()
    })

    test("3. dialog login memiliki field email dan password", async ({ page }) => {
      await page.goto("/?action=login")
      const dialog = page.getByRole("dialog", { name: "Masuk" })
      await expect(dialog.locator('input[name="email"]')).toBeVisible()
      await expect(dialog.locator('input[name="password"]')).toBeVisible()
    })

    test("4. tombol submit bertuliskan Masuk", async ({ page }) => {
      await page.goto("/?action=login")
      const dialog = page.getByRole("dialog", { name: "Masuk" })
      await expect(
        dialog.getByRole("button", { name: "Masuk" }),
      ).toBeVisible()
    })

    test("5. switch ke register via 'Belum punya akun?'", async ({ page }) => {
      await page.goto("/?action=login")
      await page.getByText("Belum punya akun?").click()
      await expect(
        page.getByRole("dialog", { name: "Daftar Akun" }),
      ).toBeVisible()
    })

    test("6. link 'Lupa password?' mengarah ke /auth/forgot-password", async ({ page }) => {
      await page.goto("/?action=login")
      const lupaLink = page.getByRole("link", { name: /lupa password/i })
      await expect(lupaLink).toHaveAttribute("href", "/auth/forgot-password")
    })

    test("7. tombol close menutup dialog login", async ({ page }) => {
      await page.goto("/?action=login")
      const dialog = page.getByRole("dialog", { name: "Masuk" })
      const closeButton = dialog.getByRole("button", { name: /close/i })
      await closeButton.click()
      await expect(dialog).not.toBeVisible()
    })
  })

  test.describe("Register dialog", () => {
    test("8. tombol Daftar di header membuka dialog register", async ({ page }) => {
      await page.getByRole("button", { name: "Daftar" }).first().click()
      await expect(
        page.getByRole("dialog", { name: "Daftar Akun" }),
      ).toBeVisible()
    })

    test("9. URL ?action=register membuka dialog register otomatis", async ({ page }) => {
      await page.goto("/?action=register")
      await expect(
        page.getByRole("dialog", { name: "Daftar Akun" }),
      ).toBeVisible()
    })

    test("10. dialog register memiliki field name, email, phone, password", async ({ page }) => {
      await page.goto("/?action=register")
      const dialog = page.getByRole("dialog", { name: "Daftar Akun" })
      await expect(dialog.locator('input[name="name"]')).toBeVisible()
      await expect(dialog.locator('input[name="email"]')).toBeVisible()
      await expect(dialog.locator('input[name="phone"]')).toBeVisible()
      await expect(dialog.locator('input[name="password"]')).toBeVisible()
    })

    test("11. tombol submit bertuliskan Daftar", async ({ page }) => {
      await page.goto("/?action=register")
      const dialog = page.getByRole("dialog", { name: "Daftar Akun" })
      await expect(
        dialog.getByRole("button", { name: "Daftar" }),
      ).toBeVisible()
    })

    test("12. switch ke login via 'Sudah punya akun? Masuk'", async ({ page }) => {
      await page.goto("/?action=register")
      const dialog = page.getByRole("dialog", { name: "Daftar Akun" })
      await dialog.getByText("Masuk", { exact: true }).click()
      await expect(page.getByRole("dialog", { name: "Masuk" })).toBeVisible()
    })

    test("13. tombol close menutup dialog register", async ({ page }) => {
      await page.goto("/?action=register")
      const dialog = page.getByRole("dialog", { name: "Daftar Akun" })
      const closeButton = dialog.getByRole("button", { name: /close/i })
      await closeButton.click()
      await expect(dialog).not.toBeVisible()
    })
  })

  test.describe("Navigasi homepage", () => {
    test("14. halaman utama menampilkan brand dan CTA", async ({ page }) => {
      await expect(page.getByText("ForgeFit Studio").first()).toBeVisible()
      await expect(
        page.getByRole("heading", {
          name: /operasional gym rapi/i,
          level: 1,
        }),
      ).toBeVisible()
    })

    test("15. tombol 'Daftar Gratis' di CTA section membuka register dialog", async ({ page }) => {
      await page.getByRole("button", { name: /daftar gratis/i }).click()
      await expect(
        page.getByRole("dialog", { name: "Daftar Akun" }),
      ).toBeVisible()
    })
  })
})
