"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Hari = { tanggal: string; jml: number; pendapatan: number };
type PaketLap = { nama: string; jml: number; pendapatan: number };
type Laporan = {
  ringkasan: {
    pendapatan: number;
    booking_dibayar: number;
    sesi_selesai: number;
    tidak_hadir: number;
    dibatalkan: number;
    rata_menit: number | null;
    orang_dilayani: number;
    cetak_tambahan: number;
  };
  per_hari: Hari[];
  per_paket: PaketLap[];
};
type Mode = "harian" | "mingguan" | "bulanan";

const rupiah = (n: number) => "Rp " + Number(n).toLocaleString("id-ID");
const iso = (d: Date) => d.toISOString().slice(0, 10);
const dariIso = (s: string) => new Date(s + "T00:00:00Z");
const tambahHari = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);
const label = (s: string, opsi: Intl.DateTimeFormatOptions) =>
  dariIso(s).toLocaleDateString("id-ID", { timeZone: "UTC", ...opsi });

function rentang(mode: Mode, tgl: string): [string, string] {
  const d = dariIso(tgl);
  if (mode === "harian") return [tgl, tgl];
  if (mode === "mingguan") {
    const senin = tambahHari(d, -((d.getUTCDay() + 6) % 7));
    return [iso(senin), iso(tambahHari(senin, 6))];
  }
  const awal = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  const akhir = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
  return [iso(awal), iso(akhir)];
}

