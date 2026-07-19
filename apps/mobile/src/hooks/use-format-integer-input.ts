import { useState, useCallback } from 'react';

import { generateLocaleFormatString } from '@/utils/generator/string-generator/generate-locale-format-string';
import { generateRawNumber } from '@/utils/generator/string-generator/generate-raw-number';

type Options = { decimalPlaces?: number; locale?: Intl.LocalesArgument };

/**
 * Drives a whole-number text input: the form stores a digits-only string, the user sees a
 * thousands-grouped string. Integer domain only — the change handler strips every non-digit,
 * so a decimal separator cannot survive. For decimals use `useFormatDecimalInput`.
 *
 * Data flow:
 *   externalStringValue ("1500000")  ──format──>  displayValue ("1.500.000")   // shown to user
 *   displayValue ("1.500.000x")      ──strip───>  onChange("1500000")          // value sent to the form
 *
 * @param externalStringValue - Raw (digits-only) string value.
 * @param onChange - Called when the onDisplayValueChange function is called.
 * @param options.decimalPlaces - Decimal places to render. Defaults to 0.
 * @param options.locale - BCP 47 locale for separators. Defaults to 'vi-VN' (dot = thousands).
 * @returns `{ displayValue, onDisplayValueChange }`
 *
 * @example
 * const { displayValue, onDisplayValueChange } = useFormatIntegerInput(rawAmount, setRawAmount);
 * <TextInput value={displayValue} onChangeText={onDisplayValueChange} keyboardType="numeric" />
 */
export function useFormatIntegerInput(
  externalStringValue: string,
  onChange: (value: string) => void,
  { decimalPlaces = 0, locale = 'vi-VN' }: Options = {},
) {
  // ─── Step 1: Derive the formatted text from the raw string value ─────
  // Round-trip: raw string value → number → locale string so an incoming "1500000" shows as "1.500.000".
  const initialValue = externalStringValue
    ? generateLocaleFormatString(generateRawNumber(externalStringValue), locale, decimalPlaces)
    : '';

  // ─── Step 2: Hold the displayed text as local state ─────
  const [displayValue, setDisplayValue] = useState(initialValue);

  // ─── Step 3: Re-sync when the external value changes ─────
  // Covers updates that don't originate from typing (form reset, loading saved data).
  // Set-during-render (not an effect): React applies it before paint, so no extra frame.
  // Compare on the raw prop, NOT initialValue — initialValue is recomputed every render,
  // so its reference always "changes" and would loop forever.
  const [prevExternalValue, setPrevExternalValue] = useState(externalStringValue);
  if (externalStringValue !== prevExternalValue) {
    setPrevExternalValue(externalStringValue);
    setDisplayValue(initialValue);
  }

  // ─── Step 4: Handle user typing ─────
  const onDisplayValueChange = useCallback(
    (text: string) => {
      // Strip separators and any non-digit chars so partial/garbage input ("1.500.000x")
      // collapses back to the raw value the form expects ("1500000").
      const digitsOnlyStringValue = text.replace(/[^0-9]/g, '');
      onChange(digitsOnlyStringValue);

      const num = Number(digitsOnlyStringValue) || 0;
      // Show empty (not "0") when the field is cleared, so the placeholder can appear
      const newDisplayValue =
        num === 0 ? '' : generateLocaleFormatString(num, locale, decimalPlaces);
      setDisplayValue(newDisplayValue);
    },
    [onChange, locale, decimalPlaces],
  );

  return { displayValue, onDisplayValueChange };
}
