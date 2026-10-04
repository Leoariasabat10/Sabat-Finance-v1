import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

export default [
  { ignores: [".next/**", "node_modules/**", "scripts/**", "public/**", "next-env.d.ts", "prisma/**", "docs/**"] },
  ...compat.extends("next/core-web-vitals"),
];
