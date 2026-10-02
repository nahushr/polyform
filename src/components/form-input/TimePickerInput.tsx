import { forwardRef } from "react";

import { type TextFieldProps } from "@/components/material-ui-component-wrappers";
import {
  AppAdapterDateFns,
  AppLocalizationProvider,
  AppTimePicker,
} from "@/components/material-ui-component-wrappers/date-time";

import styles from "../../styles/FormInput.module.scss";
import layoutStyles from "./TimePickerInput.module.scss";

export interface TimePickerInputProps extends Omit<
  TextFieldProps,
  "value" | "onChange" | "variant" | "margin"
> {
  value: Date | null | undefined;
  onChange: (value: Date | null) => void;
  label?: string;
  minTime?: Date;
  maxTime?: Date;
  format?: string;
  ampm?: boolean;
  minutesStep?: number;
  variant?: "outlined" | "filled" | "standard";
  margin?: "none" | "dense" | "normal";
}

const TimePickerInput = forwardRef<HTMLDivElement, TimePickerInputProps>(
  (
    {
      value,
      onChange,
      label = "Time",
      minTime,
      maxTime,
      format,
      ampm = true,
      minutesStep = 1,
      variant = "filled",
      margin = "none",
      disabled = false,
      error = false,
      helperText,
      required = false,
      placeholder,
      ...props
    },
    ref,
  ) => (
    <AppLocalizationProvider dateAdapter={AppAdapterDateFns}>
      <AppTimePicker
        ref={ref}
        label={label}
        value={value ?? null}
        onChange={(nextValue) => onChange(nextValue)}
        minTime={minTime}
        maxTime={maxTime}
        format={format}
        ampm={ampm}
        minutesStep={minutesStep}
        disabled={disabled}
        slotProps={{
          textField: {
            variant,
            margin,
            fullWidth: true,
            required,
            error,
            helperText,
            placeholder,
            className: `${styles["filled-input"]} ${layoutStyles.root}`,
            InputLabelProps: { shrink: true },
            InputProps: { disableUnderline: variant === "filled" },
            ...props,
          },
        }}
      />
    </AppLocalizationProvider>
  ),
);

TimePickerInput.displayName = "TimePickerInput";

export default TimePickerInput;
