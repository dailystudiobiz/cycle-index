import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { KssData } from "./kss";

export * from "./kss";

let cache: KssData | null = null;

export function loadKss(): KssData {
  if (cache) return cache;
  const file = path.join(process.cwd(), "data", "kss.json");
  cache = JSON.parse(fs.readFileSync(file, "utf-8")) as KssData;
  return cache;
}
