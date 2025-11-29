import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { differenceInMonths } from "date-fns";

// normalize base date: prefer createdAt -> date -> ObjectId timestamp
function getBaseDate(doc){
  if (doc.createdAt) {
    const d = new Date(doc.createdAt);
    if (!isNaN(d)) return d;
  }
  if (doc.date) {
    const d = new Date(doc.date);
    if (!isNaN(d)) return d;
  }
  if (doc._id) {
    const ts = parseInt(doc._id.toString().substring(0,8), 16) * 1000;
    const d = new Date(ts);
    if (!isNaN(d)) return d;
  }
  return null;
}

export async function GET() {
  const { db } = await connectDB();
  const all = await db.collection("reports").find().sort({ _id: -1 }).toArray();
  const total = all.length;

  const group6 = []; // all normal-cleaning customers (6-month cycle)
  const group8 = []; // all deep-cleaning customers (8-month cycle)
  let due6 = 0, due8 = 0;

  for (const r of all) {
    const base = getBaseDate(r);
    if (!base) continue;

    const months = differenceInMonths(new Date(), base);
    const isDeep = r.cleaning === "deep";

    // group
    if (isDeep) group8.push(r); else group6.push(r);

    // due counters
    if (isDeep && months >= 8) due8++;
    if (!isDeep && months >= 6) due6++;
  }

  const recent = all.slice(0, 8);

  // Cards will use due6/due8; modal will use group6/group8 (full lists)
  return NextResponse.json({
    total,
    recent,
    due6,
    due8,
    group6,
    group8,
  });
}
