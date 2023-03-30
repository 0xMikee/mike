import React from "react";
import { IconSVGProps } from "~/components/IconSVG"

interface IconSVGSelectorProps extends IconSVGProps {
  svg: any
}

export const IconSVGSelector = ({
  svg,
  id,
  title,
  enabled,
  children,
  iconClass = "",
  extendedClass = "",
}: IconSVGSelectorProps) => {
  return enabled ? (
      <svg className={`${iconClass ? iconClass : id} ${extendedClass}`}>
        <title>{title}</title>
        <use xlinkHref={`${svg}#${id}`} />
        {children}
      </svg>
    ) : null
}
