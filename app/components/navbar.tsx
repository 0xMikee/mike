import { Link, useLocation } from "@remix-run/react";
import {
  DarkModeToggle,
  links as themeStyles,
} from "~/components/themeSwitcher";
import styles from "~/styles/css/5_components/navbar.css";
import {
  HamburgerMenu,
  links as hamburgerStyles,
} from "~/components/hamburgerMenu";
import type { ReactNode } from "react";
import { useOptionalAdminUser, useOptionalUser } from "~/utils/misc";
import { LogoutConfirm } from "./logoutConfirm";
import { UserMenu } from "~/components/userMenu";

export function links() {
  return [
    ...hamburgerStyles(),
    ...themeStyles(),
    { rel: "stylesheet", href: styles },
  ];
}

export const LINKS = [
  { title: "Login", to: "/login" },
  { title: "Signup", to: "/signup" },
];

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
  const isAdmin = useOptionalAdminUser();

  return (
    <nav className="navbar">
      <Link prefetch="intent" to="/" className="navbar__logoLink">
        {!user ? <h2>Log in</h2> : <h2>{user.name}</h2>}
      </Link>
      <ul className="navbar__links">
        {isAdmin && <NavLink to={"/admin"}>Admin</NavLink>}
        {user && (
          <>
            <NavLink to={"/settings/profile"}>Notes</NavLink>
            <LogoutConfirm />
          </>
        )}
      </ul>
      <div className="navbar__settings">
        <UserMenu />
        <HamburgerMenu />
        <DarkModeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
