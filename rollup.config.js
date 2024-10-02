import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import dynamicImportVars from "@rollup/plugin-dynamic-import-vars";

export default {
  input: "dist/temp/index.js",
  output: [
    {
      dir: "dist/cjs",
      format: "cjs",
      sourcemap: true,
      entryFileNames: "[name].js",
      exports: "named",
      inlineDynamicImports: false,
    },
    {
      dir: "dist/esm",
      format: "es",
      sourcemap: true,
      entryFileNames: "[name].mjs",
      exports: "named",
      inlineDynamicImports: false,
    },
  ],
  plugins: [
    nodeResolve({
      moduleDirectories: ["node_modules", "src"],
      extensions: [".js", ".ts", ".mjs"],
      preferBuiltins: true,
    }),
    commonjs(),
    dynamicImportVars(),
    terser(),
  ],
  external: [
    "@anthropic-ai/sdk",
    "bottleneck",
    "glob",
    "minimatch",
    "openai",
    "fs",
    "path",
    "crypto",
  ],
};
