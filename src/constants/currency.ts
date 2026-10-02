/** Currency metadata used by the reusable currency form control. */
import {
  DEFAULT_PROMO_CURRENCY,
  PROMO_CURRENCY_CODES,
} from "./promoCurrency";
import type { PromoCurrency } from "./promoCurrency";
import { getCurrencyForCountry as getDatasetCurrencyForCountry } from "../utils/stateCityMapper";
import { Country } from "country-state-city";

export interface CurrencyOption {
  value: string;
  label: string;
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

export type CurrencyCode = PromoCurrency;
export const DEFAULT_CURRENCY: CurrencyCode = DEFAULT_PROMO_CURRENCY;

type CountryCurrencyRecord = {
  isoCode: string;
  currency?: string;
};

const currencyNames = new Intl.DisplayNames(["en"], { type: "currency" });
const countryRecords = Country.getAllCountries() as CountryCurrencyRecord[];
const countryByCurrency = new Map<string, CountryCurrencyRecord>();

for (const country of countryRecords) {
  const currencyCode = country.currency?.trim().toUpperCase();
  if (currencyCode && !countryByCurrency.has(currencyCode)) {
    countryByCurrency.set(currencyCode, country);
  }
}

const getIntlCurrencyCodes = (): string[] => {
  const intlWithSupportedValues = Intl as typeof Intl & {
    supportedValuesOf?: (key: "currency") => string[];
  };

  try {
    return intlWithSupportedValues.supportedValuesOf?.("currency") ?? [];
  } catch {
    return [];
  }
};

const getCountryFlag = (countryCode?: string): string => {
  if (!countryCode || !/^[A-Z]{2}$/.test(countryCode)) return "💱";

  return countryCode
    .split("")
    .map((character) =>
      String.fromCodePoint(127397 + (character.codePointAt(0) ?? 0)),
    )
    .join("");
};

const getCurrencySymbol = (currencyCode: string): string => {
  try {
    return (
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
      })
        .formatToParts(0)
        .find((part) => part.type === "currency")?.value ?? currencyCode
    );
  } catch {
    return currencyCode;
  }
};

const CURRENCY_PRIORITY = [
  "USD",
  "EUR",
  "GBP",
  "INR",
  "CAD",
  "AUD",
  "JPY",
  "CNY",
  "CHF",
  "NZD",
];

const CURRENCY_FLAG_COUNTRY_OVERRIDES: Record<string, string> = {
  AAD: "AD",
  USD: "US",
  EUR: "EU",
  GBP: "GB",
  INR: "IN",
  CAD: "CA",
  AUD: "AU",
  JPY: "JP",
  CNY: "CN",
  CHF: "CH",
  NZD: "NZ",
  BRL: "BR",
  MXN: "MX",
  SGD: "SG",
  HKD: "HK",
  KRW: "KR",
  ZAR: "ZA",
  AED: "AE",
  SEK: "SE",
  NOK: "NO",
  DKK: "DK",
  TRY: "TR",
  SAR: "SA",
  IDR: "ID",
  THB: "TH",
  RUB: "RU",
};

const createCurrencyOptions = (): CurrencyOption[] => {
  const currencyCodes = new Set([
    ...getIntlCurrencyCodes(),
    ...countryByCurrency.keys(),
  ]);

  const options = Array.from(currencyCodes, (code) => {
    const normalizedCode = code.toUpperCase();
    const country = countryByCurrency.get(normalizedCode);
    const name = currencyNames.of(normalizedCode) ?? normalizedCode;
    const symbol = getCurrencySymbol(normalizedCode);

    return {
      value: normalizedCode,
      code: normalizedCode,
      name,
      symbol,
      flag: getCountryFlag(
        CURRENCY_FLAG_COUNTRY_OVERRIDES[normalizedCode] ?? country?.isoCode,
      ),
      label: `${symbol} - ${name} (${normalizedCode})`,
    };
  });

  const priorityOptions = CURRENCY_PRIORITY.map((code) =>
    options.find((option) => option.code === code),
  ).filter((option): option is CurrencyOption => option !== undefined);
  const remainingOptions = options
    .filter((option) => !CURRENCY_PRIORITY.includes(option.code))
    .sort((left, right) => left.name.localeCompare(right.name));

  return [...priorityOptions, ...remainingOptions];
};

/** All currencies provided by the runtime plus those used by the country dataset. */
export const CURRENCY_OPTIONS = createCurrencyOptions();
export const CURRENCY_CODES = CURRENCY_OPTIONS.map((option) => option.code);
export {
  getPromoCurrencyCode as getCurrencyCode,
  getPromoCurrencySymbol as getCurrencySymbol,
  formatPromoCurrency as formatCurrency,
} from "./promoCurrency";

/** Resolve the display metadata for a currency, defaulting to USD. */
export const getCurrencyOption = (currency?: string | null): CurrencyOption => {
  const normalizedCurrency = currency?.trim().toUpperCase();
  return (
    CURRENCY_OPTIONS.find((option) => option.value === normalizedCurrency) ??
    CURRENCY_OPTIONS.find((option) => option.value === DEFAULT_CURRENCY) ??
    CURRENCY_OPTIONS[0]
  );
};

/**
 * Format a currency for compact, user-facing data displays.
 *
 * Keep the full currency name for selection controls, but use only the
 * country flag, symbol, and ISO code in grids and review tables.
 */
export const formatCurrencyDisplay = (currency?: string | null): string => {
  const normalizedCurrency = currency?.trim().toUpperCase();
  if (!normalizedCurrency) return "—";

  const option = CURRENCY_OPTIONS.find(
    (candidate) => candidate.code === normalizedCurrency,
  );

  return option
    ? `${option.flag} ${option.symbol} ${option.code}`
    : normalizedCurrency;
};

/**
 * Returns the product currency allowed for a purchase-order delivery country.
 * This helper keeps the current product-catalog restriction to INR and USD.
 */
export const getCurrencyForCountry = (
  country?: string | null,
): CurrencyCode | undefined => {
  const datasetCurrency = getDatasetCurrencyForCountry(
    country ?? undefined,
  )?.toUpperCase();
  return PROMO_CURRENCY_CODES.includes(datasetCurrency as PromoCurrency)
    ? (datasetCurrency as CurrencyCode)
    : undefined;
};
