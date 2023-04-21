import React from "react";
import type { ReactNode } from "react"
import SymbolsSVG from "../../public/images/svg/symbols.svg";
import { IconSVGSelector } from "~/components/IconSVGSelector";

export interface IconSVGProps {
  id: string;
  title?: string;
  iconClass?: string;
  enabled: boolean;
  children?: null | ReactNode;
  extendedClass?: string;
}

export const SymbolsIconSVG = (props: IconSVGProps) => {
  return <IconSVGSelector svg={SymbolsSVG} {...props} />;
};
