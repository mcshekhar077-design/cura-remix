import { getEnv } from "./env";

export const databaseConfig = {
  get connectionString() {
    return getEnv().DATABASE_URL;
  },
  get directConnectionString() {
    return getEnv().DIRECT_DATABASE_URL;
  },
  pool: {
    min: 2,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  },
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined
};
