import { calculateCompliance, type ComplianceInput } from "@rrdd/shared";

export function evaluateSessionCompliance(input: ComplianceInput) {
  return calculateCompliance(input);
}
