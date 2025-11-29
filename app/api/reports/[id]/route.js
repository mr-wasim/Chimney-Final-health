import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { ObjectId } from "mongodb";

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

/** PUT /api/reports/[id] */
export async function PUT(req, { params }) {
  const { id } = params;

  try {
    const { db } = await connectDB();
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid ObjectId" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
    }

    if (body._id) delete body._id;

    // Duration update handling
    let duration = (body.duration || "6").toString();
    let decayMs = 6 * MONTH_MS;
    if (duration === "9") decayMs = 9 * MONTH_MS;
    else if (duration === "12") decayMs = 12 * MONTH_MS;
    else if (duration === "testing") decayMs = 5 * 60 * 1000;

    const durationMonths = decayMs / MONTH_MS;

    const toNumber = (value) => {
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    };

    const existing = await db.collection("reports").findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Report not found" }, { status: 404 });
    }

    const now = new Date();

    const updateData = {
      clientName: body.clientName ?? existing.clientName,
      clientPhone: body.clientPhone ?? existing.clientPhone,
      address: body.address ?? existing.address,
      product: body.product ?? existing.product,
      date: body.date ?? existing.date,
      cleaning: body.cleaning ?? existing.cleaning,
      model: body.model ?? existing.model,

      duration,
      durationMonths,
      decayMs,

      // RESET DECAY WHENEVER ADMIN UPDATES HEALTH
      healthStartAt: new Date(),

      createdAt: existing.createdAt || now,
      updatedAt: now,

      pcbHealth: toNumber(body.pcbHealth ?? existing.pcbHealth),
      blowerHealth: toNumber(body.blowerHealth ?? existing.blowerHealth),
      suctionHealth: toNumber(body.suctionHealth ?? existing.suctionHealth),
      structureHealth: toNumber(body.structureHealth ?? existing.structureHealth),
      motorHealth: toNumber(body.motorHealth ?? existing.motorHealth),
      filterHealth: toNumber(body.filterHealth ?? existing.filterHealth),

      flameBurnerHealth: toNumber(body.flameBurnerHealth ?? existing.flameBurnerHealth),
      ignitionHealth: toNumber(body.ignitionHealth ?? existing.ignitionHealth),
      jetHealth: toNumber(body.jetHealth ?? existing.jetHealth),
    };

    const result = await db
      .collection("reports")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    return NextResponse.json({ ok: true, modified: result.modifiedCount });
  } catch (err) {
    console.error("🔥 PUT /api/reports/[id]:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

/** GET /api/reports/[id] */
export async function GET(_req, { params }) {
  const { id } = params;
  try {
    const { db } = await connectDB();
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid ID" }, { status: 400 });
    }
    const report = await db.collection("reports").findOne({ _id: new ObjectId(id) });
    if (!report) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

    report._id = report._id.toString();

    if (!report.createdAt) {
      const ts = parseInt(report._id.substring(0, 8), 16) * 1000;
      report.createdAt = new Date(ts);
    }

    if (!report.duration) report.duration = "6";
    if (!report.durationMonths) report.durationMonths = 6;
    if (!report.decayMs) report.decayMs = report.durationMonths * MONTH_MS;
    if (!report.healthStartAt) report.healthStartAt = report.createdAt;

    return NextResponse.json(report);
  } catch (err) {
    console.error("🔥 GET /api/reports/[id]:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
