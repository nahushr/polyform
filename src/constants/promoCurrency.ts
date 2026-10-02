/** Supported currencies for fixed-value promos. */
export const PROMO_CURRENCY_CODES = ["USD", "INR"] as const;

export type PromoCurrency = (typeof PROMO_CURRENCY_CODES)[number];

export const DEFAULT_PROMO_CURRENCY: PromoCurrency = "USD";

export const PROMO_CURRENCY_OPTIONS: Array<{
  value: PromoCurrency;
  label: string;
  code: PromoCurrency;
  symbol: string;
  name: string;
  flag: string;
}> = [
  {
    value: "USD",
    label: "$ - US Dollar (USD)",
    code: "USD",
    symbol: "$",
    name: "United States Dollar",
    flag: "🇺🇸",
  },
  {
    value: "INR",
    label: "₹ - Indian Rupee (INR)",
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    flag: "🇮🇳",
  },
];

export const getPromoCurrencySymbol = (currency?: string): string =>
  currency?.trim().toUpperCase() === "INR" ? "₹" : "$";

export const getPromoCurrencyCode = (currency?: string): PromoCurrency =>
  currency?.trim().toUpperCase() === "INR" ? "INR" : "USD";

export const formatPromoCurrency = (value: number, currency?: string): string =>
  new Intl.NumberFormat(
    getPromoCurrencyCode(currency) === "USD" ? "en-US" : "en-IN",
    {
      style: "currency",
      currency: getPromoCurrencyCode(currency),
    },
  ).format(value);
