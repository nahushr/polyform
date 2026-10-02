import {
  AppBox,
  AppFormHelperText,
} from "@/components/material-ui-component-wrappers";

import DatePickerInput from "./DatePickerInput";
import styles from "./DateRangePickerInput.module.scss";

export interface DateRangeValue {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePickerInputProps {
  value: DateRangeValue | null | undefined;
  onChange: (value: DateRangeValue) => void;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  format?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

const DateRangePickerInput = ({
  value,
  onChange,
  label = "Date range",
  minDate,
  maxDate,
  format = "MM/dd/yyyy",
  disabled = false,
  required = false,
  error = false,
  helperText,
}: DateRangePickerInputProps): JSX.Element => {
  const start = value?.start ?? null;
  const end = value?.end ?? null;

  return (
    <AppBox className={styles.root}>
      <AppBox className={styles.fields}>
        <DatePickerInput
          label={`${label} start`}
          value={start}
          onChange={(nextStart) => {
            onChange({
              start: nextStart,
              end:
                nextStart && end && nextStart.getTime() > end.getTime()
                  ? null
                  : end,
            });
          }}
          minDate={minDate}
          maxDate={maxDate}
          format={format}
          disabled={disabled}
          required={required}
          error={error}
        />
        <DatePickerInput
          label={`${label} end`}
          value={end}
          onChange={(nextEnd) => onChange({ start, end: nextEnd })}
          minDate={start ?? minDate}
          maxDate={maxDate}
          format={format}
          disabled={disabled}
          required={required}
          error={error}
        />
      </AppBox>
      {helperText && (
        <AppFormHelperText error={error}>{helperText}</AppFormHelperText>
      )}
    </AppBox>
  );
};

export default DateRangePickerInput;
