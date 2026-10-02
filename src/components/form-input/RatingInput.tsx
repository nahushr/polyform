import {
  AppBox,
  AppFormHelperText,
  AppRating,
  AppTypography,
} from "@/components/material-ui-component-wrappers";

import styles from "./RatingInput.module.scss";

export interface RatingInputProps {
  label: string;
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  max?: number;
  precision?: number;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

const RatingInput = ({
  label,
  value,
  onChange,
  max = 5,
  precision = 1,
  disabled = false,
  required = false,
  error = false,
  helperText,
}: RatingInputProps): JSX.Element => (
  <AppBox className={styles.root}>
    <AppTypography component="div" variant="body2" className={styles.label}>
      {label}{required ? " *" : ""}
    </AppTypography>
    <AppRating
      aria-label={label}
      max={max}
      precision={precision}
      value={value ?? null}
      onChange={(_event, nextValue) => onChange(nextValue)}
      disabled={disabled}
      className={styles.stars}
    />
    {helperText && (
      <AppFormHelperText error={error}>{helperText}</AppFormHelperText>
    )}
  </AppBox>
);

export default RatingInput;
