import React, {
  useRef,
  useEffect,
  Dispatch,
  SetStateAction,
  ReactNode,
  useCallback,
  useState,
  useContext,
  createContext,
} from "react";
import { useFetcher } from "@remix-run/react";

enum Theme {
  DARK = "dark",
  LIGHT = "light",
}
const themes: Array<Theme> = Object.values(Theme);

type ThemeContextType = [Theme | null, Dispatch<SetStateAction<Theme | null>>];

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);
ThemeContext.displayName = "ThemeContext";

const prefersLightMQ = "(prefers-color-scheme: light)";
const getPreferredTheme = () =>
  window.matchMedia(prefersLightMQ).matches ? Theme.LIGHT : Theme.DARK;

function ThemeProvider({
  children,
  specifiedTheme,
}: {
  children: ReactNode;
  specifiedTheme: Theme | null;
}) {
  const [theme, setThemeState] = useState<Theme | null>(() => {
    if (specifiedTheme) {
      if (themes.includes(specifiedTheme)) return specifiedTheme;
      else return null;
    }

    if (typeof window !== "object") return null;

    return getPreferredTheme();
  });

  const persistTheme = useFetcher();
  const persistThemeRef = useRef(persistTheme);
  useEffect(() => {
    persistThemeRef.current = persistTheme;
  }, [persistTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(prefersLightMQ);
    const handleChange = () => {
      setThemeState(mediaQuery.matches ? Theme.LIGHT : Theme.DARK);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const setTheme = useCallback(
    (cb: Parameters<typeof setThemeState>[0]) => {
      const newTheme = typeof cb === "function" ? cb(theme) : cb;
      if (newTheme) {
        persistThemeRef.current.submit(
          { theme: newTheme },
          { action: "action/set-theme", method: "post" }
        );
      }
      setThemeState(newTheme);
    },
    [theme]
  );

  return (
    <ThemeContext.Provider value={[theme, setTheme]}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && themes.includes(value as Theme);
}

export { ThemeProvider, useTheme, themes, Theme, isTheme };
