"use client";

export default function DownloadButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn bg-indigo-600 hover:bg-indigo-700 text-white"
    >
      🧾 Download Warranty Card
    </button>
  );
}
