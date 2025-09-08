
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "./badge"
import { Separator } from "./separator"

export type ComboboxOption = {
  value: string
  label: string
}

type MultiSelectComboboxProps = {
  options: ComboboxOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyPlaceholder?: string
  className?: string
  disabled?: boolean
}

export function MultiSelectCombobox({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  emptyPlaceholder = "No options found.",
  className,
  disabled,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value]
    onChange(newSelected)
  }

  const displayLabel = selected.length > 0
    ? `${selected.length} producto(s) seleccionado(s)`
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between font-normal", className)}
            disabled={disabled}
        >
            <span className="truncate">{displayLabel}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <div className="p-2 space-y-2">
            {selected.length > 0 ? (
                selected.map((value) => {
                    const label = options.find((option) => option.value === value)?.label || value;
                    return (
                         <div key={value} className="flex items-center justify-between">
                           <span className="text-sm truncate">{label}</span>
                           <Button
                                aria-label={`Remove ${label}`}
                                onClick={() => handleSelect(value)}
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                         </div>
                    )
                })
            ) : (
                <p className="text-sm text-center text-muted-foreground">No hay productos seleccionados.</p>
            )}
        </div>
        <Separator />
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value) ? "opacity-100" : "opacity-0"
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
