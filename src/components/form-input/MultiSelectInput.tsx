import {
  AppAutocomplete,
  AppBox,
  AppCheckbox,
  AppChip,
  AppTextField,
} from "@/components/material-ui-component-wrappers";

import type { FieldOption } from "../form/PolyForm";
import formStyles from "../../styles/FormInput.module.scss";
import styles from "./MultiSelectInput.module.scss";

export interface MultiSelectInputProps {
  options: FieldOption[];
  value?: Array<string | number>;
  onChange: (value: Array<string | number>) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  sortOptions?: boolean;
}

/** Searchable chip multi-select styled consistently with the form inputs. */
const MultiSelectInput = ({
  options,
  value = [],
  onChange,
  label,
  placeholder,
  required = false,
  disabled = false,
  error = false,
  helperText,
  sortOptions = false,
}: MultiSelectInputProps): JSX.Element => {
  const selectedOptions = options.filter((option) => value.includes(option.value));
  const availableOptions = sortOptions
    ? [...options].sort((left, right) => left.label.localeCompare(right.label))
    : options;

  return (
    <AppBox className={styles.root}>
      <AppAutocomplete<FieldOption, true, false, false>
        className={styles.autocomplete}
        multiple
        disableCloseOnSelect
        options={availableOptions}
        value={selectedOptions}
        disabled={disabled}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, selected) =>
          option.value === selected.value
        }
        onChange={(_event, selected) =>
          onChange(selected.map((option) => option.value))
        }
        renderTags={(selected, getTagProps) =>
          selected.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index });
            return (
              <AppChip
                key={key}
                label={option.label}
                size="small"
                {...tagProps}
              />
            );
          })
        }
        renderOption={(props, option, { selected }) => (
          <li
            {...props}
            key={option.value}
            className={`${props.className ?? ""} ${styles.option}`}
          >
            <AppCheckbox checked={selected} size="small" />
            <span>{option.label}</span>
          </li>
        )}
        ListboxProps={{ className: styles.listbox }}
        renderInput={(params) => (
          <AppTextField
            {...params}
            variant="filled"
            label={label}
            required={required}
            error={error}
            placeholder={selectedOptions.length ? undefined : placeholder}
            helperText={helperText}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              ...params.InputProps,
              disableUnderline: true,
            }}
            className={formStyles["filled-input"]}
          />
        )}
      />
    </AppBox>
  );
};

export default MultiSelectInput;
