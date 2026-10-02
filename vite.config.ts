import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const packageRoot = fileURLToPath(new URL(".", import.meta.url));
const externalPackages = [
  "react",
  "react-dom",
  "react-hook-form",
  "@mui/material",
  "@mui/icons-material",
  "@mui/x-date-pickers",
  "@emotion/react",
  "@emotion/styled",
  "@codemirror",
  "@uiw/react-codemirror",
  "@tiptap",
  "mui-tiptap",
  "country-state-city",
  "date-fns",
  "libphonenumber-js",
  "react-imask",
  "react-toastify",
];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": `${packageRoot}src`,
    },
  },
  build: {
    lib: {
      entry: `${packageRoot}src/index.ts`,
      formats: ["es"],
      fileName: "polyform",
      cssFileName: "polyform",
    },
    rollupOptions: {
      external: (id) =>
        externalPackages.some((name) => id === name || id.startsWith(`${name}/`)),
    },
  },
});
