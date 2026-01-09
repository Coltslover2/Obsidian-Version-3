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

/**
 * PricePulse — Previewable prototype
 * - Cross-retailer search + canonical product view
 * - Smart alerts UX
 * - Deal score + match confidence
 * - Power-user dashboard
 *
 * Wire this UI to your real backend later (Next.js API routes / Supabase).
 */

// Color palette from your image:
// Green  #548871
// Red    #E5382A
// Purple #6D5471
// Teal   #107191
// Cream  #FEE7B3
const PALETTE = {
  bg: "bg-[#0b2d35]", // deepened teal for contrast
  panel: "bg-[#6D5471]/40",
  panel2: "bg-[#107191]/25",
  border: "border-[#FEE7B3]/15",
  text: "text-[#FEE7B3]",
  subtext: "text-[#FEE7B3]/80",
  muted: "text-[#FEE7B3]/65",
  brand: "text-[#548871]",
  accent: "text-[#107191]",
  good: "text-[#548871]",
  warn: "text-[#E5382A]", // use red for attention
  bad: "text-[#E5382A]",
};

// --- Mock data (replace with backend calls) ---
const RETAILERS = [
  { id: "amazon", name: "Amazon", trust: 0.78, type: "major" },
  { id: "bestbuy", name: "Best Buy", trust: 0.86, type: "major" },
  { id: "walmart", name: "Walmart", trust: 0.82, type: "major" },
  // Target removed (Canada-only V1)
  { id: "costco", name: "Costco", trust: 0.88, type: "major" },
  { id: "homedepot", name: "Home Depot", trust: 0.85, type: "major" },
  { id: "newegg", name: "Newegg", trust: 0.76, type: "major" },
  { id: "nike", name: "Nike", trust: 0.87, type: "brand" },
  { id: "adidas", name: "Adidas", trust: 0.84, type: "brand" },
  { id: "apple", name: "Apple", trust: 0.90, type: "brand" },
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
  const months = [
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
  ];
  let v = base;
  return months.map((m, i) => {
    // mild seasonality: November dip + January normalization
    const seasonal = i === 3 ? -0.12 : i === 4 ? -0.06 : i === 5 ? 0.03 : 0;
    const noise = (Math.sin(i * 1.7) * 0.5 + Math.cos(i * 0.9) * 0.3) * volatility;
    v = Math.max(1, v * (1 + seasonal + noise));
    return { month: m, price: Math.round(v) };
  });
};

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
    mkOffer({ r: "amazon", price: 699, ship: 0, stock: true, match: 0.80, method: "Title+Spec", seller: "marketplace" }),
    mkOffer({ r: "bestbuy", price: 749, ship: 0, stock: false, match: 0.88, method: "Title+Spec", seller: "retailer" }),
  ],
};

function mkOffer({ r, price, ship, stock, match, method, seller }) {
  const retailer = RETAILERS.find((x) => x.id === r);
  const trust = retailer?.trust ?? 0.6;
  const marketplacePenalty = seller === "marketplace" ? 0.15 : 0;
  const estTax = 0.0; // estimate later per user region
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

function calcDealScore({ total, trust, match, stock, marketplacePenalty }) {
  // 0–100 score: cheaper + trusted + confident match + in stock
  // In real backend: include history/seasonality/volatility.
  const priceComponent = 55; // placeholder; UI uses relative price elsewhere
  const trustComponent = Math.round(trust * 20);
  const matchComponent = Math.round(match * 20);
  const stockComponent = stock ? 5 : -10;
  const penalty = Math.round(marketplacePenalty * 20);
  const raw = priceComponent + trustComponent + matchComponent + stockComponent - penalty;
  return Math.max(0, Math.min(100, raw));
}

function confidenceLabel(match) {
  if (match >= 0.9) return { label: "Exact / High", tone: "good", icon: BadgeCheck };
  if (match >= 0.75) return { label: "Likely", tone: "warn", icon: AlertTriangle };
  return { label: "Low", tone: "bad", icon: AlertTriangle };
}

function money(n) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "CAD" }).format(n);
}

