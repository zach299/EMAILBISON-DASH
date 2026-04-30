"use client";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  placeholder?: string;
}

export function Select({ value, onChange, options, className, placeholder }: SelectProps) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3.5 py-2 pr-8 text-sm text-slate-800 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent cursor-pointer"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  );
}

interface MultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: SelectOption[];
  className?: string;
  placeholder?: string;
}

export function MultiSelect({ values, onChange, options, className, placeholder }: MultiSelectProps) {
  const toggle = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  const label = values.length === 0
    ? (placeholder ?? "All")
    : values.length === 1
      ? options.find((o) => o.value === values[0])?.label ?? values[0]
      : `${values.length} selected`;

  return (
    <div className={cn("relative group", className)}>
      <button className="w-full flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer">
        <span className="truncate">{label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
      </button>
      <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 hidden group-focus-within:block">
        <button
          onClick={() => onChange([])}
          className="w-full text-left px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          All
        </button>
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className="w-full text-left px-3.5 py-2 text-sm text-slate-800 hover:bg-slate-50 flex items-center gap-2"
          >
            <span className={cn("w-3.5 h-3.5 rounded border border-slate-300 flex items-center justify-center", values.includes(opt.value) && "bg-slate-900 border-slate-900")}>
              {values.includes(opt.value) && <span className="text-white text-[9px]">✓</span>}
            </span>
            <span className="truncate">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
