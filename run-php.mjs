import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL(".", import.meta.url));
const portable = join(root, ".tools", "php84", "php.exe");
const binary =
  process.env.PHP_BINARY ||
  (process.platform === "win32" && existsSync(portable) ? portable : "php");
const child = spawn(binary, process.argv.slice(2), {
  cwd: join(root, "backend"),
  stdio: "inherit",
});
child.on("error", (error) => {
  console.error(`Cannot start PHP: ${error.message}. Install PHP 8.4+ or set PHP_BINARY.`);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
