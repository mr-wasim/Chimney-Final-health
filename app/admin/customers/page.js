import Header from "../../../components/Header";
import { connectDB } from "../../../lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CustomersPage({ searchParams }){
  const page = Number(searchParams.page||1);
  const pageSize = 12;
  const { db } = await connectDB();
  const total = await db.collection("reports").countDocuments();
  const items = await db.collection("reports").find().sort({ _id:-1 }).skip((page-1)*pageSize).limit(pageSize).toArray();
  const pages = Math.ceil(total / pageSize);

  return (
    <main>
      <Header title="Customers" />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-3">
          {items.map(r=>(
            <Link key={r._id.toString()} href={`/admin/customers/${r._id}`} className="whatsapp-card p-4 hover:border-white/30">
              <div className="font-semibold">{r.clientName}</div>
              <div className="text-white/70 text-sm truncate">{r.clientPhone} · {r.address}</div>
              <div className="text-white/50 text-xs">Product: {r.product} · Scans: {r.scans||0}</div>
            </Link>
          ))}
        </div>
        <div className="flex gap-2 justify-center mt-6">
          {Array.from({length: pages}).map((_,i)=>{
            const n=i+1;
            return <a key={n} href={`/admin/customers?page=${n}`} className={`btn-outline ${n===page?'border-white/50':''}`}>{n}</a>
          })}
        </div>
      </div>
    </main>
  );
}
