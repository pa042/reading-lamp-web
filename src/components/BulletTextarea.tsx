"use client";

import { useEffect, useRef, type FocusEvent, type KeyboardEvent, type TextareaHTMLAttributes } from "react";

const BULLET = "・ ";

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
};

function lineStartOf(text: string, pos: number): number {
  return text.lastIndexOf("\n", pos - 1) + 1;
}

/**
 * Textarea that auto-continues "・ " bullet lines on Enter (two Enters in a row
 * on an empty bullet exits the list) and removes a whole "・ " prefix on one
 * Backspace, so writing a short bullet summary doesn't require retyping the
 * marker on every line.
 */
export default function BulletTextarea({ value, onChange, onFocus, ...rest }: Props) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const pendingCursorRef = useRef<number | null>(null);

  useEffect(() => {
    if (pendingCursorRef.current == null) return;
    const pos = pendingCursorRef.current;
    pendingCursorRef.current = null;
    ref.current?.setSelectionRange(pos, pos);
  }, [value]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    const { selectionStart, selectionEnd } = el;

    if (e.key === "Enter") {
      const lineStart = lineStartOf(value, selectionStart);
      const lineEndRaw = value.indexOf("\n", selectionStart);
      const lineEnd = lineEndRaw === -1 ? value.length : lineEndRaw;
      const currentLine = value.slice(lineStart, lineEnd);
      const isBulletLine = currentLine.startsWith(BULLET);
      const emptyBullet = isBulletLine && currentLine.slice(BULLET.length).trim() === "";

      e.preventDefault();
      if (emptyBullet) {
        // second Enter on an empty bullet: drop the marker and exit list mode
        const before = value.slice(0, lineStart);
        const after = value.slice(selectionEnd);
        onChange(before + after);
        pendingCursorRef.current = before.length;
        return;
      }

      const insert = "\n" + BULLET;
      onChange(value.slice(0, selectionStart) + insert + value.slice(selectionEnd));
      pendingCursorRef.current = selectionStart + insert.length;
      return;
    }

    if (e.key === "Backspace" && selectionStart === selectionEnd) {
      const lineStart = lineStartOf(value, selectionStart);
      const prefixEnd = lineStart + BULLET.length;
      if (selectionStart === prefixEnd && value.slice(lineStart, prefixEnd) === BULLET) {
        e.preventDefault();
        onChange(value.slice(0, lineStart) + value.slice(prefixEnd));
        pendingCursorRef.current = lineStart;
      }
    }
  }

  function handleFocus(e: FocusEvent<HTMLTextAreaElement>) {
    if (value === "") {
      onChange(BULLET);
      pendingCursorRef.current = BULLET.length;
    }
    onFocus?.(e);
  }

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      {...rest}
    />
  );
}
