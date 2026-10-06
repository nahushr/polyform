import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { FieldValues } from "react-hook-form";

import { FieldType } from "../../constants/appConstants";
import type { CurrencyOption } from "../../constants/currency";
import type { FieldConfig } from "./PolyForm";
import ReadOnlyField from "./ReadOnlyField";

type Values = FieldValues;

const createField = (
  type: FieldType,
  config: Partial<FieldConfig<Values>> = {},
): FieldConfig<Values> => ({
  name: "value",
  label: "Example",
  type,
  ...config,
});

const renderField = (
  type: FieldType,
  value: unknown,
  config: Partial<FieldConfig<Values>> = {},
  values?: Values,
): string =>
  renderToStaticMarkup(
    <ReadOnlyField
      field={createField(type, config)}
      value={value}
      values={values}
    />,
  );

const usd: CurrencyOption = {
  value: "USD",
  code: "USD",
  name: "US Dollar",
  symbol: "$",
  flag: "🇺🇸",
  label: "US Dollar (USD)",
};

describe("ReadOnlyField", () => {
  it("uses custom view content before empty-value formatting", () => {
    const html = renderField(
      FieldType.Text,
      "",
      { viewContent: (value, values) => `${String(value) || "custom"}:${values?.extra}` },
      { extra: "context" },
    );

    expect(html).toContain("custom:context");
    expect(html).not.toContain("Not provided");
  });

  it("renders missing values and generic text safely", () => {
    expect(renderField(FieldType.Text, "  ")).toContain("Not provided");
    expect(renderField(FieldType.Text, "  Hello PolyForm  ")).toContain("Hello PolyForm");
    expect(renderField(FieldType.Text, false)).toContain("No");
    expect(renderField(FieldType.Text, ["one", "two"])).toContain("one");
    expect(renderField(FieldType.Text, { detail: "visible" })).toContain("visible");
  });

  it("formats phone numbers with country flags and falls back for invalid input", () => {
    const phone = renderField(FieldType.Phone, "+14155552671");
    expect(phone).toContain("🇺🇸");
    expect(phone).toContain("+1 415 555 2671");

    expect(renderField(FieldType.Phone, "not a number")).toContain("not a number");
  });

  it("masks passwords and formats currencies and amounts", () => {
    expect(renderField(FieldType.Password, "do-not-show")).toContain("••••••••");

    const currency = renderField(FieldType.Currency, "USD", { currencyOptions: [usd] });
    expect(currency).toContain("US Dollar");
    expect(currency).toContain("🇺🇸");

    const customCurrency: CurrencyOption = { ...usd, code: "INVALID", value: "INVALID" };
    const fallback = renderField(FieldType.Number, 1200, {
      currencyFieldName: "currency",
      currencyOptions: [customCurrency],
    }, { currency: "INVALID" });
    expect(fallback).toContain("$1,200");

    const number = renderField(FieldType.RangeSlider, [25, 75], {
      sliderUnit: "%",
      currencyFieldName: "currency",
      currencyOptions: [usd],
    }, { currency: "USD" });
    expect(number).toContain("$25.00");
    expect(number).toContain("$75.00");

    expect(renderField(FieldType.Slider, "not-numeric", { sliderUnit: " kg" }))
      .toContain("not-numeric");
    expect(renderField(FieldType.Currency, "XXX")).toContain("XXX");
  });

  it("formats dates, date ranges, date-times, and times", () => {
    const date = new Date(2026, 3, 15, 8, 0);
    expect(renderField(FieldType.Date, date, { dateFormat: "yyyy-MM-dd" }))
      .toContain("2026-04-15");
    expect(renderField(FieldType.Date, "invalid date")).toContain("invalid date");

    const range = renderField(FieldType.DateRange, { start: date, end: null }, {
      dateFormat: "yyyy-MM-dd",
    });
    expect(range).toContain("2026-04-15");
    expect(range).toContain("Not set");

    const dateTime = renderField(FieldType.DateTime, {
      dateTime: date,
      timezone: "America/New_York",
    });
    expect(dateTime).toContain("America/New York");
    expect(dateTime).toContain("2026");

    expect(renderField(FieldType.DateTime, {})).toContain("Not set");
    expect(renderField(FieldType.Time, date, { timeFormat: "HH:mm" })).toContain("08:00");
  });

  it("resolves standard, country, and lazy dropdown labels", () => {
    const options = [
      { value: "us", label: "United States" },
      { value: "ca", label: "Canada" },
    ];
    const country = renderField(FieldType.Select, "us", {
      name: "country",
      options,
    });
    expect(country).toContain("🇺🇸");
    expect(country).toContain("United States");
    expect(renderField(FieldType.Autocomplete, "ca", { options })).toContain("Canada");
    expect(renderField(FieldType.Select, "missing", { options })).toContain("missing");

    expect(renderField(FieldType.LazyAutocomplete, 42, {
      initialOption: { value: 42, label: "Avery Morgan" },
    })).toContain("Avery Morgan");
    expect(renderField(FieldType.LazyAutocomplete, 43, {
      initialOption: { value: 42, label: "Avery Morgan" },
    })).toContain("43");
  });

  it("presents boolean fields, option groups, and labels as status or chips", () => {
    expect(renderField(FieldType.Checkbox, true)).toContain("Checked");
    expect(renderField(FieldType.Switch, false)).toContain("Off");
    expect(renderField(FieldType.Radio, true)).toContain("Selected");
    expect(renderField(FieldType.Radio, false)).toContain("Not selected");

    const options = [
      { value: "react", label: "React" },
      { value: "ts", label: "TypeScript" },
    ];
    expect(renderField(FieldType.MultiCheckbox, ["react", "ts"], { options }))
      .toContain("TypeScript");
    expect(renderField(FieldType.MultiSelect, "react", { options })).toContain("React");
    expect(renderField(FieldType.RadioGroup, "ts", { options })).toContain("TypeScript");

    expect(renderField(FieldType.LeadLabels, [1, { name: "Custom", color: "#123456" }], {
      leadLabelOptions: [{ labelId: 1, name: "Priority", color: "#ffcc00" }],
    })).toContain("Priority");
    expect(renderField(FieldType.LeadLabels, ["unmatched"], { leadLabelOptions: [] }))
      .toContain("Example");
  });

  it("shows a formatted address and an empty address state", () => {
    const address = renderField(FieldType.Address, {
      streetAddress: "42 Market Street",
      streetAddress2: "Suite 240",
      city: "San Francisco",
      state: "California",
      postalCode: "94103",
      country: "United States",
      addressType: "OFFICE",
      nameOnAddress: "Avery Morgan",
      emailOnAddress: "avery@example.com",
      phoneOnAddress: "+14155552671",
    });
    expect(address).toContain("42 Market Street");
    expect(address).toContain("San Francisco, California");
    expect(address).toContain("🇺🇸");
    expect(address).toContain("avery@example.com");

    expect(renderField(FieldType.Address, {})).toContain("Not provided");
  });

  it("filters unsafe image sources and describes file attachments", () => {
    const images = renderField(FieldType.MultipleImage, {
      first: "https://example.com/image.png",
      second: "javascript:alert(1)",
      third: "/assets/team.png",
    });
    expect(images).toContain("https://example.com/image.png");
    expect(images).toContain("/assets/team.png");
    expect(images).not.toContain("javascript:");
    expect(renderField(FieldType.Image, "javascript:alert(1)")).toContain("No images");

    const files = renderField(FieldType.MultipleFile, [
      { name: "brief.pdf", type: "application/pdf", size: 2048 },
      { name: "tiny.txt", type: "", size: 0 },
      "untyped file",
    ]);
    expect(files).toContain("brief.pdf");
    expect(files).toContain("2 KB");
    expect(files).toContain("tiny.txt");
    expect(files).toContain("File 3");
  });

  it("renders code, star ratings, and color swatches", () => {
    const code = renderField(FieldType.Code, "SELECT 1;", { codeLanguage: "sql" });
    expect(code).toContain("SQL");
    expect(code).toContain("SELECT 1;");

    const rating = renderField(FieldType.Rating, 3.5, { ratingMax: 5 });
    expect(rating).toContain("3.5 out of 5 stars");
    expect(rating).toContain("rating-star-half");

    const color = renderField(FieldType.Color, "#3957D7");
    expect(color).toContain("#3957D7");
    expect(color).toContain('fill="#3957D7"');
  });

  it("resolves metadata options and sanitizes rich text to plain text", () => {
    const metadata = renderField(FieldType.KeyValue, [
      { key: "region", value: "us-east" },
      "ignored entry",
    ]);
    expect(metadata).toContain("region");
    expect(metadata).toContain("us-east");
    expect(metadata).not.toContain("ignored entry");

    const selectableMetadata = renderField(FieldType.KeyValueSelect, [
      { key: "env", value: "prod" },
    ], {
      keyOptions: [{ value: "env", label: "Environment" }],
      valueOptionsByKey: {
        env: [{ value: "prod", label: "Production" }],
      },
    });
    expect(selectableMetadata).toContain("Environment");
    expect(selectableMetadata).toContain("Production");

    expect(renderField(FieldType.Textarea, "First line\nSecond line")).toContain("Second line");
    expect(renderField(FieldType.EmojiText, "Thanks 👋")).toContain("Thanks 👋");

    const richText = renderField(
      FieldType.RichText,
      "<p>Hello&nbsp;<strong>world</strong></p><script>alert('x')</script>",
    );
    expect(richText).toContain("Hello world");
    expect(richText).not.toContain("alert");
    expect(renderField(FieldType.RichText, "<p></p>")).toContain("Not provided");
  });

  it("renders unknown array items as chips and object values as readable JSON", () => {
    const chips = renderField("unknown" as FieldType, [
      { label: "Custom item", color: "#123456" },
      { name: "Named item" },
      "Plain item",
      {},
    ]);
    expect(chips).toContain("Custom item");
    expect(chips).toContain("Named item");
    expect(chips).toContain("Plain item");
    expect(chips).toContain("Item");

    const object = renderField("unknown" as FieldType, { extra: "details" });
    expect(object).toContain("details");
  });
});
