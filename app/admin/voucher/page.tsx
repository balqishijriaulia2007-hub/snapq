"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Voucher = {
  id: string;
  kode: string;
  deskripsi: string | null;
  jenis: "persen" | "nominal";
  nilai: number;
  maks_potongan: number | null;
  min_belanja: number;
  kuota: number | null;
  terpakai: number;
  berlaku_dari: string;
  berlaku_sampai: string;
  aktif: boolean;
};
type FormV = {
  id: string | null;
  kode: string;
  deskripsi: string;
  jenis: "persen" | "nominal";
  nilai: string;
  maks: string;
  min: string;
  kuota: string;
  dari: string;
  sampai: string;
  aktif: boolean;
};
type Tier = { id: string; nama: string; min_sesi: number; diskon_persen: number; aktif: boolean };
type FormT = { id: string | null; nama: string; min_sesi: string; diskon: string; aktif: boolean };
type Pelanggan = { id: string; nama: string | null; hp: string | null; sesi: number; tier: string; diskon_persen: number };

const rupiah = (n: number) => "Rp " + Number(n).toLocaleString("id-ID");
const WIB = { timeZone: "Asia/Jakarta" } as const;
const input =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

function voucherBaru(): FormV {
  return {
    id: null,
    kode: "",
    deskripsi: "",
    jenis: "persen",
    nilai: "",
    maks: "",
    min: "0",
    kuota: "",
    dari: new Date().toLocaleDateString("sv-SE", WIB),
    sampai: new Date(Date.now() + 30 * 86400000).toLocaleDateString("sv-SE", WIB),
    aktif: true,
  };
}
const tierBaru = (): FormT => ({ id: null, nama: "", min_sesi: "", diskon: "", aktif: true });
const angkaKosong = (s: string) => (s.trim() === "" ? null : Number(s));

