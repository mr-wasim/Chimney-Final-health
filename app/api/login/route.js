import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req){
  const { username, password } = await req.json();
  const U = process.env.ADMIN_USERNAME || "admin";
  const P = process.env.ADMIN_PASSWORD || "Chimeny@123";
  if(username === U && password === P){
    cookies().set("admin_auth","ok", { httpOnly: true, path:"/" });
    return NextResponse.json({ ok:true });
  }
  return NextResponse.json({ error:"Invalid" }, { status:401 });
}
