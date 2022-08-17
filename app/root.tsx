import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import resetStylesheetUrl from "./styles/reset.css";
import { getUser } from "./session.server";
import { getBookGroupsForAdminUser } from "./models/bookGroup.server";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindStylesheetUrl },
    { rel: "stylesheet", href: resetStylesheetUrl },
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Remix Notes",
  viewport: "width=device-width,initial-scale=1",
});

export async function loader({ request }: LoaderArgs) {
  const user = await getUser(request);
  let adminUserGroups: string[] = [];
  if (user) {
    const resGroups = await getBookGroupsForAdminUser(user?.id);
    adminUserGroups = resGroups.map(({ slug }) => slug);
  }

  return json({
    user,
    adminUserGroups,
  });
}

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
