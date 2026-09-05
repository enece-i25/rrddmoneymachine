import {
  getProviderCredits,
  getProviderDashboard,
  getProviderCreditTotal
} from "../db/repositories/dashboard.repository.js";

export async function providerDashboard(providerId: string) {
  return getProviderDashboard(providerId);
}

export async function providerCredits(providerId: string) {
  const credits = await getProviderCredits(providerId);
  return {
    credits,
    total: await getProviderCreditTotal(providerId)
  };
}
