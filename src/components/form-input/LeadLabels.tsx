import { useMemo, useState } from "react";

import {
  AppAutocomplete,
  AppBox,
  AppButton,
  AppButtonBase,
  AppChip,
  AppDialog,
  AppDialogActions,
  AppDialogContent,
  AppDialogTitle,
  AppTextField,
  AppTypography,
} from "@/components/material-ui-component-wrappers";

import formStyles from "../../styles/FormInput.module.scss";
import styles from "./LeadLabels.module.scss";

/** Label shape shared by the label picker and its consumers. */
export interface LeadLabelOption {
  labelId?: number;
  name: string;
  description?: string;
  color: string;
}

export interface LeadLabelsProps {
  value: LeadLabelOption[];
  options: LeadLabelOption[];
  onChange?: (labels: LeadLabelOption[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

interface CreateLeadLabelOption {
  kind: "create";
  name: string;
  description: string;
  color: string;
}

type SelectableLabel = LeadLabelOption | CreateLeadLabelOption;

const colorPalette = [
  { key: "blue", hex: "#84B6EB" },
  { key: "green", hex: "#BFE5BF" },
  { key: "red", hex: "#F6C6C7" },
  { key: "purple", hex: "#D4C5F9" },
  { key: "yellow", hex: "#F9D77E" },
  { key: "orange", hex: "#F7C6A3" },
  { key: "teal", hex: "#A7E3DC" },
  { key: "gray", hex: "#D0D7DE" },
  { key: "pink", hex: "#F7C1D9" },
] as const;

const getLabelKey = (label: LeadLabelOption): string =>
  label.labelId == null
    ? `new:${label.name.toLowerCase()}`
    : String(label.labelId);

const isCreateOption = (
  option: SelectableLabel,
): option is CreateLeadLabelOption => "kind" in option;

const getColorChoiceClassName = (colorKey: string, selected: boolean): string => {
  const colorClass = styles[`label-color-${colorKey}`] ?? "";
  const selectedClass = selected ? styles.colorChoiceSelected : "";
  return [styles.colorChoice, colorClass, selectedClass].filter(Boolean).join(" ");
};

const parseHexColor = (color: string): [number, number, number] | undefined => {
  const normalized = color.trim().replace(/^#/, "");
  const expanded = normalized.length === 3
    ? normalized.split("").map((character) => `${character}${character}`).join("")
    : normalized;
  if (!/^[0-9a-f]{6}$/i.test(expanded)) return undefined;
  return [
    Number.parseInt(expanded.slice(0, 2), 16),
    Number.parseInt(expanded.slice(2, 4), 16),
    Number.parseInt(expanded.slice(4, 6), 16),
  ];
};

const getColorClass = (color: string): string => {
  const rgb = parseHexColor(color);
  if (!rgb) return styles["label-color-blue"];
  const closest = colorPalette.reduce<{ key: string; distance: number }>(
    (best, candidate) => {
      const candidateRgb = parseHexColor(candidate.hex) as [number, number, number];
      const distance = rgb.reduce(
        (sum, channel, index) => sum + (channel - candidateRgb[index]) ** 2,
        0,
      );
      return distance < best.distance ? { key: candidate.key, distance } : best;
    },
    { key: colorPalette[0].key, distance: Number.POSITIVE_INFINITY },
  );
  return styles[`label-color-${closest.key}`];
};

/** Searchable lead label picker with colored removable chips and label creation. */
const LeadLabels = ({
  value,
  options,
  onChange,
  disabled = false,
  readOnly = false,
  label = "Labels",
  required = false,
  error = false,
  helperText,
}: LeadLabelsProps): JSX.Element => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelDescription, setNewLabelDescription] = useState("");
  const [newLabelColorKey, setNewLabelColorKey] = useState<string>("blue");

  const selectableOptions = useMemo(() => {
    const uniqueOptions = new Map<string, LeadLabelOption>();
    [...options, ...value].forEach((option) =>
      uniqueOptions.set(getLabelKey(option), option),
    );
    return [...uniqueOptions.values()].sort((left, right) =>
      left.name.localeCompare(right.name),
    );
  }, [options, value]);

  const handleChange = (_event: React.SyntheticEvent, selected: SelectableLabel[]): void => {
    const createOption = selected.find(isCreateOption);
    if (createOption) {
      const prefix = 'Create "';
      const optionName = createOption.name;
      const labelName = optionName.startsWith(prefix) && optionName.endsWith('"')
        ? optionName.slice(prefix.length, -1)
        : optionName;
      setNewLabelName(labelName);
      setCreateDialogOpen(true);
      return;
    }
    onChange?.(selected as LeadLabelOption[]);
  };

  const createLabel = (): void => {
    const name = newLabelName.trim();
    if (!name) return;
    const exists = [...options, ...value].some(
      (option) => option.name.toLowerCase() === name.toLowerCase(),
    );
    if (!exists) {
      const color = colorPalette.find(({ key }) => key === newLabelColorKey) ?? colorPalette[0];
      onChange?.([
        ...value,
        {
          name,
          description: newLabelDescription.trim(),
          color: color.hex,
        },
      ]);
    }
    setCreateDialogOpen(false);
    setNewLabelName("");
    setNewLabelDescription("");
    setNewLabelColorKey("blue");
  };

  if (readOnly) {
    return (
      <AppBox className={styles.root}>
        <AppTypography variant="caption" color="text.secondary">
          {label}
        </AppTypography>
        {value.length > 0 ? (
          <AppBox className={styles.readonlyList}>
            {value.map((option) => (
              <AppChip
                key={getLabelKey(option)}
                label={option.name}
                size="small"
                title={option.description || option.name}
                className={`${styles.labelChip} ${getColorClass(option.color)}`}
              />
            ))}
          </AppBox>
        ) : (
          <AppTypography variant="body2">—</AppTypography>
        )}
      </AppBox>
    );
  }

  return (
    <AppBox className={styles.root}>
      <AppAutocomplete<SelectableLabel, true, false, false>
        className={styles.autocomplete}
        multiple
        disableCloseOnSelect
        options={selectableOptions}
        value={value}
        disabled={disabled}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, selected) =>
          !isCreateOption(option) &&
          !isCreateOption(selected) &&
          getLabelKey(option) === getLabelKey(selected)
        }
        filterOptions={(availableOptions, params) => {
          const query = params.inputValue.trim().toLowerCase();
          const filtered = availableOptions.filter((option) =>
            `${option.name} ${"description" in option ? option.description ?? "" : ""}`
              .toLowerCase()
              .includes(query),
          );
          const exactMatch = availableOptions.some(
            (option) => option.name.toLowerCase() === query,
          );
          if (query && !exactMatch) {
            filtered.push({
              kind: "create",
              name: `Create "${params.inputValue.trim()}"`,
              description: "Create a new label",
              color: colorPalette.find(({ key }) => key === newLabelColorKey)?.hex ?? colorPalette[0].hex,
            });
          }
          return filtered;
        }}
        onChange={handleChange}
        renderTags={(selected, getTagProps) =>
          selected.map((option, index) => {
            if (isCreateOption(option)) return null;
            const { key, className: tagClassName, ...tagProps } =
              getTagProps({ index });
            return (
              <AppChip
                key={key}
                label={option.name}
                size="small"
                title={option.description || option.name}
                {...tagProps}
                className={`${tagClassName ?? ""} ${styles.labelChip} ${getColorClass(option.color)}`}
              />
            );
          })
        }
        renderOption={(props, option, { selected }) => {
          const { className: optionClassName, ...optionProps } = props;
          return (
            <li
              {...optionProps}
              key={isCreateOption(option) ? `create-${option.name}` : getLabelKey(option)}
              className={`${optionClassName ?? ""} ${styles.option}`}
            >
            <AppBox
              component="span"
              className={`${styles.colorDot} ${getColorClass(option.color)}`}
            />
            <AppBox className={styles.optionContent}>
              <AppTypography variant="body2">{option.name}</AppTypography>
              <AppTypography variant="caption" color="text.secondary">
                {option.description || "No description"}
              </AppTypography>
            </AppBox>
            {selected && !isCreateOption(option) && (
              <AppTypography variant="caption" color="text.secondary">
                Selected
              </AppTypography>
            )}
            </li>
          );
        }}
        renderInput={(params) => (
          <AppTextField
            {...params}
            variant="filled"
            label={label}
            required={required}
            error={error}
            helperText={helperText}
            placeholder={value.length ? undefined : "Search and select labels"}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              ...params.InputProps,
              disableUnderline: true,
            }}
            className={formStyles["filled-input"]}
          />
        )}
        ListboxProps={{ className: styles.listbox }}
      />

      <AppDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <AppDialogTitle>Create lead label</AppDialogTitle>
        <AppDialogContent className={styles.createContent}>
          <AppTextField
            autoFocus
            label="Label name"
            value={newLabelName}
            onChange={(event) => setNewLabelName(event.target.value)}
            required
            inputProps={{ maxLength: 100 }}
          />
          <AppTextField
            label="Short description"
            value={newLabelDescription}
            onChange={(event) => setNewLabelDescription(event.target.value)}
            inputProps={{ maxLength: 255 }}
          />
          <AppBox className={styles.colorPalette} role="radiogroup" aria-label="Label color">
            {colorPalette.map((color) => (
              <AppButtonBase
                key={color.key}
                type="button"
                role="radio"
                aria-checked={newLabelColorKey === color.key}
                aria-label={`${color.key} label color`}
                className={getColorChoiceClassName(
                  color.key,
                  newLabelColorKey === color.key,
                )}
                onClick={() => setNewLabelColorKey(color.key)}
              >
                {newLabelColorKey === color.key && (
                  <AppBox component="span" className={styles.colorChoiceCheck}>
                    ✓
                  </AppBox>
                )}
              </AppButtonBase>
            ))}
          </AppBox>
        </AppDialogContent>
        <AppDialogActions>
          <AppButton onClick={() => setCreateDialogOpen(false)} color="inherit">
            Cancel
          </AppButton>
          <AppButton
            onClick={createLabel}
            disabled={!newLabelName.trim()}
            variant="contained"
          >
            Create label
          </AppButton>
        </AppDialogActions>
      </AppDialog>
    </AppBox>
  );
};

export default LeadLabels;
