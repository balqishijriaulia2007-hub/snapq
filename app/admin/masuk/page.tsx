"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AuthCard from "@/components/AuthCard";

export default function MasukAdmin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setPesan("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setPesan("Email atau kata sandi salah.");
      setLoading(false);
      return;
    }
    const { data: profil } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    if (profil?.role !== "admin") {
      await supabase.auth.signOut();
      setPesan("Akun ini bukan akun admin.");
      setLoading(false);
      return;
    }
    router.push("/admin");
  }

  const input =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

  return (
    <AuthCard judul="Masuk Admin" subjudul="Khusus pengelola studio">
      <form onSubmit={kirim} className="space-y-4">
        <input className={input} type="email" placeholder="Email admin" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={input} type="password" placeholder="Kata sandi" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {pesan && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{pesan}</p>}
        <button disabled={loading} className="w-full rounded-xl bg-gray-900 py-3 font-semibold text-white shadow hover:bg-gray-700 disabled:opacity-60">
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-gray-600">
        Bukan admin?{" "}
        <Link href="/masuk" className="font-semibold text-indigo-600 hover:underline">Masuk sebagai pelanggan</Link>
      </p>
    </AuthCard>
  );
}