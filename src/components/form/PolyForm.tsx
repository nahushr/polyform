import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ComponentType,
  type ReactNode,
} from "react";

import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldErrors,
  type FieldValues,
  type Path,
  type UseFormSetValue,
  type UseFormTrigger,
  get,
} from "react-hook-form";

import {
  AppBox,
  AppDivider,
  AppFormControlLabel,
  AppGrid,
  AppPaper,
  AppSwitch,
  AppTypography,
} from "@/components/material-ui-component-wrappers";

import { FieldType } from "../../constants/appConstants";
import type { CurrencyOption } from "../../constants/currency";
import type { AddressFormControllerProps } from "./AddressFormController";
import { isRecord } from "../../utils/typeGuards";
import {
  AutocompleteInput,
  CheckboxGroupInput,
  CheckboxInput,
  ColorPickerInput,
  CurrencyInput,
  DatePickerInput,
  DateRangePickerInput,
  DateTimePickerInput,
  EmailInput,
  EmojiTextInput,
  ImageUploadInput,
  KeyValueInput,
  KeyValueSelectInput,
  LazyAutocompleteInput,
  LeadLabels,
  MultipleFileUploadInput,
  MultipleImageUploadInput,
  MultiSelectInput,
  PasswordInput,
  PhoneInput,
  RadioGroupInput,
  RadioInput,
  RatingInput,
  SelectInput,
  SliderInput,
  TimePickerInput,
  TextFieldInput,
  type DateRangeValue,
  type DateTimeValue,
  type CodeLanguage,
  type KeyValueEntry,
  type KeyValueSelectOption,
  type LazyFetchFunction,
  type LazyOption,
  type LeadLabelOption,
  type SliderMark,
} from "../form-input";
import styles from "./PolyForm.module.scss";
import ReadOnlyField from "./ReadOnlyField";
import { registerPolyFormFillHandler } from "./testFillRegistry";
import { fillPolyFormTestData } from "./testFillData";

const LazyAddressFormController = lazy(
  () => import("./AddressFormController"),
) as unknown as ComponentType<AddressFormControllerProps<FieldValues>>;

export const AddressFormController = <TFieldValues extends FieldValues>(
  props: AddressFormControllerProps<TFieldValues>,
): JSX.Element => (
  <Suspense
    fallback={
      <AppGrid item xs={12} sm={12} className={styles["field-grid-item"]}>
        <AppBox className={styles["field-loading"]} role="status" />
      </AppGrid>
    }
  >
    <LazyAddressFormController
      {...(props as unknown as AddressFormControllerProps<FieldValues>)}
    />
  </Suspense>
);

export const RichTextEditor = lazy(() => import("./RichTextEditor"));
const LazyCodeEditorInput = lazy(() => import("../form-input/CodeEditorInput"));

export { FieldType };
export type { LazyFetchFunction, LazyOption };

/**
 * Option type for dropdowns/autocomplete
 */
export interface FieldOption {
  value: string | number;
  label: string;
}

/**
 * Configuration for a form field
 */
