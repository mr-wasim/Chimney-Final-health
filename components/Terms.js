export default function Terms({ product }){
  const isChimney = product === "chimney";
  return (
    <div className="whatsapp-card p-4 mt-6">
      <h3 className="text-xl font-semibold mb-2">Terms & Conditions</h3>
      <ul className="list-disc pl-5 space-y-1 text-white/80 text-sm">
        <li>This report and warranty cover service workmanship only, not spare parts.</li>
        <li>Warranty is valid for 1 month from service date and limited to the serviced unit.</li>
        <li>Any physical damage, improper use, or third‑party intervention voids the warranty.</li>
        <li>Service findings are based on condition observed at the time of visit.</li>
        <li>Oil leakage, suction issues, or sensor/button faults are reported with best effort diagnostics.</li>
        <li>For urgent issues, please contact our support immediately.</li>
      </ul>
      <div className="mt-4 text-white/70 text-sm">
        {isChimney ? (
          <p>
            This Chimney Health & Service Warranty Card evaluates Motor, Filter, Blower, PCB, Touch Panel,
            Buttons, and Sensors. Cleaning grade affects score decay over time.
          </p>
        ) : (
          <p>
            This Hob Health & Service Warranty Card evaluates Burners, Igniters, Jets, and overall assembly.
            Cleaning grade affects score decay over time.
          </p>
        )}
      </div>
    </div>
  );
}
