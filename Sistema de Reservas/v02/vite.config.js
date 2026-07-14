import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

function inlineAssetsPlugin() {
  return {
    name: "inline-assets",
    enforce: "post",
    apply: "build",
    closeBundle() {
      const distDir = resolve(__dirname, "dist");
      const htmlPath = resolve(distDir, "index.html");
      let html = readFileSync(htmlPath, "utf-8");

      const jsFiles = [];
      html = html.replace(
        /<script\s+[^>]*src="([^"]*)"[^>]*><\/script>/gi,
        (match, href) => {
          const jsPath = resolve(distDir, href.replace(/^\//, ""));
          try {
            jsFiles.push(readFileSync(jsPath, "utf-8"));
          } catch {}
          return "";
        }
      );

      html = html.replace(
        /<link\s+rel="stylesheet"\s+[^>]*href="([^"]*)"[^>]*\/?>/gi,
        (match, href) => {
          const cssPath = resolve(distDir, href.replace(/^\//, ""));
          try {
            return "<style>" + readFileSync(cssPath, "utf-8") + "</style>";
          } catch {
            return match;
          }
        }
      );

      html = html.replace(/<link\s+rel="icon"[^>]*\/?>/gi, (m) => m.replace(/href="[^"]*"/, 'href="ICONE.png"'));
      const allJS = jsFiles.join("\n");

      html = html.replace(/<\/body>/i, () => "<script>" + allJS + "</script></body>");

      writeFileSync(htmlPath, html, "utf-8");
    },
  };
}

export default defineConfig({
  plugins: [react(), inlineAssetsPlugin()],
  base: "./",
  build: {
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
