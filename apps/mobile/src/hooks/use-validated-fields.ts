import { useState } from 'react';

//
// ─── FieldErrors<FieldName> ─────────────────────────────────────────────────
// One error message per field, keyed by the field's own name.
// FieldErrors<'email' | 'password'>  →  { email?: string; password?: string }
//
// A field key is present ONLY while that field is invalid.
//
// Why FieldName is a generic instead of hardcoding `string`:
//   Partial<Record<string, string>> would accept ANY string as a key — errors.emial = '...'
//   would compile with no warning, and the editor could not autocomplete real field names
//   because it has no list of what the real names are.
//   Making FieldName a generic ties the allowed keys to each caller's own field set,
//   so a typo'd key is a compile error and the editor autocompletes the real ones.
export type FieldErrors<FieldName extends string> = Partial<Record<FieldName, string>>;

//
// ─── FieldValidationResult<FieldDatas, FieldName> ─────────────────────────────────
// The shape a validate function must return — exactly one of two shapes:
//   success: true   →  { success: true;  data: FieldDatas }
//   success: false  →  { success: false; fieldErrors: FieldErrors<FieldName> }
//
// FieldValidationResult is just a NAMED shape for the return-value.
// Example, from login-screen-content.tsx:
//
//   const result = localSignInSchema.safeParse(input);
//   if (result.success) return { success: true, data: result.data };
//   return { success: false, fieldErrors: nextFieldErrors };
//
// `FieldDatas` resolves to `{ email: string; password: string }` and `FieldName` resolves to `'email' | 'password'`.
// TypeScript checks that both `return` statements actually match one of the two shapes above.
export type FieldValidationResult<FieldDatas, FieldName extends string> =
  { success: true; data: FieldDatas } | { success: false; fieldErrors: FieldErrors<FieldName> };

//
// ─── FieldValidator<FieldValues, FieldName, FieldDatas> ───────────────────────────
// The shape of the validate FUNCTION itself (not just its return value). Reads as:
// "a function that takes one argument of type FieldValues, and returns a FieldValidationResult<FieldDatas, FieldName>".
//
// `FieldDatas = FieldValues` is a DEFAULT generic — same idea as a default function parameter,
// but for a type instead of a value. Most forms submit the exact same shape they edit
// so FieldDatas quietly defaults to being identical to FieldValues, and the caller never has to mention FieldDatas.
// Example, from login-screen-content.tsx:
//   // FieldDatas is never written anywhere, so it defaults to FieldValues:
//   const { ... } = useValidatedFields(
//     { email: '', password: '' },              // FieldValues = { email: string; password: string }
//     (input) => {                              // no <FieldValidator<...>> annotation here either
//       const result = localSignInSchema.safeParse(input);
//       if (result.success) return { success: true, data: result.data };
//       // ...
//     },
//   );
//   // FieldDatas defaults to FieldValues, so `data` must be { email: string; password: string } —
//   // the exact same shape as `input`. `result.data` is that shape, so it type-checks.
//
// Some forms need FieldDatas to be a DIFFERENT shape than FieldValues.
// a TextInput can only hold text, but the API payload needs those same fields as `number`,
// plus extra fields (organizationId, projectId…) not from anything the user typed.
// For that case the caller fills in FieldDatas explicitly, from receipt-payment-detail-screen-content.tsx:
//
//   const validate: FieldValidator<
//     ReceiptPaymentFieldValues,       // FieldValues — what's being edited (strings, Dayjs…)
//     keyof ReceiptPaymentFieldValues, // FieldName   — which keys are valid error keys
//     CreateReceiptPaymentRequest      // FieldDatas        — what's returned once valid (numbers, extra fields)
//   > = (values) => {
//     const createReceiptPaymentReq: CreateReceiptPaymentRequest = {
//       unitPrice: Number(values.unitPrice) || 0,   // values.unitPrice is a string here
//       organizationId: params.organizationId,      // not part of ReceiptPaymentFieldValues at all
//       // ...
//     };
//     // ...
//     return { success: true, data: createReceiptPaymentReq };    // createReceiptPaymentReq must match FieldDatas exactly
//   };
export type FieldValidator<FieldValues, FieldName extends string, FieldDatas = FieldValues> = (
  values: FieldValues,
) => FieldValidationResult<FieldDatas, FieldName>;

