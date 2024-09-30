import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "cjs",
      sourcemap: true,
      inlineDynamicImports: true,
    },
    {
      file: "dist/index.mjs",
      format: "es",
      sourcemap: true,
      inlineDynamicImports: true,
    },
  ],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
    }),
    nodeResolve(),
    commonjs(),
    terser(),
  ],
  external: ["@anthropic-ai/sdk", "bottleneck", "glob", "minimatch", "openai"],
};
