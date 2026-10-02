import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import {
  FontSize,
  MenuButtonAddImage,
  MenuButtonAddTable,
  MenuButtonAlignCenter,
  MenuButtonAlignJustify,
  MenuButtonAlignLeft,
  MenuButtonAlignRight,
  MenuButtonBlockquote,
  MenuButtonBold,
  MenuButtonBulletedList,
  MenuButtonCode,
  MenuButtonHighlightColor,
  MenuButtonItalic,
  MenuButtonOrderedList,
  MenuButtonRedo,
  MenuButtonStrikethrough,
  MenuButtonSubscript,
  MenuButtonSuperscript,
  MenuButtonTextColor,
  MenuButtonUnderline,
  MenuButtonUndo,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectFontFamily,
  MenuSelectFontSize,
  MenuSelectHeading,
  RichTextEditor,
  useRichTextEditorContext,
  type RichTextEditorRef,
} from "mui-tiptap";
import type React from "react";
import { useEffect, useMemo, useRef } from "react";

import {
  AppBox,
  AppFormHelperText,
  AppInputLabel,
} from "@/components/material-ui-component-wrappers";

import styles from "../../styles/FormInput.module.scss";

// Component for adding images (needs editor context)
const ImageButton: React.FC = () => {
  const editor = useRichTextEditorContext();
  return (
    <MenuButtonAddImage
      onClick={() => {
        const url = window.prompt("Enter image URL:");
        if (url && editor) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      }}
    />
  );
};

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}

/**
 * Rich Text Editor Component
 * Comprehensive MUI-based rich text editor with extensive formatting options
 * Features:
 * - Text formatting: Bold, Italic, Underline, Strikethrough, Code, Subscript, Superscript
 * - Headings (H1-H6)
 * - Font family and size selection
 * - Text and highlight colors
 * - Lists (bulleted, numbered)
 * - Text alignment (left, center, right, justify)
 * - Blockquotes
 * - Links
 * - Images
 * - Tables
 * - Undo/Redo
 * - Outputs HTML for storage
 */
