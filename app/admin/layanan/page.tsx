"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Paket = { id: string; nama: string; jumlah_orang: number; harga: number; durasi_menit: number; aktif: boolean };
type Tambahan = { id: string; nama: string; harga: number };
type Form = { id: string | null; nama: string; jumlah_orang: string; harga: string; durasi_menit: string; aktif: boolean };

const KOSONG: Form = { id: null, nama: "", jumlah_orang: "1", harga: "", durasi_menit: "10", aktif: true };
const rupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");
const input =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

export default function KelolaLayanan() {
  const router = useRouter();
  const [siap, setSiap] = useState(false);
  const [paket, setPaket] = useState<Paket[]>([]);
  const [tambahan, setTambahan] = useState<Tambahan[]>([]);
  const [hargaTmb, setHargaTmb] = useState<Record<string, string>>({});
  const [form, setForm] = useState<Form | null>(null);
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
      setSiap(true);
    }
    cek();
  }, [router]);

  const muat = useCallback(async () => {
    const [a, b] = await Promise.all([
      supabase.rpc("admin_daftar_layanan"),
      supabase.from("tambahan").select("id,nama,harga").order("harga"),
    ]);
    if (a.error || b.error) setPesan("Gagal memuat data. Coba muat ulang halaman.");
    else {
      setPaket((a.data as Paket[]) ?? []);
      const t = (b.data as Tambahan[]) ?? [];
      setTambahan(t);
      setHargaTmb(Object.fromEntries(t.map((x) => [x.id, String(x.harga)])));
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

  async function simpanPaket(f: Form) {
    const jumlah = Number(f.jumlah_orang);
    const harga = Number(f.harga);
    const durasi = Number(f.durasi_menit);
    if (f.nama.trim().length < 2) return setPesan("Nama paket minimal 2 karakter.");
    if (!Number.isInteger(jumlah) || jumlah < 1) return setPesan("Jumlah orang harus angka bulat minimal 1.");
    if (f.harga.trim() === "" || !Number.isInteger(harga) || harga < 0) return setPesan("Harga harus angka bulat, tanpa titik atau koma.");
    if (!Number.isInteger(durasi) || durasi < 5) return setPesan("Durasi minimal 5 menit.");
    setSibuk(true);
    setPesan("");
    const { error } = await supabase.rpc("admin_simpan_layanan", {
      p_id: f.id,
      p_nama: f.nama,
      p_jumlah_orang: jumlah,
      p_harga: harga,
      p_durasi: durasi,
      p_aktif: f.aktif,
    });
    setSibuk(false);
    if (error) {
      setPesan(error.message);
      return;
    }
    setForm(null);
    info(f.id ? "Paket diperbarui." : "Paket ditambahkan.");
    muat();
  }

  async function ubahAktif(p: Paket) {
    setPesan("");
    const { error } = await supabase.rpc("admin_simpan_layanan", {
      p_id: p.id,
      p_nama: p.nama,
      p_jumlah_orang: p.jumlah_orang,
      p_harga: p.harga,
      p_durasi: p.durasi_menit,
      p_aktif: !p.aktif,
    });
    if (error) setPesan(error.message);
    else info(p.aktif ? "Paket dinonaktifkan." : "Paket diaktifkan.");
    muat();
  }

  async function simpanTambahan(t: Tambahan) {
    const h = Number(hargaTmb[t.id]);
    if (hargaTmb[t.id]?.trim() === "" || !Number.isInteger(h) || h < 0) {
      setPesan("Harga tambahan harus angka bulat.");
      return;
    }
    setPesan("");
    const { error } = await supabase.rpc("admin_ubah_harga_tambahan", { p_id: t.id, p_harga: h });
    if (error) setPesan(error.message);
    else info(`Harga "${t.nama}" diperbarui.`);
    muat();
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
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-widest text-indigo-600">📸 SNAPQ ADMIN</p>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Layanan</h1>
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
                <h2 className="text-lg font-bold text-gray-900">Paket Foto</h2>
                {!form && (
                  <button onClick={() => { setForm(KOSONG); setPesan(""); }}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700">
                    + Tambah Paket
                  </button>
                )}
              </div>

              {form && (
                <div className="mb-4 space-y-3 rounded-xl border-2 border-indigo-200 p-4">
                  <p className="font-semibold text-gray-900">{form.id ? "Ubah Paket" : "Paket Baru"}</p>
                  <div>
                    <label className="text-xs text-gray-500">Nama paket</label>
                    <input className={input} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Contoh: Berkelompok (7 Orang)" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">Jumlah orang</label>
                      <input className={input} inputMode="numeric" value={form.jumlah_orang} onChange={(e) => setForm({ ...form, jumlah_orang: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Harga (Rp)</label>
                      <input className={input} inputMode="numeric" value={form.harga} onChange={(e) => setForm({ ...form, harga: e.target.value })} placeholder="40000" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Durasi (menit)</label>
                      <input className={input} inputMode="numeric" value={form.durasi_menit} onChange={(e) => setForm({ ...form, durasi_menit: e.target.value })} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={form.aktif} onChange={(e) => setForm({ ...form, aktif: e.target.checked })} />
                    Tampilkan di daftar harga dan booking
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => { setForm(null); setPesan(""); }} className="w-1/3 rounded-xl bg-gray-100 py-2 font-semibold text-gray-700 hover:bg-gray-200">Batal</button>
                    <button disabled={sibuk} onClick={() => simpanPaket(form)} className="w-2/3 rounded-xl bg-emerald-600 py-2 font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50">
                      {sibuk ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                </div>
              )}

              <ul className="divide-y divide-gray-100">
                {paket.length === 0 && <li className="py-3 text-sm text-gray-500">Belum ada paket.</li>}
                {paket.map((p) => (
                  <li key={p.id} className={`flex items-center justify-between gap-3 py-3 ${p.aktif ? "" : "opacity-50"}`}>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {p.nama} {!p.aktif && <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">nonaktif</span>}
                      </p>
                      <p className="text-xs text-gray-500">👥 {p.jumlah_orang} orang · ⏱ {p.durasi_menit} menit · {rupiah(p.harga)}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => { setForm({ id: p.id, nama: p.nama, jumlah_orang: String(p.jumlah_orang), harga: String(p.harga), durasi_menit: String(p.durasi_menit), aktif: p.aktif }); setPesan(""); }}
                        className="rounded-lg bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600 hover:bg-indigo-100">Ubah</button>
                      <button onClick={() => ubahAktif(p)}
                        className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-200">
                        {p.aktif ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-gray-500">
                Paket tidak bisa dihapus karena sudah dipakai di riwayat booking. Nonaktifkan saja agar tidak muncul lagi.
                Perubahan harga hanya berlaku untuk booking baru.
              </p>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="mb-3 text-lg font-bold text-gray-900">Harga Tambahan</h2>
              <ul className="space-y-3">
                {tambahan.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3">
                    <p className="text-gray-900">{t.nama}</p>
                    <div className="flex items-center gap-2">
                      <input className="w-28 rounded-xl border border-gray-300 px-3 py-2 text-right text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        inputMode="numeric" value={hargaTmb[t.id] ?? ""} onChange={(e) => setHargaTmb({ ...hargaTmb, [t.id]: e.target.value })} />
                      <button onClick={() => simpanTambahan(t)} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Simpan</button>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-gray-500">Nama tambahan dikunci karena dipakai untuk menghitung harga booking.</p>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}