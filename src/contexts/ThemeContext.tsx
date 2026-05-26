import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("miiles-theme") as Theme | null;
    if (stored && (stored === "light" || stored === "dark" || stored === "system")) {
      return stored;
    }
    return "system";
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    
    // Default system (automatic time-of-day) resolution on initial mount
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
  });

  useEffect(() => {
    localStorage.setItem("miiles-theme", theme);

    const updateTheme = () => {
      let activeDark = false;
      if (theme === "dark") {
        activeDark = true;
      } else if (theme === "light") {
        activeDark = false;
      } else {
        // "system" (automatic time-of-day)
        const hour = new Date().getHours();
        activeDark = hour >= 18 || hour < 6;
      }

      setIsDark(activeDark);
      if (activeDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    updateTheme();

    if (theme === "system") {
      const interval = setInterval(updateTheme, 60000); // check time changes every minute
      return () => clearInterval(interval);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === "system") {
        return isDark ? "light" : "dark";
      }
      return prev === "light" ? "dark" : "light";
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
