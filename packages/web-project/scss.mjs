// Based on https://gist.github.com/p-ob/01c02d3b88c6ad1cf44e6618211f305a
import sass from "node-sass";
import nodeSassImport from "node-sass-import";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const defaultOpts = {
  srcDir: "./source",
  outDir: "./dist",
};

const getArgs = () => {
  const opts = Object.assign({}, defaultOpts);
  if (process.env.argv) {
    const srcIndex = process.env.argv.indexOf("-s");
    const distIndex = process.env.argv.indexOf("-o");
    if (srcIndex > -1) {
      opts.srcDir = process.env.argv[srcIndex + 1];
    }
    if (distIndex > -1) {
      opts.outDir = process.env.argv[distIndex + 1];
    }
  }

  return opts;
};

const getSassFiles = (srcDir = defaultOpts.srcDir) => {
  return new Promise((resolve, reject) => {
    fs.readdir(srcDir, { withFileTypes: true }, (err, files) => {
      if (err) {
        reject(err);
      } else {
        const results = [];
        for (const f of files.filter(x => x.isFile())) {
          if (f.name.endsWith(".scss") && !f.name.startsWith("_")) {
            results.push(f);
          }
        }
        resolve(results);
      }
    });
  });
};

/**
 *
 * @param {String} sassFile
 * @returns {Promise<String>}
 */
const sassToCss = sassFile => {
  return new Promise((resolve, reject) => {
    sass.render(
      {
        file: sassFile,
        importer: nodeSassImport,
        outputStyle: "compressed",
      },
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.css.toString());
        }
      }
    );
  });
};

const writeFile = (outFile, data) => {
  // eslint-disable-next-line no-console
  console.log(`Creating file ${outFile}...`);
  return new Promise((resolve, reject) => {
    fs.writeFile(outFile, data, { encoding: "utf-8" }, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const sassRender = async () => {
  const template = "import { css } from \"lit-element\";\n\nexport const style = css`{0}`;\n";
  const opts = getArgs();

  const sassFiles = await getSassFiles(opts.srcDir);
  for (const f of sassFiles) {
    const cssString = await sassToCss(path.join(opts.srcDir, f.name));
    const newFileName = f.name.replace(/\.[^/.]+$/, "-css.js");
    const tmpFile = template.replace("{0}", cssString.trim());
    await writeFile(path.join(opts.srcDir, newFileName), tmpFile);
  }
};

sassRender().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(-1);
});
