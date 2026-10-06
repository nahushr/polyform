import type {
  FieldValues,
  Path,
  PathValue,
  UseFormSetValue,
  UseFormTrigger,
} from "react-hook-form";

import { FieldType } from "../../constants/appConstants";
import type { CurrencyOption } from "../../constants/currency";
import type { DateRangeValue, DateTimeValue } from "../form-input";
import type {
  FieldConfig,
  FormCardConfig,
  FieldOption,
} from "./PolyForm";
import type { PolyFormTestFillResult } from "./testFillRegistry";

const SKIP = Symbol("skip-test-value");
const names = ["Avery", "Jordan", "Morgan", "Riley"];
const surnames = ["Morgan", "Lee", "Patel", "Chen"];
const companies = ["Northstar Labs", "Juniper Works", "Brightline Studio"];

const randomFraction = (): number => {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.getRandomValues) return 0;

  const value = new Uint32Array(1);
  cryptoApi.getRandomValues(value);
  return (value[0] ?? 0) / 0x1_0000_0000;
};

const sample = <T,>(items: readonly T[]): T | undefined =>
  items.length ? items[Math.floor(randomFraction() * items.length)] : undefined;

const getFieldKey = (field: FieldConfig<FieldValues>): string =>
  String(field.name).split(".").at(-1)?.toLowerCase() ?? "field";

const getIdentity = (): { firstName: string; lastName: string; suffix: number } => ({
  firstName: sample(names) ?? "Avery",
  lastName: sample(surnames) ?? "Morgan",
  suffix: Math.floor(100 + randomFraction() * 900),
});

const getEmail = (firstName: string, lastName: string, suffix: number): string =>
  `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${suffix}@example.com`;

const makeSvgDataUrl = (title: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300" viewBox="0 0 480 300"><rect width="480" height="300" fill="#3957d7"/><circle cx="390" cy="76" r="38" fill="#ffffff" fill-opacity=".65"/><text x="32" y="246" fill="#ffffff" font-family="Arial,sans-serif" font-size="28" font-weight="700">${title}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const makeSampleFile = (name: string, type: string, content: string): File | undefined => {
  if (typeof File === "undefined") return undefined;
  return new File([content], name, { type, lastModified: Date.now() });
};

const getTextValue = (
  field: FieldConfig<FieldValues>,
  identity: ReturnType<typeof getIdentity>,
): string => {
  const key = getFieldKey(field);
  const email = getEmail(identity.firstName, identity.lastName, identity.suffix);

  if (["firstname", "givenname"].includes(key)) return identity.firstName;
  if (["lastname", "familyname", "surname"].includes(key)) return identity.lastName;
  if (["email", "loginname", "username"].includes(key)) return email;
  if (["phone", "fax", "phoneonaddress"].includes(key)) return "+14155552671";
  if (["website", "url"].includes(key)) return "https://example.com";
  if (["company", "organization"].includes(key)) return sample(companies) ?? companies[0];
  if (["title", "jobtitle"].includes(key)) return "Product Manager";
  if (["annualrevenue", "revenue"].includes(key)) return "$1M–$5M";
  if (["notes", "description", "message"].includes(key)) {
    return `Demo record ${identity.suffix}: interested in a product walkthrough and follow-up next week.`;
  }
  if (["streetaddress", "addressline1", "street"].includes(key)) {
    return `${identity.suffix} Market Street`;
  }
  if (["streetaddress2", "addressline2"].includes(key)) return "Suite 240";
  if (["postalcode", "zipcode", "zip"].includes(key)) return "94103";
  if (["nameonaddress"].includes(key)) return `${identity.firstName} ${identity.lastName}`;
  if (["emailonaddress"].includes(key)) return email;

  return field.placeholder?.trim() || `Sample ${field.label || key}`;
};

const pickOption = (options: readonly FieldOption[]): FieldOption | undefined =>
  sample(options);

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const fitDate = (date: Date, minDate?: Date, maxDate?: Date): Date => {
  const min = minDate && !Number.isNaN(minDate.getTime()) ? minDate : undefined;
  const max = maxDate && !Number.isNaN(maxDate.getTime()) ? maxDate : undefined;
  if (min && max && min > max) return new Date(max);
  if (min && date < min) return new Date(min);
  if (max && date > max) return new Date(max);
  return date;
};

const roundToStep = (value: number, min: number, step?: number | null): number => {
  if (!step || step <= 0) return value;
  return min + Math.round((value - min) / step) * step;
};

