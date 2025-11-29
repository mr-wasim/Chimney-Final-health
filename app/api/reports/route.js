import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import QRCode from "qrcode";

function isBlank(v) {
  return v === undefined || v === null || String(v).trim() === "";
}

function toNumber(n, def = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : def;
}

export async function GET(req) {
  try {
    const { db } = await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("pageSize") || 20);

    const total = await db.collection("reports").countDocuments();
    const items = await db
      .collection("reports")
      .find()
      .sort({ _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    return NextResponse.json({ ok: true, total, items });
  } catch (err) {
    console.error("🔥 GET /api/reports:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
    }

    const clientName = (body.clientName || "").trim();
    const clientPhone = (body.clientPhone || "").trim();
    const address = (body.address || "").trim();
    const model = (body.model || "").trim();

    let product = (body.product || "").toLowerCase().trim();
    if (!["chimney", "hob"].includes(product)) product = "chimney";

    let dateStr = body.date;
    if (isBlank(dateStr)) {
      const d = new Date();
      dateStr = d.toISOString().slice(0, 10);
    }

    let cleaning = (body.cleaning || "normal").toLowerCase().trim();
    if (!["normal", "deep"].includes(cleaning)) cleaning = "normal";

    if (isBlank(clientName))
      return NextResponse.json(
        { ok: false, error: "Missing field: clientName" },
        { status: 400 }
      );
    if (isBlank(clientPhone))
      return NextResponse.json(
        { ok: false, error: "Missing field: clientPhone" },
        { status: 400 }
      );
    if (isBlank(address))
      return NextResponse.json(
        { ok: false, error: "Missing field: address" },
        { status: 400 }
      );

    const { db } = await connectDB();

    const exists = await db.collection("reports").findOne({
      clientName,
      clientPhone,
      address,
    });

    if (exists) {
      return NextResponse.json(
        { ok: false, error: "Already created report for this customer." },
        { status: 409 }
      );
    }

    // ------------ DURATION & DECAY CONFIG ------------
    // body.duration expected: "6" | "9" | "12" | "testing"
    const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

    let duration = (body.duration || "6").toString();
    let decayMs = 6 * MONTH_MS;

    if (duration === "9") decayMs = 9 * MONTH_MS;
    else if (duration === "12") decayMs = 12 * MONTH_MS;
    else if (duration === "testing") {
      // EXACT 5 minutes
      decayMs = 5 * 60 * 1000;
    }

    const durationMonths = decayMs / MONTH_MS;
    // ------------------------------------------------

    const now = new Date();

    // ---- DATA STORAGE ----
    const doc = {
      clientName,
      clientPhone,
      address,
      product,
      model,
      date: dateStr,
      cleaning,
      scans: 0,
      createdAt: now,
      updatedAt: now,

      // decay config
      duration,       // "6" | "9" | "12" | "testing"
      durationMonths, // approx months
      decayMs,        // exact milliseconds life
      healthStartAt: now,

      // Chimney fields
      pcbHealth: toNumber(body.pcbHealth),
      blowerHealth: toNumber(body.blowerHealth),
      suctionHealth: toNumber(body.suctionHealth),
      structureHealth: toNumber(body.structureHealth),
      motorHealth: toNumber(body.motorHealth),
      filterHealth: toNumber(body.filterHealth),

      // Hob fields
      flameBurnerHealth: toNumber(body.flameBurnerHealth),
      ignitionHealth: toNumber(body.ignitionHealth),
      jetHealth: toNumber(body.jetHealth),
    };

    const res = await db.collection("reports").insertOne(doc);
    const id = res.insertedId.toString();
    const base = process.env.NEXT_PUBLIC_BASE_URL || "https://chimney-final-health.vercel.app/";
    const reportUrl = `${base}/r/${id}`;

    const qrDataUrl = await QRCode.toDataURL(reportUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      scale: 6,
    });

    return NextResponse.json({
      ok: true,
      id,
      reportUrl,
      qrDataUrl,
      subtitle: `${doc.clientName} • ${doc.product} (${doc.model || "N/A"}) • ${new Date(
        doc.date
      ).toLocaleDateString()}`,
    });
  } catch (err) {
    console.error("🔥 POST /api/reports:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
