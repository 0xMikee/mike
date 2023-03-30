import rootStyles from "~/styles/css/1_core/root.css";
import errorBoundaryStyles from "~/styles/css/errorBoundary.css";
import darkStyles from "~/styles/css/2_theme/dark.css";
import lightStyles from "~/styles/css/2_theme/light.css";
import iconSVGStyles from "~/styles/css/4_icons/iconSVG.css";
import dialogStyles from "~/styles/css/5_components/dialog.css";
import {links as navbarStyles} from "../components/navbar";

export const styleSheet = [
    ...navbarStyles(),
    {rel: "stylesheet", href: rootStyles},
    {rel: "stylesheet", href: dialogStyles},
    {rel: "stylesheet", href: darkStyles},
    {rel: "stylesheet", href: lightStyles},
    {rel: "stylesheet", href: errorBoundaryStyles},
    {rel: "stylesheet", href: iconSVGStyles}
]