import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    layout("routes/layout.tsx", [
        index("routes/board/view.tsx"),
        route("call/incoming", "routes/call/incoming.tsx"),
        route("call/in-call", "routes/call/in-call.tsx"),
        route("chat/channel/:id", "routes/chat/channel.tsx"),
    ]),
] satisfies RouteConfig;
