import type { Route } from "./+types/login";
import { auth0Strategy } from "~/services/auth.server";
import { getSessionFromContext } from "~/services/session.server";
import { redirect } from "react-router";

export async function loader({ request, context }: Route.LoaderArgs) {
  // Check if already authenticated
  const session = getSessionFromContext(context as any);
  const user = session.get("user");

  if (user) {
    return redirect("/");
  }

  // Start the authentication flow
  return auth0Strategy.authenticate(request);
}
