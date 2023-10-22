import { VitePWA } from "vite-plugin-pwa";
import { viteStaticCopy } from "vite-plugin-static-copy";
import manifest from "./package.json" assert { type: "json" };

let base = "/";

const getDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}${month}${day}`;
};

const getVersionString = () => {
  return [
    manifest.version ?? "<version not manifested>",
    process.env.NIGHTLY_BUILD ? `-${getDateString()}` : "",
    process.env.GITHUB_SHA ? `-${String(process.env.GITHUB_SHA).substring(0, 7)}` : "",
  ].join("");
};

const getBuildInfo = () => {
  return [
    `This project was built ${new Date().toISOString()}.`,
    `The version of this build is ${getVersionString()}.`,
  ].join("\n");
};

/**
 * @type {import("vite").UserConfig}
 */
export default {
  base,
  build: {
    manifest: true,
    outDir: "output",
  },
  define: {
    __APP_VERSION__: JSON.stringify(getVersionString()),
    __BUILD_INFO__: JSON.stringify(getBuildInfo()),
  },
  plugins: [
    addBuildInfoPlugin(),
    configureBasePlugin(),

    VitePWA({
      devOptions: {
        type: "module",
        navigateFallback: "index.html",
      },
      includeAssets: ["favicon.svg", "favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        short_name: "Nursery",
        name: "PlantDB Nursery",
        icons: [
          {
            src: "favicon.svg",
            type: "image/svg+xml",
            sizes: "512x512",
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
        ],
        background_color: "#888888",
        display: "standalone",
        theme_color: "#4cae4f",
        shortcuts: [
          {
            name: "Plants",
            short_name: "Plants",
            description: "Your plants",
            url: "list",
            icons: [{ src: "images/nursery-plants.png", sizes: "2208x2032" }],
          },
        ],
        description: "Interact with PlantDB data",
        screenshots: [
          {
            src: "images/nursery-log.png",
            type: "image/png",
            sizes: "2208x2032",
          },
          {
            src: "images/nursery-plants.png",
            type: "image/png",
            sizes: "2208x2032",
          },
        ],
      },
    }),
    viteStaticCopy({
      targets: [
        {
          src: "../../node_modules/@shoelace-style/shoelace/dist/assets/icons",
          dest: "assets",
          preserveTimestamps: true,
        },
      ],
    }),
  ],
  server: {
    port: 3000,
  },
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

function addBuildInfoPlugin() {
  return {
    name: "build-info",
    transformIndexHtml: {
      enforce: "pre",
      // eslint-disable-next-line quotes
      transform: html => html.replace("__BUILD_INFO__", getBuildInfo()),
    },
  };
}
