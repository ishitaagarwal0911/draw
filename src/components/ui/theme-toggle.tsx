"use client"

import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/hooks/useTheme"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  // next-themes
  // const { resolvedTheme, setTheme } = useTheme()
  // const isDark = resolvedTheme === "dark"
  // onClick={() => setTheme(isDark ? "light" : "dark")}

  return (
    <div
      className={cn(
        "relative flex w-16 h-10 rounded-full cursor-pointer transition-all duration-300 border-[0.8px] border-[#D3D3D3]",
        isDark 
          ? "bg-zinc-900/80" 
          : "bg-white/80",
        className
      )}
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
    >
      <div
        className={cn(
          "absolute flex justify-center items-center w-8 h-8 rounded-full transition-transform duration-300 top-1",
          isDark 
            ? "transform translate-x-1 bg-zinc-700" 
            : "transform translate-x-7 bg-gray-300"
        )}
      >
        {isDark ? (
          <Moon 
            className="w-4 h-4 text-white" 
            strokeWidth={2}
          />
        ) : (
          <Sun 
            className="w-4 h-4 text-gray-700" 
            strokeWidth={2}
          />
        )}
      </div>
    </div>
  )
}