export default function AdminVoucher() {
  const router = useRouter();
  const [siap, setSiap] = useState(false);
  const [hariIni, setHariIni] = useState("");
  const [voucher, setVoucher] = useState<Voucher[]>([]);
  const [tier, setTier] = useState<Tier[]>([]);
  const [pelanggan, setPelanggan] = useState<Pelanggan[]>([]);
  const [fv, setFv] = useState<FormV | null>(null);
  const [ft, setFt] = useState<FormT | null>(null);
  const [loading, setLoading] = useState(true);
  const [pesan, setPesan] = useState("");
  const [ok, setOk] = useState("");
  const [sibuk, setSibuk] = useState(false);

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
      setHariIni(new Date().toLocaleDateString("sv-SE", WIB));
      setSiap(true);
    }
    cek();
  }, [router]);

  const muat = useCallback(async () => {
    const [a, b, c] = await Promise.all([
      supabase.rpc("admin_daftar_voucher"),
      supabase.from("member_tier").select("id,nama,min_sesi,diskon_persen,aktif").order("min_sesi"),
      supabase.rpc("admin_daftar_pelanggan"),
    ]);
    if (a.error || b.error || c.error) setPesan("Gagal memuat data. Coba muat ulang halaman.");
    else {
      setVoucher((a.data as Voucher[]) ?? []);
      setTier((b.data as Tier[]) ?? []);
      setPelanggan((c.data as Pelanggan[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (siap) muat();
  }, [siap, muat]);

  function info(teks: string) {
    setOk(teks);
    setTimeout(() => setOk(""), 3000);
  }

  async function simpanVoucher(f: FormV) {
    const nilai = Number(f.nilai);
    if (!/^[A-Za-z0-9_-]{3,20}$/.test(f.kode.trim())) return setPesan("Kode 3 sampai 20 karakter: huruf, angka, strip, atau garis bawah.");
    if (!Number.isInteger(nilai) || nilai <= 0) return setPesan("Nilai harus angka bulat lebih dari 0.");
    if (f.jenis === "persen" && nilai > 100) return setPesan("Voucher persen maksimal 100.");
    for (const [nama, v] of [["Maksimal potongan", f.maks], ["Minimal belanja", f.min], ["Kuota", f.kuota]] as [string, string][]) {
      if (v.trim() !== "" && (!Number.isInteger(Number(v)) || Number(v) < 0)) return setPesan(`${nama} harus angka bulat.`);
    }
    if (!f.dari || !f.sampai || f.sampai < f.dari) return setPesan("Tanggal berlaku tidak valid.");
    setSibuk(true);
    setPesan("");
    const { error } = await supabase.rpc("admin_simpan_voucher", {
      p_id: f.id,
      p_kode: f.kode,
      p_deskripsi: f.deskripsi,
      p_jenis: f.jenis,
      p_nilai: nilai,
      p_maks: f.jenis === "persen" ? angkaKosong(f.maks) : null,
      p_min: angkaKosong(f.min) ?? 0,
      p_kuota: angkaKosong(f.kuota),
      p_dari: f.dari,
      p_sampai: f.sampai,
      p_aktif: f.aktif,
    });
    setSibuk(false);
    if (error) return setPesan(error.message);
    setFv(null);
    info(f.id ? "Voucher diperbarui." : "Voucher ditambahkan.");
    muat();
  }

  async function ubahAktifVoucher(v: Voucher) {
    setPesan("");
    const { error } = await supabase.rpc("admin_simpan_voucher", {
      p_id: v.id,
      p_kode: v.kode,
      p_deskripsi: v.deskripsi ?? "",
      p_jenis: v.jenis,
      p_nilai: v.nilai,
      p_maks: v.maks_potongan,
      p_min: v.min_belanja,
      p_kuota: v.kuota,
      p_dari: v.berlaku_dari,
      p_sampai: v.berlaku_sampai,
      p_aktif: !v.aktif,
    });
    if (error) setPesan(error.message);
    else info(v.aktif ? "Voucher dinonaktifkan." : "Voucher diaktifkan.");
    muat();
  }

  async function simpanTier(f: FormT) {
    const min = Number(f.min_sesi);
    const diskon = Number(f.diskon);
    if (f.nama.trim().length < 2) return setPesan("Nama tingkat minimal 2 karakter.");
    if (f.min_sesi.trim() === "" || !Number.isInteger(min) || min < 0) return setPesan("Minimal sesi harus angka bulat 0 atau lebih.");
    if (f.diskon.trim() === "" || !Number.isInteger(diskon) || diskon < 0 || diskon > 100) return setPesan("Diskon harus angka bulat 0 sampai 100.");
    setSibuk(true);
    setPesan("");
    const { error } = await supabase.rpc("admin_simpan_member_tier", {
      p_id: f.id,
      p_nama: f.nama,
      p_min_sesi: min,
      p_diskon: diskon,
      p_aktif: f.aktif,
    });
    setSibuk(false);
    if (error) return setPesan(error.message);
    setFt(null);
    info(f.id ? "Tingkat diperbarui." : "Tingkat ditambahkan.");
    muat();
  }

  async function ubahAktifTier(t: Tier) {
    setPesan("");
    const { error } = await supabase.rpc("admin_simpan_member_tier", {
      p_id: t.id,
      p_nama: t.nama,
      p_min_sesi: t.min_sesi,
      p_diskon: t.diskon_persen,
      p_aktif: !t.aktif,
    });
    if (error) setPesan(error.message);
    else info(t.aktif ? "Tingkat dinonaktifkan." : "Tingkat diaktifkan.");
    muat();
  }

  const teksVoucher = (v: Voucher) =>
    (v.jenis === "persen"
      ? `${v.nilai}%${v.maks_potongan ? ` (maks ${rupiah(v.maks_potongan)})` : ""}`
      : rupiah(v.nilai)) + (v.min_belanja > 0 ? ` · min. belanja ${rupiah(v.min_belanja)}` : "");

  const statusVoucher = (v: Voucher) => {
    if (!v.aktif) return { t: "nonaktif", c: "bg-gray-100 text-gray-500" };
    if (hariIni && v.berlaku_sampai < hariIni) return { t: "kedaluwarsa", c: "bg-red-100 text-red-600" };
    if (hariIni && v.berlaku_dari > hariIni) return { t: "belum berlaku", c: "bg-amber-100 text-amber-700" };
    if (v.kuota !== null && Number(v.terpakai) >= v.kuota) return { t: "kuota habis", c: "bg-red-100 text-red-600" };
    return { t: "aktif", c: "bg-emerald-100 text-emerald-700" };
  };

  if (!siap) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Memeriksa akses...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-widest text-indigo-600">📸 SNAPQ ADMIN</p>
            <h1 className="text-2xl font-bold text-gray-900">Voucher dan Membership</h1>
          </div>
          <Link href="/admin" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow hover:bg-indigo-50">
            Dasbor
          </Link>
        </div>

        {pesan && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{pesan}</p>}
        {ok && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{ok}</p>}
        {loading && <p className="text-gray-500">Memuat...</p>}

        {!loading && (
          <div className="space-y-5">
            <section className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Voucher</h2>
                {!fv && (
                  <button onClick={() => { setFv(voucherBaru()); setPesan(""); }}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700">
                    + Tambah Voucher
                  </button>
                )}
              </div>

              {fv && (
                <div className="mb-4 space-y-3 rounded-xl border-2 border-indigo-200 p-4">
                  <p className="font-semibold text-gray-900">{fv.id ? "Ubah Voucher" : "Voucher Baru"}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">Kode</label>
                      <input className={`${input} font-mono`} value={fv.kode} onChange={(e) => setFv({ ...fv, kode: e.target.value.toUpperCase() })} placeholder="HEMAT5K" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Jenis</label>
                      <select className={input} value={fv.jenis} onChange={(e) => setFv({ ...fv, jenis: e.target.value as "persen" | "nominal" })}>
                        <option value="persen">Persen (%)</option>
                        <option value="nominal">Nominal (Rp)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Deskripsi (opsional)</label>
                    <input className={input} value={fv.deskripsi} onChange={(e) => setFv({ ...fv, deskripsi: e.target.value })} placeholder="Diskon akhir pekan" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">{fv.jenis === "persen" ? "Nilai (%)" : "Nilai (Rp)"}</label>
                      <input className={input} inputMode="numeric" value={fv.nilai} onChange={(e) => setFv({ ...fv, nilai: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Maks. potongan (Rp)</label>
                      <input className={`${input} disabled:bg-gray-100`} inputMode="numeric" disabled={fv.jenis !== "persen"} value={fv.jenis === "persen" ? fv.maks : ""} onChange={(e) => setFv({ ...fv, maks: e.target.value })} placeholder="kosong = bebas" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Min. belanja (Rp)</label>
                      <input className={input} inputMode="numeric" value={fv.min} onChange={(e) => setFv({ ...fv, min: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">Kuota</label>
                      <input className={input} inputMode="numeric" value={fv.kuota} onChange={(e) => setFv({ ...fv, kuota: e.target.value })} placeholder="kosong = bebas" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Berlaku dari</label>
                      <input type="date" className={input} value={fv.dari} onChange={(e) => setFv({ ...fv, dari: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Sampai</label>
                      <input type="date" className={input} value={fv.sampai} onChange={(e) => setFv({ ...fv, sampai: e.target.value })} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={fv.aktif} onChange={(e) => setFv({ ...fv, aktif: e.target.checked })} />
                    Voucher aktif
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => { setFv(null); setPesan(""); }} className="w-1/3 rounded-xl bg-gray-100 py-2 font-semibold text-gray-700 hover:bg-gray-200">Batal</button>
                    <button disabled={sibuk} onClick={() => simpanVoucher(fv)} className="w-2/3 rounded-xl bg-emerald-600 py-2 font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50">
                      {sibuk ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                </div>
              )}

              <ul className="divide-y divide-gray-100">
                {voucher.length === 0 && <li className="py-3 text-sm text-gray-500">Belum ada voucher.</li>}
                {voucher.map((v) => {
                  const s = statusVoucher(v);
                  return (
                    <li key={v.id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          <span className="font-mono">{v.kode}</span>
                          <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${s.c}`}>{s.t}</span>
                        </p>
                        <p className="text-xs text-gray-500">{v.deskripsi ?? "Tanpa deskripsi"}</p>
                        <p className="text-xs text-gray-500">{teksVoucher(v)}</p>
                        <p className="text-xs text-gray-500">
                          Dipakai {Number(v.terpakai)}{v.kuota !== null ? ` dari ${v.kuota}` : ""}x · {v.berlaku_dari} s.d. {v.berlaku_sampai}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2">
                        <button onClick={() => { setFv({ id: v.id, kode: v.kode, deskripsi: v.deskripsi ?? "", jenis: v.jenis, nilai: String(v.nilai), maks: v.maks_potongan ? String(v.maks_potongan) : "", min: String(v.min_belanja), kuota: v.kuota !== null ? String(v.kuota) : "", dari: v.berlaku_dari, sampai: v.berlaku_sampai, aktif: v.aktif }); setPesan(""); }}
                          className="rounded-lg bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600 hover:bg-indigo-100">Ubah</button>
                        <button onClick={() => ubahAktifVoucher(v)} className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-200">
                          {v.aktif ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-xs text-gray-500">
                Voucher tidak bisa dihapus karena tercatat di riwayat booking. Nonaktifkan saja. Booking yang dibatalkan mengembalikan kuota.
              </p>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Tingkat Membership</h2>
                {!ft && (
                  <button onClick={() => { setFt(tierBaru()); setPesan(""); }}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700">
                    + Tambah Tingkat
                  </button>
                )}
              </div>
              <p className="mb-3 text-xs text-gray-500">
                Pelanggan naik tingkat otomatis berdasarkan jumlah sesi yang selesai. Diskon member berlaku untuk semua paket dan tambahan.
              </p>

              {ft && (
                <div className="mb-4 space-y-3 rounded-xl border-2 border-indigo-200 p-4">
                  <p className="font-semibold text-gray-900">{ft.id ? "Ubah Tingkat" : "Tingkat Baru"}</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">Nama</label>
                      <input className={input} value={ft.nama} onChange={(e) => setFt({ ...ft, nama: e.target.value })} placeholder="Gold" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Min. sesi selesai</label>
                      <input className={input} inputMode="numeric" value={ft.min_sesi} onChange={(e) => setFt({ ...ft, min_sesi: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Diskon (%)</label>
                      <input className={input} inputMode="numeric" value={ft.diskon} onChange={(e) => setFt({ ...ft, diskon: e.target.value })} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={ft.aktif} onChange={(e) => setFt({ ...ft, aktif: e.target.checked })} />
                    Tingkat aktif
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => { setFt(null); setPesan(""); }} className="w-1/3 rounded-xl bg-gray-100 py-2 font-semibold text-gray-700 hover:bg-gray-200">Batal</button>
                    <button disabled={sibuk} onClick={() => simpanTier(ft)} className="w-2/3 rounded-xl bg-emerald-600 py-2 font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50">
                      {sibuk ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                </div>
              )}

              <ul className="divide-y divide-gray-100">
                {tier.map((t) => (
                  <li key={t.id} className={`flex items-center justify-between gap-3 py-3 ${t.aktif ? "" : "opacity-50"}`}>
                    <div>
                      <p className="font-semibold text-gray-900">
                        🏅 {t.nama} {!t.aktif && <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">nonaktif</span>}
                      </p>
                      <p className="text-xs text-gray-500">Mulai {t.min_sesi} sesi selesai · diskon {t.diskon_persen}%</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => { setFt({ id: t.id, nama: t.nama, min_sesi: String(t.min_sesi), diskon: String(t.diskon_persen), aktif: t.aktif }); setPesan(""); }}
                        className="rounded-lg bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600 hover:bg-indigo-100">Ubah</button>
                      <button onClick={() => ubahAktifTier(t)} className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-200">
                        {t.aktif ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="mb-3 text-lg font-bold text-gray-900">Pelanggan dan Tingkatnya</h2>
              <ul className="divide-y divide-gray-100">
                {pelanggan.length === 0 && <li className="py-3 text-sm text-gray-500">Belum ada pelanggan.</li>}
                {pelanggan.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-semibold text-gray-900">{p.nama ?? "Tanpa nama"}</p>
                      <p className="text-xs text-gray-500">{p.hp ?? "-"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-indigo-600">🏅 {p.tier}{p.diskon_persen > 0 ? ` · ${p.diskon_persen}%` : ""}</p>
                      <p className="text-xs text-gray-500">{Number(p.sesi)} sesi selesai</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-gray-500">Menampilkan sampai 100 akun pelanggan. Akun admin tidak ikut ditampilkan.</p>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}