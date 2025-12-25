import type { Route } from "./+types/logout";
import { redirect } from "react-router";
import { getSessionFromContext } from "~/services/session.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  // Get the session and clear it
  const session = getSessionFromContext(context as any);
  session.unset("user");

  // Build Auth0 logout URL
  const auth0Domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const returnTo = process.env.AUTH0_RETURN_TO || "http://localhost:5173";

  if (auth0Domain && clientId) {
    const logoutUrl = `https://${auth0Domain}/v2/logout?client_id=${clientId}&returnTo=${encodeURIComponent(returnTo)}`;
    return redirect(logoutUrl);
  }

  // If Auth0 config is not available, just redirect to login
  return redirect("/auth/login");
}
