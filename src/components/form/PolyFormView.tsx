import type { RefObject } from "react";
import { Controller, get, type Control, type FieldValues } from "react-hook-form";

import { AppTypography } from "@/components/material-ui-component-wrappers";
import type {
  FieldConfig,
  FormCardConfig,
  PolyFormClassNames,
} from "./PolyForm";
import ReadOnlyField from "./ReadOnlyField";
import styles from "./PolyFormView.module.scss";

interface PolyFormViewProps<TFieldValues extends FieldValues> {
  cards: Array<FormCardConfig<TFieldValues>>;
  control?: Control<TFieldValues>;
  values?: TFieldValues;
  classNames: PolyFormClassNames;
  rootRef: RefObject<HTMLDivElement>;
  lazyOptions: Record<string, { value: string | number; label: string }>;
}

const joinClassNames = (...classNames: Array<string | undefined>): string =>
  classNames.filter(Boolean).join(" ");

const SummaryField = <TFieldValues extends FieldValues>({
  field,
  control,
  values,
  lazyOptions,
  className,
}: {
  field: FieldConfig<TFieldValues>;
  control?: Control<TFieldValues>;
  values?: TFieldValues;
  lazyOptions: Record<string, { value: string | number; label: string }>;
  className?: string;
}): JSX.Element => {
  const { xs, sm } = field.gridSize ?? { xs: 12, sm: 6 };
  const renderValue = (value: unknown): JSX.Element => (
    <ReadOnlyField
      field={field}
      value={value}
      values={values}
      lazyOption={lazyOptions[String(field.name)]}
      className={styles["summary-field-content"]}
    />
  );
  let valueContent: JSX.Element | null = null;

  if (values !== undefined) {
    valueContent = renderValue(get(values, field.name));
  } else if (control) {
    valueContent = (
      <Controller
        name={field.name}
        control={control}
        render={({ field: controllerField }) => renderValue(controllerField.value)}
      />
    );
  }

  return (
    <div
      className={joinClassNames(styles["summary-field"], className)}
      data-xs={xs}
      data-sm={sm}
    >
      {valueContent}
    </div>
  );
};

/**
 * A separate, data-only presentation for PolyForm. It intentionally does not
 * render edit slots, field controls, or the edit form's grid and card elements.
 */
const PolyFormView = <TFieldValues extends FieldValues>({
  cards,
  control,
  values,
  classNames,
  rootRef,
  lazyOptions,
}: PolyFormViewProps<TFieldValues>): JSX.Element => (
  <div
    ref={rootRef}
    className={joinClassNames(styles["view-root"], classNames.root, classNames.viewRoot)}
    data-polyform-root=""
    data-mode="view"
  >
    {cards.map((card, cardIndex) => (
      <article
        className={joinClassNames(
          styles["summary-card"],
          classNames.card,
          classNames.viewCard,
          card.className,
        )}
        data-polyform-view-card=""
        key={card.id ?? `view-card-${cardIndex}`}
      >
        {(card.header || card.subtitle) && (
          <header
            className={joinClassNames(
              styles["summary-card-header"],
              classNames.cardHeader,
              classNames.viewCardHeader,
              card.headerClassName,
            )}
          >
            <div className={styles["summary-heading"]}>
              {card.header && (
                <AppTypography
                  component="h2"
                  variant="h6"
                  sx={card.titleTypography}
                  className={joinClassNames(
                    styles["summary-title"],
                    classNames.cardTitle,
                    classNames.viewCardTitle,
                    card.titleClassName,
                  )}
                >
                  {card.header}
                </AppTypography>
              )}
              {card.subtitle && (
                <AppTypography
                  component="p"
                  variant="body2"
                  sx={card.subtitleTypography}
                  className={joinClassNames(
                    styles["summary-subtitle"],
                    classNames.cardSubtitle,
                    classNames.viewCardSubtitle,
                    card.subtitleClassName,
                  )}
                >
                  {card.subtitle}
                </AppTypography>
              )}
            </div>
          </header>
        )}

        {card.header || card.subtitle ? (
          <div
            className={joinClassNames(
              styles["summary-card-divider"],
              classNames.cardDivider,
              classNames.viewCardDivider,
              card.dividerClassName,
            )}
          />
        ) : null}

        {card.sections.map((section, sectionIndex) => (
          <section
            className={joinClassNames(
              styles["summary-section"],
              classNames.section,
              classNames.viewSection,
              section.className,
            )}
            key={`summary-section-${cardIndex}-${sectionIndex}`}
          >
            {section.title && (
              <>
                <h3
                  className={joinClassNames(
                    styles["summary-section-title"],
                    classNames.sectionTitle,
                    classNames.viewSectionTitle,
                    section.titleClassName,
                  )}
                >
                  {section.title}
                </h3>
                <div
                  className={joinClassNames(
                    styles["summary-section-divider"],
                    classNames.divider,
                    classNames.viewSectionDivider,
                    section.dividerClassName,
                  )}
                />
              </>
            )}

            <div className={styles["summary-fields"]}>
              {section.fields.map((field) => (
                <SummaryField
                  key={String(field.name)}
                  field={field}
                  control={control}
                  values={values}
                  lazyOptions={lazyOptions}
                  className={joinClassNames(
                    classNames.fieldGridItem,
                    classNames.viewField,
                  )}
                />
              ))}
            </div>
          </section>
        ))}
      </article>
    ))}
  </div>
);

export default PolyFormView;
