import { useCallback, useEffect } from 'react';

export type ShortcutCallback = (e: KeyboardEvent) => void;

export interface Modifiers {
  shiftKey?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  [modifier: string]: boolean | undefined;
}

export interface ShortcutKey {
  key: string;
  modifiers?: Modifiers;
}

function areModifiersPressed(shortcutModifiers: Modifiers, pressed: Modifiers): boolean {
  for (const [key, isPressed] of Object.entries(shortcutModifiers)) {
    if (Boolean(pressed[key]) !== isPressed) {
      return false;
    }
  }

  return true;
}

export function useKeyboardShortcut(shortcutKeys: ShortcutKey[], callback: ShortcutCallback): void {
  const handleKeydown = useCallback(
    (e: KeyboardEvent) => {
      const { key, shiftKey, altKey, ctrlKey, metaKey, repeat } = e;
      if (repeat) {
        return;
      }

      const pressedModifiers: Modifiers = { shiftKey, altKey, ctrlKey, metaKey };

      for (const shortcut of shortcutKeys) {
        if (shortcut.key === key) {
          if (!shortcut.modifiers) {
            callback(e);
          } else if (areModifiersPressed(shortcut.modifiers, pressedModifiers)) {
            callback(e);
          }
        }
      }
    },
    [shortcutKeys, callback]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown, { capture: true });

    return () => window.removeEventListener('keydown', handleKeydown, { capture: true });
  });
}
