import { useId, useMemo, useRef, useState, type ChangeEvent } from "react";

import {
  AppBox,
  AppButtonBase,
  AppDialog,
  AppDialogContent,
  AppDialogTitle,
  AppFormHelperText,
  AppIconButton,
  AppInputAdornment,
  AppTypography,
} from "@/components/material-ui-component-wrappers";
import { CancelOutlined } from "@/components/material-ui-component-wrappers/icons";
import { EMOJI_GROUPS, searchEmojis, type EmojiItem } from "@/data/emoji";

import TextFieldInput from "./TextFieldInput";
import styles from "./EmojiTextInput.module.scss";

export interface EmojiTextInputProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  maxLength?: number;
}

const EmojiTextInput = ({
  label,
  value = "",
  onChange,
  placeholder = "Write a message…",
  disabled = false,
  required = false,
  error = false,
  helperText,
  maxLength = 1000,
}: EmojiTextInputProps): JSX.Element => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(EMOJI_GROUPS[0].name);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef({ start: value.length, end: value.length });
  const dialogTitleId = useId();

  const activeGroupData =
    EMOJI_GROUPS.find((group) => group.name === activeGroup) ?? EMOJI_GROUPS[0];
  const filteredEmojis = useMemo(
    () => (query.trim() ? searchEmojis(query) : activeGroupData.items),
    [activeGroupData, query],
  );
  const rememberSelection = (input: HTMLInputElement): void => {
    const start = input.selectionStart ?? input.value.length;
    selectionRef.current = {
      start,
      end: input.selectionEnd ?? start,
    };
  };

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>): void => {
    rememberSelection(event.currentTarget);
    onChange(event.currentTarget.value);
  };

  const handleEmojiSelect = (emoji: EmojiItem): void => {
    const currentValue = value ?? "";
    const start = Math.min(selectionRef.current.start, currentValue.length);
    const end = Math.min(selectionRef.current.end, currentValue.length);
    const nextValue = `${currentValue.slice(0, start)}${emoji.emoji}${currentValue.slice(end)}`;

    if (nextValue.length > maxLength) return;

    const nextCursor = start + emoji.emoji.length;
    selectionRef.current = { start: nextCursor, end: nextCursor };
    onChange(nextValue);
  };

  const resetPickerList = (): void => {
    gridRef.current?.scrollTo({ top: 0 });
  };

  const restoreInputFocus = (): void => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.setSelectionRange(selectionRef.current.start, selectionRef.current.end);
  };

  return (
    <AppBox className={styles.root}>
      <TextFieldInput
        inputRef={inputRef}
        label={label}
        value={value}
        onChange={handleTextChange}
        onSelect={() => {
          if (inputRef.current) rememberSelection(inputRef.current);
        }}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        error={error}
        maxLength={maxLength}
        inputProps={{ "aria-label": label }}
        InputProps={{
          endAdornment: (
            <AppInputAdornment position="end">
              <AppIconButton
                type="button"
                aria-label="Open emoji picker"
                aria-expanded={pickerOpen}
                disabled={disabled}
                onClick={() => setPickerOpen(true)}
                className={styles.emojiTrigger}
              >
                ☺
              </AppIconButton>
            </AppInputAdornment>
          ),
        }}
      />
      {helperText && (
        <AppFormHelperText error={error}>{helperText}</AppFormHelperText>
      )}

      <AppDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        maxWidth="sm"
        fullWidth
        className={styles.dialog}
        aria-labelledby={dialogTitleId}
        TransitionProps={{ onExited: restoreInputFocus }}
      >
        <AppDialogTitle id={dialogTitleId} className={styles.dialogTitle}>
          <span>Choose an emoji</span>
          <AppIconButton
            type="button"
            aria-label="Close emoji picker"
            onClick={() => setPickerOpen(false)}
            className={styles.closeButton}
          >
            <CancelOutlined fontSize="small" />
          </AppIconButton>
        </AppDialogTitle>
        <AppDialogContent className={styles.dialogContent}>
          <TextFieldInput
            label="Search all emojis"
            value={query}
            placeholder="Search by name or keyword"
            inputProps={{ "aria-label": "Search all emojis" }}
            onChange={(event) => {
              setQuery(event.target.value);
              resetPickerList();
            }}
            className={styles.searchInput}
          />

          <AppBox
            className={styles.categoryList}
            role="tablist"
            aria-label="Emoji categories"
          >
            {EMOJI_GROUPS.map((group) => {
              const selected = !query.trim() && group.name === activeGroup;
              return (
                <AppButtonBase
                  key={group.name}
                  type="button"
                  role="tab"
                  aria-label={group.name}
                  aria-selected={selected}
                  title={group.name}
                  className={`${styles.categoryButton} ${selected ? styles.categoryButtonSelected : ""}`.trim()}
                  onClick={() => {
                    setActiveGroup(group.name);
                    setQuery("");
                    resetPickerList();
                  }}
                >
                  {group.icon}
                </AppButtonBase>
              );
            })}
          </AppBox>

          <AppTypography variant="caption" className={styles.groupTitle}>
            {query.trim()
              ? `Search results · ${filteredEmojis.length}`
              : activeGroupData.name}
          </AppTypography>
          <AppBox
            ref={gridRef}
            className={styles.emojiGrid}
            role="group"
            aria-label={query.trim() ? "Emoji search results" : activeGroupData.name}
          >
            {filteredEmojis.map((emoji) => (
              <AppButtonBase
                key={emoji.codepoints}
                type="button"
                aria-label={`Insert ${emoji.short_name}`}
                title={emoji.short_name}
                className={styles.emojiButton}
                onClick={() => handleEmojiSelect(emoji)}
              >
                {emoji.emoji}
              </AppButtonBase>
            ))}
            {filteredEmojis.length === 0 && (
              <AppTypography className={styles.emptyState}>
                No emojis found.
              </AppTypography>
            )}
          </AppBox>
        </AppDialogContent>
      </AppDialog>
    </AppBox>
  );
};

export default EmojiTextInput;
