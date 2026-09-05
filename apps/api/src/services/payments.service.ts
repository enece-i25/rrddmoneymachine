export async function getMepRate(): Promise<number> {
  return 1250;
}

export async function convertUsdToArs(usdAmount: number): Promise<{ mepRate: number; arsAmount: number }> {
  const mepRate = await getMepRate();
  return {
    mepRate,
    arsAmount: Number((usdAmount * mepRate).toFixed(2))
  };
}

export async function createMercadoPagoPreference(input: { amountArs: number; sessionId: string }): Promise<string | null> {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token || token.startsWith("dev_")) return null;

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ title: `rrdd-money session ${input.sessionId}`, quantity: 1, currency_id: "ARS", unit_price: input.amountArs }],
      external_reference: input.sessionId,
      notification_url: process.env.MP_WEBHOOK_URL
    })
  });
  if (!response.ok) throw new Error("Mercado Pago preference creation failed");
  const data = await response.json() as { init_point?: string };
  return data.init_point ?? null;
}
