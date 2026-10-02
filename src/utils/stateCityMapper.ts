/**
 * Country, state, and city lookup helpers.
 *
 * The data comes from the `country-state-city` package, which is generated from
 * the dr5hn countries-states-cities database. Keeping the lookup dynamic means
 * address forms can support every country without maintaining a second,
 * incomplete country mapping in the application.
 */
import { City, Country, State } from "country-state-city";

export interface StateCityMap {
  [state: string]: string[];
}

/** Countries currently enabled as operational/fulfillment choices. */
export const OPERATIONAL_COUNTRIES = ["India", "United States"] as const;
export type OperationalCountry = (typeof OPERATIONAL_COUNTRIES)[number];

type CountryRecord = {
  name: string;
  isoCode: string;
  currency?: string;
};

const countries = Country.getAllCountries() as CountryRecord[];
const countryByName = new Map(
  countries.map((country) => [country.name.trim().toLowerCase(), country]),
);

const normalizeCountryName = (country?: string): string => {
  const value = country?.trim();
  if (!value) return "";

  const alias = {
    us: "United States",
    usa: "United States",
    "united states of america": "United States",
    in: "India",
  }[value.toLowerCase()];

  return alias ?? value;
};

const findCountry = (country?: string): CountryRecord | undefined => {
  const normalized = normalizeCountryName(country);
  return countryByName.get(normalized.toLowerCase());
};

/** Returns every country in the source dataset, sorted by display name. */
export const getAllCountries = (): string[] =>
  countries.map((country) => country.name).sort((a, b) => a.localeCompare(b));

/** Returns the source ISO-3166 country code for a display name or alias. */
export const getCountryCode = (country?: string): string | undefined =>
  findCountry(country)?.isoCode;

/** Returns the dataset's subdivision code for a state/province name. */
export const getStateCode = (
  state?: string,
  country?: string,
): string | undefined => {
  if (!state?.trim()) return undefined;

  const countryRecords = country
    ? [findCountry(country)].filter(Boolean)
    : countries;
  for (const countryRecord of countryRecords as CountryRecord[]) {
    const matchingState = State.getStatesOfCountry(countryRecord.isoCode).find(
      (candidate) =>
        candidate.name.toLowerCase() === state.trim().toLowerCase(),
    );
    if (matchingState?.isoCode) return matchingState.isoCode;
  }
  return undefined;
};

/** Returns all states/provinces for the selected country. */
export const getStatesByCountry = (country?: string): string[] => {
  const countryCode = findCountry(country)?.isoCode;
  if (!countryCode) return [];

  return State.getStatesOfCountry(countryCode)
    .map((state) => state.name)
    .sort((a, b) => a.localeCompare(b));
};

/** Returns all cities for a state in the selected country. */
export const getCitiesByState = (state: string, country?: string): string[] => {
  const countryCode = findCountry(country)?.isoCode;
  if (!countryCode || !state?.trim()) return [];

  const stateRecord = State.getStatesOfCountry(countryCode).find(
    (candidate) => candidate.name.toLowerCase() === state.trim().toLowerCase(),
  );
  if (!stateRecord) return [];

  return City.getCitiesOfState(countryCode, stateRecord.isoCode)
    .map((city) => city.name)
    .sort((a, b) => a.localeCompare(b));
};

export const getAllStates = (country?: string): string[] => {
  if (country) return getStatesByCountry(country);

  return Array.from(
    new Set(
      countries.flatMap((candidate) => getStatesByCountry(candidate.name)),
    ),
  ).sort((a, b) => a.localeCompare(b));
};

export const stateExists = (state: string, country?: string): boolean =>
  getStatesByCountry(country).some(
    (candidate) => candidate.toLowerCase() === state?.trim().toLowerCase(),
  );

export const cityExistsInState = (
  state: string,
  city: string,
  country?: string,
): boolean =>
  getCitiesByState(state, country).some(
    (candidate) => candidate.toLowerCase() === city?.trim().toLowerCase(),
  );

/** Returns whether the source dataset contains this operational country. */
export const isOperationalCountry = (country?: string): boolean =>
  OPERATIONAL_COUNTRIES.some(
    (candidate) =>
      candidate.toLowerCase() === normalizeCountryName(country).toLowerCase(),
  );

/** Returns the source dataset's currency for a country, when available. */
export const getCurrencyForCountry = (country?: string): string | undefined =>
  findCountry(country)?.currency;

/** Returns operational countries in the canonical display order. */
export const getOperationalCountries = (
  countriesToUse?: string[] | null,
): string[] => {
  const selected = new Set(
    (countriesToUse ?? []).map((country) => normalizeCountryName(country)),
  );

  const enabled = OPERATIONAL_COUNTRIES.filter((country) =>
    selected.has(country),
  );
  return enabled.length > 0 ? [...enabled] : ["United States"];
};

/** Returns the currencies represented by enabled operational countries. */
export const getOperationalCurrencies = (
  countriesToUse?: string[] | null,
): string[] =>
  getOperationalCountries(countriesToUse)
    .map((country) => getCurrencyForCountry(country))
    .filter((currency): currency is string => Boolean(currency));
