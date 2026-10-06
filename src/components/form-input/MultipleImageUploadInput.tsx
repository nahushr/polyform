import { useRef, useState } from "react";

import {
  AppBox,
  AppButton,
  AppFormHelperText,
  AppIconButton,
  AppTooltip,
  AppTypography,
} from "@/components/material-ui-component-wrappers";
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
} from "@/components/material-ui-component-wrappers/icons";

import styles from "./MultipleImageUploadInput.module.scss";

export interface MultipleImageUploadInputProps {
  value: Record<string, string>;
  onChange: (attachments: Record<string, string>) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  label?: string;
}

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error(`Could not read ${file.name}.`));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });

const getUniqueFileName = (name: string, existingNames: Set<string>): string => {
  if (!existingNames.has(name)) return name;
  const lastDot = name.lastIndexOf(".");
  const baseName = lastDot > 0 ? name.slice(0, lastDot) : name;
  const extension = lastDot > 0 ? name.slice(lastDot) : "";
  let sequence = 2;
  let candidate = `${baseName} (${sequence})${extension}`;
  while (existingNames.has(candidate)) {
    sequence += 1;
    candidate = `${baseName} (${sequence})${extension}`;
  }
  return candidate;
};

/** Multi-file image picker that previews and removes each selected image. */
const MultipleImageUploadInput = ({
  value,
  onChange,
  disabled = false,
  maxFiles = 30,
  maxSizeMB = 5,
  accept = "image/*",
  label = "Upload Images",
}: MultipleImageUploadInputProps): JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [validationMessage, setValidationMessage] = useState("");
  const [dragging, setDragging] = useState(false);
  const entries = Object.entries(value ?? {});

  const addFiles = async (fileList: FileList | File[]): Promise<void> => {
    if (disabled) return;
    const files = Array.from(fileList);
    if (!files.length) return;

    const existingNames = new Set(entries.map(([name]) => name));
    const remaining = Math.max(0, maxFiles - entries.length);
    const messages: string[] = [];
    const candidates: Array<{ file: File; key: string }> = [];

    for (const file of files) {
      if (candidates.length >= remaining) {
        messages.push(`You can add up to ${maxFiles} images.`);
        break;
      }
      if (file.type && !file.type.startsWith("image/")) {
        messages.push(`${file.name} is not an image.`);
        continue;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        messages.push(`${file.name} is larger than the ${maxSizeMB} MB limit.`);
        continue;
      }

      const key = getUniqueFileName(file.name, existingNames);
      existingNames.add(key);
      candidates.push({ file, key });
    }

    type ImageReadResult =
      | { key: string; dataUrl: string }
      | { key: string; fileName: string };
    const results: ImageReadResult[] = await Promise.all(candidates.map(async ({ file, key }) => {
      try {
        return { key, dataUrl: await readAsDataUrl(file) };
      } catch {
        return { key, fileName: file.name };
      }
    }));
    const nextImages: Record<string, string> = {};
    results.forEach((result) => {
      if ("dataUrl" in result) nextImages[result.key] = result.dataUrl;
      else messages.push(`Could not read ${result.fileName}.`);
    });
    const acceptedCount = Object.keys(nextImages).length;
    setValidationMessage(messages.join(" "));
    if (acceptedCount > 0) onChange({ ...value, ...nextImages });
  };

  const removeImage = (name: string): void => {
    const nextValue = { ...value };
    delete nextValue[name];
    setValidationMessage("");
    onChange(nextValue);
  };

  return (
    <AppBox className={styles.root}>
      <AppTypography component="div" variant="body2" className={styles.label}>
        {label}
      </AppTypography>
      <AppBox
        className={`${styles.dropzone} ${dragging ? styles.dragging : ""} ${disabled ? styles.disabled : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void addFiles(event.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          className={styles.input}
          type="file"
          accept={accept}
          multiple
          disabled={disabled || entries.length >= maxFiles}
          onChange={(event) => {
            if (event.currentTarget.files) void addFiles(event.currentTarget.files);
            event.currentTarget.value = "";
          }}
        />
        <CloudUploadIcon className={styles.uploadIcon} />
        <AppTypography variant="body2" className={styles.dropzoneText}>
          Select multiple images or drag them here
        </AppTypography>
        <AppButton
          type="button"
          variant="outlined"
          size="small"
          disabled={disabled || entries.length >= maxFiles}
          onClick={() => inputRef.current?.click()}
        >
          Browse images
        </AppButton>
        <AppTypography variant="caption" color="text.secondary">
          Up to {maxFiles} images · {maxSizeMB} MB each
        </AppTypography>
      </AppBox>

      {entries.length > 0 && (
        <AppBox component="ul" className={styles.imageGrid}>
          {entries.map(([name, src]) => (
            <AppBox component="li" key={name} className={styles.imageCard}>
              <img className={styles.preview} src={src} alt={name} />
              <AppTypography variant="caption" className={styles.imageName} title={name}>
                {name}
              </AppTypography>
              <AppTooltip title={`Remove ${name}`}>
                <span className={styles.removeButton}>
                  <AppIconButton
                    type="button"
                    size="small"
                    aria-label={`Remove ${name}`}
                    disabled={disabled}
                    onClick={() => removeImage(name)}
                  >
                    <DeleteIcon fontSize="small" />
                  </AppIconButton>
                </span>
              </AppTooltip>
            </AppBox>
          ))}
        </AppBox>
      )}

      {validationMessage && (
        <AppFormHelperText error>{validationMessage}</AppFormHelperText>
      )}
    </AppBox>
  );
};

export default MultipleImageUploadInput;
