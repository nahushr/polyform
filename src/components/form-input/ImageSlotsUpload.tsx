import { useCallback, useId } from "react";

import { toast } from "react-toastify";

import AddPhotoAlternateIcon from "@/components/material-ui-component-wrappers/icons/AddPhotoAlternate";
import CancelOutlinedIcon from "@/components/material-ui-component-wrappers/icons/CancelOutlined";
import CloudUploadIcon from "@/components/material-ui-component-wrappers/icons/CloudUpload";
import ImageOutlinedIcon from "@/components/material-ui-component-wrappers/icons/ImageOutlined";
import {
  AppBox,
  AppButton,
  AppGrid,
  AppIconButton,
  AppStack,
  AppTooltip,
  AppTypography,
} from "@/components/material-ui-component-wrappers";

import styles from "../../styles/ImageSlotsUpload.module.scss";

export interface ImageUploadSlot {
  label: string;
  required?: boolean;
}

export interface ImageSlotsUploadProps {
  slots: ImageUploadSlot[];
  values?: Array<string | undefined>;
  onChange?: (values: string[]) => void;
  disabled?: boolean;
  showHeader?: boolean;
  showEmptySlots?: boolean;
  headerLabel?: string;
  maxSizeMB?: number;
  accept?: string;
}

const getImageSource = (value: string): string => {
  if (value.startsWith("http") || value.startsWith("data:")) return value;
  return `data:image/png;base64,${value}`;
};

/** Fixed-slot image uploader shared by products, variants, and packages. */
const ImageSlotsUpload = ({
  slots,
  values = [],
  onChange,
  disabled = false,
  showHeader = true,
  showEmptySlots = true,
  headerLabel = "Images",
  maxSizeMB = 5,
  accept = "image/*",
}: ImageSlotsUploadProps): JSX.Element => {
  const inputIdPrefix = useId().replace(/:/g, "");
  const normalizedValues = slots.map((_, index) => values[index] ?? "");
  const activeSlotIndexes = normalizedValues.reduce<number[]>(
    (indexes, value, index) => {
      if (value) indexes.push(index);
      return indexes;
    },
    [],
  );
  const canEdit = Boolean(onChange) && !disabled;

  const updateSlot = useCallback(
    (index: number, value: string): void => {
      if (!onChange) return;
      const nextValues = [...normalizedValues];
      nextValues[index] = value;
      onChange(nextValues);
    },
    [normalizedValues, onChange],
  );

  const handleImageSelected = useCallback(
    (index: number, event: React.ChangeEvent<HTMLInputElement>): void => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file.");
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`Image size must be less than ${maxSizeMB} MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = typeof reader.result === "string" ? reader.result : "";
        if (!dataUrl) {
          toast.error("The image could not be read. Please try again.");
          return;
        }
        updateSlot(index, dataUrl);
        toast.success("Image added.");
      };
      reader.onerror = () =>
        toast.error("The image could not be read. Please try again.");
      reader.readAsDataURL(file);
    },
    [maxSizeMB, updateSlot],
  );

  const handleRemove = useCallback(
    (index: number): void => {
      updateSlot(index, "");
      toast.info("Image removed.");
    },
    [updateSlot],
  );

  let visibleSlotIndexes = activeSlotIndexes;
  if (canEdit && showEmptySlots) {
    visibleSlotIndexes = normalizedValues.map((_, index) => index);
  } else if (canEdit) {
    const firstEmptyIndex = normalizedValues.findIndex((value) => !value);
    if (firstEmptyIndex >= 0) {
      visibleSlotIndexes = [...activeSlotIndexes, firstEmptyIndex];
    }
  }
  const visibleSlots = visibleSlotIndexes.map((index) => ({
    value: normalizedValues[index],
    index,
  }));
  const isSingleSlot = slots.length === 1;

  return (
    <AppBox className={styles["image-slots-upload"]}>
      {showHeader && (
        <AppBox className={styles["image-slots-upload__header"]}>
          <AppTypography
            variant="body2"
            className={styles["image-slots-upload__label"]}
          >
            {headerLabel} ({activeSlotIndexes.length}/{slots.length})
          </AppTypography>
          {canEdit && (
            <AppTypography variant="caption" color="text.secondary">
              Add up to {slots.length} images · {maxSizeMB} MB max each
            </AppTypography>
          )}
        </AppBox>
      )}

      <AppGrid container spacing={2}>
        {visibleSlots.map(({ value, index }) => {
          const slot = slots[index];
          return (
            <AppGrid
              item
              xs={12}
              sm={isSingleSlot ? 12 : 6}
              md={isSingleSlot ? 12 : 4}
              lg={isSingleSlot ? 12 : 3}
              key={`image-slot-${index}`}
            >
              <AppBox className={styles["image-slots-upload__card"]}>
                <AppBox className={styles["image-slots-upload__preview"]}>
                  {value ? (
                    <AppBox
                      component="a"
                      href={getImageSource(value)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${slot.label} in a new tab`}
                      className={styles["image-slots-upload__image-link"]}
                    >
                      <AppBox
                        component="img"
                        src={getImageSource(value)}
                        alt={slot.label}
                        className={styles["image-slots-upload__image"]}
                      />
                    </AppBox>
                  ) : (
                    <AppBox className={styles["image-slots-upload__empty"]}>
                      <AddPhotoAlternateIcon />
                      <AppTypography variant="caption">{slot.label}</AppTypography>
                    </AppBox>
                  )}
                  {canEdit && value && (
                    <AppTooltip title="Remove image">
                      <AppIconButton data-test-id="src-components-form-input-imageslotsupload-action-191"
                        type="button"
                        size="small"
                        aria-label={`Remove ${slot.label}`}
                        onClick={() => handleRemove(index)}
                        className={styles["image-slots-upload__remove"]}
                      >
                        <CancelOutlinedIcon fontSize="small" />
                      </AppIconButton>
                    </AppTooltip>
                  )}
                </AppBox>

                <AppStack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={1}
                  className={styles["image-slots-upload__footer"]}
                >
                  <AppTypography
                    variant="caption"
                    className={styles["image-slots-upload__slot-label"]}
                  >
                    {slot.label}
                    {slot.required ? " *" : ""}
                  </AppTypography>
                  {canEdit && !value && (
                    <AppButton data-test-id="src-components-form-input-imageslotsupload-button-219"
                      component="label"
                      size="small"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      className={styles["image-slots-upload__add-button"]}
                    >
                      <span>Add</span>
                      <input
                        id={`${inputIdPrefix}-${index}`}
                        hidden
                        type="file"
                        accept={accept}
                        onChange={(event) => handleImageSelected(index, event)}
                      />
                    </AppButton>
                  )}
                  {!canEdit && value && (
                    <ImageOutlinedIcon color="action" fontSize="small" />
                  )}
                </AppStack>
              </AppBox>
            </AppGrid>
          );
        })}
      </AppGrid>
    </AppBox>
  );
};

export default ImageSlotsUpload;
