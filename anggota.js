// Halaman Anggota: kelompok & kartu anggota dari anggota.json, bisa dikelola (tambah, ubah, hapus, urutkan)
(function () {
    var $ = function (id) { return document.getElementById(id); };
    var wadah = $('grup-anggota');
    if (!wadah) return;
    var RAW = 'https://raw.githubusercontent.com/triwaluyo1140/thetrifamily/main/';
    var WARNA = ['ayah', 'ibu', 'anak1', 'anak2', 'w5', 'w6', 'w7'];
    var NAMA_WARNA = { ayah: 'Biru', ibu: 'Oranye', anak1: 'Ungu', anak2: 'Hijau', w5: 'Merah muda', w6: 'Emas', w7: 'Toska' };
    var EMOJI = { L: '👨', P: '👩' };

    function esc(s) {
        return String(s || '').replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function salin(x) { return JSON.parse(JSON.stringify(x)); }

    // ---------- Data bawaan: dibaca dari isi halaman + dua kelompok kosong ----------
    function bawaan() {
        var grup = Array.prototype.map.call(wadah.querySelectorAll('.grup'), function (g) {
            return {
                id: g.getAttribute('data-grup'),
                judul: g.querySelector('.grup-head h3').textContent.trim(),
                sub: g.getAttribute('data-sub') || '',
                anggota: Array.prototype.map.call(g.querySelectorAll('.member'), function (a) {
                    var href = a.getAttribute('href'), img = a.querySelector('img');
                    return {
                        id: href.replace('.html', ''), profil: href,
                        nama: a.querySelector('h3').textContent.trim(),
                        peran: a.querySelector('.role').textContent.trim(),
                        desk: a.querySelector('p').textContent.trim(),
                        foto: img ? img.getAttribute('src') : '',
                        warna: WARNA.filter(function (w) { return a.classList.contains(w); })[0] || 'ayah',
                        jk: /ibu|anak1/.test(href) ? 'P' : 'L'
                    };
                })
            };
        });
        grup.push({ id: 'keluarga-ayah', judul: 'Keluarga Besar Tri Waluyo', sub: 'Orang tua dan saudara kandung Tri Waluyo.', anggota: [] });
        grup.push({ id: 'keluarga-ibu', judul: 'Keluarga Besar Siti Umiyati', sub: 'Orang tua dan saudara kandung Siti Umiyati.', anggota: [] });
        return { grup: grup };
    }
    // Teks asli dibaca sebelum diterjemahkan (bila bahasa Inggris aktif)
    var BAWAAN = (function () {
        var b = bawaan();
        if (window.teksAsli) {
            Array.prototype.forEach.call(wadah.querySelectorAll('.grup'), function (g, i) {
                b.grup[i].judul = window.teksAsli(g.querySelector('.grup-head h3')).trim();
                Array.prototype.forEach.call(g.querySelectorAll('.member'), function (a, j) {
                    var m = b.grup[i].anggota[j];
                    m.nama = window.teksAsli(a.querySelector('h3')).trim();
                    m.peran = window.teksAsli(a.querySelector('.role')).trim();
                    m.desk = window.teksAsli(a.querySelector('p')).trim();
                });
            });
        }
        return b;
    })();
    var data = salin(BAWAAN);
    var lokal = {};       // foto baru: path -> dataUrl
    var kelola = false;
    var silsilah = [];    // orang di silsilah (untuk menautkan & menyamakan foto)

    // ---------- Tampilkan ----------
    window.anggotaFotoGagal = function (img) {
        var p = img.getAttribute('data-path');
        if (p && img.src.indexOf(RAW) !== 0 && !/^data:/.test(img.src)) { img.src = RAW + p; return; }
        img.replaceWith(EMOJI[img.getAttribute('data-jk')] || '👤');
    };
    // Foto anggota yang tertaut ke silsilah selalu diambil dari silsilah, agar keduanya sama
    function avatar(m) {
        var foto = window.GH.fotoAnggota(m, silsilah);
        if (!foto) return EMOJI[m.jk] || '👤';
        return '<img src="' + esc(lokal[foto] || foto) + '" alt="Foto ' + esc(m.nama) + '" data-path="' + esc(foto) +
            '" data-jk="' + esc(m.jk) + '" onerror="anggotaFotoGagal(this)">';
    }
    function kartu(m, gi, mi, n) {
        var alat = kelola ? '<div class="kartu-alat">' +
            '<button type="button" data-aksi="ubah" data-g="' + gi + '" data-m="' + mi + '" title="Ubah">✏️</button>' +
            (mi > 0 ? '<button type="button" data-aksi="kiri" data-g="' + gi + '" data-m="' + mi + '" title="Geser ke kiri">◀</button>' : '') +
            (mi < n - 1 ? '<button type="button" data-aksi="kanan" data-g="' + gi + '" data-m="' + mi + '" title="Geser ke kanan">▶</button>' : '') +
            '<button type="button" data-aksi="hapus" data-g="' + gi + '" data-m="' + mi + '" title="Hapus">🗑</button></div>' : '';
        return '<a href="' + esc(m.profil || 'profil.html?id=' + encodeURIComponent(m.id)) + '" class="member ' + esc(m.warna || 'ayah') + '">' + alat +
            '<div class="avatar">' + avatar(m) + '</div>' +
            '<div class="role">' + esc(m.peran) + '</div>' +
            '<h3>' + esc(m.nama) + '</h3>' +
            (m.desk ? '<p>' + esc(m.desk) + '</p>' : '<p></p>') +
            '<span class="more">Lihat profil →</span></a>';
    }
    function render() {
        var g = data.grup;
        wadah.innerHTML = g.map(function (grup, gi) {
            if (!grup.anggota.length && !kelola) return '';
            var alat = kelola ? '<div class="grup-alat">' +
                '<button type="button" class="btn btn-ghost" data-aksi="tambah" data-g="' + gi + '">＋ Anggota</button>' +
                '<button type="button" class="btn btn-ghost" data-aksi="ubah-grup" data-g="' + gi + '">✏️ Kelompok</button>' +
                (gi > 0 ? '<button type="button" class="btn btn-ghost" data-aksi="naik" data-g="' + gi + '" title="Naikkan">↑</button>' : '') +
                (gi < g.length - 1 ? '<button type="button" class="btn btn-ghost" data-aksi="turun" data-g="' + gi + '" title="Turunkan">↓</button>' : '') +
                '<button type="button" class="btn btn-ghost hapus" data-aksi="hapus-grup" data-g="' + gi + '">🗑</button></div>' : '';
            return '<section class="grup" data-grup="' + esc(grup.id) + '">' +
                '<div class="grup-head"><h3>' + esc(grup.judul) + '</h3>' + (grup.sub ? '<p>' + esc(grup.sub) + '</p>' : '') + alat + '</div>' +
                (grup.anggota.length
                    ? '<div class="members">' + grup.anggota.map(function (m, mi) { return kartu(m, gi, mi, grup.anggota.length); }).join('') + '</div>'
                    : '<p class="grup-kosong">Belum ada anggota di kelompok ini.</p>') +
                '</section>';
        }).join('') + (kelola ? '<div class="tree-actions"><button type="button" class="btn" data-aksi="tambah-grup">＋ Tambah Kelompok</button></div>' : '');
    }

    // ---------- Mode kelola ----------
    $('btn-kelola-anggota').addEventListener('click', function () {
        kelola = !kelola;
        this.setAttribute('aria-pressed', kelola);
        this.textContent = kelola ? '✓ Selesai Mengelola' : '✏️ Kelola Anggota';
        $('kelola-anggota-hint').hidden = !kelola;
        render();
    });

    // ---------- Simpan ----------
    var sibuk = false;
    // ubah(d) mengubah data terbaru; dipakai juga untuk tampilan langsung
    // ubahSilsilah(orang) (opsional): perubahan pada silsilah.json di commit yang sama
    function simpan(ubah, pesan, foto, hapus, ubahSilsilah) {
        if (sibuk) return Promise.reject(new Error('sibuk'));
        sibuk = true;
        var berkas = [{
            json: 'anggota.json',
            ubah: function (terbaru, semua) {
                var d = terbaru && terbaru.grup ? terbaru : salin(BAWAAN);
                ubah(d);
                // Simpan tautan ke silsilah untuk anggota yang namanya cocok
                var orang = semua[1] && semua[1].orang || silsilah;
                d.grup.forEach(function (g) {
                    g.anggota.forEach(function (m) { var t = window.GH.tautan(m, orang); if (t && !m.silsilah) m.silsilah = t.id; });
                });
                return d;
            }
        }];
        if (ubahSilsilah) berkas.push({
            json: 'silsilah.json',
            ubah: function (d) { ubahSilsilah(d.orang); return d; }
        });
        return window.GH.simpan({ berkas: berkas, foto: foto || [], hapus: hapus || [], pesan: pesan }).then(function (r) {
            sibuk = false; data = r[0];
            if (r[1]) silsilah = r[1].orang;
            render(); return r[0];
        }, function (err) { sibuk = false; throw err; });
    }
    function cariGrup(d, id) { return d.grup.filter(function (g) { return g.id === id; })[0]; }
    function cariAnggota(d, id) {
        for (var i = 0; i < d.grup.length; i++)
            for (var j = 0; j < d.grup[i].anggota.length; j++)
                if (d.grup[i].anggota[j].id === id) return { g: d.grup[i], i: j, m: d.grup[i].anggota[j] };
        return null;
    }
    function gagal(err) { if (err && err.message !== 'sibuk') alert(window.GH.alasan(err)); }

    wadah.addEventListener('click', function (e) {
        var b = e.target.closest('[data-aksi]');
        if (!b) { if (kelola && e.target.closest('.member')) e.preventDefault(); return; }
        e.preventDefault();
        var aksi = b.getAttribute('data-aksi'), gi = +b.getAttribute('data-g'), mi = +b.getAttribute('data-m');
        var grup = data.grup[gi], m = grup && grup.anggota[mi];
        if (aksi === 'tambah') bukaAnggota(grup, null);
        if (aksi === 'ubah') bukaAnggota(grup, m);
        if (aksi === 'tambah-grup') bukaGrup(null);
        if (aksi === 'ubah-grup') bukaGrup(grup);
        if (aksi === 'kiri' || aksi === 'kanan') {
            var arah = aksi === 'kiri' ? -1 : 1;
            simpan(function (d) {
                var x = cariAnggota(d, m.id); if (!x) return;
                var j = x.i + arah; if (j < 0 || j >= x.g.anggota.length) return;
                x.g.anggota.splice(j, 0, x.g.anggota.splice(x.i, 1)[0]);
            }, 'Urutkan anggota: ' + m.nama).catch(gagal);
        }
        if (aksi === 'naik' || aksi === 'turun') {
            var geser = aksi === 'naik' ? -1 : 1;
            simpan(function (d) {
                var i = d.grup.indexOf(cariGrup(d, grup.id)), j = i + geser;
                if (i < 0 || j < 0 || j >= d.grup.length) return;
                d.grup.splice(j, 0, d.grup.splice(i, 1)[0]);
            }, 'Urutkan kelompok: ' + grup.judul).catch(gagal);
        }
        if (aksi === 'hapus') {
            if (!confirm('Hapus "' + m.nama + '" dari halaman Anggota?')) return;
            var buang = m.foto && m.foto.indexOf('anggota/') === 0 ? [m.foto] : [];
            simpan(function (d) { var x = cariAnggota(d, m.id); if (x) x.g.anggota.splice(x.i, 1); }, 'Hapus anggota: ' + m.nama, [], buang).catch(gagal);
        }
        if (aksi === 'hapus-grup') {
            if (grup.anggota.length) return alert('Kelompok ini masih berisi anggota. Hapus atau pindahkan anggotanya dulu.');
            if (!confirm('Hapus kelompok "' + grup.judul + '"?')) return;
            simpan(function (d) { var x = cariGrup(d, grup.id); if (x) d.grup.splice(d.grup.indexOf(x), 1); }, 'Hapus kelompok: ' + grup.judul).catch(gagal);
        }
    });

    // ---------- Modal umum ----------
    function modal(html) {
        var el = document.createElement('div');
        el.className = 'modal'; el.hidden = true; el.innerHTML = html;
        document.body.appendChild(el);
        el.addEventListener('click', function (e) { if ((e.target === el || e.target.hasAttribute('data-tutup')) && !sibuk) tutup(el); });
        return el;
    }
    function buka(el) { el.hidden = false; document.body.style.overflow = 'hidden'; }
    function tutup(el) { el.hidden = true; document.body.style.overflow = ''; }
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape' || sibuk) return;
        Array.prototype.forEach.call(document.querySelectorAll('.modal'), function (m) { if (!m.hidden) tutup(m); });
    });
    var AKSI = '<p class="pesan" role="status"></p><div class="modal-actions"><button type="button" class="btn btn-ghost" data-tutup>Batal</button>' +
        '<button type="submit" class="btn">Simpan</button></div>';
    function info(el, t, j) { var p = el.querySelector('.pesan'); p.textContent = t; p.className = 'pesan ' + (j || ''); }

    // ---------- Formulir kelompok ----------
    var mGrup = modal('<form class="modal-card"><button type="button" class="modal-x" data-tutup aria-label="Tutup">✕</button>' +
        '<h2 class="f-judul">Kelompok</h2>' +
        '<label>Nama kelompok <input name="judul" required placeholder="contoh: Keluarga Besar Siti Umiyati"></label>' +
        '<label>Keterangan <input name="sub" placeholder="contoh: Orang tua dan saudara kandung"></label>' + AKSI + '</form>');
    var fGrup = mGrup.querySelector('form'), grupAktif = null;
    function bukaGrup(g) {
        grupAktif = g;
        mGrup.querySelector('.f-judul').textContent = g ? 'Ubah Kelompok' : 'Tambah Kelompok';
        fGrup.judul.value = g ? g.judul : ''; fGrup.sub.value = g ? g.sub : ''; info(mGrup, '');
        buka(mGrup); fGrup.judul.focus();
    }
    fGrup.addEventListener('submit', function (e) {
        e.preventDefault();
        var judul = fGrup.judul.value.trim(), sub = fGrup.sub.value.trim(), g = grupAktif;
        if (!judul) return;
        var btn = fGrup.querySelector('[type=submit]'); btn.disabled = true; info(mGrup, 'Menyimpan…');
        simpan(function (d) {
            if (g) { var x = cariGrup(d, g.id); if (x) { x.judul = judul; x.sub = sub; } }
            else d.grup.push({ id: 'g' + Date.now().toString(36), judul: judul, sub: sub, anggota: [] });
        }, (g ? 'Ubah kelompok: ' : 'Tambah kelompok: ') + judul).then(function () {
            btn.disabled = false; tutup(mGrup);
        }, function (err) { btn.disabled = false; info(mGrup, window.GH.alasan(err), 'error'); });
    });

    // ---------- Formulir anggota ----------
    var mAng = modal('<form class="modal-card"><button type="button" class="modal-x" data-tutup aria-label="Tutup">✕</button>' +
        '<h2 class="f-judul">Anggota</h2><p class="hint f-sub"></p>' +
        '<label class="f-silsilah">Tautkan ke silsilah <select name="silsilah"><option value="">— Pilih nama (opsional) —</option></select></label>' +
        '<p class="hint f-tautan" hidden>🔗 Foto anggota ini sama dengan foto di Silsilah. Mengganti foto di sini juga mengganti foto di Silsilah.</p>' +
        '<label class="pick foto-pick"><input type="file" name="foto" accept="image/*"><span class="foto-prev">📷</span><span class="foto-teks">Pilih foto (opsional)</span></label>' +
        '<div class="crop" hidden><canvas width="260" height="260"></canvas></div>' +
        '<label class="zoom" hidden>🔍 Perbesar <input type="range" name="zoom" min="1" max="3" step="0.01" value="1"></label>' +
        '<p class="hint foto-catatan" hidden>Foto anggota ini diganti lewat tombol 📷 Ganti foto di halaman profilnya.</p>' +
        '<label>Nama lengkap <input name="nama" required></label>' +
        '<div class="row2"><label>Hubungan / peran <input name="peran" placeholder="contoh: Bapak, Kakak, Adik"></label>' +
        '<label>Jenis kelamin <select name="jk"><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></label></div>' +
        '<label class="f-kelompok">Kelompok <select name="kelompok"></select></label>' +
        '<label>Deskripsi singkat <input name="desk" placeholder="contoh: Pensiunan guru yang gemar berkebun."></label>' +
        '<fieldset class="f-nikah"><legend>Warna kartu</legend><div class="swatches pilih-warna">' +
        WARNA.map(function (w) { return '<button type="button" class="sw" data-w="' + w + '" style="--w:var(--' + w + ')" aria-label="' + NAMA_WARNA[w] + '" title="' + NAMA_WARNA[w] + '"></button>'; }).join('') +
        '</div></fieldset>' + AKSI + '</form>');
    var fAng = mAng.querySelector('form'), anggotaAktif = null, grupTujuan = null, warnaPilih = 'ayah';

    // Pemotong foto (geser & perbesar), sama seperti di profil
    var potong = (function () {
        var canvas = mAng.querySelector('canvas'), VIEW = 260, img = null, zoom = 1, cx = 0, cy = 0, seret = null;
        function sisi() { return Math.min(img.naturalWidth, img.naturalHeight) / zoom; }
        function batasi() { var h = sisi() / 2; cx = Math.min(Math.max(cx, h), img.naturalWidth - h); cy = Math.min(Math.max(cy, h), img.naturalHeight - h); }
        function gambar(c, u) { var s = sisi(); c.getContext('2d').drawImage(img, cx - s / 2, cy - s / 2, s, s, 0, 0, u, u); }
        function ulang() { batasi(); canvas.getContext('2d').clearRect(0, 0, VIEW, VIEW); gambar(canvas, VIEW); }
        function tampil(ada) { mAng.querySelector('.crop').hidden = mAng.querySelector('.zoom').hidden = !ada; }
        function prev() { mAng.querySelector('.foto-prev').innerHTML = '<img src="' + canvas.toDataURL('image/jpeg', .7) + '" alt="">'; }
        fAng.zoom.addEventListener('input', function () { zoom = +fAng.zoom.value; ulang(); });
        fAng.zoom.addEventListener('change', prev);
        canvas.addEventListener('pointerdown', function (e) { seret = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); });
        canvas.addEventListener('pointermove', function (e) {
            if (!seret || !img) return; var k = sisi() / VIEW;
            cx -= (e.clientX - seret.x) * k; cy -= (e.clientY - seret.y) * k; seret = { x: e.clientX, y: e.clientY }; ulang();
        });
        canvas.addEventListener('pointerup', function () { seret = null; prev(); });
        return {
            muat: function (f) {
                return new Promise(function (ok, no) {
                    var b = new Image();
                    b.onload = function () {
                        img = b; zoom = 1; fAng.zoom.value = 1; cx = b.naturalWidth / 2;
                        cy = b.naturalHeight > b.naturalWidth ? b.naturalWidth / 2 : b.naturalHeight / 2;
                        tampil(true); ulang(); prev(); ok();
                    };
                    b.onerror = no; b.src = URL.createObjectURL(f);
                });
            },
            ada: function () { return !!img; },
            hasil: function () {
                var o = document.createElement('canvas'); o.width = o.height = Math.min(500, Math.round(sisi())); gambar(o, o.width);
                var u = o.toDataURL('image/jpeg', .88); return { dataUrl: u, base64: u.split(',')[1] };
            },
            reset: function () { img = null; tampil(false); }
        };
    })();

    function pilihWarna(w) {
        warnaPilih = w;
        Array.prototype.forEach.call(mAng.querySelectorAll('.pilih-warna .sw'), function (b) { b.classList.toggle('on', b.getAttribute('data-w') === w); });
    }
    function isiSilsilah(pilih) {
        fAng.silsilah.innerHTML = '<option value="">— Pilih nama (opsional) —</option>' + silsilah.map(function (o) {
            return '<option value="' + esc(o.id) + '">' + esc(o.nama) + (o.ket ? ' — ' + esc(o.ket) : '') + '</option>';
        }).join('');
        fAng.silsilah.value = pilih || '';
        mAng.querySelector('.f-silsilah').hidden = !silsilah.length;
        mAng.querySelector('.f-tautan').hidden = !pilih;
    }
    function orangSilsilah(id) { return silsilah.filter(function (o) { return o.id === id; })[0]; }
    fAng.silsilah.addEventListener('change', function () {
        var o = orangSilsilah(fAng.silsilah.value);
        mAng.querySelector('.f-tautan').hidden = !o;
        if (!o) return;
        if (!anggotaAktif) { fAng.nama.value = o.nama; fAng.jk.value = o.jk || 'L'; }
        if (o.foto && !potong.ada()) {
            mAng.querySelector('.foto-prev').innerHTML = '<img src="' + esc(lokal[o.foto] || o.foto) + '" alt="" onerror="this.onerror=null;this.src=\'' + RAW + esc(o.foto) + '\'">';
        }
    });
    mAng.querySelector('.pilih-warna').addEventListener('click', function (e) { var b = e.target.closest('.sw'); if (b) pilihWarna(b.getAttribute('data-w')); });
    fAng.foto.addEventListener('change', function () {
        var f = fAng.foto.files[0]; if (!f) return;
        potong.muat(f).then(function () { mAng.querySelector('.foto-teks').textContent = 'Ganti foto'; },
            function () { info(mAng, 'Format foto ini tidak bisa dibuka. Gunakan foto JPG atau PNG.', 'error'); });
    });

    function bukaAnggota(g, m) {
        grupTujuan = g; anggotaAktif = m;
        fAng.reset(); potong.reset(); info(mAng, '');
        mAng.querySelector('.f-judul').textContent = m ? 'Ubah Anggota' : 'Tambah Anggota';
        mAng.querySelector('.f-sub').textContent = g.judul;
        fAng.nama.value = m ? m.nama : ''; fAng.peran.value = m ? m.peran : '';
        fAng.desk.value = m ? m.desk || '' : ''; fAng.jk.value = m ? m.jk || 'L' : 'L';
        pilihWarna(m ? m.warna || 'ayah' : WARNA[(g.anggota.length) % WARNA.length]);
        mAng.querySelector('.foto-prev').innerHTML = m ? avatar(m) : '📷';
        mAng.querySelector('.foto-teks').textContent = m && window.GH.fotoAnggota(m, silsilah) ? 'Ganti foto' : 'Pilih foto (opsional)';
        // Anggota yang punya halaman profil sendiri (Ayah, Ibu, Sylda, Haidar) mengganti foto di halaman profilnya
        var tetap = !!(m && m.profil);
        mAng.querySelector('.foto-pick').hidden = tetap; mAng.querySelector('.foto-catatan').hidden = !tetap;
        var t = m ? window.GH.tautan(m, silsilah) : null;
        isiSilsilah(t ? t.id : '');
        mAng.querySelector('.f-silsilah').hidden = tetap || !silsilah.length;
        // Pilihan kelompok: untuk memindahkan anggota ke kelompok lain
        fAng.kelompok.innerHTML = data.grup.map(function (x) {
            return '<option value="' + esc(x.id) + '"' + (x.id === g.id ? ' selected' : '') + '>' + esc(x.judul) + '</option>';
        }).join('');
        buka(mAng); fAng.nama.focus();
    }

    fAng.addEventListener('submit', function (e) {
        e.preventDefault();
        var isi = { nama: fAng.nama.value.trim(), peran: fAng.peran.value.trim(), desk: fAng.desk.value.trim(), jk: fAng.jk.value, warna: warnaPilih };
        if (!isi.nama) return info(mAng, 'Isi namanya dulu.', 'error');
        var m = anggotaAktif, g = grupTujuan, id = m ? m.id : 'm' + Date.now().toString(36);
        var foto = [], hapus = [], baru = potong.ada() ? potong.hasil() : null, ubahSilsilah = null;
        var orang = m && m.profil ? null : orangSilsilah(fAng.silsilah.value);
        // Tidak memilih nama padahal ada nama yang cocok di silsilah = sengaja tidak ditautkan
        isi.silsilah = orang ? orang.id : (window.GH.tautan({ nama: isi.nama }, silsilah) ? '-' : '');
        if (baru && orang) {
            // Anggota tertaut: foto disimpan di Silsilah, sehingga kedua halaman memakai foto yang sama
            var path = 'silsilah/' + orang.id + '-' + Date.now().toString(36) + '.jpg';
            foto.push({ path: path, base64: baru.base64 });
            lokal[path] = baru.dataUrl;
            ubahSilsilah = function (daftar) {
                daftar.forEach(function (o) {
                    if (o.id !== orang.id) return;
                    if (o.foto && o.foto.indexOf('silsilah/') === 0) hapus.push(o.foto);
                    o.foto = path;
                });
            };
            isi.foto = '';
            if (m && m.foto && m.foto.indexOf('anggota/') === 0) hapus.push(m.foto);
        } else if (baru) {
            isi.foto = 'anggota/' + id + '-' + Date.now().toString(36) + '.jpg';
            foto.push({ path: isi.foto, base64: baru.base64 });
            lokal[isi.foto] = baru.dataUrl;
            if (m && m.foto && m.foto.indexOf('anggota/') === 0) hapus.push(m.foto);
        }
        var btn = fAng.querySelector('[type=submit]'); btn.disabled = true; info(mAng, baru ? 'Mengunggah foto…' : 'Menyimpan…');
        var tujuan = fAng.kelompok.value || g.id;
        simpan(function (d) {
            var t = cariGrup(d, tujuan) || cariGrup(d, g.id);
            if (m) {
                var x = cariAnggota(d, m.id); if (!x) return;
                Object.assign(x.m, isi);
                // Pindah kelompok: taruh di akhir kelompok tujuan
                if (t && t !== x.g) { x.g.anggota.splice(x.i, 1); t.anggota.push(x.m); }
            } else if (t) t.anggota.push(Object.assign({ id: id, foto: '' }, isi));
        }, (m ? 'Ubah anggota: ' : 'Tambah anggota: ') + isi.nama, foto, hapus, ubahSilsilah).then(function () {
            btn.disabled = false; tutup(mAng);
        }, function (err) { btn.disabled = false; info(mAng, window.GH.alasan(err), 'error'); });
    });

    // ---------- Muat ----------
    Promise.all([window.GH.bacaJson('anggota.json'), window.GH.bacaSilsilah()]).then(function (r) {
        if (r[0] && r[0].grup) data = r[0];
        silsilah = r[1];
        render();
        var ubahId = new URLSearchParams(location.search).get('ubah');
        if (ubahId && document.documentElement.classList.contains('admin')) {
            var x = cariAnggota(data, ubahId);
            if (x) { $('btn-kelola-anggota').click(); bukaAnggota(x.g, x.m); }
        }
    });
})();
