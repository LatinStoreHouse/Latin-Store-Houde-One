

"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
    <div className={cn("w-full space-y-2", className)}>
        <Collapsible>
             <div className="flex items-center justify-between space-x-4 px-1">
                 <h4 className="text-sm font-semibold">{displayLabel}</h4>
                 <CollapsibleTrigger asChild>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                            Añadir Productos
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="end">
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
                 </CollapsibleTrigger>
             </div>
             <CollapsibleContent className="space-y-2 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                <div className="rounded-md border px-4 py-3 font-mono text-sm">
                    {selected.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {selected.map((value) => {
                                const label = options.find((option) => option.value === value)?.label || value;
                                return (
                                    <Badge key={value} variant="secondary">
                                        {label}
                                        <button
                                            aria-label={`Remove ${label}`}
                                            onClick={() => handleSelect(value)}
                                            className="ml-1 rounded-full p-0.5 text-secondary-foreground/50 hover:bg-destructive/20 hover:text-destructive"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-center text-muted-foreground">No hay productos seleccionados.</p>
                    )}
                </div>
             </CollapsibleContent>
        </Collapsible>
    </div>
  )
}
