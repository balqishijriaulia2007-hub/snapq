"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Item = {
  id: string;
  kode_tiket: string;
  nomor: number | null;
  menit_mulai: number;
  menit_selesai: number;
  paket: string;
  jumlah_orang: number;
  tambah_waktu: number;
  tambah_cetak: number;
  total_harga: number;
  status: string;
  nama_pelanggan: string | null;
  hp: string | null;
};

const rupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");
const jam = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}.${String(m % 60).padStart(2, "0")}`;

const STATUS: Record<string, { label: string; warna: string }> = {
  menunggu_pembayaran: { label: "Menunggu pembayaran", warna: "bg-amber-100 text-amber-700" },
  lunas: { label: "Lunas, menunggu giliran", warna: "bg-emerald-100 text-emerald-700" },
  dipanggil: { label: "Dipanggil", warna: "bg-pink-100 text-pink-700" },
  berlangsung: { label: "Sedang berlangsung", warna: "bg-indigo-100 text-indigo-700" },
  selesai: { label: "Selesai", warna: "bg-gray-100 text-gray-600" },
  tidak_hadir: { label: "Tidak hadir", warna: "bg-red-100 text-red-600" },
  dibatalkan: { label: "Dibatalkan", warna: "bg-gray-100 text-gray-500" },
};

const AKTIF = ["menunggu_pembayaran", "lunas", "dipanggil", "berlangsung"];

export default function AdminAntrean() {
  const router = useRouter();
  const [siap, setSiap] = useState(false);
  const [tanggal, setTanggal] = useState("");
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [pesan, setPesan] = useState("");
  const [sibuk, setSibuk] = useState<string | null>(null);

  useEffect(() => {
    async function cek() {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        router.replace("/admin/masuk");
        return;
      }
      const { data: profil } = await supabase.from("profiles").select("role").eq("id", user.user.id).single();
      if (profil?.role !== "admin") {
        router.replace("/admin/masuk");
        return;
      }
      setTanggal(new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" }));
      setSiap(true);
    }
    cek();
  }, [router]);

  const muat = useCallback(async () => {
    if (!tanggal) return;
    const { data, error } = await supabase.rpc("admin_antrean", { p_tanggal: tanggal });
    if (error) setPesan("Gagal memuat antrean. Coba muat ulang halaman.");
    else {
      setPesan("");
      setData((data as Item[]) ?? []);
    }
    setLoading(false);
  }, [tanggal]);

  useEffect(() => {
    if (!siap || !tanggal) return;
    muat();
    const t = setInterval(muat, 5000);
    return () => clearInterval(t);
  }, [siap, tanggal, muat]);

  async function ubah(id: string, status: string, tanya?: string) {
    if (tanya && !window.confirm(tanya)) return;
    setSibuk(id);
    setPesan("");
    const { error } = await supabase.rpc("admin_ubah_status", { p_id: id, p_status: status });
    setSibuk(null);
    if (error) setPesan(error.message);
    muat();
  }

  const aktifSekarang = data.find((d) => d.status === "dipanggil" || d.status === "berlangsung");
  const berikutnya = data.find((d) => d.status === "lunas");
  const antrean = data.filter((d) => AKTIF.includes(d.status));
  const riwayat = data.filter((d) => !AKTIF.includes(d.status));
  const jmlSelesai = data.filter((d) => d.status === "selesai").length;
  const jmlTunggu = data.filter((d) => d.status === "lunas").length;

  const btn = "rounded-xl px-4 py-2 text-sm font-semibold shadow disabled:opacity-50";

  function Kartu({ b }: { b: Item }) {
    const s = STATUS[b.status] ?? { label: b.status, warna: "bg-gray-100 text-gray-600" };
    const disabled = sibuk === b.id;
    return (
      <div className={`overflow-hidden rounded-2xl bg-white shadow-lg ${b.status === "dipanggil" || b.status === "berlangsung" ? "ring-2 ring-indigo-500" : ""}`}>
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 text-2xl font-bold text-white">
              {b.nomor ?? "-"}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{b.nama_pelanggan ?? "Tanpa nama"}</p>
              <p className="text-xs text-gray-500">{b.hp ?? "-"} · {b.kode_tiket}</p>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${s.warna}`}>{s.label}</span>
        </div>
        <div className="space-y-1 border-t border-gray-100 px-5 py-3 text-sm text-gray-700">
          <p className="font-medium text-gray-900">{b.paket} · 👥 {b.jumlah_orang} orang</p>
          <p>Pukul {jam(b.menit_mulai)} - {jam(b.menit_selesai)}</p>
          {(b.tambah_waktu > 0 || b.tambah_cetak > 0) && (
            <p className="text-xs text-gray-500">
              Tambahan: {b.tambah_waktu > 0 && `${b.tambah_waktu}x waktu 10 menit`}
              {b.tambah_waktu > 0 && b.tambah_cetak > 0 && ", "}
              {b.tambah_cetak > 0 && `${b.tambah_cetak}x cetak`}
            </p>
          )}
          <p className="font-bold text-indigo-600">{rupiah(b.total_harga)}</p>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-gray-100 px-5 py-3">
          {b.status === "lunas" && (
            <>
              <button disabled={disabled || !!aktifSekarang} onClick={() => ubah(b.id, "dipanggil")} className={`${btn} bg-pink-600 text-white hover:bg-pink-700`}>📢 Panggil</button>
              <button disabled={disabled} onClick={() => ubah(b.id, "tidak_hadir", "Tandai pelanggan ini tidak hadir?")} className={`${btn} bg-gray-100 text-gray-700 hover:bg-gray-200`}>Tidak hadir</button>
              <button disabled={disabled} onClick={() => ubah(b.id, "dibatalkan", "Batalkan booking ini? Slot jamnya akan dibuka lagi.")} className={`${btn} bg-red-50 text-red-600 hover:bg-red-100`}>Batalkan</button>
            </>
          )}
          {b.status === "dipanggil" && (
            <>
              <button disabled={disabled} onClick={() => ubah(b.id, "berlangsung")} className={`${btn} bg-indigo-600 text-white hover:bg-indigo-700`}>▶ Mulai sesi</button>
              <button disabled={disabled} onClick={() => ubah(b.id, "tidak_hadir", "Tandai pelanggan ini tidak hadir?")} className={`${btn} bg-gray-100 text-gray-700 hover:bg-gray-200`}>Tidak hadir</button>
            </>
          )}
          {b.status === "berlangsung" && (
            <button disabled={disabled} onClick={() => ubah(b.id, "selesai")} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}>✔ Selesai</button>
          )}
          {b.status === "menunggu_pembayaran" && (
            <button disabled={disabled} onClick={() => ubah(b.id, "dibatalkan", "Batalkan booking yang belum dibayar ini?")} className={`${btn} bg-red-50 text-red-600 hover:bg-red-100`}>Batalkan</button>
          )}
        </div>
      </div>
    );
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
            <h1 className="text-2xl font-bold text-gray-900">Antrean</h1>
            <p className="text-xs text-gray-500">Diperbarui otomatis setiap 5 detik</p>
          </div>
          <Link href="/admin" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow hover:bg-indigo-50">
            Dasbor
          </Link>
        </div>

        <div className="mb-4 rounded-2xl bg-white p-4 shadow-lg">
          <input type="date" value={tanggal}
            onChange={(e) => { if (e.target.value) { setTanggal(e.target.value); setLoading(true); } }}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-xl bg-indigo-50 p-2"><p className="text-xl font-bold text-indigo-700">{antrean.length}</p><p className="text-xs text-gray-600">Antrean aktif</p></div>
            <div className="rounded-xl bg-emerald-50 p-2"><p className="text-xl font-bold text-emerald-700">{jmlTunggu}</p><p className="text-xs text-gray-600">Siap dipanggil</p></div>
            <div className="rounded-xl bg-gray-50 p-2"><p className="text-xl font-bold text-gray-700">{jmlSelesai}</p><p className="text-xs text-gray-600">Selesai</p></div>
          </div>
          <button disabled={!berikutnya || !!aktifSekarang || sibuk !== null}
            onClick={() => berikutnya && ubah(berikutnya.id, "dipanggil")}
            className="mt-3 w-full rounded-xl bg-pink-600 py-3 font-semibold text-white shadow hover:bg-pink-700 disabled:opacity-50">
            {aktifSekarang
              ? `Selesaikan dulu nomor ${aktifSekarang.nomor}`
              : berikutnya
                ? `📢 Panggil Berikutnya (nomor ${berikutnya.nomor})`
                : "Belum ada antrean yang siap dipanggil"}
          </button>
        </div>

        {pesan && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{pesan}</p>}
        {loading && <p className="text-gray-500">Memuat...</p>}
        {!loading && antrean.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow-lg">Tidak ada antrean aktif pada tanggal ini.</div>
        )}

        <div className="space-y-4">
          {antrean.map((b) => <Kartu key={b.id} b={b} />)}
        </div>

        {riwayat.length > 0 && (
          <details className="mt-6">
            <summary className="cursor-pointer text-sm font-semibold text-indigo-600">Riwayat hari ini ({riwayat.length})</summary>
            <div className="mt-3 space-y-4">
              {riwayat.map((b) => <Kartu key={b.id} b={b} />)}
            </div>
          </details>
        )}
      </div>
    </main>
  );
}