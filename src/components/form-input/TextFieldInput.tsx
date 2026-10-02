import { forwardRef, useEffect, useState } from "react";

import {
  AppTextField,
  type TextFieldProps,
} from "@/components/material-ui-component-wrappers";

import styles from "../../styles/FormInput.module.scss";

export interface TextFieldInputProps extends Omit<
  TextFieldProps,
  "variant" | "margin"
> {
  maxLength?: number;
  variant?: "outlined" | "filled" | "standard";
  margin?: "none" | "dense" | "normal";
  formatNumber?: boolean; // Enable comma formatting for numbers
}

/**
 * Format number with commas (e.g., 112448.38 -> "112,448.38")
 */
const formatNumberWithCommas = (value: number | string): string => {
  const numValue =
    typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  if (isNaN(numValue)) return "";
  // Format with Indian locale (en-IN) which uses commas for thousands
  return numValue.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

/**
 * Remove commas and parse to number
 */
const parseNumberFromFormatted = (value: string): number => {
  const cleaned = value.replace(/,/g, "");
  return parseFloat(cleaned) || 0;
};

/**
 * Custom TextField component built on top of Material UI TextField
 * Provides sensible defaults and additional customization options
 *
 * When type="number" or formatNumber={true}, automatically formats numbers with commas
 */
const TextFieldInput = forwardRef<HTMLDivElement, TextFieldInputProps>(
  (
    {
      maxLength,
      variant = "filled",
      margin = "none",
      fullWidth = true,
      InputLabelProps,
      InputProps,
      inputProps,
      className,
      type,
      value,
      onChange,
      onBlur,
      formatNumber: formatNumberProp,
      ...props
    },
    ref,
  ) => {
    // Determine if number formatting should be enabled
    const shouldFormatNumber =
      formatNumberProp !== undefined ? formatNumberProp : type === "number";

    // Internal state for formatted value (only used when formatting is enabled)
    const [formattedValue, setFormattedValue] = useState<string>(
      shouldFormatNumber && value !== undefined && value !== null
        ? formatNumberWithCommas(value as number | string)
        : (value as string) || "",
    );

    // Update formatted value when external value changes
    useEffect(() => {
      if (shouldFormatNumber && value !== undefined && value !== null) {
        const formatted = formatNumberWithCommas(value as number | string);
        setFormattedValue(formatted);
      } else if (!shouldFormatNumber) {
        setFormattedValue((value as string) || "");
      }
    }, [value, shouldFormatNumber]);

    // Handle change event with number formatting
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      const inputValue = e.target.value;

      if (shouldFormatNumber) {
        // Allow empty input
        if (inputValue === "") {
          setFormattedValue("");
          // Call onChange with empty string or 0
          if (onChange) {
            const syntheticEvent = {
              ...e,
              target: { ...e.target, value: "" },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(syntheticEvent);
          }
          return;
        }

        // Check if user is typing a decimal (ends with .)
        const endsWithDecimal = inputValue.endsWith(".");

        // Remove commas and parse
        const cleaned = inputValue.replace(/,/g, "");
        const parsed = parseFloat(cleaned);

        // If valid number, format and update
        if (!isNaN(parsed) && parsed >= 0) {
          const formatted = formatNumberWithCommas(parsed);
          setFormattedValue(endsWithDecimal ? `${formatted}.` : formatted);

          // Call onChange with the numeric value (without commas)
          if (onChange) {
            const syntheticEvent = {
              ...e,
              target: { ...e.target, value: parsed.toString() },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(syntheticEvent);
          }
        } else {
          // If invalid (user might be typing), just store the raw input
          setFormattedValue(inputValue);
          // Still call onChange with the raw value
          if (onChange) {
            onChange(e);
          }
        }
      } else {
        // No formatting, just pass through
        if (onChange) {
          onChange(e);
        }
      }
    };

    // Handle blur event with number formatting
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
      if (shouldFormatNumber) {
        const parsed = parseNumberFromFormatted(formattedValue);
        const formatted = formatNumberWithCommas(parsed);
        setFormattedValue(formatted);

        // Call onBlur with the numeric value
        if (onBlur) {
          const syntheticEvent = {
            ...e,
            target: { ...e.target, value: parsed.toString() },
          } as React.FocusEvent<HTMLInputElement>;
          onBlur(syntheticEvent);
        }
      } else {
        // No formatting, just pass through
        if (onBlur) {
          onBlur(e);
        }
      }
    };

    // Use "text" type when formatting numbers (number inputs don't support formatting)
    const inputType = shouldFormatNumber ? "text" : type;

    return (
      <AppTextField
        ref={ref}
        variant={variant}
        margin={margin}
        fullWidth={fullWidth}
        className={`${styles["filled-input"]} ${className || ""}`}
        type={inputType}
        value={shouldFormatNumber ? formattedValue : value}
        onChange={handleChange}
        onBlur={handleBlur}
        InputLabelProps={{
          shrink: true,
          ...InputLabelProps,
        }}
        inputProps={{
          maxLength,
          // Automatically add autocomplete for email inputs
          autoComplete: type === "email" ? "email" : inputProps?.autoComplete,
          ...inputProps,
        }}
        InputProps={{
          disableUnderline: true,
          ...InputProps,
        }}
        {...props}
      />
    );
  },
);

TextFieldInput.displayName = "TextFieldInput";

export default TextFieldInput;
