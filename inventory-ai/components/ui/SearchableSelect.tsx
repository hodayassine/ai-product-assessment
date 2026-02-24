"use client";

import { useState, useEffect } from "react";
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
  const [mounted, setMounted] = useState(false);
  const selected = options.find((o) => o.value === value) ?? null;
  const stableId = id ?? name;
  const displayLabel = selected?.label ?? placeholder;

  // Render react-select only after mount so server and client both output the same placeholder (no hydration mismatch)
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full">
      <input type="hidden" name={name} value={value} readOnly />
      {mounted ? (
        <Select<SelectOption>
          instanceId={stableId}
          inputId={stableId}
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
      ) : (
        <div
          className="min-h-[42px] w-full rounded-md border border-[#cbd5e1] bg-white px-3 py-2.5 text-slate-900"
          style={{ boxSizing: "border-box" }}
          aria-hidden
        >
          {displayLabel}
        </div>
      )}
    </div>
  );
}
