export interface PolyFormTestFillResult {
  filled: number;
  skipped: number;
  message?: string;
}

export type PolyFormTestFillHandler = () => Promise<PolyFormTestFillResult>;

interface RegisteredPolyForm {
  root: HTMLElement;
  form: HTMLFormElement | null;
  handler: PolyFormTestFillHandler;
}

const registeredForms = new Set<RegisteredPolyForm>();

export const registerPolyFormFillHandler = (
  root: HTMLElement,
  handler: PolyFormTestFillHandler,
): (() => void) => {
  const entry: RegisteredPolyForm = {
    root,
    form: root.closest("form"),
    handler,
  };
  registeredForms.add(entry);

  return () => {
    registeredForms.delete(entry);
  };
};

export const fillRegisteredPolyForms = async (
  button: HTMLElement,
): Promise<PolyFormTestFillResult> => {
  const form = button.closest("form");
  const targets = [...registeredForms].filter((entry) =>
    form ? entry.form === form || form.contains(entry.root) : true,
  );

  if (targets.length === 0) {
    throw new Error(
      "Place this button and PolyForm inside the same form, or render it on a page with a mounted PolyForm.",
    );
  }

  const results = await Promise.all(targets.map(({ handler }) => handler()));
  return results.reduce<PolyFormTestFillResult>(
    (total, result) => ({
      filled: total.filled + result.filled,
      skipped: total.skipped + result.skipped,
      message: [total.message, result.message].filter(Boolean).join(" ") || undefined,
    }),
    { filled: 0, skipped: 0 },
  );
};
