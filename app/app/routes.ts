import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
    layout("routes/layout.tsx", [
        index("routes/board/view.tsx"),
        route("call/incoming", "routes/call/incoming.tsx"),
        route("call/in-call", "routes/call/in-call.tsx"),
        route("chat/add-channel", "routes/chat/add-channel.tsx"),
        route("chat/channel/:id", "routes/chat/channel.tsx"),
    ]),
    ...prefix('auth', [
      route('login', 'routes/auth/login.tsx'),
      route('callback', 'routes/auth/callback.tsx'),
      route('logout', 'routes/auth/logout.tsx'),
    ])
] satisfies RouteConfig;
