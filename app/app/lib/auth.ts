import { authenticatedUserContext } from "~/middleware/authMiddleware";
import type { IUser } from "~/context/UserContext";

/**
 * Get the authenticated user from the context.
 * Returns the user object if authenticated, null otherwise.
 *
 * @param context - The request context from loaders/actions/middleware
 * @returns The authenticated user or null
 */
export function getUser(context: any): IUser {
  // In loaders/actions, get the user from the context that was set by authMiddleware
  return context.get(authenticatedUserContext) || null;
}
