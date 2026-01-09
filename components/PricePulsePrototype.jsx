"use client";

import React, { useMemo, useState } from "react";

/**
 * Self-contained UI (no shadcn, no Tailwind) so it deploys cleanly on Vercel.
 * You can swap this later for a design system once you add dependencies/config.
 *
 * Palette:
 *  #548871 (green) • #E5382A (red) • #6D5471 (purple) • #107191 (teal) • #FEE7B3 (cream)
 */

const PALETTE = {
  green: "#548871",
  red: "#E5382A",
  purple: "#6D5471",
  teal: "#107191",
  cream: "#FEE7B3",
  ink: "#0b0f14",
  white: "#ffffff",
};

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Card({ children, style, className }) {
  return (
    <div
      className={className}
      style={{
        background: PALETTE.white,
        border: `1px solid rgba(0,0,0,0.08)`,
        borderRadius: 16,
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Button({ children, onClick, variant = "primary", style, type = "button", disabled }) {
  const base = {
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 700,
    border: "1px solid transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    transition: "transform 120ms ease, opacity 120ms ease",
  };

  const variants = {
    primary: { background: PALETTE.teal, color: PALETTE.white },
    soft: { background: "rgba(16,113,145,0.10)", color: PALETTE.teal, borderColor: "rgba(16,113,145,0.25)" },
    danger: { background: PALETTE.red, color: PALETTE.white },
    ghost: { background: "transparent", color: PALETTE.ink, borderColor: "rgba(0,0,0,0.12)" },
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...(variants[variant] || variants.primary), ...style }}
      onMouseDown={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "scale(0.98)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {children}
    </button>
  );
}

function Input({ value, onChange, placeholder, style }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.16)",
        outline: "none",
        fontSize: 14,
        ...style,
      }}
    />
  );
}

