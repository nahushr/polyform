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
  const date = value instanceof Date ? value : new Date(String(value));
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
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])\s*>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/[ \t]+\n/g, "\n")
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

const ReadOnlyField = <TFieldValues extends DataRecord = DataRecord>({
  field,
  value,
  values,
  lazyOption,
}: ReadOnlyFieldProps<TFieldValues>): JSX.Element => {
  const {
    label = "",
    name,
    type = FieldType.Text,
    options = [],
    leadLabelOptions = [],
    dateFormat = "MMM d, yyyy",
    timeFormat = "h:mm a",
    sliderUnit = "",
    ratingMax = 5,
    codeLanguage = "text",
    currencyFieldName,
    viewContent,
  } = field;

  const empty = isEmpty(value);
  let content: ReactNode;

  if (viewContent) {
    content = viewContent(value, values);
  } else if (empty) {
    content = <span className={styles["empty-value"]}>Not provided</span>;
  } else {
    switch (type) {
      case FieldType.Phone: {
        content = <PhoneValue value={value} />;
        break;
      }
      case FieldType.Password:
        content = <span className={styles["masked-value"]}>••••••••</span>;
        break;
      case FieldType.Currency: {
        const currency = findCurrencyOption(String(value), field.currencyOptions);
        content = currency ? (
          <span className={styles["currency-value"]}>
            <span className={styles.flag}>{currency.flag}</span>
            <strong>{currency.symbol}</strong>
            <span>{currency.name}</span>
            <span className={styles["value-code"]}>{currency.code}</span>
          </span>
        ) : asString(value);
        break;
      }
      case FieldType.Number:
      case FieldType.Slider:
      case FieldType.RangeSlider: {
        const currencyCode = currencyFieldName && values
          ? String(get(values, currencyFieldName) ?? "")
          : "";
        const currency = currencyCode ? findCurrencyOption(currencyCode, field.currencyOptions) : undefined;
        const amounts = Array.isArray(value) ? value : [value];
        content = (
          <span className={styles["number-values"]}>
            {currency && <span className={styles.flag}>{currency.flag}</span>}
            {amounts.map((amount, index) => {
              const numeric = typeof amount === "number" ? amount : Number(amount);
              const formatted = Number.isFinite(numeric)
                ? currency
                  ? formatAmount(numeric, currency)
                  : ["$", "€", "£", "¥", "₹", "₩", "₽"].includes(sliderUnit)
                    ? `${sliderUnit}${numeric.toLocaleString()}`
                    : `${numeric.toLocaleString()}${sliderUnit}`
                : asString(amount);
              return (
                <span className={styles["number-value"]} key={`${index}-${formatted}`}>
                  {formatted}
                </span>
              );
            })}
          </span>
        );
        break;
      }
      case FieldType.Date:
        content = displayDate(value, dateFormat);
        break;
      case FieldType.DateRange: {
        const range = isRecord(value) ? value : {};
        const start = displayDate(range.start, dateFormat);
        const end = displayDate(range.end, dateFormat);
        content = (
          <div className={styles["date-range"]}>
            <div><span>From</span><strong>{start || "Not set"}</strong></div>
            <span className={styles["range-arrow"]} aria-hidden="true">→</span>
            <div><span>To</span><strong>{end || "Not set"}</strong></div>
          </div>
        );
        break;
      }
      case FieldType.DateTime: {
        const dateTime = isRecord(value) ? value : {};
        const timezone = asString(dateTime.timezone);
        content = (
          <div className={styles["date-time-value"]}>
            <strong>{displayDate(dateTime.dateTime, "EEEE, MMM d, yyyy 'at' h:mm a") || "Not set"}</strong>
            {timezone && <span>{timezone.replace(/_/g, " ")}</span>}
          </div>
        );
        break;
      }
      case FieldType.Time:
        content = displayDate(value, timeFormat);
        break;
      case FieldType.Select:
      case FieldType.Autocomplete: {
        const selectedLabel = optionValue(value, options);
        const flag = /country/i.test(`${String(name)} ${label}`)
          ? countryFlag(selectedLabel)
          : "";
        content = flag
          ? <span className={styles["country-value"]}>{flag} {selectedLabel}</span>
          : selectedLabel;
        break;
      }
      case FieldType.LazyAutocomplete: {
        const option = lazyOption ?? field.initialOption;
        content = option && String(option.value) === String(value)
          ? option.label
          : asString(value);
        break;
      }
      case FieldType.Checkbox:
      case FieldType.Switch:
      case FieldType.Radio: {
        const enabled = Boolean(value);
        const statusLabel = type === FieldType.Switch
          ? enabled ? "On" : "Off"
          : type === FieldType.Radio
            ? enabled ? "Selected" : "Not selected"
            : enabled ? "Checked" : "Unchecked";
        content = <Status value={statusLabel} positive={enabled} />;
        break;
      }
      case FieldType.MultiCheckbox:
      case FieldType.MultiSelect: {
        const selected = Array.isArray(value) ? value : [value];
        content = (
          <div className={styles.chips}>
            {selected.map((item, index) => (
              <span className={styles.chip} key={`${String(item)}-${index}`}>
                {optionValue(item, options)}
              </span>
            ))}
          </div>
        );
        break;
      }
      case FieldType.RadioGroup:
        content = <span className={styles["selected-option"]}>{optionValue(value, options)}</span>;
        break;
      case FieldType.LeadLabels: {
        const selected = Array.isArray(value) ? value : [value];
        const labels = selected.map((item) => {
          const selectedRecord = isRecord(item) ? item : undefined;
          const option = leadLabelOptions.find((candidate) =>
            selectedRecord
              ? (candidate.labelId != null && candidate.labelId === selectedRecord.labelId) || candidate.name === selectedRecord.name
              : String(candidate.labelId) === String(item) || candidate.name === String(item),
          );
          return (selectedRecord ?? option) as LeadLabelOption | undefined;
        });
        content = (
          <div className={styles.chips}>
            {labels.map((item, index) => item && (
              <span className={styles["label-chip"]} key={`${item.labelId ?? item.name}-${index}`}>
                {item.color && <Swatch color={item.color} />}
                <span>{item.name ?? String(value)}</span>
              </span>
            ))}
          </div>
        );
        break;
      }
      case FieldType.Address: {
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
        content = !streetLines.length && !regionLine && !country && !addressType && !additional.length
          ? <span className={styles["empty-value"]}>Not provided</span>
          : (
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
        break;
      }
      case FieldType.Image:
      case FieldType.MultipleImage: {
        const sources = imageSources(value);
        content = sources.length > 0
          ? <ImageGallery sources={sources} label={label} />
          : <span className={styles["empty-value"]}>No images</span>;
        break;
      }
      case FieldType.MultipleFile: {
        const files = Array.isArray(value)
          ? value
          : typeof FileList !== "undefined" && value instanceof FileList
            ? Array.from(value)
            : [];
        content = (
          <div className={styles["file-list"]}>
            {files.map((file, index) => {
              const fileRecord = isRecord(file) ? file : undefined;
              const fileObject = typeof File !== "undefined" && file instanceof File;
              const fileName = fileObject ? file.name : asString(fileRecord?.name) || `File ${index + 1}`;
              const fileSize = fileObject ? file.size : Number(fileRecord?.size);
              const fileType = fileObject ? file.type : asString(fileRecord?.type);
              return (
                <div className={styles["file-item"]} key={`${fileName}-${index}`}>
                  <span className={styles["file-icon"]} aria-hidden="true">↗</span>
                  <span className={styles["file-description"]}>
                    <strong>{fileName}</strong>
                    <small>{[fileType, Number.isFinite(fileSize) && fileSize > 0 ? formatBytes(fileSize) : ""]
                      .filter(Boolean).join(" · ") || "Attachment"}</small>
                  </span>
                </div>
              );
            })}
          </div>
        );
        break;
      }
      case FieldType.Code:
        content = (
          <div className={styles["code-card"]}>
            <span className={styles["value-code"]}>{String(codeLanguage).toUpperCase()}</span>
            <pre><code>{asString(value)}</code></pre>
          </div>
        );
        break;
      case FieldType.Rating: {
        const rating = Number(value);
        content = (
          <span className={styles.rating} aria-label={`${rating} out of ${ratingMax} stars`}>
            <span className={styles["rating-stars"]} aria-hidden="true">
              {Array.from({ length: ratingMax }, (_, index) => {
                const starNumber = index + 1;
                const className = starNumber <= rating
                  ? styles["rating-star-filled"]
                  : starNumber - rating < 1
                    ? styles["rating-star-half"]
                    : styles["rating-star-empty"];
                return <span className={className} key={starNumber}>★</span>;
              })}
            </span>
            <strong>{rating.toLocaleString()}</strong><small> / {ratingMax}</small>
          </span>
        );
        break;
      }
      case FieldType.Color: {
        const color = asString(value);
        content = <span className={styles["color-value"]}><Swatch color={color} large /><code>{color}</code></span>;
        break;
      }
      case FieldType.KeyValue:
      case FieldType.KeyValueSelect: {
        const entries = Array.isArray(value) ? value.filter(isRecord) : [];
        const resolve = (item: unknown, candidates: FieldOption[]): string =>
          candidates.find((option) => String(option.value) === String(item))?.label ?? asString(item);
        content = (
          <div className={styles["metadata-list"]}>
            {entries.map((entry, index) => (
              <div className={styles["metadata-row"]} key={`${String(entry.key)}-${index}`}>
                <strong>{type === FieldType.KeyValueSelect ? resolve(entry.key, field.keyOptions ?? []) : asString(entry.key)}</strong>
                <span>{type === FieldType.KeyValueSelect
                  ? resolve(entry.value, field.valueOptionsByKey?.[String(entry.key)] ?? field.valueOptions ?? [])
                  : asString(entry.value)}</span>
              </div>
            ))}
          </div>
        );
        break;
      }
      case FieldType.EmojiText:
      case FieldType.Textarea:
        content = <div className={styles["multiline-value"]}>{asString(value)}</div>;
        break;
      case FieldType.RichText: {
        const text = cleanRichText(String(value));
        content = <div className={styles["multiline-value"]}>{text || "Not provided"}</div>;
        break;
      }
      default:
        content = Array.isArray(value)
          ? (
            <div className={styles.chips}>
              {value.map((item, index) => {
                const record = isRecord(item) ? item : undefined;
                const itemLabel = record
                  ? asString(record.label ?? record.name ?? record.value ?? record.id)
                  : asString(item);
                const color = record ? asString(record.color) : "";
                return (
                  <span className={color ? styles["label-chip"] : styles.chip} key={`${itemLabel}-${index}`}>
                    {color && <Swatch color={color} />}
                    {itemLabel || "Item"}
                  </span>
                );
              })}
            </div>
          )
          : asString(value) || (isRecord(value) ? JSON.stringify(value, null, 2) : "");
    }
  }

  return (
    <div className={styles["read-only-field"]} role="group" aria-label={label || String(name)} data-field-type={type}>
      {label && <div className={styles["field-label"]}>{label}</div>}
      <div className={styles["field-value"]}>{content}</div>
    </div>
  );
};

export default ReadOnlyField;
