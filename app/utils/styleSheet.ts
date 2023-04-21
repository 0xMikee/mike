import rootStyles from "~/styles/css/1_core/root.css";
import buttonsStyles from "~/styles/css/1_core/buttons.css";
import darkStyles from "~/styles/css/2_theme/dark.css";
import lightStyles from "~/styles/css/2_theme/light.css";
import iconSVGStyles from "~/styles/css/4_icons/iconSVG.css";
import errorBoundaryStyles from "~/styles/css/5_components/errorBoundary.css";
import dialogStyles from "~/styles/css/5_components/dialog.css";
import { links as navbarStyles } from "../components/navbar";
import { links as logoutConfirmStyles } from "../components/logoutConfirm";

export const styleSheet = [
  ...navbarStyles(),
  ...logoutConfirmStyles(),
  //Core
  { rel: "stylesheet", href: rootStyles },
  { rel: "stylesheet", href: buttonsStyles },
  { rel: "stylesheet", href: errorBoundaryStyles },
  { rel: "stylesheet", href: dialogStyles },
  { rel: "stylesheet", href: darkStyles },
  { rel: "stylesheet", href: lightStyles },
  { rel: "stylesheet", href: iconSVGStyles },
];
