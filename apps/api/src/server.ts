import "dotenv/config";
import { createServer } from "node:http";
import { app } from "./app.js";
import { runMigrations } from "./db/migrate.js";
import { startJobs } from "./jobs/index.js";
import { setupRealtime } from "./realtime.js";
import { startHeartbeatMonitoring } from "./services/heartbeat.service.js";

const port = Number(process.env.PORT ?? 4000);
const httpServer = createServer(app);
setupRealtime(httpServer);

runMigrations()
  .then(() => {
    httpServer.listen(port, () => {
      startJobs();
      startHeartbeatMonitoring();
      console.log(`API listening on port ${port}`);
    });
  })
  .catch((error: unknown) => {
    console.error("Unable to apply database migrations", error);
    process.exit(1);
  });
