// Kelola isi halaman Tentang Kami (tentang.json) dan Motto (motto.json)
(function () {
    var $ = function (id) { return document.getElementById(id); };
    var nilaiEl = $('daftar-nilai'), mottoEl = $('daftar-motto');
    if (!nilaiEl && !mottoEl) return;
    var TENTANG = !!nilaiEl;
    var FILE = TENTANG ? 'tentang.json' : 'motto.json';

    function esc(s) {
        return String(s || '').replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    // Teks asli berbahasa Indonesia (walau halaman sedang tampil dalam bahasa Inggris)
    function teks(el) { return el ? (window.teksAsli ? window.teksAsli(el) : el.textContent).trim() : ''; }

    // ---------- Data bawaan: dibaca dari isi halaman ----------
    function bawaan() {
        if (TENTANG) {
            var kepala = $('kepala-halaman');
            return {
                judul: teks(kepala.querySelector('h2')),
                pengantar: teks(kepala.querySelector('p')),
                nilai: Array.prototype.map.call(nilaiEl.querySelectorAll('.value'), function (v) {
                    return { ikon: teks(v.querySelector('.ico')), judul: teks(v.querySelector('h3')), teks: teks(v.querySelector('p')) };
                })
            };
        }
        return {
            daftar: Array.prototype.map.call(mottoEl.querySelectorAll('.quote'), function (q) {
                return { teks: teks(q.querySelector('blockquote')), sumber: teks(q.querySelector('cite')) };
            })
        };
    }
    var BAWAAN = bawaan();
    var data = JSON.parse(JSON.stringify(BAWAAN));
    var kelola = false, sibuk = false;

    // ---------- Tampilkan ----------
    function alat(i, n, vertikal) {
        if (!kelola) return '';
        return '<div class="kartu-alat">' +
            '<button type="button" data-aksi="ubah" data-i="' + i + '" title="Ubah">✏️</button>' +
            (i > 0 ? '<button type="button" data-aksi="maju" data-i="' + i + '" title="' + (vertikal ? 'Naikkan' : 'Geser ke kiri') + '">' + (vertikal ? '↑' : '◀') + '</button>' : '') +
            (i < n - 1 ? '<button type="button" data-aksi="mundur" data-i="' + i + '" title="' + (vertikal ? 'Turunkan' : 'Geser ke kanan') + '">' + (vertikal ? '↓' : '▶') + '</button>' : '') +
            '<button type="button" data-aksi="hapus" data-i="' + i + '" title="Hapus">🗑</button></div>';
    }
    function tombolTambah(label) {
        return kelola ? '<div class="tree-actions halaman-tambah"><button type="button" class="btn" data-aksi="tambah">' + label + '</button></div>' : '';
    }
    function render() {
        if (TENTANG) {
            var kepala = $('kepala-halaman');
            kepala.querySelector('h2').textContent = data.judul;
            kepala.querySelector('p').textContent = data.pengantar;
            var ubahKepala = kepala.querySelector('.ubah-kepala');
            if (ubahKepala) ubahKepala.remove();
            if (kelola) kepala.insertAdjacentHTML('beforeend', '<div class="grup-alat ubah-kepala"><button type="button" class="btn btn-ghost" data-aksi="kepala">✏️ Ubah judul & pengantar</button></div>');
            nilaiEl.innerHTML = data.nilai.map(function (v, i) {
                return '<div class="value' + (kelola ? ' bisa-kelola' : '') + '">' + alat(i, data.nilai.length) +
                    '<div class="ico">' + esc(v.ikon || '⭐') + '</div><h3>' + esc(v.judul) + '</h3><p>' + esc(v.teks) + '</p></div>';
            }).join('');
            var lama = document.querySelector('.halaman-tambah'); if (lama) lama.remove();
            nilaiEl.insertAdjacentHTML('afterend', tombolTambah('＋ Tambah Nilai'));
        } else {
            mottoEl.innerHTML = data.daftar.map(function (q, i) {
                return '<div class="quote' + (i > 0 ? ' quote-kecil' : '') + (kelola ? ' bisa-kelola' : '') + '">' + alat(i, data.daftar.length, true) +
                    '<blockquote>' + esc(q.teks) + '</blockquote>' + (q.sumber ? '<cite>' + esc(q.sumber) + '</cite>' : '') + '</div>';
            }).join('') + tombolTambah('＋ Tambah Motto');
        }
    }

    // ---------- Mode kelola ----------
    $('btn-kelola-halaman').addEventListener('click', function () {
        kelola = !kelola;
        this.setAttribute('aria-pressed', kelola);
        this.textContent = kelola ? '✓ Selesai Mengelola' : '✏️ Kelola Halaman';
        $('kelola-halaman-hint').hidden = !kelola;
        render();
    });

    // ---------- Simpan ----------
    function simpan(ubah, pesan) {
        if (sibuk) return Promise.reject(new Error('sibuk'));
        sibuk = true;
        return window.GH.simpan({
            json: FILE, pesan: pesan,
            ubah: function (terbaru) {
                var d = terbaru && (TENTANG ? terbaru.nilai : terbaru.daftar) ? terbaru : JSON.parse(JSON.stringify(BAWAAN));
                ubah(d); return d;
            }
        }).then(function (d) { sibuk = false; data = d; render(); return d; },
            function (err) { sibuk = false; throw err; });
    }
    function daftar(d) { return TENTANG ? d.nilai : d.daftar; }
    function gagal(err) { if (err && err.message !== 'sibuk') alert(window.GH.alasan(err)); }

    // ---------- Formulir ----------
    var modal = document.createElement('div');
    modal.className = 'modal'; modal.hidden = true;
    modal.innerHTML = '<form class="modal-card"><button type="button" class="modal-x" data-tutup aria-label="Tutup">✕</button>' +
        '<h2 class="f-judul"></h2><div class="f-isi"></div>' +
        '<p class="pesan" role="status"></p><div class="modal-actions"><button type="button" class="btn btn-ghost" data-tutup>Batal</button>' +
        '<button type="submit" class="btn">Simpan</button></div></form>';
    document.body.appendChild(modal);
    var form = modal.querySelector('form'), pesan = modal.querySelector('.pesan'), btn = form.querySelector('[type=submit]');
    var kirim = null;
    function tutup() { if (!sibuk) { modal.hidden = true; document.body.style.overflow = ''; } }
    modal.addEventListener('click', function (e) { if (e.target === modal || e.target.hasAttribute('data-tutup')) tutup(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) tutup(); });

    // kolom: [{ nama, label, nilai, panjang, contoh }]
    function bukaForm(judul, kolom, onSimpan) {
        modal.querySelector('.f-judul').textContent = judul;
        modal.querySelector('.f-isi').innerHTML = kolom.map(function (k) {
            var isian = k.panjang
                ? '<textarea name="' + k.nama + '" rows="3" placeholder="' + esc(k.contoh || '') + '"' + (k.wajib ? ' required' : '') + '>' + esc(k.nilai) + '</textarea>'
                : '<input name="' + k.nama + '" value="' + esc(k.nilai) + '" placeholder="' + esc(k.contoh || '') + '"' + (k.wajib ? ' required' : '') + '>';
            return '<label' + (k.kecil ? ' class="kolom-ikon"' : '') + '>' + k.label + ' ' + isian + '</label>';
        }).join('');
        pesan.textContent = ''; pesan.className = 'pesan';
        kirim = function () {
            var isi = {};
            kolom.forEach(function (k) { isi[k.nama] = form.elements[k.nama].value.trim(); });
            return onSimpan(isi);
        };
        modal.hidden = false; document.body.style.overflow = 'hidden';
        var pertama = form.querySelector('input, textarea'); if (pertama) pertama.focus();
    }
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        btn.disabled = true; pesan.className = 'pesan'; pesan.textContent = 'Menyimpan…';
        kirim().then(function () { btn.disabled = false; tutup(); }, function (err) {
            btn.disabled = false; pesan.className = 'pesan error'; pesan.textContent = window.GH.alasan(err);
        });
    });

    function kolomItem(x) {
        return TENTANG ? [
            { nama: 'ikon', label: 'Ikon (emoji)', nilai: x ? x.ikon : '', contoh: '🤝', kecil: true },
            { nama: 'judul', label: 'Judul', nilai: x ? x.judul : '', contoh: 'contoh: Kebersamaan', wajib: true },
            { nama: 'teks', label: 'Penjelasan', nilai: x ? x.teks : '', panjang: true, contoh: 'Apa arti nilai ini bagi keluarga kita?' }
        ] : [
            { nama: 'teks', label: 'Motto / kutipan', nilai: x ? x.teks : '', panjang: true, wajib: true, contoh: 'contoh: Kerja keras tidak akan mengkhianati hasil.' },
            { nama: 'sumber', label: 'Sumber', nilai: x ? x.sumber : '', contoh: 'contoh: Motto Keluarga Tri Waluyo / Pesan Kakek' }
        ];
    }
    function namaItem(x) { return TENTANG ? x.judul : x.teks; }

    document.querySelector('main').addEventListener('click', function (e) {
        var b = e.target.closest('[data-aksi]');
        if (!b || b.id === 'btn-kelola-halaman') return;
        var aksi = b.getAttribute('data-aksi'), i = +b.getAttribute('data-i'), x = daftar(data)[i];
        var jenis = TENTANG ? 'Nilai' : 'Motto';
        if (aksi === 'kepala') {
            bukaForm('Ubah Judul & Pengantar', [
                { nama: 'judul', label: 'Judul', nilai: data.judul, wajib: true },
                { nama: 'pengantar', label: 'Pengantar', nilai: data.pengantar, panjang: true }
            ], function (isi) {
                return simpan(function (d) { d.judul = isi.judul; d.pengantar = isi.pengantar; }, 'Ubah halaman Tentang Kami');
            });
        }
        if (aksi === 'tambah') {
            bukaForm('Tambah ' + jenis, kolomItem(null), function (isi) {
                return simpan(function (d) { daftar(d).push(isi); }, 'Tambah ' + jenis.toLowerCase() + ': ' + namaItem(isi));
            });
        }
        if (aksi === 'ubah') {
            bukaForm('Ubah ' + jenis, kolomItem(x), function (isi) {
                var lama = namaItem(x);
                return simpan(function (d) {
                    // Cari berdasarkan isi lama (aman walau urutan berubah di perangkat lain)
                    var l = daftar(d), j = l.map(namaItem).indexOf(lama);
                    if (j < 0) j = i;
                    if (l[j]) l[j] = isi;
                }, 'Ubah ' + jenis.toLowerCase() + ': ' + namaItem(isi));
            });
        }
        if (aksi === 'maju' || aksi === 'mundur') {
            var arah = aksi === 'maju' ? -1 : 1, nama = namaItem(x);
            simpan(function (d) {
                var l = daftar(d), j = l.map(namaItem).indexOf(nama), k = j + arah;
                if (j < 0 || k < 0 || k >= l.length) return;
                l.splice(k, 0, l.splice(j, 1)[0]);
            }, 'Urutkan ' + jenis.toLowerCase() + ': ' + nama).catch(gagal);
        }
        if (aksi === 'hapus') {
            var n = namaItem(x);
            if (!confirm('Hapus "' + n + '"?')) return;
            simpan(function (d) {
                var l = daftar(d), j = l.map(namaItem).indexOf(n);
                if (j >= 0) l.splice(j, 1);
            }, 'Hapus ' + jenis.toLowerCase() + ': ' + n).catch(gagal);
        }
    });

    // ---------- Muat ----------
    window.GH.bacaJson(FILE).then(function (d) {
        if (d && (TENTANG ? d.nilai : d.daftar)) { data = d; render(); }
    });
})();
