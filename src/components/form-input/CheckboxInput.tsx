import {
  AppBox,
  AppCheckbox,
  AppFormControlLabel,
  AppFormGroup,
  AppFormHelperText,
  AppTypography,
} from "@/components/material-ui-component-wrappers";

import type { FieldOption } from "../form/PolyForm";
import styles from "./CheckboxInput.module.scss";

export interface CheckboxInputProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

export interface CheckboxGroupInputProps {
  label?: string;
  required?: boolean;
  options: FieldOption[];
  value?: Array<string | number>;
  onChange: (value: Array<string | number>) => void;
  disabled?: boolean;
  row?: boolean;
  error?: boolean;
  helperText?: string;
}

export const CheckboxInput = ({
  label,
  checked,
  onChange,
  disabled = false,
  error = false,
  helperText,
}: CheckboxInputProps): JSX.Element => (
  <AppBox className={styles.root}>
    <AppFormControlLabel
      control={
        <AppCheckbox
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
          color={error ? "error" : "primary"}
        />
      }
      label={label}
      disabled={disabled}
    />
    {helperText && (
      <AppFormHelperText error={error}>{helperText}</AppFormHelperText>
    )}
  </AppBox>
);

export const CheckboxGroupInput = ({
  label,
  required = false,
  options,
  value = [],
  onChange,
  disabled = false,
  row = false,
  error = false,
  helperText,
}: CheckboxGroupInputProps): JSX.Element => {
  const toggleOption = (optionValue: string | number, checked: boolean) => {
    const next = checked
      ? [...value, optionValue]
      : value.filter((selected) => selected !== optionValue);
    onChange(next);
  };

  return (
    <AppBox className={styles.root}>
      {label && (
        <AppTypography component="div" variant="body2" className={styles.label}>
          {label}{required ? " *" : ""}
        </AppTypography>
      )}
      <AppFormGroup row={row} className={styles.group}>
        {options.map((option) => (
          <AppFormControlLabel
            key={option.value}
            control={
              <AppCheckbox
                checked={value.includes(option.value)}
                onChange={(event) =>
                  toggleOption(option.value, event.target.checked)
                }
                disabled={disabled}
                color={error ? "error" : "primary"}
              />
            }
            label={option.label}
            disabled={disabled}
          />
        ))}
      </AppFormGroup>
      {helperText && (
        <AppFormHelperText error={error}>{helperText}</AppFormHelperText>
      )}
    </AppBox>
  );
};
