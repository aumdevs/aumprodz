"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

type ThemeMode = "dark" | "light";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    return window.localStorage.getItem("aum-theme") === "light"
      ? "light"
      : "dark";
  });

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <Button
      aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
      size="icon"
      type="button"
      variant="secondary"
      onClick={() => {
        document.documentElement.classList.toggle("light", nextTheme === "light");
        document.documentElement.classList.toggle("dark", nextTheme === "dark");
        window.localStorage.setItem("aum-theme", nextTheme);
        setTheme(nextTheme);
      }}
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
