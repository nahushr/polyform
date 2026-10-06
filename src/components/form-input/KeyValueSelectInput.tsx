import { useId, useRef } from "react";

import {
  AppBox,
  AppButton,
  AppFormHelperText,
  AppIconButton,
  AppTypography,
} from "@/components/material-ui-component-wrappers";
import { Delete as DeleteIcon } from "@/components/material-ui-component-wrappers/icons";

import SelectInput from "./SelectInput";
import type { KeyValueEntry } from "./KeyValueInput";
import styles from "./KeyValueInput.module.scss";

export interface KeyValueSelectOption {
  value: string | number;
  label: string;
}

export interface KeyValueSelectInputProps {
  label: string;
  value: KeyValueEntry[] | undefined;
  onChange: (value: KeyValueEntry[]) => void;
  keyOptions: KeyValueSelectOption[];
  valueOptions?: KeyValueSelectOption[];
  valueOptionsByKey?: Record<string, KeyValueSelectOption[]>;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  addButtonLabel?: string;
}

const normalizeOptions = (
  options: KeyValueSelectOption[],
): Array<{ value: string; label: string }> =>
  options.map((option) => ({
    value: String(option.value),
    label: option.label,
  }));

const KeyValueSelectInput = ({
  label,
  value = [],
  onChange,
  keyOptions,
  valueOptions = [],
  valueOptionsByKey = {},
  disabled = false,
  required = false,
  error = false,
  helperText,
  keyPlaceholder = "Choose a key",
  valuePlaceholder = "Choose a value",
  addButtonLabel = "Add dropdown pair",
}: KeyValueSelectInputProps): JSX.Element => {
  const idPrefix = useId();
  const nextId = useRef(0);
  const rowIds = useRef<string[]>([]);
  while (rowIds.current.length < value.length) {
    rowIds.current.push(`${idPrefix}-row-${nextId.current++}`);
  }
  if (rowIds.current.length > value.length) rowIds.current.length = value.length;

  const getValueOptions = (key: string): KeyValueSelectOption[] =>
    valueOptionsByKey[key] ?? valueOptions;

  const updateEntry = (
    index: number,
    property: keyof KeyValueEntry,
    nextValue: string,
  ): void => {
    const nextEntries = value.map((entry, entryIndex) => {
      if (entryIndex !== index) return entry;
      if (property === "key") {
        const selectedValueIsValid = getValueOptions(nextValue).some(
          (option) => String(option.value) === entry.value,
        );
        return {
          key: nextValue,
          value: selectedValueIsValid ? entry.value : "",
        };
      }
      return { ...entry, value: nextValue };
    });
    onChange(nextEntries);
  };

  const removeEntry = (index: number): void => {
    rowIds.current.splice(index, 1);
    onChange(value.filter((_entry, entryIndex) => entryIndex !== index));
  };

  const addEntry = (): void => {
    rowIds.current.push(`${idPrefix}-row-${nextId.current++}`);
    onChange([...value, { key: "", value: "" }]);
  };

  return (
    <AppBox className={styles.root}>
      <AppTypography component="div" variant="body2" className={styles.label}>
        {label}{required ? " *" : ""}
      </AppTypography>
      <AppBox role="table" aria-label={label} className={styles.table}>
        <AppBox role="row" className={styles.header}>
          <AppTypography role="columnheader" component="div" variant="caption">
            Key
          </AppTypography>
          <AppTypography role="columnheader" component="div" variant="caption">
            Value
          </AppTypography>
          <AppBox role="columnheader" aria-label="Actions" />
        </AppBox>
        {value.map((entry, index) => (
          <AppBox role="row" key={rowIds.current[index]} className={styles.row}>
            <SelectInput
              fullWidth
              value={entry.key}
              options={normalizeOptions(keyOptions)}
              placeholder={keyPlaceholder}
              disabled={disabled}
              required={required}
              error={error}
              inputProps={{ "aria-label": `Key ${index + 1}` }}
              onChange={(event) =>
                updateEntry(index, "key", String(event.target.value))
              }
            />
            <SelectInput
              fullWidth
              value={entry.value}
              options={normalizeOptions(getValueOptions(entry.key))}
              placeholder={valuePlaceholder}
              disabled={disabled || !entry.key}
              required={required}
              error={error}
              inputProps={{ "aria-label": `Value ${index + 1}` }}
              onChange={(event) =>
                updateEntry(index, "value", String(event.target.value))
              }
            />
            <AppIconButton
              aria-label={`Remove pair ${index + 1}`}
              disabled={disabled}
              onClick={() => removeEntry(index)}
              className={styles.removeButton}
            >
              <DeleteIcon fontSize="small" />
            </AppIconButton>
          </AppBox>
        ))}
      </AppBox>
      <AppButton
        type="button"
        variant="outlined"
        size="small"
        disabled={disabled}
        onClick={addEntry}
        className={styles.addButton}
      >
        {addButtonLabel}
      </AppButton>
      {helperText && (
        <AppFormHelperText error={error}>{helperText}</AppFormHelperText>
      )}
    </AppBox>
  );
};

export default KeyValueSelectInput;
