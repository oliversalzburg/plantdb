const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["./source/main.ts"],
    outfile: "./output/main.cjs",
    platform: "node",
    sourcemap: true,
    target: "node18",
    bundle: true,
  })
  .catch(console.error);
