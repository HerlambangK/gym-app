if (typeof global.TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util")
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}

import "@testing-library/jest-dom";

afterAll(async () => {
  const { closeDb } = await import("@/lib/drizzle")
  await closeDb()
})

if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: 1024,
  });
}
