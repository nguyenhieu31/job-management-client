"use client"

import { Input } from "@/components/ui/input"
import { useState } from "react"

interface EditableInputProps {
  value: number
  onChange: (value: number) => void
  className?: string
  readOnly?: boolean
}

export function EditableInput({ value, onChange, className, readOnly = false }: EditableInputProps) {
  const [currentValue, setCurrentValue] = useState(value ? value.toString() : "—")
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    // Only allow numbers
    if (newValue === "" || /^\d+$/.test(newValue)) {
      setCurrentValue(newValue.toString())
      onChange(parseInt(newValue) || 0)
    }
  }

  if (readOnly) {
    return <span>{value}</span>
  }

  return (
    <Input
      type="text"
      value={currentValue}
      onChange={handleChange}
      className={`w-20 h-8 text-center ${className}`}
    />
  )
}
