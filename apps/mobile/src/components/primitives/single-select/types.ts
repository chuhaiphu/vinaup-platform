import React from 'react';

export interface SingleSelectOption {
  /** Display text for the option. */
  label: string | null;
  /** Unique value used for selection comparison. */
  value: string | null;
  /** Optional element rendered to the left of the label (e.g. icon, avatar). */
  leftSection?: React.ReactNode;
}

export interface SingleSelectProps {
  /** List of options to display. */
  options: SingleSelectOption[];
  /** The currently selected value, compared against each option's `value`. */
  value: string;
  /** Called with the option's value when the user taps an item. */
  onSelectOption: (value: string) => void;
  /**
   * Optional custom renderer for each option item.
   * When provided, the default layout is bypassed entirely.
   *
   * @param option - The option data for this item.
   * @param isSelected - Whether this item matches the current `value`.
   * @param select - Call this to trigger `onSelectOption` with this option's value.
   */
  renderOption?: (
    option: SingleSelectOption,
    isSelected: boolean,
    select: () => void,
  ) => React.ReactNode;
}
