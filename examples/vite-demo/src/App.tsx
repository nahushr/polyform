import {
  Box,
  Button,
  Container,
  FormControlLabel,
  Paper,
  Switch,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  FieldType,
  PolyForm,
  PolyFormTestFillButton,
  type DateRangeValue,
  type DateTimeValue,
  type FieldConfig,
  type FormCardConfig,
  type KeyValueEntry,
  type LeadLabelOption,
} from "@simplishelf/polyform";
import "@simplishelf/polyform/style.css";
import { DevicePreview } from "./components/DevicePreview";

interface DemoFormValues {
  firstName: string;
  email: string;
  phone: string;
  password: string;
  employees: number;
  startDate: Date | null;
  launchWindow: DateTimeValue;
  status: string;
  country: string;
  assignedAgentId: string | number;
  company: string;
  notes: string;
  description: string;
  avatar: string;
  gallery: Record<string, string>;
  attachments: File[];
  code: string;
  address: {
    streetAddress: string;
    streetAddress2: string;
    streetAddress3: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    addressType: string;
    nameOnAddress?: string;
    emailOnAddress?: string;
    phoneOnAddress?: string;
  };
  active: boolean;
  currency: string;
  emailOptIn: boolean;
  interests: string[];
  interestsRow: string[];
  radioChoice: boolean;
  preferredChannel: string;
  preferredChannelRow: string;
  leadLabels: LeadLabelOption[];
  technologies: string[];
  completion: number;
  priceRange: [number, number];
  starRating: number | null;
  emojiMessage: string;
  brandColor: string;
  openingTime: Date | null;
  bookingWindow: DateRangeValue;
  metadata: KeyValueEntry[];
  selectableMetadata: KeyValueEntry[];
}

