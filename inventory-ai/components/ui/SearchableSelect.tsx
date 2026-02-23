"use client";

import Select, { type SingleValue, type StylesConfig } from "react-select";

export type SelectOption = { value: string; label: string };

const customStyles: StylesConfig<SelectOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: "42px",
    borderColor: state.isFocused ? "#4f46e5" : "#cbd5e1",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(79, 70, 229, 0.15)" : "none",
    "&:hover": { borderColor: state.isFocused ? "#4f46e5" : "#94a3b8" },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 50,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#eef2ff" : state.isSelected ? "#e0e7ff" : "white",
    color: state.isSelected ? "#3730a3" : "#0f172a",
  }),
};

type SearchableSelectProps = {
  options: SelectOption[];
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
  id?: string;
  "aria-label"?: string;
};

export function SearchableSelect({
  options,
  name,
  value,
  onChange,
  placeholder = "Select...",
  allowClear = false,
  id,
  "aria-label": ariaLabel,
}: SearchableSelectProps) {
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <div className="w-full">
      <input type="hidden" name={name} value={value} readOnly />
      <Select<SelectOption>
        inputId={id}
        aria-label={ariaLabel}
        options={options}
        value={selected}
        onChange={(opt: SingleValue<SelectOption>) => onChange(opt?.value ?? "")}
        placeholder={placeholder}
        isClearable={allowClear}
        isSearchable
        styles={customStyles}
        classNamePrefix="rs"
      />
    </div>
  );
}
