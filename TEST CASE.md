# Test Case SnapQ

Rancangan dan hasil eksekusi test case aplikasi **SnapQ** (https://snapq-u13t.vercel.app/). Dokumen ini pelengkap [`PANDUAN-PENGUJIAN.md`](PANDUAN-PENGUJIAN.md) yang memuat test plan, rekap, bug log, dan UAT.

| | |
|---|---|
| **Penguji** | Siska |
| **Jenis pengujian** | Fungsional manual (black box) |
| **Lingkungan** | Web yang sudah di-deploy (Vercel), laptop Windows 11, Microsoft Edge |
| **Jumlah test case** | 38 |

## Cara Membaca Dokumen

- **ID test case:** `TC-nn`. Satu ID berarti satu skenario.
- **Prioritas:** Tinggi (alur utama), Sedang (fitur pendukung), Rendah (validasi atau tampilan).
- Setiap modul punya dua tabel: **Rancangan** (apa yang diuji) dan **Hasil Eksekusi** (apa yang terjadi).
- **Bukti** berisi nomor awal nama file screenshot di folder `docs/screenshots/`, misalnya `04` berarti `04-form-daftar-terisi.png`. Daftar file ada di Lampiran A `PANDUAN-PENGUJIAN.md`.

| Status | Arti |
|---|---|
| ✅ | Berhasil: hasil aktual sesuai harapan dan ada bukti lengkap |
| 🟡 | Sebagian: sebagian langkah atau hasil terbukti |
| ⬜ | Belum dieksekusi |
| ❌ | Gagal: hasil aktual tidak sesuai harapan |

## Ringkasan per Modul

| Modul | Total | ✅ | 🟡 | ⬜ | ❌ |
|---|---|---|---|---|---|
| A. Registrasi dan Login | 7 | 5 | 2 | 0 | 0 |
| B. Layanan, Paket, dan Jadwal | 5 | 2 | 1 | 2 | 0 |
| C. Booking, Voucher, dan Pembayaran | 6 | 5 | 1 | 0 | 0 |
| D. Tiket dan QR Code | 4 | 1 | 1 | 2 | 0 |
| E. Admin: Akses, Antrean, Verifikasi, dan Laporan | 7 | 5 | 1 | 1 | 0 |
| F. Admin: Layanan, Voucher, dan Membership | 9 | 2 | 0 | 7 | 0 |
| **Total** | **38** | **20** | **6** | **12** | **0** |

---

## A. Registrasi dan Login

### Rancangan

| ID | Prioritas | Skenario | Prasyarat | Data uji | Langkah | Hasil yang diharapkan |
|---|---|---|---|---|---|---|
| **TC-01** | Tinggi | Daftar akun baru: buka `/daftar`, isi nama, nomor HP, email, password (min. 6 karakter), klik Daftar | Web terbuka. Email belum pernah terdaftar. | Nama, nomor HP, email akun uji, password minimal 6 karakter | 1. Buka https://snapq-u13t.vercel.app/<br>2. Klik "Masuk sebagai Pelanggan", lalu klik "Daftar"<br>3. Isi nama lengkap, nomor HP, email, dan kata sandi<br>4. Klik tombol Daftar | Akun terbuat dan pengguna masuk ke halaman Akun |
| **TC-02** | Tinggi | Daftar memakai email yang sudah terdaftar | Email sudah terdaftar di sistem. | Email yang sudah terdaftar, dengan nama, nomor HP, dan password apa saja | 1. Buka halaman `/daftar`<br>2. Isi form memakai email yang sudah terdaftar<br>3. Klik tombol Daftar | Muncul pesan error, akun tidak ganda |
| **TC-03** | Sedang | Daftar dengan password kurang dari 6 karakter | Web terbuka. Email belum terdaftar. | Password 5 karakter (contoh `12345`), data lain valid | 1. Buka halaman `/daftar`<br>2. Isi nama, nomor HP, dan email yang valid<br>3. Isi kata sandi dengan 5 karakter<br>4. Klik tombol Daftar | Form menolak |
| **TC-04** | Tinggi | Login di `/masuk` dengan email dan password benar | Akun pelanggan sudah terdaftar. | Email dan password akun uji yang benar | 1. Buka halaman `/masuk`<br>2. Isi email dan kata sandi<br>3. Klik tombol Masuk | Masuk ke halaman Akun |
| **TC-05** | Tinggi | Login dengan password salah | Akun pelanggan sudah terdaftar. | Email benar, password salah | 1. Buka halaman `/masuk`<br>2. Isi email yang benar dan kata sandi yang salah<br>3. Klik tombol Masuk | Muncul "Email atau kata sandi salah." |
| **TC-06** | Sedang | Klik tombol Keluar di halaman Akun | Pelanggan sudah login dan berada di halaman Akun. | - | 1. Di halaman Akun, klik tombol Keluar<br>2. Perhatikan halaman yang muncul | Kembali ke `/masuk` |
| **TC-07** | Tinggi | Buka `/booking` tanpa login | Pelanggan belum login (sudah keluar). | Alamat `https://snapq-u13t.vercel.app/booking` | 1. Ketik alamat `/booking` di address bar browser<br>2. Tekan Enter<br>3. Perhatikan halaman yang muncul | Diarahkan ke `/masuk` |

### Hasil Eksekusi

| ID | Hasil aktual | Status | Bukti | Tanggal uji |
|---|---|---|---|---|
| **TC-01** | Akun terbuat dan langsung masuk ke halaman Akun, tampil sapaan "Halo, sissy" | ✅ | 03, 04, 05 | 22 Nov 2026 |
| **TC-02** | Muncul pesan "User already registered" di atas tombol Daftar, akun tidak terbuat lagi | ✅ | 29, 30 | 22 Nov 2026 |
| **TC-03** | Form terisi dengan nama, nomor HP, dan email yang valid, serta password 5 karakter. Hasil penolakan setelah tombol Daftar ditekan belum terfoto | 🟡 | 53 | 24 Nov 2026 |
| **TC-04** | Form login terisi dengan email akun uji. Halaman Akun menampilkan sapaan nama pengguna serta tombol Booking Sesi Foto, Booking Saya, dan Keluar. Foto saat tombol Masuk ditekan belum ada | 🟡 | 02, 48, 05 | 22 dan 23 Nov 2026 |
| **TC-05** | Muncul "Email atau kata sandi salah." dan pengguna tetap di halaman login | ✅ | 32 | 22 Nov 2026 |
| **TC-06** | Setelah tombol Keluar ditekan, pengguna kembali ke halaman login `/masuk` | ✅ | 31, 50 | 24 Nov 2026 |
| **TC-07** | Membuka `/booking` tanpa login mengarahkan pengguna ke halaman login `/masuk`. Alamat `/booking` yang diketik tidak ikut terfoto | ✅ | 52 | 24 Nov 2026 |

## B. Layanan, Paket, dan Jadwal

### Rancangan

| ID | Prioritas | Skenario | Prasyarat | Data uji | Langkah | Hasil yang diharapkan |
|---|---|---|---|---|---|---|
| **TC-08** | Sedang | Buka halaman `/layanan` | Web terbuka. | - | 1. Di halaman awal, klik "Lihat daftar harga" (atau buka `/layanan`)<br>2. Gulir halaman sampai bagian tambahan | Daftar harga, tambahan, dan jam operasional tampil |
| **TC-09** | Tinggi | Di `/booking`, lihat dan pilih paket | Pelanggan sudah login. | Paket Sendirian Saja dan paket lain (misalnya Berdua-an Saja) | 1. Klik "Booking Sesi Foto" di halaman Akun<br>2. Lihat daftar paket dan harganya<br>3. Klik paket lain, lalu perhatikan paket yang ter-highlight dan perubahan harga atau durasi | Daftar paket dan harga tampil, paket terpilih ter-highlight |
| **TC-10** | Sedang | Pilih tanggal hari ini | Pelanggan login dan berada di halaman booking. | Tanggal hari ini | 1. Pilih tanggal hari ini pada kolom tanggal<br>2. Perhatikan jam yang sudah lewat pada daftar jam | Jam yang sudah lewat tidak bisa dipilih |
| **TC-11** | Sedang | Pilih tanggal lebih dari 30 hari ke depan | Pelanggan login dan berada di halaman booking. | Tanggal lebih dari 30 hari dari hari uji | 1. Pilih tanggal yang lebih dari 30 hari ke depan<br>2. Perhatikan apakah tanggal diterima atau ditolak | Ditolak atau tidak bisa dipilih |
| **TC-12** | Sedang | Tambah Extra Time dan Print | Pelanggan login dan berada di halaman booking. | Extra Time 1x, Print 1x | 1. Tekan tombol + pada "Add Extra Time 10 Menit"<br>2. Tekan tombol + pada "Add Print"<br>3. Perhatikan subtotal, total, dan jam selesai | Total harga dan durasi bertambah |

### Hasil Eksekusi

| ID | Hasil aktual | Status | Bukti | Tanggal uji |
|---|---|---|---|---|
| **TC-08** | Halaman Daftar Harga menampilkan 6 paket (Rp 40.000 sampai Rp 175.000), jam operasional 10.00 - 21.00, bagian "Yang Kamu Dapat", dan tambahan (Add Print dan Add Extra Time, masing-masing Rp 20.000) | ✅ | 33, 34 | 22 Nov 2026 |
| **TC-09** | Enam paket tampil beserta harga dan jumlah orang, paket terpilih ter-highlight. Perubahan durasi antarpaket belum dicek | 🟡 | 06, 35 | 22 Nov 2026 |
| **TC-10** | - | ⬜ | 07 (tanggal lain, bukan hari ini) | - |
| **TC-11** | - | ⬜ | - | - |
| **TC-12** | Extra Time 1x dan Print 1x: subtotal Rp 80.000 (Rp 40.000 + 2 x Rp 20.000) tampil di rincian | ✅ | 12 | 22 Nov 2026 |

## C. Booking, Voucher, dan Pembayaran

### Rancangan

| ID | Prioritas | Skenario | Prasyarat | Data uji | Langkah | Hasil yang diharapkan |
|---|---|---|---|---|---|---|
| **TC-13** | Tinggi | Pilih paket, tanggal, jam, lalu pesan | Pelanggan login. Ada jam yang masih kosong. | Paket Sendirian Saja, tanggal dan jam kosong, tambahan opsional | 1. Pilih paket<br>2. Pilih tanggal dan jam<br>3. (Opsional) isi tambahan dan voucher<br>4. Klik Konfirmasi Booking | "Booking Tersimpan", status menunggu pembayaran |
| **TC-14** | Tinggi | Dengan 2 akun, pesan jam yang sama | Dua akun uji. Akun A sudah memesan jam tertentu. | Tanggal dan jam yang sama pada akun A dan akun B | 1. Akun A memesan satu jam pada tanggal tertentu<br>2. Login sebagai akun B dan buka halaman booking pada tanggal yang sama<br>3. Perhatikan jam tersebut, atau coba memesannya | Akun kedua mendapat pesan jam sudah dipesan |
| **TC-15** | Sedang | Masukkan kode voucher valid | Pelanggan login. Ada voucher aktif dengan kuota tersisa. | Kode voucher aktif (SNAPQ11 saat kuota masih ada) | 1. Isi kode pada kolom Voucher<br>2. Klik tombol Pakai<br>3. Perhatikan potongan dan total | Potongan muncul, total turun |
| **TC-16** | Sedang | Masukkan kode voucher yang tidak bisa dipakai | Pelanggan login dan berada di halaman booking. | Kode voucher yang kuotanya habis, kedaluwarsa, atau tidak dikenal | 1. Isi kode pada kolom Voucher<br>2. Klik tombol Pakai<br>3. Perhatikan pesan dan total | Muncul pesan voucher tidak bisa dipakai |
| **TC-17** | Sedang | Buka Booking Saya | Ada booking yang sudah dibuat. | - | 1. Setelah booking, klik "Lihat nomor antrean saya" (atau buka Booking Saya)<br>2. Perhatikan nomor antrean dan status | Booking tampil dengan nomor antrean |
| **TC-18** | Tinggi | Bayar booking (simulasi) | Ada booking berstatus menunggu pembayaran (belum lewat 15 menit). | Metode Transfer Bank, Bank Mandiri | 1. Di Booking Saya, klik Bayar Sekarang<br>2. Pilih metode pembayaran dan bank<br>3. Klik tombol Bayar<br>4. Perhatikan status booking | Status berubah menjadi lunas |

### Hasil Eksekusi

| ID | Hasil aktual | Status | Bukti | Tanggal uji |
|---|---|---|---|---|
| **TC-13** | Muncul "Booking Tersimpan" dengan rincian paket, jadwal, total, dan keterangan bayar dalam 15 menit. Berhasil dengan voucher maupun tanpa voucher | ✅ | 08, 09, 39 | 22 Nov 2026 |
| **TC-14** | Pada akun kedua, jam 13.30 dan 13.45 tampil dicoret dan tidak bisa dipilih. Pesan saat dua akun memesan jam yang sama bersamaan belum dibuktikan | 🟡 | 38 | 22 Nov 2026 |
| **TC-15** | Voucher SNAPQ11 dipakai: hemat Rp 8.000, total Rp 80.000 menjadi Rp 72.000 | ✅ | 08, 12 | 22 Nov 2026 |
| **TC-16** | Kode SNAPQ11 ditolak dengan pesan "Kuota voucher sudah habis", total tetap tanpa potongan. Ini kasus kuota habis, kode yang tidak dikenal belum dicoba | ✅ | 37, 38 | 22 Nov 2026 |
| **TC-17** | Booking tampil dengan nomor antrean 1, status "Menunggu pembayaran", batas bayar, dan tombol Bayar Sekarang | ✅ | 10, 40 | 22 Nov 2026 |
| **TC-18** | Halaman pilih metode menampilkan QRIS, Transfer Bank, E-Wallet (83 bank), nomor Virtual Account simulasi, dan keterangan mode simulasi. Setelah bayar, status menjadi "Lunas, siap dilayani", muncul tombol Lihat Tiket, dan metode tercatat di tiket (Bank Mandiri) | ✅ | 10, 11, 41, 42 | 22 Nov 2026 |

## D. Tiket dan QR Code

### Rancangan

| ID | Prioritas | Skenario | Prasyarat | Data uji | Langkah | Hasil yang diharapkan |
|---|---|---|---|---|---|---|
| **TC-19** | Tinggi | Buka tiket booking yang lunas | Ada booking berstatus lunas. | - | 1. Di Booking Saya, klik Lihat Tiket<br>2. Perhatikan isi tiket dan QR Code | Tiket lengkap dengan QR Code |
| **TC-20** | Sedang | Buka tiket booking yang belum lunas | Booking belum lunas, atau ID tiket tidak valid. | Alamat tiket dari booking belum lunas atau ID asal | 1. Buka alamat halaman tiket tersebut<br>2. Perhatikan pesan yang muncul | Muncul "Tiket tidak ditemukan, atau booking belum lunas." |
| **TC-21** | Sedang | Unduh tiket sebagai PDF | Ada tiket lunas. | - | 1. Di halaman tiket, klik "Unduh Tiket PDF"<br>2. Buka file PDF yang terunduh<br>3. Periksa isi PDF | File PDF terunduh dan isinya benar |
| **TC-22** | Sedang | Scan QR Code tiket | Ada tiket lunas. HP dengan pemindai QR. | QR Code pada tiket | 1. Buka halaman tiket<br>2. Arahkan kamera atau pemindai QR ke QR Code<br>3. Baca isi yang terbaca | QR terbaca, berisi kode tiket |

### Hasil Eksekusi

| ID | Hasil aktual | Status | Bukti | Tanggal uji |
|---|---|---|---|---|
| **TC-19** | Tiket tampil: nomor antrean, QR Code, kode tiket (format SNQ-XXXXXXXX), nama, paket, jumlah orang, tanggal, jam, tambahan, metode bayar, total | ✅ | 13, 43 | 22 Nov 2026 |
| **TC-20** | - | ⬜ | - | - |
| **TC-21** | Tombol "Unduh Tiket PDF" tampil di halaman tiket. Hasil unduhan belum dibuktikan | 🟡 | 13 | 22 Nov 2026 |
| **TC-22** | - | ⬜ | - | - |

## E. Admin: Akses, Antrean, Verifikasi, dan Laporan

### Rancangan

| ID | Prioritas | Skenario | Prasyarat | Data uji | Langkah | Hasil yang diharapkan |
|---|---|---|---|---|---|---|
| **TC-23** | Tinggi | Login di `/admin/masuk` dengan akun admin | Akun admin tersedia. | Email dan password akun admin | 1. Buka `/admin/masuk`<br>2. Isi email dan kata sandi admin<br>3. Klik Masuk | Masuk ke dashboard admin |
| **TC-24** | Tinggi | Login admin memakai akun pelanggan | Akun pelanggan yang valid. | Email dan password akun pelanggan yang benar | 1. Buka `/admin/masuk`<br>2. Isi email dan kata sandi akun pelanggan<br>3. Klik Masuk<br>4. Perhatikan pesan penolakan | Ditolak: "Akun ini bukan akun admin." |
| **TC-25** | Tinggi | Verifikasi Tiket: masukkan kode tiket | Login admin. Ada tiket lunas. | Kode tiket format SNQ-XXXXXXXX | 1. Dari dashboard, buka Verifikasi Tiket<br>2. Ketik kode tiket pada kolom kode<br>3. Klik Cek<br>4. Perhatikan status dan detail tiket | Status tiket dan detail booking tampil |
| **TC-26** | Tinggi | Antrean: Panggil, Mulai sesi, Selesai | Login admin. Ada booking lunas pada hari yang dipilih. | Tanggal antrean hari uji | 1. Dari dashboard, buka Antrean Hari Ini<br>2. Klik Panggil pada antrean pertama<br>3. Klik Mulai sesi<br>4. Klik Selesai<br>5. Perhatikan perubahan status di tiap langkah | Status berubah berurutan |
| **TC-27** | Sedang | Antrean: batalkan booking yang belum dibayar | Login admin. Ada booking belum dibayar di antrean. | Satu booking uji yang belum dibayar | 1. Buka Antrean Hari Ini<br>2. Klik Batalkan pada booking yang belum dibayar<br>3. Periksa status booking dan apakah jamnya terbuka kembali | Booking batal, jam dibuka lagi |
| **TC-28** | Sedang | Laporan harian, mingguan, bulanan | Login admin. Ada transaksi pada periode yang dipilih. | Tanggal harian, minggu, dan bulan yang berisi data | 1. Dari dashboard, buka Laporan<br>2. Pilih Harian, lalu pilih tanggal<br>3. Pilih Mingguan<br>4. Pilih Bulanan<br>5. Perhatikan pendapatan, booking, sesi selesai, dan paket terlaris | Pendapatan, jumlah booking, dan paket terlaris tampil |
| **TC-38** | Tinggi | Login di `/admin/masuk` dengan email atau password salah | Web terbuka. | Email atau password admin yang salah | 1. Buka `/admin/masuk`<br>2. Isi email dan kata sandi yang salah<br>3. Klik Masuk | Muncul "Email atau kata sandi salah." |

### Hasil Eksekusi

| ID | Hasil aktual | Status | Bukti | Tanggal uji |
|---|---|---|---|---|
| **TC-23** | Masuk ke dashboard: Antrean Hari Ini, Verifikasi Tiket, Kelola Layanan, Laporan, Voucher & Membership | ✅ | 14, 15, 16 | 6 Nov 2026 |
| **TC-24** | Login di `/admin/masuk` dengan akun pelanggan yang benar ditolak dengan pesan "Akun ini bukan akun admin." dan tidak masuk ke dashboard | ✅ | 54 | 24 Nov 2026 |
| **TC-25** | Tiket lunas tampil "Tiket valid, siap dipakai" lengkap dengan detail. Tiket yang sesinya berjalan tampil "Sesi ini sedang berlangsung" | ✅ | 20, 22, 23 | 6 Nov 2026 |
| **TC-26** | Status berubah dari "Lunas, menunggu giliran" ke "Dipanggil" lalu "Sedang berlangsung", dan tombol Selesai muncul. Tampilan di sisi pelanggan tidak ikut difoto | ✅ | 17, 18, 19 | 6 Nov 2026 |
| **TC-27** | - | ⬜ | 17 (tombol Batalkan tampil saja) | - |
| **TC-28** | Laporan harian dan bulanan tampil (pendapatan, booking dibayar, sesi selesai, paket terlaris, unduh CSV). Laporan mingguan belum dibuktikan | 🟡 | 25, 26 | 6 Nov 2026 |
| **TC-38** | Muncul "Email atau kata sandi salah." dan tidak masuk ke dashboard | ✅ | 44 | 22 Nov 2026 |

## F. Admin: Layanan, Voucher, dan Membership

### Rancangan

| ID | Prioritas | Skenario | Prasyarat | Data uji | Langkah | Hasil yang diharapkan |
|---|---|---|---|---|---|---|
| **TC-29** | Sedang | Kelola Layanan: tambah paket | Login admin. | Data paket uji (nama, jumlah orang, durasi, harga) | 1. Buka Kelola Layanan<br>2. Klik "+ Tambah Paket"<br>3. Isi data paket uji<br>4. Simpan | "Paket ditambahkan." |
| **TC-30** | Sedang | Kelola Layanan: ubah harga paket | Login admin. Ada paket uji. | Harga baru untuk paket uji | 1. Buka Kelola Layanan<br>2. Klik Ubah pada paket uji<br>3. Ubah harga<br>4. Simpan | "Paket diperbarui." |
| **TC-31** | Sedang | Kelola Layanan: nonaktifkan paket | Login admin. Ada paket uji aktif. | Paket uji | 1. Buka Kelola Layanan<br>2. Klik Nonaktifkan pada paket uji<br>3. Buka halaman booking sebagai pelanggan dan cek daftar paket | Paket tidak muncul di halaman booking |
| **TC-32** | Rendah | Kelola Layanan: isi harga dengan huruf atau desimal | Login admin. | Harga berisi huruf atau desimal | 1. Buka Kelola Layanan, lalu tambah atau ubah paket<br>2. Isi harga dengan huruf atau angka desimal<br>3. Simpan<br>4. Perhatikan pesan validasi | Muncul pesan validasi |
| **TC-33** | Sedang | Voucher: tambah voucher baru | Login admin. | Data voucher uji (kode, nilai diskon, kuota, masa berlaku) | 1. Buka Voucher dan Membership<br>2. Klik "+ Tambah Voucher"<br>3. Isi data voucher uji<br>4. Simpan | "Voucher ditambahkan." |
| **TC-34** | Sedang | Voucher: pakai voucher saat booking sebagai pelanggan | Ada voucher aktif. Pelanggan sedang membuat booking. | Voucher aktif (diskon 10%, maks. Rp 15.000) | 1. Pelanggan memilih paket dan jam<br>2. Isi kode voucher, klik Pakai<br>3. Bandingkan potongan dengan pengaturan voucher di admin | Potongan sesuai pengaturan |
| **TC-35** | Sedang | Voucher: ubah dan nonaktifkan | Login admin. Ada voucher uji. | Voucher uji | 1. Buka Voucher dan Membership<br>2. Klik Ubah, ubah isi voucher, simpan<br>3. Klik Nonaktifkan<br>4. Coba pakai voucher itu sebagai pelanggan | Perubahan tersimpan, voucher nonaktif tidak bisa dipakai |
| **TC-36** | Rendah | Voucher: diskon persen lebih dari 100 | Login admin. | Diskon persen 101 atau lebih | 1. Tambah atau ubah voucher<br>2. Isi diskon persen lebih dari 100<br>3. Simpan<br>4. Perhatikan pesan validasi | "Voucher persen maksimal 100." |
| **TC-37** | Rendah | Membership: lihat tingkat dan tingkat pelanggan | Login admin. Ada pelanggan dengan sesi selesai. | - | 1. Buka Voucher dan Membership<br>2. Lihat Tingkat Membership dan daftar Pelanggan dan Tingkatnya<br>3. Sebagai pelanggan, buka halaman Booking dan lihat kartu member | Tingkat dan diskon tampil, pelanggan masuk tingkat sesuai sesi selesai |

### Hasil Eksekusi

| ID | Hasil aktual | Status | Bukti | Tanggal uji |
|---|---|---|---|---|
| **TC-29** | - | ⬜ | 24 (daftar paket saja) | - |
| **TC-30** | - | ⬜ | - | - |
| **TC-31** | - | ⬜ | - | - |
| **TC-32** | - | ⬜ | - | - |
| **TC-33** | - | ⬜ | 27 (daftar voucher saja) | - |
| **TC-34** | Voucher aktif di admin (diskon 10% semua paket, maks. Rp 15.000) dipakai pelanggan: potongan Rp 8.000 dari Rp 80.000, sesuai 10% | ✅ | 12, 27 | 22 Nov dan 6 Nov 2026 |
| **TC-35** | - | ⬜ | - | - |
| **TC-36** | - | ⬜ | - | - |
| **TC-37** | Empat tingkat tampil (Reguler 0%, Silver 5%, Gold 10%, Platinum 15%). Pelanggan uji berada di Reguler dengan 2 sesi selesai, dan sisi pelanggan menampilkan info 3 sesi lagi menuju Silver | ✅ | 06, 27, 28 | 22 Nov dan 6 Nov 2026 |

---

## Rekap dan Tindak Lanjut

- Dari 38 test case: **20** berhasil penuh, **6** sebagian, **12** belum dieksekusi, **0** gagal.
- **Berstatus 🟡 (perlu bukti tambahan):** TC-03, TC-04, TC-09, TC-14, TC-21, TC-28.
- **Berstatus ⬜ (perlu dieksekusi):** TC-10, TC-11, TC-20, TC-22, TC-27, TC-29, TC-30, TC-31, TC-32, TC-33, TC-35, TC-36.
- Test case admin yang mengubah data bersama (TC-27 sampai TC-36 kecuali TC-34 dan TC-37) perlu dikoordinasikan dengan developer dan memakai data uji.

## Lampiran: Data Uji

| Data | Nilai | Keterangan |
|---|---|---|
| Akun pelanggan | Akun uji milik penguji | Dibuat lewat `/daftar`, kredensial tidak dicantumkan |
| Akun admin | Akun dari developer | Kredensial tidak dicantumkan |
| Paket | Sendirian Saja (Rp 40.000), Berdua-an Saja (Rp 75.000), Berkelompok 3 sampai 6 orang (Rp 100.000 sampai Rp 175.000) | Sesuai halaman `/layanan` |
| Tambahan | Add Extra Time 10 menit dan Add Print, masing-masing Rp 20.000 | Sesuai halaman `/layanan` |
| Jam operasional | 10.00 sampai 21.00, interval 15 menit | Sesuai halaman booking |
| Batas pembayaran | 15 menit setelah booking | Sesuai halaman Booking Saya |
| Voucher | SNAPQ10 dan SNAPQ11 (diskon 10%, maks. Rp 15.000) | Perlu dikonfirmasi ke developer apakah keduanya berbeda |
