"use client";
import Header from "../../components/Header";
import Link from "next/link";
import { useEffect, useState } from "react";
import { addMonths } from "date-fns";

export const dynamic = "force-dynamic";

export default function AdminHome() {
  const [data, setData] = useState({
    total: 0,
    recent: [],
    due6: 0,
    due8: 0,
    group6: [],
    group8: [],
  });
  const [view, setView] = useState(null); // "6" | "8" | null
  const [now, setNow] = useState(new Date());

  // tick for small UI bits (not the countdown — that runs per card)
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // fetch dashboard payload
  useEffect(() => {
    fetch("/api/reports/all")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <main>
      <Header title="Admin CRM" />
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="whatsapp-card p-4">
            <div className="text-white/70">Total Customers</div>
            <div className="text-3xl font-bold">{data.total}</div>
          </div>

          {/* 6-month card: count shows DUE; click shows FULL 6-month cycle list */}
          <button
            onClick={() => setView("6")}
            className="whatsapp-card p-4 hover:scale-105 transition-transform text-left"
          >
            <div className="text-white/70">6 Month Due</div>
            <div className="text-3xl font-bold">{data.due6 || 0}</div>
            <div className="text-xs text-white/40 mt-1">
              Cycle customers: {data.group6?.length || 0}
            </div>
          </button>

          {/* 8-month card */}
          <button
            onClick={() => setView("8")}
            className="whatsapp-card p-4 hover:scale-105 transition-transform text-left"
          >
            <div className="text-white/70">8 Month Due</div>
            <div className="text-3xl font-bold">{data.due8 || 0}</div>
            <div className="text-xs text-white/40 mt-1">
              Cycle customers: {data.group8?.length || 0}
            </div>
          </button>
        </div>

        {/* Recent Customers */}
        <div className="whatsapp-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Recent Customers</div>
            <Link href="/admin/customers" className="btn-outline">
              View All
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {data.recent.map((r) => (
              <Link
                key={r._id}
                href={`/admin/customers/${r._id}`}
                className="whatsapp-card p-3 hover:border-white/30"
              >
                <div className="font-semibold">{r.clientName}</div>
                <div className="text-white/70 text-sm">
                  {r.clientPhone} · {r.address}
                </div>
                <div className="text-white/50 text-xs">Scans: {r.scans || 0}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: FULL cycle list with live countdowns */}
      {view && (
        <DueModal
          type={view}
          list={view === "6" ? data.group6 || [] : data.group8 || []}
          onClose={() => setView(null)}
        />
      )}
    </main>
  );
}

/* ================== MODAL (cycle list) ================== */
function DueModal({ type, list, onClose }) {
  const title = type === "6" ? "6-Month Cycle Customers" : "8-Month Cycle Customers";
  const limitMonths = type === "6" ? 6 : 8;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#111827] rounded-2xl w-full max-w-5xl p-6 shadow-lg border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>

        {(!list || list.length === 0) && (
          <div className="text-center text-white/60 py-10">🎉 No customers yet!</div>
        )}

        <div className="max-h-[70vh] overflow-y-auto space-y-3">
          {list.map((r) => (
            <div
              key={r._id}
              className="whatsapp-card p-4 flex justify-between items-center hover:border-white/20"
            >
              <div>
                <div className="font-semibold">{r.clientName}</div>
                <div className="text-white/60 text-sm">
                  {r.product} {r.clientPhone ? `• ${r.clientPhone}` : ""}
                </div>
                <div className="text-white/40 text-xs">
                  Since: {formatSafeDate(r.createdAt || r.date || r._id)}
                </div>
              </div>

              {/* LIVE countdown till next service window */}
              <Countdown
                startDate={r.createdAt || r.date || r._id}
                limitMonths={limitMonths}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================== HELPERS ================== */
function formatSafeDate(d) {
  const date = toDateSafe(d);
  return date ? date.toLocaleDateString() : "-";
}

function toDateSafe(val) {
  if (!val) return null;
  try {
    if (val instanceof Date) return val;
    if (typeof val === "string") {
      const d = new Date(val);
      if (!isNaN(d)) return d;
      // if it looks like ObjectId
      if (val.length === 24) {
        const ts = parseInt(val.substring(0, 8), 16) * 1000;
        const d2 = new Date(ts);
        if (!isNaN(d2)) return d2;
      }
    }
    // Mongo extended JSON
    if (val && val.$date) {
      const d = new Date(val.$date);
      if (!isNaN(d)) return d;
    }
  } catch {}
  return null;
}

/* ================== LIVE COUNTDOWN (per card) ================== */
function Countdown({ startDate, limitMonths }) {
  const start = toDateSafe(startDate) || new Date();
  const expire = addMonths(start, limitMonths);

  const [timeLeft, setTimeLeft] = useState(expire - new Date());

  // tick every second – smooth CRM feel
  useEffect(() => {
    const tick = setInterval(() => {
      setTimeLeft(expire - new Date());
    }, 1000);
    return () => clearInterval(tick);
  }, [expire]);

  // breakdown
  const totalSec = Math.max(0, Math.floor(timeLeft / 1000));
  const expired = totalSec <= 0;

  // months approx by 30d buckets for UI; backend logic already correct for due counters
  const monthsLeft = Math.floor(totalSec / (30 * 24 * 3600));
  const daysLeft = Math.floor((totalSec % (30 * 24 * 3600)) / (24 * 3600));
  const hoursLeft = Math.floor((totalSec % (24 * 3600)) / 3600);
  const minsLeft = Math.floor((totalSec % 3600) / 60);
  const secsLeft = totalSec % 60;

  const formatted = expired
    ? "⚠️ Service Due!"
    : `${monthsLeft}m ${daysLeft}d ${hoursLeft}h ${minsLeft}m ${secsLeft}s`;

  return (
    <div
      className={`text-sm px-3 py-1 rounded-lg font-medium min-w-[200px] text-center transition-all ${
        expired
          ? "bg-red-600/30 text-red-400 animate-pulse"
          : "bg-green-600/20 text-green-300"
      }`}
      title={`Expires on: ${expire.toLocaleString()}`}
    >
      {formatted}
    </div>
  );
}
