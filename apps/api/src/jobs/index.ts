import { closeExpiredSessionsJob } from "./close-expired-sessions.js";
import { expireProviderCreditsJob } from "./expire-provider-credits.js";
import { processWithdrawalBatchJob } from "./process-withdrawal-batch.js";
import { releasePendingBalancesJob } from "./release-pending-balances.js";
import { warnExpiringCreditsJob } from "./warn-expiring-credits.js";
import { startScheduledSessionsJob } from "./start-scheduled-sessions.js";

export function startJobs(): void {
  const jobs = [
    closeExpiredSessionsJob,
    releasePendingBalancesJob,
    expireProviderCreditsJob,
    warnExpiringCreditsJob,
    processWithdrawalBatchJob
  ];

  void Promise.all(jobs.map((job) => job()));
  setInterval(() => void closeExpiredSessionsJob(), 30000);
  void startScheduledSessionsJob();
  setInterval(() => void startScheduledSessionsJob(), 30000);
}
