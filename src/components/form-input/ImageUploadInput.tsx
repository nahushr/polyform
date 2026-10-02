import ImageSlotsUpload from "./ImageSlotsUpload";

interface ImageUploadInputProps {
  value: string;
  onChange: (base64: string) => void;
  disabled?: boolean;
  size?: number;
  label?: string;
  required?: boolean;
  accept?: string;
  maxSizeMB?: number;
}

/**
 * Single-slot adapter around the shared fixed-slot image uploader.
 */
const ImageUploadInput = ({
  value,
  onChange,
  disabled = false,
  label = "Upload Photo",
  required = false,
  accept = "image/*",
  maxSizeMB = 5,
}: ImageUploadInputProps): JSX.Element => {
  return (
    <ImageSlotsUpload
      slots={[{ label, required }]}
      values={[value]}
      onChange={(values) => onChange(values[0] ?? "")}
      disabled={disabled}
      showHeader={false}
      maxSizeMB={maxSizeMB}
      accept={accept}
    />
  );
};

export default ImageUploadInput;
