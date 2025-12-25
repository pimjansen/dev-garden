import { Auth0Strategy } from "remix-auth-auth0";
import type { IUser } from "~/context/UserContext";

// Re-export IUser for convenience
export type { IUser };

// Create the Auth0 strategy
export const auth0Strategy = new Auth0Strategy<IUser>(
  {
    domain: process.env.AUTH0_DOMAIN!,
    clientId: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    redirectURI: process.env.AUTH0_CALLBACK_URL || "http://localhost:5173/auth/callback",
    scopes: ["openid", "email", "profile"],
  },
  async ({ tokens }) => {
    // Decode the ID token to get user info
    const idToken = tokens.idToken();
    const payload = JSON.parse(atob(idToken.split(".")[1]));

    // Create the user object
    const user: IUser = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      nickname: payload.nickname,
    };

    // Note: Session will be managed in the callback route
    return user;
  }
);
