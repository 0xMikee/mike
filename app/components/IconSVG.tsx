import React, {ReactNode} from "react"
import LogoSVG from "../../public/images/svg/logo.svg"
import SymbolsSVG from "../../public/images/svg/symbols.svg"
import {IconSVGSelector} from "~/components/IconSVGSelector"

export interface IconSVGProps {
    id: string
    title?: string
    iconClass?: string
    enabled: boolean
    children?: null | ReactNode
    extendedClass?: string
}

export const LogoIconSVG = (props: IconSVGProps) => {
    return <IconSVGSelector svg={LogoSVG} {...props} />
}

export const SymbolsIconSVG = (props: IconSVGProps) => {
    return <IconSVGSelector svg={SymbolsSVG} {...props} />
}
