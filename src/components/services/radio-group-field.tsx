"use client";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface RadioOption {
  value: string;
  label: string;
  price?: number;
}

interface RadioGroupFieldProps {
  name: string;
  legend: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
}

export function RadioGroupField({
  name,
  legend,
  options,
  value,
  onChange,
  required = false,
  error,
}: RadioGroupFieldProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium mb-2">
        {legend}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </legend>
      <div className="grid gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            htmlFor={`${name}-${option.value}`}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all duration-200",
              value === option.value
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/30",
            )}
          >
            <div
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
                value === option.value
                  ? "border-primary"
                  : "border-input",
              )}
            >
              {value === option.value && (
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              )}
            </div>
            <input
              type="radio"
              id={`${name}-${option.value}`}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span className="text-sm">{option.label}</span>
            {option.price != null && (
              <span className="ml-auto text-xs text-muted-foreground">
                +{option.price.toLocaleString("vi-VN")}₫
              </span>
            )}
          </label>
        ))}
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </fieldset>
  );
}
