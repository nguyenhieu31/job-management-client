"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EditableComboboxProps {
  value: string;
  options: Array<{ value: string; label: string }>;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function EditableCombobox({
  value,
  options,
  onSave,
  placeholder = "Chọn...",
  className,
}: EditableComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [currentValue, setCurrentValue] = React.useState(value);

  // Update internal state when value prop changes
  React.useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleSelect = (selectedLabel: string) => {
    // Find option by label (case-insensitive)
    const option = options.find(
      (opt) => opt.label.toLowerCase() === selectedLabel.toLowerCase()
    );
    if (option) {
      setCurrentValue(option.value);
      onSave(option.value);
      setOpen(false);
    }
  };

  const selectedOption = options.find((opt) => opt.value === currentValue);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command shouldFilter={true}>
          <CommandInput 
            placeholder="Tìm kiếm..." 
            className="h-9"
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={(selectedLabel) => handleSelect(selectedLabel)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentValue === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
