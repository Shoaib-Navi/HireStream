import path from "node:path"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// __dirname is not defined in ES modules
const rootDir = path.dirname(fileURLToPath(import.meta.url))

const BACKSLASH = String.fromCharCode(92)

// Libraries grouped into long-lived chunks: they change rarely, so browsers keep them cached across deploys
const VENDOR_CHUNKS = {
  "vendor-react": ["react", "react-dom", "scheduler", "react-router", "react-router-dom"],
  "vendor-redux": ["@reduxjs/toolkit", "react-redux", "redux", "redux-persist", "immer", "reselect"],
  "vendor-ui": ["radix-ui", "@radix-ui", "@floating-ui", "sonner", "next-themes", "class-variance-authority", "clsx", "tailwind-merge"],
}

const packageName = (id) => {
  const normalized = id.split(BACKSLASH).join("/")
  const marker = "/node_modules/"
  const start = normalized.lastIndexOf(marker)
  if (start === -1) return null
  const [scopeOrName, name] = normalized.slice(start + marker.length).split("/")
  return scopeOrName.startsWith("@") ? `${scopeOrName}/${name}` : scopeOrName
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // matched per module, so only the parts of each library that are actually used get bundled
        manualChunks(id) {
          const name = packageName(id)
          if (!name) return undefined
          const scope = name.split("/")[0]
          return Object.keys(VENDOR_CHUNKS).find((chunk) =>
            VENDOR_CHUNKS[chunk].some((pkg) => pkg === name || pkg === scope),
          )
        },
      },
    },
  },
})
