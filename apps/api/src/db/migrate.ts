import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import "dotenv/config";
import { pool } from "./client.js";

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS drizzle_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

export async function runMigrations() {
  await ensureMigrationsTable();

  const migrationsPath = path.resolve(process.cwd(), "src/db/migrations");
  const files = (await readdir(migrationsPath))
    .filter((file) => file.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));

  for (const filename of files) {
    const exists = await pool.query("SELECT 1 FROM drizzle_migrations WHERE filename = $1", [filename]);
    if (exists.rowCount) {
      continue;
    }

    const sql = await readFile(path.join(migrationsPath, filename), "utf8");
    await pool.query("BEGIN");
    try {
      await pool.query(sql);
      await pool.query("INSERT INTO drizzle_migrations(filename) VALUES ($1)", [filename]);
      await pool.query("COMMIT");
      console.log(`Applied migration ${filename}`);
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
  }
}

async function main() {
  await runMigrations();
  await pool.end();
}

if (import.meta.url === `file://${process.argv[1].replaceAll("\\", "/")}`) {
  main().catch(async (error) => {
    console.error(error);
    await pool.end();
    process.exit(1);
  });
}
