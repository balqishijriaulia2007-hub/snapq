"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const MENU = [
  { ikon: "🎟", judul: "Antrean Hari Ini", isi: "Panggil pelanggan dan ubah status sesi" },
  { ikon: "🔍", judul: "Verifikasi Tiket", isi: "Scan QR atau masukkan kode tiket" },
  { ikon: "🛠", judul: "Kelola Layanan", isi: "Atur paket, harga, dan tambahan" },
  { ikon: "📊", judul: "Laporan", isi: "Harian, mingguan, dan bulanan" },
];

export default function Admin() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    async function cek() {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        router.replace("/admin/masuk");
        return;
      }
      const { data: profil } = await supabase
        .from("profiles")
        .select("role,nama")
        .eq("id", user.user.id)
        .single();
      if (profil?.role !== "admin") {
        router.replace("/admin/masuk");
        return;
      }
      setNama(profil.nama ?? "Admin");
      setSiap(true);
    }
    cek();
  }, [router]);

  async function keluar() {
    await supabase.auth.signOut();
    router.push("/admin/masuk");
  }

  if (!siap) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Memeriksa akses...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-widest text-indigo-600">📸 SNAPQ ADMIN</p>
            <h1 className="text-2xl font-bold text-gray-900">Halo, {nama}</h1>
          </div>
          <button onClick={keluar} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-600">
            Keluar
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {MENU.map((m) => (
            <div key={m.judul} className="rounded-2xl bg-white p-6 opacity-70 shadow-lg">
              <div className="text-3xl">{m.ikon}</div>
              <h2 className="mt-2 text-lg font-bold text-gray-900">{m.judul}</h2>
              <p className="text-sm text-gray-500">{m.isi}</p>
              <p className="mt-2 text-xs font-semibold text-amber-600">Segera hadir</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}