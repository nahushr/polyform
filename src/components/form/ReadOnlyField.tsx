import type { ReactNode } from "react";
import { format as formatDate, isValid } from "date-fns";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { get } from "react-hook-form";

import { FieldType } from "../../constants/appConstants";
import {
  CURRENCY_OPTIONS,
  type CurrencyOption,
} from "../../constants/currency";
import { getCountryCode } from "../../utils/stateCityMapper";
import type { FieldConfig, FieldOption } from "./PolyForm";
import type { LazyOption, LeadLabelOption } from "../form-input";
import styles from "./ReadOnlyField.module.scss";

type DataRecord = Record<string, unknown>;

export interface ReadOnlyFieldProps<TFieldValues extends DataRecord = DataRecord> {
  field: FieldConfig<TFieldValues>;
  value: unknown;
  values?: TFieldValues;
  lazyOption?: LazyOption;
}

const isRecord = (value: unknown): value is DataRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asString = (value: unknown): string => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return "";
};

const isEmpty = (value: unknown): boolean =>
  value == null ||
  (typeof value === "string" && value.trim() === "") ||
  (Array.isArray(value) && value.length === 0);

const displayDate = (value: unknown, pattern: string): string => {
  if (value == null || value === "") return "";
  if (!(value instanceof Date) && typeof value !== "string" && typeof value !== "number") {
    return asString(value);
  }
  const date = value instanceof Date ? value : new Date(value);
  if (!isValid(date)) return asString(value);
  try {
    return formatDate(date, pattern);
  } catch {
    return asString(value);
  }
};

const flagForCountry = (countryCode?: string): string => {
  if (!countryCode || !/^[a-z]{2}$/i.test(countryCode)) return "";
  return countryCode
    .toUpperCase()
    .split("")
    .map((character) =>
      String.fromCodePoint(127397 + (character.codePointAt(0) ?? 0)),
    )
    .join("");
};

const countryFlag = (country?: string): string => {
  const normalized = country?.trim();
  if (!normalized) return "";
  const code = /^[a-z]{2}$/i.test(normalized)
    ? normalized.toUpperCase()
    : getCountryCode(normalized);
  return flagForCountry(code);
};

const matchOption = (
  value: unknown,
  options: FieldOption[],
): FieldOption | undefined =>
  options.find((option) => String(option.value) === String(value));

