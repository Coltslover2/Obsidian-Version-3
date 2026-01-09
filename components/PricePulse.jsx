'use client';

// UI prototype (updated): Canada-only retailers, Target removed, new palette.
// This component can run standalone, but it is designed to be wired to real endpoints:
// - GET /api/search?q=...
// - POST /api/track { url, targetPrice, ... }
// If those endpoints are not present, it falls back to local demo data.

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Search,
  Bell,
  Sparkles,
  ShieldCheck,
  Store,
  TrendingDown,
  TrendingUp,
  Gauge,
  ChevronRight,
  BadgeCheck,
  AlertTriangle,
  Coins,
  Globe,
  Layers,
} from "lucide-react";

// Palette from your image:
// #548871 #E5382A #6D5471 #107191 #FEE7B3
const PALETTE = {
  bg: "bg-[#0b2d35]", // deep teal base for contrast
  panel: "bg-[#6D5471]/40",
  panel2: "bg-[#107191]/25",
  border: "border-[#FEE7B3]/15",
  text: "text-[#FEE7B3]",
  subtext: "text-[#FEE7B3]/80",
  muted: "text-[#FEE7B3]/65",
  brand: "text-[#548871]",
  accent: "text-[#107191]",
  good: "text-[#548871]",
  warn: "text-[#E5382A]",
  bad: "text-[#E5382A]",
};

// --- Demo data (used if backend endpoints aren't running) ---
const RETAILERS = [
  { id: "amazon", name: "Amazon", trust: 0.78, type: "major" },
  { id: "bestbuy", name: "Best Buy", trust: 0.86, type: "major" },
  { id: "walmart", name: "Walmart", trust: 0.82, type: "major" },
  { id: "costco", name: "Costco", trust: 0.88, type: "major" },
  { id: "homedepot", name: "Home Depot", trust: 0.85, type: "major" },
  { id: "newegg", name: "Newegg", trust: 0.76, type: "major" },
  { id: "nike", name: "Nike", trust: 0.87, type: "brand" },
  { id: "adidas", name: "Adidas", trust: 0.84, type: "brand" },
  { id: "apple", name: "Apple", trust: 0.9, type: "brand" },
  { id: "shopify", name: "Verified Shopify Store", trust: 0.62, type: "longtail" },
];

const CANONICAL_PRODUCTS = [
  {
    id: "p_airpods_pro_2",
    title: "Apple AirPods Pro (2nd generation) — USB‑C",
    brand: "Apple",
    model: "MTJV3AM/A",
    upc: "195949052318",
    category: "Audio",
    image:
      "https://images.unsplash.com/photo-1588420343612-2b9c1d2e8b2e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p_ps5_slim",
    title: "PlayStation 5 Slim Console",
    brand: "Sony",
    model: "CFI-2015",
    upc: "711719583583",
    category: "Gaming",
    image:
      "https://images.unsplash.com/photo-1605902711622-cfb43c44367f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p_rtx_4070",
    title: "NVIDIA GeForce RTX 4070 12GB",
    brand: "NVIDIA",
    model: "RTX4070-12G",
    upc: "000000000000",
    category: "PC Hardware",
    image:
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d4?auto=format&fit=crop&w=1200&q=80",
  },
];

const priceHistory = (base = 329, volatility = 0.07) => {
  const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  let v = base;
  return months.map((m, i) => {
    const seasonal = i === 3 ? -0.12 : i === 4 ? -0.06 : i === 5 ? 0.03 : 0;
    const noise = (Math.sin(i * 1.7) * 0.5 + Math.cos(i * 0.9) * 0.3) * volatility;
    v = Math.max(1, v * (1 + seasonal + noise));
    return { month: m, price: Math.round(v) };
  });
};

function mkOffer({ r, price, ship, stock, match, method, seller }) {
  const retailer = RETAILERS.find((x) => x.id === r);
  const trust = retailer?.trust ?? 0.6;
  const marketplacePenalty = seller === "marketplace" ? 0.15 : 0;
  const estTax = 0.0;
  const total = Math.round((price + ship) * (1 + estTax));
  const dealScore = calcDealScore({ price, total, trust, match, stock, marketplacePenalty });
  const riskLabel = trust < 0.65 ? "Lower trust" : seller === "marketplace" ? "3rd‑party seller" : "Verified";
  return {
    id: `${r}_${price}`,
    retailerId: r,
    retailerName: retailer?.name ?? r,
    trust,
    seller,
    riskLabel,
    basePrice: price,
    shipping: ship,
    total,
    inStock: stock,
    match,
    matchMethod: method,
    updated: "just now",
    dealScore,
    url: "#",
  };
}

