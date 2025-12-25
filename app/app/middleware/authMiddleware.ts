import {
  createContext,
  type MiddlewareFunction,
  redirect,
} from "react-router";
import { getSessionFromContext } from "~/services/session.server";
import type { IUser } from "~/context/UserContext";

// Create a context to store the authenticated user for server-side access
export const authenticatedUserContext = createContext<IUser | null>(null);

export const authMiddleware: MiddlewareFunction = async ({ request, context }) => {
  // Get the user from the session
  const session = getSessionFromContext(context);
  const user = session.get("user") as IUser | null;

  // If not authenticated, redirect to login
  if (!user) {
    throw redirect("/auth/login");
  }

  // Store the user in the context so it can be accessed by routes
  context.set(authenticatedUserContext, user);
};
