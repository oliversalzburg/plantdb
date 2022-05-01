// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  workspaceRoot: "../..",
  mount: {
    source: "/output",
    public: "/",
  },
  buildOptions: {
    baseUrl: "/",
    clean: false,
  },
  optimize: {
    bundle: false,
    sourcemap: false,
  },
};
