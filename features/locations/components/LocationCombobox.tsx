"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import type { LocationOption } from "@/features/locations/api/locations";

export function LocationCombobox({
  options,
  value,
  onValueChange,
  placeholder,
  emptyMessage,
  disabled,
  invalid,
}: {
  options: LocationOption[];
  value?: string;
  onValueChange: (option: LocationOption | null) => void;
  placeholder: string;
  emptyMessage: string;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const selectedOption = options.find((option) => option.code === value) ?? null;

  return (
    <Combobox
      items={options}
      itemToStringLabel={(option) => option.name}
      itemToStringValue={(option) => option.code}
      value={selectedOption}
      onValueChange={(option) => onValueChange(option ?? null)}
      autoHighlight
    >
      <ComboboxInput
        className="w-full"
        disabled={disabled}
        placeholder={placeholder}
        showClear
        aria-invalid={invalid || undefined}
      />
      <ComboboxContent>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxList>
          {(option: LocationOption) => (
            <ComboboxItem key={option.code} value={option}>
              <span className="min-w-0 truncate">{option.name}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
