import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
    projects: [
      {
        extends: true,
        test: {
          include: ["src/**/*.test.ts", "src/**/*.test.tsx", "tests/unit/**/*.test.ts"],
          name: "unit",
        },
      },
      {
        extends: true,
        test: {
          environment: "jsdom",
          include: ["tests/components/**/*.test.tsx"],
          name: "components",
          setupFiles: ["./tests/setup/vitest.setup.ts"],
        },
      },
    ],
  },
});
