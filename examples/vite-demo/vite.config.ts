import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      "@mui/icons-material/AddPhotoAlternate",
      "@mui/icons-material/ArrowDropDown",
      "@mui/icons-material/CancelOutlined",
      "@mui/icons-material/CloudUpload",
      "@mui/icons-material/Delete",
      "@mui/icons-material/DateRange",
      "@mui/icons-material/ImageOutlined",
      "@mui/icons-material/PaletteOutlined",
      "@mui/icons-material/InsertDriveFile",
      "@mui/icons-material/Search",
      "@mui/icons-material/Visibility",
      "@mui/icons-material/VisibilityOff",
    ],
    needsInterop: [
      "@mui/icons-material/AddPhotoAlternate",
      "@mui/icons-material/ArrowDropDown",
      "@mui/icons-material/CancelOutlined",
      "@mui/icons-material/CloudUpload",
      "@mui/icons-material/Delete",
      "@mui/icons-material/DateRange",
      "@mui/icons-material/ImageOutlined",
      "@mui/icons-material/PaletteOutlined",
      "@mui/icons-material/InsertDriveFile",
      "@mui/icons-material/Search",
      "@mui/icons-material/Visibility",
      "@mui/icons-material/VisibilityOff",
    ],
  },
  server: {
    host: "0.0.0.0",
    port: 7001,
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 7001,
    strictPort: true,
  },
  resolve: {
    dedupe: [
      "react",
      "react-dom",
      "react-hook-form",
      "@emotion/react",
      "@emotion/styled",
      "@mui/material",
      "@mui/icons-material",
      "@mui/x-date-pickers",
      "@tiptap/core",
      "@tiptap/react",
      "mui-tiptap",
    ],
  },
});
