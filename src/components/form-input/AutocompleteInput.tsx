import { forwardRef, useMemo, type CSSProperties } from "react";

import {
  AppAutocomplete,
  AppTextField,
  type AutocompleteProps,
} from "@/components/material-ui-component-wrappers";

import styles from "../../styles/FormInput.module.scss";

export interface AutocompleteInputProps extends Omit<
  AutocompleteProps<string | number, false, false, false>,
  "renderInput" | "options" | "variant" | "margin"
> {
  options: Array<{ value: string | number; label: string }>;
  label?: string;
  variant?: "outlined" | "filled" | "standard";
  margin?: "none" | "dense" | "normal";
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  sortOptions?: boolean;
  maxHeight?: number;
  placeholder?: string;
}

/**
 * Autocomplete Input component with search functionality
 * Provides searchable dropdown with fixed height
 */
const AutocompleteInput = forwardRef<HTMLDivElement, AutocompleteInputProps>(
  (
    {
      options,
      label,
      variant = "filled",
      margin = "none",
      fullWidth = true,

      error,
      helperText,
      required,
      disabled,
      sortOptions = true,
      maxHeight = 300,
      placeholder,
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    // Sort options alphabetically if sortOptions is true
    const sortedOptions = useMemo(() => {
      if (!sortOptions) return options;
      return [...options].sort((a, b) => {
        const labelA = a.label.toLowerCase();
        const labelB = b.label.toLowerCase();
        if (labelA < labelB) return -1;
        if (labelA > labelB) return 1;
        return 0;
      });
    }, [options, sortOptions]);

    // Convert options to string array for Autocomplete
    const optionLabels = sortedOptions.map((opt) => opt.label);

    // Find the label for the current value
    const currentLabel = useMemo(() => {
      if (value === undefined || value === null || value === "") return null;
      const option = sortedOptions.find((opt) => opt.value === value);
      return option?.label ?? null;
    }, [value, sortedOptions]);

    return (
      <AppAutocomplete
        ref={ref}
        options={optionLabels}
        value={currentLabel}
        onChange={(_event, newValue, reason, details) => {
          if (onChange) {
            const selectedOption = sortedOptions.find(
              (opt) => opt.label === newValue,
            );
            if (selectedOption) {
              // Create a synthetic event to match the expected onChange signature
              const syntheticEvent = {
                target: { value: selectedOption.value },
              } as React.ChangeEvent<HTMLInputElement>;
              onChange(syntheticEvent, newValue, reason, details);
            } else if (newValue === null) {
              const syntheticEvent = {
                target: { value: "" },
              } as React.ChangeEvent<HTMLInputElement>;
              onChange(syntheticEvent, newValue, reason, details);
            }
          }
        }}
        disabled={disabled}
        fullWidth={fullWidth}
        ListboxProps={{
          className: styles["autocomplete-input__listbox"],
          style: {
            "--autocomplete-max-height": `${maxHeight}px`,
          } as CSSProperties,
        }}
        renderInput={(params) => (
          <AppTextField
            {...params}
            label={label}
            variant={variant}
            margin={margin}
            required={required}
            error={error}
            helperText={helperText}
            placeholder={placeholder}
            className={styles["filled-input"]}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              ...params.InputProps,
              disableUnderline: true,
            }}
          />
        )}
        {...props}
      />
    );
  },
);

AutocompleteInput.displayName = "AutocompleteInput";

export default AutocompleteInput;
