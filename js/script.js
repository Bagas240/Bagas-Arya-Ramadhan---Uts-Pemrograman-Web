/* ===== Fungsi umum ===== */
function ambil(kunci, bawaan) {
    try {
        var nilai = localStorage.getItem(kunci);
        return nilai ? JSON.parse(nilai) : bawaan;
    } catch (e) {
        return bawaan;
    }
}
function simpan(kunci, nilai) {
    localStorage.setItem(kunci, JSON.stringify(nilai));
}
function rupiah(n) {
    return "Rp " + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function angka(s) {
    return Number(String(s).replace(/\D/g, "")) || 0;
}
function buat(tag, teks, kelas) {
    var e = document.createElement(tag);
    if (teks !== undefined && teks !== null) e.textContent = teks;
    if (kelas) e.className = kelas;
    return e;
}
function el(id) {
    return document.getElementById(id);
}
function sesi() {
    return ambil("perpus_sesi", null);
}
function semuaPengguna() {
    return dataPengguna.concat(ambil("perpus_pengguna_baru", []));
}
function semuaKatalog() {
    return dataKatalogBuku.concat(ambil("perpus_stok_tambahan", []));
}
function semuaTransaksi() {
    return ambil("perpus_transaksi", []);
}
function bukaModal(id) {
    el(id).classList.add("tampil");
}
function tutupModal(id) {
    el(id).classList.remove("tampil");
}
function tampilPesan(id, teks, jenis) {
    var p = el(id);
    p.textContent = teks;
    p.className = "pesan tampil " + jenis;
}
function tanggalHariIni() {
    var d = new Date();
    var bln = String(d.getMonth() + 1).padStart(2, "0");
    var tgl = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + bln + "-" + tgl;
}

/* ===== Validasi form: pesan error tampil di kotak pesan dan bidang diberi tanda ===== */
function validasiForm(form, idPesan) {
    var bidang = form.querySelectorAll("input, select, textarea");
    bidang.forEach(function (f) {
        f.classList.remove("salah");
        f.removeAttribute("aria-invalid");
        f.addEventListener("input", function () {
            f.classList.remove("salah");
            f.removeAttribute("aria-invalid");
        });
    });
    for (var i = 0; i < bidang.length; i++) {
        var f = bidang[i];
        if (!f.checkValidity()) {
            var label = form.querySelector('label[for="' + f.id + '"]');
            var nama = label ? label.textContent : f.id;
            var alasan = f.validity.valueMissing ? "wajib diisi." : (f.dataset.pesan || f.validationMessage);
            f.classList.add("salah");
            f.setAttribute("aria-invalid", "true");
            tampilPesan(idPesan, nama + ": " + alasan, "gagal");
            f.focus();
            return false;
        }
    }
    el(idPesan).className = "pesan";
    return true;
}

/* ===== Navbar dan penjaga halaman ===== */
function pasangNavbar() {
    var u = sesi();
    var nama = el("namaAkun");
    if (nama && u) nama.textContent = u.nama + " (" + u.role + ")";
    var keluar = el("btnKeluar");
    if (keluar) {
        keluar.onclick = function () {
            localStorage.removeItem("perpus_sesi");
            location.href = "index.html";
        };
    }
}

/* ===== Halaman login ===== */
function initLogin() {
    if (sesi()) {
        location.href = "dashboard.html";
        return;
    }
    el("formLogin").addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validasiForm(el("formLogin"), "pesanLogin")) return;
        var email = el("email").value.trim().toLowerCase();
        var password = el("password").value;
        var cocok = semuaPengguna().find(function (p) {
            return p.email.toLowerCase() === email && p.password === password;
        });
        if (!cocok) {
            alert("Email/password yang anda masukkan salah");
            return;
        }
        simpan("perpus_sesi", { id: cocok.id, nama: cocok.nama, email: cocok.email, role: cocok.role });
        location.href = "dashboard.html";
    });

    el("btnLupa").onclick = function () {
        el("pesanLupa").className = "pesan";
        el("emailLupa").value = "";
        bukaModal("modalLupa");
    };
    el("btnDaftar").onclick = function () {
        el("pesanDaftar").className = "pesan";
        el("formDaftar").reset();
        bukaModal("modalDaftar");
    };

    el("formLupa").addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validasiForm(el("formLupa"), "pesanLupa")) return;
        var email = el("emailLupa").value.trim().toLowerCase();
        var ada = semuaPengguna().some(function (p) { return p.email.toLowerCase() === email; });
        if (ada) {
            tampilPesan("pesanLupa", "Tautan untuk mengatur ulang password telah dikirim ke " + email + ".", "sukses");
        } else {
            tampilPesan("pesanLupa", "Email tidak terdaftar.", "gagal");
        }
    });

    el("formDaftar").addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validasiForm(el("formDaftar"), "pesanDaftar")) return;
        var nama = el("namaDaftar").value.trim();
        var email = el("emailDaftar").value.trim().toLowerCase();
        var pass = el("passDaftar").value;
        var ulang = el("passUlang").value;
        if (pass.length < 6) {
            tampilPesan("pesanDaftar", "Password minimal 6 karakter.", "gagal");
            return;
        }
        if (pass !== ulang) {
            tampilPesan("pesanDaftar", "Konfirmasi password tidak sama.", "gagal");
            return;
        }
        if (semuaPengguna().some(function (p) { return p.email.toLowerCase() === email; })) {
            tampilPesan("pesanDaftar", "Email sudah terdaftar.", "gagal");
            return;
        }
        var baru = ambil("perpus_pengguna_baru", []);
        baru.push({ id: semuaPengguna().length + 1, nama: nama, email: email, password: pass, role: "User" });
        simpan("perpus_pengguna_baru", baru);
        tampilPesan("pesanDaftar", "Pendaftaran berhasil. Silakan login.", "sukses");
        el("email").value = email;
    });

    document.querySelectorAll(".modal").forEach(function (m) {
        m.addEventListener("click", function (e) {
            if (e.target === m) tutupModal(m.id);
        });
    });
}

