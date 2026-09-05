import { BalanceCard } from "./BalanceCard";
import { AvailableShifts } from "./AvailableShifts";

export function CollaboratorDashboard() {
  return (
    <section className="stack">
      <h2>Panel de colaborador</h2>
      <BalanceCard />
      <AvailableShifts />
    </section>
  );
}
