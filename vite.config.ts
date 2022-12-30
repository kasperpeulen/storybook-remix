import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import istanbul from "vite-plugin-istanbul";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [{ find: "~", replacement: path.resolve(__dirname, "./app") }],
  },
  build: {
    sourcemap: true,
  },
  plugins: [
    react(),
    istanbul({
      checkProd: false,
      forceBuildInstrument: true,
      include: ["app/routes/*", "app/utils/request*", "app/utils/session*"],
      exclude: ["node_modules", "test/", "*.stories*"],
      extension: [".ts", ".tsx"],
    }),
  ],
});
