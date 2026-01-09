"use client";

import React, { useMemo, useState } from "react";

/**
 * PricePulse Prototype UI (Canada-first)
 * Self-contained (no Tailwind/shadcn) so it deploys cleanly on Vercel.
 * Styled to closely match your original screenshots: soft gradients, pill nav, big hero, feature cards.
 *
 * Palette:
 *  #548871 (green) • #E5382A (red) • #6D5471 (purple) • #107191 (teal) • #FEE7B3 (cream)
 */

const P = {
  green: "#548871",
  red: "#E5382A",
  purple: "#6D5471",
  teal: "#107191",
  cream: "#FEE7B3",
  ink: "#0b0f14",
  white: "#ffffff",
};

function money(n) {
  try {
    return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n);
  } catch {
    return `$${Number(n || 0).toFixed(2)}`;
  }
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Icon({ name, size = 18, color = "rgba(0,0,0,0.65)" }) {
  const common = { width: size, height: size, display: "inline-block" };
  const stroke = { stroke: color, strokeWidth: 2, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };

  if (name === "spark") {
    return (
      <svg viewBox="0 0 24 24" style={common}>
        <path {...stroke} d="M12 2l1.5 6L20 10l-6.5 2L12 22l-1.5-10L4 10l6.5-2z" />
      </svg>
    );
  }
  if (name === "search") {
    return (
      <svg viewBox="0 0 24 24" style={common}>
        <circle {...stroke} cx="11" cy="11" r="7" />
        <path {...stroke} d="M20 20l-3.5-3.5" />
      </svg>
    );
  }
  if (name === "bell") {
    return (
      <svg viewBox="0 0 24 24" style={common}>
        <path {...stroke} d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
        <path {...stroke} d="M9.5 19a2.5 2.5 0 005 0" />
      </svg>
    );
  }
  if (name === "chart") {
    return (
      <svg viewBox="0 0 24 24" style={common}>
        <path {...stroke} d="M4 19V5" />
        <path {...stroke} d="M4 19h16" />
        <path {...stroke} d="M7 15l3-4 3 2 4-6" />
      </svg>
    );
  }
  if (name === "zap") {
    return (
      <svg viewBox="0 0 24 24" style={common}>
        <path {...stroke} d="M13 2L3 14h7l-1 8 12-14h-7l1-6z" />
      </svg>
    );
  }
  if (name === "lock") {
    return (
      <svg viewBox="0 0 24 24" style={common}>
        <rect {...stroke} x="5" y="11" width="14" height="10" rx="2" />
        <path {...stroke} d="M8 11V8a4 4 0 018 0v3" />
      </svg>
    );
  }
  if (name === "plus") {
    return (
      <svg viewBox="0 0 24 24" style={common}>
        <path {...stroke} d="M12 5v14" />
        <path {...stroke} d="M5 12h14" />
      </svg>
    );
  }
  if (name === "store") {
    return (
      <svg viewBox="0 0 24 24" style={common}>
        <path {...stroke} d="M4 7h16l-1 4H5L4 7z" />
        <path {...stroke} d="M5 11v9h14v-9" />
        <path {...stroke} d="M9 20v-6h6v6" />
      </svg>
    );
  }
  if (name === "mail") {
    return (
      <svg viewBox="0 0 24 24" style={common}>
        <path {...stroke} d="M4 6h16v12H4z" />
        <path {...stroke} d="M4 7l8 6 8-6" />
      </svg>
    );
  }

  return null;
}

function Card({ children, style, className }) {
  return (
    <div
      className={className}
      style={{
        background: "rgba(255,255,255,0.92)",
        border: `1px solid rgba(0,0,0,0.08)` ,
        borderRadius: 22,
        boxShadow: "0 18px 50px rgba(0,0,0,0.08)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Pill({ active, children, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 18px",
        borderRadius: 999,
        border: `1px solid rgba(0,0,0,${active ? 0.12 : 0.08})`,
        background: active ? P.teal : "rgba(255,255,255,0.7)",
        color: active ? "#fff" : "rgba(0,0,0,0.75)",
        fontWeight: 800,
        cursor: "pointer",
        boxShadow: active ? "0 12px 30px rgba(16,113,145,0.28)" : "0 8px 20px rgba(0,0,0,0.06)",
      }}
    >
      {icon ? <span style={{ opacity: active ? 1 : 0.8 }}>{icon}</span> : null}
      {children}
    </button>
  );
}

function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: { bg: "rgba(0,0,0,0.06)", fg: "rgba(0,0,0,0.72)" },
    info: { bg: "rgba(16,113,145,0.14)", fg: P.teal },
    accent: { bg: "rgba(109,84,113,0.14)", fg: P.purple },
    good: { bg: "rgba(84,136,113,0.16)", fg: P.green },
    warn: { bg: "rgba(229,56,42,0.12)", fg: P.red },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 999,
        background: t.bg,
        color: t.fg,
        fontSize: 12,
        fontWeight: 800,
        whiteSpace: "nowrap",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </span>
  );
}