// This is the only field configuration array: it contains every built-in type.
const showcaseFields: FieldConfig<DemoFormValues>[] = [
  {
    name: "firstName",
    label: "Text",
    type: FieldType.Text,
    required: true,
    placeholder: "Enter a name",
  },
  {
    name: "email",
    label: "Email",
    type: FieldType.Email,
    required: true,
    placeholder: "name@company.com",
  },
  {
    name: "phone",
    label: "Phone",
    type: FieldType.Phone,
    placeholder: "+1 (555) 123-4567",
  },
  {
    name: "password",
    label: "Password",
    type: FieldType.Password,
    autocomplete: "new-password",
    placeholder: "Create a password",
  },
  {
    name: "employees",
    label: "Number",
    type: FieldType.Number,
    placeholder: "Number of employees",
  },
  {
    name: "startDate",
    label: "Date",
    type: FieldType.Date,
    dateFormat: "MM/dd/yyyy",
  },
  {
    name: "launchWindow",
    label: "Date and time",
    type: FieldType.DateTime,
    dateTimeLayout: "horizontal",
  },
  {
    name: "status",
    label: "Select",
    type: FieldType.Select,
    options: [
      { value: "new", label: "New" },
      { value: "contacted", label: "Contacted" },
      { value: "qualified", label: "Qualified" },
    ],
    placeholder: "Choose a status",
  },
  {
    name: "country",
    label: "Autocomplete",
    type: FieldType.Autocomplete,
    options: [
      { value: "United States", label: "United States" },
      { value: "India", label: "India" },
      { value: "Canada", label: "Canada" },
      { value: "United Kingdom", label: "United Kingdom" },
    ],
    placeholder: "Search countries",
  },
  {
    name: "assignedAgentId",
    label: "Lazy autocomplete",
    type: FieldType.LazyAutocomplete,
    fetchOptions: async (searchText, start, pageSize) => {
      const names = ["Avery Morgan", "Jordan Lee", "Morgan Patel", "Riley Chen"];
      const matchingNames = names.filter((name) =>
        name.toLowerCase().includes(searchText.trim().toLowerCase()),
      );
      const options = matchingNames
        .slice(start, start + pageSize)
        .map((label, index) => ({ value: start + index + 101, label }));
      return {
        options,
        hasMore: start + options.length < matchingNames.length,
        totalCount: matchingNames.length,
      };
    },
    lazyPageSize: 2,
    lazyDebounceMs: 250,
    initialOption: { value: 101, label: "Avery Morgan" },
    placeholder: "Search agents",
  },
  {
    name: "notes",
    label: "Textarea",
    type: FieldType.Textarea,
    rows: 4,
    placeholder: "Write a few notes...",
    gridSize: { xs: 12, sm: 12 },
  },
  {
    name: "description",
    label: "Rich text",
    type: FieldType.RichText,
    placeholder: "Describe the lead...",
    gridSize: { xs: 12, sm: 12 },
  },
  {
    name: "avatar",
    label: "Image upload",
    type: FieldType.Image,
    maxSizeMB: 3,
    gridSize: { xs: 12, sm: 12 },
  },
  {
    name: "address",
    label: "Address details",
    type: FieldType.Address,
    required: true,
    gridSize: { xs: 12, sm: 12 },
  },
  {
    name: "active",
    label: "Active lead",
    type: FieldType.Switch,
    switchLabel: "Enable this lead",
  },
  {
    name: "currency",
    label: "Currency",
    type: FieldType.Currency,
  },
  {
    name: "company",
    label: "Company",
    type: FieldType.Text,
    placeholder: "Enter a company",
  },
  {
    name: "gallery",
    label: "Multiple images",
    type: FieldType.MultipleImage,
    maxFiles: 8,
    maxSizeMB: 3,
    gridSize: { xs: 12, sm: 12 },
  },
  {
    name: "attachments",
    label: "Multiple files",
    type: FieldType.MultipleFile,
    maxFiles: 5,
    maxSizeMB: 10,
    accept: ".pdf,.csv,.xlsx,.txt,image/*",
    gridSize: { xs: 12, sm: 12 },
  },
  {
    name: "code",
    label: "Code editor",
    type: FieldType.Code,
    codeLanguage: "sql",
    placeholder: "SELECT * FROM leads;",
    gridSize: { xs: 12, sm: 12 },
  },
  {
    name: "emailOptIn",
    label: "Checkbox",
    type: FieldType.Checkbox,
    gridSize: { xs: 12, sm: 6 },
  },
  {
    name: "interests",
    label: "Multi checkbox",
    type: FieldType.MultiCheckbox,
    options: [
      { value: "sales", label: "Sales" },
      { value: "marketing", label: "Marketing" },
      { value: "support", label: "Support" },
    ],
    gridSize: { xs: 12, sm: 6 },
  },
  {
    name: "interestsRow",
    label: "Multi checkbox — row layout",
    type: FieldType.MultiCheckbox,
    options: [
      { value: "sales", label: "Sales" },
      { value: "marketing", label: "Marketing" },
      { value: "support", label: "Support" },
    ],
    row: true,
    gridSize: { xs: 12, sm: 12 },
  },
  {
    name: "radioChoice",
    label: "Radio",
    type: FieldType.Radio,
    gridSize: { xs: 12, sm: 6 },
  },
  {
    name: "preferredChannel",
    label: "Radio group",
    type: FieldType.RadioGroup,
    options: [
      { value: "email", label: "Email" },
      { value: "phone", label: "Phone" },
      { value: "text", label: "Text" },
    ],
    gridSize: { xs: 12, sm: 6 },
  },
  {
    name: "preferredChannelRow",
    label: "Radio group — row layout",
    type: FieldType.RadioGroup,
    options: [
      { value: "email", label: "Email" },
      { value: "phone", label: "Phone" },
      { value: "text", label: "Text" },
    ],
    row: true,
    gridSize: { xs: 12, sm: 12 },
  },
  {
    name: "leadLabels",
    label: "Lead labels",
    type: FieldType.LeadLabels,
    leadLabelOptions: [
      {
        labelId: 1,
        name: "Priority",
        description: "Needs prompt follow-up",
        color: "#E77A7A",
      },
      {
        labelId: 2,
        name: "Website",
        description: "Came through the website",
        color: "#84B6EB",
      },
      {
        labelId: 3,
        name: "Referral",
        description: "Referred by a customer or partner",
        color: "#A7DDA7",
      },
      {
        labelId: 4,
        name: "Event",
        description: "Met at an event",
        color: "#D4C5F9",
      },
    ],
    gridSize: { xs: 12, sm: 6 },
  },
  {
    name: "technologies",
    label: "Multi-select",
    type: FieldType.MultiSelect,
    options: [
      { value: "react", label: "React" },
      { value: "typescript", label: "TypeScript" },
      { value: "mui", label: "Material UI" },
      { value: "vite", label: "Vite" },
    ],
    placeholder: "Choose technologies",
  },
  {
    name: "completion",
    label: "Slider",
    type: FieldType.Slider,
    sliderMin: 0,
    sliderMax: 100,
    sliderStep: 5,
    sliderMarks: [
      { value: 0, label: "0%" },
      { value: 50, label: "50%" },
      { value: 100, label: "100%" },
    ],
    sliderUnit: "%",
    gridSize: { xs: 12, sm: 6 },
  },
  {
    name: "priceRange",
    label: "Range slider",
    type: FieldType.RangeSlider,
    sliderMin: 0,
    sliderMax: 500,
    sliderStep: 10,
    currencyFieldName: "currency",
    gridSize: { xs: 12, sm: 6 },
  },
  {
    name: "starRating",
    label: "Star rating",
    type: FieldType.Rating,
    ratingMax: 5,
    ratingPrecision: 0.5,
    gridSize: { xs: 12, sm: 6 },
  },
  {
    name: "emojiMessage",
    label: "Chat message",
    type: FieldType.EmojiText,
    placeholder: "Add a message…",
    maxLength: 1000,
    gridSize: { xs: 12, sm: 12 },
  },
  {
    name: "brandColor",
    label: "Color picker",
    type: FieldType.Color,
    gridSize: { xs: 12, sm: 6 },
  },
  {
    name: "openingTime",
    label: "Opening time",
    type: FieldType.Time,
    ampm: true,
    minutesStep: 15,
    timeFormat: "hh:mm a",
    gridSize: { xs: 12, sm: 6 },
  },
  {
    name: "bookingWindow",
    label: "Booking date range",
    type: FieldType.DateRange,
    dateFormat: "MMM d, yyyy",
    gridSize: { xs: 12, sm: 12 },
  },
  {
    name: "metadata",
    label: "Key-value metadata",
    type: FieldType.KeyValue,
    keyPlaceholder: "e.g. environment",
    valuePlaceholder: "e.g. production",
    addButtonLabel: "Add metadata pair",
    gridSize: { xs: 12, sm: 12 },
  },
  {
    name: "selectableMetadata",
    label: "Dropdown key-value metadata",
    type: FieldType.KeyValueSelect,
    keyOptions: [
      { value: "environment", label: "Environment" },
      { value: "region", label: "Region" },
      { value: "deployment", label: "Deployment" },
    ],
    valueOptionsByKey: {
      environment: [
        { value: "development", label: "Development" },
        { value: "staging", label: "Staging" },
        { value: "production", label: "Production" },
      ],
      region: [
        { value: "us-east", label: "US East" },
        { value: "us-west", label: "US West" },
        { value: "eu-west", label: "EU West" },
      ],
      deployment: [
        { value: "blue", label: "Blue" },
        { value: "green", label: "Green" },
      ],
    },
    keyPlaceholder: "Choose a property",
    valuePlaceholder: "Choose a value",
    addButtonLabel: "Add dropdown pair",
    gridSize: { xs: 12, sm: 12 },
  },
];

