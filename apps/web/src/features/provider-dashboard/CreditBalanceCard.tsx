export function CreditBalanceCard({ pendingCredits }: { pendingCredits: number }) {
  return (
    <article className="card stack">
      <h3>Credito interno proveedor</h3>
      <p className="metric">USD {pendingCredits.toFixed(2)}</p>
      <small>Saldo a favor utilizable en nuevas sesiones. Nunca se reintegra al medio de pago.</small>
    </article>
  );
}
