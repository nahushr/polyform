// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import LazyAutocompleteInput, {
  type LazyFetchFunction,
} from "../../src/components/form-input/LazyAutocompleteInput";

describe("LazyAutocompleteInput", () => {
  let cleanup: (() => void) | undefined;

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
  });

  it("syncs a fetched option to the raw value", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    const option = { value: 42, label: "Avery Morgan" };
    const fetchOptions = vi.fn<LazyFetchFunction>().mockResolvedValue({
      options: [option],
      hasMore: false,
    });
    cleanup = () => {
      act(() => root.unmount());
      container.remove();
    };

    await act(async () => {
      root.render(
        <LazyAutocompleteInput
          disablePortal
          label="Assigned agent"
          openOnFocus
          value={option.value}
          fetchOptions={fetchOptions}
        />,
      );
    });

    const input = container.querySelector("input");
    expect(input).not.toBeNull();
    await act(async () => {
      input?.focus();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetchOptions).toHaveBeenCalled();
    expect(input?.value).toBe("Avery Morgan");
  });
});
