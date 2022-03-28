module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  rules: {
    "import/order": [
      "error",
      {
        groups: ["builtin", "external", "internal", ["parent", "sibling"]],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
    "sort-imports": [
      "error",
      {
        ignoreDeclarationSort: true,
      },
    ],
    "prettier/prettier": ["error", {}, { usePrettierrc: true }],
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/explicit-module-boundary-types": "warn",
  },
  settings: {
    "import/extensions": [".js", ".jsx", ".tsx", ".ts"],
    "import/resolver": {
      typescript: {},
    },
  },
};
