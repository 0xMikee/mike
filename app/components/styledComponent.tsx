import React from "react"
import styles from "../styles/css/5_components/styledComponent.css"
import {useTheme} from "~/utils/themeProvider"

export function links() {
    return [{rel: "stylesheet", href: styles}]
}

export const StyledComponent = () => {
    const [theme] = useTheme()
    return (
        <>
            <div
                title={`${theme}`}
                className="styledComponent styledComponent__dark"
            >
                {theme}
            </div>
        </>
    )
}
