import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const sourceRoot = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": sourceRoot,
    },
  },
  test: {
    include: ["tests/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",
      include: [
        "src/components/form/ReadOnlyField.tsx",
        "src/components/form-input/LazyAutocompleteInput.tsx",
      ],
    },
  },
});
