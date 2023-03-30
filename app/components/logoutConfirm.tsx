import React from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Form, useSubmit } from "@remix-run/react";
import { SymbolsIconSVG } from "~/components/IconSVG";

export const LogoutConfirm = () => {
  const submit = useSubmit();
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <button className="Button violet">Log out</button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="dialog__overlay" />
        <AlertDialog.Content className="dialog__content">
          <AlertDialog.Title className="AlertDialogTitle">
            Are you sure?
          </AlertDialog.Title>
          <AlertDialog.Description className="AlertDialogDescription">
            log out?
          </AlertDialog.Description>
          <div className="dialog__buttons">
            <AlertDialog.Cancel asChild>
              <button className="Button mauve">Cancel</button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Form
                action={"/logout"}
                method="post"
                onClick={(e) => submit(e.currentTarget)}
              >
                <button type="submit" className="userPage__logout">
                  yes
                </button>
              </Form>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
