"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={theme === 'light' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setTheme("light")}
      >
        <Sun className="h-4 w-4 mr-2" />
        Claro
      </Button>
      <Button
        variant={theme === 'dark' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setTheme("dark")}
      >
        <Moon className="h-4 w-4 mr-2" />
        Oscuro
      </Button>
    </div>
  )
}
