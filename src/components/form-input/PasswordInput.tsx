import { forwardRef, useState } from "react";

import {
  Visibility,
  VisibilityOff,
} from "@/components/material-ui-component-wrappers/icons";
import {
  AppIconButton,
  AppInputAdornment,
  AppTextField,
  type TextFieldProps,
} from "@/components/material-ui-component-wrappers";

import styles from "../../styles/FormInput.module.scss";

export interface PasswordInputProps extends Omit<
  TextFieldProps,
  "variant" | "margin" | "type"
> {
  maxLength?: number;
  variant?: "outlined" | "filled" | "standard";
  margin?: "none" | "dense" | "normal";
  showPasswordToggle?: boolean;
  autocomplete?: "current-password" | "new-password" | "off";
}

/**
 * Custom Password Input component with show/hide toggle
 * Built on top of Material UI TextField with secure password input
 */
const PasswordInput = forwardRef<HTMLDivElement, PasswordInputProps>(
  (
    {
      maxLength,
      variant = "filled",
      margin = "none",
      fullWidth = true,

      showPasswordToggle = true,
      autocomplete = "current-password",
      InputLabelProps,
      inputProps,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleTogglePassword = (): void => {
      setShowPassword((prev) => !prev);
    };

    const handleMouseDownPassword = (
      event: React.MouseEvent<HTMLButtonElement>,
    ): void => {
      event.preventDefault();
    };

    return (
      <AppTextField
        ref={ref}
        type={showPassword ? "text" : "password"}
        variant={variant}
        margin={margin}
        fullWidth={fullWidth}
        className={styles["filled-input"]}
        InputLabelProps={{
          shrink: true,
          ...InputLabelProps,
        }}
        inputProps={{
          maxLength,
          autoComplete: autocomplete,
          ...inputProps,
        }}
        InputProps={{
          disableUnderline: true,
          endAdornment: (() => {
            if (showPasswordToggle) {
              return (
                <AppInputAdornment position="end">
                  <AppIconButton data-test-id="src-components-form-input-passwordinput-action-82"
                    aria-label="toggle password visibility"
                    onClick={handleTogglePassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </AppIconButton>
                </AppInputAdornment>
              );
            }
            return undefined;
          })(),
        }}
        {...props}
      />
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
