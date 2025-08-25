"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type ComboboxOption = {
  value: string
  label: string
}

type ComboboxProps = {
  options: ComboboxOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyPlaceholder?: string
  className?: string
  disabled?: boolean
  allowFreeText?: boolean
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyPlaceholder = "No options found.",
  className,
  disabled,
  allowFreeText = false
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value || '')

  React.useEffect(() => {
    setInputValue(options.find(o => o.value === value)?.label || value || '')
  }, [value, options]);

  const handleSelect = (currentValue: string) => {
    const selectedOption = options.find(o => o.value.toLowerCase() === currentValue.toLowerCase());
    const newValue = selectedOption ? selectedOption.value : "";
    
    if (onValueChange) {
        onValueChange(newValue);
    }
    
    setInputValue(selectedOption ? selectedOption.label : '');
    setOpen(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const textValue = e.target.value;
    setInputValue(textValue);
    if(allowFreeText && onValueChange) {
        onValueChange(textValue);
    }
  }

  const handleBlur = () => {
    if (!allowFreeText) {
        const selectedOption = options.find(o => o.value === value);
        setInputValue(selectedOption ? selectedOption.label : '');
    }
  }

  const displayValue = options.find((option) => option.value === value)?.label || (allowFreeText && value ? value : placeholder);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className="truncate">
            {displayValue}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={!allowFreeText}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={allowFreeText ? value : inputValue}
            onValueChange={allowFreeText ? onValueChange : setInputValue}
            onBlur={handleBlur}
          />
          <CommandList>
            <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label} // Compare against label for filtering
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
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
  )
}