const getCurrency = (options?: CurrencyOption[]): string =>
  sample(options?.map(({ value }) => value) ?? []) ?? "USD";

const getSelectableKeyValue = (
  field: FieldConfig<FieldValues>,
): Array<{ key: string; value: string }> | typeof SKIP => {
  const keyOptions = field.keyOptions ?? [];
  const firstKey = sample(keyOptions);
  if (!firstKey) return SKIP;

  const valueOptions =
    field.valueOptionsByKey?.[String(firstKey.value)] ?? field.valueOptions ?? [];
  const firstValue = sample(valueOptions);
  if (!firstValue) return SKIP;

  return [{ key: String(firstKey.value), value: String(firstValue.value) }];
};

const normalizeCountryName = (country: string): string => {
  const aliases: Record<string, string> = {
    us: "United States",
    usa: "United States",
    "united states of america": "United States",
    in: "India",
    uk: "United Kingdom",
    gb: "United Kingdom",
  };
  return aliases[country.trim().toLowerCase()] ?? country.trim();
};

const getAddressTestValue = async (
  field: FieldConfig<FieldValues>,
  identity: ReturnType<typeof getIdentity>,
): Promise<Record<string, string>> => {
  const mapper = await import("../../utils/stateCityMapper");
  const countryNames = mapper.getAllCountries();
  const restrictedCountries = (field.allowedCountries ?? []).map(normalizeCountryName);
  const validCountries = restrictedCountries.length
    ? restrictedCountries.filter((country) => countryNames.includes(country))
    : countryNames;
  if (restrictedCountries.length && validCountries.length === 0) {
    throw new Error("No configured countries are available in the address dataset.");
  }
  const preferredCountry = validCountries.find((country) => country === "India")
    ?? validCountries.find((country) => country === "United States")
    ?? validCountries[0]
    ?? "India";

  const datasetStates = mapper.getStatesByCountry(preferredCountry);
  const statesForCountry = field.states?.length
    ? field.states.filter((state) => datasetStates.includes(state))
    : datasetStates;
  if (field.states?.length && statesForCountry.length === 0) {
    throw new Error("No configured states are available for the selected country.");
  }
  const preferredState = preferredCountry === "India" ? "Maharashtra" : "California";
  const statesWithConfiguredCities = field.cities?.length
    ? statesForCountry.filter((candidateState) => {
        const stateCities = mapper.getCitiesByState(candidateState, preferredCountry);
        return field.cities?.some((city) => stateCities.includes(city)) ?? false;
      })
    : [];
  const statePool = statesWithConfiguredCities.length
    ? statesWithConfiguredCities
    : statesForCountry;
  const state = statePool.includes(preferredState)
    ? preferredState
    : statePool[0] ?? "";
  if (!state) {
    throw new Error("No states are available for the selected country.");
  }

  const datasetCities = mapper.getCitiesByState(state, preferredCountry);
  const citiesForState = field.cities?.length
    ? field.cities.filter((city) => datasetCities.includes(city))
    : datasetCities;
  if (field.cities?.length && citiesForState.length === 0) {
    throw new Error("No configured cities are available for the selected state.");
  }
  const preferredCity = preferredCountry === "India" ? "Mumbai" : "San Francisco";
  const city = citiesForState.includes(preferredCity)
    ? preferredCity
    : citiesForState[0] ?? "";
  if (!city) {
    throw new Error("No cities are available for the selected state.");
  }

  return {
    streetAddress: `${identity.suffix} Market Street`,
    streetAddress2: "Suite 240",
    streetAddress3: "",
    city,
    state,
    postalCode: preferredCountry === "India" ? "400001" : "94103",
    country: preferredCountry,
    addressType: "OFFICE",
    nameOnAddress: `${identity.firstName} ${identity.lastName}`,
    emailOnAddress: getEmail(identity.firstName, identity.lastName, identity.suffix),
    phoneOnAddress: "+14155552671",
  };
};

