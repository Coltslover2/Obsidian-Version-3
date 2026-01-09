export const runtime = "nodejs";

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const url = (body?.url || "").trim();
  const targetPrice = typeof body?.targetPrice === "number" ? body.targetPrice : null;

  if (!url) {
    return Response.json({ ok: false, error: "Missing url" }, { status: 400 });
  }

  // TODO: persist to DB (Supabase/Neon) and enqueue a background job.
  // For now we return a stub so the endpoint is callable.
  return Response.json({
    ok: true,
    watchId: `watch_${Math.random().toString(36).slice(2)}`,
    url,
    targetPrice,
  });
}
