"use client";
import { useRouter } from "next/navigation";

export default function Home(){
  const router = useRouter();
  return (
    <main className="max-w-5xl mx-auto px-4 pt-20 pb-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold">Chimney Solutions</h1>
        <p className="text-white/70 mt-2">Beautiful, live health reports with WhatsApp-clean UI.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="whatsapp-card p-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-accent/20 blur-2xl" />
          <h2 className="text-2xl font-semibold mb-2">Technician</h2>
          <p className="text-white/70 mb-4">Create a new customer health report and QR in seconds.</p>
          <button className="btn" onClick={()=>router.push('/technician')}>Open Technician Form</button>
        </div>
        <div className="whatsapp-card p-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/30 blur-2xl" />
          <h2 className="text-2xl font-semibold mb-2">Admin</h2>
          <p className="text-white/70 mb-4">Full CRM dashboard, renewals, edits, analytics.</p>
          <button className="btn" onClick={()=>router.push('/admin/login')}>Admin Login</button>
        </div>
      </div>
    </main>
  );
}
