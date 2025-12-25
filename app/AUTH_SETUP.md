# Auth0 Authentication Setup

This project uses Auth0 for authentication via `remix-auth` and `remix-auth-auth0`.

## Setup

### 1. Create an Auth0 Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new Application (Regular Web Application)
3. Note down your:
   - Domain
   - Client ID
   - Client Secret

### 2. Configure Auth0 Application

In your Auth0 Application settings, add the following:

**Allowed Callback URLs:**

```
http://localhost:5173/auth/callback
```

**Allowed Logout URLs:**

```
http://localhost:5173
```

**Allowed Web Origins:**

```
http://localhost:5173
```

### 3. Set Environment Variables

Create a `.env` file in the `app` directory:

```bash
cp .env.example .env
```

Update the values:

```env
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_CALLBACK_URL=http://localhost:5173/auth/callback
AUTH0_RETURN_TO=http://localhost:5173
SESSION_SECRET=generate-a-strong-random-string
```

## Usage

### Protecting Routes

To protect routes with authentication, apply the `authMiddleware` in your route file:

```typescript
// app/routes/protected-route.tsx
import type { Route } from "./+types/protected-route";
import { authMiddleware } from "~/middleware/authMiddleware";

export const middleware = [authMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  // User is authenticated here
  const user = getAuthUser(context);
  return { user };
}

export default function ProtectedRoute({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>Welcome, {loaderData.user.name}!</h1>
    </div>
  );
}
```

### Accessing the Authenticated User

**In Server-Side Code (Loaders/Actions):**

Use the `getAuthUser` helper function:

```typescript
import { getAuthUser } from "~/lib/auth";

export async function loader({ context }: Route.LoaderArgs) {
  const user = getAuthUser(context);
  console.log(user.id, user.email, user.name);
  // ...
}
```

**In Client-Side Components:**

Use the `useUser` hook from the unified UserContext:

```typescript
import { useUser } from "~/context/UserContext";

export default function MyComponent() {
  const { user } = useUser();

  if (!user) return <div>Not logged in</div>;

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <p>Email: {user.email}</p>
      {user.picture && <img src={user.picture} alt={user.name} />}
    </div>
  );
}
```

The user data is automatically populated from Auth0 and available throughout your app via the unified `UserContext`.

### Auth Routes

The following routes are available:

- **`/auth/login`** - Initiates Auth0 login flow
- **`/auth/callback`** - Auth0 callback URL (handles authentication)
- **`/auth/logout`** - Logs out the user

### In Your Components

To add login/logout links:

```tsx
<nav>
  <a href="/auth/login">Login</a>
  <a href="/auth/logout">Logout</a>
</nav>
```

## File Structure

```
app/
├── middleware/
│   └── authMiddleware.ts       # Main auth middleware
├── services/
│   ├── auth.server.ts          # Auth0 authenticator setup
│   └── session.server.ts       # Session storage configuration
├── lib/
│   └── auth.ts                 # Helper functions
└── routes/
    └── auth/
        ├── login.tsx           # Login route
        ├── callback.tsx        # Auth0 callback handler
        └── logout.tsx          # Logout route
```

## Production

For production deployment:

1. Update the callback URLs in Auth0 to use your production domain
2. Set production environment variables
3. Generate a strong `SESSION_SECRET` (use `openssl rand -base64 32`)
4. Ensure `NODE_ENV=production` is set

## Troubleshooting

- **Redirect loop**: Check that your Auth0 Allowed Callback URLs match `AUTH0_CALLBACK_URL`
- **Session not persisting**: Verify `SESSION_SECRET` is set
- **Login fails**: Check Auth0 Client ID, Secret, and Domain are correct