function calcDealScore({ trust, match, stock, marketplacePenalty }) {
  // Simple V1 score. In the backend we replace priceComponent with a history-aware percentile.
  const priceComponent = 55;
  const trustComponent = Math.round(trust * 20);
  const matchComponent = Math.round(match * 20);
  const stockComponent = stock ? 5 : -10;
  const penalty = Math.round(marketplacePenalty * 20);
  const raw = priceComponent + trustComponent + matchComponent + stockComponent - penalty;
  return Math.max(0, Math.min(100, raw));
}

const OFFERS = {
  p_airpods_pro_2: [
    mkOffer({ r: "apple", price: 329, ship: 0, stock: true, match: 0.98, method: "UPC", seller: "retailer" }),
    mkOffer({ r: "bestbuy", price: 318, ship: 0, stock: true, match: 0.92, method: "Model", seller: "retailer" }),
    mkOffer({ r: "amazon", price: 312, ship: 0, stock: true, match: 0.88, method: "Title+Spec", seller: "marketplace" }),
    mkOffer({ r: "walmart", price: 319, ship: 0, stock: false, match: 0.86, method: "Title+Spec", seller: "retailer" }),
    mkOffer({ r: "shopify", price: 269, ship: 18, stock: true, match: 0.74, method: "Title", seller: "retailer" }),
  ],
  p_ps5_slim: [
    mkOffer({ r: "bestbuy", price: 649, ship: 0, stock: true, match: 0.94, method: "Model", seller: "retailer" }),
    mkOffer({ r: "amazon", price: 639, ship: 0, stock: true, match: 0.87, method: "Title+Spec", seller: "marketplace" }),
    mkOffer({ r: "walmart", price: 629, ship: 0, stock: true, match: 0.83, method: "Title+Spec", seller: "retailer" }),
  ],
  p_rtx_4070: [
    mkOffer({ r: "newegg", price: 729, ship: 0, stock: true, match: 0.91, method: "Model", seller: "retailer" }),
    mkOffer({ r: "amazon", price: 699, ship: 0, stock: true, match: 0.8, method: "Title+Spec", seller: "marketplace" }),
    mkOffer({ r: "bestbuy", price: 749, ship: 0, stock: false, match: 0.88, method: "Title+Spec", seller: "retailer" }),
  ],
};

function confidenceLabel(match) {
  if (match >= 0.9) return { label: "Exact / High", tone: "good", icon: BadgeCheck };
  if (match >= 0.75) return { label: "Likely", tone: "warn", icon: AlertTriangle };
  return { label: "Low", tone: "bad", icon: AlertTriangle };
}

function money(n) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "CAD" }).format(n);
}

