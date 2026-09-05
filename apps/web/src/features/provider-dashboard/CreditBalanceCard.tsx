type Credit = { creditId: string; amount: number; status: string; expiresAt: string };

export function CreditBalanceCard({ total, credits }: { total: number; credits: Credit[] }) {
  const expiring = credits.filter((credit) => credit.status === "expiring_soon");
  const nextExpiry = credits[0]?.expiresAt;

  return (
    <article className="card stack">
      <div className="section-heading"><h3>Saldo a favor</h3><strong>USD {total.toFixed(2)}</strong></div>
      {expiring.length ? <div className="notice warning">Tenes credito que vence pronto. Usalo antes del {new Date(nextExpiry).toLocaleDateString()}.</div> : null}
      <p className="muted">Se aplica automaticamente a nuevas solicitudes y nunca genera saldo negativo.</p>
      {nextExpiry ? <small>Proximo vencimiento: {new Date(nextExpiry).toLocaleDateString()}</small> : <small>No hay creditos activos.</small>}
    </article>
  );
}
