export type DataTiket = {
  id: string;
  nomor: number;
  tanggal: string;
  menit_mulai: number;
  menit_selesai: number;
  paket: string;
  jumlah_orang: number;
  total_harga: number;
};

const rupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");
const jam = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}.${String(m % 60).padStart(2, "0")}`;

export async function unduhTiket(b: DataTiket) {
  const { jsPDF } = await import("jspdf");
  const QRCode = (await import("qrcode")).default;

  const qr = await QRCode.toDataURL(b.id, { margin: 1, width: 400 });
  const doc = new jsPDF({ unit: "mm", format: [90, 150] });

  // Header
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 90, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("SNAPQ", 45, 8, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("NOMOR ANTREAN", 45, 14, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text(String(b.nomor), 45, 27, { align: "center" });

  // Detail sesi
  const tanggal = new Date(b.tanggal + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const baris: [string, string][] = [
    ["Paket", b.paket],
    ["Tanggal", tanggal],
    ["Pukul", `${jam(b.menit_mulai)} - ${jam(b.menit_selesai)}`],
    ["Jumlah orang", `${b.jumlah_orang} orang`],
    ["Total dibayar", rupiah(b.total_harga)],
  ];
  baris.forEach(([label, nilai], i) => {
    const y = 42 + i * 9;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(label, 8, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(nilai, 8, y + 4.5, { maxWidth: 74 });
  });

  // Garis putus-putus
  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(6, 90, 84, 90);
  doc.setLineDashPattern([], 0);

  // QR code
  doc.addImage(qr, "PNG", 25, 94, 40, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text("Tunjukkan QR ini ke petugas saat datang", 45, 142, { align: "center" });

  doc.save(`tiket-snapq-${b.nomor}.pdf`);
}