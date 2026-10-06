import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AppAutocomplete,
  AppBox,
  AppTextField,
  type AutocompleteProps,
  type AutocompleteRenderInputParams,
} from "@/components/material-ui-component-wrappers";

import { SecondaryFont } from "../fonts";
import styles from "../../styles/FormInput.module.scss";
import { useLatestRequest } from "../../hooks/useLatestRequest";

/**
 * Option type for lazy autocomplete
 */
export interface LazyOption {
  value: string | number;
  label: string;
}

/**
 * Fetch result from the API
 */
export interface LazyFetchResult {
  options: LazyOption[];
  hasMore: boolean;
  totalCount?: number;
}

/**
 * Fetch function type for lazy loading
 * @param searchText - The search text to filter options
 * @param start - The start index for pagination
 * @param pageSize - Number of items to fetch
 * @returns Promise with options, hasMore flag, and optional total count
 */
export type LazyFetchFunction = (
  searchText: string,
  start: number,
  pageSize: number,
) => Promise<LazyFetchResult>;

export interface LazyAutocompleteInputProps extends Omit<
  AutocompleteProps<LazyOption, false, false, false>,
  | "renderInput"
  | "options"
  | "variant"
  | "margin"
  | "onInputChange"
  | "loading"
  | "value"
> {
  /**
   * Function to fetch options from server
   */
  fetchOptions: LazyFetchFunction;
  /**
   * Label for the input field
   */
  label?: string;
  /**
   * Input variant
   */
  variant?: "outlined" | "filled" | "standard";
  /**
   * Input margin
   */
  margin?: "none" | "dense" | "normal";
  /**
   * Show error state
   */
  error?: boolean;
  /**
   * Helper text to display below input
   */
  helperText?: string;
  /**
   * Is field required
   */
  required?: boolean;
  /**
   * Is field disabled
   */
  disabled?: boolean;
  /**
   * Page size for lazy loading (default: 10)
   */
  pageSize?: number;
  /**
   * Debounce delay in ms (default: 300)
   */
  debounceMs?: number;
  /**
   * Maximum height of dropdown (default: 300)
   */
  maxHeight?: number;
  /**
   * Initial value to display (for edit mode)
   * Use this when you have the full option object (value + label)
   */
  initialOption?: LazyOption;
  /**
   * Raw value (just the value, not the full option)
   * Use this when you only have the value and need to display it
   */
  value?: string | number | null;
  /**
   * Input placeholder
   */
  placeholder?: string;
}

interface LazyListboxContextValue {
  listboxRef: React.MutableRefObject<HTMLUListElement | null>;
  handleScroll: React.UIEventHandler<HTMLUListElement>;
  maxHeight: number;
  loadingMore: boolean;
  hasMore: boolean;
  optionCount: number;
}

const LazyListboxContext = createContext<LazyListboxContextValue | null>(null);

const LazyLoadingListbox = forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(function LazyLoadingListbox(listboxProps, forwardedRef) {
  const settings = useContext(LazyListboxContext);
  if (!settings) return <ul {...listboxProps} ref={forwardedRef} />;

  const setRefs = (node: HTMLUListElement | null): void => {
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
    settings.listboxRef.current = node;
  };

  const className = [
    listboxProps.className,
    styles["lazy-autocomplete__listbox"],
    getListboxSizeClass(settings.maxHeight),
  ].filter(Boolean).join(" ");

  return (
    <AppBox component="div" className={styles["lazy-autocomplete__container"]}>
      <ul
        {...listboxProps}
        ref={setRefs}
        className={className}
        onScroll={settings.handleScroll}
      />
      {!settings.loadingMore && settings.hasMore && settings.optionCount > 0 && (
        <AppBox className={styles["lazy-autocomplete__hint"]}>
          <SecondaryFont className={styles["lazy-autocomplete__hint-text"]}>
            Scroll for more results...
          </SecondaryFont>
        </AppBox>
      )}
    </AppBox>
  );
});

LazyLoadingListbox.displayName = "LazyLoadingListbox";

