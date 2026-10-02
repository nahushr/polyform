import { forwardRef, useCallback, useMemo, useState } from "react";

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
  CURRENCY_OPTIONS,
  type CurrencyOption,
} from "../../constants/currency";
import styles from "../../styles/FormInput.module.scss";

export interface CurrencyInputProps extends Omit<
  TextFieldProps,
  "variant" | "margin" | "select" | "value" | "onChange"
> {
  value?: string | null;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  variant?: "outlined" | "filled" | "standard";
  margin?: "none" | "dense" | "normal";
  options?: CurrencyOption[];
}

const getCurrencyOption = (
  value: string | null | undefined,
  options: CurrencyOption[],
): CurrencyOption =>
  options.find((option) => option.value === value) ??
  options.find((option) => option.value === "USD") ??
  options[0] ??
  CURRENCY_OPTIONS[0];

/**
 * Searchable currency dropdown with the same popover interaction as PhoneInput.
 */
const CurrencyInput = forwardRef<HTMLDivElement, CurrencyInputProps>(
  (
    {
      value,
      onChange,
      variant = "filled",
      margin = "none",
      fullWidth = true,
      label = "Currency",
      disabled = false,
      error = false,
      helperText,
      required = false,
      name,
      options = CURRENCY_OPTIONS,
      InputLabelProps,
      InputProps,
      inputProps,
      className,
      ...props
    },
    ref,
  ) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const currencyOptions = options.length > 0 ? options : CURRENCY_OPTIONS;
    const selectedCurrency = getCurrencyOption(value, currencyOptions);
    const isMenuOpen = Boolean(anchorEl);

    const handleOpenMenu = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        if (!disabled) {
          setAnchorEl(event.currentTarget);
          setSearchQuery("");
        }
      },
      [disabled],
    );

    const handleCloseMenu = useCallback(() => {
      setAnchorEl(null);
      setSearchQuery("");
    }, []);

    const filteredCurrencies = useMemo(() => {
      const query = searchQuery.trim().toLocaleLowerCase();
      if (!query) return currencyOptions;

      return currencyOptions.filter((currency) =>
        [currency.name, currency.code, currency.value, currency.symbol]
          .join(" ")
          .toLocaleLowerCase()
          .includes(query),
      );
    }, [currencyOptions, searchQuery]);

    const handleCurrencySelect = useCallback(
      (currency: CurrencyOption) => {
        handleCloseMenu();
        if (!onChange || currency.value === value) return;

        const syntheticEvent = {
          target: {
            name: name ?? "",
            value: currency.value,
          },
          currentTarget: {
            name: name ?? "",
            value: currency.value,
          },
        } as React.ChangeEvent<HTMLInputElement>;

        onChange(syntheticEvent);
      },
      [handleCloseMenu, name, onChange, value],
    );

    return (
      <AppBox
        ref={ref}
        className={
          fullWidth
            ? styles["currency-input-full-width"]
            : styles["currency-input"]
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
          value=""
          onClick={handleOpenMenu}
          className={`${styles["filled-input"]} ${className ?? ""}`.trim()}
          InputLabelProps={{
            shrink: true,
            ...InputLabelProps,
          }}
          InputProps={{
            disableUnderline: variant === "filled",
            readOnly: true,
            startAdornment: (
              <AppInputAdornment
                position="start"
                className={styles["currency-adornment"]}
              >
                <AppButtonBase
                  onClick={handleOpenMenu}
                  disabled={disabled}
                  aria-label="Select Currency"
                  data-test-id="currency-selector-btn"
                  className={styles["currency-selector-button"]}
                >
                  <AppTypography
                    component="span"
                    className={styles["currency-flag"]}
                  >
                    {selectedCurrency.flag}
                  </AppTypography>
                  <AppTypography
                    component="span"
                    variant="body2"
                    className={styles["currency-name"]}
                  >
                    {selectedCurrency.symbol} {selectedCurrency.name}
                  </AppTypography>
                </AppButtonBase>
              </AppInputAdornment>
            ),
            endAdornment: (
              <AppInputAdornment position="end">
                <ArrowDropDownIcon
                  fontSize="small"
                  className={`${styles["currency-dropdown-icon"]} ${isMenuOpen ? styles["currency-dropdown-icon-open"] : ""}`.trim()}
                />
              </AppInputAdornment>
            ),
            ...InputProps,
          }}
          inputProps={{
            "aria-label": `${selectedCurrency.name} (${selectedCurrency.code})`,
            ...inputProps,
          }}
          {...props}
        />

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
            paper: { className: styles["currency-popover"] },
          }}
        >
          <AppBox className={styles["currency-search-panel"]}>
            <AppTextField
              size="small"
              fullWidth
              autoFocus
              placeholder="Search currency or code..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              inputProps={{ "aria-label": "Search currencies" }}
              InputProps={{
                startAdornment: (
                  <AppInputAdornment position="start">
                    <SearchIcon
                      fontSize="small"
                      className={styles["currency-search-icon"]}
                    />
                  </AppInputAdornment>
                ),
              }}
            />
          </AppBox>

          <AppBox className={styles["currency-options"]}>
            {filteredCurrencies.length === 0 ? (
              <AppBox className={styles["currency-empty-state"]}>
                <AppTypography variant="body2" color="text.secondary">
                  No currencies found
                </AppTypography>
              </AppBox>
            ) : (
              filteredCurrencies.map((currency) => {
                const isSelected = currency.value === selectedCurrency.value;
                return (
                  <AppMenuItem
                    key={currency.value}
                    selected={isSelected}
                    onClick={() => handleCurrencySelect(currency)}
                    className={`${styles["currency-menu-item"]} ${isSelected ? styles["currency-menu-item-selected"] : ""}`.trim()}
                  >
                    <AppBox className={styles["currency-option-content"]}>
                      <AppListItemIcon className={styles["currency-option-flag"]}>
                        {currency.flag}
                      </AppListItemIcon>
                      <AppListItemText
                        primary={currency.name}
                        primaryTypographyProps={{
                          variant: "body2",
                          noWrap: true,
                          className: `${styles["currency-option-name"]} ${isSelected ? styles["currency-option-selected"] : ""}`.trim(),
                        }}
                      />
                    </AppBox>
                    <AppTypography
                      variant="caption"
                      className={`${styles["currency-option-meta"]} ${isSelected ? styles["currency-option-selected"] : ""}`.trim()}
                    >
                      {currency.symbol} {currency.code}
                    </AppTypography>
                  </AppMenuItem>
                );
              })
            )}
          </AppBox>
        </AppPopover>
      </AppBox>
    );
  },
);

CurrencyInput.displayName = "CurrencyInput";

export default CurrencyInput;
