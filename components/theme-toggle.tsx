"use client"

import { Moon, Sun, Moon as MoonNight } from "lucide-react"
import { useTheme } from "@/lib/theme-provider"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Choose theme">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 moon:-rotate-90 moon:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 moon:hidden dark:block" />
          <MoonNight className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all moon:rotate-0 moon:scale-100 hidden moon:block" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("moon")}>
          <MoonNight className="mr-2 h-4 w-4" />
          Moon Night
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
