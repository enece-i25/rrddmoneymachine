import { DisputeQueue } from "./DisputeQueue";
import { WithdrawalQueue } from "./WithdrawalQueue";

export function AdminDashboard() {
  return (
    <section className="stack">
      <h2>Panel admin</h2>
      <DisputeQueue />
      <WithdrawalQueue />
    </section>
  );
}
