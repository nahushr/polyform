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
  InsertDriveFile as FileIcon,
} from "@/components/material-ui-component-wrappers/icons";

import styles from "./MultipleFileUploadInput.module.scss";

export interface MultipleFileUploadInputProps {
  value?: File[];
  onChange: (files: File[]) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  error?: boolean;
  helperText?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const MultipleFileUploadInput = ({
  value = [],
  onChange,
  label = "Files",
  required = false,
  disabled = false,
  accept,
  maxFiles = 10,
  maxSizeMB = 10,
  error = false,
  helperText,
}: MultipleFileUploadInputProps): JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [validationMessage, setValidationMessage] = useState("");
  const [dragging, setDragging] = useState(false);

  const addFiles = (files: FileList | File[]) => {
    if (disabled) return;
    setValidationMessage("");
    const accepted: File[] = [];
    const remaining = Math.max(0, maxFiles - value.length);

    for (const file of Array.from(files)) {
      if (value.length + accepted.length >= maxFiles) {
        setValidationMessage(`You can add up to ${maxFiles} files.`);
        break;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setValidationMessage(
          `${file.name} is larger than the ${maxSizeMB} MB limit.`,
        );
        continue;
      }
      accepted.push(file);
    }

    if (remaining === 0 && files.length > 0) {
      setValidationMessage(`You can add up to ${maxFiles} files.`);
    }
    if (accepted.length > 0) onChange([...value, ...accepted]);
  };

  const removeFile = (index: number) => {
    setValidationMessage("");
    onChange(value.filter((_, fileIndex) => fileIndex !== index));
  };

  return (
    <AppBox className={styles.root}>
      <AppTypography component="label" variant="body2" className={styles.label}>
        {label}{required ? " *" : ""}
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
          addFiles(event.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          className={styles.input}
          type="file"
          accept={accept}
          multiple
          disabled={disabled || value.length >= maxFiles}
          onChange={(event) => {
            if (event.currentTarget.files) addFiles(event.currentTarget.files);
            event.currentTarget.value = "";
          }}
        />
        <CloudUploadIcon className={styles.uploadIcon} />
        <AppTypography variant="body2" className={styles.dropzoneText}>
          Drag files here or
        </AppTypography>
        <AppButton
          type="button"
          variant="outlined"
          size="small"
          disabled={disabled || value.length >= maxFiles}
          onClick={() => inputRef.current?.click()}
        >
          Browse files
        </AppButton>
        <AppTypography variant="caption" color="text.secondary">
          Up to {maxFiles} files · {maxSizeMB} MB each
        </AppTypography>
      </AppBox>

      {value.length > 0 && (
        <AppBox component="ul" className={styles.fileList}>
          {value.map((file, index) => (
            <AppBox component="li" key={`${file.name}-${file.lastModified}-${index}`} className={styles.fileRow}>
              <FileIcon className={styles.fileIcon} />
              <AppBox className={styles.fileDetails}>
                <AppTypography variant="body2" className={styles.fileName}>
                  {file.name}
                </AppTypography>
                <AppTypography variant="caption" color="text.secondary">
                  {formatFileSize(file.size)}
                </AppTypography>
              </AppBox>
              <AppTooltip title={`Remove ${file.name}`}>
                <span>
                  <AppIconButton
                    type="button"
                    size="small"
                    aria-label={`Remove ${file.name}`}
                    disabled={disabled}
                    onClick={() => removeFile(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </AppIconButton>
                </span>
              </AppTooltip>
            </AppBox>
          ))}
        </AppBox>
      )}
      {(validationMessage || helperText) && (
        <AppFormHelperText error={error || Boolean(validationMessage)}>
          {validationMessage || helperText}
        </AppFormHelperText>
      )}
    </AppBox>
  );
};

export default MultipleFileUploadInput;
