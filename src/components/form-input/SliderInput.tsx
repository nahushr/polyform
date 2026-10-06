import {
  AppBox,
  AppFormHelperText,
  AppSlider,
  AppTypography,
} from "@/components/material-ui-component-wrappers";

import styles from "./SliderInput.module.scss";

export interface SliderMark {
  value: number;
  label?: string | number;
}

export interface SliderInputProps {
  label: string;
  value: number | number[] | undefined;
  onChange: (value: number | number[]) => void;
  range?: boolean;
  min?: number;
  max?: number;
  step?: number | null;
  marks?: boolean | SliderMark[];
  valueLabelDisplay?: "auto" | "on" | "off";
  unit?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

const getSliderValue = (
  range: boolean,
  value: number | number[] | undefined,
  min: number,
  max: number,
): number | number[] => {
  if (range) return Array.isArray(value) ? value : [min, max];
  if (Array.isArray(value)) return value[0] ?? min;
  return value ?? min;
};

const SliderInput = ({
  label,
  value,
  onChange,
  range = false,
  min = 0,
  max = 100,
  step = 1,
  marks = false,
  valueLabelDisplay = "auto",
  unit = "",
  disabled = false,
  required = false,
  error = false,
  helperText,
}: SliderInputProps): JSX.Element => {
  const sliderValue = getSliderValue(range, value, min, max);

  const isPrefixUnit = ["$", "€", "£", "¥", "₹"].includes(unit);
  const formatValue = (currentValue: number): string =>
    isPrefixUnit ? `${unit}${currentValue}` : `${currentValue}${unit}`;

  const displayValue = Array.isArray(sliderValue)
    ? `${formatValue(sliderValue[0] ?? min)} – ${formatValue(sliderValue[1] ?? max)}`
    : formatValue(sliderValue);

  return (
    <AppBox className={styles.root}>
      <AppBox className={styles.heading}>
        <AppTypography component="div" variant="body2" className={styles.label}>
          {label}{required ? " *" : ""}
        </AppTypography>
        <AppTypography component="output" variant="body2" className={styles.value}>
          {displayValue}
        </AppTypography>
      </AppBox>
      <AppSlider
        aria-label={range ? undefined : label}
        getAriaLabel={range ? (index) => `${label} ${index === 0 ? "minimum" : "maximum"}` : undefined}
        value={sliderValue}
        onChange={(_event, nextValue) => onChange(nextValue)}
        min={min}
        max={max}
        step={step}
        marks={marks}
        valueLabelDisplay={valueLabelDisplay}
        valueLabelFormat={formatValue}
        disabled={disabled}
        className={error ? styles.error : undefined}
      />
      {helperText && (
        <AppFormHelperText error={error}>{helperText}</AppFormHelperText>
      )}
    </AppBox>
  );
};

export default SliderInput;
