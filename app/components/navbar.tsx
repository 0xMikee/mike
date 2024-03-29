import { Link, useLocation } from "@remix-run/react";
import {
  DarkModeToggle,
  links as themeStyles,
} from "~/components/themeSwitcher";
import { links as hamburgerStyles } from "~/components/hamburgerMenu";
import { links as userMenuStyles } from "~/components/userMenu";
import styles from "~/styles/css/5_components/navbar.css";
import type { ReactNode } from "react";
import { useOptionalUser } from "~/utils/misc";
import { UserMenu } from "~/components/userMenu";

export function links() {
  return [
    ...hamburgerStyles(),
    ...themeStyles(),
    ...userMenuStyles(),
    { rel: "stylesheet", href: styles },
  ];
}

export function NavLink({
  to,
  extendedClass,
  children,
  ...rest
}: Omit<Parameters<typeof Link>["0"], "to"> & {
  to: string;
  extendedClass?: string;
  children: ReactNode;
}) {
  const location = useLocation();
  const isSelected =
    to === location.pathname || location.pathname.startsWith(`${to}/`);

  return (
    <Link
      prefetch="intent"
      className={
        extendedClass
          ? extendedClass
          : `navbar__link ${isSelected ? "navbar__link--active" : ""}`
      }
      to={to}
      {...rest}
    >
      {children}
    </Link>
  );
}

const Navbar = () => {
  const user = useOptionalUser();
  const logo = "<Logo/>";

  return (
    <nav className="navbar">
      <Link prefetch="intent" to="/" className="navbar__logoLink">
        <code>{logo}</code>
      </Link>
      <div className="navbar__settings">
        {user ? <UserMenu /> : <DarkModeToggle />}
      </div>
    </nav>
  );
};

export default Navbar;
