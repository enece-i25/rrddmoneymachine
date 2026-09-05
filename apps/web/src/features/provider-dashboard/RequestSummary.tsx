type RequestSummaryProps = {
  packagePrice: number;
  creditApplied: number;
  amountUsd: number;
};

export function RequestSummary({ packagePrice, creditApplied, amountUsd }: RequestSummaryProps) {
  return (
    <div className="quote-box stack">
      <div><span>Precio del paquete</span><strong>USD {packagePrice.toFixed(2)}</strong></div>
      <div><span>Saldo a favor aplicado</span><strong className="ok">- USD {creditApplied.toFixed(2)}</strong></div>
      <div className="quote-total"><span>A pagar</span><strong>USD {amountUsd.toFixed(2)}</strong></div>
    </div>
  );
}
