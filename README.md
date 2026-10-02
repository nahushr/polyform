# PolyForm

PolyForm is a reusable React form renderer built on React Hook Form and Material UI. It turns typed field and card configuration into consistent form controls.

## Install

```sh
npm install @nahushraichura/polyform react react-dom react-hook-form @mui/material @mui/icons-material @mui/x-date-pickers @emotion/react @emotion/styled react-toastify
```

PolyForm also installs its field-specific dependencies for rich text and phone input. If you use the `Address` field with the built-in country/state/city lookup, install the optional dataset package:

```sh
npm install country-state-city
```

Import the package stylesheet once in your app entry:

```tsx
import "@nahushraichura/polyform/style.css";
```

Mount a `ToastContainer` from `react-toastify` in your app if you use the included file or image upload controls; those controls use it to show upload validation and status messages.

## One configuration for multiple cards

Put every form card into one `cards` array. Each card can have a header, subtitle, and any number of titled field sections. A notes card is just another item in that same array.

```tsx
import { useForm } from "react-hook-form";
import { FieldType, PolyForm, type FormCardConfig } from "@nahushraichura/polyform";

interface LeadFormData {
  firstName: string;
  email: string;
  notes: string;
  address: {
    streetAddress: string;
    streetAddress2?: string;
    streetAddress3?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    addressType: string;
  };
}

const leadCards: FormCardConfig<LeadFormData>[] = [
  {
    header: "Lead information",
    subtitle: "Contact details and address",
    sections: [
      {
        title: "Lead details",
        fields: [
          { name: "firstName", label: "First name", required: true },
          { name: "email", label: "Email", type: FieldType.Email, required: true },
        ],
      },
      {
        title: "Address",
        fields: [
          { name: "address", label: "Address", type: FieldType.Address, required: true },
        ],
      },
    ],
  },
  {
    header: "Notes",
    subtitle: "Add useful context for the team",
    sections: [
      {
        fields: [
          { name: "notes", label: "Additional notes", type: FieldType.Textarea, rows: 4 },
        ],
      },
    ],
  },
];

const { control, setValue, trigger, formState: { errors } } = useForm<LeadFormData>();

<PolyForm
  cards={leadCards}
  control={control}
  errors={errors}
  setValue={setValue}
  trigger={trigger}
  classNames={{
    card: "lead-form-card",
    cardTitle: "lead-form-card__title",
    cardSubtitle: "lead-form-card__subtitle",
    sectionTitle: "lead-form-section__title",
  }}
/>
```

`classNames` accepts class names for the root, card, card header/title/subtitle/divider, sections, and field grid items. Each card and section can also override its own classes with `className`, `headerClassName`, `titleClassName`, `subtitleClassName`, and related section props. A horizontal divider appears below each card heading. Set `titleTypography` and `subtitleTypography` per card to customize `fontStyle`, `color`, `fontSize`, and `fontFamily`.

## Supported field types

`Text`, `Email`, `Phone`, `Password`, `Number`, `Date`, `DateRange`, `DateTime`, `Time`, `Select`, `Autocomplete`, `LazyAutocomplete`, `Textarea`, `RichText`, `Image`, `MultipleImage`, `MultipleFile`, `Code`, `Checkbox`, `MultiCheckbox`, `Radio`, `RadioGroup`, `MultiSelect`, `LeadLabels`, `Address`, `Switch`, `Currency`, `Slider`, `RangeSlider`, `Rating`, `Color`, and `KeyValue`.

`MultipleImage` accepts a batch of images in one selection, shows every preview, and allows individual removal. `MultipleFile` lists selected file names and sizes with an individual remove action. `Code` supports TypeScript, JavaScript, Python, SQL, JSON, HTML, CSS, and plain text syntax modes. `MultiSelect` is a searchable chip multi-select styled with the other filled inputs. `LeadLabels` provides searchable colored lead labels, removal, and inline label creation; pass `leadLabelOptions` on the field configuration. Set `row: true` on `MultiCheckbox` or `RadioGroup` to display its choices in a horizontal row.

For React Hook Form values, use a `string` for `Image` and `Code`, a `Record<string, string>` for `MultipleImage`, a `File[]` for `MultipleFile`, a `boolean` for `Checkbox` and `Radio`, and a `string[]` or `number[]` for `MultiCheckbox` and `MultiSelect`. `RadioGroup` uses one selected `string` or `number`. `LeadLabels` uses a `LeadLabelOption[]` value and `LeadLabelOption[]` in `leadLabelOptions`. Multi-choice fields read their choices from `options`; upload fields also accept `maxFiles`, `maxSizeMB`, and `accept`, while code fields accept `codeLanguage`.

`Slider` stores one number; `RangeSlider` stores a two-number array. Configure them with `sliderMin`, `sliderMax`, `sliderStep`, `sliderMarks`, and `sliderUnit`. `Rating` stores a number or `null` and accepts `ratingVariant: "stars" | "emoji"`. `Time` stores a `Date | null`. `DateRange` stores a `DateRangeValue` object with `start` and `end` dates. `Color` stores a CSS color value such as a hex or RGB string. `KeyValue` stores a `KeyValueEntry[]` array and renders add/remove actions for each row.

See [`examples/vite-demo`](./examples/vite-demo) for a runnable app that renders every built-in field from one configuration array across three cards.
