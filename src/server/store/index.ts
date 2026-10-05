import { serverEnv } from "../env";
import { FileStore } from "./file-store";
import { RedisStore } from "./redis-store";
import type { DataStore } from "./types";

export type { DataStore } from "./types";

export class StorageNotConfiguredError extends Error {
  constructor() {
    super(
      "Banco de dados não configurado. Conecte um banco Upstash Redis ao projeto na Vercel (Storage → Upstash for Redis) para criar as variáveis KV_REST_API_URL e KV_REST_API_TOKEN.",
    );
    this.name = "StorageNotConfiguredError";
  }
}

const GLOBAL_KEY = "__oralclinStore";
type G = typeof globalThis & { [GLOBAL_KEY]?: DataStore };

/** Redis quando configurado; arquivo local apenas fora da Vercel. */
export function getStore(): DataStore {
  const g = globalThis as G;
  if (g[GLOBAL_KEY]) return g[GLOBAL_KEY]!;
  if (serverEnv.redisUrl && serverEnv.redisToken) {
    g[GLOBAL_KEY] = new RedisStore(serverEnv.redisUrl, serverEnv.redisToken, serverEnv.redisPrefix);
  } else if (serverEnv.isVercel) {
    throw new StorageNotConfiguredError();
  } else {
    g[GLOBAL_KEY] = new FileStore(serverEnv.dataFile);
  }
  return g[GLOBAL_KEY]!;
}

export function storageStatus() {
  if (serverEnv.redisUrl && serverEnv.redisToken) return { configured: true, driver: "redis" as const };
  if (serverEnv.isVercel) return { configured: false, driver: "none" as const };
  return { configured: true, driver: "file" as const };
}
