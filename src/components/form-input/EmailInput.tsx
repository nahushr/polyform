import { forwardRef } from "react";

import {
  AppTextField,
  type TextFieldProps,
} from "@/components/material-ui-component-wrappers";

import styles from "../../styles/FormInput.module.scss";

export interface EmailInputProps extends Omit<
  TextFieldProps,
  "variant" | "margin" | "type"
> {
  variant?: "outlined" | "filled" | "standard";
  margin?: "none" | "dense" | "normal";
}

/**
 * Email Input component with email validation pattern
 * Provides email-specific formatting and validation hints
 */
const EmailInput = forwardRef<HTMLDivElement, EmailInputProps>(
  (
    {
      variant = "filled",
      margin = "none",
      fullWidth = true,

      InputLabelProps,
      inputProps,
      ...props
    },
    ref,
  ) => (
    <AppTextField
      ref={ref}
      type="email"
      variant={variant}
      margin={margin}
      fullWidth={fullWidth}
      className={styles["filled-input"]}
      InputLabelProps={{
        shrink: true,
        ...InputLabelProps,
      }}
      inputProps={{
        // Removed pattern attribute - type="email" already provides validation
        // HTML5 pattern attributes have compatibility issues with certain regex features
        autoComplete: "email",
        ...inputProps,
      }}
      InputProps={{
        disableUnderline: true,
      }}
      {...props}
    />
  ),
);

EmailInput.displayName = "EmailInput";

export default EmailInput;
