import type { ReactNode } from "react";
import { useId } from "react";

import {
  AppButton,
  AppDialog,
  AppDialogActions,
  AppDialogContent,
  AppIconButton,
  AppTypography,
} from "../material-ui-component-wrappers";
import styles from "./PolyFormModal.module.scss";

export interface PolyFormModalClassNames {
  paper?: string;
  header?: string;
  title?: string;
  subtitle?: string;
  closeButton?: string;
  content?: string;
  actions?: string;
}

export interface PolyFormModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  fullWidth?: boolean;
  closeButtonLabel?: string;
  closeButtonTestId?: string;
  disableCloseButton?: boolean;
  dataTestId?: string;
  classNames?: PolyFormModalClassNames;
}

const join = (...values: Array<string | undefined>): string =>
  values.filter(Boolean).join(" ");

/** The shared, theme-owned modal shell for PolyForm and consuming component libraries. */
export const PolyFormModal = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  actions,
  maxWidth = "md",
  fullWidth = true,
  closeButtonLabel = "Close dialog",
  closeButtonTestId,
  disableCloseButton = false,
  dataTestId,
  classNames = {},
}: Readonly<PolyFormModalProps>): JSX.Element => {
  const titleId = useId();
  const subtitleId = useId();

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      aria-labelledby={titleId}
      aria-describedby={subtitle ? subtitleId : undefined}
      data-test-id={dataTestId}
      PaperProps={{
        className: join(styles.paper, classNames.paper),
      }}
    >
      <header className={join(styles.header, classNames.header)}>
        <div className={styles.heading}>
          <AppTypography
            id={titleId}
            component="h2"
            className={join(styles.title, classNames.title)}
          >
            {title}
          </AppTypography>
          {subtitle && (
            <AppTypography
              id={subtitleId}
              component="p"
              className={join(styles.subtitle, classNames.subtitle)}
            >
              {subtitle}
            </AppTypography>
          )}
        </div>
        {!disableCloseButton && (
          <AppIconButton
            aria-label={closeButtonLabel}
            title={closeButtonLabel}
            data-test-id={closeButtonTestId}
            className={join(styles.closeButton, classNames.closeButton)}
            onClick={onClose}
            size="small"
          >
            <span aria-hidden="true">×</span>
          </AppIconButton>
        )}
      </header>
      <AppDialogContent className={join(styles.content, classNames.content)}>
        {children}
      </AppDialogContent>
      {actions != null && (
        <AppDialogActions className={join(styles.actions, classNames.actions)}>
          {actions}
        </AppDialogActions>
      )}
    </AppDialog>
  );
};

export interface PolyFormModalButtonProps {
  children: ReactNode;
  form?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  appearance?: "primary" | "secondary" | "danger";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  className?: string;
  dataTestId?: string;
}

/** Buttons that share the modal footer's spacing and type scale. */
export const PolyFormModalButton = ({
  children,
  form,
  type = "button",
  disabled = false,
  onClick,
  appearance = "secondary",
  startIcon,
  endIcon,
  className,
  dataTestId,
}: Readonly<PolyFormModalButtonProps>): JSX.Element => (
  <AppButton
    data-test-id={dataTestId}
    form={form}
    type={type}
    disabled={disabled}
    onClick={onClick}
    startIcon={startIcon}
    endIcon={endIcon}
    variant={appearance === "primary" ? "contained" : "outlined"}
    color={appearance === "danger" ? "error" : "primary"}
    className={join(styles.actionButton, styles[appearance], className)}
  >
    {children}
  </AppButton>
);

export default PolyFormModal;
