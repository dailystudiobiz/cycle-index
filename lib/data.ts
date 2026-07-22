import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { IndexData, IndexId } from "./indices";

export * from "./indices";

const cache = new Map<IndexId, IndexData>();

export function loadIndex(id: IndexId): IndexData {
  const hit = cache.get(id);
  if (hit) return hit;
  const file = path.join(process.cwd(), "data", `${id}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf-8")) as IndexData;
  cache.set(id, data);
  return data;
}
