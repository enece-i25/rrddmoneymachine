import "dotenv/config";
import { pool } from "../client.js";
import { upsertQaSession } from "./fixtures/session.fixture.js";
import { upsertQaProviderCredit } from "./fixtures/provider-credit.fixture.js";
import { QA_PASSWORD, upsertQaUsers } from "./fixtures/users.fixture.js";

if (process.env.NODE_ENV === "production" || process.env.ALLOW_SEED !== "true") {
  console.error("Seed bloqueado: no se puede correr en producción. Setear ALLOW_SEED=true en tu .env local para habilitarlo.");
  process.exit(1);
}

async function main(): Promise<void> {
  const users = await upsertQaUsers();
  await upsertQaProviderCredit(users.providerId);
  const sessionId = await upsertQaSession(users.providerId, users.clientId);

  console.log("QA seed listo");
  console.log(`provider: qa.provider@rrdd.test / ${QA_PASSWORD}`);
  console.log(`collaborator: qa.collaborator@rrdd.test / ${QA_PASSWORD}`);
  console.log(`admin: qa.admin@rrdd.test / ${QA_PASSWORD}`);
  console.log(`active session: ${sessionId}`);
}

main()
  .catch((error: unknown) => {
    console.error("QA seed falló", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
