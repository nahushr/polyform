import { useState, type ReactNode } from "react";
import "./DevicePreview.scss";

type PreviewMode = "desktop" | "phone";

interface DevicePreviewProps {
  readonly children: ReactNode;
  readonly label: string;
}

export function DevicePreview({ children, label }: DevicePreviewProps): JSX.Element {
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const isPhonePreview = previewMode === "phone";

  return (
    <div className="device-preview">
      <div className="device-preview__toolbar">
        <div className="device-preview__copy">
          <strong>Live component preview</strong>
          <span>
            {isPhonePreview ? "Phone-sized responsive view" : "Full-width desktop view"}
          </span>
        </div>
        <fieldset className="device-preview__toggle">
          <legend className="device-preview__toggle-label">Preview size</legend>
          <button
            aria-pressed={!isPhonePreview}
            className={!isPhonePreview ? "selected" : ""}
            type="button"
            onClick={() => setPreviewMode("desktop")}
          >
            <span aria-hidden="true" className="device-preview__icon device-preview__icon--desktop" />
            {" "}
            Desktop
          </button>
          <button
            aria-pressed={isPhonePreview}
            className={isPhonePreview ? "selected" : ""}
            type="button"
            onClick={() => setPreviewMode("phone")}
          >
            <span aria-hidden="true" className="device-preview__icon device-preview__icon--phone" />
            {" "}
            Phone
          </button>
        </fieldset>
      </div>

      <div
        className={`device-preview__frame ${isPhonePreview ? "device-preview__frame--phone" : ""}`}
      >
        {isPhonePreview && (
          <div className="device-preview__status" aria-hidden="true">
            <span>9:41</span>{" "}
            <span className="device-preview__notch" />{" "}
            <span className="device-preview__status-icons">••• ▰</span>
          </div>
        )}
        <section
          aria-label={`${label} ${isPhonePreview ? "phone-sized" : "desktop"} preview`}
          className={`device-preview__surface ${isPhonePreview ? "device-preview__surface--phone" : ""}`}
        >
          {children}
        </section>
        {isPhonePreview && <div className="device-preview__home" aria-hidden="true" />}
      </div>
    </div>
  );
}