/* ===== Dashboard ===== */
function sapaanWaktu() {
    var jam = new Date().getHours();
    if (jam >= 4 && jam < 11) return "Selamat pagi";
    if (jam >= 11 && jam < 15) return "Selamat siang";
    if (jam >= 15 && jam < 18) return "Selamat sore";
    return "Selamat malam";
}
function transaksiMilikSaya() {
    var u = sesi();
    var semua = semuaTransaksi();
    if (u.role === "Admin") return semua;
    return semua.filter(function (t) { return t.email === u.email; });
}
function initDashboard() {
    var u = sesi();
    el("sapaan").textContent = sapaanWaktu() + ", " + u.nama;
    el("tanggal").textContent = new Date().toLocaleDateString("id-ID", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    }) + " - " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    var katalog = semuaKatalog();
    var totalStok = 0;
    katalog.forEach(function (b) { totalStok += b.stok; });
    el("ringJudul").textContent = katalog.length;
    el("ringStok").textContent = totalStok;
    el("ringTransaksi").textContent = transaksiMilikSaya().length;

    el("btnLaporan").onclick = function () {
        var t = transaksiMilikSaya();
        var pendapatan = 0, buku = 0;
        t.forEach(function (x) {
            pendapatan += x.total;
            x.item.forEach(function (i) { buku += i.qty; });
        });
        el("lapJumlah").textContent = t.length;
        el("lapBuku").textContent = buku;
        el("lapTotal").textContent = rupiah(pendapatan);
        var tbody = el("lapIsi");
        tbody.innerHTML = "";
        var rekap = {};
        t.forEach(function (x) {
            x.item.forEach(function (i) {
                rekap[i.nama] = (rekap[i.nama] || 0) + i.qty;
            });
        });
        var nama = Object.keys(rekap);
        if (nama.length === 0) {
            var tr = buat("tr");
            var td = buat("td", "Belum ada pesanan.", "kosong");
            td.colSpan = 2;
            tr.appendChild(td);
            tbody.appendChild(tr);
        }
        nama.forEach(function (n) {
            var tr = buat("tr");
            tr.appendChild(buat("td", n));
            tr.appendChild(buat("td", rekap[n], "angka"));
            tbody.appendChild(tr);
        });
        bukaModal("modalLaporan");
    };

    el("btnHistory").onclick = function () {
        var t = transaksiMilikSaya().slice().reverse();
        var tbody = el("histIsi");
        tbody.innerHTML = "";
        if (t.length === 0) {
            var tr = buat("tr");
            var td = buat("td", "Belum ada transaksi.", "kosong");
            td.colSpan = 5;
            tr.appendChild(td);
            tbody.appendChild(tr);
        }
        t.forEach(function (x) {
            var tr = buat("tr");
            tr.appendChild(buat("td", x.nomorDO));
            tr.appendChild(buat("td", x.tanggal));
            tr.appendChild(buat("td", x.nama));
            tr.appendChild(buat("td", rupiah(x.total), "angka"));
            tr.appendChild(buat("td", x.status));
            tbody.appendChild(tr);
        });
        bukaModal("modalHistory");
    };

    document.querySelectorAll(".modal").forEach(function (m) {
        m.addEventListener("click", function (e) {
            if (e.target === m) tutupModal(m.id);
        });
    });
}

