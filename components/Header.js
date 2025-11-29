"use client";
import Logo from "./Logo";
import { useRouter } from "next/navigation";

export default function Header({ title }){
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-paper/60 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <button onClick={()=>router.push('/')} className="btn-outline">Home</button>
        </div>
      </div>
      {title && <div className="max-w-6xl mx-auto px-4 pb-3 text-white/70">{title}</div>}
    </header>
  );
}
