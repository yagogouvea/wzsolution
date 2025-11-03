import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // ✅ Desabilitar regras que não afetam funcionalidade
      "@typescript-eslint/no-explicit-any": "off", // Permite 'any' - necessário para integrações
      "@typescript-eslint/no-unused-vars": "warn", // Apenas warning, não bloqueia build
      "@typescript-eslint/no-require-imports": "off", // Permite require() quando necessário
      "@typescript-eslint/no-empty-object-type": "off", // Permite interfaces vazias
      "prefer-const": "warn", // Apenas warning
      "react-hooks/exhaustive-deps": "warn", // Apenas warning
      "@next/next/no-sync-scripts": "warn", // Apenas warning
      "@next/next/no-img-element": "warn", // Apenas warning
      "jsx-a11y/alt-text": "warn", // Apenas warning
      "@typescript-eslint/no-unused-expressions": "warn", // Apenas warning
    },
  },
];

export default eslintConfig;
