import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowDropDown as ArrowDropDownIcon,
  Search as SearchIcon,
} from "@/components/material-ui-component-wrappers/icons";
import {
  AppBox,
  AppButtonBase,
  AppInputAdornment,
  AppListItemIcon,
  AppListItemText,
  AppMenuItem,
  AppPopover,
  AppTextField,
  AppTypography,
  type TextFieldProps,
} from "@/components/material-ui-component-wrappers";
import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";
import { IMaskInput } from "react-imask";

import styles from "../../styles/FormInput.module.scss";

export interface CountryOption {
  code: CountryCode;
  name: string;
  dialCode: string;
  flag: string;
}

const PRIORITY_COUNTRIES: CountryCode[] = [
  "US",
  "IN",
  "CA",
  "GB",
  "AU",
  "DE",
  "FR",
  "JP",
  "CN",
  "BR",
  "MX",
  "IT",
  "ES",
];

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

// Pre-compute country list with flags and dial codes
export const ALL_COUNTRIES: CountryOption[] = (() => {
  const raw = getCountries()
    .map((code): CountryOption | null => {
      try {
        const name = regionNames.of(code) || code;
        const dialCode = getCountryCallingCode(code);
        const flag = code
          .toUpperCase()
          .split("")
          .map((char) =>
            String.fromCodePoint(127397 + (char.codePointAt(0) ?? 0)),
          )
          .join("");
        return { code, name, dialCode, flag };
      } catch {
        return null;
      }
    })
    .filter((c): c is CountryOption => c !== null);

  const priorityItems = PRIORITY_COUNTRIES.map((code) =>
    raw.find((c) => c.code === code),
  ).filter((c): c is CountryOption => c !== undefined);

  const remainingItems = raw
    .filter((c) => !PRIORITY_COUNTRIES.includes(c.code))
    .sort((a, b) => a.name.localeCompare(b.name));

  return [...priorityItems, ...remainingItems];
})();

/**
 * Parse an incoming phone string into country and national 10-digit number
 */
export const parsePhoneInput = (
  val: string | number | null | undefined,
  defaultCountryCode: CountryCode = "US",
): { country: CountryOption; digits: string } => {
  const defaultCountry =
    ALL_COUNTRIES.find((c) => c.code === defaultCountryCode) ||
    ALL_COUNTRIES[0];

  if (val == null) {
    return { country: defaultCountry, digits: "" };
  }

  const str = typeof val === "number" ? String(val) : String(val).trim();
  if (!str) {
    return { country: defaultCountry, digits: "" };
  }

  const digitsOnly = str.replace(/\D/g, "");

  if (str.startsWith("+")) {
    // Check priority countries first for matching dial code
    for (const c of ALL_COUNTRIES) {
      if (digitsOnly.startsWith(c.dialCode)) {
        const remaining = digitsOnly.slice(c.dialCode.length);
        return { country: c, digits: remaining.slice(0, 10) };
      }
    }
  }

  // If 10 digits without +
  if (digitsOnly.length <= 10) {
    return { country: defaultCountry, digits: digitsOnly };
  }

  return { country: defaultCountry, digits: digitsOnly.slice(-10) };
};

type MaskedInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value"
> & {
  value?: string | number;
  inputRef?: React.Ref<HTMLInputElement>;
};

// Stable masked input component using react-imask
const Masked10DigitInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  (props, ref) => {
    const {
      onChange,
      onBlur,
      onFocus,
      inputRef: providedInputRef,
      ...other
    } = props;
    const inputRef = providedInputRef ?? ref;

    return (
      <IMaskInput
        {...other}
        value={other.value == null ? "" : String(other.value)}
        mask="(000) 000-0000"
        definitions={{
          "0": /\d/,
        }}
        unmask={false}
        inputRef={inputRef}
        onAccept={(val: string) => {
          const currentVal = other.value ?? "";
          if (onChange && val !== currentVal) {
            const event = {
              target: { value: val, name: other.name ?? "" },
              currentTarget: { value: val },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(event);
          }
        }}
        onBlur={onBlur}
        onFocus={onFocus}
      />
    );
  },
);

