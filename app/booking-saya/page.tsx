"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { unduhTiket } from "@/lib/tiket";
 
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
  batas_bayar: string;
};
 
const rupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");
const jam = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}.${String(m % 60).padStart(2, "0")}`;
const jamIso = (iso: string) =>
  new Date(iso)
    .toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .replace(":", ".");
const vaDari = (id: string) => {
  const d = "8808" + id.replace(/\D/g, "").padEnd(12, "0").slice(0, 12);
  return d.match(/.{1,4}/g)?.join(" ") ?? d;
};
 
const STATUS: Record<string, { label: string; warna: string }> = {
  menunggu_pembayaran: { label: "Menunggu pembayaran", warna: "bg-amber-100 text-amber-700" },
  lunas: { label: "Lunas, siap dilayani", warna: "bg-emerald-100 text-emerald-700" },
  berlangsung: { label: "Sedang berlangsung", warna: "bg-indigo-100 text-indigo-700" },
  selesai: { label: "Selesai", warna: "bg-gray-100 text-gray-600" },
  tidak_hadir: { label: "Tidak hadir", warna: "bg-red-100 text-red-600" },
};
 
const METODE = [
  { kode: "qris", label: "QRIS", ikon: "📱" },
  { kode: "transfer", label: "Transfer Bank", ikon: "🏦" },
  { kode: "e_wallet", label: "E-Wallet", ikon: "👛" },
];
 
const EWALLET = [
  "GoPay", "OVO", "DANA", "ShopeePay", "LinkAja",
  "Sakuku (BCA)", "Jenius Pay", "i.saku", "DOKU Wallet", "AstraPay",
];
 
const BANK = [
  "Bank Mandiri", "Bank BRI", "Bank BNI", "Bank BTN", "Bank Syariah Indonesia (BSI)",
  "Bank BCA", "Bank CIMB Niaga", "Bank Danamon", "Bank Permata", "Bank OCBC",
  "Bank Panin", "Bank Maybank Indonesia", "Bank UOB Indonesia", "Bank Mega", "Bank BTPN",
  "Bank Sinarmas", "KB Bank (Bukopin)", "Bank Mayapada", "Bank Victoria", "Bank Artha Graha",
  "Bank China Construction Bank Indonesia", "Bank ICBC Indonesia", "Bank Woori Saudara",
  "Bank Shinhan Indonesia", "Bank QNB Indonesia", "Bank Capital Indonesia", "Bank Index Selindo",
  "Bank MNC Internasional", "Bank Ganesha", "Bank JTrust Indonesia", "Bank Bumi Arta",
  "Bank Mestika Dharma", "Bank Nationalnobu", "Bank Oke Indonesia", "Bank Resona Perdania",
  "Bank SBI Indonesia", "Bank DBS Indonesia", "HSBC Indonesia", "Standard Chartered Indonesia",
  "Bank Mizuho Indonesia", "Bank Sumitomo Mitsui Indonesia (SMBC)",
  "Bank Jago", "SeaBank", "Bank Neo Commerce", "blu by BCA Digital", "Allo Bank",
  "Bank Raya Indonesia", "Krom Bank", "Superbank", "Bank Amar Indonesia",
  "Bank Muamalat", "Bank Mega Syariah", "Bank Panin Dubai Syariah", "BCA Syariah",
  "BTPN Syariah", "Bank Victoria Syariah", "Bank BJB Syariah", "Bank Aladin Syariah",
  "Bank DKI", "Bank BJB", "Bank Jateng", "Bank Jatim", "Bank BPD DIY", "Bank Sumut",
  "Bank Nagari", "Bank Riau Kepri Syariah", "Bank Sumsel Babel", "Bank Lampung",
  "Bank Kalbar", "Bank Kalsel", "Bank Kaltimtara", "Bank Kalteng", "Bank Sulselbar",
  "Bank SulutGo", "Bank Sultra", "Bank BPD Bali", "Bank NTB Syariah", "Bank NTT",
  "Bank Maluku Malut", "Bank Papua", "Bank Jambi", "Bank Bengkulu", "Bank Aceh Syariah",
];
 
export default function BookingSaya() {
  const router = useRouter();
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [pesan, setPesan] = useState("");
  const [bayarId, setBayarId] = useState<string | null>(null);
  const [metode, setMetode] = useState("qris");
  const [channel, setChannel] = useState("");
  const [cari, setCari] = useState("");
  const [memproses, setMemproses] = useState(false);
  const [pesanBayar, setPesanBayar] = useState("");
 
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
 
  function gantiMetode(kode: string) {
    setMetode(kode);
    setChannel("");
    setCari("");
    setPesanBayar("");
  }
 
  async function bayar(id: string) {
    setMemproses(true);
    setPesanBayar("");
    const { error } = await supabase.rpc("bayar_booking", {
      p_booking: id,
      p_metode: metode,
      p_channel: metode === "qris" ? null : channel,
    });
    setMemproses(false);
    if (error) {
      setPesanBayar(error.message);
      return;
    }
    setBayarId(null);
    muat();
  }
 
  const bankTampil = BANK.filter((b) => b.toLowerCase().includes(cari.trim().toLowerCase()));
  const siapBayar = metode === "qris" || channel !== "";
 
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
            const belumBayar = b.status === "menunggu_pembayaran";
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
 
                  {(b.status === "lunas" || b.status === "berlangsung") && (
                    <button
                      onClick={() => unduhTiket(b)}
                      className="mt-3 w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white shadow hover:bg-emerald-700"
                    >
                      Unduh Tiket PDF
                    </button>
                  )}
 
                  {belumBayar && bayarId !== b.id && (
                    <div className="mt-3">
                      <p className="mb-2 text-xs text-amber-700">Bayar sebelum pukul {jamIso(b.batas_bayar)}, atau booking otomatis dibatalkan.</p>
                      <button onClick={() => { setBayarId(b.id); gantiMetode("qris"); }}
                        className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow hover:bg-indigo-700">
                        Bayar Sekarang
                      </button>
                    </div>
                  )}
 
                  {belumBayar && bayarId === b.id && (
                    <div className="mt-3 space-y-3 rounded-xl border-2 border-indigo-200 p-4">
                      <p className="font-semibold text-gray-900">Pilih metode pembayaran</p>
                      <div className="grid grid-cols-3 gap-2">
                        {METODE.map((m) => (
                          <button key={m.kode} onClick={() => gantiMetode(m.kode)}
                            className={`rounded-xl border-2 p-3 text-center text-xs font-semibold ${metode === m.kode ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-700"}`}>
                            <span className="block text-2xl">{m.ikon}</span>
                            {m.label}
                          </button>
                        ))}
                      </div>
 
                      {metode === "qris" && (
                        <div className="rounded-xl bg-gray-50 p-4 text-center">
                          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-5xl">
                            ▦
                          </div>
                          <p className="mt-2 text-xs text-gray-500">QR simulasi. Scan lewat aplikasi pembayaran apa pun yang mendukung QRIS.</p>
                        </div>
                      )}
 
                      {metode === "transfer" && (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-900">Pilih bank ({BANK.length} bank tersedia)</p>
                          <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari bank, misalnya BCA atau Jago"
                            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
                          <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-gray-200 p-1">
                            {bankTampil.length === 0 && <p className="p-3 text-sm text-gray-500">Bank tidak ditemukan.</p>}
                            {bankTampil.map((nama) => (
                              <button key={nama} onClick={() => setChannel(nama)}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${channel === nama ? "bg-indigo-600 text-white" : "text-gray-800 hover:bg-indigo-50"}`}>
                                <span>{nama}</span>
                                {channel === nama && <span>✓</span>}
                              </button>
                            ))}
                          </div>
                          {channel && (
                            <div className="rounded-xl bg-indigo-50 p-3 text-sm">
                              <p className="text-xs text-gray-500">Transfer ke Virtual Account {channel}</p>
                              <p className="mt-1 font-mono text-lg font-bold tracking-wider text-indigo-700">{vaDari(b.id)}</p>
                              <p className="mt-1 text-xs text-gray-500">Nomor VA simulasi, bukan rekening asli. Jumlah: {rupiah(b.total_harga)}</p>
                            </div>
                          )}
                        </div>
                      )}
 
                      {metode === "e_wallet" && (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-900">Pilih e-wallet</p>
                          <div className="grid grid-cols-2 gap-2">
                            {EWALLET.map((nama) => (
                              <button key={nama} onClick={() => setChannel(nama)}
                                className={`flex items-center gap-2 rounded-xl border-2 p-3 text-left text-sm font-semibold ${channel === nama ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-800"}`}>
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                                  {nama.charAt(0)}
                                </span>
                                {nama}
                              </button>
                            ))}
                          </div>
                          {channel && (
                            <div className="rounded-xl bg-indigo-50 p-3 text-sm">
                              <p>Buka aplikasi <span className="font-bold">{channel}</span>, lalu setujui pembayaran {rupiah(b.total_harga)}.</p>
                              <p className="mt-1 text-xs text-gray-500">Simulasi: tidak ada aplikasi yang benar-benar dibuka.</p>
                            </div>
                          )}
                        </div>
                      )}
 
                      <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
                        Mode simulasi: tidak ada uang sungguhan yang dipotong.
                      </p>
                      {pesanBayar && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{pesanBayar}</p>}
                      <div className="flex gap-2">
                        <button onClick={() => setBayarId(null)} className="w-1/3 rounded-xl bg-gray-100 py-3 font-semibold text-gray-700 hover:bg-gray-200">
                          Batal
                        </button>
                        <button disabled={memproses || !siapBayar} onClick={() => bayar(b.id)}
                          className="w-2/3 rounded-xl bg-emerald-600 py-3 font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50">
                          {memproses ? "Memproses..." : siapBayar ? `Bayar ${rupiah(b.total_harga)}` : "Pilih dulu"}
                        </button>
                      </div>
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