<p align="center">
  <img src="assets/polyform-logo.png" alt="PolyForm" width="560" />
</p>

<p align="center">
  <a href="https://github.com/nahushr/polyform/actions/workflows/deploy.yml"><img alt="Build, analyze, and publish" src="https://github.com/nahushr/polyform/actions/workflows/deploy.yml/badge.svg?branch=main" /></a>
  <img alt="React 18+" src="https://img.shields.io/badge/React-18%2B-61DAFB?logo=react&logoColor=111827" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-types%20included-3178C6?logo=typescript&logoColor=white" />
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/badge/license-MIT-16a085.svg" /></a>
</p>

<p align="center">
  <a href="https://stackblitz.com/fork/github/nahushr/polyform?startScript=dev:example"><img alt="Open the PolyForm example in StackBlitz" src="https://developer.stackblitz.com/img/open_in_stackblitz.svg" /></a>
</p>

## Demo

| Online | Local |
|---|---|
| [Open the React example in StackBlitz](https://stackblitz.com/fork/github/nahushr/polyform?startScript=dev:example) | `npm ci` → `npm run dev:example` → [localhost:7001](http://localhost:7001) |

| Example | Fixture | Features |
|---|---|---|
| Complete form | [`examples/vite-demo/src/App.tsx`](examples/vite-demo/src/App.tsx) | Every built-in field type, grouped into separate cards from one field array |
| Submit and inspect | [`examples/vite-demo/src/App.tsx`](examples/vite-demo/src/App.tsx) | Submit displays the current React Hook Form values as formatted JSON; submit again to see edits |

## Install and import

```sh
npm install @simplishelf/polyform react react-dom react-hook-form @mui/material @mui/icons-material @mui/x-date-pickers @emotion/react @emotion/styled react-toastify
```

PolyForm also installs its field-specific dependencies for rich text and phone input. If you use the `Address` field with the built-in country/state/city lookup, install the optional dataset package:

```sh
npm install country-state-city
```

Import the package stylesheet once in your app entry:

```tsx
import "@simplishelf/polyform/style.css";
```

Mount a `ToastContainer` from `react-toastify` in your app if you use the included file or image upload controls; those controls use it to show upload validation and status messages.

## One configuration for multiple cards

Put the form fields in one array and arrange slices of that array into as many cards and sections as needed. Each card can have its own header, subtitle, and styling. A notes card is another item in the same `cards` structure.

```tsx
import { useForm } from "react-hook-form";
import { FieldType, PolyForm, type FormCardConfig } from "@simplishelf/polyform";

interface LeadFormData {
  firstName: string;
  email: string;
  notes: string;
}

const fields = [
  { name: "firstName", label: "First name", required: true },
  { name: "email", label: "Email", type: FieldType.Email, required: true },
  { name: "notes", label: "Notes", type: FieldType.Textarea, rows: 4 },
] satisfies import("@simplishelf/polyform").FieldConfig<LeadFormData>[];

const cards: FormCardConfig<LeadFormData>[] = [
  {
    header: "Lead information",
    subtitle: "Contact details",
    sections: [{ fields: fields.slice(0, 2) }],
  },
  {
    header: "Notes",
    subtitle: "Add useful context for the team",
    sections: [{ fields: fields.slice(2) }],
  },
];

function LeadForm() {
  const { control, handleSubmit, setValue, trigger, formState: { errors } } =
    useForm<LeadFormData>();

  return (
    <form onSubmit={handleSubmit((values) => console.log(values))}>
      <PolyForm
        cards={cards}
        control={control}
        errors={errors}
        setValue={setValue}
        trigger={trigger}
        classNames={{
          card: "lead-card",
          cardTitle: "lead-card__title",
          cardSubtitle: "lead-card__subtitle",
        }}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

`classNames` accepts class names for the root, card, card header/title/subtitle/divider, sections, and field grid items. Each card and section can also override its own classes with `className`, `headerClassName`, `titleClassName`, `subtitleClassName`, and related section props. A horizontal divider appears below each card heading. Set `titleTypography` and `subtitleTypography` per card to customize `fontStyle`, `color`, `fontSize`, and `fontFamily`.

## Supported field types

`Text`, `Email`, `Phone`, `Password`, `Number`, `Date`, `DateRange`, `DateTime`, `Time`, `Select`, `Autocomplete`, `LazyAutocomplete`, `Textarea`, `RichText`, `Image`, `MultipleImage`, `MultipleFile`, `Code`, `Checkbox`, `MultiCheckbox`, `Radio`, `RadioGroup`, `MultiSelect`, `LeadLabels`, `Address`, `Switch`, `Currency`, `Slider`, `RangeSlider`, `Rating`, `EmojiText`, `Color`, `KeyValue`, and `KeyValueSelect`.

| Field types | Value / configuration |
|---|---|
| `Text`, `Email`, `Phone`, `Password`, `Textarea`, `Code` | String values. Code supports TypeScript, JavaScript, Python, SQL, JSON, HTML, CSS, and plain text. |
| `Number`, `Slider`, `Rating` | Number values; `Rating` also accepts `null`. Configure sliders with `sliderMin`, `sliderMax`, `sliderStep`, `sliderMarks`, and `sliderUnit`. |
| `Date`, `DateTime`, `Time` | Date values or `null`; `DateTimeValue` keeps the selected date and timezone together. |
| `DateRange` | One field stores a `DateRangeValue` object with `start` and `end` dates and uses a connected range picker. |
| `Select`, `Autocomplete`, `LazyAutocomplete`, `Currency` | Single values. Lazy options use `fetchOptions`; currency selection includes searchable currency choices. |
| `MultiSelect`, `LeadLabels` | Chip-based multi-values. `LeadLabels` accepts `LeadLabelOption[]` and `leadLabelOptions`, with colored chips and label creation. |
| `Checkbox`, `Switch`, `Radio` | Boolean values. |
| `MultiCheckbox`, `RadioGroup` | String or number choices from `options`; set `row: true` for a horizontal layout. |
| `Image` | One image value. |
| `MultipleImage` | `Record<string, string>` of image previews; select a batch together, inspect every preview, and remove individual images. |
| `MultipleFile` | `File[]` with selected file names, sizes, and per-file removal. Upload fields accept `maxFiles`, `maxSizeMB`, and `accept`. |
| `Address` | Address object. Supports built-in country, state, and city lookup when `country-state-city` is installed. |
| `RichText` | HTML content from the rich-text editor. |
| `EmojiText` | Searchable emoji picker with the full emoji list and cursor-aware insertion; `maxLength` sets the character limit. |
| `Color` | CSS color string such as hex or RGB, with a preview swatch. |
| `KeyValue`, `KeyValueSelect` | `KeyValueEntry[]` metadata rows; the select variant supports shared or per-key `keyOptions`, `valueOptions`, and `valueOptionsByKey`. |

See [`examples/vite-demo`](./examples/vite-demo) for a runnable form that renders every built-in field from one configuration array across separate cards. Its submit handler belongs to the application: the example uses React Hook Form's `handleSubmit` to show the values as JSON, and updates that JSON each time the form is submitted.
