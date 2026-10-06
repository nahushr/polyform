import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { existsSync, mkdirSync, rmSync, symlinkSync } from "node:fs";

const forceWasi = process.env.POLYFORM_PREPARE_ROLLDOWN_WASI === "1";

if (process.versions.webcontainer || forceWasi) {
  const require = createRequire(import.meta.url);
  const rolldownPackage = require.resolve("rolldown/package.json");
  const rolldownVersion = require(rolldownPackage).version;
  const wasiEntry = require.resolve(
    "@rolldown/binding-wasm32-wasi/rolldown-binding.wasi.cjs",
  );
  const wasiPackage = dirname(wasiEntry);
  const targetPackage = join(
    "/tmp",
    `rolldown-${rolldownVersion}`,
    "node_modules",
    "@rolldown",
    "binding-wasm32-wasi",
  );
  const targetEntry = join(targetPackage, "rolldown-binding.wasi.cjs");

  if (!existsSync(targetEntry)) {
    rmSync(targetPackage, { recursive: true, force: true });
    mkdirSync(dirname(targetPackage), { recursive: true });
    symlinkSync(wasiPackage, targetPackage, "dir");
  }

  console.log(`Prepared Rolldown WASI ${rolldownVersion} for WebContainer.`);
}
