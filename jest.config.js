/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFiles: ["./jest.setup.env.ts"],
  setupFilesAfterEnv: ["./jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          module: "esnext",
          moduleResolution: "node",
          esModuleInterop: true,
          strict: true,
          paths: {
            "@/*": ["./src/*"],
          },
          baseUrl: ".",
        },
      },
    ],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  testMatch: ["**/__tests__/**/*.test.(ts|tsx)"],
  transformIgnorePatterns: [
    "node_modules/(?!(.*\\.mjs$|.*\\.esm\\.js$|@supabase|@base-ui))",
  ],
};

module.exports = config;
