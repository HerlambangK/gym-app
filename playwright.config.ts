import { defineConfig, devices } from "@playwright/test"

const port = process.env.PORT || "3000"
const baseURL = `http://localhost:${port}`
const webServerCommand = process.env.PLAYWRIGHT_WEB_SERVER_COMMAND || `npm run dev -- --port ${port}`

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  timeout: 30_000,
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: webServerCommand,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