/**
 * Controlled state for a form, with per-field validation errors and a
 * "reward early, punish late" typing UX (see setFieldValue below).
 *
 * @param initialValues - Starting value of every field; its shape defines FieldValues.
 * @param validate - See {@link FieldValidator}. Called on submit (validateAll), and,
 *   selectively, while re-typing an already-invalid field (setFieldValue).
 */
export function useValidatedFields<
  FieldValues extends Record<string, unknown>,
  //
  // `FieldName extends keyof FieldValues & string = keyof FieldValues & string`
  //
  //   BEFORE `=` (constraint — a boundary on what FieldName is allowed to be):
  //   FieldName may ONLY be one of FieldValues' real property names, never a made-up string.
  //   Because setFieldValue below does `FieldValues[Field]` (look up a field's type by its name),
  //   TypeScript can only resolve that lookup when it can prove the name is real.
  //
  //   AFTER `=` (default — what to assume when the caller says nothing):
  //   if the caller never mentions FieldName at all, assume it means "every field name of FieldValues".
  //
  // `keyof FieldValues` = the union of FieldValues' property names, as strings.
  // e.g. for { description: string; unitPrice: string }, keyof gives 'description' | 'unitPrice'
  FieldName extends keyof FieldValues & string = keyof FieldValues & string,
  FieldDatas = FieldValues,
>(initialValues: FieldValues, validate: FieldValidator<FieldValues, FieldName, FieldDatas>) {
  const [fieldValues, setFieldValuesState] = useState<FieldValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<FieldName>>({});

  // Updates exactly ONE field per call.
  //
  // `<Field extends FieldName>` gives this function its OWN generic, separate from the outer FieldName.
  // Every call only ever touches one field, and we want TypeScript to remember precisely WHICH one,
  // so it can look up that one field's own type via `FieldValues[Field]`
  // the type-level version of reading a value by key at runtime (obj['unitPrice']).
  //
  // Examples of what this gives us:
  //   setFieldValue('unitPrice', '100000')    → Field = 'unitPrice'        → OK
  //   setFieldValue('transactionDate', dayjs) → Field = 'transactionDate'  → OK
  //   setFieldValue('transactionDate', '1')   → Field = 'transactionDate'  → value must be Dayjs, not '1' → compile error
  function setFieldValue<Field extends FieldName>(field: Field, value: FieldValues[Field]) {
    const currentFieldValues: FieldValues = { ...fieldValues, [field]: value };
    setFieldValuesState(currentFieldValues);

    setFieldErrors((prevFieldErrors) => {
      // Punish late: a field that has never failed stays silent while the user types,
      // even if what they're typing right now is invalid — errors only start appearing
      // via validateAll() (the submit attempt).
      if (!prevFieldErrors[field]) return prevFieldErrors;

      // Reward early: once a field HAS failed, every further keystroke re-validates it,
      // so its error disappears the instant the value becomes valid again.
      const result = validate(currentFieldValues);
      const currentFieldError = result.success ? undefined : result.fieldErrors[field];

      const currentFieldErrors = { ...prevFieldErrors };
      if (currentFieldError) currentFieldErrors[field] = currentFieldError;
      else delete currentFieldErrors[field];
      return currentFieldErrors;
    });
  }

  const setFieldValues = (values: Partial<FieldValues>) => {
    setFieldValuesState((prev) => ({ ...prev, ...values }));
  };

  // Runs validate() on everything at once — the "submit" check.
  // Valid   → clear all fieldErrors, return the validated FieldDatas (see FieldValidator above).
  // Invalid → populate fieldErrors for every failing field, return null.
  function validateAll(): FieldDatas | null {
    const result = validate(fieldValues);
    if (result.success) {
      setFieldErrors({});
      return result.data;
    }
    setFieldErrors(result.fieldErrors);
    return null;
  }

  function reset() {
    setFieldValuesState(initialValues);
    setFieldErrors({});
  }

  return { fieldValues, fieldErrors, setFieldValue, setFieldValues, validateAll, reset };
}