function Button({ children, onClick, variant = "teal", style, icon, disabled }) {
  const variants = {
    teal: { background: P.teal, color: "#fff", shadow: "0 14px 35px rgba(16,113,145,0.28)" },
    red: { background: P.red, color: "#fff", shadow: "0 14px 35px rgba(229,56,42,0.22)" },
    cream: { background: "rgba(254,231,179,0.95)", color: "rgba(0,0,0,0.78)", shadow: "0 14px 35px rgba(0,0,0,0.08)" },
    ghost: { background: "rgba(255,255,255,0.72)", color: "rgba(0,0,0,0.78)", shadow: "0 10px 25px rgba(0,0,0,0.06)" },
  };
  const v = variants[variant] || variants.teal;

  return (
    <button
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "12px 18px",
        borderRadius: 16,
        border: "1px solid rgba(0,0,0,0.08)",
        fontWeight: 900,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        boxShadow: v.shadow,
        ...v,
        ...style,
      }}
    >
      {icon ? icon : null}
      {children}
    </button>
  );
}

function TextInput({ value, onChange, placeholder, icon }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 14px",
        borderRadius: 16,
        border: "1px solid rgba(0,0,0,0.12)",
        background: "rgba(254,231,179,0.55)",
      }}
    >
      <span style={{ display: "inline-flex", opacity: 0.8 }}>{icon}</span>
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: 14,
          fontWeight: 700,
          color: "rgba(0,0,0,0.72)",
        }}
      />
    </div>
  );
}

function MiniLineChart({ height = 78, labelLeft = "", labelRight = "" }) {
  // Simple SVG chart for the mock.
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(0,0,0,0.55)", marginBottom: 8 }}>
        <span>{labelLeft}</span>
        <span>{labelRight}</span>
      </div>
      <svg viewBox="0 0 300 100" width="100%" height={height} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="ppfade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={P.teal} stopOpacity="0.18" />
            <stop offset="100%" stopColor={P.teal} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,35 C45,20 70,55 110,42 C150,30 180,60 220,48 C255,40 275,46 300,38"
          fill="none"
          stroke={P.teal}
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M0,100 L0,35 C45,20 70,55 110,42 C150,30 180,60 220,48 C255,40 275,46 300,38 L300,100 Z"
          fill="url(#ppfade)"
        />
        <line x1="0" y1="100" x2="300" y2="100" stroke="rgba(0,0,0,0.12)" strokeWidth="2" />
      </svg>
    </div>
  );
}

function RetailChip({ name, iconText }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        borderRadius: 18,
        background: "rgba(255,255,255,0.75)",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
        fontWeight: 900,
        color: "rgba(0,0,0,0.75)",
      }}
    >
      <span
        style={{
          width: 30,
          height: 30,
          display: "grid",
          placeItems: "center",
          borderRadius: 999,
          background: P.teal,
          color: "#fff",
          fontWeight: 900,
          fontSize: 12,
        }}
      >
        {iconText}
      </span>
      {name}
    </div>
  );
}

const DEMO_ITEMS = [
  {
    id: "airpods",
    name: "AirPods Pro (2nd Gen)",
    tag: "Audio",
    bestNow: 279,
    score: 86,
  },
  {
    id: "switch",
    name: "Nintendo Switch OLED",
    tag: "Gaming",
    bestNow: 399,
    score: 82,
  },
  {
    id: "rtx",
    name: "RTX 4070 Super (Founders-Style)",
    tag: "PC",
    bestNow: 809,
    score: 74,
  },
];

function OffersTable({ selectedItemId }) {
  // Canada-only list; Target removed.
  const rows = useMemo(() => {
    if (!selectedItemId) return [];
    if (selectedItemId === "airpods") {
      return [
        { retailer: "Walmart", price: 279, best: true },
        { retailer: "Best Buy", price: 289, best: false },
        { retailer: "Amazon", price: 294, best: false },
        { retailer: "Newegg", price: 299, best: false },
        { retailer: "Home Depot", price: null, best: false },
      ];
    }
    if (selectedItemId === "switch") {
      return [
        { retailer: "Best Buy", price: 399, best: true },
        { retailer: "Walmart", price: 409, best: false },
        { retailer: "Amazon", price: 419, best: false },
        { retailer: "Newegg", price: 429, best: false },
        { retailer: "Home Depot", price: null, best: false },
      ];
    }
    return [
      { retailer: "Newegg", price: 809, best: true },
      { retailer: "Best Buy", price: 829, best: false },
      { retailer: "Amazon", price: 849, best: false },
      { retailer: "Walmart", price: null, best: false },
      { retailer: "Home Depot", price: null, best: false },
    ];
  }, [selectedItemId]);

  return (
    <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 160px",
          background: "rgba(0,0,0,0.03)",
          padding: "12px 14px",
          fontWeight: 900,
          color: "rgba(0,0,0,0.65)",
        }}
      >
        <div>Retailer</div>
        <div style={{ textAlign: "right" }}>Current price</div>
      </div>
      {rows.map((r) => (
        <div
          key={r.retailer}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 160px",
            padding: "14px 14px",
            alignItems: "center",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            background: r.best ? "rgba(16,113,145,0.06)" : "rgba(255,255,255,0.75)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 900, color: "rgba(0,0,0,0.72)" }}>
            <Icon name="store" color="rgba(0,0,0,0.45)" />
            {r.retailer}
            {r.best ? <Badge tone="info">Best</Badge> : null}
          </div>
          <div style={{ textAlign: "right", fontWeight: 1000, color: "rgba(0,0,0,0.75)" }}>{r.price ? money(r.price) : "—"}</div>
        </div>
      ))}
    </div>
  );
}

