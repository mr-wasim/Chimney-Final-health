"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin(){
  const [u,setU]=useState(""); const [p,setP]=useState("");
  const router = useRouter();
  const submit = async (e)=>{
    e.preventDefault();
    const res = await fetch("/api/login", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ username:u, password:p })
    });
    if(res.ok){ router.push("/admin"); } else { alert("Invalid credentials"); }
  };
  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <div className="whatsapp-card p-6">
        <h2 className="text-2xl font-semibold mb-4">Admin Login</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Username</label>
            <input className="input" value={u} onChange={e=>setU(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={p} onChange={e=>setP(e.target.value)} />
          </div>
          <button className="btn w-full">Login</button>
        </form>
      </div>
    </main>
  );
}
