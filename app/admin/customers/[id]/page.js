"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

// 🔥 Same decay logic as report page
function getDecayedPercent(baseValue, report) {
  const base = Number(baseValue || 0);
  if (!Number.isFinite(base) || base <= 0) return 0;

  const start = report.healthStartAt
    ? new Date(report.healthStartAt)
    : report.createdAt
    ? new Date(report.createdAt)
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

  const progress = Math.min(elapsedMs / totalMs, 1);
  const t = Math.pow(progress, 1.5);

  let min = Math.round(base * 0.04);
  if (min < 1) min = 1;
  if (min > 5) min = 5;

  const current = base - (base - min) * t;
  const rounded = Math.round(current);

  if (rounded < min) return min;
  if (rounded > base) return base;
  return rounded;
}

export default function EditCustomer() {
  const params = useParams();
  const id = params.id;
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/reports/${id}`);
      if (!res.ok) return;

      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const save = async () => {
    try {
      setSaving(true);

      const payload = { ...data };
      delete payload._id;

      const res = await fetch(`/api/reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let result = {};

      try {
        result = JSON.parse(text);
      } catch {
        result = { error: text };
      }

      setSaving(false);

      if (!res.ok) return alert(result.error || "Update failed!");

      alert("✅ Updated Successfully!");
      fetchData();
    } catch (err) {
      console.error("Update error:", err);
      alert("❌ Something went wrong!");
      setSaving(false);
    }
  };

  if (loading || !data)
    return (
      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="pulse w-full h-10"></div>
      </main>
    );

  const fields =
    data.product === "chimney"
      ? [
          ["PCB Health", "pcbHealth"],
          ["Blower Health", "blowerHealth"],
          ["Suction Health", "suctionHealth"],
          ["Product Structure Health", "structureHealth"],
          ["Motor Health", "motorHealth"],
          ["Filter Health", "filterHealth"],
        ]
      : [
          ["Flame Burner Health", "flameBurnerHealth"],
          ["Ignition Health", "ignitionHealth"],
          ["Jet Health", "jetHealth"],
        ];

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="whatsapp-card p-6 space-y-3">
        <h2 className="text-2xl font-semibold">✏️ Edit Report</h2>

        {/* Basic Fields */}
        <div className="grid md:grid-cols-2 gap-3">
          {["clientName", "clientPhone", "address", "product", "date", "cleaning", "model"].map(
            (k) => (
              <div key={k}>
                <div className="label capitalize">{k}</div>
                <input
                  className="input"
                  value={data[k] || ""}
                  onChange={(e) => setData({ ...data, [k]: e.target.value })}
                />
              </div>
            )
          )}
        </div>

        {/* Duration */}
        <div className="mt-4">
          <div className="label">Report Duration</div>
          <select
            className="input"
            value={data.duration || "6"}
            onChange={(e) => setData({ ...data, duration: e.target.value })}
          >
            <option value="6">6 Months</option>
            <option value="9">9 Months</option>
            <option value="12">12 Months</option>
            <option value="testing">🧪 5-minute Testing</option>
          </select>
          <div className="text-xs mt-1 text-cyan-300">
            ⏳ Live score will adjust with this duration.
          </div>
        </div>

        {/* Health Fields */}
        <div className="grid md:grid-cols-3 gap-3 mt-4">
          {fields.map(([label, key]) => (
            <div key={key} className="border border-white/10 rounded-xl p-3">
              <div className="label">{label}</div>
              <input
                type="number"
                className="input"
                value={data[key] ?? ""}
                onChange={(e) =>
                  setData({ ...data, [key]: Number(e.target.value || 0) })
                }
              />
              <div className="text-xs mt-1 text-cyan-300">
                Live Health:{" "}
                <span className="font-bold">
                  {getDecayedPercent(data[key], data)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6">
          <a className="btn-outline" href={`/r/${id}`} target="_blank">
            View Report
          </a>
          <button className="btn" disabled={saving} onClick={save}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </main>
  );
}
