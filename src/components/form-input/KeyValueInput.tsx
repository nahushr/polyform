import {
  AppBox,
  AppButton,
  AppFormHelperText,
  AppIconButton,
  AppTypography,
} from "@/components/material-ui-component-wrappers";
import { Delete as DeleteIcon } from "@/components/material-ui-component-wrappers/icons";

import TextFieldInput from "./TextFieldInput";
import styles from "./KeyValueInput.module.scss";

export interface KeyValueEntry {
  key: string;
  value: string;
}

export interface KeyValueInputProps {
  label: string;
  value: KeyValueEntry[] | undefined;
  onChange: (value: KeyValueEntry[]) => void;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  addButtonLabel?: string;
}

const KeyValueInput = ({
  label,
  value = [],
  onChange,
  disabled = false,
  required = false,
  error = false,
  helperText,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
  addButtonLabel = "Add pair",
}: KeyValueInputProps): JSX.Element => {
  const updateEntry = (
    index: number,
    property: keyof KeyValueEntry,
    nextValue: string,
  ): void => {
    onChange(
      value.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [property]: nextValue } : entry,
      ),
    );
  };

  const removeEntry = (index: number): void =>
    onChange(value.filter((_entry, entryIndex) => entryIndex !== index));

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
          <AppBox role="row" key={index} className={styles.row}>
            <TextFieldInput
              fullWidth
              value={entry.key}
              placeholder={keyPlaceholder}
              disabled={disabled}
              error={error}
              inputProps={{ "aria-label": `Key ${index + 1}` }}
              onChange={(event) => updateEntry(index, "key", event.target.value)}
            />
            <TextFieldInput
              fullWidth
              value={entry.value}
              placeholder={valuePlaceholder}
              disabled={disabled}
              error={error}
              inputProps={{ "aria-label": `Value ${index + 1}` }}
              onChange={(event) => updateEntry(index, "value", event.target.value)}
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
        onClick={() => onChange([...value, { key: "", value: "" }])}
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

export default KeyValueInput;
