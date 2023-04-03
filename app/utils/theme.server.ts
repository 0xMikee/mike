import { createCookieSessionStorage } from "@remix-run/node";
import { Theme, isTheme } from "~/utils/themeProvider";

const themeStorage = createCookieSessionStorage({
  cookie: {
    name: "theme",
    secure: true,
    sameSite: "lax",
    secrets: ["s3cret1"],
    path: "/",
    httpOnly: true,
  },
});

async function getThemeSession(request: Request) {
  const session = await themeStorage.getSession(request.headers.get("Cookie"));
  return {
    getTheme: () => {
      const themeValue = session.get("theme");
      return isTheme(themeValue) ? themeValue : Theme.DARK;
    },
    setTheme: (theme: Theme) => session.set("theme", theme),
    commit: () =>
      themeStorage.commitSession(session, {
        expires: new Date("2101-12-20"),
      }),
  };
}

export { getThemeSession };
