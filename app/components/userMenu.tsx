import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Form, Link, useSubmit } from "@remix-run/react";
import styles from "~/styles/css/5_components/userMenu.css";
import { getUserImgSrc, useOptionalAdminUser, useUser } from "~/utils/misc";
import { LogoutConfirm } from "~/components/logoutConfirm";
import { DarkModeToggle } from "~/components/themeSwitcher";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const UserMenu = () => {
  const user = useUser();
  return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Link
              to={`/users/${user.username}`}
              onClick={e => e.preventDefault()}
              className="navbar__settingsLink"
          >
            <span className="navbar__userName">
              {user.name ?? user.username}
            </span>
            <img
                className="navbar__userPhoto"
                alt={user.name ?? user.username}
                src={getUserImgSrc(user.imageId)}
            />
          </Link>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal className="userMenu">
          <DropdownMenu.Content
              sideOffset={8}
              align="start"
              className="userMenu"
          >
            <DropdownMenu.Item asChild>
              <Link
                  prefetch="intent"
                  to={`/users/${user.username}`}
                  className="userMenu__link"
              >
                👤 Profile
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link
                  prefetch="intent"
                  to="/admin"
                  className="userMenu__link"
              >
                👮 Admin
              </Link>
            </DropdownMenu.Item>
            <div className="userMenu__settings">
              <DarkModeToggle />
              <LogoutConfirm />
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
  );
};