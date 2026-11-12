# SnapQ – Aplikasi Booking Studio Foto

## Deskripsi Proyek

**SnapQ** merupakan aplikasi berbasis web untuk membantu pelanggan melakukan pemesanan layanan studio foto secara online. Aplikasi ini dirancang agar pelanggan dapat melihat layanan yang tersedia, memilih paket foto, menentukan jadwal pemotretan, dan memantau status pemesanan.

SnapQ juga menyediakan halaman admin untuk membantu pengelola studio dalam mengatur antrean booking, memverifikasi pemesanan, mengelola layanan dan voucher, serta melihat laporan.

## Tujuan Aplikasi

Tujuan pengembangan aplikasi SnapQ adalah:

1. Mempermudah pelanggan dalam melakukan pemesanan studio foto secara online.
2. Menyediakan informasi layanan dan paket foto yang tersedia.
3. Memudahkan pelanggan dalam memilih jadwal pemotretan.
4. Membantu pelanggan melihat tiket dan riwayat pemesanan.
5. Membantu admin mengelola data booking dan layanan studio.
6. Mempermudah proses verifikasi pemesanan serta pemantauan antrean.
7. Menyediakan informasi laporan untuk membantu pengelolaan studio foto.

## Teknologi yang Digunakan

SnapQ dikembangkan menggunakan beberapa teknologi berikut:

- **Next.js** – Framework React untuk membangun aplikasi web.
- **React** – Library JavaScript untuk membangun antarmuka pengguna.
- **TypeScript** – Bahasa pemrograman berbasis JavaScript dengan dukungan tipe data.
- **Tailwind CSS** – Framework CSS untuk membantu proses pengaturan tampilan.
- **Supabase** – Backend yang digunakan untuk kebutuhan autentikasi dan pengelolaan data.
- **jsPDF** – Library untuk membantu pembuatan dokumen PDF.
- **QRCode** – Library untuk menghasilkan kode QR.

## Fitur Aplikasi

### 1. Fitur Pelanggan

Pelanggan dapat menggunakan beberapa fitur berikut:

- **Registrasi akun:** pelanggan dapat membuat akun untuk menggunakan aplikasi.
- **Login:** pelanggan dapat masuk menggunakan akun yang telah terdaftar.
- **Melihat layanan:** pelanggan dapat melihat layanan dan paket studio foto.
- **Pemesanan studio:** pelanggan dapat memilih paket, tambahan layanan, jadwal, dan voucher yang tersedia.
- **Booking saya:** pelanggan dapat melihat daftar dan riwayat pemesanan.
- **Tiket booking:** pelanggan dapat melihat tiket pemesanan yang dilengkapi informasi booking dan kode QR.
- **Halaman akun:** pelanggan dapat mengakses halaman akun.

### 2. Fitur Admin

Admin memiliki akses ke halaman pengelolaan yang meliputi:

- **Login admin:** admin masuk melalui halaman khusus admin.
- **Dashboard admin:** halaman utama untuk mengakses pengelolaan studio.
- **Manajemen antrean:** admin dapat melihat dan mengelola antrean pemesanan.
- **Verifikasi booking:** admin dapat memeriksa dan memverifikasi pemesanan pelanggan.
- **Manajemen layanan:** admin dapat mengelola informasi layanan studio foto.
- **Manajemen voucher:** admin dapat mengelola voucher yang digunakan dalam pemesanan.
- **Laporan:** admin dapat melihat informasi laporan pemesanan.

## Struktur Folder

Berikut merupakan struktur folder utama proyek SnapQ:

```text
snapq-main/
│
├── app/
│   ├── admin/
│   │   ├── antrean/
│   │   ├── laporan/
│   │   ├── layanan/
│   │   ├── masuk/
│   │   ├── verifikasi/
│   │   └── voucher/
│   │
│   ├── akun/
│   ├── booking/
│   ├── booking-saya/
│   ├── daftar/
│   ├── layanan/
│   ├── masuk/
│   ├── tiket/
│   │   └── [id]/
│   │
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   └── AuthCard.tsx
│
├── lib/
│   └── supabase.ts
│
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

### Penjelasan Folder

- **app/**: Menyimpan halaman dan tampilan utama aplikasi, termasuk halaman pelanggan dan admin.
- **app/admin/**: Menyimpan halaman khusus admin, seperti antrean, laporan, layanan, verifikasi, dan voucher.
- **app/booking/**: Halaman untuk melakukan pemesanan studio foto.
- **app/booking-saya/**: Halaman untuk melihat daftar pemesanan pelanggan.
- **app/tiket/**: Menyimpan halaman tiket booking.
- **components/**: Menyimpan komponen antarmuka yang dapat digunakan kembali.
- **lib/**: Menyimpan konfigurasi dan fungsi pendukung, termasuk koneksi Supabase.
- **public/**: Menyimpan aset statis yang digunakan aplikasi.

## Cara Instalasi dan Menjalankan Aplikasi

Ikuti langkah-langkah berikut untuk menjalankan SnapQ di komputer lokal.

### 1. Persiapan

Pastikan perangkat sudah memiliki:

- Node.js
- npm
- Visual Studio Code atau editor kode lainnya
- Browser seperti Google Chrome

### 2. Download atau Clone Repository

Clone repository SnapQ dari GitHub:

```bash
git clone URL_REPOSITORY
```

Masuk ke folder proyek:

```bash
cd snapq-main
```

Ganti `URL_REPOSITORY` dengan alamat repository GitHub SnapQ yang sebenarnya.

### 3. Install Dependencies

Jalankan perintah berikut pada terminal:

```bash
npm install
```

Perintah tersebut digunakan untuk menginstal seluruh package yang dibutuhkan oleh aplikasi.

### 4. Konfigurasi Supabase

Buat file bernama `.env.local` di folder utama proyek.

Isi file tersebut dengan konfigurasi Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=URL_SUPABASE_ANDA
NEXT_PUBLIC_SUPABASE_ANON_KEY=ANON_KEY_SUPABASE_ANDA
```

Ganti nilai tersebut dengan URL dan anon/publishable key dari proyek Supabase yang digunakan.

**Catatan keamanan:** Jangan mengunggah password, service-role key, atau kredensial rahasia ke repository publik. Pastikan pengaturan keamanan dan kebijakan akses data Supabase sudah sesuai.

### 5. Menjalankan Aplikasi

Setelah dependencies dan konfigurasi selesai, jalankan:

```bash
npm run dev
```

Jika server berhasil dijalankan, buka browser dan akses:

```text
http://localhost:3000
```

Aplikasi SnapQ akan tampil pada browser.

### 6. Perintah Tambahan

Untuk memeriksa kode menggunakan ESLint:

```bash
npm run lint
```

Untuk membuat build aplikasi:

```bash
npm run build
```

Untuk menjalankan hasil build:

```bash
npm run start
```

## Penutup

SnapQ merupakan aplikasi booking studio foto berbasis web yang dikembangkan untuk mempermudah proses pemesanan bagi pelanggan serta membantu admin dalam mengelola operasional studio. Dengan adanya aplikasi ini, proses pemesanan, pengelolaan layanan, verifikasi booking, dan pemantauan laporan dapat dilakukan melalui satu sistem.