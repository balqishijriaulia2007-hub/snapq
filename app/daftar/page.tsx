"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AuthCard from "@/components/AuthCard";

export default function Daftar() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [hp, setHp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setPesan("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nama, hp } },
    });
    setLoading(false);
    if (error) setPesan(error.message);
    else router.push("/akun");
  }

  const input =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

  return (
    <AuthCard judul="Buat Akun" subjudul="Daftar untuk booking sesi foto">
      <form onSubmit={kirim} className="space-y-4">
        <input className={input} placeholder="Nama lengkap" value={nama} onChange={(e) => setNama(e.target.value)} required />
        <input className={input} placeholder="Nomor HP" value={hp} onChange={(e) => setHp(e.target.value)} required />
        <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={input} type="password" placeholder="Kata sandi (min. 6 karakter)" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        {pesan && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{pesan}</p>}
        <button disabled={loading} className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60">
          {loading ? "Memproses..." : "Daftar"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-gray-600">
        Sudah punya akun?{" "}
        <Link href="/masuk" className="font-semibold text-indigo-600 hover:underline">Masuk</Link>
      </p>
    </AuthCard>
  );
}