export interface FieldConfig<TFieldValues extends FieldValues = FieldValues> {
  name: Path<TFieldValues>;
  label?: string;
  type?: FieldType;
  required?: boolean;
  disabled?: boolean;
  gridSize?: {
    xs: number;
    sm: number;
  };
  // For autocomplete/dropdown fields
  options?: FieldOption[];
  // For the dedicated label picker
  leadLabelOptions?: LeadLabelOption[];
  // Lay out checkbox or radio group options on a single row
  row?: boolean;
  currencyOptions?: CurrencyOption[];
  sortOptions?: boolean;
  maxHeight?: number;
  // For lazy autocomplete fields
  fetchOptions?: LazyFetchFunction;
  lazyPageSize?: number;
  lazyDebounceMs?: number;
  initialOption?: LazyOption;
  // For textarea fields
  rows?: number;
  placeholder?: string;
  maxLength?: number;
  // For image upload fields
  maxSizeMB?: number;
  maxFiles?: number;
  accept?: string;
  onImageChange?: (value: string) => void;
  // For syntax-highlighted source fields
  codeLanguage?: CodeLanguage;
  // For address fields
  states?: string[];
  cities?: string[];
  allowedCountries?: string[];
  onStateChange?: (state: string) => void;
  setValue?: UseFormSetValue<TFieldValues>;
  trigger?: UseFormTrigger<TFieldValues>;
  // For switch fields
  switchLabel?: string;
  switchLabelPlacement?: "start" | "end" | "top" | "bottom";
  // For slider fields
  /** Optional path to a currency field used to format numeric values in view mode. */
  currencyFieldName?: Path<TFieldValues>;
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number | null;
  sliderMarks?: boolean | SliderMark[];
  sliderValueLabelDisplay?: "auto" | "on" | "off";
  sliderUnit?: string;
  // For rating fields
  ratingMax?: number;
  ratingPrecision?: number;
  // For date fields
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
  // For standalone time fields
  minTime?: Date;
  maxTime?: Date;
  timeFormat?: string;
  ampm?: boolean;
  minutesStep?: number;
  // For key/value fields
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  addButtonLabel?: string;
  keyOptions?: KeyValueSelectOption[];
  valueOptions?: KeyValueSelectOption[];
  valueOptionsByKey?: Record<string, KeyValueSelectOption[]>;
  // For datetime fields
  dateTimeLabel?: string;
  timezoneLabel?: string;
  dateTimeLayout?: "vertical" | "horizontal";
  minDateTime?: Date;
  maxDateTime?: Date;
  hideTimezone?: boolean;
  // For password fields
  autocomplete?: "current-password" | "new-password" | "off";
  modifyFieldProps?: (
    field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>,
  ) => ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  // For custom content (renders instead of standard field)
  customContent?: () => ReactNode;
  /** Optional custom read-only value renderer. */
  viewContent?: (value: unknown, values?: TFieldValues) => ReactNode;
  // Content rendered immediately below the standard field
  afterContent?: ReactNode;
  // Content rendered beside the standard field (for example, a field action)
  endContent?: ReactNode;
  /** Optional test value factory for custom fields used by the test-fill button. */
  testValue?: () => unknown;
}

/**
 * Configuration for a form section
 */
export interface SectionConfig<TFieldValues extends FieldValues = FieldValues> {
  title?: string;
  fields: Array<FieldConfig<TFieldValues>>;
  customContent?: ReactNode;
  headerAction?: ReactNode;
  afterContent?: ReactNode;
  className?: string;
  titleClassName?: string;
  dividerClassName?: string;
  dividerSpacerClassName?: string;
}

export interface FormCardConfig<TFieldValues extends FieldValues = FieldValues> {
  /** Stable identifier used as the React key when card content is duplicated. */
  id?: string;
  header?: ReactNode;
  subtitle?: ReactNode;
  sections: Array<SectionConfig<TFieldValues>>;
  headerAction?: ReactNode;
  customContent?: ReactNode;
  afterContent?: ReactNode;
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  dividerClassName?: string;
  titleTypography?: CardTypographyConfig;
  subtitleTypography?: CardTypographyConfig;
}

/** CSS typography values that can be set independently for each card heading. */
export interface CardTypographyConfig {
  fontStyle?: CSSProperties["fontStyle"];
  color?: CSSProperties["color"];
  fontSize?: CSSProperties["fontSize"];
  fontFamily?: CSSProperties["fontFamily"];
}

export interface PolyFormClassNames {
  root?: string;
  card?: string;
  cardHeader?: string;
  cardTitle?: string;
  cardSubtitle?: string;
  cardDivider?: string;
  section?: string;
  sectionHeader?: string;
  sectionTitle?: string;
  divider?: string;
  dividerSpacer?: string;
  fieldGridItem?: string;
}

export interface PolyFormProps<
  TFieldValues extends FieldValues = FieldValues,
> {
  cards: Array<FormCardConfig<TFieldValues>>;
  /** Required in edit mode; omit for a data-only read-only view. */
  control?: Control<TFieldValues>;
  errors?: FieldErrors<TFieldValues>;
  /** Form values used by the read-only view. When omitted, PolyForm reads each value from `control`. */
  values?: TFieldValues;
  disabled?: boolean;
  isView?: boolean;
  setValue?: UseFormSetValue<TFieldValues>;
  trigger?: UseFormTrigger<TFieldValues>;
  classNames?: PolyFormClassNames;
}

