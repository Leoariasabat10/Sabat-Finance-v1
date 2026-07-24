// Loader mínimo para poder correr las pruebas del motor financiero con el
// test runner nativo de Node (sin instalar ts-node/tsx): resuelve imports
// relativos sin extensión (".ts") a su archivo real. Solo se usa para
// `npm test` — Next.js/webpack ya resuelven estos imports por su cuenta en
// dev/build y no pasan por este loader.
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith(".") && !/\.[a-zA-Z0-9]+$/.test(specifier)) {
    const base = fileURLToPath(new URL(specifier, context.parentURL));
    if (existsSync(base + ".ts")) {
      return nextResolve(specifier + ".ts", context);
    }
  }
  return nextResolve(specifier, context);
}
