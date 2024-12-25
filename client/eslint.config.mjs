import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react"
import eslint from "@eslint/js";

export default tseslint.config(
    eslint.configs.recommended,
    prettierRecommended,
    ...tseslint.configs.recommended,
    {
        plugins: {
            prettier,
            react
        },
        rules: {
            "react/display-name": "off",

            "react/jsx-no-duplicate-props": ["warn", {
                ignoreCase: false,
            }],

            "react/prop-types": [0],

            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-unused-expressions": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            "no-case-declarations": "off"
        }
    }
);