/* ===== Stok / katalog ===== */
function barisBuku(b, no) {
    var tr = buat("tr");
    tr.appendChild(buat("td", no));
    var tdCover = buat("td");
    if (b.cover) {
        var img = buat("img", null, "cover-kecil");
        img.src = b.cover;
        img.alt = "Cover " + b.namaBarang;
        tdCover.appendChild(img);
    } else {
        tdCover.textContent = "-";
    }
    tr.appendChild(tdCover);
    tr.appendChild(buat("td", b.kodeBarang));
    tr.appendChild(buat("td", b.namaBarang));
    tr.appendChild(buat("td", b.jenisBarang));
    tr.appendChild(buat("td", b.edisi));
    tr.appendChild(buat("td", b.stok, "angka"));
    tr.appendChild(buat("td", b.harga, "angka"));
    return tr;
}
function tampilKatalog() {
    var tbody = el("isiKatalog");
    tbody.innerHTML = "";
    semuaKatalog().forEach(function (b, i) {
        tbody.appendChild(barisBuku(b, i + 1));
    });
}
function saringKatalog() {
    var kata = el("cariBuku").value.trim().toLowerCase();
    var baris = el("isiKatalog").rows;
    var tampil = 0;
    for (var i = 0; i < baris.length; i++) {
        var cocok = baris[i].textContent.toLowerCase().indexOf(kata) !== -1;
        baris[i].hidden = !cocok;
        if (cocok) tampil++;
    }
    el("infoKatalog").textContent = "Menampilkan " + tampil + " dari " + baris.length + " buku";
}
function initStok() {
    tampilKatalog();
    el("cariBuku").addEventListener("input", saringKatalog);
    saringKatalog();
    el("formTambah").addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validasiForm(el("formTambah"), "pesanTambah")) return;
        var kode = el("kode").value.trim().toUpperCase();
        var nama = el("nama").value.trim();
        if (semuaKatalog().some(function (b) { return b.kodeBarang === kode; })) {
            tampilPesan("pesanTambah", "Kode barang " + kode + " sudah ada.", "gagal");
            return;
        }
        var baru = {
            kodeBarang: kode,
            namaBarang: nama,
            jenisBarang: el("jenis").value,
            edisi: el("edisi").value.trim(),
            stok: Number(el("stokBaru").value),
            harga: rupiah(Number(el("harga").value)),
            cover: ""
        };
        var tambahan = ambil("perpus_stok_tambahan", []);
        tambahan.push(baru);
        simpan("perpus_stok_tambahan", tambahan);
        /* tambah baris langsung ke tabel lewat DOM */
        el("isiKatalog").appendChild(barisBuku(baru, el("isiKatalog").rows.length + 1));
        saringKatalog();
        tampilPesan("pesanTambah", "Stok baru berhasil ditambahkan.", "sukses");
        el("formTambah").reset();
    });
}

