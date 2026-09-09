import {
  applyToSession as applyToSessionRepository,
  createWithdrawal,
  getAvailableSessions,
  getCollaboratorBalance,
  getCollaboratorSummary,
  getUpcomingSession
} from "../db/repositories/collaborator.repository.js";
import { emitRealtime, userRoom } from "../realtime.js";
import { findActiveByClientId } from "../db/repositories/sessions.repository.js";

export {
  createWithdrawal,
  getAvailableSessions,
  getCollaboratorBalance,
  getCollaboratorSummary,
  getUpcomingSession
};

export async function applyToSession(sessionId: string, clientId: string) {
  const activeSession = await findActiveByClientId(clientId);
  if (activeSession) {
    const error = new Error("No podes postularte a un nuevo turno mientras tengas una sesion programada o en curso.") as Error & { statusCode?: number };
    error.statusCode = 409;
    throw error;
  }
  const result = await applyToSessionRepository(sessionId, clientId);
  if (result?.providerId) {
    emitRealtime("session:applied", [userRoom("provider", result.providerId), "admin"], { sessionId, clientId });
  }
  return result;
}

export async function requestWithdrawal(clientId: string, amount: number) {
  const result = await createWithdrawal(clientId, amount);
  emitRealtime("withdrawal:updated", [userRoom("client", clientId), "admin"], { withdrawalId: result.withdrawalId, status: result.status });
  return result;
}

