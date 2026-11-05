"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import { supabase } from "@/lib/supabase";

type Tiket = {
  id: string;
  kode_tiket: string;
  nomor: number | null;
  tanggal: string;
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
const hariIni = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });

const INFO: Record<string, { teks: string; ok: boolean }> = {
  lunas: { teks: "Tiket valid, siap dipakai", ok: true },
  dipanggil: { teks: "Tiket valid, pelanggan sudah dipanggil", ok: true },
  berlangsung: { teks: "Sesi ini sedang berlangsung", ok: false },
  menunggu_pembayaran: { teks: "Belum dibayar, tiket belum berlaku", ok: false },
  selesai: { teks: "Tiket sudah dipakai (sesi selesai)", ok: false },
  tidak_hadir: { teks: "Tiket tidak berlaku (ditandai tidak hadir)", ok: false },
  dibatalkan: { teks: "Tiket tidak berlaku (booking dibatalkan)", ok: false },
};

export default function Verifikasi() {
  const router = useRouter();
  const [siap, setSiap] = useState(false);
  const [kode, setKode] = useState("");
  const [tiket, setTiket] = useState<Tiket | null>(null);
  const [pesan, setPesan] = useState("");
  const [kameraAktif, setKameraAktif] = useState(false);
  const [sibuk, setSibuk] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const terkunci = useRef(false);

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
      setSiap(true);
    }
    cek();
  }, [router]);

  function hentikanKamera() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setKameraAktif(false);
  }

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function cari(k: string) {
    setPesan("");
    setTiket(null);
    const { data, error } = await supabase.rpc("admin_cari_tiket", { p_kode: k });
    if (error) setPesan("Gagal memeriksa tiket. Coba lagi.");
    else if (!data || data.length === 0) setPesan(`Kode "${k.toUpperCase()}" tidak ditemukan.`);
    else setTiket(data[0] as Tiket);
  }

  async function mulaiKamera() {
    setPesan("");
    setTiket(null);
    terkunci.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setKameraAktif(true);
      const loop = () => {
        const v = videoRef.current;
        const c = canvasRef.current;
        if (!v || !c || !streamRef.current) return;
        if (v.readyState === v.HAVE_ENOUGH_DATA && !terkunci.current) {
          c.width = v.videoWidth;
          c.height = v.videoHeight;
          const ctx = c.getContext("2d", { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(v, 0, 0, c.width, c.height);
            const img = ctx.getImageData(0, 0, c.width, c.height);
            const hasil = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
            if (hasil && /^SNQ-[A-Z0-9]{8}$/i.test(hasil.data.trim())) {
              terkunci.current = true;
              const k = hasil.data.trim().toUpperCase();
              setKode(k);
              hentikanKamera();
              cari(k);
              return;
            }
          }
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch {
      setPesan("Kamera tidak bisa dibuka. Izinkan akses kamera di browser, atau ketik kode tiket secara manual.");
    }
  }

  async function cekManual(e: React.FormEvent) {
    e.preventDefault();
    if (!kode.trim()) return;
    hentikanKamera();
    await cari(kode);
  }

  async function mulaiSesi() {
    if (!tiket) return;
    setSibuk(true);
    setPesan("");
    const { error } = await supabase.rpc("admin_ubah_status", { p_id: tiket.id, p_status: "berlangsung" });
    setSibuk(false);
    if (error) {
      setPesan(error.message);
      return;
    }
    await cari(tiket.kode_tiket);
  }

  function scanLagi() {
    setTiket(null);
    setKode("");
    setPesan("");
    mulaiKamera();
  }

  const info = tiket ? INFO[tiket.status] ?? { teks: tiket.status, ok: false } : null;
  const hariLain = tiket ? tiket.tanggal !== hariIni() : false;
  const bisaMulai = !!tiket && !!info?.ok && !hariLain;

  if (!siap) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Memeriksa akses...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 sm:p-8">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-widest text-indigo-600">📸 SNAPQ ADMIN</p>
            <h1 className="text-2xl font-bold text-gray-900">Verifikasi Tiket</h1>
          </div>
          <Link href="/admin" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow hover:bg-indigo-50">
            Dasbor
          </Link>
        </div>

        <section className="rounded-2xl bg-white p-5 shadow-lg">
          <div className={`overflow-hidden rounded-xl bg-black ${kameraAktif ? "block" : "hidden"}`}>
            <video ref={videoRef} playsInline muted className="h-64 w-full object-cover" />
          </div>
          <canvas ref={canvasRef} className="hidden" />
          {kameraAktif ? (
            <div className="mt-3 space-y-2">
              <p className="text-center text-sm text-gray-600">Arahkan kamera ke QR code tiket...</p>
              <button onClick={hentikanKamera} className="w-full rounded-xl bg-gray-100 py-3 font-semibold text-gray-700 hover:bg-gray-200">
                Matikan kamera
              </button>
            </div>
          ) : (
            <button onClick={mulaiKamera} className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow hover:bg-indigo-700">
              📷 Buka Kamera dan Scan QR
            </button>
          )}

          <form onSubmit={cekManual} className="mt-4 flex gap-2">
            <input value={kode} onChange={(e) => setKode(e.target.value.toUpperCase())} placeholder="Atau ketik kode: SNQ-XXXXXXXX"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 font-mono text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
            <button className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700">Cek</button>
          </form>
        </section>

        {pesan && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{pesan}</p>}

        {tiket && info && (
          <section className="mt-4 overflow-hidden rounded-2xl bg-white shadow-lg">
            <div className={`px-5 py-4 text-white ${info.ok && !hariLain ? "bg-emerald-600" : "bg-red-500"}`}>
              <p className="text-lg font-bold">{info.ok && !hariLain ? "✔ " : "✖ "}{info.teks}</p>
              {hariLain && (
                <p className="text-sm opacity-90">
                  Tiket ini untuk tanggal {new Date(tiket.tanggal + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}, bukan hari ini.
                </p>
              )}
            </div>
            <div className="space-y-2 p-5 text-sm">
              {([
                ["Nomor antrean", String(tiket.nomor ?? "-")],
                ["Kode", tiket.kode_tiket],
                ["Nama", tiket.nama_pelanggan ?? "-"],
                ["HP", tiket.hp ?? "-"],
                ["Paket", `${tiket.paket} (${tiket.jumlah_orang} orang)`],
                ["Jam", `${jam(tiket.menit_mulai)} - ${jam(tiket.menit_selesai)}`],
                ["Cetak tambahan", tiket.tambah_cetak > 0 ? `${tiket.tambah_cetak}x` : "-"],
                ["Tambah waktu", tiket.tambah_waktu > 0 ? `${tiket.tambah_waktu}x 10 menit` : "-"],
                ["Total", rupiah(tiket.total_harga)],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-gray-500">{k}</span>
                  <span className="text-right font-semibold text-gray-900">{v}</span>
                </div>
              ))}
              <div className="flex gap-2 pt-3">
                <button disabled={!bisaMulai || sibuk} onClick={mulaiSesi}
                  className="w-2/3 rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-40">
                  {sibuk ? "Memproses..." : "▶ Mulai Sesi"}
                </button>
                <button onClick={scanLagi} className="w-1/3 rounded-xl bg-gray-100 py-3 font-semibold text-gray-700 hover:bg-gray-200">
                  Scan lagi
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}