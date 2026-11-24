# Panduan Pengujian SnapQ

Dokumen hasil pengujian aplikasi **SnapQ**, web booking studio foto dengan antrean dan tiket QR Code.

| | |
|---|---|
| **Aplikasi** | SnapQ (Booking Studio Foto) |
| **URL yang diuji** | https://snapq-u13t.vercel.app/ |
| **Penguji** | Siska (bagian Pengujian) |
| **Tim** | Anggina (dokumentasi dan konfigurasi), Siska (pengujian), Balqis (developer utama) |
| **Tanggal pengujian pelanggan** | 22 sampai 24 November 2026 |
| **Tanggal pengujian admin** | 6 November 2026 (memakai akun admin dari developer) |
| **Tanggal UAT** | 22 November 2026 |
| **Perangkat dan browser** | Laptop Windows 11, Microsoft Edge |

## Daftar Isi

1. [Ringkasan Hasil](#1-ringkasan-hasil)
2. [Tujuan dan Lingkup](#2-tujuan-dan-lingkup)
3. [Persiapan dan Akun Uji](#3-persiapan-dan-akun-uji)
4. [Test Plan](#4-test-plan)
5. [Test Case dan Hasil](#5-test-case-dan-hasil)
6. [Rekap Hasil dan Defect Density](#6-rekap-hasil-dan-defect-density)
7. [Bug Log](#7-bug-log)
8. [UAT (User Acceptance Test)](#8-uat-user-acceptance-test)
9. [Kesimpulan dan Rekomendasi](#9-kesimpulan-dan-rekomendasi)
10. [Lampiran](#10-lampiran)

---

## 1. Ringkasan Hasil

| Aspek | Hasil |
|---|---|
| Test case yang dirancang | 38 (pelanggan dan admin) |
| Test case dieksekusi | 26 (20 berhasil penuh, 6 berhasil sebagian) |
| Test case gagal | 0 |
| Test case belum dieksekusi | 12 |
| Bug ditemukan | 0 |
| Ukuran kode | 2,83 KLOC |
| Defect density | 0,00 bug per KLOC |
| Responden UAT | 6 orang |
| Selesai tanpa bantuan | 5 dari 6 responden (83,3%) |
| Rata-rata penilaian UAT | 4,97 dari 5 |
| Bersedia memakai SnapQ | 6 dari 6 responden (100%) |

## 2. Tujuan dan Lingkup

**Tujuan:** memastikan fitur pelanggan dan admin SnapQ berjalan sesuai kebutuhan, serta mencatat bug yang ditemukan agar dapat diperbaiki oleh developer.

| Termasuk | Tidak termasuk |
|---|---|
| Registrasi dan login | Uji beban (banyak pengguna bersamaan) |
| Lihat layanan, pilih paket, jadwal, tambahan, dan voucher | Pembayaran asli (pembayaran di SnapQ hanya simulasi) |
| Booking, pembayaran simulasi, tiket dan QR Code | Uji keamanan mendalam |
| Admin: antrean, verifikasi tiket, layanan, voucher dan membership, laporan | |

## 3. Persiapan dan Akun Uji

| Peran | Akun | Keterangan |
|---|---|---|
| Pelanggan | Akun uji milik penguji | Dibuat lewat halaman `/daftar` |
| Admin | Akun admin dari developer | Login lewat `/admin/masuk`. Kredensial tidak dicantumkan di dokumen ini |

Pengujian memakai data uji, bukan data pribadi yang penting.

## 4. Test Plan

- **Jenis pengujian:** fungsional manual (black box) dan UAT.
- **Pendekatan:** setiap skenario dijalankan langsung di web yang sudah di-deploy, hasilnya dicatat, lalu diberi screenshot sebagai bukti.
- **Kriteria selesai (Definition of Done):**
  - Test case dieksekusi dan hasilnya dicatat, minimal 20 test case.
  - Tidak ada bug keparahan Tinggi yang masih terbuka.
  - UAT dilakukan oleh minimal 5 responden.
- **Keparahan bug:** Tinggi (fitur utama tidak berjalan), Sedang (berjalan tapi sebagian salah), Rendah (tampilan atau teks).

**Keterangan status:**

| Simbol | Arti |
|---|---|
| ✅ | Berhasil: ada bukti screenshot lengkap |
| 🟡 | Sebagian: bukti ada tetapi belum menunjukkan semua langkah |
| ⬜ | Belum dieksekusi: belum ada bukti |
| ❌ | Gagal |

Rincian prasyarat, data uji, dan langkah tiap skenario ada di [`TEST-CASE.md`](TEST-CASE.md). Kolom **Bukti** berisi nomor awal nama file screenshot. Contoh `04` berarti file `04-form-daftar-terisi.png`. Seluruh file ada di [Lampiran A](#lampiran-a-daftar-file-bukti).

## 5. Test Case dan Hasil

### 5.1 Registrasi dan Login

| ID | Skenario | Hasil yang diharapkan | Hasil aktual | Status | Bukti |
|---|---|---|---|---|---|
| **TC-01** | Daftar akun baru: buka `/daftar`, isi nama, nomor HP, email, password (min. 6 karakter), klik Daftar | Akun terbuat dan pengguna masuk ke halaman Akun | Akun terbuat dan langsung masuk ke halaman Akun, tampil sapaan "Halo, sissy" | ✅ | 03, 04, 05 |
| **TC-02** | Daftar memakai email yang sudah terdaftar | Muncul pesan error, akun tidak ganda | Muncul pesan "User already registered" di atas tombol Daftar, akun tidak terbuat lagi | ✅ | 29, 30 |
| **TC-03** | Daftar dengan password kurang dari 6 karakter | Form menolak | Form terisi dengan nama, nomor HP, dan email yang valid, serta password 5 karakter. Hasil penolakan setelah tombol Daftar ditekan belum terfoto | 🟡 | 53 |
| **TC-04** | Login di `/masuk` dengan email dan password benar | Masuk ke halaman Akun | Form login terisi dengan email akun uji. Halaman Akun menampilkan sapaan nama pengguna serta tombol Booking Sesi Foto, Booking Saya, dan Keluar. Foto saat tombol Masuk ditekan belum ada | 🟡 | 02, 48, 05 |
| **TC-05** | Login dengan password salah | Muncul "Email atau kata sandi salah." | Muncul "Email atau kata sandi salah." dan pengguna tetap di halaman login | ✅ | 32 |
| **TC-06** | Klik tombol Keluar di halaman Akun | Kembali ke `/masuk` | Setelah tombol Keluar ditekan, pengguna kembali ke halaman login `/masuk` | ✅ | 31, 50 |
| **TC-07** | Buka `/booking` tanpa login | Diarahkan ke `/masuk` | Membuka `/booking` tanpa login mengarahkan pengguna ke halaman login `/masuk`. Alamat `/booking` yang diketik tidak ikut terfoto | ✅ | 52 |

<table>
<tr><td align="center" width="50%"><img src="docs/screenshots/pelanggan/04-form-daftar-terisi.png" width="420" alt="Form daftar terisi"><br><sub><b>04</b> Form daftar terisi</sub></td><td align="center" width="50%"><img src="docs/screenshots/pelanggan/05-akun-setelah-daftar.png" width="420" alt="Halaman Akun setelah daftar"><br><sub><b>05</b> Halaman Akun setelah daftar</sub></td></tr>
<tr><td align="center" width="50%"><img src="docs/screenshots/pelanggan/29-daftar-email-sudah-terdaftar.png" width="420" alt="Daftar dengan email yang sudah terdaftar"><br><sub><b>29</b> Daftar dengan email yang sudah terdaftar</sub></td><td align="center" width="50%"><img src="docs/screenshots/pelanggan/30-daftar-email-sudah-terdaftar-2.png" width="420" alt="Daftar dengan email yang sudah terdaftar (akun uji lain)"><br><sub><b>30</b> Daftar dengan email yang sudah terdaftar (akun uji lain)</sub></td></tr>
<tr><td align="center" width="50%"><img src="docs/screenshots/pelanggan/02-halaman-masuk-pelanggan.png" width="420" alt="Halaman login pelanggan (form kosong)"><br><sub><b>02</b> Halaman login pelanggan (form kosong)</sub></td><td align="center" width="50%"><img src="docs/screenshots/pelanggan/48-login-terisi-sebelum-masuk.png" width="420" alt="Form login terisi sebelum klik Masuk"><br><sub><b>48</b> Form login terisi sebelum klik Masuk</sub></td></tr>
<tr><td align="center" width="50%"><img src="docs/screenshots/pelanggan/32-login-password-salah.png" width="420" alt="Login dengan password salah"><br><sub><b>32</b> Login dengan password salah</sub></td><td align="center" width="50%"><img src="docs/screenshots/pelanggan/53-daftar-password-pendek.png" width="420" alt="Form daftar dengan password 5 karakter"><br><sub><b>53</b> Form daftar dengan password 5 karakter</sub></td></tr>
<tr><td align="center" width="50%"><img src="docs/screenshots/pelanggan/50-setelah-keluar.png" width="420" alt="Halaman login setelah keluar"><br><sub><b>50</b> Halaman login setelah keluar</sub></td><td align="center" width="50%"><img src="docs/screenshots/pelanggan/52-dialihkan-ke-login.png" width="420" alt="Halaman login setelah membuka /booking tanpa login"><br><sub><b>52</b> Halaman login setelah membuka /booking tanpa login</sub></td></tr>
</table>

### 5.2 Layanan, Paket, dan Jadwal

| ID | Skenario | Hasil yang diharapkan | Hasil aktual | Status | Bukti |
|---|---|---|---|---|---|
| **TC-08** | Buka halaman `/layanan` | Daftar harga, tambahan, dan jam operasional tampil | Halaman Daftar Harga menampilkan 6 paket (Rp 40.000 sampai Rp 175.000), jam operasional 10.00 - 21.00, bagian "Yang Kamu Dapat", dan tambahan (Add Print dan Add Extra Time, masing-masing Rp 20.000) | ✅ | 33, 34 |
| **TC-09** | Di `/booking`, lihat dan pilih paket | Daftar paket dan harga tampil, paket terpilih ter-highlight | Enam paket tampil beserta harga dan jumlah orang, paket terpilih ter-highlight. Perubahan durasi antarpaket belum dicek | 🟡 | 06, 35 |
| **TC-10** | Pilih tanggal hari ini | Jam yang sudah lewat tidak bisa dipilih | - | ⬜ | 07 (tanggal lain, bukan hari ini) |
| **TC-11** | Pilih tanggal lebih dari 30 hari ke depan | Ditolak atau tidak bisa dipilih | - | ⬜ | - |
| **TC-12** | Tambah Extra Time dan Print | Total harga dan durasi bertambah | Extra Time 1x dan Print 1x: subtotal Rp 80.000 (Rp 40.000 + 2 x Rp 20.000) tampil di rincian | ✅ | 12 |

<table>
<tr><td align="center" width="50%"><img src="docs/screenshots/pelanggan/33-layanan-daftar-harga.png" width="420" alt="Halaman Daftar Harga"><br><sub><b>33</b> Halaman Daftar Harga</sub></td><td align="center" width="50%"><img src="docs/screenshots/pelanggan/34-layanan-yang-kamu-dapat-dan-tambahan.png" width="420" alt="Daftar Harga: yang didapat dan tambahan"><br><sub><b>34</b> Daftar Harga: yang didapat dan tambahan</sub></td></tr>
<tr><td align="center" width="50%"><img src="docs/screenshots/pelanggan/06-booking-pilih-paket.png" width="420" alt="Halaman booking: kartu member dan daftar paket"><br><sub><b>06</b> Halaman booking: kartu member dan daftar paket</sub></td><td align="center" width="50%"><img src="docs/screenshots/pelanggan/07-booking-pilih-tanggal-jam.png" width="420" alt="Pilihan tanggal dan jam (10.00 sampai 20.45)"><br><sub><b>07</b> Pilihan tanggal dan jam (10.00 sampai 20.45)</sub></td></tr>
<tr><td align="center" width="50%"><img src="docs/screenshots/pelanggan/12-booking-tambahan-voucher-total.png" width="420" alt="Tambahan, voucher, dan total di halaman booking"><br><sub><b>12</b> Tambahan, voucher, dan total di halaman booking</sub></td><td></td></tr>
</table>

### 5.3 Booking, Voucher, dan Pembayaran

| ID | Skenario | Hasil yang diharapkan | Hasil aktual | Status | Bukti |
|---|---|---|---|---|---|
| **TC-13** | Pilih paket, tanggal, jam, lalu pesan | "Booking Tersimpan", status menunggu pembayaran | Muncul "Booking Tersimpan" dengan rincian paket, jadwal, total, dan keterangan bayar dalam 15 menit. Berhasil dengan voucher maupun tanpa voucher | ✅ | 08, 09, 39 |
| **TC-14** | Dengan 2 akun, pesan jam yang sama | Akun kedua mendapat pesan jam sudah dipesan | Pada akun kedua, jam 13.30 dan 13.45 tampil dicoret dan tidak bisa dipilih. Pesan saat dua akun memesan jam yang sama bersamaan belum dibuktikan | 🟡 | 38 |
| **TC-15** | Masukkan kode voucher valid | Potongan muncul, total turun | Voucher SNAPQ11 dipakai: hemat Rp 8.000, total Rp 80.000 menjadi Rp 72.000 | ✅ | 08, 12 |
| **TC-16** | Masukkan kode voucher yang tidak bisa dipakai | Muncul pesan voucher tidak bisa dipakai | Kode SNAPQ11 ditolak dengan pesan "Kuota voucher sudah habis", total tetap tanpa potongan. Ini kasus kuota habis, kode yang tidak dikenal belum dicoba | ✅ | 37, 38 |
| **TC-17** | Buka Booking Saya | Booking tampil dengan nomor antrean | Booking tampil dengan nomor antrean 1, status "Menunggu pembayaran", batas bayar, dan tombol Bayar Sekarang | ✅ | 10, 40 |
| **TC-18** | Bayar booking (simulasi) | Status berubah menjadi lunas | Halaman pilih metode menampilkan QRIS, Transfer Bank, E-Wallet (83 bank), nomor Virtual Account simulasi, dan keterangan mode simulasi. Setelah bayar, status menjadi "Lunas, siap dilayani", muncul tombol Lihat Tiket, dan metode tercatat di tiket (Bank Mandiri) | ✅ | 10, 11, 41, 42 |

<table>
<tr><td align="center" width="50%"><img src="docs/screenshots/pelanggan/08-booking-tersimpan-dengan-voucher.png" width="420" alt="Booking tersimpan dengan voucher (Rp 72.000, hemat Rp 8.000)"><br><sub><b>08</b> Booking tersimpan dengan voucher (Rp 72.000, hemat Rp 8.000)</sub></td><td align="center" width="50%"><img src="docs/screenshots/pelanggan/09-booking-tersimpan-tanpa-voucher.png" width="420" alt="Booking tersimpan tanpa voucher (Rp 80.000)"><br><sub><b>09</b> Booking tersimpan tanpa voucher (Rp 80.000)</sub></td></tr>
<tr><td align="center" width="50%"><img src="docs/screenshots/pelanggan/38-booking-jam-terisi-voucher-kuota-habis.png" width="420" alt="Jam terisi dicoret dan voucher ditolak"><br><sub><b>38</b> Jam terisi dicoret dan voucher ditolak</sub></td><td align="center" width="50%"><img src="docs/screenshots/pelanggan/37-booking-voucher-kuota-habis.png" width="420" alt="Voucher ditolak: kuota habis"><br><sub><b>37</b> Voucher ditolak: kuota habis</sub></td></tr>
<tr><td align="center" width="50%"><img src="docs/screenshots/pelanggan/10-booking-saya-menunggu-pembayaran.png" width="420" alt="Booking Saya: menunggu pembayaran"><br><sub><b>10</b> Booking Saya: menunggu pembayaran</sub></td><td align="center" width="50%"><img src="docs/screenshots/pelanggan/41-pembayaran-pilih-metode-transfer-bank.png" width="420" alt="Pilihan metode pembayaran (Transfer Bank, VA simulasi)"><br><sub><b>41</b> Pilihan metode pembayaran (Transfer Bank, VA simulasi)</sub></td></tr>
<tr><td align="center" width="50%"><img src="docs/screenshots/pelanggan/11-booking-saya-lunas.png" width="420" alt="Booking Saya: lunas, siap dilayani"><br><sub><b>11</b> Booking Saya: lunas, siap dilayani</sub></td><td></td></tr>
</table>

### 5.4 Tiket dan QR Code

| ID | Skenario | Hasil yang diharapkan | Hasil aktual | Status | Bukti |
|---|---|---|---|---|---|
| **TC-19** | Buka tiket booking yang lunas | Tiket lengkap dengan QR Code | Tiket tampil: nomor antrean, QR Code, kode tiket (format SNQ-XXXXXXXX), nama, paket, jumlah orang, tanggal, jam, tambahan, metode bayar, total | ✅ | 13, 43 |
| **TC-20** | Buka tiket booking yang belum lunas | Muncul "Tiket tidak ditemukan, atau booking belum lunas." | - | ⬜ | - |
| **TC-21** | Unduh tiket sebagai PDF | File PDF terunduh dan isinya benar | Tombol "Unduh Tiket PDF" tampil di halaman tiket. Hasil unduhan belum dibuktikan | 🟡 | 13 |
| **TC-22** | Scan QR Code tiket | QR terbaca, berisi kode tiket | - | ⬜ | - |

<table>
<tr><td align="center" width="50%"><img src="docs/screenshots/pelanggan/13-tiket-qr-code.png" width="420" alt="Tiket sesi foto dengan QR Code"><br><sub><b>13</b> Tiket sesi foto dengan QR Code</sub></td><td align="center" width="50%"><img src="docs/screenshots/pelanggan/43-tiket-qr-akun-kedua.png" width="420" alt="Tiket dengan QR Code (akun kedua)"><br><sub><b>43</b> Tiket dengan QR Code (akun kedua)</sub></td></tr>
</table>

### 5.5 Admin

| ID | Skenario | Hasil yang diharapkan | Hasil aktual | Status | Bukti |
|---|---|---|---|---|---|
| **TC-23** | Login di `/admin/masuk` dengan akun admin | Masuk ke dashboard admin | Masuk ke dashboard: Antrean Hari Ini, Verifikasi Tiket, Kelola Layanan, Laporan, Voucher & Membership | ✅ | 14, 15, 16 |
| **TC-24** | Login admin memakai akun pelanggan | Ditolak: "Akun ini bukan akun admin." | Login di `/admin/masuk` dengan akun pelanggan yang benar ditolak dengan pesan "Akun ini bukan akun admin." dan tidak masuk ke dashboard | ✅ | 54 |
| **TC-25** | Verifikasi Tiket: masukkan kode tiket | Status tiket dan detail booking tampil | Tiket lunas tampil "Tiket valid, siap dipakai" lengkap dengan detail. Tiket yang sesinya berjalan tampil "Sesi ini sedang berlangsung" | ✅ | 20, 22, 23 |
| **TC-26** | Antrean: Panggil, Mulai sesi, Selesai | Status berubah berurutan | Status berubah dari "Lunas, menunggu giliran" ke "Dipanggil" lalu "Sedang berlangsung", dan tombol Selesai muncul. Tampilan di sisi pelanggan tidak ikut difoto | ✅ | 17, 18, 19 |
| **TC-27** | Antrean: batalkan booking yang belum dibayar | Booking batal, jam dibuka lagi | - | ⬜ | 17 (tombol Batalkan tampil saja) |
| **TC-28** | Laporan harian, mingguan, bulanan | Pendapatan, jumlah booking, dan paket terlaris tampil | Laporan harian dan bulanan tampil (pendapatan, booking dibayar, sesi selesai, paket terlaris, unduh CSV). Laporan mingguan belum dibuktikan | 🟡 | 25, 26 |
| **TC-38** | Login di `/admin/masuk` dengan email atau password salah | Muncul "Email atau kata sandi salah." | Muncul "Email atau kata sandi salah." dan tidak masuk ke dashboard | ✅ | 44 |

<table>
<tr><td align="center" width="50%"><img src="docs/screenshots/admin/15-login-admin.png" width="420" alt="Halaman Masuk Admin"><br><sub><b>15</b> Halaman Masuk Admin</sub></td><td align="center" width="50%"><img src="docs/screenshots/admin/16-dashboard-admin.png" width="420" alt="Dashboard admin"><br><sub><b>16</b> Dashboard admin</sub></td></tr>
<tr><td align="center" width="50%"><img src="docs/screenshots/admin/17-admin-antrean-panggil.png" width="420" alt="Antrean: menunggu giliran"><br><sub><b>17</b> Antrean: menunggu giliran</sub></td><td align="center" width="50%"><img src="docs/screenshots/admin/18-admin-antrean-dipanggil.png" width="420" alt="Antrean: status Dipanggil"><br><sub><b>18</b> Antrean: status Dipanggil</sub></td></tr>
<tr><td align="center" width="50%"><img src="docs/screenshots/admin/19-admin-antrean-sedang-berlangsung.png" width="420" alt="Antrean: sesi sedang berlangsung"><br><sub><b>19</b> Antrean: sesi sedang berlangsung</sub></td><td align="center" width="50%"><img src="docs/screenshots/admin/20-admin-verifikasi-tiket.png" width="420" alt="Verifikasi Tiket (kosong)"><br><sub><b>20</b> Verifikasi Tiket (kosong)</sub></td></tr>
<tr><td align="center" width="50%"><img src="docs/screenshots/admin/22-admin-tiket-valid.png" width="420" alt="Verifikasi Tiket: tiket valid"><br><sub><b>22</b> Verifikasi Tiket: tiket valid</sub></td><td align="center" width="50%"><img src="docs/screenshots/admin/23-admin-tiket-sedang-berlangsung.png" width="420" alt="Verifikasi Tiket: sesi sedang berlangsung"><br><sub><b>23</b> Verifikasi Tiket: sesi sedang berlangsung</sub></td></tr>
<tr><td align="center" width="50%"><img src="docs/screenshots/admin/25-admin-laporan-harian.png" width="420" alt="Laporan harian"><br><sub><b>25</b> Laporan harian</sub></td><td align="center" width="50%"><img src="docs/screenshots/admin/26-admin-laporan-bulanan.png" width="420" alt="Laporan bulanan"><br><sub><b>26</b> Laporan bulanan</sub></td></tr>
<tr><td align="center" width="50%"><img src="docs/screenshots/admin/44-admin-login-kredensial-salah.png" width="420" alt="Login admin dengan kredensial salah"><br><sub><b>44</b> Login admin dengan kredensial salah</sub></td><td align="center" width="50%"><img src="docs/screenshots/admin/54-admin-login-akun-pelanggan-ditolak.png" width="420" alt="Login admin dengan akun pelanggan ditolak"><br><sub><b>54</b> Login admin dengan akun pelanggan ditolak</sub></td></tr>
</table>

### 5.6 Pengelolaan Layanan, Voucher, dan Membership

| ID | Skenario | Hasil yang diharapkan | Hasil aktual | Status | Bukti |
|---|---|---|---|---|---|
| **TC-29** | Kelola Layanan: tambah paket | "Paket ditambahkan." | - | ⬜ | 24 (daftar paket saja) |
| **TC-30** | Kelola Layanan: ubah harga paket | "Paket diperbarui." | - | ⬜ | - |
| **TC-31** | Kelola Layanan: nonaktifkan paket | Paket tidak muncul di halaman booking | - | ⬜ | - |
| **TC-32** | Kelola Layanan: isi harga dengan huruf atau desimal | Muncul pesan validasi | - | ⬜ | - |
| **TC-33** | Voucher: tambah voucher baru | "Voucher ditambahkan." | - | ⬜ | 27 (daftar voucher saja) |
| **TC-34** | Voucher: pakai voucher saat booking sebagai pelanggan | Potongan sesuai pengaturan | Voucher aktif di admin (diskon 10% semua paket, maks. Rp 15.000) dipakai pelanggan: potongan Rp 8.000 dari Rp 80.000, sesuai 10% | ✅ | 12, 27 |
| **TC-35** | Voucher: ubah dan nonaktifkan | Perubahan tersimpan, voucher nonaktif tidak bisa dipakai | - | ⬜ | - |
| **TC-36** | Voucher: diskon persen lebih dari 100 | "Voucher persen maksimal 100." | - | ⬜ | - |
| **TC-37** | Membership: lihat tingkat dan tingkat pelanggan | Tingkat dan diskon tampil, pelanggan masuk tingkat sesuai sesi selesai | Empat tingkat tampil (Reguler 0%, Silver 5%, Gold 10%, Platinum 15%). Pelanggan uji berada di Reguler dengan 2 sesi selesai, dan sisi pelanggan menampilkan info 3 sesi lagi menuju Silver | ✅ | 06, 27, 28 |

<table>
<tr><td align="center" width="50%"><img src="docs/screenshots/admin/24-admin-kelola-layanan.png" width="420" alt="Kelola Layanan: daftar paket dan harga tambahan"><br><sub><b>24</b> Kelola Layanan: daftar paket dan harga tambahan</sub></td><td align="center" width="50%"><img src="docs/screenshots/admin/27-admin-voucher-membership.png" width="420" alt="Voucher dan Membership"><br><sub><b>27</b> Voucher dan Membership</sub></td></tr>
<tr><td align="center" width="50%"><img src="docs/screenshots/admin/28-admin-tingkat-membership.png" width="420" alt="Tingkat membership dan daftar pelanggan"><br><sub><b>28</b> Tingkat membership dan daftar pelanggan</sub></td><td></td></tr>
</table>

## 6. Rekap Hasil dan Defect Density

| Keterangan | Jumlah |
|---|---|
| Total test case | 38 |
| ✅ Berhasil | 20 |
| 🟡 Sebagian | 6 |
| ⬜ Belum dieksekusi | 12 |
| ❌ Gagal | 0 |
| Persentase berhasil penuh dari yang dieksekusi | 20 dari 26 (76.9%) |

**Ukuran kode:** 2.832 baris (2,83 KLOC), dihitung dari seluruh file `.ts` dan `.tsx` di folder `app`, `components`, dan `lib` pada kode yang diunggah. Baris kosong ikut terhitung.

**Defect density** = jumlah bug ÷ ukuran kode (KLOC) = 0 ÷ 2,83 = **0,00 bug per KLOC**.

Angka ini berlaku untuk 26 test case yang sudah dieksekusi. Jika ada bug baru dari test case yang belum dieksekusi atau perubahan kode, nilainya dihitung ulang. Perintah untuk menghitung ulang ukuran kode, dijalankan di folder proyek:

```bash
find app components lib -name "*.ts" -o -name "*.tsx" | xargs wc -l
```

## 7. Bug Log

Tidak ada bug yang ditemukan dari 26 test case yang sudah dieksekusi.

| ID Bug | Test case | Deskripsi | Langkah mengulang | Keparahan | Status |
|---|---|---|---|---|---|
| - | - | Belum ada bug yang tercatat | - | - | - |

### Catatan pengamatan (bukan bug)

- Kamera scan QR di halaman Verifikasi Tiket menampilkan layar abu-abu dengan ikon kunci karena izin kamera belum diberikan di browser, sehingga scan lewat kamera belum teruji. Verifikasi lewat ketik kode berhasil (TC-25).
- Laporan menampilkan "rata-rata waktu layanan 0.3 menit" karena sesi uji dimulai dan diselesaikan dalam hitungan detik. Ini wajar pada data uji.
- Voucher **SNAPQ11** pada pengujian 22 November (pukul 20.39) ditolak dengan pesan "Kuota voucher sudah habis", padahal sebelumnya berhasil dipakai (hemat Rp 8.000). Ini sesuai perilaku kuota voucher, bukan bug.
- Voucher di admin tercatat **SNAPQ10**, sedangkan pelanggan memakai **SNAPQ11**. Perlu dikonfirmasi ke developer apakah keduanya voucher yang berbeda.

## 8. UAT (User Acceptance Test)

UAT dilakukan lewat Google Form oleh **6 responden** (calon pengguna di luar tim) pada 22 November 2026. Responden mencoba web SnapQ terlebih dahulu, lalu mengisi penilaian. Syarat minimal 5 responden terpenuhi.

Nama responden tidak dicantumkan di dokumen ini. Daftar lengkap ada di Google Form dan lampiran laporan.

### 8.1 Profil responden dan fitur yang dicoba

| Keterangan | Hasil |
|---|---|
| Jumlah responden | 6 orang |
| Sudah mencoba web SnapQ | 6 dari 6 (100%) |
| Perangkat yang dipakai | HP 3 orang (50%), Laptop/PC 3 orang (50%), Tablet 0 |

Fitur yang dicoba, masing-masing oleh 6 dari 6 responden (100%): daftar akun, login, pilih paket, tanggal, dan jam, pakai voucher, booking dan bayar, lihat tiket dan QR Code, serta lihat nomor antrean di Booking Saya.

### 8.2 Penyelesaian alur

Pertanyaan: *Apakah kamu bisa menyelesaikan proses dari daftar sampai dapat tiket tanpa bantuan?*

| Jawaban | Jumlah | Persentase |
|---|---|---|
| Ya, tanpa bantuan | 5 | 83,3% |
| Ya, tapi sempat bingung | 1 | 16,7% |
| Tidak bisa menyelesaikan | 0 | 0% |

Seluruh responden (6 dari 6) berhasil menyelesaikan alur dari daftar sampai mendapat tiket. Kolom "di bagian mana yang membingungkan" bersifat tidak wajib diisi, sehingga bagian yang membingungkan bagi 1 responden tidak dirinci.

### 8.3 Penilaian (skala 1 sampai 5)

| Pernyataan | 1 | 2 | 3 | 4 | 5 | Rata-rata |
|---|---|---|---|---|---|---|
| Aplikasi ini mudah dipakai | 0 | 0 | 0 | 0 | 6 | 5,00 |
| Tampilan menarik dan nyaman dilihat | 0 | 0 | 0 | 1 | 5 | 4,83 |
| Alur booking jelas dan mudah diikuti | 0 | 0 | 0 | 0 | 6 | 5,00 |
| Tiket dan QR Code mudah ditemukan dan dipahami | 0 | 0 | 0 | 0 | 6 | 5,00 |
| Informasi antrean dan status booking mudah dipahami | 0 | 0 | 0 | 0 | 6 | 5,00 |
| **Rata-rata keseluruhan** | | | | | | **4,97** |

### 8.4 Kendala, saran, dan minat memakai

- **Kendala atau error:** kolom ini tidak wajib diisi. Tiga dari 6 responden mengisi, dan semuanya menyebut tidak ada kendala.
- **Saran perbaikan:**
  - Desain bisa dibuat lebih bagus.
  - Perlu notifikasi pengingat saat jadwal foto sudah dekat.
  - Perlu fitur reset password pada halaman login.
  - Responden lain menyebut aplikasi sudah bagus dan mudah digunakan.
- **Minat memakai:** 6 dari 6 responden (100%) menjawab **Ya**, mau memakai SnapQ kalau studio foto menyediakannya.

### 8.5 Bukti UAT (Google Form)

<table>
<tr><td align="center" width="50%"><img src="docs/screenshots/uat/uat-jumlah-responden.png" width="420" alt="Jumlah responden (nama disamarkan)"><br><sub>Jumlah responden (nama disamarkan)</sub></td><td align="center" width="50%"><img src="docs/screenshots/uat/uat-sudah-mencoba-web.png" width="420" alt="Sudah mencoba web SnapQ"><br><sub>Sudah mencoba web SnapQ</sub></td></tr>
<tr><td align="center" width="50%"><img src="docs/screenshots/uat/uat-fitur-yang-dicoba.png" width="420" alt="Fitur yang dicoba"><br><sub>Fitur yang dicoba</sub></td><td align="center" width="50%"><img src="docs/screenshots/uat/uat-perangkat-responden.png" width="420" alt="Perangkat responden"><br><sub>Perangkat responden</sub></td></tr>
<tr><td align="center" width="50%"><img src="docs/screenshots/uat/uat-selesai-tanpa-bantuan.png" width="420" alt="Penyelesaian alur tanpa bantuan"><br><sub>Penyelesaian alur tanpa bantuan</sub></td><td align="center" width="50%"><img src="docs/screenshots/uat/uat-bagian-yang-bingung.png" width="420" alt="Bagian yang membingungkan (tidak wajib)"><br><sub>Bagian yang membingungkan (tidak wajib)</sub></td></tr>
<tr><td align="center" width="50%"><img src="docs/screenshots/uat/uat-mudah-dipakai.png" width="420" alt="Penilaian: mudah dipakai"><br><sub>Penilaian: mudah dipakai</sub></td><td align="center" width="50%"><img src="docs/screenshots/uat/uat-tampilan.png" width="420" alt="Penilaian: tampilan"><br><sub>Penilaian: tampilan</sub></td></tr>
<tr><td align="center" width="50%"><img src="docs/screenshots/uat/uat-alur-booking.png" width="420" alt="Penilaian: alur booking"><br><sub>Penilaian: alur booking</sub></td><td align="center" width="50%"><img src="docs/screenshots/uat/uat-tiket-dan-qr-code.png" width="420" alt="Penilaian: tiket dan QR Code"><br><sub>Penilaian: tiket dan QR Code</sub></td></tr>
<tr><td align="center" width="50%"><img src="docs/screenshots/uat/uat-antrean-dan-status.png" width="420" alt="Penilaian: antrean dan status"><br><sub>Penilaian: antrean dan status</sub></td><td align="center" width="50%"><img src="docs/screenshots/uat/uat-kendala-atau-error.png" width="420" alt="Kendala atau error (tidak wajib)"><br><sub>Kendala atau error (tidak wajib)</sub></td></tr>
<tr><td align="center" width="50%"><img src="docs/screenshots/uat/uat-saran-perbaikan.png" width="420" alt="Saran perbaikan"><br><sub>Saran perbaikan</sub></td><td align="center" width="50%"><img src="docs/screenshots/uat/uat-mau-memakai-snapq.png" width="420" alt="Bersedia memakai SnapQ"><br><sub>Bersedia memakai SnapQ</sub></td></tr>
</table>

### 8.6 Kesimpulan UAT

Dari 6 responden, seluruhnya berhasil menyelesaikan alur dari daftar sampai mendapat tiket, 5 di antaranya tanpa bantuan. Rata-rata penilaian keseluruhan 4,97 dari 5, dan seluruh responden bersedia memakai SnapQ. Hasil ini menunjukkan SnapQ dapat diterima pengguna.

Batasan: jumlah responden hanya 6 dan seluruhnya diminta mencoba langsung, sehingga hasil ini menggambarkan penerimaan awal, bukan tingkat kepuasan pengguna secara umum. Saran yang masuk (pengingat jadwal, reset password, penyempurnaan desain) menjadi masukan pengembangan berikutnya, bukan bug pada fitur yang ada.

## 9. Kesimpulan dan Rekomendasi

- **Hasil pengujian fungsional:** dari 38 test case yang dirancang, 26 sudah dieksekusi (20 berhasil penuh, 6 sebagian) dan tidak ada yang gagal. Sebanyak 12 test case belum dieksekusi, terutama pengelolaan layanan dan voucher di sisi admin yang mengubah data bersama, serta beberapa validasi di sisi pelanggan.
- **Bug:** belum ada bug yang tercatat. Defect density 0,00 bug per KLOC.
- **UAT:** penerimaan pengguna baik (lihat bagian 8.6).
- **Keterbatasan:** scan QR lewat kamera, unduhan tiket PDF, laporan mingguan, penolakan password pendek saat mendaftar, dan skenario jam bentrok antarakun belum dibuktikan.
- **Rekomendasi pengembangan:** tambah fitur reset password, notifikasi pengingat jadwal foto, dan penyempurnaan tampilan.
- **Rekomendasi pengujian lanjutan:** lengkapi test case yang masih berstatus ⬜ dan 🟡, lalu hitung ulang rekap dan defect density.

## 10. Lampiran

### Lampiran A. Daftar file bukti

Semua file ada di folder `docs/screenshots/`.

**Folder `pelanggan/`**

| No | Nama file | Isi |
|---|---|---|
| 01 | `01-beranda.png` | Halaman awal SnapQ (pilihan masuk pelanggan atau admin) |
| 02 | `02-halaman-masuk-pelanggan.png` | Halaman login pelanggan (form kosong) |
| 03 | `03-form-daftar-kosong.png` | Form daftar (kosong) |
| 04 | `04-form-daftar-terisi.png` | Form daftar terisi |
| 05 | `05-akun-setelah-daftar.png` | Halaman Akun setelah daftar |
| 06 | `06-booking-pilih-paket.png` | Halaman booking: kartu member dan daftar paket |
| 07 | `07-booking-pilih-tanggal-jam.png` | Pilihan tanggal dan jam (10.00 sampai 20.45) |
| 08 | `08-booking-tersimpan-dengan-voucher.png` | Booking tersimpan dengan voucher (Rp 72.000, hemat Rp 8.000) |
| 09 | `09-booking-tersimpan-tanpa-voucher.png` | Booking tersimpan tanpa voucher (Rp 80.000) |
| 10 | `10-booking-saya-menunggu-pembayaran.png` | Booking Saya: menunggu pembayaran |
| 11 | `11-booking-saya-lunas.png` | Booking Saya: lunas, siap dilayani |
| 12 | `12-booking-tambahan-voucher-total.png` | Tambahan, voucher, dan total di halaman booking |
| 13 | `13-tiket-qr-code.png` | Tiket sesi foto dengan QR Code |
| 29 | `29-daftar-email-sudah-terdaftar.png` | Daftar dengan email yang sudah terdaftar |
| 30 | `30-daftar-email-sudah-terdaftar-2.png` | Daftar dengan email yang sudah terdaftar (akun uji lain) |
| 31 | `31-halaman-akun-sebelum-keluar.png` | Halaman Akun dengan tombol Keluar |
| 32 | `32-login-password-salah.png` | Login dengan password salah |
| 33 | `33-layanan-daftar-harga.png` | Halaman Daftar Harga |
| 34 | `34-layanan-yang-kamu-dapat-dan-tambahan.png` | Daftar Harga: yang didapat dan tambahan |
| 35 | `35-booking-pilih-paket-akun-kedua.png` | Booking: pilih paket (akun kedua) |
| 36 | `36-booking-pilih-jam-23-november.png` | Booking: pilih jam pada 23 November |
| 37 | `37-booking-voucher-kuota-habis.png` | Voucher ditolak: kuota habis |
| 38 | `38-booking-jam-terisi-voucher-kuota-habis.png` | Jam terisi dicoret dan voucher ditolak |
| 39 | `39-booking-tersimpan-23-november.png` | Booking tersimpan 23 November |
| 40 | `40-booking-saya-menunggu-pembayaran-akun-kedua.png` | Booking Saya menunggu pembayaran (akun kedua) |
| 41 | `41-pembayaran-pilih-metode-transfer-bank.png` | Pilihan metode pembayaran (Transfer Bank, VA simulasi) |
| 42 | `42-booking-saya-lunas-akun-kedua.png` | Booking Saya lunas (akun kedua) |
| 43 | `43-tiket-qr-akun-kedua.png` | Tiket dengan QR Code (akun kedua) |
| 48 | `48-login-terisi-sebelum-masuk.png` | Form login terisi sebelum klik Masuk |
| 50 | `50-setelah-keluar.png` | Halaman login setelah keluar |
| 52 | `52-dialihkan-ke-login.png` | Halaman login setelah membuka /booking tanpa login |
| 53 | `53-daftar-password-pendek.png` | Form daftar dengan password 5 karakter |

**Folder `admin/`**

| No | Nama file | Isi |
|---|---|---|
| 14 | `14-beranda-admin.png` | Halaman awal SnapQ (dari perangkat admin) |
| 15 | `15-login-admin.png` | Halaman Masuk Admin |
| 16 | `16-dashboard-admin.png` | Dashboard admin |
| 17 | `17-admin-antrean-panggil.png` | Antrean: menunggu giliran |
| 18 | `18-admin-antrean-dipanggil.png` | Antrean: status Dipanggil |
| 19 | `19-admin-antrean-sedang-berlangsung.png` | Antrean: sesi sedang berlangsung |
| 20 | `20-admin-verifikasi-tiket.png` | Verifikasi Tiket (kosong) |
| 21 | `21-admin-verifikasi-kamera.png` | Verifikasi Tiket: kamera (izin belum diberikan) |
| 22 | `22-admin-tiket-valid.png` | Verifikasi Tiket: tiket valid |
| 23 | `23-admin-tiket-sedang-berlangsung.png` | Verifikasi Tiket: sesi sedang berlangsung |
| 24 | `24-admin-kelola-layanan.png` | Kelola Layanan: daftar paket dan harga tambahan |
| 25 | `25-admin-laporan-harian.png` | Laporan harian |
| 26 | `26-admin-laporan-bulanan.png` | Laporan bulanan |
| 27 | `27-admin-voucher-membership.png` | Voucher dan Membership |
| 28 | `28-admin-tingkat-membership.png` | Tingkat membership dan daftar pelanggan |
| 44 | `44-admin-login-kredensial-salah.png` | Login admin dengan kredensial salah |
| 54 | `54-admin-login-akun-pelanggan-ditolak.png` | Login admin dengan akun pelanggan ditolak |

**Folder `uat/`**: 14 file hasil Google Form (nama berawalan `uat-`), seluruhnya ditampilkan di bagian 8.5.

### Lampiran B. Struktur folder bukti

```
PANDUAN-PENGUJIAN.md
TEST-CASE.md
docs/
└── screenshots/
    ├── pelanggan/   screenshot pengujian sisi pelanggan
    ├── admin/       screenshot pengujian halaman admin
    └── uat/         hasil Google Form UAT
```
