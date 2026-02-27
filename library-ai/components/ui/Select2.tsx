"use client";

import Select from "react-select";
import type { StylesConfig } from "react-select";

export type Select2Option = { value: string; label: string };

const select2Styles: StylesConfig<Select2Option, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: state.isFocused ? "hsl(var(--accent))" : "hsl(var(--border))",
    boxShadow: state.isFocused ? "0 0 0 3px hsl(var(--accent) / 0.15)" : "none",
    backgroundColor: "hsl(var(--card))",
    "&:hover": { borderColor: "hsl(var(--accent))" },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 10,
    border: "1px solid hsl(var(--border))",
    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)",
    overflow: "hidden",
  }),
  menuList: (base) => ({ ...base, padding: 6 }),
  option: (base, state) => ({
    ...base,
    borderRadius: 6,
    padding: "10px 12px",
    backgroundColor: state.isFocused ? "hsl(var(--accent) / 0.12)" : "transparent",
    color: "hsl(var(--foreground))",
    cursor: "pointer",
  }),
  singleValue: (base) => ({ ...base, color: "hsl(var(--foreground))" }),
  placeholder: (base) => ({ ...base, color: "hsl(var(--muted-foreground))" }),
  input: (base) => ({ ...base, color: "hsl(var(--foreground))" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "hsl(var(--muted-foreground))",
    "&:hover": { color: "hsl(var(--foreground))" },
  }),
};

type Select2Props = {
  options: Select2Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  isSearchable?: boolean;
  isDisabled?: boolean;
  className?: string;
};

export function Select2({
  options,
  value,
  onChange,
  placeholder = "Select…",
  isSearchable = true,
  isDisabled,
  className,
}: Select2Props) {
  const selected = value ? options.find((o) => o.value === value) ?? null : null;
  return (
    <div className={className}>
      <Select<Select2Option, false>
        options={options}
        value={selected}
        onChange={(opt) => onChange?.(opt?.value ?? "")}
        placeholder={placeholder}
        isSearchable={isSearchable}
        isClearable={!!value}
        isDisabled={isDisabled}
        styles={select2Styles}
      />
    </div>
  );
}
