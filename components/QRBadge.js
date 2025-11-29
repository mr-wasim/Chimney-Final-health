"use client";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

export default function QRBadge({ url, title="Service Done", subtitle, logoText="CS" }){
  const [dataUrl, setDataUrl] = useState("");
  useEffect(()=>{
    if(!url) return;
    QRCode.toDataURL(url, { width: 260, margin: 1, color: { dark: "#000000", light: "#ffffff" }})
      .then(setDataUrl).catch(()=>{});
  }, [url]);
  return (
    <div className="whatsapp-card p-4 flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-accent text-black grid place-items-center font-bold">{logoText}</div>
        <div>
          <div className="font-semibold">{title}</div>
          {subtitle && <div className="text-xs text-white/70">{subtitle}</div>}
        </div>
      </div>
      {dataUrl ? <img alt="QR" src={dataUrl} className="rounded-xl border border-white/10" /> : <div className="pulse w-48 h-48"></div>}
      <div className="text-xs text-white/60">Scan to view your live Health Report</div>
    </div>
  );
}