const advancedControlsStart = showcaseFields.findIndex(
  (field) => field.name === "completion",
);

const showcaseCards: FormCardConfig<DemoFormValues>[] = [
  {
    header: "Lead essentials",
    subtitle: "A reusable card with a custom heading and supporting text.",
    className: "demo-form__card--essentials",
    titleClassName: "demo-form__card-title--essentials",
    titleTypography: {
      fontStyle: "normal",
      color: "#304bb1",
      fontSize: "1.35rem",
      fontFamily: "Georgia, serif",
    },
    subtitleTypography: {
      fontStyle: "normal",
      color: "#667085",
      fontSize: "0.9rem",
      fontFamily: "Arial, sans-serif",
    },
    sections: [
      {
        fields: showcaseFields.slice(0, 10),
      },
    ],
  },
  {
    header: "Lead profile",
    subtitle: "Card content and styling can be configured independently.",
    className: "demo-form__card--profile",
    titleClassName: "demo-form__card-title--profile",
    titleTypography: {
      fontStyle: "italic",
      color: "#6040a4",
      fontSize: "1.4rem",
      fontFamily: "Verdana, sans-serif",
    },
    subtitleTypography: {
      fontStyle: "italic",
      color: "#6f6483",
      fontSize: "0.95rem",
      fontFamily: "Georgia, serif",
    },
    sections: [
      {
        fields: showcaseFields.slice(10, advancedControlsStart),
      },
    ],
  },
  {
    header: "Advanced controls",
    subtitle: "Flexible inputs for ranges, feedback, schedules, and metadata.",
    sections: [
      {
        fields: showcaseFields.slice(advancedControlsStart),
      },
    ],
  },
];

