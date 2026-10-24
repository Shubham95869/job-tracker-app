"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "moon"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "job-tracker-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTheme = localStorage.getItem(storageKey);
        if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "moon") {
          return savedTheme;
        }
      } catch {
        // Use the default when browser storage is unavailable.
      }
    }
    return defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark", "moon")
    root.classList.add(theme)
    try {
      localStorage.setItem(storageKey, theme)
    } catch {
      // The selected theme still applies for this page when storage is unavailable.
    }
  }, [theme, storageKey])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