Masked10DigitInput.displayName = "Masked10DigitInput";

export interface PhoneInputProps extends Omit<
  TextFieldProps,
  "variant" | "margin" | "inputComponent" | "onChange"
> {
  value?: string | number | null;
  onChange?: (
    eventOrValue:
      React.ChangeEvent<HTMLInputElement> | string | null | undefined,
  ) => void;
  defaultCountry?: CountryCode;
  variant?: "outlined" | "filled" | "standard";
  margin?: "none" | "dense" | "normal";
}

/**
 * Phone Input component with International Country Flag Dropdown and 10-Digit Mask
 * Displays: [Flag +CountryCode ▾] (000) 000-0000
 * Restricts input to maximum 10 digits
 * Emits full international standard format: +[countryCode][10digits] (e.g. +19876543210 or +919876543210)
 */
const PhoneInput = forwardRef<HTMLDivElement, PhoneInputProps>(
  (
    {
      value,
      onChange,
      defaultCountry = "US",
      variant = "filled",
      margin = "none",
      fullWidth = true,
      label = "Phone",
      disabled = false,
      error = false,
      helperText,
      required = false,
      name,
      InputLabelProps,
      InputProps,
      inputProps,
      className,
      placeholder = "(555) 000-0000",
      ...props
    },
    ref,
  ) => {
    // Parse incoming value into country and national 10-digit number
    const parsedInitial = useMemo(
      () => parsePhoneInput(value, defaultCountry),
      [value, defaultCountry],
    );

    const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
      parsedInitial.country,
    );
    const [displayDigits, setDisplayDigits] = useState<string>(
      parsedInitial.digits,
    );

    // Anchor for the country selection popover
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Sync state when external value changes (e.g. edit mode reset)
    useEffect(() => {
      const parsed = parsePhoneInput(value, defaultCountry);
      setSelectedCountry(parsed.country);
      setDisplayDigits(parsed.digits);
    }, [value, defaultCountry]);

    const handleOpenMenu = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        if (disabled) return;
        setAnchorEl(event.currentTarget);
        setSearchQuery("");
      },
      [disabled],
    );

    const handleCloseMenu = useCallback(() => {
      setAnchorEl(null);
    }, []);

    // Filter countries by search query
    const filteredCountries = useMemo(() => {
      if (!searchQuery.trim()) return ALL_COUNTRIES;
      const q = searchQuery.toLowerCase().trim();
      return ALL_COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.dialCode.includes(q),
      );
    }, [searchQuery]);

    // Emit combined international phone number
    const emitChange = useCallback(
      (country: CountryOption, rawDigits: string) => {
        if (!onChange) return;

        // If empty, emit empty string
        const combinedValue = rawDigits
          ? `+${country.dialCode}${rawDigits}`
          : "";

        const syntheticEvent = {
          target: {
            name: name ?? "",
            value: combinedValue,
          },
          currentTarget: {
            name: name ?? "",
            value: combinedValue,
          },
        } as React.ChangeEvent<HTMLInputElement>;

        onChange(syntheticEvent);
      },
      [name, onChange],
    );

    const handleCountrySelect = useCallback(
      (country: CountryOption) => {
        setSelectedCountry(country);
        handleCloseMenu();
        // Update combined value with new country code
        emitChange(country, displayDigits);
      },
      [displayDigits, emitChange, handleCloseMenu],
    );

    const handleMaskedInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const maskedText = e.target.value ?? "";
        // Extract raw digits (up to 10)
        const digits = maskedText.replace(/\D/g, "").slice(0, 10);
        setDisplayDigits(digits);
        emitChange(selectedCountry, digits);
      },
      [emitChange, selectedCountry],
    );

    const isMenuOpen = Boolean(anchorEl);

    return (
      <AppBox
        ref={ref}
        className={
          fullWidth ? styles["phone-input-full-width"] : styles["phone-input"]
        }
      >
        <AppTextField
          variant={variant}
          margin={margin}
          fullWidth={fullWidth}
          label={label}
          disabled={disabled}
          error={error}
          helperText={helperText}
          required={required}
          name={name}
          placeholder={placeholder}
          className={`${styles["filled-input"]} ${className ?? ""}`.trim()}
          value={displayDigits}
          onChange={handleMaskedInputChange}
          InputLabelProps={{
            shrink: true,
            ...InputLabelProps,
          }}
          InputProps={{
            disableUnderline: variant === "filled",
            inputComponent: Masked10DigitInput,
            startAdornment: (
              <AppInputAdornment
                position="start"
                className={styles["phone-adornment"]}
              >
                <AppButtonBase
                  onClick={handleOpenMenu}
                  disabled={disabled}
                  aria-label="Select Country Code"
                  data-test-id="phone-country-selector-btn"
                  className={styles["phone-country-button"]}
                >
                  <AppTypography
                    component="span"
                    className={styles["phone-country-flag"]}
                  >
                    {selectedCountry.flag}
                  </AppTypography>
                  <AppTypography
                    component="span"
                    variant="body2"
                    className={styles["phone-country-code"]}
                  >
                    +{selectedCountry.dialCode}
                  </AppTypography>
                  <ArrowDropDownIcon
                    fontSize="small"
                    className={`${styles["phone-dropdown-icon"]} ${isMenuOpen ? styles["phone-dropdown-icon-open"] : ""}`.trim()}
                  />
                </AppButtonBase>
              </AppInputAdornment>
            ),
            ...InputProps,
          }}
          inputProps={{
            ...inputProps,
          }}
          {...props}
        />

        {/* Country Selector Popover Menu */}
        <AppPopover
          open={isMenuOpen}
          anchorEl={anchorEl}
          onClose={handleCloseMenu}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          slotProps={{
            paper: { className: styles["phone-popover"] },
          }}
        >
          {/* Search box in dropdown */}
          <AppBox className={styles["phone-search-panel"]}>
            <AppTextField
              size="small"
              fullWidth
              autoFocus
              inputRef={searchInputRef}
              placeholder="Search country or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <AppInputAdornment position="start">
                    <SearchIcon
                      fontSize="small"
                      className={styles["phone-search-icon"]}
                    />
                  </AppInputAdornment>
                ),
              }}
            />
          </AppBox>

          {/* Scrollable list of countries */}
          <AppBox className={styles["phone-country-list"]}>
            {(() => {
              if (filteredCountries.length === 0) {
                return (
                  <AppBox className={styles["phone-empty-state"]}>
                    <AppTypography variant="body2" color="text.secondary">
                      No countries found
                    </AppTypography>
                  </AppBox>
                );
              }
              return filteredCountries.map((c) => {
                const isSelected = c.code === selectedCountry.code;
                return (
                  <AppMenuItem
                    key={c.code}
                    selected={isSelected}
                    onClick={() => handleCountrySelect(c)}
                    className={`${styles["phone-menu-item"]} ${isSelected ? styles["phone-menu-item-selected"] : ""}`.trim()}
                  >
                    <AppBox className={styles["phone-option-content"]}>
                      <AppListItemIcon className={styles["phone-option-flag"]}>
                        {c.flag}
                      </AppListItemIcon>
                      <AppListItemText
                        primary={c.name}
                        primaryTypographyProps={{
                          variant: "body2",
                          noWrap: true,
                          className: isSelected
                            ? `${styles["phone-option-name"]} ${styles["phone-option-selected"]}`
                            : styles["phone-option-name"],
                        }}
                      />
                    </AppBox>
                    <AppTypography
                      variant="caption"
                      className={`${styles["phone-option-meta"]} ${isSelected ? styles["phone-option-selected"] : ""}`.trim()}
                    >
                      +{c.dialCode}
                    </AppTypography>
                  </AppMenuItem>
                );
              });
            })()}
          </AppBox>
        </AppPopover>
      </AppBox>
    );
  },
);

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
