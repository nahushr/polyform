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
        "examples/vite-demo/src/App.tsx",
        "examples/vite-demo/src/components/DevicePreview.tsx",
        "src/components/form/PolyForm.tsx",
        "src/components/form/ReadOnlyField.tsx",
        "src/components/form/testFillData.ts",
        "src/components/form-input/ColorPickerInput.tsx",
        "src/components/form-input/DateRangePickerInput.tsx",
        "src/components/form-input/ImageSlotsUpload.tsx",
        "src/components/form-input/KeyValueInput.tsx",
        "src/components/form-input/KeyValueSelectInput.tsx",
        "src/components/form-input/LazyAutocompleteInput.tsx",
        "src/components/form-input/LeadLabels.tsx",
        "src/components/form-input/MultipleImageUploadInput.tsx",
        "src/components/form-input/MultiSelectInput.tsx",
        "src/components/form-input/PasswordInput.tsx",
        "src/components/form-input/RadioInput.tsx",
        "src/components/form-input/SliderInput.tsx",
        "src/components/form-input/TextFieldInput.tsx",
        "src/utils/stateCityMapper.ts",
      ],
    },
  },
});
