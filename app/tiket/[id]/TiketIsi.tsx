"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase";

type Tiket = {
  id: string;
  kode_tiket: string;
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
  nomor: number;
  metode: string | null;
  channel: string | null;
  dibayar_pada: string | null;
};

const rupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");
const jam = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}.${String(m % 60).padStart(2, "0")}`;
const tanggalPanjang = (t: string) =>
  new Date(t + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
const tambahanTeks = (t: Tiket) => {
  const a: string[] = [];
  if (t.tambah_waktu > 0) a.push(`${t.tambah_waktu}x waktu 10 menit`);
  if (t.tambah_cetak > 0) a.push(`${t.tambah_cetak}x cetak`);
  return a.join(", ");
};

export default function TiketIsi({ id }: { id: string }) {
  const router = useRouter();
  const [tiket, setTiket] = useState<Tiket | null>(null);
  const [qr, setQr] = useState("");
  const [loading, setLoading] = useState(true);
  const [pesan, setPesan] = useState("");
  const [mengunduh, setMengunduh] = useState(false);

  useEffect(() => {
    async function muat() {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        router.push("/masuk");
        return;
      }
      const { data, error } = await supabase.rpc("detail_tiket", { p_id: id });
      if (error) setPesan("Gagal memuat tiket. Coba muat ulang halaman.");
      else if (!data || data.length === 0) setPesan("Tiket tidak ditemukan, atau booking belum lunas.");
      else {
        const t = data[0] as Tiket;
        setTiket(t);
        setQr(await QRCode.toDataURL(t.kode_tiket, { margin: 1, width: 480 }));
      }
      setLoading(false);
    }
    muat();
  }, [id, router]);

  async function unduh() {
    if (!tiket || !qr) return;
    setMengunduh(true);
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: [100, 180] });
    const w = 100;

    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, w, 34, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("SNAPQ", w / 2, 14, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("TIKET SESI FOTO", w / 2, 21, { align: "center" });
    doc.setFontSize(9);
    doc.text(`Nomor antrean ${tiket.nomor}`, w / 2, 28, { align: "center" });

    doc.addImage(qr, "PNG", 25, 40, 50, 50);
    doc.setTextColor(30, 30, 30);
    doc.setFont("courier", "bold");
    doc.setFontSize(13);
    doc.text(tiket.kode_tiket, w / 2, 98, { align: "center" });

    doc.setDrawColor(190, 190, 190);
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.line(8, 104, w - 8, 104);
    doc.setLineDashPattern([], 0);

    const nama = (tiket.nama_pelanggan ?? "-").slice(0, 26);
    const tambahan = tambahanTeks(tiket);
    const baris: [string, string][] = [
      ["Nama", nama],
      ["Paket", tiket.paket],
      ["Jumlah orang", String(tiket.jumlah_orang)],
      ["Tanggal", tanggalPanjang(tiket.tanggal)],
      ["Jam", `${jam(tiket.menit_mulai)} - ${jam(tiket.menit_selesai)}`],
    ];
    if (tambahan) baris.push(["Tambahan", tambahan]);
    baris.push(["Total", rupiah(tiket.total_harga) + " (LUNAS)"]);

    doc.setFontSize(9);
    let y = 111;
    baris.forEach(([label, nilai]) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(110, 110, 110);
      doc.text(label, 8, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(nilai, w - 8, y, { align: "right" });
      y += 7;
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    const catatan = doc.splitTextToSize(
      "Tunjukkan QR code ini kepada petugas saat tiba di studio. Harap datang 5 menit sebelum jadwal.",
      w - 16
    );
    doc.text(catatan, w / 2, 166, { align: "center" });

    doc.save(`tiket-${tiket.kode_tiket}.pdf`);
    setMengunduh(false);
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 sm:p-8">
      <div className="mx-auto max-w-sm">
        {loading && <p className="text-center text-gray-500">Memuat tiket...</p>}
        {pesan && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-lg">
            <p className="text-sm text-red-600">{pesan}</p>
            <Link href="/booking-saya" className="mt-3 inline-block font-semibold text-indigo-600 hover:underline">
              Kembali ke Booking Saya
            </Link>
          </div>
        )}

        {tiket && (
          <>
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
              <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-5 text-center text-white">
                <p className="text-sm font-semibold tracking-widest">📸 SNAPQ</p>
                <p className="mt-1 text-xs uppercase tracking-widest opacity-80">Tiket Sesi Foto</p>
                <p className="mt-2 text-xs opacity-80">Nomor antrean</p>
                <p className="text-5xl font-bold">{tiket.nomor}</p>
              </div>

              <div className="px-6 pt-5 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {qr && <img src={qr} alt="QR code tiket" className="mx-auto h-48 w-48" />}
                <p className="mt-1 font-mono text-lg font-bold tracking-wider text-gray-900">{tiket.kode_tiket}</p>
                <p className="text-xs text-gray-500">Tunjukkan QR ini kepada petugas</p>
              </div>

              <div className="mx-6 my-4 border-t-2 border-dashed border-gray-200" />

              <dl className="space-y-2 px-6 pb-6 text-sm">
                {[
                  ["Nama", tiket.nama_pelanggan ?? "-"],
                  ["Paket", tiket.paket],
                  ["Jumlah orang", `${tiket.jumlah_orang} orang`],
                  ["Tanggal", tanggalPanjang(tiket.tanggal)],
                  ["Jam", `${jam(tiket.menit_mulai)} - ${jam(tiket.menit_selesai)}`],
                  ...(tambahanTeks(tiket) ? [["Tambahan", tambahanTeks(tiket)]] : []),
                  ["Pembayaran", tiket.channel ?? tiket.metode ?? "-"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-gray-500">{k}</dt>
                    <dd className="text-right font-semibold text-gray-900">{v}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-4 border-t border-gray-100 pt-2">
                  <dt className="text-gray-500">Total</dt>
                  <dd className="text-lg font-bold text-indigo-600">{rupiah(tiket.total_harga)}</dd>
                </div>
              </dl>
            </div>

            <button onClick={unduh} disabled={mengunduh || !qr}
              className="mt-4 w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60">
              {mengunduh ? "Menyiapkan PDF..." : "⬇ Unduh Tiket PDF"}
            </button>
            <Link href="/booking-saya" className="mt-3 block text-center text-sm font-semibold text-indigo-600 hover:underline">
              Kembali ke Booking Saya
            </Link>
          </>
        )}
      </div>
    </main>
  );
}