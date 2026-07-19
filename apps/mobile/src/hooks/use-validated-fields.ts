import { useState } from 'react';

// ─── FieldErrors: the per-field error ─────────────────────────────────────
// Read it inside-out:
//   1. Record<FieldName, string> → an record whose key are the field name and value are messages
//                              e.g. Record<'email' | 'password', string> = { email: string; password: string }
//   2. Partial<…>            → marks every key optional, so a field is present ONLY while it has an error,
//                             a valid field is simply absent (not an empty string).
//
// Why use FieldErrors<FieldName extends string>:
//   - How it works: `FieldName` is a type parameter — a placeholder for the callers own key set,
//    `extends string` constrains that type parameter to string(s).
//     So each caller gets an object typed to exactly its own fields:
//     FieldErrors<'email' | 'password'>  →  { email?: string; password?: string }.
//     which lets TS compiler know when to rejected wrong keys and the editor can autocomplete correctly.
//
//   - Why not type FieldErrors = Partial<Record<string, string>>
//     That collapses to an index signature { [k: string]: string }, where ANY string is a valid key:
//       errors.emial = '...';   // accepted — a typo of 'email' is NOT caught
//       errors.                 // no autocomplete — the editor knows no specific keys
export type FieldErrors<FieldName extends string> = Partial<Record<FieldName, string>>;

// ─── FieldValidationResult: the outcome of one validation ─────────────────────────
// A union of two mutually-exclusive shapes:
//   - success: true  → valid;   carries `data`   = the whole fieldValues object (FieldValues)
//   - success: false → invalid; carries `fieldErrors` = the per-field messages (FieldErrors<FieldName>)
export type FieldValidationResult<FieldValues, FieldName extends string> =
  { success: true; data: FieldValues } | { success: false; fieldErrors: FieldErrors<FieldName> };

export type FieldValidator<FieldValues, FieldName extends string> = (
  values: FieldValues,
) => FieldValidationResult<FieldValues, FieldName>;

/**
 * Controlled state for a field included with a "reward early, punish late" validator. Implements :
 *
 * 1. a pristine field is never flagged while the user is still typing.
 *
 * 2. once a field has failed, it re-validates on every keystroke.
 *
 * @param initialValues - Starting value of every field; its shape defines `FieldValues`.
 * @param validate - A function the caller provides.
 *
 *  Input: the current `fieldValues`.
 *
 *  Output: `{ success: true, data }` when all fields are valid, `{ success: false, fieldErrors }`
 *  with one message per invalid field ({@link FieldValidationResult}).
 *
 * @returns
 * - `fieldValues` — current field values (`FieldValues`)
 * - `fieldErrors` — current per-field messages (`FieldErrors<FieldName>`)
 * - `setFieldValue(field, value)` — update one field's value.
 *    If that field has no error before update, `validate` will not be invoked.
 *    If it already has an error, invoke `validate`, if the field is now valid, remove it from `fieldErrors`.
 * - `validateAll()` — invoke `validate` on all current values.
 *   Valid → clear all `fieldErrors`, return the typed `FieldValues`.
 *   Invalid → set all `fieldErrors`, return `null`.
 * - `reset()` — restore `initialValues` and clear all fieldErrors
 *
 * Example 1 — both fields valid : fieldValues → { email: 'a@b.com', password: '12345678' }
 *
 *   result → { success: true, data: { email: 'a@b.com', password: '12345678' } }
 *
 * Example 2 — email valid, password empty : fieldValues → { email: 'a@b.com', password: '' }
 *
 *   result → { success: false, fieldErrors: { password: 'Password is empty' } }
 */
export function useValidatedFields<
  FieldValues extends Record<string, unknown>,
  FieldName extends string,
>(initialValues: FieldValues, validate: FieldValidator<FieldValues, FieldName>) {
  const [fieldValues, setFieldValues] = useState<FieldValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<FieldName>>({});

  function setFieldValue(field: FieldName, value: string) {
    const currentFieldValues: FieldValues = { ...fieldValues, [field]: value };
    setFieldValues(currentFieldValues);

    setFieldErrors((prevFieldErrors) => {
      // ─── Punish late ──────────────────────────────────────────────────
      // If the current typing field does not have any error (before type), then do nothing.
      // Thus prevent validation while the user is still typing, even they type something wrong.
      // Because we want to validate wrong case only when user click submit, improve UX.
      if (!prevFieldErrors[field]) return prevFieldErrors;

      // ─── Reward early ─────────────────────────────────────────────────
      // If the field is already flagged wrong, re-validate it immediately after first type,
      // so the message disappears the instant the input becomes valid.
      // Because we want to validate RIGHT case from wrong case right away, improve UX.
      const result = validate(currentFieldValues);
      const currentFieldError = result.success ? undefined : result.fieldErrors[field];

      const currentFieldErrors = { ...prevFieldErrors };

      if (currentFieldError) currentFieldErrors[field] = currentFieldError;
      else delete currentFieldErrors[field];
      return currentFieldErrors;
    });
  }

  function validateAll(): FieldValues | null {
    const result = validate(fieldValues);
    if (result.success) {
      setFieldErrors({});
      return result.data;
    }
    setFieldErrors(result.fieldErrors);
    return null;
  }

  function reset() {
    setFieldValues(initialValues);
    setFieldErrors({});
  }

  return { fieldValues, fieldErrors, setFieldValue, validateAll, reset };
}
