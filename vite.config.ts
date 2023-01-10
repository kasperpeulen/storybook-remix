import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import istanbul from "vite-plugin-istanbul";

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return {
    resolve: {
      alias: [{ find: "~", replacement: path.resolve(__dirname, "./app") }],
    },
    build: {
      sourcemap: true,
    },
    plugins: [
      react(),
      istanbul({
        forceBuildInstrument: true,
        requireEnv: true,
        include: ["app/**/*"],
        exclude: ["node_modules", "app/test/**/*", "**/*.stories.ts"],
      }),
    ],
  };
});
