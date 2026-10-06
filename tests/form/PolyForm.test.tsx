// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { useForm, type FieldValues } from "react-hook-form";
import { afterEach, describe, expect, it } from "vitest";

import { FieldType } from "../../src/constants/appConstants";
import type { FieldConfig, FormCardConfig } from "../../src/components/form/PolyForm";
import { PolyForm } from "../../src/components/form/PolyForm";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

const options = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
];

const fields: FieldConfig<FieldValues>[] = [
  { name: "text", label: "Text", type: FieldType.Text, placeholder: "Name" },
  { name: "email", label: "Email", type: FieldType.Email },
  { name: "phone", label: "Phone", type: FieldType.Phone },
  { name: "password", label: "Password", type: FieldType.Password },
  { name: "number", label: "Number", type: FieldType.Number },
  { name: "date", label: "Date", type: FieldType.Date },
  { name: "dateRange", label: "Date range", type: FieldType.DateRange },
  { name: "time", label: "Time", type: FieldType.Time },
  { name: "dateTime", label: "Date time", type: FieldType.DateTime },
  { name: "select", label: "Select", type: FieldType.Select, options },
  { name: "autocomplete", label: "Autocomplete", type: FieldType.Autocomplete, options },
  {
    name: "lazy",
    label: "Lazy autocomplete",
    type: FieldType.LazyAutocomplete,
    fetchOptions: async () => ({ options, hasMore: false }),
  },
  { name: "textarea", label: "Textarea", type: FieldType.Textarea },
  { name: "image", label: "Image", type: FieldType.Image },
  { name: "images", label: "Images", type: FieldType.MultipleImage },
  { name: "files", label: "Files", type: FieldType.MultipleFile },
  { name: "code", label: "Code", type: FieldType.Code },
  { name: "checkbox", label: "Checkbox", type: FieldType.Checkbox },
  { name: "multiCheckbox", label: "Multi checkbox", type: FieldType.MultiCheckbox, options },
  { name: "radio", label: "Radio", type: FieldType.Radio },
  { name: "radioGroup", label: "Radio group", type: FieldType.RadioGroup, options },
  { name: "multiSelect", label: "Multi select", type: FieldType.MultiSelect, options },
  { name: "labels", label: "Labels", type: FieldType.LeadLabels },
  { name: "active", label: "Active", type: FieldType.Switch },
  { name: "currency", label: "Currency", type: FieldType.Currency },
  { name: "slider", label: "Slider", type: FieldType.Slider },
  { name: "range", label: "Range", type: FieldType.RangeSlider },
  { name: "rating", label: "Rating", type: FieldType.Rating },
  { name: "emoji", label: "Emoji text", type: FieldType.EmojiText },
  { name: "color", label: "Color", type: FieldType.Color },
  { name: "metadata", label: "Metadata", type: FieldType.KeyValue },
  {
    name: "selectableMetadata",
    label: "Selectable metadata",
    type: FieldType.KeyValueSelect,
    keyOptions: [{ value: "environment", label: "Environment" }],
    valueOptionsByKey: { environment: [{ value: "test", label: "Test" }] },
  },
];

const cards: FormCardConfig<FieldValues>[] = [
  { header: "Account", subtitle: "Profile fields", sections: [{ title: "Details", fields }] },
];

const FormHarness = (): JSX.Element => {
  const { control, setValue } = useForm<FieldValues>({
    defaultValues: {
      text: "Avery",
      number: 12,
      date: new Date(2026, 0, 12),
      dateRange: { start: new Date(2026, 0, 12), end: new Date(2026, 0, 15) },
      time: new Date(2026, 0, 12, 10),
      dateTime: { dateTime: new Date(2026, 0, 12, 10), timezone: "UTC" },
      select: "active",
      autocomplete: "active",
      lazy: "active",
      textarea: "Notes",
      images: {},
      files: [],
      multiCheckbox: [],
      multiSelect: [],
      radioGroup: "active",
      labels: [],
      slider: 50,
      range: [20, 80],
      rating: 4,
      metadata: [{ key: "region", value: "west" }],
      selectableMetadata: [{ key: "environment", value: "test" }],
    },
  });

  return <PolyForm cards={cards} control={control} setValue={setValue} />;
};

describe("PolyForm field renderer", () => {
  it("renders the built-in edit controls from card and section configuration", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    cleanup = () => {
      act(() => root.unmount());
      container.remove();
    };

    await act(async () => {
      root.render(<FormHarness />);
      await Promise.resolve();
    });

    expect(container.textContent).toContain("Account");
    expect(container.textContent).toContain("Profile fields");
    expect(container.querySelector('input[placeholder="Name"]')).not.toBeNull();
    expect(container.textContent).toContain("Select multiple images");
    expect(container.textContent).toContain("Add pair");
    expect(container.querySelector('input[placeholder="Select a date range"]')).not.toBeNull();
    expect(container.textContent).toContain("Environment");
  });
});