const getListboxSizeClass = (maxHeight: number): string => {
  if (maxHeight <= 200) return styles["lazy-autocomplete__listbox-short"];
  if (maxHeight <= 280) return styles["lazy-autocomplete__listbox-medium"];
  if (maxHeight <= 360) return styles["lazy-autocomplete__listbox-tall"];
  return styles["lazy-autocomplete__listbox-extra-tall"];
};

/**
 * Lazy Autocomplete Input component with server-side search and pagination
 *
 * Features:
 * - Server-side search with debouncing
 * - Lazy loading with infinite scroll
 * - Fetches batches of 10 items at a time
 * - Loading indicator when fetching more results
 * - Supports filtering by search text (firstName, lastName, loginName)
 */
const LazyAutocompleteInput = forwardRef<
  HTMLDivElement,
  LazyAutocompleteInputProps
>(
  (
    {
      fetchOptions,
      label,
      variant = "filled",
      margin = "none",
      fullWidth = true,
      error,
      helperText,
      required,
      disabled,
      pageSize = 10,
      debounceMs = 300,
      maxHeight = 300,
      initialOption,
      value,
      onChange,
      placeholder = "Type to search...",
      ...props
    },
    ref,
  ) => {
    // State
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<LazyOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false); // Separate state for loading more
    const [inputValue, setInputValue] = useState("");
    const [hasMore, setHasMore] = useState(true);
    const [currentStart, setCurrentStart] = useState(0);

    // Refs for debouncing and tracking
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const listboxRef = useRef<HTMLUListElement | null>(null);
    const isFetchingRef = useRef(false);
    const lastSearchRef = useRef("");
    const requestGuard = useLatestRequest();

    // Selected option state - use initialOption if provided
    const [selectedOption, setSelectedOption] = useState<LazyOption | null>(
      initialOption ?? null,
    );

    // Keep the option object in sync when a caller supplies a valid option for
    // the current raw value (edit mode and programmatic test-data fills).
    useEffect(() => {
      if (
        initialOption &&
        initialOption.value === value &&
        selectedOption?.value !== initialOption.value
      ) {
        setSelectedOption(initialOption);
      }
    }, [initialOption, selectedOption, value]);

    /**
     * Fetch options from server
     */
    const fetchData = useCallback(
      async (
        searchText: string,
        start: number,
        append: boolean = false,
      ): Promise<void> => {
        if (isFetchingRef.current) return;

        isFetchingRef.current = true;
        const requestId = requestGuard.begin();

        // Use different loading states for initial load vs loading more
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        try {
          const result = await fetchOptions(searchText, start, pageSize);
          if (!requestGuard.isLatest(requestId)) return;

          if (append) {
            setOptions((prev) => {
              // Filter out duplicates
              const existingIds = new Set(prev.map((opt) => opt.value));
              const newOptions = result.options.filter(
                (opt) => !existingIds.has(opt.value),
              );
              return [...prev, ...newOptions];
            });
          } else {
            setOptions(result.options);
          }

          setHasMore(result.hasMore);
          setCurrentStart(start + result.options.length);
          lastSearchRef.current = searchText;
        } catch {
          if (!append && requestGuard.isLatest(requestId)) {
            setOptions([]);
          }
          if (requestGuard.isLatest(requestId)) setHasMore(false);
        } finally {
          if (requestGuard.isLatest(requestId)) {
            setLoading(false);
            setLoadingMore(false);
          }
          isFetchingRef.current = false;
        }
      },
      [fetchOptions, pageSize, requestGuard],
    );

    /**
     * Handle input change with debouncing
     */
    const handleInputChange = useCallback(
      (
        _event: React.SyntheticEvent,
        newInputValue: string,
        reason: string,
      ): void => {
        setInputValue(newInputValue);

        // Don't search on select or clear
        if (reason !== "input") return;

        // Clear previous debounce
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        // Debounce the search
        debounceRef.current = setTimeout(() => {
          // Reset pagination and fetch new results
          setCurrentStart(0);
          setHasMore(true);
          void fetchData(newInputValue, 0, false);
        }, debounceMs);
      },
      [debounceMs, fetchData],
    );

    /**
     * Handle scroll to load more
     */
    const handleScroll = useCallback(
      (event: React.UIEvent<HTMLUListElement>): void => {
        const listbox = event.currentTarget;
        const { scrollTop, scrollHeight, clientHeight } = listbox;

        // Check if scrolled near bottom (within 50px)
        if (
          scrollHeight - scrollTop - clientHeight < 50 &&
          hasMore &&
          !loading &&
          !loadingMore
        ) {
          void fetchData(lastSearchRef.current, currentStart, true);
        }
      },
      [hasMore, loading, loadingMore, currentStart, fetchData],
    );

    /**
     * Handle dropdown open
     */
    const handleOpen = useCallback((): void => {
      setOpen(true);
      // Fetch initial data when opening
      if (options.length === 0) {
        setCurrentStart(0);
        setHasMore(true);
        void fetchData("", 0, false);
      }
    }, [options.length, fetchData]);

    /**
     * Handle dropdown close
     */
    const handleClose = useCallback((): void => {
      setOpen(false);
    }, []);

    /**
     * Handle option selection
     */
    const handleChange = useCallback(
      (
        _event: React.SyntheticEvent,
        newValue: LazyOption | null,
        reason:
          "selectOption" | "createOption" | "removeOption" | "blur" | "clear",
        details?: { option: LazyOption } | undefined,
      ): void => {
        setSelectedOption(newValue);

        if (onChange) {
          // Create a synthetic event to match the expected onChange signature
          const inputElement = document.createElement("input");
          inputElement.value = String(newValue?.value ?? "");
          const syntheticEvent: React.SyntheticEvent = {
            bubbles: false,
            cancelable: false,
            currentTarget: inputElement,
            defaultPrevented: false,
            eventPhase: 0,
            isDefaultPrevented: () => false,
            isPropagationStopped: () => false,
            isTrusted: false,
            nativeEvent: new Event("change"),
            persist: () => undefined,
            preventDefault: () => undefined,
            stopPropagation: () => undefined,
            target: inputElement,
            timeStamp: Date.now(),
            type: "change",
          };

          // Call the original onChange with the value
          onChange(syntheticEvent, newValue, reason, details);
        }
      },
      [onChange],
    );

    // Cleanup debounce on unmount
    useEffect(
      () => () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      },
      [],
    );

    // Find selected option from value prop
    useEffect(() => {
      if (value !== undefined && value !== null && value !== "") {
        // If we have a value but no selectedOption, try to find it in options
        const found = options.find((opt) => opt.value === value);
        if (found && (!selectedOption || selectedOption.value !== value)) {
          setSelectedOption(found);
        }
      } else if (value === "" || value === null) {
        setSelectedOption(null);
      }
    }, [value, options, selectedOption]);

    const listboxSettings = useMemo<LazyListboxContextValue>(
      () => ({
        listboxRef,
        handleScroll,
        maxHeight,
        loadingMore,
        hasMore,
        optionCount: options.length,
      }),
      [handleScroll, hasMore, loadingMore, maxHeight, options.length],
    );

    return (
      <LazyListboxContext.Provider value={listboxSettings}>
      <AppAutocomplete
        ref={ref}
        open={open}
        onOpen={handleOpen}
        onClose={handleClose}
        options={options}
        value={selectedOption}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onChange={handleChange}
        disabled={disabled}
        fullWidth={fullWidth}
        getOptionLabel={(option: LazyOption) => option.label}
        isOptionEqualToValue={(option: LazyOption, val: LazyOption) =>
          option.value === val.value
        }
        filterOptions={(x) => x} // Disable client-side filtering (server handles it)
        ListboxComponent={LazyLoadingListbox}
        renderInput={(params: AutocompleteRenderInputParams) => (
          <AppTextField
            {...params}
            label={label}
            variant={variant}
            margin={margin}
            required={required}
            error={error}
            helperText={helperText}
            className={styles["filled-input"]}
            placeholder={placeholder}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              ...params.InputProps,
              disableUnderline: true,
            }}
          />
        )}
        {...props}
      />
      </LazyListboxContext.Provider>
    );
  },
);

LazyAutocompleteInput.displayName = "LazyAutocompleteInput";

export default LazyAutocompleteInput;