const getTestValue = async (
  field: FieldConfig<FieldValues>,
  identity: ReturnType<typeof getIdentity>,
): Promise<unknown | typeof SKIP> => {
  const type = field.type ?? FieldType.Text;
  const today = new Date();

  // Resolve lazy/server-side dropdowns from their own data source. Never invent IDs.
  if (type === FieldType.LazyAutocomplete) {
    if (!field.fetchOptions) return SKIP;
    try {
      const result = await field.fetchOptions("", 0, field.lazyPageSize ?? 10);
      const validOptions = Array.isArray(result.options)
        ? result.options.filter(
            (option) =>
              option != null &&
              (typeof option.value === "string" ||
                typeof option.value === "number") &&
              String(option.value).length > 0 &&
              typeof option.label === "string" &&
              option.label.trim().length > 0,
          )
        : [];
      return sample(validOptions) ?? SKIP;
    } catch {
      return SKIP;
    }
  }

  if (typeof field.testValue === "function") {
    try {
      return (await field.testValue()) ?? SKIP;
    } catch {
      return SKIP;
    }
  }

  switch (type) {
    case FieldType.Text:
    case FieldType.Email:
    case FieldType.Phone:
    case FieldType.Password:
    case FieldType.Number:
    case FieldType.Textarea:
    case FieldType.RichText:
    case FieldType.Code:
    case FieldType.EmojiText:
      if (type === FieldType.Email) {
        return getEmail(identity.firstName, identity.lastName, identity.suffix);
      }
      if (type === FieldType.Phone) return "+14155552671";
      if (type === FieldType.Password) return `Demo!${identity.suffix}Poly`;
      if (type === FieldType.Number) return 42;
      if (type === FieldType.RichText) {
        return `<p>${identity.firstName} is interested in a product walkthrough and a follow-up next week.</p>`;
      }
      if (type === FieldType.Code) {
        switch (field.codeLanguage) {
          case "sql":
            return `SELECT id, email\nFROM leads\nWHERE status = 'qualified';`;
          case "python":
            return `def greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("${identity.firstName}"))`;
          case "json":
            return JSON.stringify({ name: identity.firstName, email: getEmail(identity.firstName, identity.lastName, identity.suffix) }, null, 2);
          case "html":
            return `<section><h1>Hello, ${identity.firstName}</h1></section>`;
          case "css":
            return `.profile {\n  color: #3957d7;\n}`;
          default:
            return `const lead = { name: "${identity.firstName}", email: "${getEmail(identity.firstName, identity.lastName, identity.suffix)}" };`;
        }
      }
      if (type === FieldType.EmojiText) return `Thanks for reaching out, ${identity.firstName}! 👋`;
      if (type === FieldType.Textarea) {
        return `Demo record ${identity.suffix}: follow up about a product walkthrough next week.`;
      }
      return getTextValue(field, identity);

    case FieldType.Date:
      return fitDate(addDays(today, 1), field.minDate, field.maxDate);
    case FieldType.DateRange: {
      const start = fitDate(addDays(today, 1), field.minDate, field.maxDate);
      const end = fitDate(addDays(start, 4), field.minDate, field.maxDate);
      return { start, end } satisfies DateRangeValue;
    }
    case FieldType.Time: {
      const time = new Date(today);
      time.setHours(10, 30, 0, 0);
      return fitDate(time, field.minTime, field.maxTime);
    }
    case FieldType.DateTime:
      return {
        dateTime: fitDate(addDays(today, 1), field.minDateTime, field.maxDateTime),
        timezone: "America/New_York",
      } satisfies DateTimeValue;
    case FieldType.Select:
    case FieldType.Autocomplete:
    case FieldType.RadioGroup: {
      const option = pickOption(field.options ?? []);
      return option?.value ?? SKIP;
    }
    case FieldType.Currency:
      return getCurrency(field.currencyOptions);
    case FieldType.Color:
      return sample(["#3957D7", "#10A99A", "#805AD5", "#E77A7A"]);
    case FieldType.Image:
      return makeSvgDataUrl(identity.firstName);
    case FieldType.MultipleImage: {
      const count = Math.min(2, field.maxFiles ?? 10);
      const images: Record<string, string> = {};
      for (let index = 0; index < count; index += 1) {
        images[`demo-image-${index + 1}.svg`] = makeSvgDataUrl(
          index === 0 ? "Campaign" : "Team",
        );
      }
      return images;
    }
    case FieldType.MultipleFile: {
      const firstFile = makeSampleFile(
        "demo-lead.txt",
        "text/plain",
        `Demo record ${identity.suffix} for ${identity.firstName} ${identity.lastName}.`,
      );
      const secondFile = makeSampleFile(
        "product-overview.csv",
        "text/csv",
        "feature,status\nReusable fields,ready\n",
      );
      return [firstFile, secondFile]
        .filter((file): file is File => Boolean(file))
        .slice(0, field.maxFiles ?? 10);
    }
    case FieldType.Checkbox:
    case FieldType.Switch:
    case FieldType.Radio:
      return true;
    case FieldType.MultiCheckbox:
    case FieldType.MultiSelect: {
      const values = (field.options ?? []).slice(0, 2).map((option) => option.value);
      return values.length ? values : SKIP;
    }
    case FieldType.LeadLabels: {
      const labels = (field.leadLabelOptions ?? []).slice(0, 2);
      return labels.length ? labels : SKIP;
    }
    case FieldType.Slider: {
      const min = field.sliderMin ?? 0;
      const max = field.sliderMax ?? 100;
      return roundToStep(min + (max - min) * 0.65, min, field.sliderStep);
    }
    case FieldType.RangeSlider: {
      const min = field.sliderMin ?? 0;
      const max = field.sliderMax ?? 100;
      return [
        roundToStep(min + (max - min) * 0.25, min, field.sliderStep),
        roundToStep(min + (max - min) * 0.75, min, field.sliderStep),
      ];
    }
    case FieldType.Rating: {
      const max = field.ratingMax ?? 5;
      const precision = field.ratingPrecision ?? 1;
      return Math.min(max, Math.max(precision, Math.round((max * 0.9) / precision) * precision));
    }
    case FieldType.KeyValue:
      return [
        { key: "environment", value: "demo" },
        { key: "retryLimit", value: "3" },
      ];
    case FieldType.KeyValueSelect:
      return getSelectableKeyValue(field);
    case FieldType.Address:
      try {
        return await getAddressTestValue(field, identity);
      } catch {
        return SKIP;
      }
    default:
      // Keep custom text-like controls useful when they introduce a new field type.
      return getTextValue(field, identity);
  }
};

