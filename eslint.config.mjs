// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier/flat"; // ⚠️ v10-এর default হল object নয়, array

import prettierPlugin from "eslint-plugin-prettier";
export default tseslint.config(
  eslint.configs.recommended,
  prettierConfig,
  //   tseslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    plugins: { prettier: prettierPlugin },
    rules: {
      "no-console": "warn",
    },
  }
);
