"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Paket = { id: string; nama: string; jumlah_orang: number; harga: number; durasi_menit: number };
type Tambahan = { id: string; nama: string; harga: number };

const rupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function Layanan() {
  const [paket, setPaket] = useState<Paket[]>([]);
  const [tambahan, setTambahan] = useState<Tambahan[]>([]);
  const [loading, setLoading] = useState(true);
  const [pesan, setPesan] = useState("");

  useEffect(() => {
    Promise.all([
      supabase.from("layanan").select("id,nama,jumlah_orang,harga,durasi_menit").eq("aktif", true).order("jumlah_orang"),
      supabase.from("tambahan").select("id,nama,harga").eq("aktif", true).order("harga"),
    ]).then(([a, b]) => {
      if (a.error || b.error) setPesan("Gagal memuat daftar harga. Coba muat ulang halaman.");
      else {
        setPaket(a.data ?? []);
        setTambahan(b.data ?? []);
      }
      setLoading(false);
    });
  }, []);

  const durasi = paket[0]?.durasi_menit ?? 10;

  return (
    <main className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-widest text-indigo-600">📸 SNAPQ</p>
            <h1 className="text-2xl font-bold text-gray-900">Daftar Harga</h1>
            <p className="text-sm text-gray-500">Setiap hari, 10.00 - 21.00</p>
          </div>
          <Link href="/akun" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow hover:bg-indigo-50">
            Akun
          </Link>
        </div>

        {loading && <p className="text-gray-500">Memuat daftar harga...</p>}
        {pesan && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{pesan}</p>}

        {!loading && !pesan && (
          <div className="space-y-5">
            <section className="rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="mb-3 text-lg font-bold text-gray-900">Pilih Paket</h2>
              <ul className="divide-y divide-gray-100">
                {paket.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-semibold text-gray-900">{p.nama}</p>
                      <p className="text-xs text-gray-500">👥 {p.jumlah_orang} orang</p>
                    </div>
                    <p className="text-lg font-bold text-indigo-600">{rupiah(p.harga)}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="mb-3 text-lg font-bold text-gray-900">Yang Kamu Dapat</h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>⏱ {durasi} Menit Waktu Foto</li>
                <li>💾 All Soft Files dikirim via Google Drive</li>
                <li>🖨 Premium Quality Photo Print 4R 1/orang</li>
                <li>✨ HD Quality Photo</li>
                <li>❄️ Room yang nyaman dan dingin</li>
              </ul>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="mb-3 text-lg font-bold text-gray-900">Tambahan</h2>
              <ul className="divide-y divide-gray-100">
                {tambahan.map((t) => (
                  <li key={t.id} className="flex items-center justify-between py-3">
                    <p className="text-gray-900">{t.nama}</p>
                    <p className="font-bold text-indigo-600">{rupiah(t.harga)}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}