export interface FillPolyFormTestDataOptions<TFieldValues extends FieldValues> {
  cards: Array<FormCardConfig<TFieldValues>>;
  setValue?: UseFormSetValue<TFieldValues>;
  trigger?: UseFormTrigger<TFieldValues>;
  disabled?: boolean;
  isView?: boolean;
  onLazyOption?: (name: string, option: { value: string | number; label: string }) => void;
}

export const fillPolyFormTestData = async <
  TFieldValues extends FieldValues,
>({
  cards,
  setValue,
  trigger,
  disabled = false,
  isView = false,
  onLazyOption,
}: FillPolyFormTestDataOptions<TFieldValues>): Promise<PolyFormTestFillResult> => {
  const fields = cards.flatMap((card) =>
    card.sections.flatMap((section) => section.fields),
  );
  if (
    fields.length > 0 &&
    !setValue &&
    fields.every((field) => !field.setValue)
  ) {
    return {
      filled: 0,
      skipped: fields.length,
      message: "Pass setValue to PolyForm to enable test data filling.",
    };
  }

  const identity = getIdentity();
  const prepared = await Promise.all(
    fields.map(async (field) => ({
      field,
      value: await getTestValue(
        field as unknown as FieldConfig<FieldValues>,
        identity,
      ),
    })),
  );

  let filled = 0;
  let skipped = 0;
  const changedNames: Path<TFieldValues>[] = [];

  prepared.forEach(({ field, value }) => {
    const setter = field.setValue ?? setValue;
    if (
      value === SKIP ||
      disabled ||
      isView ||
      field.disabled ||
      !setter
    ) {
      skipped += 1;
      return;
    }

    if (field.type === FieldType.LazyAutocomplete && typeof value === "object" && value) {
      onLazyOption?.(String(field.name), value as { value: string | number; label: string });
      setter(
        field.name,
        (value as { value: string | number }).value as PathValue<TFieldValues, Path<TFieldValues>>,
        { shouldDirty: true, shouldTouch: true, shouldValidate: true },
      );
    } else {
      if (field.type === FieldType.Address && typeof value === "object" && value) {
        const address = value as { state?: string };
        if (address.state) field.onStateChange?.(address.state);
      }
      if (field.type === FieldType.Image && typeof value === "string") {
        field.onImageChange?.(value);
      }
      setter(
        field.name,
        value as PathValue<TFieldValues, Path<TFieldValues>>,
        { shouldDirty: true, shouldTouch: true, shouldValidate: true },
      );
    }
    changedNames.push(field.name);
    filled += 1;
  });

  if (trigger && changedNames.length) await trigger(changedNames);
  return { filled, skipped };
};