function classTone(tone) {
  if (tone === "good") return PALETTE.good;
  if (tone === "warn") return PALETTE.warn;
  return PALETTE.bad;
}

function Header({ page, setPage }) {
  return (
    <div className={`sticky top-0 z-20 ${PALETTE.bg}/80 backdrop-blur border-b ${PALETTE.border}`}>
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <button onClick={() => setPage("home")} className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 grid place-items-center">
            <Sparkles className="h-4 w-4 text-emerald-300" />
          </div>
          <div className="text-left">
            <div className={`font-semibold leading-tight ${PALETTE.text}`}>PricePulse</div>
            <div className={`text-xs ${PALETTE.muted}`}>Cross‑retailer deal intelligence</div>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-2">
          {[
            ["home", "Home"],
            ["search", "Search"],
            ["dashboard", "Dashboard"],
            ["pricing", "Pricing"],
          ].map(([k, label]) => (
            <Button
              key={k}
              variant={page === k ? "default" : "secondary"}
              className={`rounded-2xl ${page === k ? "" : "bg-slate-900/40"}`}
              onClick={() => setPage(k)}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" className="rounded-2xl bg-slate-900/40">
            Sign in
          </Button>
          <Button className="rounded-2xl">Get Pro</Button>
        </div>
      </div>
    </div>
  );
}

function Hero({ q, setQ, onSearch }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-6">
      <div className="grid gap-6 md:grid-cols-2 items-center">
        <div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${PALETTE.border} ${PALETTE.panel2}`}>
            <Globe className="h-4 w-4 text-cyan-300" />
            <span className={`text-xs ${PALETTE.subtext}`}>Best price across the internet (major + vetted long‑tail)</span>
          </div>
          <h1 className={`mt-4 text-4xl md:text-5xl font-semibold tracking-tight ${PALETTE.text}`}>
            Find the <span className={PALETTE.brand}>true cheapest</span> price —
            <span className={`block ${PALETTE.subtext}`}>with match confidence, trust signals, and smart alerts.</span>
          </h1>
          <p className={`mt-4 ${PALETTE.muted} leading-relaxed`}>
            PricePulse compares the same item across Amazon, Best Buy, Walmart, Target, Costco, Home Depot, Newegg, brand stores,
            and verified Shopify stores. We compute delivered price, detect fake discounts, and tell you whether to buy now or wait.
          </p>

          <div className="mt-6 flex gap-2">
            <div className="flex-1">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search: AirPods Pro 2, PS5 Slim, RTX 4070..."
                className="h-12 rounded-2xl bg-slate-950/50 border-slate-800"
              />
            </div>
            <Button onClick={onSearch} className="h-12 rounded-2xl px-5">
              <Search className="h-4 w-4 mr-2" /> Search
            </Button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <MiniValue icon={TrendingDown} title="Smart alerts" desc="Historical lows, restocks, seasonal predictions" />
            <MiniValue icon={Gauge} title="Deal score" desc="0–100 strength based on history + volatility" />
            <MiniValue icon={ShieldCheck} title="Trust signals" desc="Retailer rating + marketplace warnings" />
            <MiniValue icon={Layers} title="Power dashboard" desc="Volatility, spread, buy‑now vs wait" />
          </div>
        </div>

        <Card className={`rounded-3xl border ${PALETTE.border} ${PALETTE.panel}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm ${PALETTE.muted}`}>Right now</div>
                <div className={`text-xl font-semibold ${PALETTE.text}`}>Top tracked categories</div>
              </div>
              <Badge className="rounded-full" variant="secondary">
                Live demo data
              </Badge>
            </div>
            <Separator className="my-4 bg-slate-800" />

            <div className="grid gap-3">
              <CategoryRow name="Tech" note="Students + gamers" />
              <CategoryRow name="Gaming" note="Console drops + bundles" />
              <CategoryRow name="Sneakers" note="Nike/Adidas drops" />
              <CategoryRow name="PC Parts" note="GPUs + price spikes" />
              <CategoryRow name="Home" note="Tools + appliances" />
            </div>

            <Separator className="my-4 bg-slate-800" />
            <div className="flex items-center justify-between">
              <div className={`text-sm ${PALETTE.muted}`}>Email</div>
              <Button variant="secondary" className="rounded-2xl bg-slate-900/40">
                Weekly best deals
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MiniValue({ icon: Icon, title, desc }) {
  return (
    <div className={`p-3 rounded-2xl border ${PALETTE.border} ${PALETTE.panel2}`}>
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-2xl bg-slate-900/60 border border-slate-800 grid place-items-center">
          <Icon className="h-4 w-4 text-slate-200" />
        </div>
        <div>
          <div className={`text-sm font-medium ${PALETTE.text}`}>{title}</div>
          <div className={`text-xs ${PALETTE.muted}`}>{desc}</div>
        </div>
      </div>
    </div>
  );
}

function CategoryRow({ name, note }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-2xl border ${PALETTE.border} ${PALETTE.panel2}`}>
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 grid place-items-center">
          <Store className="h-4 w-4 text-emerald-300" />
        </div>
        <div>
          <div className={`text-sm font-medium ${PALETTE.text}`}>{name}</div>
          <div className={`text-xs ${PALETTE.muted}`}>{note}</div>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-400" />
    </div>
  );
}

function SearchResults({ q, setQ, onSearch, onOpenProduct }) {
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return CANONICAL_PRODUCTS;
    return CANONICAL_PRODUCTS.filter((p) =>
      `${p.title} ${p.brand} ${p.model} ${p.category}`.toLowerCase().includes(s)
    );
  }, [q]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className={`text-sm ${PALETTE.muted}`}>Search across retailers</div>
          <div className={`text-2xl font-semibold ${PALETTE.text}`}>Find your item</div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Paste a URL or search a product…"
            className="h-11 rounded-2xl bg-slate-950/50 border-slate-800 md:w-[420px]"
          />
          <Button onClick={onSearch} className="h-11 rounded-2xl">
            <Search className="h-4 w-4 mr-2" /> Search
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {results.map((p) => (
          <button key={p.id} onClick={() => onOpenProduct(p.id)} className="text-left">
            <Card className={`rounded-3xl border ${PALETTE.border} ${PALETTE.panel} hover:bg-slate-900/60 transition`}
            >
              <CardContent className="p-4">
                <div className="h-36 rounded-2xl overflow-hidden border border-slate-800">
                  <img src={p.image} alt="" className="h-full w-full object-cover" />
                </div>
                <div className={`mt-3 text-sm font-medium ${PALETTE.text}`}>{p.title}</div>
                <div className={`mt-1 text-xs ${PALETTE.muted}`}>{p.brand} • {p.model} • {p.category}</div>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="rounded-full">Cross‑retailer</Badge>
                  <Badge variant="secondary" className="rounded-full">Deal score</Badge>
                  <Badge variant="secondary" className="rounded-full">Alerts</Badge>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductView({ productId, onBack, onAddAlert }) {
  const p = CANONICAL_PRODUCTS.find((x) => x.id === productId);
  const offers = OFFERS[productId] ?? [];

  const history = useMemo(() => {
    if (productId === "p_airpods_pro_2") return priceHistory(329, 0.05);
    if (productId === "p_ps5_slim") return priceHistory(649, 0.06);
    return priceHistory(749, 0.09);
  }, [productId]);

  const minTotal = Math.min(...offers.map((o) => o.total));
  const spread = Math.max(...offers.map((o) => o.total)) - minTotal;

  const sorted = [...offers].sort((a, b) => {
    // Rank score (prototype): cheaper, trusted, confident, in-stock
    const score = (o) => {
      const priceScore = 1 - (o.total - minTotal) / Math.max(1, spread || 1);
      const stockScore = o.inStock ? 1 : 0;
      const marketplacePenalty = o.seller === "marketplace" ? 0.15 : 0;
      return 0.55 * priceScore + 0.2 * o.trust + 0.2 * o.match + 0.05 * stockScore - marketplacePenalty;
    };
    return score(b) - score(a);
  });

  const recommended = sorted[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Button variant="secondary" className="rounded-2xl bg-slate-900/40" onClick={onBack}>
            ← Back
          </Button>
          <div className={`mt-3 text-2xl font-semibold ${PALETTE.text}`}>{p?.title}</div>
          <div className={`mt-1 text-sm ${PALETTE.muted}`}>{p?.brand} • Model {p?.model} • UPC {p?.upc}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="rounded-2xl bg-slate-900/40" onClick={onAddAlert}>
            <Bell className="h-4 w-4 mr-2" /> Create alert
          </Button>
          <Button className="rounded-2xl">
            <Coins className="h-4 w-4 mr-2" /> Track
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className={`rounded-3xl border ${PALETTE.border} ${PALETTE.panel} md:col-span-2`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className={`text-sm ${PALETTE.muted}`}>Best place to buy right now</div>
                <div className={`text-xl font-semibold ${PALETTE.text}`}>{recommended?.retailerName}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="rounded-full" variant="secondary">Recommended</Badge>
                <Badge className="rounded-full" variant="secondary">Estimated total {money(recommended?.total ?? 0)}</Badge>
              </div>
            </div>

            <Separator className="my-4 bg-slate-800" />

            <div className="grid gap-4 md:grid-cols-2">
              <div className={`p-4 rounded-2xl border ${PALETTE.border} ${PALETTE.panel2}`}>
                <div className="flex items-center justify-between">
                  <div className={`text-sm ${PALETTE.muted}`}>Deal strength</div>
                  <Badge variant="secondary" className="rounded-full">0–100</Badge>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className={`text-3xl font-semibold ${PALETTE.text}`}>{recommended?.dealScore ?? 0}</div>
                  <div className={`text-sm ${PALETTE.muted}`}>Deal Score</div>
                </div>
                <div className="mt-2">
                  <Progress value={recommended?.dealScore ?? 0} />
                </div>
                <div className={`mt-2 text-xs ${PALETTE.muted}`}>
                  Based on match confidence, retailer trust, and price positioning. (Backend will add history/seasonality.)
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${PALETTE.border} ${PALETTE.panel2}`}>
                <div className="flex items-center justify-between">
                  <div className={`text-sm ${PALETTE.muted}`}>Buy now vs wait</div>
                  <Badge variant="secondary" className="rounded-full">Prediction</Badge>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {(spread <= 25 ? <TrendingDown className="h-5 w-5 text-emerald-300" /> : <TrendingUp className="h-5 w-5 text-amber-300" />)}
                  <div className={`text-lg font-semibold ${PALETTE.text}`}>
                    {spread <= 25 ? "Buy now" : "Consider waiting"}
                  </div>
                </div>
                <div className={`mt-2 text-xs ${PALETTE.muted}`}>
                  Example logic: if current price is near 6–12 month low + volatility is high → buy. (Real backend will compute this.)
                </div>
                <div className={`mt-3 text-xs ${PALETTE.subtext}`}>
                  Seasonal note: many electronics dip in November; PricePulse will learn category patterns.
                </div>
              </div>
            </div>

            <Separator className="my-4 bg-slate-800" />

            <div>
              <div className={`text-sm ${PALETTE.muted}`}>Price history (12 months)</div>
              <div className="h-56 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="month" />
                    <YAxis domain={["dataMin - 25", "dataMax + 25"]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="price" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`rounded-3xl border ${PALETTE.border} ${PALETTE.panel}`}>
          <CardContent className="p-4">
            <div className={`text-sm ${PALETTE.muted}`}>Spread</div>
            <div className={`text-2xl font-semibold ${PALETTE.text}`}>{money(spread)}</div>
            <div className={`text-xs ${PALETTE.muted}`}>Difference between cheapest and priciest offer.</div>
            <Separator className="my-4 bg-slate-800" />
            <div className={`text-sm ${PALETTE.muted}`}>Cheapest delivered</div>
            <div className={`text-xl font-semibold ${PALETTE.text}`}>{money(minTotal)}</div>
            <Separator className="my-4 bg-slate-800" />
            <div className={`text-sm ${PALETTE.muted}`}>What you see</div>
            <ul className={`mt-2 text-sm ${PALETTE.subtext} space-y-2`}>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Trust signals (retailer + seller)</li>
              <li className="flex items-center gap-2"><Gauge className="h-4 w-4 text-cyan-300" /> Deal strength score</li>
              <li className="flex items-center gap-2"><Bell className="h-4 w-4 text-slate-200" /> Smart alerts (lows, restocks)</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="offers">
          <TabsList className="rounded-2xl bg-slate-900/40 border border-slate-800">
            <TabsTrigger value="offers" className="rounded-2xl">All offers</TabsTrigger>
            <TabsTrigger value="alerts" className="rounded-2xl">Smart alerts</TabsTrigger>
            <TabsTrigger value="intel" className="rounded-2xl">Price intelligence</TabsTrigger>
          </TabsList>

          <TabsContent value="offers">
            <div className="mt-4 grid gap-3">
              {sorted.map((o) => {
                const c = confidenceLabel(o.match);
                const CIcon = c.icon;
                return (
                  <Card key={o.id} className={`rounded-3xl border ${PALETTE.border} ${PALETTE.panel}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-slate-900/60 border border-slate-800 grid place-items-center">
                            <Store className="h-4 w-4 text-slate-200" />
                          </div>
                          <div>
                            <div className={`font-medium ${PALETTE.text}`}>{o.retailerName}</div>
                            <div className={`text-xs ${PALETTE.muted}`}>Updated {o.updated} • {o.inStock ? "In stock" : "Out of stock"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="rounded-full">Base {money(o.basePrice)}</Badge>
                          <Badge variant="secondary" className="rounded-full">Ship {money(o.shipping)}</Badge>
                          <Badge className="rounded-full" variant="secondary">Total {money(o.total)}</Badge>
                          <Badge className="rounded-full" variant="secondary">Deal {o.dealScore}</Badge>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-2 md:grid-cols-3">
                        <div className={`p-3 rounded-2xl border ${PALETTE.border} ${PALETTE.panel2}`}>
                          <div className={`text-xs ${PALETTE.muted}`}>Match confidence</div>
                          <div className={`mt-1 flex items-center gap-2 ${classTone(c.tone)}`}>
                            <CIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">{c.label}</span>
                            <span className={`text-xs ${PALETTE.muted}`}>({Math.round(o.match * 100)}% • {o.matchMethod})</span>
                          </div>
                        </div>
                        <div className={`p-3 rounded-2xl border ${PALETTE.border} ${PALETTE.panel2}`}>
                          <div className={`text-xs ${PALETTE.muted}`}>Retailer trust</div>
                          <div className={`mt-1 text-sm font-medium ${PALETTE.text}`}>{Math.round(o.trust * 100)}/100</div>
                          <div className={`text-xs ${PALETTE.muted}`}>{o.riskLabel}</div>
                        </div>
                        <div className={`p-3 rounded-2xl border ${PALETTE.border} ${PALETTE.panel2}`}>
                          <div className={`text-xs ${PALETTE.muted}`}>Action</div>
                          <div className="mt-1 flex gap-2">
                            <Button className="rounded-2xl" size="sm">Go to deal</Button>
                            <Button variant="secondary" className="rounded-2xl bg-slate-900/40" size="sm">
                              Watch
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <AlertCard title="Historical low" desc="Notify when lowest in 6–12 months." />
              <AlertCard title="Deal quality" desc="Notify when Deal Score ≥ 85." />
              <AlertCard title="Restock" desc="Notify when any trusted retailer is back in stock." />
              <AlertCard title="Seasonal prediction" desc="Warn if a drop is statistically likely soon." />
              <AlertCard title="Competitor undercut" desc="Explain: “Price fell because X undercut by $12.”" />
              <AlertCard title="Coupon stacking" desc="Detect stackable promos where available." />
            </div>
          </TabsContent>

          <TabsContent value="intel">
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <MetricCard title="Volatility" value="Medium" icon={Gauge} note="Calculated from price history variance." />
              <MetricCard title="Pricing spread" value={money(spread)} icon={TrendingDown} note="How much you save by choosing the best store." />
              <MetricCard title="Best store" value={recommended?.retailerName ?? "—"} icon={Store} note="Chosen by delivered price + trust + confidence." />
              <MetricCard title="Trust coverage" value="Major + vetted" icon={ShieldCheck} note="Lower-trust offers are labeled (never hidden silently)." />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AlertCard({ title, desc }) {
  return (
    <Card className={`rounded-3xl border ${PALETTE.border} ${PALETTE.panel}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={`text-base font-semibold ${PALETTE.text}`}>{title}</div>
          <Badge variant="secondary" className="rounded-full">Pro</Badge>
        </div>
        <div className={`mt-2 text-sm ${PALETTE.muted}`}>{desc}</div>
        <div className="mt-3 flex gap-2">
          <Button className="rounded-2xl" size="sm">Add</Button>
          <Button variant="secondary" className="rounded-2xl bg-slate-900/40" size="sm">Preview</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({ title, value, icon: Icon, note }) {
  return (
    <Card className={`rounded-3xl border ${PALETTE.border} ${PALETTE.panel}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-slate-900/60 border border-slate-800 grid place-items-center">
            <Icon className="h-4 w-4 text-slate-200" />
          </div>
          <div>
            <div className={`text-sm ${PALETTE.muted}`}>{title}</div>
            <div className={`text-xl font-semibold ${PALETTE.text}`}>{value}</div>
          </div>
        </div>
        <div className={`mt-2 text-xs ${PALETTE.muted}`}>{note}</div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const tracked = [
    { id: "p_airpods_pro_2", name: "AirPods Pro 2", alert: "Historical low", status: "Watching" },
    { id: "p_ps5_slim", name: "PS5 Slim", alert: "Restock", status: "Watching" },
    { id: "p_rtx_4070", name: "RTX 4070", alert: "Deal score ≥ 85", status: "Paused" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className={`text-sm ${PALETTE.muted}`}>Power user tools</div>
          <div className={`text-2xl font-semibold ${PALETTE.text}`}>Price Intelligence Dashboard</div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="rounded-2xl bg-slate-900/40">Export CSV</Button>
          <Button className="rounded-2xl">Upgrade to Pro</Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Stat title="Trackers" value="3" icon={Bell} note="Free: 3 • Pro: unlimited" />
        <Stat title="Alerts fired" value="1" icon={Sparkles} note="Last 7 days" />
        <Stat title="Estimated savings" value={money(68)} icon={Coins} note="Compared to Amazon baseline" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className={`rounded-3xl border ${PALETTE.border} ${PALETTE.panel}`}>
          <CardContent className="p-4">
            <div className={`text-base font-semibold ${PALETTE.text}`}>Your watchlist</div>
            <div className={`mt-1 text-sm ${PALETTE.muted}`}>Smart alerts + cheapest-store recommendations.</div>
            <Separator className="my-4 bg-slate-800" />
            <div className="grid gap-3">
              {tracked.map((t) => (
                <div key={t.id} className={`p-3 rounded-2xl border ${PALETTE.border} ${PALETTE.panel2} flex items-center justify-between`}>
                  <div>
                    <div className={`text-sm font-medium ${PALETTE.text}`}>{t.name}</div>
                    <div className={`text-xs ${PALETTE.muted}`}>{t.alert} • {t.status}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="rounded-2xl">Open</Button>
                    <Button size="sm" variant="secondary" className="rounded-2xl bg-slate-900/40">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={`rounded-3xl border ${PALETTE.border} ${PALETTE.panel}`}>
          <CardContent className="p-4">
            <div className={`text-base font-semibold ${PALETTE.text}`}>Weekly “Best Deals” email</div>
            <div className={`mt-1 text-sm ${PALETTE.muted}`}>Passive income engine: automated emails + affiliate links.</div>
            <Separator className="my-4 bg-slate-800" />
            <div className="grid gap-3">
              <EmailRow title="Best Tech Deals (Canada)" note="Starts after you add 20+ indexed products." />
              <EmailRow title="GPU Tracker Digest" note="Great for gamers + resellers." />
              <EmailRow title="Sneaker Drops" note="Nike/Adidas restocks + alert rules." />
            </div>
            <div className="mt-4 flex gap-2">
              <Button className="rounded-2xl">Enable</Button>
              <Button variant="secondary" className="rounded-2xl bg-slate-900/40">Preview template</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ title, value, icon: Icon, note }) {
  return (
    <Card className={`rounded-3xl border ${PALETTE.border} ${PALETTE.panel}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-slate-900/60 border border-slate-800 grid place-items-center">
            <Icon className="h-4 w-4 text-slate-200" />
          </div>
          <div>
            <div className={`text-sm ${PALETTE.muted}`}>{title}</div>
            <div className={`text-2xl font-semibold ${PALETTE.text}`}>{value}</div>
          </div>
        </div>
        <div className={`mt-2 text-xs ${PALETTE.muted}`}>{note}</div>
      </CardContent>
    </Card>
  );
}

function EmailRow({ title, note }) {
  return (
    <div className={`p-3 rounded-2xl border ${PALETTE.border} ${PALETTE.panel2}`}>
      <div className={`text-sm font-medium ${PALETTE.text}`}>{title}</div>
      <div className={`text-xs ${PALETTE.muted}`}>{note}</div>
    </div>
  );
}

function Pricing() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      tag: "Start here",
      features: [
        "Track 3 items",
        "Basic price drop alerts",
        "Cross‑retailer comparison",
        "Affiliate links",
      ],
      cta: "Get started",
      primary: false,
    },
    {
      name: "Pro",
      price: "$7/mo",
      tag: "Most popular",
      features: [
        "Unlimited trackers",
        "Historical low + deal score alerts",
        "Seasonal prediction + volatility",
        "No ads",
        "Priority refresh (hot items)",
      ],
      cta: "Upgrade to Pro",
      primary: true,
    },
    {
      name: "Business",
      price: "$29/mo",
      tag: "Resellers",
      features: [
        "Bulk tracking",
        "CSV export + API access",
        "Resale margin calculator",
        "Team seats",
        "Custom retailer sources",
      ],
      cta: "Contact sales",
      primary: false,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div>
        <div className={`text-sm ${PALETTE.muted}`}>Monetization</div>
        <div className={`text-3xl font-semibold ${PALETTE.text}`}>Plans that scale beyond affiliates</div>
        <div className={`mt-2 ${PALETTE.muted} max-w-2xl`}>
          Free gets users. Pro creates recurring revenue. Business turns PricePulse into a tool for resellers and small companies.
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {tiers.map((t) => (
          <Card key={t.name} className={`rounded-3xl border ${PALETTE.border} ${t.primary ? "bg-emerald-500/10 border-emerald-500/25" : PALETTE.panel}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className={`text-lg font-semibold ${PALETTE.text}`}>{t.name}</div>
                <Badge className="rounded-full" variant={t.primary ? "default" : "secondary"}>{t.tag}</Badge>
              </div>
              <div className={`mt-3 text-3xl font-semibold ${PALETTE.text}`}>{t.price}</div>
              <Separator className="my-4 bg-slate-800" />
              <ul className={`space-y-2 text-sm ${PALETTE.subtext}`}>
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <BadgeCheck className="h-4 w-4 mt-0.5 text-emerald-300" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button className={`mt-5 w-full rounded-2xl ${t.primary ? "" : ""}`} variant={t.primary ? "default" : "secondary"}>
                {t.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className={`rounded-3xl border ${PALETTE.border} ${PALETTE.panel}`}>
          <CardContent className="p-5">
            <div className={`text-base font-semibold ${PALETTE.text}`}>Passive income engine</div>
            <div className={`mt-2 text-sm ${PALETTE.muted}`}>
              Automations that run while you sleep: refresh scheduler, alert triggers, affiliate link insertion, weekly deal emails,
              and SEO landing pages.
            </div>
          </CardContent>
        </Card>
        <Card className={`rounded-3xl border ${PALETTE.border} ${PALETTE.panel}`}>
          <CardContent className="p-5">
            <div className={`text-base font-semibold ${PALETTE.text}`}>Trust & safety</div>
            <div className={`mt-2 text-sm ${PALETTE.muted}`}>
              Major retailers + vetted long‑tail sources. Marketplace and low‑trust stores are labeled clearly, never hidden.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PricePulsePrototype() {
  const [page, setPage] = useState("home");
  const [q, setQ] = useState("");
  const [activeProductId, setActiveProductId] = useState("p_airpods_pro_2");

  const onSearch = () => setPage("search");
  const openProduct = (id) => {
    setActiveProductId(id);
    setPage("product");
  };

  return (
    <div className={`${PALETTE.bg} min-h-screen ${PALETTE.text}`}>
      <Header page={page} setPage={setPage} />

      {page === "home" && <Hero q={q} setQ={setQ} onSearch={onSearch} />}
      {page === "search" && (
        <SearchResults q={q} setQ={setQ} onSearch={onSearch} onOpenProduct={openProduct} />
      )}
      {page === "product" && (
        <ProductView
          productId={activeProductId}
          onBack={() => setPage("search")}
          onAddAlert={() => alert("Prototype: open Create Alert modal")}
        />
      )}
      {page === "dashboard" && <Dashboard />}
      {page === "pricing" && <Pricing />}

      <footer className={`mt-10 border-t ${PALETTE.border} ${PALETTE.panel2}`}>
        <div className="mx-auto max-w-6xl px-4 py-8 grid gap-4 md:grid-cols-3">
          <div>
            <div className={`font-semibold ${PALETTE.text}`}>PricePulse</div>
            <div className={`text-sm ${PALETTE.muted} mt-1`}>Cross‑retailer intelligence + smart alerts.</div>
          </div>
          <div className={`text-sm ${PALETTE.muted}`}>
            <div className="font-medium text-slate-200">What’s next</div>
            <ul className="mt-2 space-y-1">
              <li>• Paste-any-URL parsing</li>
              <li>• Wishlist import</li>
              <li>• Browser extension</li>
              <li>• SEO category pages</li>
            </ul>
          </div>
          <div className={`text-sm ${PALETTE.muted}`}>
            <div className="font-medium text-slate-200">Legal</div>
            <ul className="mt-2 space-y-1">
              <li>• Affiliate disclosure</li>
              <li>• Retailer terms compliance</li>
              <li>• Privacy policy</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