function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: { bg: "rgba(0,0,0,0.06)", fg: "rgba(0,0,0,0.75)" },
    good: { bg: "rgba(84,136,113,0.16)", fg: PALETTE.green },
    warn: { bg: "rgba(229,56,42,0.12)", fg: PALETTE.red },
    info: { bg: "rgba(16,113,145,0.12)", fg: PALETTE.teal },
    accent: { bg: "rgba(109,84,113,0.14)", fg: PALETTE.purple },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 999,
        background: t.bg,
        color: t.fg,
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function money(n) {
  try {
    return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

function dealScore(offer, lowestTotal, spread) {
  // 0..100 score: lower total = higher score. Spread protects against tiny differences.
  const s = spread <= 0 ? 1 : spread;
  const normalized = 1 - (offer.total - lowestTotal) / s;
  const score = Math.max(0, Math.min(1, normalized));
  // Mild boost for trusted retailers; mild penalty for marketplaces
  const trustBoost = offer.trust === "official" ? 0.06 : offer.trust === "marketplace" ? -0.05 : 0;
  return Math.round(Math.max(0, Math.min(100, (score + trustBoost) * 100)));
}

const DEMO_OFFERS = [
  { retailer: "Best Buy", trust: "official", base: 289.99, shipping: 0, taxEstimate: 37.70, url: "https://www.bestbuy.ca/" },
  { retailer: "Walmart", trust: "official", base: 279.0, shipping: 6.99, taxEstimate: 37.00, url: "https://www.walmart.ca/" },
  { retailer: "Amazon", trust: "marketplace", base: 269.99, shipping: 0, taxEstimate: 36.45, url: "https://www.amazon.ca/" },
  { retailer: "Home Depot", trust: "official", base: 299.0, shipping: 0, taxEstimate: 40.30, url: "https://www.homedepot.ca/" },
  { retailer: "Newegg", trust: "official", base: 274.99, shipping: 9.99, taxEstimate: 37.10, url: "https://www.newegg.ca/" },
];

export default function PricePulsePrototype() {
  const [query, setQuery] = useState("");
  const [watchlist, setWatchlist] = useState([]);
  const [mode, setMode] = useState("search"); // search | watchlist

  const offers = useMemo(() => {
    if (!query.trim()) return [];
    // Demo: in real version, fetch /api/search?q=...
    return DEMO_OFFERS.map((o) => ({
      ...o,
      total: Number((o.base + o.shipping + o.taxEstimate).toFixed(2)),
      matchConfidence: o.retailer === "Amazon" ? 0.78 : 0.92,
    }));
  }, [query]);

  const lowestTotal = useMemo(() => (offers.length ? Math.min(...offers.map((o) => o.total)) : 0), [offers]);
  const spread = useMemo(() => (offers.length ? Math.max(...offers.map((o) => o.total)) - lowestTotal : 0), [offers, lowestTotal]);

  const ranked = useMemo(() => {
    const list = [...offers].sort((a, b) => a.total - b.total);
    return list.map((o) => ({ ...o, score: dealScore(o, lowestTotal, spread) }));
  }, [offers, lowestTotal, spread]);

  const best = ranked[0];

  function addToWatchlist() {
    const name = query.trim();
    if (!name) return;
    if (watchlist.some((w) => w.name.toLowerCase() === name.toLowerCase())) return;
    setWatchlist((w) => [
      ...w,
      {
        id: crypto?.randomUUID?.() || String(Date.now()),
        name,
        targetPrice: best ? best.total - 10 : null,
        createdAt: new Date().toISOString(),
      },
    ]);
    setMode("watchlist");
  }

  function removeFromWatchlist(id) {
    setWatchlist((w) => w.filter((x) => x.id !== id));
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${PALETTE.cream} 0%, rgba(254,231,179,0.45) 40%, #ffffff 100%)`,
        color: PALETTE.ink,
        padding: 18,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: PALETTE.teal,
                boxShadow: "0 12px 26px rgba(16,113,145,0.25)",
              }}
            />
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 0.2 }}>PricePulse</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>
                Canada-first price comparison • tracking • alerts
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Button variant={mode === "search" ? "primary" : "soft"} onClick={() => setMode("search")}>
              Search
            </Button>
            <Button variant={mode === "watchlist" ? "primary" : "soft"} onClick={() => setMode("watchlist")}>
              Watchlist ({watchlist.length})
            </Button>
          </div>
        </div>

        {/* Main */}
        <Card style={{ padding: 16 }}>
          {mode === "search" ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
                <Input
                  value={query}
                  onChange={setQuery}
                  placeholder="Search: AirPods Pro 2, PS5 Slim, RTX 4070…"
                />
                <Button onClick={addToWatchlist} disabled={!query.trim()}>
                  Track
                </Button>
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Badge tone="info">Delivered-price ranking</Badge>
                <Badge tone="accent">Match confidence</Badge>
                <Badge tone="good">Deal score</Badge>
                <Badge tone="warn">Fake discount detection (coming)</Badge>
              </div>

              {!query.trim() ? (
                <div style={{ marginTop: 18, padding: 14, borderRadius: 14, background: "rgba(0,0,0,0.03)" }}>
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>Try a search</div>
                  <div style={{ fontSize: 13, opacity: 0.85 }}>
                    This build deploys cleanly. Next step is wiring <code>/api/search</code> to real retailer adapters.
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 14 }}>
                  {/* Offers */}
                  <div>
                    <div style={{ fontWeight: 900, marginBottom: 10 }}>Best price across retailers</div>
                    <div style={{ display: "grid", gap: 10 }}>
                      {ranked.map((o) => (
                        <Card key={o.retailer} style={{ padding: 12, borderRadius: 14, boxShadow: "none" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                            <div style={{ display: "grid", gap: 6 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <div style={{ fontWeight: 900 }}>{o.retailer}</div>
                                <Badge tone={o.trust === "official" ? "good" : "warn"}>
                                  {o.trust === "official" ? "Official" : "Marketplace"}
                                </Badge>
                                <Badge tone="accent">
                                  Match {Math.round(o.matchConfidence * 100)}%
                                </Badge>
                              </div>
                              <div style={{ fontSize: 13, opacity: 0.85 }}>
                                Base {money(o.base)} • Shipping {money(o.shipping)} • Est. tax {money(o.taxEstimate)}
                              </div>
                            </div>

                            <div style={{ display: "grid", justifyItems: "end", gap: 8 }}>
                              <div style={{ fontWeight: 900, fontSize: 16 }}>{money(o.total)}</div>
                              <Badge tone={o.score >= 80 ? "good" : o.score >= 60 ? "info" : "warn"}>
                                Deal Score {o.score}/100
                              </Badge>
                              <a href={o.url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: PALETTE.teal, fontWeight: 800 }}>
                                View store →
                              </a>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Insight */}
                  <div>
                    <div style={{ fontWeight: 900, marginBottom: 10 }}>AI deal insight</div>
                    <Card style={{ padding: 14, borderRadius: 14, boxShadow: "none", background: "rgba(16,113,145,0.06)" }}>
                      {best ? (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontSize: 13, fontWeight: 900 }}>Recommendation</div>
                            <Badge tone={best.score >= 75 ? "good" : "info"}>{best.score >= 75 ? "Buy now" : "Monitor"}</Badge>
                          </div>
                          <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.45 }}>
                            Best delivered price is <b>{money(best.total)}</b> at <b>{best.retailer}</b>. 
                            Spread across retailers is <b>{money(spread)}</b>, so this offer ranks highest on value.
                          </div>
                          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ fontWeight: 800 }}>Deal score</span>
                              <span style={{ fontWeight: 900 }}>{best.score}/100</span>
                            </div>
                            <div style={{ height: 10, borderRadius: 999, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
                              <div style={{ width: `${best.score}%`, height: "100%", background: PALETTE.green }} />
                            </div>
                            <div style={{ fontSize: 12, opacity: 0.8 }}>
                              (Demo scoring). Once price history is stored, this becomes “historical low / trend / prediction”.
                            </div>
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: 13, opacity: 0.85 }}>
                          Search for an item to see cross-retailer results and a deal score.
                        </div>
                      )}
                    </Card>

                    <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
                      Note: Amazon will be integrated using affiliate-approved methods (no scraping).
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 900 }}>Your Watchlist</div>
                  <div style={{ fontSize: 13, opacity: 0.85 }}>Paste-link tracking + alerts will run via background jobs next.</div>
                </div>
                <Button variant="soft" onClick={() => setMode("search")}>
                  + Add item
                </Button>
              </div>

              <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                {watchlist.length === 0 ? (
                  <div style={{ padding: 14, borderRadius: 14, background: "rgba(0,0,0,0.03)" }}>
                    <div style={{ fontWeight: 900, marginBottom: 6 }}>No items yet</div>
                    <div style={{ fontSize: 13, opacity: 0.85 }}>
                      Go to Search, type an item, click <b>Track</b>.
                    </div>
                  </div>
                ) : (
                  watchlist.map((w) => (
                    <Card key={w.id} style={{ padding: 12, borderRadius: 14, boxShadow: "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                        <div style={{ display: "grid", gap: 6 }}>
                          <div style={{ fontWeight: 900 }}>{w.name}</div>
                          <div style={{ fontSize: 13, opacity: 0.85 }}>
                            Target alert: {w.targetPrice ? money(w.targetPrice) : "Set after first lookup"}
                          </div>
                        </div>
                        <Button variant="ghost" onClick={() => removeFromWatchlist(w.id)}>
                          Remove
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </Card>

        {/* Footer */}
        <div style={{ marginTop: 14, fontSize: 12, opacity: 0.75 }}>
          V1 deploy-ready. Next: connect real retailer adapters → store price history → alerts.
        </div>
      </div>
    </div>
  );
}
