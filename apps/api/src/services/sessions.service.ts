import { findPackage } from "@rrdd/shared";
import { pool } from "../db/client.js";
import { createSession, getProviderDashboardSummary } from "../db/repositories/sessions.repository.js";
import { consumeProviderCredits, getProviderCreditTotal } from "../db/repositories/dashboard.repository.js";
import { convertUsdToArs, createMercadoPagoPreference } from "./payments.service.js";
import { emitRealtime, userRoom } from "../realtime.js";

export async function createProviderSession(input: {
  providerId: string;
  platform: "tiktok" | "instagram";
  scheduledDurationMin: number;
  collaboratorsRequested: number;
  liveUrl?: string;
  startTime?: string;
}) {
  const packageDefinition = findPackage(input.scheduledDurationMin, input.collaboratorsRequested);
  if (!packageDefinition || packageDefinition.name === "recurring") {
    throw new Error("No package matches the selected duration and collaborators");
  }

  const creditTotal = await getProviderCreditTotal(input.providerId);
  const creditApplied = Math.min(creditTotal, packageDefinition.priceUsd);
  const amountUsd = Number((packageDefinition.priceUsd - creditApplied).toFixed(2));
  const { mepRate, arsAmount } = await convertUsdToArs(amountUsd);
  const session = await createSession(input);
  await consumeProviderCredits(input.providerId, creditApplied);
  if (creditApplied > 0) emitRealtime("balance:updated", [userRoom("provider", input.providerId)], { providerId: input.providerId, reason: "credit_consumed" });

  if (input.startTime) {
    await pool.query("UPDATE sessions SET start_time = $2 WHERE session_id = $1", [session.sessionId, input.startTime]);
  }

  const response = {
    ...session,
    package: packageDefinition.name,
    packagePriceUsd: packageDefinition.priceUsd,
    creditAppliedUsd: creditApplied,
    amountUsd,
    amountArs: arsAmount,
    mepRate,
    checkoutUrl: amountUsd > 0 ? await createMercadoPagoPreference({ amountArs: arsAmount, sessionId: session.sessionId }) : null
  };
  emitRealtime("session:created", ["admin"], { sessionId: session.sessionId, providerId: input.providerId });
  return response;
}

export async function providerSummary(providerId: string) {
  return getProviderDashboardSummary(providerId);
}

export async function listProviderSessions(providerId: string) {
  const result = await pool.query(
    `
    SELECT
      session_id AS "sessionId",
      platform,
      scheduled_duration_min AS "scheduledDurationMin",
      collaborators_requested AS "collaboratorsRequested",
      live_url AS "liveUrl",
      start_time AS "startTime",
      end_time AS "endTime",
      status,
      compliance_pct AS "compliancePct",
      amount_earned AS "amountEarned",
      created_at AS "createdAt"
    FROM sessions
    WHERE provider_id = $1
    ORDER BY created_at DESC
    LIMIT 100
    `,
    [providerId]
  );
  return result.rows;
}
