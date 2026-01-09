import { searchAllRetailers } from "../../../lib/search";

export const runtime = "nodejs";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const limit = Math.min(25, Math.max(1, Number(searchParams.get("limit") || 12)));

  if (!q) {
    return Response.json({ ok: false, error: "Missing q" }, { status: 400 });
  }

  try {
    const data = await searchAllRetailers({ query: q, country: "CA", limit });
    return Response.json({ ok: true, query: q, ...data });
  } catch (err) {
    return Response.json(
      { ok: false, error: err?.message || "Search failed" },
      { status: 500 }
    );
  }
}