export default function LaporanAdmin() {
  const router = useRouter();
  const [siap, setSiap] = useState(false);
  const [mode, setMode] = useState<Mode>("harian");
  const [tgl, setTgl] = useState("");
  const [lap, setLap] = useState<Laporan | null>(null);
  const [loading, setLoading] = useState(true);
  const [pesan, setPesan] = useState("");

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
      setTgl(new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" }));
      setSiap(true);
    }
    cek();
  }, [router]);

  useEffect(() => {
    if (!siap || !tgl) return;
    let batal = false;
    const [dari, sampai] = rentang(mode, tgl);
    supabase.rpc("admin_laporan", { p_dari: dari, p_sampai: sampai }).then(({ data, error }) => {
      if (batal) return;
      if (error) {
        setPesan(error.message);
        setLap(null);
      } else {
        setPesan("");
        setLap(data as Laporan);
      }
      setLoading(false);
    });
    return () => {
      batal = true;
    };
  }, [siap, mode, tgl]);

  function gantiMode(m: Mode) {
    setLoading(true);
    setMode(m);
  }

  function gantiTgl(t: string) {
    if (!t) return;
    setLoading(true);
    setTgl(t);
  }

  function unduhCsv() {
    if (!lap || !tgl) return;
    const [dari, sampai] = rentang(mode, tgl);
    const r = lap.ringkasan;
    const baris: (string | number)[][] = [
      ["Laporan SnapQ", `${dari} s.d. ${sampai}`],
      [],
      ["Ringkasan"],
      ["Pendapatan (Rp)", r.pendapatan],
      ["Booking dibayar", r.booking_dibayar],
      ["Sesi selesai", r.sesi_selesai],
      ["Tidak hadir", r.tidak_hadir],
      ["Dibatalkan", r.dibatalkan],
      ["Rata-rata waktu layanan (menit)", r.rata_menit ?? "-"],
      ["Orang dilayani", r.orang_dilayani],
      ["Cetak tambahan", r.cetak_tambahan],
      [],
      ["Tanggal", "Jumlah booking", "Pendapatan (Rp)"],
      ...lap.per_hari.map((h) => [h.tanggal, h.jml, h.pendapatan]),
      [],
      ["Paket", "Jumlah booking", "Pendapatan (Rp)"],
      ...lap.per_paket.map((p) => [p.nama, p.jml, p.pendapatan]),
    ];
    const csv = baris
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-snapq-${dari}_${sampai}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!siap) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Memeriksa akses...</p>
      </main>
    );
  }

  const [dari, sampai] = rentang(mode, tgl);
  const maks = lap ? Math.max(1, ...lap.per_hari.map((h) => Number(h.pendapatan))) : 1;
  const maksPaket = lap ? Math.max(1, ...lap.per_paket.map((p) => Number(p.jml))) : 1;
  const r = lap?.ringkasan;
  const kosong = !!lap && lap.per_hari.length === 0 && lap.ringkasan.sesi_selesai === 0;

  const MODE: { kode: Mode; nama: string }[] = [
    { kode: "harian", nama: "Harian" },
    { kode: "mingguan", nama: "Mingguan" },
    { kode: "bulanan", nama: "Bulanan" },
  ];

  const kartu: [string, string, string][] = r
    ? [
        ["💰", "Pendapatan", rupiah(r.pendapatan)],
        ["🎟", "Booking dibayar", String(r.booking_dibayar)],
        ["✔", "Sesi selesai", String(r.sesi_selesai)],
        ["⏱", "Rata-rata waktu layanan", r.rata_menit !== null ? `${r.rata_menit} menit` : "-"],
        ["👥", "Orang dilayani", String(r.orang_dilayani)],
        ["🖨", "Cetak tambahan", String(r.cetak_tambahan)],
      ]
    : [];

  return (
    <main className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-widest text-indigo-600">📸 SNAPQ ADMIN</p>
            <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
          </div>
          <Link href="/admin" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow hover:bg-indigo-50">
            Dasbor
          </Link>
        </div>

        <section className="mb-4 rounded-2xl bg-white p-4 shadow-lg">
          <div className="grid grid-cols-3 gap-2">
            {MODE.map((m) => (
              <button key={m.kode} onClick={() => gantiMode(m.kode)}
                className={`rounded-xl py-2 text-sm font-semibold ${mode === m.kode ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                {m.nama}
              </button>
            ))}
          </div>
          <input type="date" value={tgl} onChange={(e) => gantiTgl(e.target.value)}
            className="mt-3 w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
          <p className="mt-2 text-center text-sm text-gray-600">
            {dari === sampai
              ? label(dari, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
              : `${label(dari, { day: "numeric", month: "short" })} - ${label(sampai, { day: "numeric", month: "short", year: "numeric" })}`}
          </p>
        </section>

        {pesan && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{pesan}</p>}
        {loading && <p className="text-gray-500">Memuat laporan...</p>}

        {!loading && lap && (
          <div className="space-y-5">
            {kosong && (
              <p className="rounded-2xl bg-white p-6 text-center text-gray-500 shadow-lg">
                Belum ada data untuk periode ini.
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {kartu.map(([ikon, nama, nilai]) => (
                <div key={nama} className="rounded-2xl bg-white p-4 shadow-lg">
                  <div className="text-2xl">{ikon}</div>
                  <p className="mt-1 text-xs text-gray-500">{nama}</p>
                  <p className="text-lg font-bold text-gray-900">{nilai}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500">
              Tidak hadir: {lap.ringkasan.tidak_hadir} · Dibatalkan: {lap.ringkasan.dibatalkan}. Pendapatan dihitung dari pembayaran
              booking yang tidak dibatalkan, berdasarkan tanggal sesi. Rata-rata waktu layanan dihitung dari sesi yang dimulai dan
              diselesaikan lewat panel admin.
            </p>

            <section className="rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="mb-3 text-lg font-bold text-gray-900">Pendapatan per Hari</h2>
              {lap.per_hari.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada pembayaran.</p>
              ) : (
                <ul className="space-y-3">
                  {lap.per_hari.map((h) => (
                    <li key={h.tanggal}>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">{label(h.tanggal, { weekday: "short", day: "numeric", month: "short" })} · {h.jml} booking</span>
                        <span className="font-semibold text-gray-900">{rupiah(h.pendapatan)}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-gray-100">
                        <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${(Number(h.pendapatan) / maks) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="mb-3 text-lg font-bold text-gray-900">Paket Terlaris</h2>
              {lap.per_paket.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada data paket.</p>
              ) : (
                <ol className="space-y-3">
                  {lap.per_paket.map((p, i) => (
                    <li key={p.nama}>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          <span className="mr-2 font-bold text-indigo-600">{i === 0 ? "🏆" : `#${i + 1}`}</span>
                          {p.nama}
                        </span>
                        <span className="font-semibold text-gray-900">{p.jml}x · {rupiah(p.pendapatan)}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-gray-100">
                        <div className="h-2 rounded-full bg-pink-500" style={{ width: `${(Number(p.jml) / maksPaket) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <button onClick={unduhCsv} className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white shadow hover:bg-emerald-700">
              ⬇ Unduh Laporan (CSV)
            </button>
          </div>
        )}
      </div>
    </main>
  );
}