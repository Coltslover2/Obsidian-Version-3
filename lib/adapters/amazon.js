export async function searchAmazon({ query, country, limit }) {
  const accessKey = process.env.AMAZON_ACCESS_KEY;
  const secretKey = process.env.AMAZON_SECRET_KEY;
  const partnerTag = process.env.AMAZON_PARTNER_TAG;
  if (!accessKey || !secretKey || !partnerTag) return [];

  // TODO: implement Amazon PA-API search (affiliate-compliant).
  return [];
}