/**
 * PolyForm renders reusable form controls from card and section data.
 */
const getFieldError = <TFieldValues extends FieldValues>(
  errors: FieldErrors<TFieldValues> | undefined,
  path: Path<TFieldValues>,
): { message?: string } | undefined => {
  if (!errors) return undefined;
  const current = get(errors, path);
  if (!isRecord(current)) return undefined;
  const message = current.message;
  return typeof message === "string" ? { message } : undefined;
};

const joinClassNames = (...classNames: Array<string | undefined>): string =>
  classNames.filter(Boolean).join(" ");

export const PolyForm = <
  TFieldValues extends FieldValues = FieldValues,
>({
  cards,
  control,
  errors,
  values,
  disabled = false,
  isView = false,
  setValue: formSetValue,
  trigger: formTrigger,
  classNames = {},
}: PolyFormProps<TFieldValues>): JSX.Element => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [testFillLazyOptions, setTestFillLazyOptions] = useState<
    Record<string, LazyOption>
  >({});

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    return registerPolyFormFillHandler(root, () =>
      fillPolyFormTestData({
        cards,
        setValue: formSetValue,
        trigger: formTrigger,
        disabled,
        isView,
        onLazyOption: (name, option) => {
          setTestFillLazyOptions((current) => ({ ...current, [name]: option }));
        },
      }),
    );
  }, [cards, disabled, formSetValue, formTrigger, isView]);

  if (!isView && !control) {
    throw new Error("PolyForm requires React Hook Form's control prop in edit mode.");
  }
  if (isView && values === undefined && !control) {
    throw new Error("PolyForm view mode requires either values or React Hook Form's control prop.");
  }

  const formControl = control as Control<TFieldValues>;

  const renderField = (fieldConfig: FieldConfig<TFieldValues>): JSX.Element => {
    const {
      name,
      label = "",
      type = FieldType.Text,
      required = false,
      disabled: fieldDisabled = false,
      gridSize = {
        xs: 12,
        sm: 6,
      },
      options = [],
      leadLabelOptions = [],
      row = false,
      currencyOptions,
      sortOptions = false,
      maxHeight = undefined,
      fetchOptions,
      lazyPageSize = 10,
      lazyDebounceMs = 300,
      initialOption,
      rows = 4,
      placeholder,
      maxLength,
      maxSizeMB = 5,
      maxFiles = 10,
      accept,
      onImageChange,
      codeLanguage,
      states = [],
      cities = [],
      allowedCountries,
      onStateChange,
      setValue: fieldSetValue,
      trigger: fieldTrigger,
      switchLabel,
      switchLabelPlacement = "end",
      sliderMin = 0,
      sliderMax = 100,
      sliderStep = 1,
      sliderMarks = false,
      sliderValueLabelDisplay = "auto",
      sliderUnit = "",
      ratingMax = 5,
      ratingPrecision = 1,
      minDate,
      maxDate,
      dateFormat,
      minTime,
      maxTime,
      timeFormat,
      ampm,
      minutesStep,
      keyPlaceholder,
      valuePlaceholder,
      addButtonLabel,
      keyOptions = [],
      valueOptions = [],
      valueOptionsByKey,
      dateTimeLabel,
      timezoneLabel,
      dateTimeLayout,
      minDateTime,
      maxDateTime,
      hideTimezone,
      autocomplete,
      modifyFieldProps,
      customContent,
      afterContent,
      endContent,
    } = fieldConfig;

    const isFieldDisabled = disabled || fieldDisabled || isView;

    if (isView) {
      const fieldClassName = joinClassNames(
        styles["field-grid-item"],
        classNames.fieldGridItem,
      );
      const renderValue = (value: unknown): JSX.Element => (
        <AppGrid
          item
          xs={gridSize.xs}
          sm={gridSize.sm}
          key={name as string}
          className={fieldClassName}
        >
          <AppBox
            className={endContent ? styles["field-with-end-content"] : undefined}
          >
            <AppBox className={endContent ? styles["field-main"] : undefined}>
              <ReadOnlyField
                field={fieldConfig}
                value={value}
                values={values}
                lazyOption={testFillLazyOptions[String(name)]}
              />
            </AppBox>
            {endContent && (
              <AppBox className={styles["field-end"]}>{endContent}</AppBox>
            )}
          </AppBox>
          {afterContent}
        </AppGrid>
      );

      if (values !== undefined) {
        return renderValue(get(values, name));
      }

      return (
        <Controller
          name={name}
          control={formControl}
          render={({ field }) => renderValue(field.value)}
        />
      );
    }

    // If customContent is provided, render it directly
    if (customContent) {
      return (
        <AppGrid
          item
          xs={gridSize.xs}
          sm={gridSize.sm}
          key={name as string}
          className={joinClassNames(
            styles["field-grid-item"],
            classNames.fieldGridItem,
          )}
        >
          {customContent()}
        </AppGrid>
      );
    }

    // Address field - render full address form (returns multiple Grid items directly)
    if (type === FieldType.Address) {
      const addressSetValue = fieldSetValue ?? formSetValue;
      if (!addressSetValue) {
        throw new Error(
          "Address fields require PolyForm's setValue prop or a field-level setValue callback.",
        );
      }

      return (
        <AddressFormController
          key={name as string}
          name={name}
          control={formControl}
          errors={errors}
          disabled={isFieldDisabled}
          states={states}
          cities={cities}
          onStateChange={onStateChange}
          setValue={addressSetValue}
          trigger={fieldTrigger ?? formTrigger}
          allowedCountries={allowedCountries}
        />
      );
    }

    return (
      <AppGrid
        item
        xs={gridSize.xs}
        sm={gridSize.sm}
        key={name as string}
        className={joinClassNames(
          styles["field-grid-item"],
          classNames.fieldGridItem,
        )}
      >
        <AppBox
          className={endContent ? styles["field-with-end-content"] : undefined}
        >
          <AppBox className={endContent ? styles["field-main"] : undefined}>
            <Controller
              name={name}
              control={formControl}
              render={({ field }) => {
                const fieldError = getFieldError(errors, name);
                const fieldProps = modifyFieldProps
                  ? modifyFieldProps(field)
                  : field;

                switch (type) {
                  // Email field
                  case FieldType.Email: {
                  return (
                    <EmailInput
                      {...fieldProps}
                      label={label}
                      required={required}
                      disabled={isFieldDisabled}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                      placeholder={placeholder}
                    />
                  );
                  }

                  // Phone field
                  case FieldType.Phone: {
                  return (
                    <PhoneInput
                      {...fieldProps}
                      label={label}
                      required={required}
                      disabled={isFieldDisabled}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                      placeholder={placeholder}
                    />
                  );
                  }

                  // Select field
                  case FieldType.Select: {
                  return (
                    <SelectInput
                      {...fieldProps}
                      label={label}
                      required={required}
                      disabled={isFieldDisabled}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                      options={options}
                      placeholder={placeholder}
                    />
                  );
                  }

                  // Currency field with flag, symbol, and compact popover
                  case FieldType.Currency: {
                  return (
                    <CurrencyInput
                      {...fieldProps}
                      label={label}
                      required={required}
                      disabled={isFieldDisabled}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                      options={currencyOptions}
                    />
                  );
                  }

                  case FieldType.Color: {
                  return (
                    <ColorPickerInput
                      value={fieldProps.value as string | null | undefined}
                      onChange={fieldProps.onChange}
                      label={label}
                      disabled={isFieldDisabled}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                      required={required}
                    />
                  );
                  }

                  // Autocomplete/Dropdown field
                  case FieldType.Autocomplete: {
                  return (
                    <AutocompleteInput
                      {...fieldProps}
                      label={label}
                      required={required}
                      disabled={isFieldDisabled}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                      options={options}
                      sortOptions={sortOptions}
                      maxHeight={maxHeight}
                      placeholder={placeholder}
                    />
                  );
                  }

                  // Lazy Autocomplete field (server-side search with pagination)
                  case FieldType.LazyAutocomplete: {
                  if (!fetchOptions) {
                    throw new Error(
                      "LazyAutocomplete fields require fetchOptions to be provided in the field configuration.",
                    );
                  }

                  // Cast value to the expected type for LazyAutocomplete
                  const rawValue = fieldProps.value as
                    string | number | null | undefined;

                  return (
                    <LazyAutocompleteInput
                      label={label}
                      required={required}
                      disabled={isFieldDisabled}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                      fetchOptions={fetchOptions}
                      pageSize={lazyPageSize}
                      debounceMs={lazyDebounceMs}
                      maxHeight={maxHeight}
                      initialOption={testFillLazyOptions[String(name)] ?? initialOption}
                      value={rawValue ?? null}
                      onChange={(_event, newValue) => {
                        fieldProps.onChange(newValue?.value ?? "");
                      }}
                      placeholder={placeholder}
                    />
                  );
                  }

                  // Date field
                  case FieldType.Date: {
                  return (
                    <DatePickerInput
                      value={
                        fieldProps.value as Date | string | null | undefined
                      }
                      onChange={(newDate: Date | null) => {
                        if (!newDate) {
                          fieldProps.onChange(
                            typeof fieldProps.value === "string" ? "" : null,
                          );
                        } else if (typeof fieldProps.value === "string") {
                          const y = newDate.getFullYear();
                          const m = String(newDate.getMonth() + 1).padStart(
                            2,
                            "0",
                          );
                          const d = String(newDate.getDate()).padStart(2, "0");
                          fieldProps.onChange(`${y}-${m}-${d}`);
                        } else {
                          fieldProps.onChange(newDate);
                        }
                      }}
                      label={label}
                      required={required}
                      disabled={isFieldDisabled}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                      minDate={minDate}
                      maxDate={maxDate}
                      format={dateFormat ?? "MM/dd/yyyy"}
                      placeholder={placeholder}
                    />
                  );
                  }

                  case FieldType.DateRange: {
                  return (
                    <DateRangePickerInput
                      value={fieldProps.value as DateRangeValue | null | undefined}
                      onChange={fieldProps.onChange}
                      label={label}
                      required={required}
                      disabled={isFieldDisabled}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                      minDate={minDate}
                      maxDate={maxDate}
                      format={dateFormat ?? "MM/dd/yyyy"}
                    />
                  );
                  }

                  case FieldType.Time: {
                  return (
                    <TimePickerInput
                      value={fieldProps.value as Date | null | undefined}
                      onChange={fieldProps.onChange}
                      label={label}
                      required={required}
                      disabled={isFieldDisabled}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                      minTime={minTime}
                      maxTime={maxTime}
                      format={timeFormat}
                      ampm={ampm}
                      minutesStep={minutesStep}
                    />
                  );
                  }

                  // DateTime field with optional timezone
                  case FieldType.DateTime: {
                  const currentValue = fieldProps.value as DateTimeValue | null;
                  return (
                    <DateTimePickerInput
                      value={currentValue}
                      onChange={(newValue: DateTimeValue) => {
                        fieldProps.onChange(newValue);
                      }}
                      dateTimeLabel={dateTimeLabel ?? label}
                      timezoneLabel={timezoneLabel ?? "Timezone"}
                      layout={dateTimeLayout}
                      minDateTime={minDateTime}
                      maxDateTime={maxDateTime}
                      hideTimezone={hideTimezone}
                      required={required}
                      disabled={isFieldDisabled}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                    />
                  );
                  }

                  // Image Upload field
                  case FieldType.Image: {
                  return (
                    <ImageUploadInput
                      value={fieldProps.value as string}
                      onChange={(value: string) => {
                        fieldProps.onChange(value);
                        if (onImageChange) {
                          onImageChange(value);
                        }
                      }}
                      disabled={isFieldDisabled}
                      label={label}
                      required={required}
                      maxSizeMB={maxSizeMB}
                    />
                  );
                  }

                  // Multiple images with previews and per-image removal
                  case FieldType.MultipleImage: {
                  return (
                    <MultipleImageUploadInput
                      value={
                        (fieldProps.value as Record<string, string>) ?? {}
                      }
                      onChange={fieldProps.onChange}
                      disabled={isFieldDisabled}
                      maxFiles={maxFiles}
                      maxSizeMB={maxSizeMB}
                      accept={accept ?? "image/*"}
                      label={label}
                    />
                  );
                  }

                  // Multiple files with per-file removal
                  case FieldType.MultipleFile: {
                  return (
                    <MultipleFileUploadInput
                      value={(fieldProps.value as File[]) ?? []}
                      onChange={fieldProps.onChange}
                      label={label}
                      required={required}
                      disabled={isFieldDisabled}
                      accept={accept}
                      maxFiles={maxFiles}
                      maxSizeMB={maxSizeMB}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                    />
                  );
                  }

                  // Code field with a selectable syntax grammar
                  case FieldType.Code: {
                  return (
                    <Suspense
                      fallback={
                        <AppBox
                          className={styles["field-loading"]}
                          role="status"
                        />
                      }
                    >
                      <LazyCodeEditorInput
                        value={(fieldProps.value as string) ?? ""}
                        onChange={fieldProps.onChange}
                        label={label}
                        required={required}
                        disabled={isFieldDisabled}
                        error={!!fieldError}
                        helperText={fieldError?.message}
                        language={codeLanguage}
                        placeholder={placeholder}
                      />
                    </Suspense>
                  );
                  }

                  case FieldType.Checkbox: {
                  return (
                    <CheckboxInput
                      label={label}
                      checked={Boolean(fieldProps.value)}
                      onChange={fieldProps.onChange}
                      disabled={isFieldDisabled}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                    />
                  );
                  }

                  case FieldType.MultiCheckbox: {
                  return (
                    <CheckboxGroupInput
                      label={label}
                      required={required}
                      options={options}
                      value={
                        (fieldProps.value as Array<string | number>) ?? []
                      }
                      onChange={fieldProps.onChange}
                      disabled={isFieldDisabled}
                      row={row}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                    />
                  );
                  }

                  case FieldType.Radio: {
                  return (
                    <AppFormControlLabel
                      control={
                        <RadioInput
                          checked={Boolean(fieldProps.value)}
                          onChange={(event) =>
                            fieldProps.onChange(event.target.checked)
                          }
                          disabled={isFieldDisabled}
                          color={fieldError ? "error" : "primary"}
                        />
                      }
                      label={label}
                    />
                  );
                  }

                  case FieldType.RadioGroup: {
                  return (
                    <AppBox className={styles["choice-field"]}>
                      {label && (
                        <AppTypography variant="body2" component="div">
                          {label}{required ? " *" : ""}
                        </AppTypography>
                      )}
                      <RadioGroupInput
                        options={options}
                        value={fieldProps.value as string | number}
                        onChange={fieldProps.onChange}
                        disabled={isFieldDisabled}
                        row={row}
                      />
                      {fieldError?.message && (
                        <AppTypography color="error" variant="caption">
                          {fieldError.message}
                        </AppTypography>
                      )}
                    </AppBox>
                  );
                  }

                  case FieldType.MultiSelect: {
                  return (
                    <MultiSelectInput
                      options={options}
                      value={
                        (fieldProps.value as Array<string | number>) ?? []
                      }
                      onChange={fieldProps.onChange}
                      label={label}
                      placeholder={placeholder}
                      required={required}
                      disabled={isFieldDisabled}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                    />
                  );
                  }

                  case FieldType.Slider:
                  case FieldType.RangeSlider: {
                  return (
                    <SliderInput
                      label={label}
                      value={fieldProps.value as number | number[] | undefined}
                      onChange={(nextValue) => {
                        if (type === FieldType.RangeSlider) {
                          fieldProps.onChange(
                            Array.isArray(nextValue) ? nextValue : [nextValue, nextValue],
                          );
                        } else {
                          fieldProps.onChange(
                            Array.isArray(nextValue) ? nextValue[0] : nextValue,
                          );
                        }
                      }}
                      range={type === FieldType.RangeSlider}
                      min={sliderMin}
                      max={sliderMax}
                      step={sliderStep}
                      marks={sliderMarks}
                      valueLabelDisplay={sliderValueLabelDisplay}
                      unit={sliderUnit}
                      disabled={isFieldDisabled}
                      required={required}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                    />
                  );
                  }

                  case FieldType.Rating: {
                  return (
                    <RatingInput
                      label={label}
                      value={fieldProps.value as number | null | undefined}
                      onChange={fieldProps.onChange}
                      max={ratingMax}
                      precision={ratingPrecision}
                      disabled={isFieldDisabled}
                      required={required}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                    />
                  );
                  }

                  case FieldType.EmojiText: {
                  return (
                    <EmojiTextInput
                      label={label}
                      value={fieldProps.value as string | undefined}
                      onChange={fieldProps.onChange}
                      placeholder={placeholder}
                      maxLength={maxLength}
                      disabled={isFieldDisabled}
                      required={required}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                    />
                  );
                  }

                  case FieldType.KeyValue: {
                  return (
                    <KeyValueInput
                      label={label}
                      value={fieldProps.value as KeyValueEntry[] | undefined}
                      onChange={fieldProps.onChange}
                      disabled={isFieldDisabled}
                      required={required}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                      keyPlaceholder={keyPlaceholder}
                      valuePlaceholder={valuePlaceholder}
                      addButtonLabel={addButtonLabel}
                    />
                  );
                  }

                  case FieldType.KeyValueSelect: {
                  return (
                    <KeyValueSelectInput
                      label={label}
                      value={fieldProps.value as KeyValueEntry[] | undefined}
                      onChange={fieldProps.onChange}
                      keyOptions={keyOptions}
                      valueOptions={valueOptions}
                      valueOptionsByKey={valueOptionsByKey}
                      disabled={isFieldDisabled}
                      required={required}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                      keyPlaceholder={keyPlaceholder}
                      valuePlaceholder={valuePlaceholder}
                      addButtonLabel={addButtonLabel}
                    />
                  );
                  }

                  case FieldType.LeadLabels: {
                  return (
                    <LeadLabels
                      value={(fieldProps.value as LeadLabelOption[]) ?? []}
                      options={leadLabelOptions}
                      onChange={fieldProps.onChange}
                      label={label}
                      required={required}
                      disabled={isFieldDisabled}
                      readOnly={isView}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                    />
                  );
                  }

                  // Password field (with show/hide toggle)
                  case FieldType.Password: {
                  return (
                    <PasswordInput
                      {...fieldProps}
                      label={label}
                      required={required}
                      disabled={isFieldDisabled}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                      placeholder={placeholder}
                      autocomplete={autocomplete}
                    />
                  );
                  }

                  // Switch field (boolean toggle)
                  case FieldType.Switch: {
                  return (
                    <AppBox className={styles["switch-field"]}>
                      <AppFormControlLabel
                        control={
                          <AppSwitch
                            checked={Boolean(fieldProps.value)}
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>,
                            ) => {
                              fieldProps.onChange(event.target.checked);
                            }}
                            disabled={isFieldDisabled}
                            color="primary"
                          />
                        }
                        label={switchLabel || label}
                        labelPlacement={switchLabelPlacement}
                      />
                    </AppBox>
                  );
                  }

                  // RichText field (rich text editor)
                  case FieldType.RichText: {
                  return (
                    <Suspense
                      fallback={<AppBox className={styles["field-loading"]} role="status" />}
                    >
                      <RichTextEditor
                        label={label}
                        value={(fieldProps.value as string) ?? ""}
                        onChange={fieldProps.onChange}
                        disabled={isFieldDisabled}
                        error={!!fieldError}
                        helperText={fieldError?.message}
                        placeholder={placeholder}
                        required={required}
                      />
                    </Suspense>
                  );
                  }

                  // Textarea field (multi-line)
                  case FieldType.Textarea: {
                  return (
                    <TextFieldInput
                      {...fieldProps}
                      label={label}
                      required={required}
                      disabled={isFieldDisabled}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                      multiline
                      rows={rows}
                      placeholder={placeholder}
                      maxLength={maxLength}
                    />
                  );
                  }

                  // Default: Text and Number fields.
                  default: {
                    const isNumberField = type === FieldType.Number;
                    const displayValue = isNumberField &&
                      (fieldProps.value === 0 || fieldProps.value == null)
                      ? ""
                      : fieldProps.value ?? "";
                    return (
                  <TextFieldInput
                    {...fieldProps}
                    value={displayValue}
                    maxLength={maxLength}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (isNumberField) {
                        // Convert to number for number fields, or 0 if empty
                        const numVal = val === "" ? 0 : Number(val);
                        fieldProps.onChange(Number.isNaN(numVal) ? 0 : numVal);
                      } else {
                        fieldProps.onChange(val);
                      }
                    }}
                    type={type}
                    label={label}
                    required={required}
                    disabled={isFieldDisabled}
                    error={!!fieldError}
                    helperText={fieldError?.message}
                    placeholder={placeholder}
                  />
                    );
                  }
                }
              }}
            />
          </AppBox>
          {endContent && (
            <AppBox className={styles["field-end"]}>{endContent}</AppBox>
          )}
        </AppBox>
        {afterContent}
      </AppGrid>
    );
  };

  return (
    <AppBox
      ref={rootRef}
      data-polyform-root=""
      data-mode={isView ? "view" : "edit"}
      className={joinClassNames(styles.root, classNames.root)}
    >
      {cards.map((card, cardIndex) => (
        <AppPaper
          component="section"
          key={card.id ?? card.sections
            .flatMap((section) => section.fields.map((field) => String(field.name)))
            .join("|")}
          className={joinClassNames(
            styles["form-card"],
            classNames.card,
            card.className,
          )}
        >
          {(card.header || card.subtitle || card.headerAction) && (
            <>
              <AppBox
                className={joinClassNames(
                  styles["card-header"],
                  classNames.cardHeader,
                  card.headerClassName,
                )}
              >
                <AppBox className={styles["card-heading"]}>
                  {card.header && (
                    <AppTypography
                      component="h2"
                      variant="h6"
                      sx={card.titleTypography}
                      className={joinClassNames(
                        styles["card-title"],
                        classNames.cardTitle,
                        card.titleClassName,
                      )}
                    >
                      {card.header}
                    </AppTypography>
                  )}
                  {card.subtitle && (
                    <AppTypography
                      component="p"
                      variant="body2"
                      sx={card.subtitleTypography}
                      className={joinClassNames(
                        styles["card-subtitle"],
                        classNames.cardSubtitle,
                        card.subtitleClassName,
                      )}
                    >
                      {card.subtitle}
                    </AppTypography>
                  )}
                </AppBox>
                {card.headerAction}
              </AppBox>
              <AppDivider
                className={joinClassNames(
                  styles["card-divider"],
                  classNames.cardDivider,
                  card.dividerClassName,
                )}
              />
            </>
          )}

          {card.customContent}

          {card.sections.map((section, sectionIndex) => (
            <AppBox
              component="section"
              key={`polyform-section-${cardIndex}-${sectionIndex}`}
              className={joinClassNames(
                styles.section,
                classNames.section,
                section.className,
              )}
            >
              {section.title && (
                <>
                  <AppBox
                    className={joinClassNames(
                      styles["section-header"],
                      classNames.sectionHeader,
                    )}
                  >
                    <AppTypography
                      component="h3"
                      variant="subtitle1"
                      className={joinClassNames(
                        styles["section-title"],
                        classNames.sectionTitle,
                        section.titleClassName,
                      )}
                    >
                      {section.title}
                    </AppTypography>
                    {section.headerAction}
                  </AppBox>
                  <AppDivider
                    className={joinClassNames(
                      styles.divider,
                      classNames.divider,
                      section.dividerClassName,
                    )}
                  />
                  <AppBox
                    className={joinClassNames(
                      styles["divider-spacer"],
                      classNames.dividerSpacer,
                      section.dividerSpacerClassName,
                    )}
                  />
                </>
              )}

              {section.customContent}

              <AppGrid container spacing={2}>
                {section.fields.map((fieldConfig) => renderField(fieldConfig))}
              </AppGrid>
              {section.afterContent}
            </AppBox>
          ))}

          {card.afterContent}
        </AppPaper>
      ))}
    </AppBox>
  );
};

export default PolyForm;
