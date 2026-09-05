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
