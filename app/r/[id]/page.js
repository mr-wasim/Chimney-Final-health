"use client";
import { useEffect, useRef, useState } from "react";
import ProgressCircle from "../../../components/ProgressCircle";
import { warrantyExpired } from "../../../lib/utils";
import QRCode from "qrcode";
import html2canvas from "html2canvas";

// 🔥 Time-based natural decay using report.decayMs / durationMonths / healthStartAt
function getDecayedPercent(baseValue, report) {
  const base = Number(baseValue || 0);
  if (!Number.isFinite(base) || base <= 0) return 0;

  const start = report.healthStartAt
    ? new Date(report.healthStartAt)
    : report.createdAt
    ? new Date(report.createdAt)
    : report.date
    ? new Date(report.date)
    : new Date();

  const now = new Date();
  const elapsedMs = now.getTime() - start.getTime();
  if (elapsedMs <= 0) return Math.round(base);

  const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
  let totalMs;

  if (report.decayMs && Number(report.decayMs) > 0) {
    totalMs = Number(report.decayMs);
  } else if (report.durationMonths) {
    totalMs = Number(report.durationMonths) * MONTH_MS;
  } else {
    totalMs = 6 * MONTH_MS;
  }

  if (!Number.isFinite(totalMs) || totalMs <= 0) return Math.round(base);

  const progress = Math.min(elapsedMs / totalMs, 1); // 0..1

  // Smooth easing: start slow, end a bit faster
  const t = Math.pow(progress, 1.5);

  // Natural stop: ~4% of base, between 1 and 5
  let min = Math.round(base * 0.04);
  if (min < 1) min = 1;
  if (min > 5) min = 5;

  const current = base - (base - min) * t;
  const rounded = Math.round(current);

  if (rounded < min) return min;
  if (rounded > base) return base;
  return rounded;
}

