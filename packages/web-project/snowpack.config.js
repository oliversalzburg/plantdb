// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  workspaceRoot: "../..",
  mount: {
    source: "/output",
    public: "/",
  },
  plugins: [
    [
      "snowpack-plugin-raw-file-loader",
      {
        exts: [".csv"],
      },
    ],
  ],
  buildOptions: {
    baseUrl: "/",
    clean: false,
    sourcemap: true,
  },
  optimize: {
    bundle: false,
    sourcemap: false,
  },
};
