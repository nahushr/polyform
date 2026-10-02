import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";
import { placeholder as codePlaceholder } from "@codemirror/view";

import {
  AppBox,
  AppFormHelperText,
  AppMenuItem,
  AppTextField,
} from "@/components/material-ui-component-wrappers";

import styles from "./CodeEditorInput.module.scss";

export const CODE_LANGUAGES = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "sql", label: "SQL" },
  { value: "json", label: "JSON" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "plain-text", label: "Plain text" },
] as const;

export type CodeLanguage = (typeof CODE_LANGUAGES)[number]["value"];

export interface CodeEditorInputProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  language?: CodeLanguage;
  placeholder?: string;
}

const CodeEditorInput = ({
  value = "",
  onChange,
  label,
  required = false,
  disabled = false,
  error = false,
  helperText,
  language: initialLanguage = "typescript",
  placeholder: placeholderText,
}: CodeEditorInputProps): JSX.Element => {
  const [language, setLanguage] = useState<CodeLanguage>(initialLanguage);

  useEffect(() => setLanguage(initialLanguage), [initialLanguage]);

  const extensions = (() => {
    switch (language) {
      case "typescript":
        return [javascript({ typescript: true, jsx: true })];
      case "javascript":
        return [javascript({ jsx: true })];
      case "python":
        return [python()];
      case "sql":
        return [sql()];
      case "json":
        return [json()];
      case "html":
        return [html()];
      case "css":
        return [css()];
      default:
        return [];
    }
  })();

  return (
    <AppBox className={styles.root}>
      <AppBox className={styles.toolbar}>
        {label && (
          <AppBox component="label" className={styles.label}>
            {label}{required ? " *" : ""}
          </AppBox>
        )}
        <AppTextField
          select
          size="small"
          label="Language"
          value={language}
          disabled={disabled}
          onChange={(event) => setLanguage(event.target.value as CodeLanguage)}
          className={styles.languageSelect}
        >
          {CODE_LANGUAGES.map((option) => (
            <AppMenuItem key={option.value} value={option.value}>
              {option.label}
            </AppMenuItem>
          ))}
        </AppTextField>
      </AppBox>
      <AppBox
        className={`${styles.editorFrame} ${error ? styles.editorError : ""} ${disabled ? styles.editorDisabled : ""}`}
      >
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={[
            ...extensions,
            ...(placeholderText ? [codePlaceholder(placeholderText)] : []),
          ]}
          editable={!disabled}
          className={styles.editor}
          aria-label={label ?? "Code editor"}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
            bracketMatching: true,
            closeBrackets: true,
          }}
        />
      </AppBox>
      {helperText && <AppFormHelperText error={error}>{helperText}</AppFormHelperText>}
    </AppBox>
  );
};

export default CodeEditorInput;
