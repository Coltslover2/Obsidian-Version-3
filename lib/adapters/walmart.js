export async function searchWalmart({ query, country, limit }) {
  const apiKey = process.env.WALMART_API_KEY;
  if (!apiKey) return [];
  // TODO: implement Walmart CA adapter (API-first).
  return [];
}
