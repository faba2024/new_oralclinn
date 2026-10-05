import type { DataStore } from "./types";

/**
 * Upstash Redis via REST (sem dependências): funciona em funções serverless
 * da Vercel. Coleções são hashes (um campo por registro), documentos são strings.
 */
export class RedisStore implements DataStore {
  readonly name = "redis" as const;

  constructor(
    private readonly url: string,
    private readonly token: string,
    private readonly prefix: string,
  ) {}

  private key(kind: "c" | "i" | "d", name: string) {
    return `${this.prefix}:${kind}:${name}`;
  }

  private async pipeline(commands: (string | number)[][]): Promise<unknown[]> {
    const res = await fetch(`${this.url.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Redis respondeu ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { result?: unknown; error?: string }[];
    return data.map((r) => {
      if (r.error) throw new Error(`Redis: ${r.error}`);
      return r.result;
    });
  }

  async listCollection<T>(collection: string): Promise<T[] | null> {
    const [initialized, flat] = await this.pipeline([
      ["GET", this.key("i", collection)],
      ["HGETALL", this.key("c", collection)],
    ]);
    if (!initialized) return null;
    const values = (flat as string[]) ?? [];
    const items: T[] = [];
    for (let i = 1; i < values.length; i += 2) items.push(JSON.parse(values[i]) as T);
    return items;
  }

  async getItem<T>(collection: string, id: string): Promise<T | null> {
    const [value] = await this.pipeline([["HGET", this.key("c", collection), id]]);
    return value ? (JSON.parse(value as string) as T) : null;
  }

  async putItems<T extends { id: string }>(collection: string, items: T[], markInitialized = false): Promise<void> {
    const commands: (string | number)[][] = [];
    for (let i = 0; i < items.length; i += 200) {
      const chunk = items.slice(i, i + 200);
      commands.push(["HSET", this.key("c", collection), ...chunk.flatMap((item) => [item.id, JSON.stringify(item)])]);
    }
    if (markInitialized) commands.push(["SET", this.key("i", collection), "1"]);
    if (commands.length) await this.pipeline(commands);
  }

  async deleteItem(collection: string, id: string): Promise<void> {
    await this.pipeline([["HDEL", this.key("c", collection), id]]);
  }

  async getDoc<T>(key: string): Promise<T | null> {
    const [value] = await this.pipeline([["GET", this.key("d", key)]]);
    return value ? (JSON.parse(value as string) as T) : null;
  }

  async setDoc<T>(key: string, value: T): Promise<void> {
    await this.pipeline([["SET", this.key("d", key), JSON.stringify(value)]]);
  }

  async clearAll(): Promise<void> {
    const keys: string[] = [];
    let cursor = "0";
    do {
      const [result] = await this.pipeline([["SCAN", cursor, "MATCH", `${this.prefix}:*`, "COUNT", 500]]);
      const [next, batch] = result as [string, string[]];
      cursor = next;
      keys.push(...batch);
    } while (cursor !== "0");
    for (let i = 0; i < keys.length; i += 200) await this.pipeline([["DEL", ...keys.slice(i, i + 200)]]);
  }
}
