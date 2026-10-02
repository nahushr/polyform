import { forwardRef } from "react";

import {
  AppFormControlLabel,
  AppRadio,
  AppRadioGroup,
  type RadioGroupProps,
  type RadioProps,
} from "@/components/material-ui-component-wrappers";

import styles from "../../styles/FormInput.module.scss";

export interface RadioInputProps extends RadioProps {
  label?: string;
}

export interface RadioGroupInputProps extends Omit<
  RadioGroupProps,
  "onChange"
> {
  options: Array<{ value: string | number; label: string | React.ReactNode }>;
  value?: string | number;
  onChange?: (value: string | number) => void;
  row?: boolean;
  disabled?: boolean;
}

/**
 * Custom Radio component built on top of Material UI Radio
 * Provides consistent styling with other form inputs
 */
const RadioInput = forwardRef<HTMLButtonElement, RadioInputProps>(
  ({ label, className, ...props }, ref) => {
    if (label) {
      return (
        <AppFormControlLabel
          control={<AppRadio ref={ref} className={className} {...props} />}
          label={label}
        />
      );
    }
    return <AppRadio ref={ref} className={className} {...props} />;
  },
);

RadioInput.displayName = "RadioInput";

/**
 * Custom RadioGroup component built on top of Material UI RadioGroup
 * Provides consistent styling and easier API
 */
const RadioGroupInput = forwardRef<HTMLDivElement, RadioGroupInputProps>(
  (
    {
      options,
      value,
      onChange,
      row = false,
      disabled = false,
      className,
      ...props
    },
    ref,
  ) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      // Try to convert to number if it's a numeric string
      const numericValue =
        !isNaN(Number(newValue)) && newValue !== ""
          ? Number(newValue)
          : newValue;
      onChange?.(numericValue);
    };

    return (
      <AppRadioGroup
        ref={ref}
        value={value?.toString() || ""}
        onChange={handleChange}
        row={row}
        className={`${styles["radio-group"]} ${className || ""}`}
        {...props}
      >
        {options.map((option) => (
          <AppFormControlLabel
            key={option.value}
            value={option.value.toString()}
            control={<AppRadio size="small" disabled={disabled} />}
            label={option.label}
            className={styles["radio-option"]}
          />
        ))}
      </AppRadioGroup>
    );
  },
);

RadioGroupInput.displayName = "RadioGroupInput";

export default RadioInput;
export { RadioGroupInput };
