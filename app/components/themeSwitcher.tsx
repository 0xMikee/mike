import { Theme, useTheme } from "~/utils/themeProvider";
import { SymbolsIconSVG } from "~/components/IconSVG";
import styles from "~/styles/css/5_components/themeSwitcher.css";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const DarkModeToggle = () => {
  const [theme, setTheme] = useTheme();

  return (
    <button
      className="userMenu__themeSwitcher"
      onClick={() => {
        setTheme((previousTheme) =>
          previousTheme === Theme.DARK ? Theme.LIGHT : Theme.DARK
        );
      }}
    >
      {theme === "dark" ? (
        <SymbolsIconSVG id={"moon"} extendedClass={"moonIcon"} enabled />
      ) : (
        <SymbolsIconSVG id={"sun"} extendedClass={"sunIcon"} enabled />
      )}
    </button>
  );
};
