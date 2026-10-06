// @vitest-environment jsdom
import type { FieldValues, UseFormSetValue, UseFormTrigger } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { FieldType } from "../../src/constants/appConstants";
import { CURRENCY_OPTIONS } from "../../src/constants/currency";
import type { FieldConfig, FormCardConfig } from "../../src/components/form/PolyForm";
import { fillPolyFormTestData } from "../../src/components/form/testFillData";

type Values = FieldValues;

const field = (
  name: string,
  type: FieldType,
  config: Partial<FieldConfig<Values>> = {},
): FieldConfig<Values> => ({ name, label: name, type, ...config });

const cardsFor = (fields: FieldConfig<Values>[]): FormCardConfig<Values>[] => [
  { sections: [{ fields }] },
];

describe("fillPolyFormTestData", () => {
  it("fills built-in fields with valid values and uses server options for lazy fields", async () => {
    const setValueMock = vi.fn();
    const triggerMock = vi.fn().mockResolvedValue(true);
    const onLazyOption = vi.fn();
    const onImageChange = vi.fn();
    const onStateChange = vi.fn();
    const fieldSetValue = vi.fn();
    const options = [
      { value: "qualified", label: "Qualified" },
      { value: "new", label: "New" },
    ];
    const fields: FieldConfig<Values>[] = [
      field("firstName", FieldType.Text),
      field("lastName", FieldType.Text),
      field("email", FieldType.Email),
      field("phone", FieldType.Phone),
      field("website", FieldType.Text),
      field("company", FieldType.Text),
      field("jobTitle", FieldType.Text),
      field("annualRevenue", FieldType.Text),
      field("notes", FieldType.Textarea),
      field("streetAddress", FieldType.Text),
      field("streetAddress2", FieldType.Text),
      field("postalCode", FieldType.Text),
      field("nameOnAddress", FieldType.Text),
      field("emailOnAddress", FieldType.Text),
      field("fallbackText", FieldType.Text, { placeholder: "Fallback sample" }),
      field("password", FieldType.Password),
      field("employees", FieldType.Number),
      field("richText", FieldType.RichText),
      field("sql", FieldType.Code, { codeLanguage: "sql" }),
      field("python", FieldType.Code, { codeLanguage: "python" }),
      field("json", FieldType.Code, { codeLanguage: "json" }),
      field("html", FieldType.Code, { codeLanguage: "html" }),
      field("css", FieldType.Code, { codeLanguage: "css" }),
      field("code", FieldType.Code),
      field("emoji", FieldType.EmojiText),
      field("date", FieldType.Date),
      field("dateRange", FieldType.DateRange),
      field("time", FieldType.Time),
      field("dateTime", FieldType.DateTime),
      field("select", FieldType.Select, { options }),
      field("autocomplete", FieldType.Autocomplete, { options }),
      field("radioGroup", FieldType.RadioGroup, { options }),
      field("currency", FieldType.Currency, { currencyOptions: CURRENCY_OPTIONS.slice(0, 2) }),
      field("fallbackCurrency", FieldType.Currency, { currencyOptions: [] }),
      field("color", FieldType.Color),
      field("image", FieldType.Image, { onImageChange }),
      field("gallery", FieldType.MultipleImage, { maxFiles: 2 }),
      field("files", FieldType.MultipleFile, { maxFiles: 2 }),
      field("checkbox", FieldType.Checkbox),
      field("switch", FieldType.Switch),
      field("radio", FieldType.Radio),
      field("multiCheckbox", FieldType.MultiCheckbox, { options }),
      field("multiSelect", FieldType.MultiSelect, { options }),
      field("labels", FieldType.LeadLabels, {
        leadLabelOptions: [
          { labelId: 1, name: "Priority", color: "#f5a623" },
          { labelId: 2, name: "Website", color: "#4b9ce2" },
        ],
      }),
      field("slider", FieldType.Slider, { sliderMin: 5, sliderMax: 95, sliderStep: 5 }),
      field("range", FieldType.RangeSlider, { sliderMin: 5, sliderMax: 95, sliderStep: 5 }),
      field("rating", FieldType.Rating, { ratingMax: 5, ratingPrecision: 0.5 }),
      field("metadata", FieldType.KeyValue),
      field("selectableMetadata", FieldType.KeyValueSelect, {
        keyOptions: [{ value: "env", label: "Environment" }],
        valueOptionsByKey: {
          env: [{ value: "production", label: "Production" }],
        },
      }),
      field("metadataWithoutOptions", FieldType.KeyValueSelect, { keyOptions: [] }),
      field("lazy", FieldType.LazyAutocomplete, {
        lazyPageSize: 5,
        fetchOptions: vi.fn().mockResolvedValue({
          options: [{ value: 101, label: "Avery Morgan" }],
          hasMore: false,
        }),
      }),
      field("lazyWithoutFetcher", FieldType.LazyAutocomplete),
      field("lazyInvalidOption", FieldType.LazyAutocomplete, {
        fetchOptions: vi.fn().mockResolvedValue({
          options: [{ value: "", label: " " }],
          hasMore: false,
        }),
      }),
      field("lazyRejected", FieldType.LazyAutocomplete, {
        fetchOptions: vi.fn().mockRejectedValue(new Error("offline")),
      }),
      field("custom", FieldType.Text, { testValue: () => "custom value" }),
      field("rejectedCustom", FieldType.Text, {
        testValue: () => Promise.reject(new Error("no fixture")),
      }),
      field("address", FieldType.Address, {
        onStateChange,
        allowedCountries: ["United States"],
        states: ["California"],
        cities: ["San Francisco"],
      }),
      field("invalidAddressCountry", FieldType.Address, {
        allowedCountries: ["Not in dataset"],
      }),
      field("invalidAddressState", FieldType.Address, { states: ["Not in dataset"] }),
      field("invalidAddressCity", FieldType.Address, { cities: ["Not in dataset"] }),
      field("separatelySet", FieldType.Text, { setValue: fieldSetValue as UseFormSetValue<Values> }),
      field("disabledField", FieldType.Text, { disabled: true }),
      field("unknownType", "custom" as FieldType),
    ];

    const result = await fillPolyFormTestData({
      cards: cardsFor(fields),
      setValue: setValueMock as UseFormSetValue<Values>,
      trigger: triggerMock as UseFormTrigger<Values>,
      onLazyOption,
    });
    const values = new Map<string, unknown>(
      setValueMock.mock.calls.map(([name, value]) => [String(name), value]),
    );

    expect(result.filled + result.skipped).toBe(fields.length);
    expect(result.skipped).toBe(9);
    expect(values.get("firstName")).toMatch(/^(Avery|Jordan|Morgan|Riley)$/);
    expect(values.get("email")).toMatch(/@example\.com$/);
    expect(["qualified", "new"]).toContain(values.get("select"));
    expect(values.get("currency")).toBeTruthy();
    expect(values.get("fallbackCurrency")).toBe("USD");
    expect(values.get("files")).toHaveLength(2);
    expect(values.get("gallery")).toHaveProperty("demo-image-1.svg");
    expect(values.get("address")).toMatchObject({
      country: "United States",
      state: "California",
      city: "San Francisco",
    });
    expect(values.has("invalidAddressCountry")).toBe(false);
    expect(values.has("invalidAddressState")).toBe(false);
    expect(values.has("invalidAddressCity")).toBe(false);
    expect(fieldSetValue).toHaveBeenCalledWith("separatelySet", expect.any(String), expect.any(Object));
    expect(onLazyOption).toHaveBeenCalledWith("lazy", { value: 101, label: "Avery Morgan" });
    expect(onImageChange).toHaveBeenCalledWith(expect.stringContaining("data:image/svg+xml"));
    expect(onStateChange).toHaveBeenCalledWith("California");
    expect(triggerMock).toHaveBeenCalledTimes(1);
  });

  it("skips fields when disabled, in view mode, or missing setValue", async () => {
    const fields = [field("one", FieldType.Text), field("two", FieldType.Checkbox)];
    const cards = cardsFor(fields);
    const noSetterResult = await fillPolyFormTestData({ cards });
    expect(noSetterResult).toEqual({
      filled: 0,
      skipped: 2,
      message: "Pass setValue to PolyForm to enable test data filling.",
    });

    const setValueMock = vi.fn();
    const disabledResult = await fillPolyFormTestData({
      cards,
      setValue: setValueMock as UseFormSetValue<Values>,
      disabled: true,
    });
    expect(disabledResult).toEqual({ filled: 0, skipped: 2 });

    const viewResult = await fillPolyFormTestData({
      cards,
      setValue: setValueMock as UseFormSetValue<Values>,
      isView: true,
    });
    expect(viewResult).toEqual({ filled: 0, skipped: 2 });
    expect(setValueMock).not.toHaveBeenCalled();
  });
});