const formatAmount = (amount: number, currency: CurrencyOption): string => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency.symbol}${amount.toLocaleString()}`;
  }
};

const findCurrencyOption = (
  code: string,
  customOptions?: CurrencyOption[],
): CurrencyOption | undefined => {
  const normalizedCode = code.trim().toUpperCase();
  return (
    customOptions?.find((option) => option.code.toUpperCase() === normalizedCode) ??
    CURRENCY_OPTIONS.find((option) => option.code === normalizedCode)
  );
};

const formatBytes = (size: number): string => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const PhoneValue = ({ value }: { value: unknown }) => {
  const phone = parsePhoneNumberFromString(String(value), "US");
  return (
    <span className={styles["phone-value"]}>
      {phone?.country && <span className={styles.flag}>{flagForCountry(phone.country)}</span>}
      <span>{phone?.formatInternational() ?? asString(value)}</span>
    </span>
  );
};

const cleanRichText = (value: string): string =>
  value
    .replace(/<(script|style)\b[^<>]{0,4096}>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])\s*>/gi, "\n")
    .replace(/<[^<>]{0,4096}>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]{1,4096}\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const Swatch = ({ color, large = false }: { color: string; large?: boolean }) => (
  <svg
    aria-hidden="true"
    className={large ? styles["color-swatch-large"] : styles["color-swatch"]}
    viewBox="0 0 24 24"
  >
    <rect x="1" y="1" width="22" height="22" rx="6" fill={color} />
  </svg>
);

const optionValue = (value: unknown, options: FieldOption[]): string => {
  if (Array.isArray(value)) return value.map((item) => optionValue(item, options)).join(", ");
  const option = matchOption(value, options);
  return option?.label ?? asString(value);
};

const imageSources = (value: unknown): string[] => {
  const isImageSource = (item: unknown): item is string => {
    if (typeof item !== "string" || !item.trim()) return false;
    const source = item.trim();
    if (/^(https?:\/\/|\/\/|blob:|data:image\/)/i.test(source)) return true;
    return !/^[a-z][a-z\d+.-]*:/i.test(source);
  };
  if (typeof value === "string") return isImageSource(value) ? [value] : [];
  if (Array.isArray(value)) return value.filter(isImageSource);
  if (isRecord(value)) return Object.values(value).filter(isImageSource);
  return [];
};

const ImageGallery = ({ sources, label }: { sources: string[]; label: string }) => (
  <div className={styles["image-gallery"]}>
    {sources.map((src, index) => (
      <div className={styles["image-tile"]} key={`${src}-${index}`}>
        <img src={src} alt={`${label || "Image"} ${index + 1}`} loading="lazy" />
      </div>
    ))}
  </div>
);

const Status = ({ value, positive = true }: { value: string; positive?: boolean }) => (
  <span className={`${styles.status} ${positive ? styles["status-positive"] : styles["status-neutral"]}`}>
    <span className={styles["status-dot"]} aria-hidden="true" />
    {value}
  </span>
);

const renderNumberValues = <TFieldValues extends DataRecord>(
  field: FieldConfig<TFieldValues>,
  value: unknown,
  values?: TFieldValues,
): ReactNode => {
  const unit = field.sliderUnit ?? "";
  const currencyCode = field.currencyFieldName && values
    ? String(get(values, field.currencyFieldName) ?? "")
    : "";
  const currency = currencyCode ? findCurrencyOption(currencyCode, field.currencyOptions) : undefined;
  const amounts = Array.isArray(value) ? value : [value];

  return (
    <span className={styles["number-values"]}>
      {currency && <span className={styles.flag}>{currency.flag}</span>}
      {amounts.map((amount, index) => {
        const numeric = typeof amount === "number" ? amount : Number(amount);
        let formatted = asString(amount);
        if (Number.isFinite(numeric)) {
          if (currency) formatted = formatAmount(numeric, currency);
          else if (["$", "€", "£", "¥", "₹", "₩", "₽"].includes(unit)) {
            formatted = `${unit}${numeric.toLocaleString()}`;
          } else formatted = `${numeric.toLocaleString()}${unit}`;
        }
        return <span className={styles["number-value"]} key={`${index}-${formatted}`}>{formatted}</span>;
      })}
    </span>
  );
};

const renderDateRange = (value: unknown, pattern: string): ReactNode => {
  const range = isRecord(value) ? value : {};
  const start = displayDate(range.start, pattern);
  const end = displayDate(range.end, pattern);
  return (
    <div className={styles["date-range"]}>
      <div><span>From</span><strong>{start || "Not set"}</strong></div>
      <span className={styles["range-arrow"]} aria-hidden="true">→</span>
      <div><span>To</span><strong>{end || "Not set"}</strong></div>
    </div>
  );
};

const renderBooleanStatus = (type: FieldType, value: unknown): ReactNode => {
  const enabled = Boolean(value);
  let label: string;
  if (type === FieldType.Switch) label = enabled ? "On" : "Off";
  else if (type === FieldType.Radio) label = enabled ? "Selected" : "Not selected";
  else label = enabled ? "Checked" : "Unchecked";
  return <Status value={label} positive={enabled} />;
};

const renderChoice = <TFieldValues extends DataRecord>(
  field: FieldConfig<TFieldValues>,
  value: unknown,
  label: string,
): ReactNode => {
  const selectedLabel = optionValue(value, field.options ?? []);
  if (!/country/i.test(`${String(field.name)} ${label}`)) return selectedLabel;
  const flag = countryFlag(selectedLabel);
  return flag
    ? <span className={styles["country-value"]}>{flag} {selectedLabel}</span>
    : selectedLabel;
};

const renderMultipleOptions = <TFieldValues extends DataRecord>(
  field: FieldConfig<TFieldValues>,
  value: unknown,
): ReactNode => {
  const selected = Array.isArray(value) ? value : [value];
  return (
    <div className={styles.chips}>
      {selected.map((item, index) => (
        <span className={styles.chip} key={`${String(item)}-${index}`}>
          {optionValue(item, field.options ?? [])}
        </span>
      ))}
    </div>
  );
};

const renderLeadLabels = <TFieldValues extends DataRecord>(
  field: FieldConfig<TFieldValues>,
  value: unknown,
): ReactNode => {
  const selected = Array.isArray(value) ? value : [value];
  const labels = selected.map((item) => {
    const selectedRecord = isRecord(item) ? item : undefined;
    const option = (field.leadLabelOptions ?? []).find((candidate) => {
      if (selectedRecord) {
        return (candidate.labelId != null && candidate.labelId === selectedRecord.labelId)
          || candidate.name === selectedRecord.name;
      }
      return String(candidate.labelId) === String(item) || candidate.name === String(item);
    });
    return (selectedRecord ?? option) as LeadLabelOption | undefined;
  });
  return (
    <div className={styles.chips}>
      {labels.map((item, index) => item && (
        <span className={styles["label-chip"]} key={`${item.labelId ?? item.name}-${index}`}>
          {item.color && <Swatch color={item.color} />}
          <span>{item.name ?? String(value)}</span>
        </span>
      ))}
    </div>
  );
};

const renderAddress = (value: unknown): ReactNode => {
  const address = isRecord(value) ? value : {};
  const streetLines = [address.streetAddress, address.streetAddress2, address.streetAddress3]
    .map(asString)
    .filter(Boolean);
  const locality = [address.city, address.state].map(asString).filter(Boolean).join(", ");
  const regionLine = [locality, asString(address.postalCode)].filter(Boolean).join("  ·  ");
  const country = asString(address.country);
  const addressType = asString(address.addressType);
  const additional: Array<[string, unknown]> = [
    ["Contact", address.nameOnAddress],
    ["Email", address.emailOnAddress],
    ["Phone", address.phoneOnAddress],
  ].filter((item): item is [string, unknown] => Boolean(asString(item[1])));
  if (!streetLines.length && !regionLine && !country && !addressType && !additional.length) {
    return <span className={styles["empty-value"]}>Not provided</span>;
  }
  return (
    <div className={styles["address-card"]}>
      {addressType && <span className={styles["address-type"]}>{addressType}</span>}
      <div className={styles["address-lines"]}>
        {streetLines.map((line, index) => <strong key={`${line}-${index}`}>{line}</strong>)}
        {regionLine && <span>{regionLine}</span>}
        {country && <span className={styles["country-value"]}>{countryFlag(country)} {country}</span>}
      </div>
      {additional.length > 0 && (
        <div className={styles["address-contact"]}>
          {additional.map(([title, item]) => (
            <span key={title}>
              <small>{title}</small>
              {title === "Phone" ? <PhoneValue value={item} /> : asString(item)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const renderFiles = (value: unknown): ReactNode => {
  let files: unknown[] = [];
  if (Array.isArray(value)) files = value;
  else if (typeof FileList !== "undefined" && value instanceof FileList) files = Array.from(value);
  return (
    <div className={styles["file-list"]}>
      {files.map((file, index) => {
        const fileRecord = isRecord(file) ? file : undefined;
        const fileObject = typeof File !== "undefined" && file instanceof File;
        const fileName = fileObject ? file.name : asString(fileRecord?.name) || `File ${index + 1}`;
        const fileSize = fileObject ? file.size : Number(fileRecord?.size);
        const fileType = fileObject ? file.type : asString(fileRecord?.type);
        const details = [fileType, Number.isFinite(fileSize) && fileSize > 0 ? formatBytes(fileSize) : ""]
          .filter(Boolean).join(" · ") || "Attachment";
        return (
          <div className={styles["file-item"]} key={`${fileName}-${index}`}>
            <span className={styles["file-icon"]} aria-hidden="true">↗</span>
            <span className={styles["file-description"]}>
              <strong>{fileName}</strong><small>{details}</small>
            </span>
          </div>
        );
      })}
    </div>
  );
};

const renderRating = (value: unknown, maximum: number): ReactNode => {
  const rating = Number(value);
  return (
    <span className={styles.rating} aria-label={`${rating} out of ${maximum} stars`}>
      <span className={styles["rating-stars"]} aria-hidden="true">
        {Array.from({ length: maximum }, (_, index) => {
          const starNumber = index + 1;
          let className = styles["rating-star-empty"];
          if (starNumber <= rating) className = styles["rating-star-filled"];
          else if (starNumber - rating < 1) className = styles["rating-star-half"];
          return <span className={className} key={starNumber}>★</span>;
        })}
      </span>
      <strong>{rating.toLocaleString()}</strong><small> / {maximum}</small>
    </span>
  );
};

const renderMetadata = <TFieldValues extends DataRecord>(
  field: FieldConfig<TFieldValues>,
  value: unknown,
): ReactNode => {
  const isSelect = field.type === FieldType.KeyValueSelect;
  const entries = Array.isArray(value) ? value.filter(isRecord) : [];
  const resolve = (item: unknown, candidates: FieldOption[]): string =>
    candidates.find((option) => String(option.value) === String(item))?.label ?? asString(item);
  return (
    <div className={styles["metadata-list"]}>
      {entries.map((entry, index) => {
        const key = isSelect ? resolve(entry.key, field.keyOptions ?? []) : asString(entry.key);
        const candidates = field.valueOptionsByKey?.[String(entry.key)] ?? field.valueOptions ?? [];
        const entryValue = isSelect ? resolve(entry.value, candidates) : asString(entry.value);
        return (
          <div className={styles["metadata-row"]} key={`${key}-${index}`}>
            <strong>{key}</strong><span>{entryValue}</span>
          </div>
        );
      })}
    </div>
  );
};

const renderArrayValue = (value: unknown[]): ReactNode => (
  <div className={styles.chips}>
    {value.map((item, index) => {
      const record = isRecord(item) ? item : undefined;
      const itemLabel = record
        ? asString(record.label ?? record.name ?? record.value ?? record.id)
        : asString(item);
      const color = record ? asString(record.color) : "";
      return (
        <span className={color ? styles["label-chip"] : styles.chip} key={`${itemLabel}-${index}`}>
          {color && <Swatch color={color} />}{itemLabel || "Item"}
        </span>
      );
    })}
  </div>
);

const renderReadOnlyContent = <TFieldValues extends DataRecord>(
  field: FieldConfig<TFieldValues>,
  value: unknown,
  values?: TFieldValues,
  lazyOption?: LazyOption,
): ReactNode => {
  const { label = "", type = FieldType.Text } = field;
  if (field.viewContent) return field.viewContent(value, values);
  if (isEmpty(value)) return <span className={styles["empty-value"]}>Not provided</span>;

  switch (type) {
    case FieldType.Phone: return <PhoneValue value={value} />;
    case FieldType.Password: return <span className={styles["masked-value"]}>••••••••</span>;
    case FieldType.Currency: {
      const currency = findCurrencyOption(String(value), field.currencyOptions);
      return currency ? (
        <span className={styles["currency-value"]}>
          <span className={styles.flag}>{currency.flag}</span><strong>{currency.symbol}</strong>
          <span>{currency.name}</span><span className={styles["value-code"]}>{currency.code}</span>
        </span>
      ) : asString(value);
    }
    case FieldType.Number:
    case FieldType.Slider:
    case FieldType.RangeSlider: return renderNumberValues(field, value, values);
    case FieldType.Date: return displayDate(value, field.dateFormat ?? "MMM d, yyyy");
    case FieldType.DateRange: return renderDateRange(value, field.dateFormat ?? "MMM d, yyyy");
    case FieldType.DateTime: {
      const dateTime = isRecord(value) ? value : {};
      const timezone = asString(dateTime.timezone);
      return (
        <div className={styles["date-time-value"]}>
          <strong>{displayDate(dateTime.dateTime, "EEEE, MMM d, yyyy 'at' h:mm a") || "Not set"}</strong>
          {timezone && <span>{timezone.replace(/_/g, " ")}</span>}
        </div>
      );
    }
    case FieldType.Time: return displayDate(value, field.timeFormat ?? "h:mm a");
    case FieldType.Select:
    case FieldType.Autocomplete: return renderChoice(field, value, label);
    case FieldType.LazyAutocomplete: {
      const option = lazyOption ?? field.initialOption;
      return option && String(option.value) === String(value) ? option.label : asString(value);
    }
    case FieldType.Checkbox:
    case FieldType.Switch:
    case FieldType.Radio: return renderBooleanStatus(type, value);
    case FieldType.MultiCheckbox:
    case FieldType.MultiSelect: return renderMultipleOptions(field, value);
    case FieldType.RadioGroup:
      return <span className={styles["selected-option"]}>{optionValue(value, field.options ?? [])}</span>;
    case FieldType.LeadLabels: return renderLeadLabels(field, value);
    case FieldType.Address: return renderAddress(value);
    case FieldType.Image:
    case FieldType.MultipleImage: {
      const sources = imageSources(value);
      return sources.length ? <ImageGallery sources={sources} label={label} />
        : <span className={styles["empty-value"]}>No images</span>;
    }
    case FieldType.MultipleFile: return renderFiles(value);
    case FieldType.Code:
      return (
        <div className={styles["code-card"]}>
          <span className={styles["value-code"]}>{String(field.codeLanguage ?? "text").toUpperCase()}</span>
          <pre><code>{asString(value)}</code></pre>
        </div>
      );
    case FieldType.Rating: return renderRating(value, field.ratingMax ?? 5);
    case FieldType.Color: {
      const color = asString(value);
      return <span className={styles["color-value"]}><Swatch color={color} large /><code>{color}</code></span>;
    }
    case FieldType.KeyValue:
    case FieldType.KeyValueSelect: return renderMetadata(field, value);
    case FieldType.EmojiText:
    case FieldType.Textarea: return <div className={styles["multiline-value"]}>{asString(value)}</div>;
    case FieldType.RichText: {
      const text = cleanRichText(asString(value));
      return <div className={styles["multiline-value"]}>{text || "Not provided"}</div>;
    }
    default:
      return Array.isArray(value) ? renderArrayValue(value)
        : asString(value) || (isRecord(value) ? JSON.stringify(value, null, 2) : "");
  }
};

const ReadOnlyField = <TFieldValues extends DataRecord = DataRecord>({
  field,
  value,
  values,
  lazyOption,
}: ReadOnlyFieldProps<TFieldValues>): JSX.Element => {
  const label = field.label ?? "";
  const name = field.name;
  const type = field.type ?? FieldType.Text;
  const content = renderReadOnlyContent(field, value, values, lazyOption);

  return (
    <div className={styles["read-only-field"]} data-field-type={type}>
      {label && <div className={styles["field-label"]}>{label}</div>}
      <div className={styles["field-value"]} aria-label={label || String(name)}>{content}</div>
    </div>
  );
};

export default ReadOnlyField;
