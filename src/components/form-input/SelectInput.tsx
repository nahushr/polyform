import { forwardRef } from "react";

import {
  AppMenuItem,
  AppTextField,
  type TextFieldProps,
} from "@/components/material-ui-component-wrappers";

import styles from "../../styles/FormInput.module.scss";

export interface SelectInputProps extends Omit<
  TextFieldProps,
  "variant" | "margin" | "select"
> {
  options: Array<{ value: string | number; label: string }>;
  variant?: "outlined" | "filled" | "standard";
  margin?: "none" | "dense" | "normal";
  placeholder?: string;
}

const formatSelectValue = (value: unknown): string => {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  return "";
};

/**
 * Custom Select/Dropdown component built on top of Material UI TextField
 * Provides sensible defaults and consistent styling with other form inputs
 */
const SelectInput = forwardRef<HTMLDivElement, SelectInputProps>(
  (
    {
      options,
      variant = "filled",
      margin = "none",
      fullWidth = true,

      InputLabelProps,
      className,
      placeholder,
      ...props
    },
    ref,
  ) => {
    return (
      <AppTextField
        ref={ref}
        select
        variant={variant}
        margin={margin}
        fullWidth={fullWidth}
        className={`${styles["filled-input"]} ${className ?? ""}`}
        InputLabelProps={{
          shrink: true,
          ...InputLabelProps,
        }}
        InputProps={{
          disableUnderline: true,
        }}
        SelectProps={{
          displayEmpty: true,
          renderValue: (value: unknown) => {
            // If no value and placeholder exists, show placeholder
            if (
              (value === "" || value === null || value === undefined) &&
              placeholder
            ) {
              return (
                <span className={styles["select-placeholder"]}>
                  {placeholder}
                </span>
              );
            }
            // Otherwise show the selected option label
            const selectedOption = options.find((opt) => opt.value === value);
            return selectedOption?.label ?? formatSelectValue(value);
          },
        }}
        {...props}
      >
        {placeholder && (
          <AppMenuItem
            value=""
            disabled
            className={`${styles["select-menu-item"]} ${styles["select-placeholder-item"]}`}
          >
            {placeholder}
          </AppMenuItem>
        )}
        {options.map((option) => (
          <AppMenuItem
            key={option.value}
            value={option.value}
            className={styles["select-menu-item"]}
          >
            {option.label}
          </AppMenuItem>
        ))}
      </AppTextField>
    );
  },
);

SelectInput.displayName = "SelectInput";

export default SelectInput;
