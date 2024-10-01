import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

export default {
  input: "dist/temp/index.js",
  output: [
    {
      dir: "dist/cjs",
      format: "cjs",
      sourcemap: true,
      preserveModules: true,
      entryFileNames: "[name].js",
      exports: "named",
    },
    {
      dir: "dist/esm",
      format: "es",
      sourcemap: true,
      preserveModules: true,
      entryFileNames: "[name].mjs",
      exports: "named",
    },
  ],
  plugins: [
    nodeResolve({
      moduleDirectories: ["node_modules", "src"],
      extensions: [".js"],
      preferBuiltins: true,
    }),
    commonjs(),
    terser(),
  ],
  external: ["@anthropic-ai/sdk", "bottleneck", "glob", "minimatch", "openai"],
};
