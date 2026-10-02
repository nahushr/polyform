import {
  Controller,
  type Control,
  type FieldErrors,
  type FieldValues,
  type Path,
} from "react-hook-form";

import { AppGrid } from "@/components/material-ui-component-wrappers";

import { TextFieldInput } from "../form-input";

/**
 * Configuration for text input fields
 */
export interface TextFieldConfig<
  TFieldValues extends FieldValues = FieldValues,
> {
  name: Path<TFieldValues>;
  label: string;
  type?: string;
  required?: boolean;
  gridSize?: {
    xs: number;
    sm: number;
  };
}

/**
 * Reusable form field component for Controller + TextField
 */
export interface FormFieldControllerProps<
  TFieldValues extends FieldValues = FieldValues,
> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  label: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  gridSize?: {
    xs: number;
    sm: number;
  };
}

/**
 * FormFieldController component
 * A reusable wrapper around react-hook-form's Controller and TextFieldInput
 * Provides consistent styling and error handling for form fields
 */
export const FormFieldController = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  errors,
  label,
  type = "text",
  required = false,
  disabled = false,
  gridSize = {
    xs: 12,
    sm: 6,
  },
}: FormFieldControllerProps<TFieldValues>): JSX.Element => {
  const errorField = errors[name];
  const errorMessage =
    typeof errorField?.message === "string" ? errorField.message : undefined;

  return (
    <AppGrid item xs={gridSize.xs} sm={gridSize.sm}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <TextFieldInput
            {...field}
            label={label}
            type={type}
            required={required}
            disabled={disabled}
            error={!!errorField}
            helperText={errorMessage}
          />
        )}
      />
    </AppGrid>
  );
};

export default FormFieldController;
