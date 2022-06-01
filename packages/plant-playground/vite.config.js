import { VitePWA } from "vite-plugin-pwa";
import { viteStaticCopy } from "vite-plugin-static-copy";

let base = "/";

/**
 * @type {import("vite").UserConfig}
 */
export default {
  base,
  build: {
    manifest: true,
    outDir: "output",
  },
  plugins: [
    configureBasePlugin(),
    VitePWA({
      includeAssets: ["favicon.svg", "favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        short_name: "Playground",
        name: "PlantDB Playground",
        icons: [
          {
            src: "favicon.svg",
            type: "image/svg+xml",
            sizes: "24x24",
          },
          {
            src: "images/flower-192.png",
            type: "image/png",
            sizes: "192x192",
          },
          {
            src: "images/flower-512.png",
            type: "image/png",
            sizes: "512x512",
          },
          {
            src: "images/flower-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        start_url: "/",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        theme_color: "#4cae4f",
        shortcuts: [
          {
            name: "Plants",
            short_name: "Plants",
            description: "Your plants",
            url: "/list",
            icons: [{ src: "/images/playground-plants.png", sizes: "2208x2032" }],
          },
        ],
        description: "Interact with PlantDB data",
        screenshots: [
          {
            src: "images/playground-log.png",
            type: "image/png",
            sizes: "2208x2032",
          },
          {
            src: "images/playground-plants.png",
            type: "image/png",
            sizes: "2208x2032",
          },
        ],
      },
    }),
    viteStaticCopy({
      targets: [
        {
          src: "../../node_modules/@shoelace-style/shoelace/dist/assets/**/*",
          dest: "assets",
        },
      ],
    }),
  ],
};

function configureBasePlugin() {
  return {
    name: "configure-base",
    config(config) {
      base = config.base;
    },
    transformIndexHtml: {
      enforce: "pre",
      // eslint-disable-next-line quotes
      transform: html => html.replace('<base href="/" />', `<base href="${base}" />`),
    },
  };
}
