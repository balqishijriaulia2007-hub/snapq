import Link from "next/link";

export default function Beranda() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="text-5xl">📸</div>
        <p className="mt-2 text-sm font-semibold tracking-widest text-indigo-600">SNAPQ</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Booking Studio Foto</h1>
        <p className="mt-1 text-sm text-gray-500">Pesan sesi, pantau antrean, dan dapatkan tiketmu.</p>
        <div className="mt-6 space-y-3">
          <Link href="/masuk" className="block rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow hover:bg-indigo-700">
            Masuk sebagai Pelanggan
          </Link>
          <Link href="/admin/masuk" className="block rounded-xl bg-gray-900 py-3 font-semibold text-white shadow hover:bg-gray-700">
            Masuk sebagai Admin
          </Link>
          <Link href="/layanan" className="block pt-2 text-sm font-semibold text-indigo-600 hover:underline">
            Lihat daftar harga
          </Link>
        </div>
      </div>
    </main>
  );
}