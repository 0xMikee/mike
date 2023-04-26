import React from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Form, useSubmit } from "@remix-run/react";
import { SymbolsIconSVG } from "~/components/IconSVG";
import styles from "~/styles/css/5_components/logoutConfirm.css";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const LogoutConfirm = () => {
  const submit = useSubmit();
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <button className="userMenu__logOut">
          <SymbolsIconSVG id="logout" extendedClass="logOutIcon" enabled />
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal className="logoutConfirm">
        <AlertDialog.Overlay className="dialog__overlay" />
        <AlertDialog.Content className="dialog__content">
          <AlertDialog.Title className="logoutConfirm__title">
            Logout
          </AlertDialog.Title>
          <AlertDialog.Description className="logoutConfirm__description">
            Are you sure you want to log out?
          </AlertDialog.Description>
          <div className="dialog__buttons">
            <AlertDialog.Cancel asChild>
              <button className="button button__cancel">no</button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Form
                action={"/logout"}
                method="post"
                onClick={(e) => submit(e.currentTarget)}
                className="button button__confirm"
              >
                  yes
              </Form>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
