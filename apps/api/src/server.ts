import "dotenv/config";
import { app } from "./app.js";
import { runMigrations } from "./db/migrate.js";
import { startJobs } from "./jobs/index.js";

const port = Number(process.env.PORT ?? 4000);

runMigrations()
  .then(() => {
    app.listen(port, () => {
      startJobs();
      console.log(`API listening on port ${port}`);
    });
  })
  .catch((error: unknown) => {
    console.error("Unable to apply database migrations", error);
    process.exit(1);
  });
