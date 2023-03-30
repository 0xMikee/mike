import type {DataFunctionArgs, LinksFunction, MetaFunction, SerializeFrom} from "@remix-run/node";
import {json} from "@remix-run/node";
import {
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    useCatch, useLoaderData
} from "@remix-run/react";
import {getUser} from "./session.server";
import Navbar from "~/components/navbar";
import {ThemeProvider, useTheme} from "~/utils/themeProvider";
import type {ReactNode} from "react";
import { getThemeSession } from "./utils/theme.server";
import {styleSheet} from "~/utils/styleSheet";

export const meta: MetaFunction = ({data}) => {
    const requestInfo = data?.session

    return {
        charset: "utf-8",
        viewport: "width=device-width,initial-scale=1",
        "theme-color": requestInfo.theme === "dark" ? "#0d1117" : "#e1e1e7",
    }
}

export const links: LinksFunction = () => {
    return styleSheet;
};

export type LoaderData = SerializeFrom<typeof loader>

async function loader({request}: DataFunctionArgs) {
    const themeSession = await getThemeSession(request)
    const user = await getUser(request)

    const data = {
        user: user,
        session: {
            theme: themeSession.getTheme(),
        },
    }

    const headers: HeadersInit = new Headers()

    return json(data, {headers})
}

async function loaderImpl({request, ...rest}: DataFunctionArgs) {
    return await loader({request, ...rest})
}

export {loaderImpl as loader}

const App = ({
    children,
    title = "miikee",
}: {
    children?: ReactNode
    title?: string
}) => {
    const [theme] = useTheme()

    return (
        <html lang="en" className={theme?.toString()}>
        <head>
            <Meta/>
            <title>{title}</title>
            <Links/>
        </head>
        <body>
        <Navbar/>
        <main className="container">
            <Outlet/>
            {children}
        </main>
        {process.env.NODE_ENV === "development" ? <LiveReload/> : null}
        <Scripts/>
        </body>
        </html>
    )
}

export default function AppWithProviders() {
    const data = useLoaderData<LoaderData>()
    return (
        <ThemeProvider specifiedTheme={data.session.theme}>
            <App/>
        </ThemeProvider>
    )
}

export function CatchBoundary() {
    let caught = useCatch()

    return (
        <App title={`${caught.status} ${caught.statusText}`}>
            <div className="errorBoundary">
                <div className="errorBoundary__wrapper">
                    <h2 className="errorBoundary__header">Oops!</h2>
                    <pre className="errorBoundary__message">
                        {caught.status} {caught.statusText}
                    </pre>
                </div>
            </div>
        </App>
    )
}

export function ErrorBoundary({error}: { error: Error }) {
    console.error(error)
    return (
        <App title="Error!">
            <div className="errorBoundary">
                <div className="errorBoundary__wrapper">
                    <h2 className="errorBoundary__header">Error</h2>
                    <pre className="errorBoundary__message">
                        {error.message}
                    </pre>
                </div>
            </div>
        </App>
    )
}