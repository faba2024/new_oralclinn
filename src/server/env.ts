/** Configuração do servidor lida das variáveis de ambiente. */
export const serverEnv = {
  isProduction: process.env.NODE_ENV === "production",
  isVercel: !!process.env.VERCEL,
  redisUrl: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "",
  redisToken: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "",
  redisPrefix: process.env.DATA_PREFIX || "oralclin",
  dataFile: process.env.DATA_FILE || ".data/oralclin-db.json",
  adminEmail: (process.env.ADMIN_EMAIL || "").trim().toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || "",
  adminName: process.env.ADMIN_NAME || "Administrador",
  adminResetPassword: process.env.ADMIN_RESET_PASSWORD === "true",
  seedDemoData: process.env.SEED_DEMO_DATA !== "false",
};
