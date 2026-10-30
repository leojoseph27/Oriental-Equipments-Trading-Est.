import { defineConfig, devices } from "@playwright/test";

// Tests run against the production build served by `astro preview` — the same
// output that gets deployed. `npm run test:e2e` builds first, so the output
// always exists. Port 4172 to avoid clashing with a dev server on 4321.
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never", outputFolder: "test-results/html" }]],
  timeout: 30_000,
  expect: { timeout: 5_000 },
  outputDir: "test-results/artifacts",
  use: {
    baseURL: "http://127.0.0.1:4172",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // WebKit is the iOS Safari engine; the iPhone projects reproduce
    // 390×844 / 430×932 Safari contexts for the loader/iOS specs.
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "iphone-13", use: { ...devices["iPhone 13"] } },
    { name: "iphone-14-pro-max", use: { ...devices["iPhone 14 Pro Max"] } },
  ],
  webServer: {
    command: "npx astro preview --port 4172 --host 127.0.0.1",
    url: "http://127.0.0.1:4172/",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
