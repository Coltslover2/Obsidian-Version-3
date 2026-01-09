export async function searchBestBuy({ query, country, limit }) {
  const apiKey = process.env.BESTBUY_API_KEY;
  if (!apiKey) return [];

  // TODO: Implement Best Buy CA Products API call.
  // Return normalized offers with { retailerId, retailerName, title, price, currency, url, inStock, image, sku, upc, shipping, tax, updatedAt }
  // Tip: keep all parsing logic in this file so UI stays clean.

  return [];
}
