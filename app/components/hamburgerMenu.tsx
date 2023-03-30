import { SymbolsIconSVG } from "~/components/IconSVG";
import { NavLink } from "~/components/navbar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Form, Link } from "@remix-run/react";
import styles from "~/styles/css/5_components/hamburgerMenu.css";
import { useOptionalAdminUser, useOptionalUser } from "~/utils";
import { LogoutConfirm } from "~/components/logoutConfirm";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const HamburgerMenu = () => {
  const isAdmin = useOptionalAdminUser();
  const user = useOptionalUser();

  return (
    <>
      {user && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className={"navbar__hamburger"}>
            <SymbolsIconSVG
              id="hamburger"
              extendedClass={"hamburgerIcon"}
              enabled
            />
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="navbar__mobileMenu"
              sideOffset={10}
            >
              <div className="navbar__mobileLinks">
                <DropdownMenu.Item asChild>
                  {isAdmin &&
                    <Link to={"/admin"}>Admin</Link>
                  }
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link to={"/notes"}>Notes</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <LogoutConfirm />
                </DropdownMenu.Item>
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </>
  );
};
