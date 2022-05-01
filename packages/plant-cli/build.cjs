const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["./source/main.ts"],
    outfile: "./output/main.cjs",
    platform: "node",
    target: "node16",
    bundle: true,
  })
  .catch(console.error);