export default function PricePulsePrototype() {
  const [tab, setTab] = useState("home");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(DEMO_ITEMS[0].id);
  const [alertMode, setAlertMode] = useState("smart");

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return DEMO_ITEMS;
    return DEMO_ITEMS.filter((x) => x.name.toLowerCase().includes(q) || x.tag.toLowerCase().includes(q));
  }, [search]);

  const selectedItem = useMemo(() => DEMO_ITEMS.find((x) => x.id === selected) || DEMO_ITEMS[0], [selected]);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "26px 18px 70px",
        background:
          "radial-gradient(1200px 500px at 20% 0%, rgba(16,113,145,0.22), rgba(0,0,0,0) 60%)," +
          "radial-gradient(900px 420px at 80% 20%, rgba(109,84,113,0.22), rgba(0,0,0,0) 60%)," +
          "linear-gradient(180deg, rgba(254,231,179,0.62), rgba(254,231,179,0.34) 55%, rgba(255,255,255,0.06))",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        {/* Top brand bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 18,
                background: P.teal,
                boxShadow: "0 18px 45px rgba(16,113,145,0.28)",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                fontWeight: 1000,
              }}
            >
              <span style={{ transform: "translateY(-1px)" }}>↘</span>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 1000, letterSpacing: -0.4, color: P.teal }}>PricePulse</div>
              <div style={{ marginTop: 2, fontSize: 13, fontWeight: 700, color: "rgba(0,0,0,0.55)" }}>
                Cross-retailer tracking · smart alerts · deal score
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Button variant="ghost" icon={<Icon name="lock" color="rgba(0,0,0,0.65)" />}>
              Sign in
            </Button>
            <Button variant="red" icon={<Icon name="plus" color="#fff" />}>
              Add tracker
            </Button>
          </div>
        </div>

        {/* Pill nav */}
        <div
          style={{
            background: "rgba(255,255,255,0.50)",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 999,
            padding: 10,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 18px 55px rgba(0,0,0,0.10)",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Pill active={tab === "home"} onClick={() => setTab("home")} icon={<Icon name="spark" color={tab === "home" ? "#fff" : "rgba(0,0,0,0.55)"} />}>
              Home
            </Pill>
            <Pill active={tab === "trackers"} onClick={() => setTab("trackers")} icon={<Icon name="search" color={tab === "trackers" ? "#fff" : "rgba(0,0,0,0.55)"} />}>
              Trackers
            </Pill>
            <Pill active={tab === "alerts"} onClick={() => setTab("alerts")} icon={<Icon name="bell" color={tab === "alerts" ? "#fff" : "rgba(0,0,0,0.55)"} />}>
              Alerts
            </Pill>
            <Pill active={tab === "dashboard"} onClick={() => setTab("dashboard")} icon={<Icon name="chart" color={tab === "dashboard" ? "#fff" : "rgba(0,0,0,0.55)"} />}>
              Dashboard
            </Pill>
            <Pill active={tab === "pricing"} onClick={() => setTab("pricing")} icon={<Icon name="zap" color={tab === "pricing" ? "#fff" : "rgba(0,0,0,0.55)"} />}>
              Pricing
            </Pill>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: 8 }}>
            <Badge tone="info">Canada V1</Badge>
            <Badge tone="neutral">Demo UI</Badge>
          </div>
        </div>

        {/* Content */}
        {tab === "home" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 22 }}>
            <Card style={{ padding: 26 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
                <Badge tone="neutral">Multi-retailer</Badge>
                <Badge tone="neutral">Smart alerts</Badge>
                <Badge tone="neutral">Anti-spam limits</Badge>
              </div>

              <div style={{ fontSize: 56, fontWeight: 1000, letterSpacing: -1.3, lineHeight: 0.95, color: P.teal }}>
                Stop guessing.
              </div>
              <div style={{ fontSize: 56, fontWeight: 1000, letterSpacing: -1.3, lineHeight: 0.95, color: P.purple, marginTop: 6 }}>
                Buy at the true best price.
              </div>

              <p style={{ marginTop: 16, maxWidth: 560, fontSize: 15, lineHeight: 1.6, color: "rgba(0,0,0,0.62)", fontWeight: 650 }}>
                Paste a product link (or search). PricePulse compares major retailers, scores the deal quality, and alerts you when it’s actually worth buying.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, marginTop: 18, alignItems: "center" }}>
                <TextInput value={search} onChange={setSearch} placeholder="Search: AirPods, Switch, RTX…" icon={<Icon name="search" />} />
                <Button variant="green" style={{ background: P.green, boxShadow: "0 14px 35px rgba(84,136,113,0.22)" }}>
                  Explore trackers
                </Button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 18 }}>
                <Card style={{ padding: 16, borderRadius: 18, background: "rgba(255,255,255,0.75)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 16, background: "rgba(109,84,113,0.12)", display: "grid", placeItems: "center" }}>
                      <Icon name="bell" color={P.purple} />
                    </div>
                    <div style={{ fontWeight: 900, color: "rgba(0,0,0,0.75)" }}>Tracked items</div>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 13, fontWeight: 750, color: "rgba(0,0,0,0.55)" }}>128,420 (demo)</div>
                </Card>
                <Card style={{ padding: 16, borderRadius: 18, background: "rgba(255,255,255,0.75)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 16, background: "rgba(16,113,145,0.12)", display: "grid", placeItems: "center" }}>
                      <Icon name="store" color={P.teal} />
                    </div>
                    <div style={{ fontWeight: 900, color: "rgba(0,0,0,0.75)" }}>Retailers</div>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 13, fontWeight: 750, color: "rgba(0,0,0,0.55)" }}>6 supported</div>
                </Card>
                <Card style={{ padding: 16, borderRadius: 18, background: "rgba(255,255,255,0.75)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 16, background: "rgba(229,56,42,0.12)", display: "grid", placeItems: "center" }}>
                      <Icon name="zap" color={P.red} />
                    </div>
                    <div style={{ fontWeight: 900, color: "rgba(0,0,0,0.75)" }}>Avg savings</div>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 13, fontWeight: 750, color: "rgba(0,0,0,0.55)" }}>14% (demo)</div>
                </Card>
              </div>

              <Card style={{ padding: 18, borderRadius: 22, marginTop: 18, background: "rgba(255,255,255,0.72)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 1000, color: "rgba(0,0,0,0.78)" }}>Today’s featured tracker</div>
                    <div style={{ marginTop: 2, fontSize: 12, fontWeight: 750, color: "rgba(0,0,0,0.52)" }}>Cross-store spread + history</div>
                  </div>
                  <Button variant="teal" style={{ padding: "10px 14px", borderRadius: 999 }}>
                    Open
                  </Button>
                </div>
                <MiniLineChart labelLeft="340" labelRight="" />
              </Card>
            </Card>

            <div style={{ display: "grid", gap: 22 }}>
              <Card style={{ padding: 22 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 46, height: 46, borderRadius: 18, background: "rgba(109,84,113,0.14)", display: "grid", placeItems: "center" }}>
                    <Icon name="bell" color={P.purple} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, letterSpacing: 1.4, fontWeight: 1000, color: "rgba(16,113,145,0.9)" }}>WHY IT’S DIFFERENT</div>
                    <div style={{ fontSize: 34, fontWeight: 1000, letterSpacing: -0.5, color: P.teal }}>Smart alerts, not spam</div>
                    <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6, fontWeight: 650, color: "rgba(0,0,0,0.6)" }}>
                      Your alerts should answer “Should I buy now?” not just “price changed.”
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                  <Card style={{ padding: 14, borderRadius: 18, background: "rgba(84,136,113,0.10)" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 1000, color: "rgba(0,0,0,0.74)" }}>
                      <Icon name="spark" color={P.green} /> Historical low
                    </div>
                    <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: "rgba(0,0,0,0.58)", lineHeight: 1.5 }}>
                      Notify only when it hits a real low (e.g., 6–12 month floor).
                    </div>
                  </Card>
                  <Card style={{ padding: 14, borderRadius: 18, background: "rgba(229,56,42,0.08)" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 1000, color: "rgba(0,0,0,0.74)" }}>
                      <Icon name="zap" color={P.red} /> Deal Score
                    </div>
                    <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: "rgba(0,0,0,0.58)", lineHeight: 1.5 }}>
                      A 0–100 score that measures how “real” the deal is.
                    </div>
                  </Card>
                  <Card style={{ padding: 14, borderRadius: 18, background: "rgba(16,113,145,0.08)" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 1000, color: "rgba(0,0,0,0.74)" }}>
                      <Icon name="mail" color={P.teal} /> Weekly digest
                    </div>
                    <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: "rgba(0,0,0,0.58)", lineHeight: 1.5 }}>
                      Automated “best deals” email to drive affiliate clicks.
                    </div>
                  </Card>
                  <Card style={{ padding: 14, borderRadius: 18, background: "rgba(0,0,0,0.03)" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 1000, color: "rgba(0,0,0,0.74)" }}>
                      <Icon name="lock" color="rgba(0,0,0,0.55)" /> Anti-bot & cache
                    </div>
                    <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: "rgba(0,0,0,0.58)", lineHeight: 1.5 }}>
                      Rate limits + caching to avoid bans and reduce costs.
                    </div>
                  </Card>
                </div>
              </Card>

              <Card style={{ padding: 22 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 46, height: 46, borderRadius: 18, background: "rgba(109,84,113,0.14)", display: "grid", placeItems: "center" }}>
                    <Icon name="search" color={P.purple} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, letterSpacing: 1.4, fontWeight: 1000, color: "rgba(16,113,145,0.9)" }}>RETAILERS</div>
                    <div style={{ fontSize: 34, fontWeight: 1000, letterSpacing: -0.5, color: P.teal }}>Track the big players</div>
                    <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6, fontWeight: 650, color: "rgba(0,0,0,0.6)" }}>
                      Start with 6–10 retailers. Add more once you’ve got a stable pipeline.
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 16 }}>
                  <RetailChip name="Amazon" iconText="A" />
                  <RetailChip name="Best Buy" iconText="B" />
                  <RetailChip name="Walmart" iconText="W" />
                  <RetailChip name="Home Depot" iconText="H" />
                  <RetailChip name="Newegg" iconText="N" />
                  <RetailChip name="Costco" iconText="C" />
                </div>
              </Card>
            </div>
          </div>
        ) : null}

        {tab === "trackers" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 22 }}>
            <Card style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 46, height: 46, borderRadius: 18, background: "rgba(109,84,113,0.14)", display: "grid", placeItems: "center" }}>
                  <Icon name="search" color={P.purple} />
                </div>
                <div>
                  <div style={{ fontSize: 12, letterSpacing: 1.4, fontWeight: 1000, color: "rgba(16,113,145,0.9)" }}>TRACKERS</div>
                  <div style={{ fontSize: 40, fontWeight: 1000, letterSpacing: -0.8, color: P.teal }}>Search & compare</div>
                  <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.6, fontWeight: 650, color: "rgba(0,0,0,0.6)" }}>
                    Pick an item to view cross-retailer spread, deal score, and price history.
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, marginTop: 16, alignItems: "center" }}>
                <TextInput value={search} onChange={setSearch} placeholder="Search items or categories…" icon={<Icon name="search" />} />
                <Button variant="red" icon={<Icon name="plus" color="#fff" />}>
                  Add tracker
                </Button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 16 }}>
                {filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    style={{
                      padding: 16,
                      borderRadius: 22,
                      background: item.id === selected ? "rgba(16,113,145,0.07)" : "rgba(255,255,255,0.75)",
                      cursor: "pointer",
                    }}
                    onClick={() => setSelected(item.id)}
                  >
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div
                        style={{
                          width: 58,
                          height: 58,
                          borderRadius: 18,
                          background:
                            "radial-gradient(60px 60px at 30% 25%, rgba(16,113,145,0.35), rgba(0,0,0,0) 65%)," +
                            "radial-gradient(70px 70px at 70% 70%, rgba(109,84,113,0.30), rgba(0,0,0,0) 70%)," +
                            "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(254,231,179,0.35))",
                          border: "1px solid rgba(0,0,0,0.08)",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 16, fontWeight: 1000, color: "rgba(0,0,0,0.78)" }}>{item.name}</div>
                        <div style={{ marginTop: 6, display: "flex", gap: 10, alignItems: "center" }}>
                          <Badge tone="neutral">{item.tag}</Badge>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "rgba(0,0,0,0.55)" }}>Best now:</span>
                          <span style={{ fontSize: 13, fontWeight: 1000, color: "rgba(0,0,0,0.78)" }}>{money(item.bestNow)}</span>
                        </div>
                      </div>
                      <Badge tone="warn">{item.score}/100</Badge>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <MiniLineChart labelLeft="" labelRight="" />
                    </div>

                    <div style={{ marginTop: 10, fontSize: 12, fontWeight: 750, color: "rgba(0,0,0,0.52)" }}>
                      Tip: set alerts for “Historical low” + “Deal Score ≥ 80”.
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            <Card style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 46, height: 46, borderRadius: 18, background: "rgba(109,84,113,0.14)", display: "grid", placeItems: "center" }}>
                  <Icon name="chart" color={P.purple} />
                </div>
                <div>
                  <div style={{ fontSize: 12, letterSpacing: 1.4, fontWeight: 1000, color: "rgba(16,113,145,0.9)" }}>DETAILS</div>
                  <div style={{ fontSize: 40, fontWeight: 1000, letterSpacing: -0.8, color: P.teal }}>Selected item</div>
                  <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.6, fontWeight: 650, color: "rgba(0,0,0,0.6)" }}>
                    Compare prices by retailer and view full history.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 14 }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    background:
                      "radial-gradient(70px 70px at 30% 25%, rgba(16,113,145,0.35), rgba(0,0,0,0) 65%)," +
                      "radial-gradient(70px 70px at 70% 70%, rgba(109,84,113,0.30), rgba(0,0,0,0) 70%)," +
                      "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(254,231,179,0.35))",
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 1000, color: "rgba(0,0,0,0.78)" }}>{selectedItem.name}</div>
                  <div style={{ marginTop: 4, fontSize: 13, fontWeight: 800, color: "rgba(0,0,0,0.55)" }}>MSRP: {money(selectedItem.bestNow + 20)}</div>
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <OffersTable selectedItemId={selectedItem.id} />
              </div>
            </Card>
          </div>
        ) : null}

        {tab === "alerts" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
            <Card style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 46, height: 46, borderRadius: 18, background: "rgba(109,84,113,0.14)", display: "grid", placeItems: "center" }}>
                  <Icon name="bell" color={P.purple} />
                </div>
                <div>
                  <div style={{ fontSize: 12, letterSpacing: 1.4, fontWeight: 1000, color: "rgba(16,113,145,0.9)" }}>ALERTS</div>
                  <div style={{ fontSize: 40, fontWeight: 1000, letterSpacing: -0.8, color: P.teal }}>Smart alert builder</div>
                  <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.6, fontWeight: 650, color: "rgba(0,0,0,0.6)" }}>
                    Choose the signal you actually care about.
                  </div>
                </div>
              </div>

              <Card style={{ padding: 16, borderRadius: 22, marginTop: 16, background: "rgba(255,255,255,0.75)" }}>
                <div style={{ fontSize: 14, fontWeight: 1000, color: "rgba(0,0,0,0.75)" }}>Alert type</div>
                <div style={{ marginTop: 4, fontSize: 12, fontWeight: 750, color: "rgba(0,0,0,0.55)" }}>Switch between simple drops and smart logic.</div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                  <Button variant={alertMode === "simple" ? "teal" : "ghost"} onClick={() => setAlertMode("simple")}>
                    Simple
                  </Button>
                  <Button variant={alertMode === "smart" ? "cream" : "ghost"} onClick={() => setAlertMode("smart")}>
                    Smart
                  </Button>
                </div>

                <div style={{ marginTop: 16, fontSize: 14, fontWeight: 1000, color: "rgba(0,0,0,0.75)" }}>Smart conditions</div>

                <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                  {["Historical low (6–12 months)", "Deal Score ≥ 80", "Restock detected", "Price undercuts competitor by ≥ 5%"].map((t, idx) => (
                    <div
                      key={t}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 14px",
                        borderRadius: 18,
                        border: "1px solid rgba(0,0,0,0.08)",
                        background: "rgba(255,255,255,0.75)",
                        fontWeight: 850,
                        color: "rgba(0,0,0,0.68)",
                      }}
                    >
                      {t}
                      <input type="checkbox" defaultChecked={idx < 2} style={{ width: 18, height: 18, accentColor: P.teal }} />
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 14 }}>
                  <Button variant="teal" style={{ width: "100%" }}>
                    Save smart alert
                  </Button>
                  <div style={{ marginTop: 10, fontSize: 12, fontWeight: 750, color: "rgba(0,0,0,0.52)" }}>
                    Smart alerts reduce noise and increase affiliate conversion.
                  </div>
                </div>
              </Card>
            </Card>

            <Card style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 46, height: 46, borderRadius: 18, background: "rgba(109,84,113,0.14)", display: "grid", placeItems: "center" }}>
                  <Icon name="mail" color={P.purple} />
                </div>
                <div>
                  <div style={{ fontSize: 12, letterSpacing: 1.4, fontWeight: 1000, color: "rgba(16,113,145,0.9)" }}>OUTPUT</div>
                  <div style={{ fontSize: 40, fontWeight: 1000, letterSpacing: -0.8, color: P.teal }}>What a great alert looks like</div>
                  <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.6, fontWeight: 650, color: "rgba(0,0,0,0.6)" }}>
                    This is the email/push format you want for high clicks and trust.
                  </div>
                </div>
              </div>

              <Card
                style={{
                  padding: 18,
                  borderRadius: 22,
                  marginTop: 16,
                  background: "rgba(254,231,179,0.7)",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, letterSpacing: 1.6, fontWeight: 1000, color: "rgba(16,113,145,0.9)" }}>PRICEPULSE ALERT</div>
                    <div style={{ fontSize: 26, fontWeight: 1000, color: P.teal, marginTop: 6 }}>Deal Score 86 — Historical Low</div>
                    <div style={{ marginTop: 6, fontSize: 14, fontWeight: 750, color: "rgba(0,0,0,0.62)" }}>AirPods Pro (2nd Gen) hit a 6-month low.</div>
                  </div>
                  <div style={{ padding: "10px 12px", borderRadius: 999, background: "rgba(229,56,42,0.14)", color: P.red, fontWeight: 1000 }}>
                    -15%
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
                  <Card style={{ padding: 14, borderRadius: 18, background: "rgba(255,255,255,0.75)" }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: "rgba(0,0,0,0.55)" }}>Best price now</div>
                    <div style={{ marginTop: 6, fontSize: 24, fontWeight: 1000, color: P.teal }}>{money(279)}</div>
                    <div style={{ marginTop: 4, fontSize: 12, fontWeight: 750, color: "rgba(0,0,0,0.55)" }}>Amazon · ships today</div>
                  </Card>
                  <Card style={{ padding: 14, borderRadius: 18, background: "rgba(255,255,255,0.75)" }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: "rgba(0,0,0,0.55)" }}>Why we pinged you</div>
                    <div style={{ marginTop: 6, fontSize: 16, fontWeight: 1000, color: "rgba(0,0,0,0.75)" }}>Lowest since Nov</div>
                    <div style={{ marginTop: 4, fontSize: 12, fontWeight: 750, color: "rgba(0,0,0,0.55)" }}>Volatility high · good buy window</div>
                  </Card>
                </div>

                <div style={{ marginTop: 14 }}>
                  <Button variant="teal" style={{ width: "100%", borderRadius: 18 }}>
                    View best price (affiliate link)
                  </Button>
                  <div style={{ marginTop: 10, fontSize: 12, fontWeight: 750, color: "rgba(0,0,0,0.55)" }}>
                    Tip: include 2 alternatives to build trust (e.g., “Best Buy {money(289)}”, “Costco {money(284)}”).
                  </div>
                </div>
              </Card>

              <Card style={{ padding: 18, borderRadius: 22, marginTop: 14, background: "rgba(255,255,255,0.70)" }}>
                <div style={{ fontSize: 14, fontWeight: 1000, color: "rgba(0,0,0,0.75)" }}>Automation ideas (money makers)</div>
                <ul style={{ marginTop: 10, paddingLeft: 18, color: "rgba(0,0,0,0.62)", fontWeight: 750, lineHeight: 1.7, fontSize: 13 }}>
                  <li>Weekly “Best Deals” newsletter → affiliate + sponsor slots.</li>
                  <li>Drop alerts (Nike/Adidas) → paid Pro feature.</li>
                  <li>Reseller exports (CSV) → Business tier.</li>
                </ul>
              </Card>
            </Card>
          </div>
        ) : null}

        {tab === "dashboard" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 22 }}>
            <Card style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 46, height: 46, borderRadius: 18, background: "rgba(109,84,113,0.14)", display: "grid", placeItems: "center" }}>
                  <Icon name="chart" color={P.purple} />
                </div>
                <div>
                  <div style={{ fontSize: 12, letterSpacing: 1.4, fontWeight: 1000, color: "rgba(16,113,145,0.9)" }}>DASHBOARD</div>
                  <div style={{ fontSize: 40, fontWeight: 1000, letterSpacing: -0.8, color: P.teal }}>Price intelligence</div>
                  <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.6, fontWeight: 650, color: "rgba(0,0,0,0.6)" }}>
                    A pro look instantly makes the product feel more valuable.
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 16 }}>
                <Card style={{ padding: 16, borderRadius: 22, background: "rgba(255,255,255,0.75)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 18, background: "rgba(229,56,42,0.12)", display: "grid", placeItems: "center" }}>
                      <Icon name="zap" color={P.red} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 1000, color: "rgba(0,0,0,0.78)" }}>Deal score avg</div>
                      <div style={{ marginTop: 4, fontWeight: 850, color: "rgba(0,0,0,0.55)" }}>72/100</div>
                    </div>
                  </div>
                </Card>
                <Card style={{ padding: 16, borderRadius: 22, background: "rgba(255,255,255,0.75)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 18, background: "rgba(16,113,145,0.12)", display: "grid", placeItems: "center" }}>
                      <Icon name="bell" color={P.teal} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 1000, color: "rgba(0,0,0,0.78)" }}>Alerts armed</div>
                      <div style={{ marginTop: 4, fontWeight: 850, color: "rgba(0,0,0,0.55)" }}>12 active</div>
                    </div>
                  </div>
                </Card>
                <Card style={{ padding: 16, borderRadius: 22, background: "rgba(255,255,255,0.75)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 18, background: "rgba(84,136,113,0.16)", display: "grid", placeItems: "center" }}>
                      <Icon name="store" color={P.green} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 1000, color: "rgba(0,0,0,0.78)" }}>Retailers checked</div>
                      <div style={{ marginTop: 4, fontWeight: 850, color: "rgba(0,0,0,0.55)" }}>6 enabled</div>
                    </div>
                  </div>
                </Card>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
                <Card style={{ padding: 18, borderRadius: 22, background: "rgba(255,255,255,0.75)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 1000, color: "rgba(0,0,0,0.78)" }}>Volatility</div>
                      <div style={{ marginTop: 4, fontWeight: 750, color: "rgba(0,0,0,0.55)" }}>More volatility = bigger deal windows</div>
                    </div>
                    <Badge tone="accent">30 days</Badge>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <MiniLineChart />
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, fontWeight: 750, color: "rgba(0,0,0,0.52)" }}>
                    Next step: compute volatility from real data.
                  </div>
                </Card>

                <Card style={{ padding: 18, borderRadius: 22, background: "rgba(255,255,255,0.75)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 1000, color: "rgba(0,0,0,0.78)" }}>Buy now vs wait</div>
                    <Badge tone="warn">Recommend</Badge>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 13, fontWeight: 800, color: "rgba(0,0,0,0.58)" }}>Signal</div>
                  <div style={{ marginTop: 6, fontSize: 18, fontWeight: 1000, color: "rgba(0,0,0,0.78)" }}>Seasonality window opening</div>
                  <div style={{ marginTop: 10, fontSize: 13, fontWeight: 750, color: "rgba(0,0,0,0.58)", lineHeight: 1.6 }}>
                    Based on historical cycles, price is near the floor. Odds of a further drop in the next 14 days are low.
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, fontWeight: 750, color: "rgba(0,0,0,0.52)" }}>
                    (Later: real model; for now: rules + history.)
                  </div>
                </Card>
              </div>
            </Card>

            <Card style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 46, height: 46, borderRadius: 18, background: "rgba(109,84,113,0.14)", display: "grid", placeItems: "center" }}>
                  <Icon name="chart" color={P.purple} />
                </div>
                <div>
                  <div style={{ fontSize: 12, letterSpacing: 1.4, fontWeight: 1000, color: "rgba(16,113,145,0.9)" }}>EXPORTS</div>
                  <div style={{ fontSize: 40, fontWeight: 1000, letterSpacing: -0.8, color: P.teal }}>For resellers</div>
                  <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.6, fontWeight: 650, color: "rgba(0,0,0,0.6)" }}>
                    This is a killer paid feature: bulk tracking + exports.
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                {[{ t: "Bulk trackers", d: "Upload CSV, watch 100+ SKUs, auto-alert on margin." }, { t: "Resale margin calculator", d: "Fees + shipping + tax → tells you if it’s worth flipping." }, { t: "API access", d: "Let power users pipe alerts into Discord, Slack, etc." }].map((x) => (
                  <Card key={x.t} style={{ padding: 16, borderRadius: 22, background: "rgba(254,231,179,0.55)" }}>
                    <div style={{ fontWeight: 1000, color: "rgba(0,0,0,0.78)" }}>{x.t}</div>
                    <div style={{ marginTop: 6, fontWeight: 750, color: "rgba(0,0,0,0.58)", lineHeight: 1.6, fontSize: 13 }}>{x.d}</div>
                  </Card>
                ))}
              </div>

              <div style={{ marginTop: 16 }}>
                <Button variant="red" style={{ width: "100%", borderRadius: 18 }}>
                  See pricing
                </Button>
              </div>
            </Card>
          </div>
        ) : null}

        {tab === "pricing" ? (
          <Card style={{ padding: 24 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 46, height: 46, borderRadius: 18, background: "rgba(109,84,113,0.14)", display: "grid", placeItems: "center" }}>
                <Icon name="zap" color={P.purple} />
              </div>
              <div>
                <div style={{ fontSize: 12, letterSpacing: 1.4, fontWeight: 1000, color: "rgba(16,113,145,0.9)" }}>PRICING</div>
                <div style={{ fontSize: 44, fontWeight: 1000, letterSpacing: -0.9, color: P.teal }}>Monetize beyond affiliates</div>
                <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.6, fontWeight: 650, color: "rgba(0,0,0,0.6)" }}>
                  Free gets users. Pro makes money. Business is the scaling lever.
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 18 }}>
              <Card style={{ padding: 18, borderRadius: 26, background: "rgba(255,255,255,0.75)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 1000, color: "rgba(0,0,0,0.78)" }}>Free</div>
                  <Badge tone="neutral">$0</Badge>
                </div>
                <div style={{ marginTop: 10, fontWeight: 750, color: "rgba(0,0,0,0.55)" }}>For getting started</div>
                <ul style={{ marginTop: 14, paddingLeft: 18, color: "rgba(0,0,0,0.62)", fontWeight: 750, lineHeight: 1.8, fontSize: 13 }}>
                  <li>Track up to 5 items</li>
                  <li>Basic price drop alerts</li>
                  <li>Retailer comparison</li>
                  <li>Affiliate links</li>
                </ul>
                <div style={{ marginTop: 16 }}>
                  <Button variant="green" style={{ width: "100%", background: P.green, boxShadow: "0 14px 35px rgba(84,136,113,0.22)" }}>
                    Start tracking
                  </Button>
                  <div style={{ marginTop: 10, fontSize: 12, fontWeight: 750, color: "rgba(0,0,0,0.52)" }}>Affiliate links supported.</div>
                </div>
              </Card>

              <Card
                style={{
                  padding: 18,
                  borderRadius: 26,
                  background: "rgba(255,255,255,0.75)",
                  outline: `2px solid rgba(16,113,145,0.55)` ,
                  boxShadow: "0 24px 70px rgba(16,113,145,0.20)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 1000, color: "rgba(0,0,0,0.78)" }}>Pro</div>
                  <Badge tone="info">Most popular</Badge>
                </div>
                <div style={{ marginTop: 10, fontWeight: 750, color: "rgba(0,0,0,0.55)" }}>For power users</div>
                <div style={{ marginTop: 12, fontSize: 18, fontWeight: 1000, color: "rgba(0,0,0,0.78)" }}>
                  $7 / mo
                </div>
                <ul style={{ marginTop: 14, paddingLeft: 18, color: "rgba(0,0,0,0.62)", fontWeight: 750, lineHeight: 1.8, fontSize: 13 }}>
                  <li>Unlimited trackers</li>
                  <li>Smart alerts (historical low, deal score)</li>
                  <li>Price history + exports</li>
                  <li>No ads + faster refresh</li>
                </ul>
                <div style={{ marginTop: 16 }}>
                  <Button variant="teal" style={{ width: "100%" }}>
                    Go Pro
                  </Button>
                  <div style={{ marginTop: 10, fontSize: 12, fontWeight: 750, color: "rgba(0,0,0,0.52)" }}>Cancel anytime.</div>
                </div>
              </Card>

              <Card style={{ padding: 18, borderRadius: 26, background: "rgba(255,255,255,0.75)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 1000, color: "rgba(0,0,0,0.78)" }}>Business</div>
                  <Badge tone="warn">$29 / mo</Badge>
                </div>
                <div style={{ marginTop: 10, fontWeight: 750, color: "rgba(0,0,0,0.55)" }}>For resellers & teams</div>
                <ul style={{ marginTop: 14, paddingLeft: 18, color: "rgba(0,0,0,0.62)", fontWeight: 750, lineHeight: 1.8, fontSize: 13 }}>
                  <li>Bulk tracking (CSV)</li>
                  <li>Margin calculator</li>
                  <li>API access</li>
                  <li>Team accounts</li>
                </ul>
                <div style={{ marginTop: 16 }}>
                  <Button variant="red" style={{ width: "100%" }}>
                    Scale tracking
                  </Button>
                  <div style={{ marginTop: 10, fontSize: 12, fontWeight: 750, color: "rgba(0,0,0,0.52)" }}>Cancel anytime.</div>
                </div>
              </Card>
            </div>
          </Card>
        ) : null}

        {/* Mobile fallback */}
        <div style={{ marginTop: 18, fontSize: 12, fontWeight: 750, color: "rgba(0,0,0,0.5)" }}>
          Tip: if something looks squished on mobile, we’ll add responsive breakpoints next.
        </div>
      </div>

      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; }
        button { font-family: inherit; }
      `}</style>
    </div>
  );
}
