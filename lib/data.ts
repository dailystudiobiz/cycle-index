import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { IndexData, IndexId } from "./indices";
import type { ForwardData } from "./forward";

export * from "./indices";

const cache = new Map<string, unknown>();

function read<T>(name: string): T {
  const hit = cache.get(name);
  if (hit) return hit as T;
  const file = path.join(process.cwd(), "data", `${name}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf-8")) as T;
  cache.set(name, data);
  return data;
}

export function loadIndex(id: IndexId): IndexData {
  return read<IndexData>(id);
}

/** KFG 국면별 이후 KOSPI 등락 분포 (pipeline/build_kfg_forward.py 산출) */
export function loadForward(): ForwardData {
  return read<ForwardData>("kfg_forward");
}
