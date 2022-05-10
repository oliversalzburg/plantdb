let base = "/";

/**
 * @type {import("vite").UserConfig}
 */
export default {
  base,
  build: {
    outDir: "output",
  },
  plugins: [configureBasePlugin()],
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
