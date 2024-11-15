import swc from "@rollup/plugin-swc";
import {
  env,
  output,
  withMin,
  withDts,
  measure,
  serveOnWatch,
} from "./rollup.helpers.js";

const rollupConfig = withDts({
  input: env.INPUT,
  output: [
    ...withMin(output("esm")),
    ...withMin(output("cjs", { ext: "cjs" })),
    ...withMin(
      output("umd", {
        name: env.UMD_NAME,
        postfix: ".umd",
      })
    ),
  ],
  plugins: [swc(), measure(), serveOnWatch()],
});

export default rollupConfig;