/* ===== Pemesanan / checkout ===== */
function ambilKeranjang() {
    return ambil("perpus_keranjang", []);
}
function cariBuku(kode) {
    return semuaKatalog().find(function (b) { return b.kodeBarang === kode; });
}
function tampilKeranjang() {
    var tbody = el("isiKeranjang");
    tbody.innerHTML = "";
    var k = ambilKeranjang();
    var total = 0;
    if (k.length === 0) {
        var tr = buat("tr");
        var td = buat("td", "Belum ada buku dalam pesanan.", "kosong");
        td.colSpan = 5;
        tr.appendChild(td);
        tbody.appendChild(tr);
    }
    k.forEach(function (item, idx) {
        var b = cariBuku(item.kode);
        if (!b) return;
        var harga = angka(b.harga);
        var sub = harga * item.qty;
        total += sub;
        var tr = buat("tr");
        tr.appendChild(buat("td", b.namaBarang));
        tr.appendChild(buat("td", b.harga, "angka"));
        var tdQty = buat("td");
        var inp = buat("input");
        inp.type = "number";
        inp.min = "1";
        inp.max = String(b.stok);
        inp.value = item.qty;
        inp.setAttribute("aria-label", "Jumlah " + b.namaBarang);
        inp.onchange = function () {
            var q = Math.floor(Number(inp.value));
            if (!q || q < 1) q = 1;
            if (q > b.stok) {
                alert("Jumlah melebihi stok tersedia (" + b.stok + ").");
                q = b.stok;
            }
            var data = ambilKeranjang();
            data[idx].qty = q;
            simpan("perpus_keranjang", data);
            tampilKeranjang();
        };
        tdQty.appendChild(inp);
        tr.appendChild(tdQty);
        tr.appendChild(buat("td", rupiah(sub), "angka"));
        var tdAksi = buat("td");
        var hapus = buat("button", "Hapus", "tombol bahaya kecil");
        hapus.type = "button";
        hapus.onclick = function () {
            var data = ambilKeranjang();
            data.splice(idx, 1);
            simpan("perpus_keranjang", data);
            tampilKeranjang();
        };
        tdAksi.appendChild(hapus);
        tr.appendChild(tdAksi);
        tbody.appendChild(tr);
    });
    el("totalBayar").textContent = rupiah(total);
}
function buatNomorDO() {
    var ada = semuaTransaksi().map(function (t) { return t.nomorDO; });
    var no;
    do {
        no = String(new Date().getFullYear()) + String(Math.floor(1000 + Math.random() * 9000));
    } while (ada.indexOf(no) !== -1 || dataTracking[no]);
    return no;
}
function initCheckout() {
    var u = sesi();
    var pilih = el("pilihBuku");
    semuaKatalog().forEach(function (b) {
        var o = buat("option", b.namaBarang + " - " + b.harga + " (stok " + b.stok + ")");
        o.value = b.kodeBarang;
        pilih.appendChild(o);
    });
    el("namaPemesan").value = u.nama;
    el("emailPemesan").value = u.email;
    tampilKeranjang();

    el("btnTambahBuku").onclick = function () {
        var kode = pilih.value;
        var qty = Math.floor(Number(el("jumlahBuku").value));
        var b = cariBuku(kode);
        if (!b || !qty || qty < 1) {
            tampilPesan("pesanKeranjang", "Pilih buku dan isi jumlah minimal 1.", "gagal");
            return;
        }
        var k = ambilKeranjang();
        var ada = k.find(function (i) { return i.kode === kode; });
        var jumlahBaru = (ada ? ada.qty : 0) + qty;
        if (jumlahBaru > b.stok) {
            tampilPesan("pesanKeranjang", "Jumlah melebihi stok tersedia (" + b.stok + ").", "gagal");
            return;
        }
        if (ada) ada.qty = jumlahBaru; else k.push({ kode: kode, qty: qty });
        simpan("perpus_keranjang", k);
        el("pesanKeranjang").className = "pesan";
        tampilKeranjang();
    };

    el("formPesan").addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validasiForm(el("formPesan"), "pesanPesan")) return;
        var k = ambilKeranjang();
        if (k.length === 0) {
            tampilPesan("pesanKeranjang", "Tambahkan minimal satu buku ke pesanan.", "gagal");
            return;
        }
        var item = [], total = 0;
        k.forEach(function (i) {
            var b = cariBuku(i.kode);
            var sub = angka(b.harga) * i.qty;
            total += sub;
            item.push({ kode: b.kodeBarang, nama: b.namaBarang, qty: i.qty, subtotal: sub });
        });
        var trx = {
            nomorDO: buatNomorDO(),
            tanggal: tanggalHariIni(),
            nama: el("namaPemesan").value.trim(),
            email: el("emailPemesan").value.trim().toLowerCase(),
            telepon: el("teleponPemesan").value.trim(),
            alamat: el("alamatPemesan").value.trim(),
            ekspedisi: el("ekspedisi").value,
            pembayaran: el("pembayaran").value,
            item: item,
            total: total,
            status: "Diproses"
        };
        var semua = semuaTransaksi();
        semua.push(trx);
        simpan("perpus_transaksi", semua);
        simpan("perpus_keranjang", []);
        el("noDO").textContent = trx.nomorDO;
        el("totalDO").textContent = rupiah(total);
        bukaModal("modalSukses");
        tampilKeranjang();
        el("formPesan").reset();
        el("namaPemesan").value = u.nama;
        el("emailPemesan").value = u.email;
    });
}

