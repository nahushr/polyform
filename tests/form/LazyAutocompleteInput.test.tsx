// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import LazyAutocompleteInput, {
  type LazyFetchFunction,
} from "../../src/components/form-input/LazyAutocompleteInput";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

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
    const nextOption = { value: 43, label: "Jordan Lee" };
    const fetchOptions = vi.fn<LazyFetchFunction>()
      .mockResolvedValueOnce({ options: [option], hasMore: true })
      .mockResolvedValueOnce({ options: [nextOption], hasMore: false })
      .mockResolvedValue({ options: [option], hasMore: false });
    const onChange = vi.fn();
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
          onChange={onChange}
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

    const listbox = container.querySelector("ul");
    expect(listbox).not.toBeNull();
    if (listbox) {
      Object.defineProperties(listbox, {
        clientHeight: { configurable: true, value: 100, writable: true },
        scrollHeight: { configurable: true, value: 200, writable: true },
        scrollTop: { configurable: true, value: 100, writable: true },
      });
      await act(async () => {
        listbox.dispatchEvent(new Event("scroll", { bubbles: true }));
        await Promise.resolve();
        await Promise.resolve();
      });
    }

    expect(fetchOptions).toHaveBeenCalledTimes(2);
    await act(async () => {
      const nextOptionElement = Array.from(
        container.querySelectorAll<HTMLElement>('[role="option"]'),
      ).find((element) => element.textContent?.includes(nextOption.label));
      nextOptionElement?.click();
    });
    expect(onChange).toHaveBeenCalled();

    await act(async () => {
      root.render(
        <LazyAutocompleteInput
          disablePortal
          label="Assigned agent"
          value=""
          fetchOptions={fetchOptions}
          onChange={onChange}
        />,
      );
    });
    expect(input?.value).toBe("");

    await act(async () => {
      if (input) {
        const valueSetter = Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value",
        )?.set;
        valueSetter?.call(input, "Avery");
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
    });
    expect(fetchOptions).toHaveBeenCalledTimes(3);
  });
});
