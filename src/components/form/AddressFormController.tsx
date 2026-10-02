import { useEffect, useMemo } from "react";

import {
  Controller,
  useWatch,
  type Control,
  type FieldErrors,
  type FieldValues,
  type Path,
  type PathValue,
  type UseFormSetValue,
  type UseFormTrigger,
  get,
} from "react-hook-form";

import { AppGrid } from "@/components/material-ui-component-wrappers";

import { ADDRESS_TYPES_ARRAY } from "../../constants/appConstants";
import {
  getCitiesByState,
  getAllCountries,
  getStatesByCountry,
} from "../../utils/stateCityMapper";
import {
  AutocompleteInput,
  EmailInput,
  PhoneInput,
  SelectInput,
  TextFieldInput,
} from "../form-input";

import {
  FieldType,
  type FieldConfig,
  type FieldOption,
} from "./PolyForm";
import { isRecord } from "../../utils/typeGuards";

export interface AddressFormData {
  streetAddress: string;
  streetAddress2?: string;
  streetAddress3?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: string;
  nameOnAddress?: string;
  emailOnAddress?: string;
  phoneOnAddress?: string;
}

const ADDRESS_TYPE_OPTIONS: FieldOption[] = (
  ADDRESS_TYPES_ARRAY as readonly string[]
).map((type) => ({
  value: type,
  label: type,
}));

const ALL_COUNTRY_OPTIONS: FieldOption[] = getAllCountries().map((country) => ({
  value: country,
  label: country,
}));

export interface AddressableFormValues {
  address: AddressFormData;
}

export interface AddressFormControllerProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  errors?: FieldErrors<TFieldValues>;
  disabled?: boolean;
  states?: string[];
  cities?: string[];
  onStateChange?: (state: string) => void;
  setValue: UseFormSetValue<TFieldValues>;
  trigger?: UseFormTrigger<TFieldValues>;
  /** Optional country restriction for operational shipping addresses only. */
  allowedCountries?: string[];
}

const toAddressPath = <TFieldValues extends FieldValues>(
  addressPath: Path<TFieldValues>,
  field: keyof AddressFormData,
): Path<TFieldValues> => `${String(addressPath)}.${field}` as Path<TFieldValues>;

