import { viteStaticCopy } from "vite-plugin-static-copy";

let base = "/";

/**
 * @type {import("vite").UserConfig}
 */
export default {
  base,
  build: {
    outDir: "output",
  },
  plugins: [
    configureBasePlugin(),
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
