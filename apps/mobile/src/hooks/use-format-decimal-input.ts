import { useState, useCallback } from 'react';

import { generateLocaleFormatString } from '@/utils/generator/string-generator/generate-locale-format-string';

type Options = { max?: number; decimalPlaces?: number; locale?: Intl.LocalesArgument };

/**
 * Drives a decimal text input: the form stores a dot-decimal string ("8.5"), the user sees
 * the vi-VN comma form ("8,5"). Use this hook whenever the value can have a fractional part.
 * A typed dot is treated as the decimal comma, and an optional `max` clamps the value.
 *
 * Data flow:
 *   externalStringValue ("8.5")  ──format──>  displayValue ("8,5")   // shown to user
 *   displayValue ("8,5")         ──parse───>  onChange("8.5")        // value sent to the form
 *
 * @param externalStringValue - Raw dot-decimal string value (parseable by Number).
 * @param onChange - Called with the raw dot-decimal string on each keystroke.
 * @param options.max - Upper bound; values above it are clamped down. Defaults to no bound.
 * @param options.decimalPlaces - Cap on rendered decimals. Defaults to full precision.
 * @param options.locale - BCP 47 locale. Defaults to 'vi-VN' (comma = decimal).
 * @returns `{ displayValue, onDisplayValueChange }`
 */
export function useFormatDecimalInput(
  externalStringValue: string,
  onChange: (value: string) => void,
  { max, decimalPlaces, locale = 'vi-VN' }: Options = {},
) {
  // Format the canonical dot-decimal raw into the comma display form.
  const formatDotToComma = (raw: string): string => {
    if (!raw) return '';
    // if decimalPlaces is specified, use the locale formatter with the specified decimal places;
    // otherwise, just replace the dot with a comma
    return decimalPlaces != null
      ? generateLocaleFormatString(Number.parseFloat(raw), locale, decimalPlaces)
      : raw.replace('.', ',');
  };

  const initialValue = formatDotToComma(externalStringValue);
  const [displayValue, setDisplayValue] = useState(initialValue);

  // Re-sync on external change (form reset, loaded data). Set-during-render, not an effect;
  // compare on the raw prop so the check can't loop on a freshly recomputed initialValue.
  const [prevExternalValue, setPrevExternalValue] = useState(externalStringValue);
  if (externalStringValue !== prevExternalValue) {
    setPrevExternalValue(externalStringValue);
    setDisplayValue(initialValue);
  }

  const onDisplayValueChange = useCallback(
    (text: string) => {
      // Normalize from dot to comma and strip all non-numeric characters except the first comma.
      // "8.5" -> "8,5" | "8." -> "8," | "abc8x5" -> "85"
      let sanitized = text.replace(/\./g, ',').replace(/[^0-9,]/g, '');
      // "8,5,3" -> "8,53" | "8," -> "8," (trailing comma kept, lets user keep typing)
      const firstComma = sanitized.indexOf(',');
      if (firstComma !== -1) {
        sanitized =
          sanitized.slice(0, firstComma + 1) + sanitized.slice(firstComma + 1).replace(/,/g, '');
      }

      if (!sanitized) {
        onChange('');
        setDisplayValue('');
        return;
      }
      // Get the raw value for the form: "8,5" -> "8.5"
      const raw = sanitized.replace(',', '.');
      if (max != null && Number.parseFloat(raw) > max) {
        onChange(String(max));
        setDisplayValue(String(max).replace('.', ','));
        return;
      }

      onChange(raw);
      setDisplayValue(sanitized);
    },
    [onChange, max],
  );

  return { displayValue, onDisplayValueChange };
}
