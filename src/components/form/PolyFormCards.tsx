import type { ReactNode } from "react";
import type { ButtonProps } from "@mui/material/Button";

import {
  AppBox,
  AppButton,
  AppCheckbox,
  AppFormControlLabel,
  AppPaper,
  AppTypography,
} from "../material-ui-component-wrappers";
import styles from "./PolyFormCards.module.scss";

export interface PolyFormCardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  label?: string;
}

export const PolyFormCardGrid = ({
  children,
  columns = 3,
  className,
  label,
}: Readonly<PolyFormCardGridProps>): JSX.Element => (
  <AppBox
    className={[styles.grid, styles[`grid${columns}`], className]
      .filter(Boolean)
      .join(" ")}
    aria-label={label}
  >
    {children}
  </AppBox>
);

export interface PolyFormContentCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
  testId?: string;
}

export const PolyFormContentCard = ({
  title,
  subtitle,
  badge,
  children,
  className,
  testId,
}: Readonly<PolyFormContentCardProps>): JSX.Element => (
  <AppPaper
    component="section"
    elevation={0}
    className={[styles.card, className].filter(Boolean).join(" ")}
    aria-label={typeof title === "string" ? `${title} permissions` : undefined}
    data-test-id={testId}
  >
    <header className={styles.cardHeader}>
      <div className={styles.cardHeading}>
        <AppTypography component="h3" className={styles.cardTitle}>
          {title}
        </AppTypography>
        {subtitle && (
          <AppTypography component="p" className={styles.cardSubtitle}>
            {subtitle}
          </AppTypography>
        )}
      </div>
      {badge != null && <span className={styles.badge}>{badge}</span>}
    </header>
    <div className={styles.cardBody}>{children}</div>
  </AppPaper>
);

export interface PolyFormCheckboxOptionProps {
  checked: boolean;
  disabled?: boolean;
  label: string;
  description?: string;
  onChange: (checked: boolean) => void;
  testId?: string;
}

/** Shared choice row for grouped permission and capability cards. */
export const PolyFormCheckboxOption = ({
  checked,
  disabled = false,
  label,
  description,
  onChange,
  testId,
}: Readonly<PolyFormCheckboxOptionProps>): JSX.Element => (
  <AppFormControlLabel
    className={styles.option}
    data-test-id={testId}
    control={
      <AppCheckbox
        checked={checked}
        disabled={disabled}
        size="small"
        onChange={(_, nextChecked) => onChange(nextChecked)}
        inputProps={{ "aria-label": label }}
      />
    }
    label={
      <span className={styles.optionCopy}>
        <span className={styles.optionTitle}>{label}</span>
        {description && <span className={styles.optionDescription}>{description}</span>}
      </span>
    }
  />
);

export interface PolyFormActionRowProps {
  children: ReactNode;
  className?: string;
  testId?: string;
}

export const PolyFormActionRow = ({
  children,
  className,
  testId,
}: Readonly<PolyFormActionRowProps>): JSX.Element => (
  <div
    className={[styles.actionRow, className].filter(Boolean).join(" ")}
    data-test-id={testId}
  >
    {children}
  </div>
);

export interface PolyFormActionButtonProps extends Omit<ButtonProps, "color"> {
  appearance?: "primary" | "secondary";
}

export const PolyFormActionButton = ({
  appearance = "primary",
  className,
  ...props
}: Readonly<PolyFormActionButtonProps>): JSX.Element => (
  <AppButton
    {...props}
    className={[
      styles.actionButton,
      styles[`actionButton${appearance === "primary" ? "Primary" : "Secondary"}`],
      className,
    ].filter(Boolean).join(" ")}
  />
);

export interface PolyFormLayoutProps {
  children: ReactNode;
  className?: string;
  testId?: string;
}

export const PolyFormLayout = ({
  children,
  className,
  testId,
}: Readonly<PolyFormLayoutProps>): JSX.Element => (
  <div className={[styles.layout, className].filter(Boolean).join(" ")} data-test-id={testId}>
    {children}
  </div>
);

export interface PolyFormGridFrameProps {
  children: ReactNode;
  className?: string;
}

/** Consistent sizing wrapper for data grids embedded in a PolyForm card. */
export const PolyFormGridFrame = ({
  children,
  className,
}: Readonly<PolyFormGridFrameProps>): JSX.Element => (
  <div className={[styles.gridFrame, className].filter(Boolean).join(" ")}>
    {children}
  </div>
);

export default PolyFormCardGrid;
