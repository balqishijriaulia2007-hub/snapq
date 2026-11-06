"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Paket = { id: string; nama: string; jumlah_orang: number; harga: number; durasi_menit: number };
type Tambahan = { id: string; nama: string; harga: number };
type Terisi = { menit_mulai: number; menit_selesai: number };
type Hasil = { tanggal: string; mulai: number; selesai: number; paket: string; total: number; hemat: number };
type Harga = {
  ok: boolean;
  pesan?: string;
  potongan_member: number;
  persen_member: number;
  potongan_voucher: number;
  kode_voucher: string | null;
  total: number;
};
type Member = {
  sesi: number;
  tier: string;
  diskon_persen: number;
  berikut: string | null;
  sesi_menuju: number | null;
  diskon_berikut: number | null;
};

const rupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");
const jam = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}.${String(m % 60).padStart(2, "0")}`;
const tgl = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });
const menitSekarang = () => {
  const [h, m] = new Date()
    .toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .split(":")
    .map(Number);
  return h * 60 + m;
};

export default function Booking() {
  const router = useRouter();

  const [hariIni, setHariIni] = useState("");
  const [batas, setBatas] = useState("");
  const [sekarang, setSekarang] = useState(0);
  const [paket, setPaket] = useState<Paket[]>([]);
  const [tambahan, setTambahan] = useState<Tambahan[]>([]);
  const [paketId, setPaketId] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [mulai, setMulai] = useState<number | null>(null);
  const [tWaktu, setTWaktu] = useState(0);
  const [tCetak, setTCetak] = useState(0);
  const [terisi, setTerisi] = useState<Terisi[]>([]);
  const [loading, setLoading] = useState(true);
  const [mengirim, setMengirim] = useState(false);
  const [pesan, setPesan] = useState("");
  const [hasil, setHasil] = useState<Hasil | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [kodeInput, setKodeInput] = useState("");
  const [kodeTerpakai, setKodeTerpakai] = useState("");
  const [pesanVoucher, setPesanVoucher] = useState("");
  const [harga, setHarga] = useState<Harga | null>(null);

  useEffect(() => {
    const d = tgl(new Date());
    setHariIni(d);
    setTanggal(d);
    setBatas(tgl(new Date(Date.now() + 30 * 86400000)));
    setSekarang(menitSekarang());

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/masuk");
    });
    supabase.rpc("info_member").then(({ data }) => {
      if (data) setMember(data as Member);
    });
    Promise.all([
      supabase.from("layanan").select("id,nama,jumlah_orang,harga,durasi_menit").eq("aktif", true).order("jumlah_orang"),
      supabase.from("tambahan").select("id,nama,harga").eq("aktif", true),
    ]).then(([a, b]) => {
      if (a.error || b.error) setPesan("Gagal memuat data. Coba muat ulang halaman.");
      else {
        setPaket(a.data ?? []);
        setTambahan(b.data ?? []);
        if (a.data?.length) setPaketId(a.data[0].id);
      }
      setLoading(false);
    });
  }, [router]);

  useEffect(() => {
    if (!tanggal) return;
    setSekarang(menitSekarang());
    supabase.rpc("slot_terisi", { p_tanggal: tanggal }).then(({ data }) => {
      setTerisi((data as Terisi[]) ?? []);
    });
  }, [tanggal, hasil]);

  const terpilih = paket.find((p) => p.id === paketId);
  const hargaWaktu = tambahan.find((t) => /extra time/i.test(t.nama))?.harga ?? 0;
  const hargaCetak = tambahan.find((t) => /print/i.test(t.nama))?.harga ?? 0;
  const lama = terpilih ? Math.ceil((terpilih.durasi_menit + tWaktu * 10 + 5) / 15) * 15 : 15;
  const subtotal = terpilih ? terpilih.harga + tWaktu * hargaWaktu + tCetak * hargaCetak : 0;
  const total = harga?.total ?? subtotal;

  useEffect(() => {
    if (!terpilih) return;
    let batal = false;
    supabase
      .rpc("cek_voucher", { p_subtotal: subtotal, p_kode: kodeTerpakai || null })
      .then(({ data, error }) => {
        if (batal) return;
        if (error) {
          setHarga(null);
          setPesanVoucher("Gagal menghitung harga. Coba lagi.");
          return;
        }
        const h = data as Harga;
        if (!h.ok) {
          if (kodeTerpakai) {
            setPesanVoucher(h.pesan ?? "Voucher tidak bisa dipakai.");
            setKodeTerpakai("");
          } else {
            setHarga(null);
          }
          return;
        }
        setHarga(h);
      });
    return () => {
      batal = true;
    };
  }, [terpilih, subtotal, kodeTerpakai]);

  const slot = useMemo(() => {
    const daftar: { s: number; kosong: boolean }[] = [];
    for (let s = 600; s + lama <= 1260; s += 15) {
      const bentrok = terisi.some((t) => s < t.menit_selesai && s + lama > t.menit_mulai);
      const lewat = tanggal === hariIni && s <= sekarang;
      daftar.push({ s, kosong: !bentrok && !lewat });
    }
    return daftar;
  }, [terisi, lama, tanggal, hariIni, sekarang]);

  function pakaiVoucher() {
    const k = kodeInput.trim().toUpperCase();
    if (!k) {
      setPesanVoucher("Ketik kode voucher dulu.");
      return;
    }
    setPesanVoucher("");
    setKodeTerpakai(k);
  }

  function hapusVoucher() {
    setKodeTerpakai("");
    setKodeInput("");
    setPesanVoucher("");
  }

  async function kirim() {
    if (!terpilih || mulai === null) return;
    setMengirim(true);
    setPesan("");
    const { error } = await supabase.rpc("buat_booking", {
      p_layanan: terpilih.id,
      p_tanggal: tanggal,
      p_mulai: mulai,
      p_tambah_waktu: tWaktu,
      p_tambah_cetak: tCetak,
      p_kode_voucher: kodeTerpakai || null,
    });
    setMengirim(false);
    if (error) {
      setPesan(
        error.message.includes("tidak_bentrok")
          ? "Jam ini baru saja dipesan orang lain. Pilih jam lain."
          : error.message
      );
      setMulai(null);
      return;
    }
    setHasil({
      tanggal,
      mulai,
      selesai: mulai + lama,
      paket: terpilih.nama,
      total,
      hemat: (harga?.potongan_member ?? 0) + (harga?.potongan_voucher ?? 0),
    });
  }

  const kartu = "rounded-2xl bg-white p-6 shadow-lg";
  const tombolKecil = "h-9 w-9 rounded-full bg-indigo-50 text-lg font-bold text-indigo-600 hover:bg-indigo-100 disabled:opacity-40";

  if (hasil) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="text-5xl">🎉</div>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Booking Tersimpan</h1>
          <div className="mt-5 space-y-1 text-sm text-gray-700">
            <p className="font-semibold">{hasil.paket}</p>
            <p>{new Date(hasil.tanggal + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
            <p>Pukul {jam(hasil.mulai)} - {jam(hasil.selesai)}</p>
            <p className="pt-2 text-xl font-bold text-indigo-600">{rupiah(hasil.total)}</p>
            {hasil.hemat > 0 && <p className="text-xs font-semibold text-emerald-600">Kamu hemat {rupiah(hasil.hemat)}</p>}
          </div>
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            Status: menunggu pembayaran. Bayar dalam 15 menit lewat halaman Booking Saya.
          </p>
          <button onClick={() => { setHasil(null); setMulai(null); hapusVoucher(); }} className="mt-5 w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow hover:bg-indigo-700">
            Booking Lagi
          </button>
          <Link href="/booking-saya" className="mt-3 block text-sm font-semibold text-indigo-600 hover:underline">Lihat nomor antrean saya</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-widest text-indigo-600">📸 SNAPQ</p>
            <h1 className="text-2xl font-bold text-gray-900">Booking Sesi Foto</h1>
          </div>
          <Link href="/akun" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow hover:bg-indigo-50">Akun</Link>
        </div>

        {loading && <p className="text-gray-500">Memuat...</p>}

        {!loading && (
          <div className="space-y-5">
            {member && (
              <section className="flex items-center gap-4 rounded-2xl bg-linear-to-r from-amber-100 to-pink-100 p-4 shadow-lg">
                <div className="text-4xl">🏅</div>
                <div className="text-sm text-gray-700">
                  <p className="text-base font-bold text-gray-900">
                    Member {member.tier}
                    {member.diskon_persen > 0 && <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">diskon {member.diskon_persen}%</span>}
                  </p>
                  <p>{member.sesi} sesi selesai</p>
                  {member.berikut && member.sesi_menuju !== null && (
                    <p className="text-xs text-gray-500">{member.sesi_menuju} sesi lagi menuju {member.berikut} (diskon {member.diskon_berikut}%)</p>
                  )}
                </div>
              </section>
            )}

            <section className={kartu}>
              <h2 className="mb-3 text-lg font-bold text-gray-900">1. Pilih Paket</h2>
              <div className="space-y-2">
                {paket.map((p) => (
                  <button key={p.id} onClick={() => { setPaketId(p.id); setMulai(null); }}
                    className={`flex w-full items-center justify-between rounded-xl border-2 p-3 text-left ${paketId === p.id ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-indigo-300"}`}>
                    <span>
                      <span className="block font-semibold text-gray-900">{p.nama}</span>
                      <span className="text-xs text-gray-500">👥 {p.jumlah_orang} orang</span>
                    </span>
                    <span className="font-bold text-indigo-600">{rupiah(p.harga)}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className={kartu}>
              <h2 className="mb-3 text-lg font-bold text-gray-900">2. Pilih Tanggal dan Jam</h2>
              <input type="date" value={tanggal} min={hariIni} max={batas}
                onChange={(e) => { if (e.target.value) { setTanggal(e.target.value); setMulai(null); } }}
                className="mb-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
              <p className="mb-2 text-xs text-gray-500">Durasi sesi termasuk waktu pergantian: {lama} menit. Buka setiap hari 10.00 - 21.00.</p>
              {slot.length === 0 ? (
                <p className="text-sm text-gray-500">Tidak ada jam yang muat untuk paket ini.</p>
              ) : (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {slot.map(({ s, kosong }) => (
                    <button key={s} disabled={!kosong} onClick={() => setMulai(s)}
                      className={`rounded-lg py-2 text-sm font-medium ${mulai === s ? "bg-indigo-600 text-white" : kosong ? "bg-gray-100 text-gray-800 hover:bg-indigo-100" : "cursor-not-allowed bg-gray-50 text-gray-300 line-through"}`}>
                      {jam(s)}
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className={kartu}>
              <h2 className="mb-3 text-lg font-bold text-gray-900">3. Tambahan (opsional)</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Add Extra Time 10 Menit</p>
                    <p className="text-xs text-gray-500">{rupiah(hargaWaktu)} per 10 menit (maks. 3)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className={tombolKecil} disabled={tWaktu === 0} onClick={() => { setTWaktu(tWaktu - 1); setMulai(null); }}>-</button>
                    <span className="w-4 text-center font-semibold text-gray-900">{tWaktu}</span>
                    <button className={tombolKecil} disabled={tWaktu === 3} onClick={() => { setTWaktu(tWaktu + 1); setMulai(null); }}>+</button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Add Print</p>
                    <p className="text-xs text-gray-500">{rupiah(hargaCetak)} per cetak (maks. 10)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className={tombolKecil} disabled={tCetak === 0} onClick={() => setTCetak(tCetak - 1)}>-</button>
                    <span className="w-4 text-center font-semibold text-gray-900">{tCetak}</span>
                    <button className={tombolKecil} disabled={tCetak === 10} onClick={() => setTCetak(tCetak + 1)}>+</button>
                  </div>
                </div>
              </div>
            </section>

            <section className={kartu}>
              <h2 className="mb-3 text-lg font-bold text-gray-900">4. Voucher (opsional)</h2>
              {harga?.kode_voucher ? (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3">
                  <p className="text-sm text-emerald-700">
                    ✓ Voucher <span className="font-bold">{harga.kode_voucher}</span> dipakai, hemat {rupiah(harga.potongan_voucher)}
                  </p>
                  <button onClick={hapusVoucher} className="text-sm font-semibold text-red-500 hover:underline">Hapus</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={kodeInput} onChange={(e) => setKodeInput(e.target.value.toUpperCase())} placeholder="Masukkan kode voucher"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 font-mono text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
                  <button onClick={pakaiVoucher} className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700">Pakai</button>
                </div>
              )}
              {pesanVoucher && <p className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">{pesanVoucher}</p>}
            </section>

            <section className={kartu}>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{rupiah(subtotal)}</span></div>
                {harga && harga.potongan_member > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Diskon member ({harga.persen_member}%)</span><span>- {rupiah(harga.potongan_member)}</span>
                  </div>
                )}
                {harga?.kode_voucher && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Voucher {harga.kode_voucher}</span><span>- {rupiah(harga.potongan_voucher)}</span>
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
                <p className="text-gray-600">Total</p>
                <p className="text-2xl font-bold text-indigo-600">{rupiah(total)}</p>
              </div>
              {mulai !== null && (
                <p className="mt-1 text-sm text-gray-500">Pukul {jam(mulai)} - {jam(mulai + lama)}</p>
              )}
              {pesan && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">{pesan}</p>}
              <button disabled={mulai === null || mengirim} onClick={kirim}
                className="mt-4 w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-50">
                {mengirim ? "Memproses..." : mulai === null ? "Pilih jam dulu" : "Konfirmasi Booking"}
              </button>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}