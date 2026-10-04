import { forwardRef, useState, type FocusEvent, type MouseEvent } from "react";

import { PaletteOutlined as PaletteOutlinedIcon } from "@/components/material-ui-component-wrappers/icons";
import {
  AppBox,
  AppInputAdornment,
  AppPopover,
  AppTextField,
  AppTypography,
  type TextFieldProps,
} from "@/components/material-ui-component-wrappers";

import styles from "./ColorPickerInput.module.scss";

export interface ColorPickerInputProps extends Omit<
  TextFieldProps,
  "value" | "onChange" | "variant" | "margin"
> {
  value: string | null | undefined;
  onChange: (value: string) => void;
  variant?: "outlined" | "filled" | "standard";
  margin?: "none" | "dense" | "normal";
}

const colorToHex = (color: string | null | undefined): string => {
  const value = color?.trim() ?? "";
  const hex = value.match(/^#([\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i)?.[1];
  if (hex) {
    const normalized = hex.length === 3
      ? hex.split("").map((character) => character + character).join("")
      : hex.slice(0, 6);
    return `#${normalized}`;
  }

  const rgb = value.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
  if (rgb) {
    const channels = rgb.slice(1, 4).map((channel) =>
      Math.min(255, Number(channel)).toString(16).padStart(2, "0"),
    );
    return `#${channels.join("")}`;
  }

  return "#3957d7";
};

const ColorPickerInput = forwardRef<HTMLDivElement, ColorPickerInputProps>(
  (
    {
      value,
      onChange,
      variant = "filled",
      margin = "none",
      fullWidth = true,
      label = "Color",
      disabled = false,
      error = false,
      helperText,
      required = false,
      InputLabelProps,
      InputProps,
      inputProps,
      className,
      onClick,
      onFocus,
      ...props
    },
    ref,
  ) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const isOpen = Boolean(anchorEl);
    const openPicker = (
      event:
        | MouseEvent<HTMLDivElement>
        | FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    ): void => setAnchorEl(event.currentTarget);
    const handleClick = (event: MouseEvent<HTMLDivElement>): void => {
      openPicker(event);
      onClick?.(event);
    };
    const handleFocus = (
      event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    ): void => {
      openPicker(event);
      onFocus?.(event);
    };

    return (
      <AppBox ref={ref} className={styles.root}>
        <AppTextField
          variant={variant}
          margin={margin}
          fullWidth={fullWidth}
          label={label}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          error={error}
          helperText={helperText}
          required={required}
          placeholder="#3957d7 or rgb(57, 87, 215)"
          className={className}
          onClick={handleClick}
          onFocus={handleFocus}
          InputLabelProps={{ shrink: true, ...InputLabelProps }}
          InputProps={{
            disableUnderline: variant === "filled",
            ...InputProps,
            startAdornment: (
              <AppInputAdornment position="start" className={styles.swatchAdornment}>
                <input
                  aria-hidden="true"
                  className={styles.swatch}
                  type="color"
                  value={colorToHex(value)}
                  tabIndex={-1}
                  disabled
                />
                {InputProps?.startAdornment}
              </AppInputAdornment>
            ),
            endAdornment: (
              <AppInputAdornment position="end">
                {InputProps?.endAdornment}
                <span aria-hidden="true" className={styles.pickerIcon}>
                  <PaletteOutlinedIcon fontSize="small" />
                </span>
              </AppInputAdornment>
            ),
          }}
          inputProps={inputProps}
          {...props}
        />
        <AppPopover
          open={isOpen}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{ paper: { className: styles.popover } }}
        >
          <AppTypography component="div" variant="body2" className={styles.popoverLabel}>
            Choose a color
          </AppTypography>
          <input
            aria-label="Color picker"
            className={styles.nativePicker}
            type="color"
            value={colorToHex(value)}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
          />
        </AppPopover>
      </AppBox>
    );
  },
);

ColorPickerInput.displayName = "ColorPickerInput";

export default ColorPickerInput;
