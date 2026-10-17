import { useRef, useState } from "react";

import { AppButton } from "../material-ui-component-wrappers";
import { AutoAwesome } from "../material-ui-component-wrappers/icons";
import { fillRegisteredPolyForms } from "./testFillRegistry";
import styles from "./PolyFormTestFillButton.module.scss";

export interface PolyFormTestFillButtonProps {
  /** Add a class for application-specific button styling. */
  className?: string;
  /** Run application-specific sample data updates after registered forms are filled. */
  onAfterFill?: () => void | string | Promise<void | string>;
}

/** Fills every registered PolyForm in the nearest form with realistic sample data. */
const PolyFormTestFillButton = ({
  className,
  onAfterFill,
}: PolyFormTestFillButtonProps): JSX.Element => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [filling, setFilling] = useState(false);
  const [status, setStatus] = useState("");

  const handleFill = async (): Promise<void> => {
    if (!buttonRef.current || filling) return;
    setFilling(true);
    setStatus("");

    try {
      const result = await fillRegisteredPolyForms(buttonRef.current);
      const followUpMessage = await onAfterFill?.();
      const skipped = result.skipped ? ` · ${result.skipped} skipped` : "";
      const fillMessage = result.message ?? `Filled ${result.filled} fields${skipped}.`;
      setStatus([fillMessage, followUpMessage].filter(Boolean).join(" "));
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to fill this form.",
      );
    } finally {
      setFilling(false);
    }
  };

  return (
    <span className={styles.root}>
      <AppButton
        ref={buttonRef}
        type="button"
        variant="outlined"
        disabled={filling}
        aria-busy={filling}
        startIcon={<AutoAwesome />}
        className={[styles.button, className].filter(Boolean).join(" ")}
        onClick={() => void handleFill()}
      >
        {filling ? "Filling…" : "Fill test data"}
      </AppButton>
      <span className={styles.status} role="status" aria-live="polite">
        {status}
      </span>
    </span>
  );
};

export default PolyFormTestFillButton;
