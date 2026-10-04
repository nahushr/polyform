import {
  createContext,
  forwardRef,
  useContext,
  useState,
  type ComponentType,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import {
  format as formatDate,
  isAfter,
  isBefore,
  isSameDay,
  isValid,
  startOfDay,
} from "date-fns";
import {
  PickersDay,
  type PickersDayProps,
} from "@mui/x-date-pickers/PickersDay";

import {
  AppBox,
  AppButton,
  AppInputAdornment,
  AppPopover,
  AppTypography,
} from "@/components/material-ui-component-wrappers";
import {
  AppAdapterDateFns,
  AppDateCalendar,
  AppLocalizationProvider,
} from "@/components/material-ui-component-wrappers/date-time";
import { DateRange as DateRangeIcon } from "@/components/material-ui-component-wrappers/icons";

import TextFieldInput from "./TextFieldInput";
import styles from "./DateRangePickerInput.module.scss";

export interface DateRangeValue {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePickerInputProps {
  value: DateRangeValue | null | undefined;
  onChange: (value: DateRangeValue) => void;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  format?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

interface DateRangeContextValue {
  start: Date | null;
  end: Date | null;
}

const DateRangeContext = createContext<DateRangeContextValue>({
  start: null,
  end: null,
});

const RangeCalendarDay = forwardRef<
  HTMLButtonElement,
  PickersDayProps<Date>
>((props, ref) => {
  const { start, end } = useContext(DateRangeContext);
  const date = startOfDay(props.day);
  const isStart = Boolean(start && isSameDay(date, start));
  const isEnd = Boolean(end && isSameDay(date, end));
  const isBetween = Boolean(
    start &&
      end &&
      isAfter(date, startOfDay(start)) &&
      isBefore(date, startOfDay(end)),
  );
  const className = [
    props.className,
    styles.rangeDay,
    isStart && styles.rangeDayStart,
    isEnd && styles.rangeDayEnd,
    isBetween && styles.rangeDayInRange,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <PickersDay
      {...props}
      ref={ref}
      disableMargin
      selected={isStart || isEnd}
      className={className}
    />
  );
});

RangeCalendarDay.displayName = "RangeCalendarDay";

const DateRangePickerInput = ({
  value,
  onChange,
  label = "Date range",
  minDate,
  maxDate,
  format = "MM/dd/yyyy",
  disabled = false,
  required = false,
  error = false,
  helperText,
}: DateRangePickerInputProps): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const start = value?.start ?? null;
  const end = value?.end ?? null;
  const isOpen = Boolean(anchorEl);

  const formatValue = (date: Date | null): string =>
    date && isValid(date) ? formatDate(date, format) : "";

  const displayValue = start
    ? `${formatValue(start)} – ${end ? formatValue(end) : "Select end date"}`
    : "";
  const calendarDate = selectingEnd ? start : end ?? start;

  const openPicker = (
    event: MouseEvent<HTMLDivElement>,
  ): void => {
    if (disabled) return;
    setSelectingEnd(Boolean(start && !end));
    setAnchorEl(event.currentTarget);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (disabled || !["Enter", " ", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    setSelectingEnd(Boolean(start && !end));
    setAnchorEl(event.currentTarget);
  };

  const handleCalendarChange = (selectedDate: Date | null): void => {
    if (!selectedDate || !isValid(selectedDate)) return;
    const selected = startOfDay(selectedDate);

    if (!selectingEnd || !start) {
      onChange({ start: selected, end: null });
      setSelectingEnd(true);
      return;
    }

    if (isBefore(selected, startOfDay(start))) {
      onChange({ start: selected, end: startOfDay(start) });
    } else {
      onChange({ start: startOfDay(start), end: selected });
    }
    setSelectingEnd(false);
    setAnchorEl(null);
  };

  const clearRange = (): void => {
    onChange({ start: null, end: null });
    setSelectingEnd(false);
  };

  return (
    <AppLocalizationProvider dateAdapter={AppAdapterDateFns}>
      <AppBox className={styles.root}>
        <TextFieldInput
          label={label}
          value={displayValue}
          disabled={disabled}
          required={required}
          error={error}
          helperText={helperText}
          placeholder="Select a date range"
          onClick={openPicker}
          onKeyDown={handleKeyDown}
          inputProps={{ readOnly: true, "aria-label": label }}
          InputProps={{
            endAdornment: (
              <AppInputAdornment position="end">
                <DateRangeIcon fontSize="small" />
              </AppInputAdornment>
            ),
          }}
        />
        <AppPopover
          open={isOpen}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          slotProps={{ paper: { className: styles.calendarPopover } }}
        >
          <AppBox className={styles.pickerHeader}>
            <AppTypography variant="body2" className={styles.pickerTitle}>
              Choose a date range
            </AppTypography>
            <AppTypography variant="caption" className={styles.pickerHint}>
              {selectingEnd ? "Select an end date" : "Select a start date"}
            </AppTypography>
          </AppBox>
          <DateRangeContext.Provider value={{ start, end }}>
            <AppDateCalendar
              value={calendarDate}
              onChange={handleCalendarChange}
              minDate={minDate}
              maxDate={maxDate}
              slots={{
                day: RangeCalendarDay as unknown as ComponentType<PickersDayProps<Date>>,
              }}
              className={styles.calendar}
            />
          </DateRangeContext.Provider>
          <AppBox className={styles.pickerActions}>
            <AppButton
              type="button"
              size="small"
              variant="text"
              disabled={!start && !end}
              onClick={clearRange}
              className={styles.clearButton}
            >
              Clear range
            </AppButton>
            <AppTypography variant="caption" className={styles.rangeSummary}>
              {start
                ? `${formatValue(start)}${end ? ` – ${formatValue(end)}` : " – …"}`
                : "No dates selected"}
            </AppTypography>
          </AppBox>
        </AppPopover>
      </AppBox>
    </AppLocalizationProvider>
  );
};

export default DateRangePickerInput;
