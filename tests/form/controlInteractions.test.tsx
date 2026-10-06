// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import DemoApp from "../../examples/vite-demo/src/App";
import { DevicePreview } from "../../examples/vite-demo/src/components/DevicePreview";
import ColorPickerInput from "../../src/components/form-input/ColorPickerInput";
import DateRangePickerInput from "../../src/components/form-input/DateRangePickerInput";
import ImageSlotsUpload from "../../src/components/form-input/ImageSlotsUpload";
import KeyValueInput from "../../src/components/form-input/KeyValueInput";
import KeyValueSelectInput from "../../src/components/form-input/KeyValueSelectInput";
import MultipleImageUploadInput from "../../src/components/form-input/MultipleImageUploadInput";
import TextFieldInput from "../../src/components/form-input/TextFieldInput";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

const mount = (element: JSX.Element): HTMLDivElement => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  act(() => root.render(element));
  return container;
};

const setInputValue = (input: HTMLInputElement, value: string): void => {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
};

describe("form control interactions", () => {
  it("formats numeric input while preserving editable decimals and raw values", () => {
    const onChange = vi.fn();
    const onBlur = vi.fn();
    const container = mount(
      <TextFieldInput
        label="Amount"
        type="number"
        value={12345}
        onChange={onChange}
        onBlur={onBlur}
      />,
    );
    const input = container.querySelector("input");
    expect(input?.value).toBe("12,345");
    if (!input) throw new Error("Amount field did not render.");

    act(() => setInputValue(input, "1234."));
    expect(input.value).toBe("1,234.");
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
      target: expect.objectContaining({ value: "1234" }),
    }));

    act(() => setInputValue(input, "-4"));
    expect(input.value).toBe("-4");
    act(() => setInputValue(input, ""));
    expect(input.value).toBe("");

    act(() => {
      input.focus();
      input.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
    });
    expect(onBlur).toHaveBeenCalled();
  });

  it("adds, edits, and removes key/value rows", () => {
    const onChange = vi.fn();
    const container = mount(
      <KeyValueInput
        label="Metadata"
        value={[{ key: "region", value: "west" }]}
        onChange={onChange}
      />,
    );
    const key = container.querySelector<HTMLInputElement>('[aria-label="Key 1"]');
    expect(key).not.toBeNull();
    if (!key) throw new Error("Metadata key input did not render.");

    act(() => setInputValue(key, "zone"));
    expect(onChange).toHaveBeenLastCalledWith([{ key: "zone", value: "west" }]);

    const addButton = Array.from(container.querySelectorAll("button"))
      .find((button) => button.textContent?.includes("Add pair"));
    expect(addButton).toBeDefined();
    act(() => addButton?.click());
    expect(onChange).toHaveBeenLastCalledWith([
      { key: "region", value: "west" },
      { key: "", value: "" },
    ]);

    const removeButton = container.querySelector<HTMLButtonElement>(
      '[aria-label="Remove pair 1"]',
    );
    act(() => removeButton?.click());
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("adds and removes rows in the selectable metadata editor", () => {
    const onChange = vi.fn();
    const container = mount(
      <KeyValueSelectInput
        label="Environment metadata"
        value={[{ key: "env", value: "prod" }]}
        keyOptions={[{ value: "env", label: "Environment" }]}
        valueOptionsByKey={{ env: [{ value: "prod", label: "Production" }] }}
        onChange={onChange}
      />,
    );
    expect(container.textContent).toContain("Production");
    const addButton = Array.from(container.querySelectorAll("button"))
      .find((button) => button.textContent?.includes("Add dropdown pair"));
    expect(addButton).toBeDefined();
    act(() => addButton?.click());
    expect(onChange).toHaveBeenLastCalledWith([
      { key: "env", value: "prod" },
      { key: "", value: "" },
    ]);

    act(() => container.querySelector<HTMLButtonElement>(
      'button[aria-label="Remove pair 1"]',
    )?.click());
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("removes selected uploaded images from both upload layouts", () => {
    const onMultipleChange = vi.fn();
    const multiple = mount(
      <MultipleImageUploadInput
        label="Gallery"
        value={{ "cover.png": "data:image/png;base64,AA==" }}
        onChange={onMultipleChange}
      />,
    );
    const removeMultipleImage = multiple.querySelector<HTMLButtonElement>(
      'button[aria-label="Remove cover.png"]',
    );
    expect(removeMultipleImage).not.toBeNull();
    act(() => removeMultipleImage?.dispatchEvent(new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    })));
    expect(onMultipleChange).toHaveBeenCalledWith({});

    cleanup?.();
    cleanup = undefined;
    const onSlotsChange = vi.fn();
    const slots = mount(
      <ImageSlotsUpload
        slots={[{ label: "Front", required: true }, { label: "Back" }]}
        values={["data:image/png;base64,AA=="]}
        onChange={onSlotsChange}
      />,
    );
    act(() => slots.querySelector<HTMLButtonElement>(
      '[aria-label="Remove Front"]',
    )?.click());
    expect(onSlotsChange).toHaveBeenCalledWith(["", ""]);
  });

  it("opens the color and date-range pickers and applies their selections", () => {
    const onColorChange = vi.fn();
    const color = mount(
      <ColorPickerInput label="Brand color" value="#abc" onChange={onColorChange} />,
    );
    expect(color.querySelector<HTMLInputElement>('input[type="color"]')?.value).toBe("#aabbcc");
    act(() => color.querySelector<HTMLInputElement>('input[type="text"]')?.click());
    expect(document.body.textContent).toContain("Choose a color");
    act(() => {
      const picker = document.body.querySelector<HTMLInputElement>('input[aria-label="Color picker"]');
      if (picker) setInputValue(picker, "#112233");
    });
    expect(onColorChange).toHaveBeenCalledWith("#112233");

    cleanup?.();
    cleanup = undefined;
    const onRangeChange = vi.fn();
    const range = mount(
      <DateRangePickerInput
        label="Booking dates"
        value={{ start: new Date(2026, 4, 1), end: new Date(2026, 4, 8) }}
        onChange={onRangeChange}
      />,
    );
    act(() => range.querySelector<HTMLInputElement>('input[placeholder="Select a date range"]')?.click());
    expect(document.body.textContent).toContain("Choose a date range");
    const clearButton = Array.from(document.body.querySelectorAll("button"))
      .find((button) => button.textContent?.includes("Clear range"));
    expect(clearButton).toBeDefined();
    act(() => clearButton?.click());
    expect(onRangeChange).toHaveBeenCalledWith({ start: null, end: null });
  });

  it("validates and reads multiple image uploads and assigns duplicate names", async () => {
    const onChange = vi.fn();
    const container = mount(
      <MultipleImageUploadInput
        label="Gallery"
        value={{ "cover.png": "data:image/png;base64,AA==" }}
        maxFiles={4}
        onChange={onChange}
      />,
    );
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();
    if (!input) throw new Error("Gallery upload input did not render.");

    const files = [
      new File(["duplicate"], "cover.png", { type: "image/png" }),
      new File(["not an image"], "notes.txt", { type: "text/plain" }),
      new File(["new image"], "team.png", { type: "image/png" }),
    ];
    Object.defineProperty(input, "files", { configurable: true, value: files });
    await act(async () => {
      input.dispatchEvent(new Event("change", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    const uploadedImages = onChange.mock.calls.at(-1)?.[0] as Record<string, string>;
    expect(uploadedImages).toHaveProperty("cover (2).png");
    expect(uploadedImages).toHaveProperty("team.png");
    expect(container.textContent).toContain("notes.txt is not an image.");
  });

  it("switches the device preview between desktop and phone", () => {
    const container = mount(
      <DevicePreview label="Form"><span>Preview form</span></DevicePreview>,
    );
    const phoneButton = Array.from(container.querySelectorAll("button"))
      .find((button) => button.textContent?.includes("Phone"));
    expect(phoneButton).toBeDefined();
    act(() => phoneButton?.click());
    expect(container.querySelector('[aria-label="Form phone-sized preview"]')).not.toBeNull();
    expect(container.querySelector(".device-preview__status")).not.toBeNull();

    const desktopButton = Array.from(container.querySelectorAll("button"))
      .find((button) => button.textContent?.includes("Desktop"));
    act(() => desktopButton?.click());
    expect(container.querySelector('[aria-label="Form desktop preview"]')).not.toBeNull();
  });

  it("submits the example form and shows the submitted JSON", async () => {
    const container = mount(<DemoApp />);
    const submitButton = Array.from(container.querySelectorAll("button"))
      .find((button) => button.textContent?.trim() === "Submit");
    expect(submitButton).toBeDefined();

    await act(async () => {
      submitButton?.click();
      await Promise.resolve();
    });

    expect(container.textContent).toContain("Submitted form values");
    expect(container.querySelector("pre")?.textContent).toContain('"firstName": "Avery"');

    const lazySearch = container.querySelector<HTMLInputElement>('input[placeholder="Search agents"]');
    await act(async () => {
      lazySearch?.focus();
      if (lazySearch) setInputValue(lazySearch, "Avery");
      await new Promise((resolve) => setTimeout(resolve, 300));
    });
    const viewToggle = container.querySelector<HTMLInputElement>(
      'input[aria-label="Toggle form view mode"]',
    );
    act(() => viewToggle?.click());
    expect(container.textContent).toContain("View mode");
  });
});
