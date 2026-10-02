import { forwardRef, useCallback, useMemo } from "react";

import {
  AppAutocomplete,
  AppBox,
  AppTextField,
  type TextFieldProps,
} from "@/components/material-ui-component-wrappers";
import { AppAdapterDateFns } from "@/components/material-ui-component-wrappers/date-time";
import { AppDateTimePicker } from "@/components/material-ui-component-wrappers/date-time";
import { AppLocalizationProvider } from "@/components/material-ui-component-wrappers/date-time";

import { TIMEZONE_OPTIONS } from "../../constants/timezones";
import { DEFAULT_OPERATIONAL_TIMEZONE } from "../../constants/dateTimeConstants";
import styles from "../../styles/FormInput.module.scss";
import layoutStyles from "./DateTimePickerInput.module.scss";

// Kept as a compatibility export for consumers that imported this from form-input.
export { TIMEZONE_OPTIONS };

export type TimezoneValue = (typeof TIMEZONE_OPTIONS)[number]["value"] | string;

export interface DateTimeValue {
  dateTime: Date | null;
  timezone: string;
}

export interface DateTimePickerInputProps extends Omit<
  TextFieldProps,
  "value" | "onChange" | "variant" | "margin"
> {
  value: DateTimeValue | null;
  onChange: (value: DateTimeValue) => void;
  dateTimeLabel?: string;
  timezoneLabel?: string;
  minDateTime?: Date;
  maxDateTime?: Date;
  variant?: "outlined" | "filled" | "standard";
  margin?: "none" | "dense" | "normal";
  /** Arrange date/time and timezone controls in one responsive row. */
  layout?: "vertical" | "horizontal";
  /** Hide the timezone selector (defaults to false) */
  hideTimezone?: boolean;
}

/**
 * DateTimePickerInput - A combined date-time picker with timezone selection
 * Uses MUI X Date Pickers for the datetime picker and Autocomplete for timezone
 */
const DateTimePickerInput = forwardRef<
  HTMLDivElement,
  DateTimePickerInputProps
>(
  (
    {
      value,
      onChange,
      dateTimeLabel = "Date & Time",
      timezoneLabel = "Timezone",
      minDateTime,
      maxDateTime,
      variant = "filled",
      margin = "none",
      layout = "vertical",
      disabled = false,
      error = false,
      helperText,
      required = false,
      hideTimezone = false,
      ...props
    },
    ref,
  ) => {
    // Get current values or defaults
    const currentDateTime = value?.dateTime ?? null;
    const currentTimezone = value?.timezone ?? DEFAULT_OPERATIONAL_TIMEZONE;

    // Find the timezone option for the autocomplete
    const selectedTimezoneOption = useMemo(() => {
      const found = TIMEZONE_OPTIONS.find(
        (opt) => opt.value === currentTimezone,
      );
      return found ?? { value: currentTimezone, label: currentTimezone };
    }, [currentTimezone]);

    // Handle date-time change
    const handleDateTimeChange = useCallback(
      (newDateTime: Date | null) => {
        onChange({
          dateTime: newDateTime,
          timezone: currentTimezone,
        });
      },
      [onChange, currentTimezone],
    );

    // Handle timezone change
    const handleTimezoneChange = useCallback(
      (
        _event: React.SyntheticEvent,
        newValue: { value: string; label: string } | null,
      ) => {
        onChange({
          dateTime: currentDateTime,
          timezone: newValue?.value ?? DEFAULT_OPERATIONAL_TIMEZONE,
        });
      },
      [onChange, currentDateTime],
    );

    return (
      <AppBox
        ref={ref}
        className={
          layout === "horizontal"
            ? layoutStyles["date-time-horizontal"]
            : layoutStyles["date-time-vertical"]
        }
      >
        {/* DateTime Picker */}
        <AppLocalizationProvider dateAdapter={AppAdapterDateFns}>
          <AppDateTimePicker
            label={dateTimeLabel}
            value={currentDateTime}
            onChange={handleDateTimeChange}
            disabled={disabled}
            minDateTime={minDateTime}
            maxDateTime={maxDateTime}
            slotProps={{
              textField: {
                variant,
                margin,
                fullWidth: true,
                required,
                error,
                helperText,
                className: styles["filled-input"],
                InputLabelProps: {
                  shrink: true,
                },
                InputProps: {
                  disableUnderline: variant === "filled",
                },
                ...props,
              },
            }}
          />
        </AppLocalizationProvider>

        {/* Timezone Selector - only show if not hidden */}
        {!hideTimezone && (
          <AppAutocomplete
            value={selectedTimezoneOption}
            onChange={handleTimezoneChange}
            options={[...TIMEZONE_OPTIONS]}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, val) => option.value === val.value}
            disabled={disabled}
            disableClearable
            renderInput={(params) => (
              <AppTextField
                {...params}
                label={timezoneLabel}
                variant={variant}
                margin={margin}
                required={required}
                className={styles["filled-input"]}
                InputLabelProps={{
                  ...params.InputLabelProps,
                  shrink: true,
                }}
                InputProps={{
                  ...params.InputProps,
                  disableUnderline: variant === "filled",
                }}
              />
            )}
          />
        )}
      </AppBox>
    );
  },
);

DateTimePickerInput.displayName = "DateTimePickerInput";

export default DateTimePickerInput;
