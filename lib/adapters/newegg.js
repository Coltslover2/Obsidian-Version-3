export async function searchNewegg({ query, country, limit }) {
  const apiKey = process.env.NEWEGG_API_KEY;
  if (!apiKey) return [];
  // TODO: implement Newegg CA adapter.
  return [];
}
