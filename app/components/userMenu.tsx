import { SymbolsIconSVG } from "~/components/IconSVG";
import { NavLink } from "~/components/navbar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Form, Link } from "@remix-run/react";
import styles from "~/styles/css/5_components/userMenu.css";
import { useOptionalAdminUser } from "~/utils/misc";
import { LogoutConfirm } from "~/components/logoutConfirm";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const UserMenu = () => {
  const isAdmin = useOptionalAdminUser();

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className={"userMenu"}>
          <SymbolsIconSVG
            id="hamburger"
            extendedClass={"hamburgerIcon"}
            enabled
          />
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content className="navbar__userMenu" sideOffset={10}>
            <div className="navbar__userLinks">
              <DropdownMenu.Item asChild>
                {isAdmin && <Link to={"/admin"}>Admin</Link>}
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link to={"/settings/profile"}>Profile</Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <LogoutConfirm />
              </DropdownMenu.Item>
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </>
  );
};
