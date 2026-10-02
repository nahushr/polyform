import { forwardRef, useCallback, useMemo } from "react";

import { type TextFieldProps } from "@/components/material-ui-component-wrappers";
import { AppAdapterDateFns } from "@/components/material-ui-component-wrappers/date-time";
import { AppDatePicker } from "@/components/material-ui-component-wrappers/date-time";
import { AppLocalizationProvider } from "@/components/material-ui-component-wrappers/date-time";
import { parseDateForInput } from "@/utils/dateTimeHelper";

import styles from "../../styles/FormInput.module.scss";

export interface DatePickerInputProps extends Omit<
  TextFieldProps,
  "value" | "onChange" | "variant" | "margin"
> {
  value: Date | string | null | undefined;
  onChange: (value: Date | null) => void;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  variant?: "outlined" | "filled" | "standard";
  margin?: "none" | "dense" | "normal";
  format?: string;
}

/**
 * Safely parse a date value from string, Date, or null/undefined
 */
export const parseDateValue = (
  val: Date | string | null | undefined,
): Date | null => parseDateForInput(val);

/**
 * DatePickerInput - A modern date picker built on @/components/material-ui-component-wrappers/date-time
 * Supports Date objects and string formats ("YYYY-MM-DD", ISO) seamlessly.
 */
const DatePickerInput = forwardRef<HTMLDivElement, DatePickerInputProps>(
  (
    {
      value,
      onChange,
      label = "Date",
      minDate,
      maxDate,
      variant = "filled",
      margin = "none",
      disabled = false,
      error = false,
      helperText,
      required = false,
      format = "MM/dd/yyyy",
      placeholder,
      ...props
    },
    ref,
  ) => {
    // Parse value to Date safely
    const currentDate = useMemo(() => parseDateValue(value), [value]);

    const handleDateChange = useCallback(
      (newDate: Date | null) => {
        if (!newDate || Number.isNaN(newDate.getTime())) {
          onChange(null);
        } else {
          onChange(newDate);
        }
      },
      [onChange],
    );

    return (
      <AppLocalizationProvider dateAdapter={AppAdapterDateFns}>
        <AppDatePicker
          ref={ref}
          label={label}
          value={currentDate}
          onChange={handleDateChange}
          disabled={disabled}
          minDate={minDate}
          maxDate={maxDate}
          format={format}
          slotProps={{
            textField: {
              variant,
              margin,
              fullWidth: true,
              required,
              error,
              helperText,
              placeholder,
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
    );
  },
);

DatePickerInput.displayName = "DatePickerInput";

export default DatePickerInput;
