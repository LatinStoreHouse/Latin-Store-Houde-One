
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"

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
  displayLimit?: number;
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
  displayLimit = 3,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value]
    onChange(newSelected)
  }

  const displayedItems = selected.slice(0, displayLimit);
  const remainingCount = selected.length - displayedItems.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("group flex flex-col gap-2", className)}>
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between font-normal"
                disabled={disabled}
            >
                <span className="truncate">{placeholder}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
            {selected.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {displayedItems.map((value) => {
                        const label = options.find((option) => option.value === value)?.label || value;
                        return (
                            <Badge key={value} variant="secondary" className="gap-1.5">
                                {label}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelect(value);
                                    }}
                                    className="rounded-full ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )
                    })}
                     {remainingCount > 0 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="secondary">
                                        +{remainingCount} más
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">
                                        {selected.slice(displayLimit).map(value => 
                                            options.find(option => option.value === value)?.label || value
                                        ).join(', ')}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                     )}
                </div>
            )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
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
