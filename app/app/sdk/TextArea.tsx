import { TextField as RACTextField, Label as RACLabel, TextArea as RACTextarea } from "react-aria-components";
import type { FormEvent, KeyboardEvent } from "react";
import { useState, useRef } from "react";
import EmojiPicker from "emoji-picker-react";

interface IProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
  emojiPicker?: boolean;
  placeholder: string;
}

export default function TextArea({ emojiPicker = false, name, label, placeholder, ...rest }: IProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Submit the form
      const form = e.currentTarget.closest("form");
      if (form) {
        form.requestSubmit();
      }
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const currentValue = textarea.value;

      // Insert emoji at cursor position
      const newValue = currentValue.substring(0, start) + emojiData.emoji + currentValue.substring(end);

      // Create a proper React change event
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value"
      )?.set;

      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(textarea, newValue);

        // Trigger React's onChange
        const event = new Event("input", { bubbles: true });
        textarea.dispatchEvent(event);
      }

      // Move cursor after the emoji
      setTimeout(() => {
        const newCursorPos = start + emojiData.emoji.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);

      setShowEmojiPicker(false);
    }
  };

  return (
    <RACTextField className="relative" aria-label={label || name}>
      {label && <RACLabel>{label}</RACLabel>}
      <div className="relative">
        <RACTextarea
          ref={textareaRef}
          name={name}
          onKeyDown={handleKeyDown}
          className="border dark:border-slate-700 rounded-md w-full h-full p-4 pr-12"
          placeholder={placeholder}
          {...rest}
        />
        {emojiPicker && (
          <>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute cursor-pointer right-2 top-2 text-2xl hover:scale-110 transition-transform"
              aria-label="Toggle emoji picker"
            >
              😊
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 z-50">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </>
        )}
      </div>
    </RACTextField>
  );
}
