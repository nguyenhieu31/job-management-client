"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"

interface EditableSelectProps {
  value: string
  options: { value: string; label: string }[]
  onSave: (value: string) => void
  className?: string
}

export function EditableSelect({ value, options, onSave, className }: EditableSelectProps) {
  const [currentValue, setCurrentValue] = useState(value)

  // Update currentValue when value prop changes
  useEffect(() => {
    setCurrentValue(value)
  }, [value])

  const handleValueChange = (newValue: string) => {
    setCurrentValue(newValue)
    onSave(newValue)
  }

  return (
    <Select value={currentValue} onValueChange={handleValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Chọn..." />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