async function tryFetchJson(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default function PricePulse() {
  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState(CANONICAL_PRODUCTS[0].id);
  const [busy, setBusy] = useState(false);
  const [liveResults, setLiveResults] = useState(null); // { products, offersByProductId }

  const products = liveResults?.products ?? CANONICAL_PRODUCTS;
  const offersByProductId = liveResults?.offersByProductId ?? OFFERS;

  const activeProduct = useMemo(
    () => products.find((p) => p.id === activeId) ?? products[0],
    [products, activeId]
  );

  const offers = offersByProductId[activeProduct?.id] ?? [];

  const bestOffer = useMemo(() => {
    if (!offers?.length) return null;
    return [...offers]
      .filter((o) => o.inStock)
      .sort((a, b) => a.total - b.total)[0];
  }, [offers]);

  const chart = useMemo(() => priceHistory(bestOffer?.total ?? 329, 0.08), [bestOffer?.total]);

  const onSearch = async () => {
    const query = q.trim();
    if (!query) return;

    setBusy(true);
    // Try real backend first. If it doesn't exist, fall back to demo.
    const data = await tryFetchJson(`/api/search?q=${encodeURIComponent(query)}`);
    if (data?.products?.length) {
      setLiveResults(data);
      setActiveId(data.products[0].id);
    }
    setBusy(false);
  };

  return (
    <div className={`min-h-screen ${PALETTE.bg} ${PALETTE.text} p-6`}> 
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-2xl bg-[#E5382A]" />
              <h1 className="text-2xl font-semibold tracking-tight">PricePulse</h1>
              <Badge className="bg-[#548871]/20 text-[#FEE7B3] border border-[#FEE7B3]/15">Canada</Badge>
            </div>
            <p className={`${PALETTE.subtext} text-sm`}>Search across supported retailers • compare delivered price • set alerts • spot real deals</p>
          </div>

          <div className="flex w-full gap-2 sm:w-[520px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FEE7B3]/65" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder='Try: "AirPods Pro 2" or paste a product link'
                className={`pl-9 ${PALETTE.panel2} border ${PALETTE.border} text-[#FEE7B3] placeholder:text-[#FEE7B3]/55`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSearch();
                }}
              />
            </div>
            <Button
              onClick={onSearch}
              disabled={busy}
              className="rounded-2xl bg-[#E5382A] hover:bg-[#E5382A]/90 text-[#FEE7B3]"
            >
              {busy ? "Searching…" : "Search"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* Left: product list */}
          <Card className={`${PALETTE.panel} border ${PALETTE.border} rounded-3xl overflow-hidden`}> 
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className={`h-4 w-4 ${PALETTE.brand}`} />
                  <p className="font-medium">Matches</p>
                </div>
                <Badge className="bg-[#107191]/20 text-[#FEE7B3] border border-[#FEE7B3]/15">{products.length} products</Badge>
              </div>

              <div className="space-y-3">
                {products.map((p) => {
                  const isActive = p.id === activeId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setActiveId(p.id)}
                      className={`w-full rounded-2xl border ${PALETTE.border} p-3 text-left transition ${
                        isActive ? "bg-[#107191]/25" : "bg-transparent hover:bg-[#107191]/15"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="h-12 w-12 rounded-2xl overflow-hidden border border-[#FEE7B3]/15 shrink-0">
                          <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{p.title}</p>
                          <p className={`${PALETTE.muted} text-xs truncate`}>{p.brand} • {p.category} • {p.model}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <Separator className="bg-[#FEE7B3]/10" />

              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-2xl border ${PALETTE.border} p-3 ${PALETTE.panel2}`}>
                  <p className={`${PALETTE.muted} text-xs`}>Best delivered</p>
                  <p className="text-lg font-semibold">{bestOffer ? money(bestOffer.total) : "—"}</p>
                  <p className={`${PALETTE.muted} text-xs`}>{bestOffer ? bestOffer.retailerName : "No offers"}</p>
                </div>
                <div className={`rounded-2xl border ${PALETTE.border} p-3 ${PALETTE.panel2}`}>
                  <p className={`${PALETTE.muted} text-xs`}>Deal score</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-lg font-semibold">{bestOffer ? bestOffer.dealScore : "—"}</p>
                    <Gauge className={`h-4 w-4 ${PALETTE.brand}`} />
                  </div>
                  <p className={`${PALETTE.muted} text-xs`}>V1 scoring</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 rounded-2xl bg-[#548871] hover:bg-[#548871]/90 text-[#FEE7B3]"
                  onClick={async () => {
                    // In real mode: you would open bestOffer.url (affiliate).
                    if (bestOffer?.url && bestOffer.url !== "#") window.open(bestOffer.url, "_blank", "noopener,noreferrer");
                  }}
                >
                  <Store className="mr-2 h-4 w-4" />
                  Go to store
                </Button>
                <Button
                  variant="secondary"
                  className={`rounded-2xl ${PALETTE.panel2} border ${PALETTE.border} text-[#FEE7B3]`}
                  onClick={async () => {
                    // Paste-link tracking flow (backend):
                    const url = prompt("Paste a product URL to track:");
                    if (!url) return;
                    setBusy(true);
                    try {
                      const res = await fetch("/api/track", {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ url }),
                      });
                      if (!res.ok) throw new Error("Track failed");
                      alert("Tracking started! (If you haven't configured the backend yet, this is a stub.)");
                    } catch {
                      alert("Tracking isn't configured yet (backend missing). This UI is ready though.");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right: details */}
          <div className="space-y-6">
            <Card className={`${PALETTE.panel} border ${PALETTE.border} rounded-3xl overflow-hidden`}>
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-xl font-semibold">{activeProduct?.title}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-[#107191]/20 text-[#FEE7B3] border border-[#FEE7B3]/15">{activeProduct?.category}</Badge>
                      <Badge className="bg-[#6D5471]/35 text-[#FEE7B3] border border-[#FEE7B3]/15">{activeProduct?.brand}</Badge>
                      <Badge className="bg-[#548871]/20 text-[#FEE7B3] border border-[#FEE7B3]/15">Model: {activeProduct?.model}</Badge>
                    </div>
                  </div>

                  <div className={`rounded-2xl border ${PALETTE.border} p-3 ${PALETTE.panel2} w-full sm:w-[320px]`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className={`h-4 w-4 ${PALETTE.brand}`} />
                        <p className="font-medium">AI guidance</p>
                      </div>
                      <Badge className="bg-[#E5382A]/20 text-[#FEE7B3] border border-[#FEE7B3]/15">Beta</Badge>
                    </div>
                    <p className={`${PALETTE.subtext} text-sm mt-2`}>Deal Score combines trust, match confidence, and stock. V2 adds history percentile + seasonality.</p>
                  </div>
                </div>

                <div className={`grid gap-4 lg:grid-cols-3`}>
                  <div className={`rounded-2xl border ${PALETTE.border} p-4 ${PALETTE.panel2}`}>
                    <div className="flex items-center justify-between">
                      <p className={`${PALETTE.muted} text-xs`}>Trend</p>
                      <TrendingDown className={`h-4 w-4 ${PALETTE.brand}`} />
                    </div>
                    <p className="mt-1 text-lg font-semibold">Price history</p>
                    <p className={`${PALETTE.muted} text-xs`}>Last 12 months (demo)</p>
                  </div>
                  <div className={`rounded-2xl border ${PALETTE.border} p-4 ${PALETTE.panel2}`}>
                    <div className="flex items-center justify-between">
                      <p className={`${PALETTE.muted} text-xs`}>Safety</p>
                      <ShieldCheck className={`h-4 w-4 ${PALETTE.brand}`} />
                    </div>
                    <p className="mt-1 text-lg font-semibold">Trust signals</p>
                    <p className={`${PALETTE.muted} text-xs`}>Retailer + seller type</p>
                  </div>
                  <div className={`rounded-2xl border ${PALETTE.border} p-4 ${PALETTE.panel2}`}>
                    <div className="flex items-center justify-between">
                      <p className={`${PALETTE.muted} text-xs`}>Totals</p>
                      <Coins className={`h-4 w-4 ${PALETTE.brand}`} />
                    </div>
                    <p className="mt-1 text-lg font-semibold">Delivered price</p>
                    <p className={`${PALETTE.muted} text-xs`}>Shipping + estimated tax (V2)</p>
                  </div>
                </div>

                <div className={`h-[260px] w-full rounded-2xl border ${PALETTE.border} ${PALETTE.panel2} p-4`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(254,231,179,0.12)" />
                      <XAxis dataKey="month" stroke="rgba(254,231,179,0.55)" />
                      <YAxis stroke="rgba(254,231,179,0.55)" />
                      <Tooltip contentStyle={{ background: "rgba(11,45,53,0.95)", border: "1px solid rgba(254,231,179,0.15)", color: "#FEE7B3" }} />
                      <Line type="monotone" dataKey="price" stroke="#FEE7B3" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className={`${PALETTE.panel} border ${PALETTE.border} rounded-3xl overflow-hidden`}>
              <CardContent className="p-5">
                <Tabs defaultValue="offers">
                  <TabsList className={`grid w-full grid-cols-3 ${PALETTE.panel2} border ${PALETTE.border} rounded-2xl p-1`}>
                    <TabsTrigger value="offers" className="rounded-xl">Offers</TabsTrigger>
                    <TabsTrigger value="alerts" className="rounded-xl">Alerts</TabsTrigger>
                    <TabsTrigger value="drops" className="rounded-xl">Drops</TabsTrigger>
                  </TabsList>

                  <TabsContent value="offers" className="mt-4 space-y-3">
                    {offers.length === 0 ? (
                      <p className={`${PALETTE.muted} text-sm`}>No offers found yet.</p>
                    ) : (
                      offers
                        .slice()
                        .sort((a, b) => a.total - b.total)
                        .map((o) => {
                          const c = confidenceLabel(o.match);
                          const Icon = c.icon;
                          return (
                            <div
                              key={o.id}
                              className={`rounded-2xl border ${PALETTE.border} p-4 ${PALETTE.panel2}`}
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Globe className={`h-4 w-4 ${PALETTE.brand}`} />
                                    <p className="font-medium">{o.retailerName}</p>
                                    <Badge className={`bg-[#6D5471]/35 text-[#FEE7B3] border border-[#FEE7B3]/15`}>{o.riskLabel}</Badge>
                                    {!o.inStock && (
                                      <Badge className="bg-[#E5382A]/20 text-[#FEE7B3] border border-[#FEE7B3]/15">Out of stock</Badge>
                                    )}
                                  </div>
                                  <p className={`${PALETTE.muted} text-xs`}>Updated {o.updated} • Match: {o.matchMethod}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <p className="text-lg font-semibold">{money(o.total)}</p>
                                    <p className={`${PALETTE.muted} text-xs`}>{money(o.basePrice)} + {money(o.shipping)} ship</p>
                                  </div>
                                  <Button
                                    className="rounded-2xl bg-[#548871] hover:bg-[#548871]/90 text-[#FEE7B3]"
                                    onClick={() => {
                                      if (o.url && o.url !== "#") window.open(o.url, "_blank", "noopener,noreferrer");
                                    }}
                                  >
                                    Buy
                                  </Button>
                                </div>
                              </div>

                              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                <div className={`rounded-2xl border ${PALETTE.border} p-3 bg-black/10`}>
                                  <p className={`${PALETTE.muted} text-xs`}>Deal score</p>
                                  <div className="flex items-center justify-between">
                                    <p className="text-base font-semibold">{o.dealScore}/100</p>
                                    <Gauge className={`h-4 w-4 ${PALETTE.brand}`} />
                                  </div>
                                  <Progress value={o.dealScore} className="mt-2" />
                                </div>

                                <div className={`rounded-2xl border ${PALETTE.border} p-3 bg-black/10`}>
                                  <p className={`${PALETTE.muted} text-xs`}>Match confidence</p>
                                  <div className="flex items-center justify-between">
                                    <p className="text-base font-semibold">{c.label}</p>
                                    <Icon className={`h-4 w-4 ${c.tone === "good" ? PALETTE.good : c.tone === "warn" ? PALETTE.warn : PALETTE.bad}`} />
                                  </div>
                                  <Progress value={Math.round(o.match * 100)} className="mt-2" />
                                </div>

                                <div className={`rounded-2xl border ${PALETTE.border} p-3 bg-black/10`}>
                                  <p className={`${PALETTE.muted} text-xs`}>Retailer trust</p>
                                  <div className="flex items-center justify-between">
                                    <p className="text-base font-semibold">{Math.round(o.trust * 100)}%</p>
                                    <ShieldCheck className={`h-4 w-4 ${PALETTE.brand}`} />
                                  </div>
                                  <Progress value={Math.round(o.trust * 100)} className="mt-2" />
                                </div>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </TabsContent>

                  <TabsContent value="alerts" className="mt-4 space-y-3">
                    <div className={`rounded-2xl border ${PALETTE.border} p-4 ${PALETTE.panel2}`}>
                      <p className="font-medium">Price Alerts (V1)</p>
                      <p className={`${PALETTE.muted} text-sm mt-1`}>In the live build: you’ll store alerts in Postgres and process them via a worker every 15–60 minutes.</p>
                      <div className="mt-3 flex gap-2">
                        <Button className="rounded-2xl bg-[#E5382A] hover:bg-[#E5382A]/90 text-[#FEE7B3]">
                          <Bell className="mr-2 h-4 w-4" />
                          Create alert
                        </Button>
                        <Button variant="secondary" className={`rounded-2xl ${PALETTE.panel2} border ${PALETTE.border} text-[#FEE7B3]`}>
                          Manage
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="drops" className="mt-4 space-y-3">
                    <div className={`rounded-2xl border ${PALETTE.border} p-4 ${PALETTE.panel2}`}>
                      <p className="font-medium">Nike / Adidas Drops (V1)</p>
                      <p className={`${PALETTE.muted} text-sm mt-1`}>In the live build: this becomes a dedicated “Drop Mode” with release monitoring, restock alerts, and quick links.</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <div className={`rounded-2xl border ${PALETTE.border} p-3 bg-black/10`}>
                          <p className="text-sm font-medium">Nike drops</p>
                          <p className={`${PALETTE.muted} text-xs`}>Monitor launch calendar + restocks</p>
                        </div>
                        <div className={`rounded-2xl border ${PALETTE.border} p-3 bg-black/10`}>
                          <p className="text-sm font-medium">Adidas drops</p>
                          <p className={`${PALETTE.muted} text-xs`}>Monitor releases + size availability</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        <footer className={`text-xs ${PALETTE.muted} flex items-center justify-between`}> 
          <span>© {new Date().getFullYear()} PricePulse • Canada-first</span>
          <span>Tip: paste links to track anything even before full search coverage</span>
        </footer>
      </div>
    </div>
  );
}
