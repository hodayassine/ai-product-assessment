"use client";

import dynamic from "next/dynamic";
import type { SingleValue, StylesConfig } from "react-select";

export type SelectOption = { value: string; label: string };

// Load react-select only on the client to avoid SSR/hydration ID issues
const ReactSelect = dynamic(() => import("react-select"), { ssr: false });

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
  const stableId = id ?? name;
  const handleChange = (opt: SingleValue<SelectOption>) => onChange(opt?.value ?? "");

  return (
    <div className="w-full">
      <input type="hidden" name={name} value={value} readOnly />
      <ReactSelect
        instanceId={stableId}
        inputId={stableId}
        aria-label={ariaLabel}
        options={options}
        value={selected}
        // Casts are to satisfy react-select's generic types when using dynamic()
        onChange={handleChange as any}
        placeholder={placeholder}
        isClearable={allowClear}
        isSearchable
        styles={customStyles as any}
        classNamePrefix="rs"
      />
    </div>
  );
}
