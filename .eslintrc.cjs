/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  plugins: ["@typescript-eslint", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-essential",
    "@vue/eslint-config-typescript",
    "@vue/eslint-config-prettier",
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  ignorePatterns: ["components.d.ts"],
  rules: {
    "object-shorthand": 1,
    "import/no-duplicates": "error",
    "import/no-cycle": "error",
    "import/order": [
      "error",
      {
        groups: ["builtin", "external", "internal", "parent", "sibling", "index", "object", "type"],
      },
    ],
    "class-methods-use-this": "error",
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/member-ordering": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { vars: "all", argsIgnorePattern: "^_" }],
  },
};
