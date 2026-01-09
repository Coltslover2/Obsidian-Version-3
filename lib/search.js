import { searchBestBuy } from "./adapters/bestbuy";
import { searchWalmart } from "./adapters/walmart";
import { searchAmazon } from "./adapters/amazon";
import { searchNewegg } from "./adapters/newegg";
import { searchHomeDepot } from "./adapters/homedepot";
import { searchNikeDrops } from "./adapters/nike";
import { searchAdidasDrops } from "./adapters/adidas";
import { searchAppleEducation } from "./adapters/apple";

// This is the orchestration layer.
// - Use API-first where possible.
// - Keep all retailer-specific logic in adapters.
// - Normalize results into a shared "Offer" format.

/**
 * @typedef {Object} Offer
 * @property {string} retailerId
 * @property {string} retailerName
 * @property {string} title
 * @property {number|null} price
 * @property {string} currency
 * @property {string} url
 * @property {boolean|null} inStock
 * @property {string|null} image
 * @property {string|null} sku
 * @property {string|null} upc
 * @property {number|null} shipping
 * @property {number|null} tax
 * @property {number|null} total
 * @property {string} updatedAt
 */

export async function searchAllRetailers({ query, country = "CA", limit = 12 }) {
  // For V1 (Canada) we focus on: Amazon, BestBuy, Walmart, HomeDepot, Newegg, plus Drops (Nike/Adidas) + Apple EDU.
  // Run in parallel, but tolerate failures so one retailer doesn't break the page.

  const runners = [
    () => searchAmazon({ query, country, limit }),
    () => searchBestBuy({ query, country, limit }),
    () => searchWalmart({ query, country, limit }),
    () => searchHomeDepot({ query, country, limit }),
    () => searchNewegg({ query, country, limit }),
    () => searchAppleEducation({ query, country, limit }),
    () => searchNikeDrops({ query, country, limit }),
    () => searchAdidasDrops({ query, country, limit }),
  ];

  const settled = await Promise.allSettled(runners.map((fn) => fn()));
  const offers = [];
  const errors = [];

  for (const s of settled) {
    if (s.status === "fulfilled") offers.push(...(s.value || []));
    else errors.push(s.reason?.message || String(s.reason));
  }

  // Basic normalization for totals (shipping/tax can be added later per-user province).
  const normalized = offers
    .map((o) => {
      const price = typeof o.price === "number" ? o.price : null;
      const shipping = typeof o.shipping === "number" ? o.shipping : 0;
      const tax = typeof o.tax === "number" ? o.tax : 0;
      const total = price === null ? null : Math.round((price + shipping + tax) * 100) / 100;
      return { ...o, shipping, tax, total };
    })
    .slice(0, 250);

  // Sort cheapest delivered first (null totals go last)
  normalized.sort((a, b) => {
    if (a.total === null && b.total === null) return 0;
    if (a.total === null) return 1;
    if (b.total === null) return -1;
    return a.total - b.total;
  });

  return {
    country,
    offers: normalized.slice(0, limit),
    meta: {
      retailersQueried: runners.length,
      offersFound: normalized.length,
      partialErrors: errors,
    },
  };
}
