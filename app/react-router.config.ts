import type { Config } from "@react-router/dev/config";

declare module "react-router" {
  interface Future {
    v8_middleware: true;
    unstable_optimizeDeps: true;
  }
}

export default {
  ssr: true,
  future: {
    unstable_optimizeDeps: true,
    v8_middleware: true,
  },
} satisfies Config;
