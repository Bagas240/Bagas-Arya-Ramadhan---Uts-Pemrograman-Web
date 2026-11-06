# Perpustakaan - Aplikasi Web Pemesanan Buku

Tugas UTS Pemrograman Web. Aplikasi web sederhana untuk pemesanan buku pada toko online. Tugas ini berfokus pada sisi front-end, sehingga seluruh data diambil dari variabel JavaScript pada file terpisah (`js/data.js`) dan tidak memakai server atau database.

## Informasi Project

| Keterangan | Isi |
|---|---|
| Nama | Bagas |
| NIM | 312510328 |
| Mata kuliah | Pemrograman Web |
| Video presentasi (YouTube) | https://youtu.be/y1wnSpH0tBI |

## Teknologi

- HTML5 untuk struktur halaman
- CSS3 untuk tampilan (desain datar, tanpa gradasi)
- JavaScript (DOM, `localStorage`) untuk logika aplikasi
- Data dummy berbentuk array dan objek JSON pada `js/data.js`

## Struktur Folder

```
tugas-uts-web1/
|-- index.html        (halaman login)
|-- dashboard.html
|-- stok.html
|-- tracking.html
|-- checkout.html
|-- README.md
|-- css/
|   |-- style.css
|-- js/
|   |-- script.js
|   |-- data.js
|-- assets/
|   |-- logo.png
|-- img/
|   |-- pengantar_komunikasi.jpg
|   |-- manajemen_keuangan.jpg
|   |-- kepemimpinan.jpg
|   |-- mikrobiologi.jpg
|   |-- paud_perkembangan.jpg
|-- screenshots/      (tangkapan layar untuk README)
```

## Cara Menjalankan

Login dengan akun uji coba:
   - Email: `Bagas@gmail.com`
   - Password: `bagas123`

## Penjelasan dan Hasil Tangkapan Layar

### 1. Halaman Login (`index.html`)

Pengguna mengisi email dan password lalu menekan tombol Login. Data dicocokkan dengan `dataPengguna` pada `data.js`. Jika tidak cocok, muncul alert berisi pesan "Email/password yang anda masukkan salah". Jika cocok, data sesi disimpan dan pengguna diarahkan ke dashboard. Semua halaman lain dijaga: tanpa login, pengguna dikembalikan ke halaman ini.

![Halaman login](screenshots/01-login.png)

Tombol **Lupa Password** membuka modal. Pengguna memasukkan email, lalu aplikasi memeriksa apakah email terdaftar dan menampilkan pesan hasilnya (simulasi pengiriman tautan atur ulang password).

![Modal lupa password](screenshots/02-lupa-password.png)

Tombol **Daftar** membuka modal pendaftaran berisi nama, email, password, dan konfirmasi password. Aplikasi memvalidasi panjang password, kecocokan konfirmasi, dan email yang belum dipakai.

![Modal daftar](screenshots/03-daftar.png)

### 2. Dashboard (`dashboard.html`)

Menampilkan sapaan sesuai jam lokal perangkat: pagi (04.00-10.59), siang (11.00-14.59), sore (15.00-17.59), dan malam di luar rentang itu. Terdapat ringkasan (jumlah judul buku, total stok, jumlah transaksi) dan empat menu: Informasi Stok / Katalog, Tracking Pengiriman, Laporan Pemesanan, dan History Transaksi.

![Dashboard](screenshots/04-dashboard.png)

### 3. Informasi Stok / Katalog (`stok.html`)

Tabel katalog dibuat secara dinamis dengan JavaScript dari variabel konstanta `dataKatalogBuku`, lengkap dengan cover buku, kode, nama, jenis, edisi, stok, dan harga.

![Katalog buku](screenshots/05-stok.png)

Kolom **Cari buku** menyaring baris tabel secara langsung saat pengguna mengetik.

![Pencarian buku](screenshots/06-stok-cari.png)

Form **Tambah stok baru** divalidasi sebelum diproses. Contoh di bawah menunjukkan pesan error ketika format kode barang salah.

![Validasi form stok](screenshots/07-stok-validasi.png)

Jika data benar, baris baru ditambahkan ke tabel menggunakan DOM (`createElement` dan `appendChild`). Kode barang yang sudah ada ditolak.

![Tambah stok](screenshots/08-stok-tambah.png)

### 4. Pemesanan (`checkout.html`)

Pengguna memilih buku dan jumlah, lalu menekan **Tambah ke pesanan**. Tabel pesanan dapat diubah: jumlah dapat diganti (dibatasi oleh stok) dan item dapat dihapus. Subtotal dan total pembayaran dihitung otomatis.

![Data pesanan](screenshots/09-checkout-pesanan.png)

Form data pemesan dan pembayaran divalidasi. Contoh di bawah menunjukkan pesan error ketika nomor telepon tidak sesuai format Indonesia.

![Validasi form pemesanan](screenshots/10-checkout-validasi.png)

Setelah semua data benar, pengguna memilih ekspedisi dan metode pembayaran.

![Data pemesan dan pembayaran](screenshots/11-checkout-data-pemesan.png)

Setelah tombol **Buat pesanan** ditekan, aplikasi membuat nomor Delivery Order dan menyimpan transaksi ke `localStorage`.

![Pesanan berhasil](screenshots/12-checkout-berhasil.png)

### 5. Informasi Pengiriman (`tracking.html`)

Pengguna memasukkan nomor Delivery Order lalu menekan **Cari**. Hasilnya menampilkan nama pemesan, status pengiriman (progress bar empat tahap: Diproses, Dikirim, Dalam Perjalanan, Diterima), ekspedisi, tanggal kirim, jenis paket, total pembayaran, dan riwayat perjalanan paket. Nomor contoh pada data dummy: `20230012` dan `20230013`.

![Hasil tracking](screenshots/13-tracking-hasil.png)

Pesanan yang baru dibuat di halaman pemesanan juga dapat dilacak dengan nomor DO-nya.

![Tracking pesanan baru](screenshots/14-tracking-pesanan-baru.png)

Jika nomor tidak ditemukan, muncul pesan kesalahan.

![Nomor tidak ditemukan](screenshots/15-tracking-tidak-ditemukan.png)

### 6. Laporan Pemesanan dan History Transaksi (modal pada dashboard)

**Laporan Pemesanan** menampilkan jumlah pesanan, total buku yang dipesan, total pembayaran, dan rekap jumlah per judul buku.

![Laporan pemesanan](screenshots/16-laporan-pemesanan.png)

**History Transaksi** menampilkan daftar transaksi berisi nomor DO, tanggal, pemesan, total, dan status.

![History transaksi](screenshots/17-history-transaksi.png)

## Validasi Form

Semua form memakai atribut `novalidate` dan fungsi `validasiForm()` pada `script.js`. Jika ada isian yang salah, pesan error muncul pada kotak pesan di bawah form, kolom yang salah diberi garis merah, dan kursor dipindahkan ke kolom tersebut. Aturan yang dipakai antara lain: email berformat benar, password minimal 6 karakter, nomor telepon berformat Indonesia, kode barang 3-5 huruf diikuti 3-4 angka, harga minimal Rp 1.000, dan jumlah pesanan tidak boleh melebihi stok.
