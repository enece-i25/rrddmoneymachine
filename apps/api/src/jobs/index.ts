import { closeExpiredSessionsJob } from "./close-expired-sessions.js";
import { expireProviderCreditsJob } from "./expire-provider-credits.js";
import { processWithdrawalBatchJob } from "./process-withdrawal-batch.js";
import { releasePendingBalancesJob } from "./release-pending-balances.js";
import { warnExpiringCreditsJob } from "./warn-expiring-credits.js";

export function startJobs(): void {
  const jobs = [
    closeExpiredSessionsJob,
    releasePendingBalancesJob,
    expireProviderCreditsJob,
    warnExpiringCreditsJob,
    processWithdrawalBatchJob
  ];

  void Promise.all(jobs.map((job) => job()));
}