export default function ReportPage({ params }) {
  const { id } = params;
  const [report, setReport] = useState(null);
  const [qrImage, setQrImage] = useState("");
  const warrantyRef = useRef();

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/reports/${id}`);
      const data = await res.json();
      setReport(data);

      const qrUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://chimney-final-health.vercel.app/"}/r/${id}`;
      const qr = await QRCode.toDataURL(qrUrl, {
        scale: 8,
        margin: 1,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
      setQrImage(qr);
    })();
  }, [id]);

  if (!report)
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
        <div className="p-6 bg-white/10 rounded-3xl backdrop-blur-xl border border-white/10 animate-pulse">
          Loading Report...
        </div>
      </main>
    );

  const { product, date, cleaning } = report;

  const metrics =
    product === "chimney"
      ? [
          ["PCB Health", report.pcbHealth],
          ["Blower Health", report.blowerHealth],
          ["Suction Health", report.suctionHealth],
          ["Product Structure Health", report.structureHealth],
          ["Motor Health", report.motorHealth],
          ["Filter Health", report.filterHealth],
        ]
      : [
          ["Flame Burner Health", report.flameBurnerHealth],
          ["Ignition Health", report.ignitionHealth],
          ["Jet Health", report.jetHealth],
        ];

  const baseScore = Math.round(
    metrics.reduce((s, [, v]) => s + Number(v || 0), 0) / metrics.length
  );
  const liveScore = getDecayedPercent(baseScore, report);
  const warn = liveScore <= 20;
  const critical = liveScore <= 10;
  const warrantyOver = warrantyExpired(date);

  const handleDownload = async () => {
    if (!warrantyRef.current) return;
    const canvas = await html2canvas(warrantyRef.current, { scale: 3, backgroundColor: "#0f172a" });
    const link = document.createElement("a");
    link.download = `WarrantyCard-${report.clientName}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b] text-white font-sans overflow-x-hidden">
      {/* === Compact Medical Header === */}
      <header className="sticky top-0 z-20 bg-[#0f172a]/70 backdrop-blur-md border-b border-cyan-500/20 py-3 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-wide text-cyan-400">
            🩺 {product.toUpperCase()} Health Report
          </h1>
          <span className="text-sm text-white/70">ID: {id.slice(-6)}</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {critical && (
          <section className="bg-gradient-to-r from-red-900 via-red-800 to-amber-700 border border-red-500/50 rounded-3xl p-4 md:p-5 shadow-2xl text-center animate-pulse">
            <h2 className="text-xl md:text-2xl font-extrabold text-amber-200 mb-1">
              ⚠️ YOUR {product.toUpperCase()} NEEDS SERVICE IMMEDIATELY
            </h2>
            <p className="text-xs md:text-sm text-red-100">
              Current health is very low ({liveScore}%). Please schedule a service to avoid
              breakdown or safety issues.
            </p>
          </section>
        )}

        {/* === Client Info Section === */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#081A3A]/90 via-[#0f172a]/90 to-[#122B50]/90 rounded-3xl border border-cyan-500/30 shadow-2xl p-6 md:p-8 transition-all hover:shadow-cyan-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-600/20 animate-pulse-slow"></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                {report.clientName}
              </h2>
              <p className="text-sm text-white/80 flex items-center gap-1">📞 {report.clientPhone}</p>
              <p className="text-sm text-white/80 truncate flex items-center gap-1">📍 {report.address}</p>
              <p className="text-sm text-white/70">
                🧾 Product Model:{" "}
                <span className="text-cyan-300 font-medium">{report.model || "N/A"}</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="text-xs sm:text-sm text-right text-white/60 space-y-1">
                <p>
                  Product:{" "}
                  <span className="text-cyan-300 font-medium capitalize">{product}</span>
                </p>
                <p>
                  Cleaning:{" "}
                  <span className="text-cyan-300 font-medium capitalize">{cleaning}</span>
                </p>
                <p>
                  Service Date:{" "}
                  <span className="text-cyan-300 font-medium">
                    {new Date(date).toLocaleDateString()}
                  </span>
                </p>
                <p>
                  Current Health:{" "}
                  <span
                    className={`font-bold ${
                      critical ? "text-red-400" : warn ? "text-amber-300" : "text-emerald-300"
                    }`}
                  >
                    {liveScore}%
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* === Health Grid === */}
        <section className="bg-white/5 backdrop-blur-md border border-cyan-500/20 rounded-3xl p-8 shadow-xl">
          <h3 className="text-xl font-semibold text-center mb-6 bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
            Component Health Vitals
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {metrics.map(([label, value], i) => {
              const val = getDecayedPercent(value, report);
              return (
                <div
                  key={i}
                  className="relative bg-gradient-to-br from-cyan-900/30 to-blue-800/30 rounded-2xl p-5 text-center border border-cyan-400/20 shadow-lg hover:shadow-cyan-500/20 hover:scale-105 transition-all duration-300"
                >
                  <ProgressCircle value={val} size={85} />
                  <h4 className="mt-2 text-sm font-semibold text-cyan-300">{label}</h4>
                  <p className="text-xs text-white/70">{val}%</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* === Status Section === */}
        <section
          className={`p-6 rounded-3xl shadow-xl text-center ${
            warn
              ? "bg-gradient-to-r from-red-900/40 to-rose-800/30 border border-red-500/20"
              : "bg-gradient-to-r from-green-900/30 to-emerald-800/30 border border-green-400/20"
          }`}
        >
          <h3
            className={`text-xl font-bold mb-1 ${
              warn ? "text-red-300" : "text-green-300"
            }`}
          >
            {warn ? "⚠️ Service Required" : "✅ All Systems Healthy"}
          </h3>
          <p className="text-sm text-white/70">
            {warn
              ? critical
                ? `Your ${product} health is critically low (${liveScore}%). Please book a service immediately.`
                : `Your ${product} needs attention soon. Current health: ${liveScore}%.`
              : `Your ${product} is functioning optimally.`}
          </p>
        </section>

        {/* === Warranty Card === */}
        <section
          ref={warrantyRef}
          className="relative bg-gradient-to-br from-cyan-900/20 to-blue-800/20 border border-cyan-500/20 rounded-3xl p-6 shadow-lg overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-blue-500/10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Warranty Certificate
              </h3>
              <span
                className={`px-3 py-1 text-xs rounded-full ${
                  warrantyOver ? "bg-red-600" : "bg-green-600"
                }`}
              >
                {warrantyOver ? "Expired" : "Active (1 Month)"}
              </span>
            </div>

            <div className="grid gap-3 text-xs text-cyan-100 mb-4">
              <p>Customer: {report.clientName}</p>
              <p>Phone: {report.clientPhone}</p>
              <p className="truncate">Address: {report.address}</p>
              <p>Service: {new Date(date).toLocaleDateString()}</p>
              <p>
                Valid Till:{" "}
                {new Date(
                  new Date(date).setMonth(new Date(date).getMonth() + 1)
                ).toLocaleDateString()}
              </p>
            </div>

            <div className="flex justify-between items-center mt-6 pt-3 border-t border-cyan-500/20">
              <div className="flex flex-col items-start text-xs text-cyan-200">
                <span className="mb-1">Authorized Sign</span>
                <br /> __________________
                <img src="/sg.png" className="h-20 w-20 object-contain mb-1 mt-[-63px]" />
                <span className="text-[10px] text-white/50">Chimney Solutions Pvt. Ltd.</span>
              </div>

              <img src={qrImage} className="h-20 w-20 rounded-md shadow-lg" />
            </div>

            <div className="border-t border-cyan-500/20 mt-4 pt-3 text-xs text-cyan-200">
              <strong className="text-cyan-400">Terms:</strong>
              <ul className="list-disc pl-4 space-y-1 mt-1">
                <li>Valid for 1 month from service date.</li>
                <li>Service only — parts excluded.</li>
                <li>Post-expiry charges applicable.</li>
              </ul>
            </div>
          </div>
        </section>

        <div className="text-center">
          <button
            onClick={handleDownload}
            className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-all text-white px-8 py-3 rounded-full shadow-lg"
          >
            📥 Download Warranty Card
          </button>
        </div>
      </div>
    </main>
  );
}
