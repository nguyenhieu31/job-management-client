// components/SearchableDropdown.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

interface Option {
  id: number;
  name: string | number;
}

// Props cho component
interface SearchableDropdownProps {
  options: Option[];
  label?: string;
  placeholder?: string;
  multiple?: boolean;
  onChange?: (value: Option | null) => void;
  defaultValue?: Option | null;
  className?: string;
  type: string;
}

// Helper function to format number with VND thousand separators (dots)
const formatVND = (value: string | number): string => {
  const numericValue = value.toString().replace(/\D/g, "");
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Helper function to parse VND formatted string to number
const parseVND = (value: string): number => {
  const numericValue = value.replace(/\./g, "");
  return parseInt(numericValue) || 0;
};

export default function SearchableDropdown({
  options,
  placeholder = "Tìm kiếm...",
  multiple = false,
  onChange,
  defaultValue = null,
  className,
  type = "text",
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValue, setSelectedValue] = useState<Option | null>(
    defaultValue
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click bên ngoài
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

  // Filter options dựa trên search term
  const filteredOptions = useMemo(() => {
    // For VND type, compare numeric values
    if (type === "vnd") {
      const searchNumeric = parseVND(searchTerm);
      if (searchTerm.trim() === "") return options;
      return options.filter((option) => {
        const optionNumeric = typeof option.name === "number" 
          ? option.name 
          : parseVND(option.name.toString());
        return optionNumeric.toString().includes(searchNumeric.toString());
      });
    }
    return options.filter((option) =>
      option.name.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, type]);

  // Xử lý nhập giá trị tùy chỉnh (cho type number hoặc vnd)
  const handleCustomInput = () => {
    if (type === "number" && searchTerm.trim() !== "") {
      const customValue = parseFloat(searchTerm);
      if (!isNaN(customValue)) {
        const customOption: Option = {
          id: 0,
          name: customValue,
        };
        setSelectedValue(customOption);
        if (onChange) onChange(customOption);
        setIsOpen(false);
        setSearchTerm("");
      }
    } else if (type === "vnd" && searchTerm.trim() !== "") {
      const numericValue = parseVND(searchTerm);
      if (numericValue > 0) {
        const formattedValue = formatVND(numericValue);
        const customOption: Option = {
          id: 0,
          name: formattedValue, // Store formatted VND string
        };
        setSelectedValue(customOption);
        if (onChange) onChange(customOption);
        setIsOpen(false);
        setSearchTerm("");
      }
    }
  };

  // Xử lý chọn option
  const handleSelect = (option: Option) => {
    setSelectedValue(option);
    onChange?.(option);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Xóa một item (dùng cho multiple select)
  const handleRemove = (optionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Clear all
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedValue(null);
    if (onChange) onChange(null);
    setSearchTerm("");
  };

  // Kiểm tra xem option có được chọn không
  const isSelected = (option: Option) => {
    if (multiple && Array.isArray(selectedValue)) {
      return selectedValue.some((item) => item.id === option.id);
    }
    return (selectedValue as Option)?.id === option.id;
  };

  // Hiển thị text cho selected value
  const getDisplayText = () => {
    if (!selectedValue) return "";
    if (multiple && Array.isArray(selectedValue)) {
      return `${selectedValue.length} mục đã chọn`;
    }
    return (selectedValue as Option)?.name;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input/Trigger Button */}
      <div
        className="relative overflow-hidden w-full min-h-[42px] px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {/* Multiple selected items */}
          {multiple &&
          Array.isArray(selectedValue) &&
          selectedValue.length > 0 ? (
            selectedValue.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
              >
                {item.name}
                <button
                  onClick={(e) => handleRemove(item.id, e)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X size={14} />
                </button>
              </span>
            ))
          ) : (
            <span className={`flex-1 ${!selectedValue ? "text-gray-400" : ""}`}>
              {getDisplayText() || placeholder}
            </span>
          )}
        </div>

        {/* Icons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {selectedValue && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X size={16} className="text-gray-400" />
            </button>
          )}
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type={type === "vnd" ? "text" : type}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={
                type === "number" || type === "vnd"
                  ? "Chọn hoặc nhập giá tùy chỉnh..."
                  : "Tìm kiếm..."
              }
              value={searchTerm}
              onChange={(e) => {
                if (type === "vnd") {
                  // Only allow digits, auto-format with dots
                  const rawValue = e.target.value.replace(/\D/g, "");
                  setSearchTerm(rawValue ? formatVND(rawValue) : "");
                } else {
                  setSearchTerm(e.target.value);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (type === "number" || type === "vnd")) {
                  handleCustomInput();
                }
              }}
            />
            {(type === "number" || type === "vnd") && (
              <p className="text-xs text-gray-500 mt-1 px-1">
                💡 Nhấn Enter để sử dụng giá tùy chỉnh
              </p>
            )}
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-64">
            {/* Custom input option for number type */}
            {type === "number" &&
              searchTerm.trim() !== "" &&
              !isNaN(parseFloat(searchTerm)) && (
                <div
                  className="px-3 py-2 cursor-pointer bg-green-50 hover:bg-green-100 border-b border-green-200 flex items-center justify-between"
                  onClick={handleCustomInput}
                >
                  <span className="text-green-700 font-medium">
                    💡 Sử dụng giá: <strong>{parseFloat(searchTerm)}</strong>
                  </span>
                  <Check size={16} className="text-green-600" />
                </div>
              )}

            {/* Custom input option for VND type */}
            {type === "vnd" &&
              searchTerm.trim() !== "" &&
              parseVND(searchTerm) > 0 && (
                <div
                  className="px-3 py-2 cursor-pointer bg-green-50 hover:bg-green-100 border-b border-green-200 flex items-center justify-between"
                  onClick={handleCustomInput}
                >
                  <span className="text-green-700 font-medium">
                    💡 Sử dụng giá: <strong>{searchTerm} VNĐ</strong>
                  </span>
                  <Check size={16} className="text-green-600" />
                </div>
              )}

            {filteredOptions.length === 0 ? (
              <div className="px-3 py-8 text-center text-gray-500">
                {(type === "number" &&
                searchTerm.trim() !== "" &&
                !isNaN(parseFloat(searchTerm))) ||
                (type === "vnd" && searchTerm.trim() !== "" && parseVND(searchTerm) > 0)
                  ? "Nhấn vào 'Sử dụng giá' phía trên"
                  : "Không tìm thấy kết quả"}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                    isSelected(option) ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  <div className="flex items-center gap-2">
                    {multiple && (
                      <div
                        className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                          isSelected(option)
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected(option) && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                    )}
                    <span className="text-gray-900">{option.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!multiple && isSelected(option) && (
                      <Check size={16} className="text-blue-500" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
