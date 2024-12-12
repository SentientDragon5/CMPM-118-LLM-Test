import { defineConfig, loadEnv } from "vite";

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    plugins: [
      {
        name: "configure-response-headers",
        configureServer: (server) => {
          server.middlewares.use((_req, res, next) => {
            res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            next();
          });
        },
      },
    ],

    // WASM and z3-solver Configuration
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "z3-solver": ["z3-solver"],
          },
        },
      },
    },
    optimizeDeps: {
      include: ["z3-solver"],
    },
    build: {
      target: "esnext", // Or a higher target that supports top-level await
      // ... other build options ...
    },
  });
};
