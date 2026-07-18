import tseslint from "typescript-eslint"
import solid from "eslint-plugin-solid/configs/typescript"

export default tseslint.config(
  { ignores: ["dist", "node_modules"] },
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    ...solid,
  },
)
