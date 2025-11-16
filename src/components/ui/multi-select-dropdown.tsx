// components/MultiSelectDropdown.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

interface Option {
  id: number;
  name: string;
}

interface MultiSelectDropdownProps {
  options: Option[];
  placeholder?: string;
  onChange?: (values: Option[]) => void;
  defaultValue?: Option[];
  className?: string;
  title?: string;
}

export default function MultiSelectDropdown({
  options,
  placeholder = "Chọn...",
  onChange,
  defaultValue = [],
  className,
  title,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValues, setSelectedValues] = useState<Option[]>(defaultValue);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync internal state when defaultValue changes (for reset functionality)
  useEffect(() => {
    setSelectedValues(defaultValue);
  }, [defaultValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [options, searchTerm]
  );

  // Handle option selection
  const handleSelect = (option: Option) => {
    const isAlreadySelected = selectedValues.some(
      (item) => item.id === option.id
    );

    let newSelectedValues: Option[];
    if (isAlreadySelected) {
      // Remove if already selected
      newSelectedValues = selectedValues.filter(
        (item) => item.id !== option.id
      );
    } else {
      // Add if not selected
      newSelectedValues = [...selectedValues, option];
    }

    setSelectedValues(newSelectedValues);
    onChange?.(newSelectedValues);
    setSearchTerm("");
  };

  // Remove a single item
  const handleRemove = (optionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelectedValues = selectedValues.filter(
      (item) => item.id !== optionId
    );
    setSelectedValues(newSelectedValues);
    onChange?.(newSelectedValues);
  };

  // Clear all selections
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedValues([]);
    onChange?.([]);
    setSearchTerm("");
  };

  // Check if option is selected
  const isSelected = (option: Option) => {
    return selectedValues.some((item) => item.id === option.id);
  };

  // Get display text
  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) return selectedValues[0].name;
    return `${selectedValues.length} nhân viên đã chọn`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <div
        className="relative w-full min-h-[36px] px-3 py-1 bg-background border border-input rounded-md shadow-sm cursor-pointer hover:border-ring focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-1.5 flex-wrap min-h-[24px]">
          {selectedValues.length > 0 ? (
            // Show tags for selected items
            <div className="flex items-center gap-1.5 flex-wrap flex-1">
              {selectedValues.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium"
                >
                  {item.name}
                  <button
                    onClick={(e) => handleRemove(item.id, e)}
                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    type="button"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            // Show placeholder when empty
            <span className="flex-1 text-muted-foreground text-sm">
              {getDisplayText()}
            </span>
          )}
        </div>

        {/* Icons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {selectedValues.length > 0 && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-accent rounded-sm transition-colors"
              type="button"
            >
              <X size={16} className="text-muted-foreground" />
            </button>
          )}
          <ChevronDown
            size={16}
            className={`text-muted-foreground transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-md shadow-md overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-border bg-background">
            <input
              type="text"
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-colors"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-64">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-8 text-center text-muted-foreground text-sm">
                Không tìm thấy {title || "nhân viên"}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={`px-3 py-2.5 cursor-pointer hover:bg-accent transition-colors flex items-center justify-between ${
                    isSelected(option) ? "bg-accent/50" : ""
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${
                        isSelected(option)
                          ? "bg-primary border-primary"
                          : "border-input"
                      }`}
                    >
                      {isSelected(option) && (
                        <Check size={12} className="text-primary-foreground" />
                      )}
                    </div>
                    <span className="text-sm text-foreground">{option.name}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer - Show selected count */}
          {selectedValues.length > 0 && (
            <div className="p-2 border-t border-border bg-muted/50">
              <div className="text-xs text-muted-foreground font-medium">
                Đã chọn: {selectedValues.length} nhân viên
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