const createDemoImage = (title: string): string =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300" viewBox="0 0 480 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#3855d6"/><stop offset="1" stop-color="#16b7a7"/></linearGradient></defs><rect width="480" height="300" rx="24" fill="url(#g)"/><circle cx="385" cy="78" r="43" fill="#fff" fill-opacity=".45"/><text x="32" y="244" fill="#fff" font-family="Arial,sans-serif" font-size="28" font-weight="700">${title}</text></svg>`,
  )}`;

const createDemoAttachment = (): File[] =>
  typeof File === "undefined"
    ? []
    : [
        new File(
          ["PolyForm demo attachment"],
          "campaign-brief.txt",
          { type: "text/plain", lastModified: Date.now() },
        ),
      ];

const initialValues: DemoFormValues = {
  firstName: "Avery",
  email: "avery.morgan@example.com",
  phone: "+14155552671",
  password: "PolyForm!2026",
  employees: 42,
  startDate: new Date(2026, 3, 15),
  launchWindow: {
    dateTime: new Date(2026, 3, 21, 10, 30),
    timezone: "America/New_York",
  },
  status: "qualified",
  country: "United States",
  assignedAgentId: 101,
  company: "Northstar Labs",
  notes: "Interested in a product walkthrough and follow-up next week.",
  description:
    "<p>Avery's team is evaluating tools to improve their customer intake workflow.</p>",
  avatar: createDemoImage("Avery Morgan"),
  gallery: {
    "campaign.svg": createDemoImage("Campaign"),
    "team.svg": createDemoImage("Team"),
  },
  attachments: createDemoAttachment(),
  code: "SELECT id, first_name, email\nFROM leads\nWHERE status = 'qualified';",
  address: {
    streetAddress: "42 Market Street",
    streetAddress2: "Suite 240",
    streetAddress3: "",
    city: "San Francisco",
    state: "California",
    postalCode: "94103",
    country: "United States",
    addressType: "OFFICE",
    nameOnAddress: "Avery Morgan",
    emailOnAddress: "avery.morgan@example.com",
    phoneOnAddress: "+14155552671",
  },
  active: true,
  currency: "USD",
  emailOptIn: false,
  interests: ["sales", "marketing"],
  interestsRow: ["sales", "marketing"],
  radioChoice: false,
  preferredChannel: "email",
  preferredChannelRow: "email",
  leadLabels: [
    {
      labelId: 1,
      name: "Priority",
      description: "Needs prompt follow-up",
      color: "#E77A7A",
    },
    {
      labelId: 2,
      name: "Website",
      description: "Came through the website",
      color: "#84B6EB",
    },
  ],
  technologies: ["react", "typescript"],
  completion: 65,
  priceRange: [100, 400],
  starRating: 4.5,
  emojiMessage: "Thanks for reaching out! 👋",
  brandColor: "#3957d7",
  openingTime: new Date(2026, 3, 15, 9, 30),
  bookingWindow: { start: new Date(2026, 4, 1), end: new Date(2026, 4, 8) },
  metadata: [
    { key: "environment", value: "production" },
    { key: "retryLimit", value: "3" },
  ],
  selectableMetadata: [
    { key: "environment", value: "production" },
    { key: "region", value: "us-east" },
  ],
};

const App = (): JSX.Element => {
  const {
    control,
    setValue,
    trigger,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<DemoFormValues>({ defaultValues: initialValues });
  const [submittedValues, setSubmittedValues] = useState<DemoFormValues | null>(
    null,
  );
  const [isViewMode, setIsViewMode] = useState(false);
  const currentValues = watch();

  const formatSubmittedValues = (): string =>
    JSON.stringify(
      submittedValues,
      (_key, value: unknown) => {
        if (typeof File !== "undefined" && value instanceof File) {
          return {
            name: value.name,
            type: value.type,
            size: value.size,
            lastModified: value.lastModified,
          };
        }
        return value;
      },
      2,
    );



  return (
    <Container maxWidth="lg" className="demo-page">
      <Box className="demo-intro">
        <Typography variant="overline" color="primary">
          React Hook Form · Material UI
        </Typography>
        <Typography component="h1" variant="h3">
          PolyForm
        </Typography>
        <Typography color="text.secondary">
          Config driven forms with reusable controls and customizable layouts.
        </Typography>
      </Box>

      <DevicePreview label="PolyForm example">
        <Box
          component="form"
          className="demo-form"
          onSubmit={handleSubmit((values) => setSubmittedValues(values))}
          noValidate
        >
          <div className="demo-form__view-toggle">
            <div className="demo-form__view-toggle-copy">
              <strong>Form presentation</strong>
              <span>Switch between editable controls and a polished read-only summary.</span>
            </div>
            <FormControlLabel
              className="demo-form__view-toggle-control"
              control={
                <Switch
                  checked={isViewMode}
                  onChange={(event) => setIsViewMode(event.target.checked)}
                  color="primary"
                  inputProps={{ "aria-label": "Toggle form view mode" }}
                />
              }
              label={isViewMode ? "View mode" : "Edit mode"}
              labelPlacement="start"
            />
          </div>
          <PolyForm
            cards={showcaseCards}
            control={control}
            errors={errors}
            values={currentValues}
            isView={isViewMode}
            setValue={setValue}
            trigger={trigger}
            classNames={{
              card: "demo-form__card",
              cardTitle: "demo-form__card-title",
              cardSubtitle: "demo-form__card-subtitle",
              sectionTitle: "demo-form__section-title",
            }}
          />
          {!isViewMode && (
            <div className="demo-form__actions">
              <PolyFormTestFillButton className="demo-form__test-fill" />
              <Button type="submit" variant="contained" size="large">
                Submit
              </Button>
            </div>
          )}
          {submittedValues && (
            <Paper
              component="section"
              className="demo-form__result"
              elevation={0}
              aria-live="polite"
            >
              <Typography component="h2" variant="h6">
                Submitted form values
              </Typography>
              <pre>{formatSubmittedValues()}</pre>
            </Paper>
          )}
        </Box>
      </DevicePreview>
    </Container>
  );
};

export default App;
