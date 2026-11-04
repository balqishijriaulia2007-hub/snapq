"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Item = {
  id: string;
  tanggal: string;
  menit_mulai: number;
  menit_selesai: number;
  paket: string;
  jumlah_orang: number;
  total_harga: number;
  status: string;
  tambah_waktu: number;
  tambah_cetak: number;
  nomor: number;
  di_depan: number;
  nomor_berjalan: number | null;
};

const rupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");
const jam = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}.${String(m % 60).padStart(2, "0")}`;

const STATUS: Record<string, { label: string; warna: string }> = {
  menunggu_pembayaran: { label: "Menunggu pembayaran", warna: "bg-amber-100 text-amber-700" },
  lunas: { label: "Lunas, siap dilayani", warna: "bg-emerald-100 text-emerald-700" },
  berlangsung: { label: "Sedang berlangsung", warna: "bg-indigo-100 text-indigo-700" },
  selesai: { label: "Selesai", warna: "bg-gray-100 text-gray-600" },
  tidak_hadir: { label: "Tidak hadir", warna: "bg-red-100 text-red-600" },
};

export default function BookingSaya() {
  const router = useRouter();
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [pesan, setPesan] = useState("");

  const muat = useCallback(async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      router.push("/masuk");
      return;
    }
    const { data, error } = await supabase.rpc("booking_saya");
    if (error) setPesan("Gagal memuat booking. Coba muat ulang halaman.");
    else {
      setPesan("");
      setData((data as Item[]) ?? []);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    muat();
    const t = setInterval(muat, 5000);
    return () => clearInterval(t);
  }, [muat]);

  return (
    <main className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-widest text-indigo-600">📸 SNAPQ</p>
            <h1 className="text-2xl font-bold text-gray-900">Booking Saya</h1>
            <p className="text-xs text-gray-500">Diperbarui otomatis setiap 5 detik</p>
          </div>
          <div className="flex gap-2">
            <Link href="/booking" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700">
              Booking
            </Link>
            <Link href="/akun" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow hover:bg-indigo-50">
              Akun
            </Link>
          </div>
        </div>

        {loading && <p className="text-gray-500">Memuat...</p>}
        {pesan && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{pesan}</p>}
        {!loading && !pesan && data.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
            <p className="text-gray-500">Belum ada booking.</p>
            <Link href="/booking" className="mt-3 inline-block font-semibold text-indigo-600 hover:underline">
              Booking sekarang
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {data.map((b) => {
            const s = STATUS[b.status] ?? { label: b.status, warna: "bg-gray-100 text-gray-600" };
            const aktif = ["menunggu_pembayaran", "lunas", "berlangsung"].includes(b.status);
            return (
              <div key={b.id} className="overflow-hidden rounded-2xl bg-white shadow-lg">
                <div className="flex items-center justify-between bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
                  <div>
                    <p className="text-xs uppercase tracking-widest opacity-80">Nomor antrean</p>
                    <p className="text-4xl font-bold">{b.nomor}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${s.warna}`}>{s.label}</span>
                </div>
                <div className="space-y-1 p-6 text-sm text-gray-700">
                  <p className="text-base font-semibold text-gray-900">{b.paket}</p>
                  <p>
                    {new Date(b.tanggal + "T00:00:00").toLocaleDateString("id-ID", {
                      weekday: "long", day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                  <p>Pukul {jam(b.menit_mulai)} - {jam(b.menit_selesai)} · 👥 {b.jumlah_orang} orang</p>
                  {(b.tambah_waktu > 0 || b.tambah_cetak > 0) && (
                    <p className="text-xs text-gray-500">
                      Tambahan: {b.tambah_waktu > 0 && `${b.tambah_waktu}x waktu 10 menit`}
                      {b.tambah_waktu > 0 && b.tambah_cetak > 0 && ", "}
                      {b.tambah_cetak > 0 && `${b.tambah_cetak}x cetak`}
                    </p>
                  )}
                  <p className="pt-1 text-lg font-bold text-indigo-600">{rupiah(b.total_harga)}</p>

                  {aktif && (
                    <div className="mt-3 rounded-xl bg-indigo-50 p-3 text-sm">
                      <p>
                        Sedang dilayani:{" "}
                        <span className="font-bold">{b.nomor_berjalan ? `nomor ${b.nomor_berjalan}` : "belum ada"}</span>
                      </p>
                      <p>
                        Antrean di depanmu: <span className="font-bold">{b.di_depan}</span> sesi
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}