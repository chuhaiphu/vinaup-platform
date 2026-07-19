import React from 'react';
import { StyleProp, TextStyle } from 'react-native';

export interface MultiSelectOption {
  /** Text representation for the option. */
  label: string;
  /** Actual value associated with the option. */
  value: string;
  /** Optional node rendered to the left of the label (e.g. an avatar or icon). */
  leftSection?: React.ReactNode;
}

export interface MultiSelectProps {
  /** List of available options to display. */
  options: MultiSelectOption[];
  /** Currently selected values of the options. */
  values: string[];
  /**
   * Callback function that will be called when an option is toggled.
   * This callback receives param of new array of currently selected values after the change.
   * @param newSelectedValues - The updated array of selected values after the change.
   */
  onOptionToggle: (newSelectedValues: string[]) => void;
  /**
   * Optional render prop for custom option UI.
   * When provided, the default option display is skipped entirely.
   *
   * @param value - Actual value associated with this option.
   * @param optionContext.index - Position of this option in the list.
   * @param optionContext.isSelected - Whether this option is currently selected.
   * @param optionContext.toggle - Call this to toggle the option's selection.
   */
  renderOption?: (
    value: string,
    optionContext: {
      index: number;
      isSelected: boolean;
      toggle: () => void;
    },
  ) => React.ReactNode;
  style?: {
    /** Override text style for the default option label. */
    optionText?: StyleProp<TextStyle>;
  };
}
