import { useRef, useState } from "react";

import { AppButton } from "../material-ui-component-wrappers";
import { fillRegisteredPolyForms } from "./testFillRegistry";
import styles from "./PolyFormTestFillButton.module.scss";

export interface PolyFormTestFillButtonProps {
  /** Add a class for application-specific button styling. */
  className?: string;
}

/** Fills every registered PolyForm in the nearest form with realistic sample data. */
const PolyFormTestFillButton = ({
  className,
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
      const skipped = result.skipped ? ` · ${result.skipped} skipped` : "";
      setStatus(
        result.message ?? `Filled ${result.filled} fields${skipped}.`,
      );
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
