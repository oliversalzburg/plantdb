"use strict";

module.exports = {
  root: true,

  env: {
    node: true,
    es2022: true,
  },

  ignorePatterns: ["output/*"],
  overrides: [
    {
      files: ["*.cjs"],
      extends: ["eslint:recommended"],
      parserOptions: {
        sourceType: "commonjs",
      },
    },
    {
      files: ["*.js", "*.mjs"],
      extends: ["eslint:recommended"],
      parser: "@babel/eslint-parser",
      parserOptions: {
        babelOptions: {
          plugins: ["@babel/plugin-syntax-import-assertions"],
        },
        requireConfigFile: false,
        sourceType: "module",
      },
    },
    {
      files: ["*.cts", "*.mts", "*.ts"],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/strict-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked",
      ],
      parserOptions: {
        project: ["./tsconfig.eslint.json"],
        tsconfigRootDir: __dirname,
      },
      plugins: ["@typescript-eslint"],
      rules: {
        "@typescript-eslint/array-type": ["error", { default: "generic" }],
        "@typescript-eslint/no-explicit-any": [
          "error",
          {
            ignoreRestArgs: true,
          },
        ],
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["error", { args: "none" }],
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
  rules: {
    "consistent-return": "error",
    "no-else-return": "error",
    "no-unused-expressions": "warn",
    "no-use-before-define": "error",
    eqeqeq: "error",
    quotes: "warn",
    strict: ["error", "global"],
  },
};