const RichTextEditorComponent: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  label,
  error = false,
  helperText,
  disabled = false,
  required = false,
  placeholder = "Enter text...",
}) => {
  const editorRef = useRef<RichTextEditorRef>(null);

  // Configure all extensions
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        link: false, // Exclude from StarterKit since we're adding it separately
        underline: false, // Exclude from StarterKit since we're adding it separately
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "rich-text-link",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      FontSize,
      Color,
      FontFamily,
      Highlight,
      Subscript,
      Superscript,
      Image,
      Table,
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder,
      }),
    ],
    [placeholder],
  );

  // Sync editor content when value prop changes externally (e.g., form reset or test data)
  useEffect(() => {
    const editor = editorRef.current?.editor;
    if (!editor || editor.isDestroyed || value === undefined) {
      return;
    }

    const currentContent = editor.getHTML();
    // Only update if the content is different to avoid unnecessary updates.
    if (currentContent !== value) {
      // This is an external form-value synchronization, not a user edit.
      // Tiptap's default emits an update here, which causes the editor's
      // normalized fragment to overwrite complete HTML documents (including
      // <head>/<style> content) when the user switches templates.
      editor.commands.setContent(value || "", {
        emitUpdate: false,
      });
    }
  }, [value]);

  return (
    <AppBox className={styles["rich-text-editor-wrapper"]}>
      <AppInputLabel
        required={required}
        error={error}
        className={`${styles["rich-text-editor-label"]} ${error ? styles["rich-text-editor-label--error"] : ""}`}
      >
        {label}
      </AppInputLabel>
      <AppBox
        className={`${styles["rich-text-editor"]} ${error ? styles["rich-text-editor--error"] : ""} ${disabled ? styles["rich-text-editor--disabled"] : ""}`}
      >
        <RichTextEditor
          ref={editorRef}
          extensions={extensions}
          content={value || ""}
          onUpdate={({ editor }) => {
            onChange(editor.getHTML());
          }}
          editable={!disabled}
          className={styles["rich-text-editor-component"]}
          renderControls={(editor) => {
            if (!editor || editor.isDestroyed) {
              return null;
            }

            return (
              <MenuControlsContainer>
                {/* Headings and Font Controls */}
                <MenuSelectHeading />
                <MenuSelectFontFamily
                  options={[
                    // Sans-serif fonts
                    { label: "Arial", value: "Arial" },
                    { label: "Helvetica", value: "Helvetica" },
                    { label: "Verdana", value: "Verdana" },
                    { label: "Trebuchet MS", value: "Trebuchet MS" },
                    { label: "Tahoma", value: "Tahoma" },
                    { label: "Geneva", value: "Geneva" },
                    { label: "Lucida Grande", value: "Lucida Grande" },
                    {
                      label: "Lucida Sans Unicode",
                      value: "Lucida Sans Unicode",
                    },
                    { label: "Century Gothic", value: "Century Gothic" },
                    {
                      label: "Franklin Gothic Medium",
                      value: "Franklin Gothic Medium",
                    },
                    { label: "Gill Sans", value: "Gill Sans" },
                    { label: "Impact", value: "Impact" },
                    { label: "Optima", value: "Optima" },
                    { label: "Segoe UI", value: "Segoe UI" },
                    { label: "Calibri", value: "Calibri" },
                    { label: "Candara", value: "Candara" },
                    { label: "Corbel", value: "Corbel" },
                    { label: "Myriad Pro", value: "Myriad Pro" },
                    { label: "Futura", value: "Futura" },
                    { label: "Roboto", value: "Roboto" },
                    { label: "Open Sans", value: "Open Sans" },
                    { label: "Lato", value: "Lato" },
                    { label: "Montserrat", value: "Montserrat" },
                    { label: "Raleway", value: "Raleway" },
                    { label: "Ubuntu", value: "Ubuntu" },
                    { label: "Source Sans Pro", value: "Source Sans Pro" },
                    { label: "PT Sans", value: "PT Sans" },
                    { label: "Nunito", value: "Nunito" },
                    { label: "Poppins", value: "Poppins" },
                    { label: "Inter", value: "Inter" },
                    // Serif fonts
                    { label: "Times New Roman", value: "Times New Roman" },
                    { label: "Georgia", value: "Georgia" },
                    { label: "Palatino", value: "Palatino" },
                    { label: "Garamond", value: "Garamond" },
                    { label: "Book Antiqua", value: "Book Antiqua" },
                    { label: "Baskerville", value: "Baskerville" },
                    { label: "Bodoni MT", value: "Bodoni MT" },
                    { label: "Cambria", value: "Cambria" },
                    { label: "Constantia", value: "Constantia" },
                    { label: "Didot", value: "Didot" },
                    { label: "Hoefler Text", value: "Hoefler Text" },
                    { label: "Lucida Bright", value: "Lucida Bright" },
                    { label: "Minion Pro", value: "Minion Pro" },
                    { label: "Perpetua", value: "Perpetua" },
                    { label: "Rockwell", value: "Rockwell" },
                    { label: "Times", value: "Times" },
                    { label: "Playfair Display", value: "Playfair Display" },
                    { label: "Merriweather", value: "Merriweather" },
                    { label: "Lora", value: "Lora" },
                    { label: "Crimson Text", value: "Crimson Text" },
                    { label: "PT Serif", value: "PT Serif" },
                    { label: "Libre Baskerville", value: "Libre Baskerville" },
                    // Monospace fonts
                    { label: "Courier New", value: "Courier New" },
                    { label: "Courier", value: "Courier" },
                    { label: "Monaco", value: "Monaco" },
                    { label: "Consolas", value: "Consolas" },
                    { label: "Lucida Console", value: "Lucida Console" },
                    { label: "Menlo", value: "Menlo" },
                    { label: "Monaco", value: "Monaco" },
                    { label: "Source Code Pro", value: "Source Code Pro" },
                    { label: "Roboto Mono", value: "Roboto Mono" },
                    { label: "Fira Code", value: "Fira Code" },
                    { label: "Inconsolata", value: "Inconsolata" },
                    // Decorative/Display fonts
                    { label: "Comic Sans MS", value: "Comic Sans MS" },
                    { label: "Brush Script MT", value: "Brush Script MT" },
                    { label: "Papyrus", value: "Papyrus" },
                    { label: "Chalkduster", value: "Chalkduster" },
                    { label: "Marker Felt", value: "Marker Felt" },
                    { label: "Bradley Hand", value: "Bradley Hand" },
                    { label: "Snell Roundhand", value: "Snell Roundhand" },
                    { label: "Zapfino", value: "Zapfino" },
                    { label: "Dancing Script", value: "Dancing Script" },
                    { label: "Pacifico", value: "Pacifico" },
                    { label: "Lobster", value: "Lobster" },
                    { label: "Bebas Neue", value: "Bebas Neue" },
                    { label: "Oswald", value: "Oswald" },
                    { label: "Anton", value: "Anton" },
                    { label: "Righteous", value: "Righteous" },
                  ]}
                />
                <MenuSelectFontSize />
                <MenuDivider />
  
                {/* Text Formatting */}
                <MenuButtonBold />
                <MenuButtonItalic />
                <MenuButtonUnderline />
                <MenuButtonStrikethrough />
                <MenuButtonCode />
                <MenuButtonSubscript />
                <MenuButtonSuperscript />
                <MenuDivider />
  
                {/* Colors */}
                <MenuButtonTextColor />
                <MenuButtonHighlightColor />
                <MenuDivider />
  
                {/* Lists and Alignment */}
                <MenuButtonBulletedList />
                <MenuButtonOrderedList />
                <MenuButtonBlockquote />
                <MenuButtonAlignLeft />
                <MenuButtonAlignCenter />
                <MenuButtonAlignRight />
                <MenuButtonAlignJustify />
                <MenuDivider />
  
                {/* Media and Tables */}
                <ImageButton />
                <MenuButtonAddTable />
  
                {/* Undo/Redo */}
                <MenuButtonUndo />
                <MenuButtonRedo />
              </MenuControlsContainer>
            );
          }}
        />
      </AppBox>
      {helperText && (
        <AppFormHelperText
          error={error}
          className={styles["rich-text-editor-helper-text"]}
        >
          {helperText}
        </AppFormHelperText>
      )}
    </AppBox>
  );
};

export default RichTextEditorComponent;