/* ===== Tracking ===== */
var TAHAP = ["Diproses", "Dikirim", "Dalam Perjalanan", "Diterima"];
function cariPengiriman(no) {
    if (dataTracking[no]) return dataTracking[no];
    var t = semuaTransaksi().find(function (x) { return x.nomorDO === no; });
    if (!t) return null;
    return {
        nomorDO: t.nomorDO,
        nama: t.nama,
        status: t.status,
        ekspedisi: t.ekspedisi,
        tanggalKirim: t.tanggal,
        paket: "REG-" + t.nomorDO.slice(-4),
        total: rupiah(t.total),
        perjalanan: [{ waktu: t.tanggal, keterangan: "Pesanan diterima dan sedang diproses" }]
    };
}
function tampilHasil(d) {
    el("hNama").textContent = d.nama;
    el("hEkspedisi").textContent = d.ekspedisi;
    el("hTanggal").textContent = d.tanggalKirim;
    el("hPaket").textContent = d.paket;
    el("hTotal").textContent = d.total;
    el("hStatus").textContent = d.status;
    var posisi = TAHAP.indexOf(d.status);
    var bar = el("langkah");
    bar.innerHTML = "";
    TAHAP.forEach(function (t, i) {
        bar.appendChild(buat("div", t, i <= posisi ? "aktif" : ""));
    });
    var daftar = el("riwayat");
    daftar.innerHTML = "";
    d.perjalanan.slice().reverse().forEach(function (p) {
        var li = buat("li");
        li.appendChild(buat("time", p.waktu));
        li.appendChild(buat("span", p.keterangan));
        daftar.appendChild(li);
    });
    el("hasil").style.display = "block";
}
function initTracking() {
    el("formCari").addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validasiForm(el("formCari"), "pesanCari")) return;
        var no = el("nomorDO").value.trim();
        var d = cariPengiriman(no);
        if (!d) {
            el("hasil").style.display = "none";
            tampilPesan("pesanCari", "Nomor Delivery Order " + no + " tidak ditemukan.", "gagal");
            return;
        }
        el("pesanCari").className = "pesan";
        tampilHasil(d);
    });
    var param = new URLSearchParams(location.search).get("do");
    if (param) {
        el("nomorDO").value = param;
        el("formCari").dispatchEvent(new Event("submit", { cancelable: true }));
    }
}

/* ===== Mulai ===== */
document.addEventListener("DOMContentLoaded", function () {
    var halaman = document.body.dataset.halaman;
    if (halaman === "login") {
        initLogin();
        return;
    }
    if (!sesi()) {
        location.replace("index.html");
        return;
    }
    pasangNavbar();
    if (halaman === "dashboard") initDashboard();
    if (halaman === "stok") initStok();
    if (halaman === "checkout") initCheckout();
    if (halaman === "tracking") initTracking();
});
