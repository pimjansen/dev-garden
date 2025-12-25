import { uuidv7 } from "uuidv7";
import type { Route } from "./+types/callback";
import { redirect } from "react-router";
import { prisma } from "~/lib/prisma";
import { auth0Strategy } from "~/services/auth.server";
import { getSessionFromContext } from "~/services/session.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  try {
    // This will handle the Auth0 callback and return the user from Auth0
    const remoteUser = await auth0Strategy.authenticate(request);

    // Check if user exists in database, create if not
    let dbUser = await prisma.user.findUnique({
      where: { email: remoteUser.email },
    });

    if (!dbUser) {
      // Create new user in database
      dbUser = await prisma.user.create({
        data: {
          id: uuidv7(),
          email: remoteUser.email,
          name: remoteUser.name || remoteUser.email,
          nickname: remoteUser.nickname || remoteUser.email.split("@")[0],
          last_login: new Date(),
        },
      });
    } else {
      // Update last login time for existing user
      await prisma.user.update({
        where: { email: remoteUser.email },
        data: { last_login: new Date() },
      });
    }

    // Store user in session (managed by sessionMiddleware)
    const session = getSessionFromContext(context as any);

    // Store the IUser format in session (matching what the app expects)
    session.set("user", {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      nickname: dbUser.nickname,
      picture: remoteUser.picture,
    });

    // Redirect to home - session is auto-committed by sessionMiddleware
    return redirect("/");
  } catch (error) {
    // If authentication fails, redirect to login
    console.error("Auth callback error:", error);
    return redirect("/auth/login");
  }
}