const AddressFormController = <TFieldValues extends FieldValues>({
  name,
  control,
  errors,
  disabled = false,
  states = [],
  cities = [],
  onStateChange,
  setValue,
  trigger,
  allowedCountries,
}: AddressFormControllerProps<TFieldValues>): JSX.Element => {
  const formErrors = errors;

  const countryFieldPath = toAddressPath(name, "country");
  const stateFieldPath = toAddressPath(name, "state");
  const cityFieldPath = toAddressPath(name, "city");

  const countryValue = (useWatch({
    control,
    name: countryFieldPath,
  }) ?? "") as string;

  const stateValue = (useWatch({
    control,
    name: stateFieldPath,
  }) ?? "") as string;

  const cityValue = (useWatch({
    control,
    name: cityFieldPath,
  }) ?? "") as string;

  const countryOptions = useMemo<FieldOption[]>(() => {
    if (!allowedCountries || allowedCountries.length === 0) {
      return ALL_COUNTRY_OPTIONS;
    }

    const allowed = new Set(
      allowedCountries.map((country) => country.trim().toLowerCase()),
    );
    return ALL_COUNTRY_OPTIONS.filter((option) =>
      allowed.has(String(option.value).toLowerCase()),
    );
  }, [allowedCountries]);

  const effectiveStates = useMemo(() => {
    if (states && states.length > 0) return states;
    return getStatesByCountry(countryValue);
  }, [states, countryValue]);

  const effectiveCities = useMemo(() => {
    if (cities && cities.length > 0) return cities;
    if (!stateValue) return [];
    return getCitiesByState(stateValue, countryValue);
  }, [cities, stateValue, countryValue]);

  const stateOptions = useMemo(
    () =>
      effectiveStates.map((s) => ({
        value: s,
        label: s,
      })),
    [effectiveStates],
  );

  const cityOptions = useMemo(
    () =>
      [...effectiveCities]
        .sort((a, b) => a.localeCompare(b))
        .map((city) => ({
          value: city,
          label: city,
        })),
    [effectiveCities],
  );

  const isCityDisabled =
    disabled ||
    !stateValue ||
    stateValue.trim() === "" ||
    cityOptions.length === 0;
  const isStateDisabled =
    disabled ||
    !countryValue ||
    countryValue.trim() === "" ||
    stateOptions.length === 0;

  // When country changes, reset state and city if state is not in the new country's states
  useEffect(() => {
    if (!stateValue) return;
    const isValid = effectiveStates.includes(stateValue);
    if (!isValid) {
      setValue(
        stateFieldPath,
        "" as PathValue<TFieldValues, typeof stateFieldPath>,
        {
          shouldDirty: true,
          shouldValidate: false,
        },
      );
      setValue(
        cityFieldPath,
        "" as PathValue<TFieldValues, typeof cityFieldPath>,
        {
          shouldDirty: true,
          shouldValidate: false,
        },
      );
    }
  }, [
    countryValue,
    effectiveStates,
    stateValue,
    stateFieldPath,
    cityFieldPath,
    setValue,
  ]);

  useEffect(() => {
    if (!cityValue || cityOptions.length === 0) {
      return;
    }

    const cityExists = cityOptions.some((option) => option.value === cityValue);

    if (!cityExists) {
      setValue(
        cityFieldPath,
        "" as PathValue<TFieldValues, typeof cityFieldPath>,
        {
          shouldDirty: true,
          shouldValidate: false,
        },
      );
    }
  }, [cityOptions, cityValue, cityFieldPath, setValue]);

  useEffect(() => {
    if (onStateChange && stateValue) {
      onStateChange(stateValue);
    }
  }, [stateValue, onStateChange]);

  // Trigger validation when city value changes to clear any stale errors
  useEffect(() => {
    if (trigger && cityValue && cityValue.trim() !== "") {
      // Re-validate the city field to clear the error when a valid city is selected
      void trigger(cityFieldPath);
    }
  }, [trigger, cityValue, cityFieldPath]);

  const addressFields = useMemo<Array<FieldConfig<TFieldValues>>>(() => {
    const fields: Array<FieldConfig<TFieldValues>> = [
      {
        name: toAddressPath(name, "streetAddress"),
        label: "Street Address 1",
        type: FieldType.Text,
        required: true,
        disabled,
        gridSize: {
          xs: 12,
          sm: 12,
        },
        placeholder: "e.g., 123 Main Street",
      },
      {
        name: toAddressPath(name, "streetAddress2"),
        label: "Street Address 2",
        type: FieldType.Text,
        disabled,
        gridSize: {
          xs: 12,
          sm: 6,
        },
        placeholder: "Apt, Suite, Floor (optional)",
      },
      {
        name: toAddressPath(name, "streetAddress3"),
        label: "Street Address 3",
        type: FieldType.Text,
        disabled,
        gridSize: {
          xs: 12,
          sm: 6,
        },
        placeholder: "Additional address info (optional)",
      },
      {
        name: toAddressPath(name, "postalCode"),
        label: "Postal Code",
        type: FieldType.Text,
        required: true,
        disabled,
        gridSize: {
          xs: 12,
          sm: 6,
        },
        placeholder: "Enter postal / zip code",
      },
      {
        name: countryFieldPath,
        label: "Country",
        type: FieldType.Autocomplete as FieldType,
        required: true,
        disabled,
        gridSize: {
          xs: 12,
          sm: 6,
        },
        options: countryOptions,
        sortOptions: true,
        placeholder: "Select country",
      },
      {
        name: toAddressPath(name, "addressType"),
        label: "Address Type",
        type: FieldType.Select as FieldType,
        required: true,
        disabled,
        gridSize: {
          xs: 12,
          sm: 6,
        },
        options: ADDRESS_TYPE_OPTIONS,
        placeholder: "Select address type",
      },
      {
        name: stateFieldPath,
        label: "State",
        type: FieldType.Autocomplete as FieldType,
        required: true,
        disabled: isStateDisabled,
        gridSize: {
          xs: 12,
          sm: 6,
        },
        options: stateOptions,
        sortOptions: true,
        placeholder: "Select state",
      },
      {
        name: cityFieldPath,
        label: "City",
        type: FieldType.Autocomplete as FieldType,
        required: true,
        disabled: isCityDisabled,
        gridSize: {
          xs: 12,
          sm: 6,
        },
        options: cityOptions,
        sortOptions: true,
        placeholder: "Select city",
      },

      {
        name: toAddressPath(name, "nameOnAddress"),
        label: "Name on Address",
        type: FieldType.Text as FieldType,
        disabled,
        gridSize: {
          xs: 12,
          sm: 6,
        },
        placeholder: "Full name (optional)",
      },
      {
        name: toAddressPath(name, "emailOnAddress"),
        label: "Email on Address",
        type: FieldType.Email as FieldType,
        disabled,
        gridSize: {
          xs: 12,
          sm: 6,
        },
        placeholder: "email@example.com (optional)",
      },
      {
        name: toAddressPath(name, "phoneOnAddress"),
        label: "Phone on Address",
        type: FieldType.Phone as FieldType,
        disabled,
        gridSize: {
          xs: 12,
          sm: 6,
        },
        placeholder: "(555) 123-4567 (optional)",
      },
    ];

    return fields;
  }, [
    cityOptions,
    countryOptions,
    disabled,
    isCityDisabled,
    isStateDisabled,
    stateOptions,
    cityFieldPath,
    countryFieldPath,
    name,
    stateFieldPath,
  ]);

  // Helper to get field error
  const getFieldError = (
    path: Path<TFieldValues>,
  ): { message?: string } | undefined => {
    const current = get(formErrors, path);
    if (!isRecord(current)) return undefined;
    const message = current.message;
    return typeof message === "string" ? { message } : undefined;
  };

  // Render each address field as a Grid item to match the spacing of other sections
  return (
    <>
      {addressFields.map((fieldConfig) => {
        const {
          name,
          label,
          type = FieldType.Text,
          required = false,
          gridSize,
          options = [],
          placeholder,
        } = fieldConfig;
        const { sortOptions = false } = fieldConfig;
        const fieldError = getFieldError(name);
        const isFieldDisabled = disabled || fieldConfig.disabled;

        return (
          <AppGrid
            item
            xs={gridSize?.xs ?? 12}
            sm={gridSize?.sm ?? 6}
            key={name as string}
          >
            <Controller
              name={name}
              control={control}
              render={({ field }) => {
                const fieldValue =
                  typeof field.value === "string" ||
                  typeof field.value === "number"
                    ? field.value
                    : "";
                const controllerInputProps = {
                  name: field.name,
                  value: fieldValue,
                  onChange: field.onChange,
                  onBlur: field.onBlur,
                };

                // Email field
                if (type === FieldType.Email) {
                  return (
                    <EmailInput
                      {...controllerInputProps}
                      label={label}
                      required={required}
                      disabled={isFieldDisabled}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                      placeholder={placeholder}
                    />
                  );
                }

                // Phone field
                if (type === FieldType.Phone) {
                  return (
                    <PhoneInput
                      {...controllerInputProps}
                      label={label}
                      required={required}
                      disabled={isFieldDisabled}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                      placeholder={placeholder}
                    />
                  );
                }

                // Select field
                if (type === FieldType.Select) {
                  return (
                    <SelectInput
                      {...controllerInputProps}
                      label={label}
                      required={required}
                      disabled={isFieldDisabled}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                      options={options}
                      placeholder={placeholder}
                    />
                  );
                }

                // Autocomplete/Dropdown field
                if (type === FieldType.Autocomplete) {
                  return (
                    <AutocompleteInput
                      {...controllerInputProps}
                      label={label}
                      required={required}
                      disabled={isFieldDisabled}
                      error={!!fieldError}
                      helperText={fieldError?.message}
                      options={options}
                      sortOptions={sortOptions}
                      placeholder={placeholder}
                    />
                  );
                }

                // Default: Text field
                return (
                  <TextFieldInput
                    {...controllerInputProps}
                    type={type}
                    label={label}
                    required={required}
                    disabled={isFieldDisabled}
                    error={!!fieldError}
                    helperText={fieldError?.message}
                    placeholder={placeholder}
                  />
                );
              }}
            />
          </AppGrid>
        );
      })}
    </>
  );
};

export default AddressFormController;
