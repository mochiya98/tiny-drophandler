import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { minify } from "rollup-plugin-swc-minify";
import { dts } from "rollup-plugin-dts";
import { gzipSize } from "gzip-size";
import brotliSize from "brotli-size";

export const env = {
  INPUT: "src/index.ts",
  LIB_NAME: "tiny-drophandler",
  UMD_NAME: "TinyDrophandler",
  OPUTPUT_PATH: "dist",
  PUBLIC_BASE:
    "https://cdn.jsdelivr.net/gh/mochiya98/tiny-drophandler@latest/dist/",
};

export const output = (
  format,
  { postfix = "", ext = "js", ...options } = {}
) => ({
  file: `${env.OPUTPUT_PATH}/${env.LIB_NAME}${postfix}.${ext}`,
  format,
  sourcemap: true,
  ...options,
});
export const withMin = (c) => {
  return [
    c,
    {
      ...c,
      file: c.file.replace(/\.(\w+)$/, ".min.$1"),
      plugins: [...(c.plugins || []), minify()],
    },
  ];
};
export const withDts = (c, cPlus = {}) => {
  return [
    c,
    {
      ...c,
      output: {
        file: `${env.OPUTPUT_PATH}/${env.LIB_NAME}.d.ts`,
        format: "esm",
        ...cPlus.output,
      },
      plugins: [dts(), ...(cPlus.plugins || [])],
    },
  ];
};

const toKB = (size) => (size / 1000).toFixed(2) + "KB";

export const measure = () => {
  let result = [];
  return {
    name: "rollup-plugin-measure",
    async generateBundle(opts, bundles) {
      for (let key in bundles) {
        const code = bundles[key].code;
        if (typeof code !== "string") continue;
        const gzSize = await gzipSize(code);
        const brSize = await brotliSize.default(code);
        result.push([key, toKB(code.length), toKB(gzSize), toKB(brSize)]);
      }
    },
    closeBundle: async () => {
      result.sort((a, b) => a[0].localeCompare(b[0]));
      const srcREADME = await fs.promises.readFile("README.md", "utf-8");
      const newREADME = srcREADME.replace(
        /(\| *Asset *\| *Size *\| *Size \(gzip\) *\| *Size \(brotli\) *\|\s*\|.+\n)(?:\|.+\n)*/,
        `$1${[
          ...result.filter((c) => c[0].includes(".min.")),
          ...result.filter((c) => !c[0].includes(".min.")),
        ]
          .map(([f, ...c]) => [`[\`${f}\`](${env.PUBLIC_BASE + f})`, ...c])
          .map((c) => ["", ...c, ""].join(" | ").trim())
          .join("\n")}\n`
      );
      if (srcREADME !== newREADME) {
        await fs.promises.writeFile("README.md", newREADME);
      }
      result = [];
    },
  };
};

export const serveOnWatch = () => {
  const enabled = process.env.ROLLUP_WATCH === "true";
  if (!enabled) return {};
  const server = http.createServer((req, res) => {
    let filePath = "." + req.url;
    // redirect to /docs/
    if (filePath === "./") {
      res.statusCode = 302;
      res.setHeader("Location", "/docs/");
      res.setHeader("Cache-Control", "no-store");
      res.end();
      return;
    }
    if (filePath.endsWith("/")) filePath += "index.html";
    const contentType =
      {
        ".html": "text/html",
        ".js": "text/javascript",
        ".map": "application/json",
        ".css": "text/css",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
      }[path.extname(filePath)] || "application/octet-stream";
    fs.readFile(filePath, (err, data) => {
      res.statusCode = err ? 404 : 200;
      res.setHeader("Content-Type", err ? "text/plain" : contentType);
      res.setHeader("Cache-Control", "no-store");
      res.end(data);
    });
  });
  const PORT = 8080;
  server.listen(PORT, () => {});
  return {
    name: "rollup-plugin-serveronwatch",
    buildStart() {
      console.log(`Serving on http://localhost:${PORT}`);
    },
  };
};
