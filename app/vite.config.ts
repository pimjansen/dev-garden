import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    allowedHosts: [
      "rafaela-unreclined-porfirio.ngrok-free.dev"
    ],
  },
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
});
