"use client";
import { useState } from "react";

export default function TechnicianForm() {
  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    address: "",
    product: "chimney",
    model: "",
    date: new Date().toISOString().slice(0, 10),
    cleaning: "normal",

    // NEW FIELD: duration
    duration: "6",

    // NEW FIELD NAMES (CHIMNEY)
    pcbHealth: 0,
    blowerHealth: 0,
    suctionHealth: 0,
    structureHealth: 0,
    motorHealth: 0,
    filterHealth: 0,

    // NEW FIELD NAMES (HOB)
    flameBurnerHealth: 0,
    ignitionHealth: 0,
    jetHealth: 0,
  });

  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  const onChange = (key) => (e) => {
    const isNumber = e.target.type === "number";
    let val = e.target.value;

    if (isNumber) {
      let num = Number(val);
      if (!Number.isFinite(num)) num = 0;
      if (num < 0) num = 0;
      if (num > 100) num = 100;
      val = num;
    }

    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setResult(null);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        alert(json.error || "Failed to create report");
      } else {
        setResult(json);
        alert("✅ Report Created Successfully!");
      }
    } catch (err) {
      alert("Network Error ❌");
    } finally {
      setSaving(false);
    }
  };

  const isChimney = form.product === "chimney";

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="whatsapp-card p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Technician — Create Report</h1>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Client Name">
              <input className="input" value={form.clientName} onChange={onChange("clientName")} />
            </Field>
            <Field label="Client Phone">
              <input className="input" value={form.clientPhone} onChange={onChange("clientPhone")} />
            </Field>
            <Field label="Address" full>
              <input className="input" value={form.address} onChange={onChange("address")} />
            </Field>
            <Field label="Product">
              <select className="input" value={form.product} onChange={onChange("product")}>
                <option value="chimney">Chimney</option>
                <option value="hob">Hob</option>
              </select>
            </Field>

            {/* Product Model */}
            <Field label="Product Model">
              <input
                className="input"
                placeholder="e.g., Glen 6063 Auto Clean"
                value={form.model}
                onChange={onChange("model")}
              />
            </Field>

            <Field label="Date">
              <input type="date" className="input" value={form.date} onChange={onChange("date")} />
            </Field>

            <Field label="Cleaning Type">
              <select className="input" value={form.cleaning} onChange={onChange("cleaning")}>
                <option value="normal">Normal Cleaning</option>
                <option value="deep">Deep Cleaning</option>
              </select>
            </Field>

            {/* 🔥 NEW FIELD — Duration */}
            <Field label="Report Validity / Duration">
              <select className="input" value={form.duration} onChange={onChange("duration")}>
                <option value="6">6 Months</option>
                <option value="9">9 Months</option>
                <option value="12">12 Months</option>
                <option value="testing">🧪 Testing Mode (5 Minutes)</option>
              </select>
            </Field>
          </div>

          {/* Product Fields */}
          {isChimney ? (
            <div className="grid md:grid-cols-3 gap-3">
              {[
                ["PCB Health", "pcbHealth"],
                ["Blower Health", "blowerHealth"],
                ["Suction Health", "suctionHealth"],
                ["Product Structure Health", "structureHealth"],
                ["Motor Health", "motorHealth"],
                ["Filter Health", "filterHealth"],
              ].map(([label, key]) => (
                <Field key={key} label={label}>
                  <input type="number" className="input" value={form[key]} onChange={onChange(key)} />
                </Field>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-3">
              {[
                ["Flame Burner Health", "flameBurnerHealth"],
                ["Ignition Health", "ignitionHealth"],
                ["Jet Health", "jetHealth"],
              ].map(([label, key]) => (
                <Field key={key} label={label}>
                  <input type="number" className="input" value={form[key]} onChange={onChange(key)} />
                </Field>
              ))}
            </div>
          )}

          <button className="btn" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Create Report"}
          </button>
        </form>

        {result && (
          <div className="mt-6 space-y-3">
            <div className="text-sm text-white/80">
              <div>Report ID: {result.id}</div>
              <a className="underline text-green-400" href={result.reportUrl} target="_blank">
                Open Report
              </a>
            </div>

            {result.qrDataUrl && (
              <div className="whatsapp-card p-4 flex flex-col items-center space-y-3 border border-white/10 rounded-xl">
                <div className="text-lg font-semibold">Service QR Code</div>
                <img src={result.qrDataUrl} alt="QR" className="w-40 h-40 border rounded-lg shadow-lg" />
                <a href={result.qrDataUrl} download={`Warranty_${result.id}.png`} className="btn">
                  Download QR
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function Field({ label, children, full }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <div className="label">{label}</div>
      {children}
    </div>
  );
}
