import type {
  DataFunctionArgs,
  LinksFunction,
  V2_MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useLoaderData,
} from "@remix-run/react";
import { getUser } from "~/utils/session.server";
import Navbar from "~/components/navbar";
import { ThemeProvider, useTheme } from "~/utils/themeProvider";
import type { ReactNode } from "react";
import { styleSheet } from "~/utils/styleSheet";
import { getEnv } from "~/utils/env.server";
import { getThemeSession } from "~/utils/theme.server";

export const meta: V2_MetaFunction = ({ data }) => {
  const requestInfo = data?.session;

  return [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width,initial-scale=1" },
    {
      name: "theme-color",
      content: requestInfo.theme === "dark" ? "#0d1117" : "#e1e1e7",
    },
  ];
};

export const links: LinksFunction = () => {
  return styleSheet;
};

export type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
  ENV: any;
  data: SerializeFrom<typeof loader>;
};

export async function loader({ request }: DataFunctionArgs) {
  const themeSession = await getThemeSession(request);
  const user = await getUser(request);

  const data = {
    ENV: getEnv(),
    user: user,
    session: {
      theme: themeSession.getTheme(),
    },
  };

  const headers: HeadersInit = new Headers();

  if (!user && !data) {
    throw new Response("not found", { status: 404 });
  }

  return json(data, { headers });
}

const App = ({
  children,
  title = "MikeApp",
}: {
  children?: ReactNode;
  title?: string;
}) => {
  const [theme] = useTheme();
  const data = useLoaderData();

  return (
    <html lang="en" className={theme?.toString()}>
      <head>
        <Meta />
        <title>{title}</title>
        <Links />
      </head>
      <body>
        <Navbar />
        <main className="container">
          <div className="content">
            <Outlet />
            {children}
          </div>
        </main>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        {process.env.NODE_ENV === "development" ? <LiveReload /> : null}
        <Scripts />
      </body>
    </html>
  );
};

export default function AppWithProviders() {
  const data = useLoaderData<LoaderData>();
  return (
    <ThemeProvider specifiedTheme={data.session.theme}>
      <App />
    </ThemeProvider>
  );
}
