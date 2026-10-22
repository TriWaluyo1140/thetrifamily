// Ganti foto profil (ayah.jpg, ibu.jpg, anak1.jpg, anak2.jpg) langsung dari halaman profil
(function () {
    var OWNER = 'triwaluyo1140';
    var REPO = 'thetrifamily';
    var BRANCH = 'main';
    var API = 'https://api.github.com/repos/' + OWNER + '/' + REPO + '/contents/';
    var KEY = 'galeri-kunci'; // kunci yang sama dengan Galeri
    var UKURAN = 600;         // hasil foto: 600 x 600 px
    var VIEW = 260;           // ukuran lingkaran pratinjau

    var tombol = document.getElementById('ganti-foto');
    if (!tombol) return;
    var anggota = tombol.getAttribute('data-anggota');
    var file = anggota + '.jpg';

    function getKunci() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
    function setKunci(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

    // ---------- Formulir (dibuat lewat JS agar tidak perlu disalin ke 4 halaman) ----------
    var modal = document.createElement('div');
    modal.className = 'modal'; modal.hidden = true;
    modal.innerHTML =
        '<form class="modal-card">' +
        '<button type="button" class="modal-x" data-tutup aria-label="Tutup">✕</button>' +
        '<h2>Ganti Foto Profil</h2>' +
        '<label class="pick kecil"><input type="file" name="foto" accept="image/*"><span>📷 Pilih foto</span></label>' +
        '<div class="crop" hidden><canvas width="' + VIEW + '" height="' + VIEW + '"></canvas></div>' +
        '<label class="zoom" hidden>🔍 Perbesar <input type="range" name="zoom" min="1" max="3" step="0.01" value="1"></label>' +
        '<p class="hint crop-hint" hidden>Geser foto di dalam lingkaran untuk mengatur posisi wajah.</p>' +
        '<details class="kunci-box"><summary>🔑 Kunci GitHub <span class="kunci-status"></span></summary>' +
        '<p class="hint">Kunci yang sama dengan di Galeri. Disimpan di perangkat ini saja.</p>' +
        '<input name="kunci" type="password" autocomplete="off" placeholder="github_pat_..."></details>' +
        '<p class="pesan" role="status"></p>' +
        '<div class="modal-actions"><button type="button" class="btn btn-ghost" data-tutup>Batal</button>' +
        '<button type="submit" class="btn">Simpan Foto</button></div>' +
        '</form>';
    document.body.appendChild(modal);

    var form = modal.querySelector('form');
    var canvas = modal.querySelector('canvas'), ctx = canvas.getContext('2d');
    var pesan = modal.querySelector('.pesan'), btnSimpan = form.querySelector('[type=submit]');
    var img = null, zoom = 1, cx = 0, cy = 0; // cx, cy = titik tengah potongan (dalam piksel foto)

    function info(t, jenis) { pesan.textContent = t; pesan.className = 'pesan ' + (jenis || ''); }
    function tampilCrop(ada) {
        ['.crop', '.zoom', '.crop-hint'].forEach(function (s) { modal.querySelector(s).hidden = !ada; });
    }

    function buka() {
        form.reset(); img = null; tampilCrop(false); info('');
        var ada = !!getKunci();
        modal.querySelector('.kunci-status').textContent = ada ? '· tersimpan ✓' : '· wajib diisi';
        modal.querySelector('.kunci-box').open = !ada;
        modal.hidden = false; document.body.style.overflow = 'hidden';
    }
    function tutup() {
        if (btnSimpan.disabled) return;
        modal.hidden = true; document.body.style.overflow = '';
    }
    tombol.addEventListener('click', buka);
    modal.addEventListener('click', function (e) {
        if (e.target === modal || e.target.hasAttribute('data-tutup')) tutup();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) tutup(); });

    // ---------- Atur posisi & perbesar ----------
    // Sisi potongan persegi (dalam piksel foto): zoom 1 = sisi terpendek foto
    function sisi() { return Math.min(img.naturalWidth, img.naturalHeight) / zoom; }
    function batasi() {
        var h = sisi() / 2;
        cx = Math.min(Math.max(cx, h), img.naturalWidth - h);
        cy = Math.min(Math.max(cy, h), img.naturalHeight - h);
    }
    function gambar(target, ukuran) {
        var s = sisi(), c = target.getContext('2d');
        c.drawImage(img, cx - s / 2, cy - s / 2, s, s, 0, 0, ukuran, ukuran);
    }
    function ulang() { batasi(); ctx.clearRect(0, 0, VIEW, VIEW); gambar(canvas, VIEW); }

    form.foto.addEventListener('change', function () {
        var f = form.foto.files[0];
        if (!f) return;
        var baru = new Image();
        baru.onload = function () {
            img = baru; zoom = 1; form.zoom.value = 1;
            cx = img.naturalWidth / 2;
            // Foto tegak: mulai dari bagian atas (biasanya wajah ada di atas)
            cy = img.naturalHeight > img.naturalWidth ? img.naturalWidth / 2 : img.naturalHeight / 2;
            tampilCrop(true); ulang(); info('');
        };
        baru.onerror = function () { info('Format foto ini tidak bisa dibuka. Gunakan foto JPG atau PNG.', 'error'); };
        baru.src = URL.createObjectURL(f);
    });
    form.zoom.addEventListener('input', function () { zoom = +form.zoom.value; ulang(); });

    var seret = null;
    canvas.addEventListener('pointerdown', function (e) {
        seret = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', function (e) {
        if (!seret || !img) return;
        var k = sisi() / VIEW; // piksel foto per piksel layar
        cx -= (e.clientX - seret.x) * k; cy -= (e.clientY - seret.y) * k;
        seret = { x: e.clientX, y: e.clientY }; ulang();
    });
    canvas.addEventListener('pointerup', function () { seret = null; });
    canvas.addEventListener('pointercancel', function () { seret = null; });

    // ---------- Simpan ke GitHub ----------
    function gh(path, opt, kunci) {
        opt = opt || {};
        opt.headers = { 'Authorization': 'Bearer ' + kunci, 'Accept': 'application/vnd.github+json' };
        opt.cache = 'no-store';
        return fetch(API + path, opt).then(function (r) {
            if (!r.ok) { var err = new Error('github'); err.status = r.status; throw err; }
            return r.json();
        });
    }
    function alasan(err) {
        var s = err && err.status;
        if (s === 401) return 'Kunci GitHub salah atau sudah kedaluwarsa.';
        if (s === 403 || s === 404) return 'Kunci tidak punya izin menulis ke repositori ' + REPO + '.';
        if (s === 409 || s === 422) return 'Foto sedang diperbarui. Coba simpan lagi.';
        return 'Gagal menyimpan. Periksa koneksi internet lalu coba lagi.';
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var kunci = form.kunci.value.trim() || getKunci();
        if (!img) return info('Pilih fotonya dulu.', 'error');
        if (!kunci) { modal.querySelector('.kunci-box').open = true; return info('Masukkan Kunci GitHub dulu.', 'error'); }

        var out = document.createElement('canvas');
        out.width = out.height = UKURAN;
        gambar(out, UKURAN);
        var dataUrl = out.toDataURL('image/jpeg', 0.88);

        btnSimpan.disabled = true; info('Menyimpan foto…');
        // Foto lama perlu "sha"-nya untuk diganti; kalau belum ada, buat baru
        gh(file + '?ref=' + BRANCH, null, kunci).then(function (d) { return d.sha; }, function (err) {
            if (err.status === 404) return null; throw err;
        }).then(function (sha) {
            var body = { message: 'Ganti foto profil: ' + anggota, content: dataUrl.split(',')[1], branch: BRANCH };
            if (sha) body.sha = sha;
            return gh(file, { method: 'PUT', body: JSON.stringify(body) }, kunci);
        }).then(function () {
            setKunci(kunci);
            // Tampilkan foto baru di halaman ini sekarang juga
            var av = document.querySelector('.profile-side .avatar');
            av.innerHTML = '<img src="' + dataUrl + '" alt="Foto profil">';
            btnSimpan.disabled = false; tutup();
            alert('Foto profil tersimpan! 🎉\n\nDi perangkat lain, foto baru akan muncul dalam beberapa menit (paling lama sekitar 10 menit).');
        }).catch(function (err) {
            btnSimpan.disabled = false; info(alasan(err), 'error');
        });
    });
})();

// Ubah isi profil (nama, baris data, kata kunci, kutipan) — disimpan di profil.json
(function () {
    var OWNER = 'triwaluyo1140';
    var REPO = 'thetrifamily';
    var BRANCH = 'main';
    var API = 'https://api.github.com/repos/' + OWNER + '/' + REPO + '/contents/profil.json';
    var KEY = 'galeri-kunci'; // kunci yang sama dengan Galeri

    var tombol = document.getElementById('ubah-profil');
    if (!tombol) return;
    // Halaman profil umum (profil.html?id=...) menunggu isi anggota dimuat dulu
    if (document.body.hasAttribute('data-profil-umum')) {
        document.addEventListener('profil-siap', function (e) { mulai(e.detail); });
    } else {
        var foto = document.getElementById('ganti-foto');
        if (foto) mulai(foto.getAttribute('data-anggota'));
    }

    function mulai(anggota) {
        var main = document.querySelector('.profile-main');
        var judulNama = document.querySelector('.profile-side h1');

        function getKunci() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
        function setKunci(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
        function toB64(str) { return btoa(unescape(encodeURIComponent(str))); }
        function fromB64(b64) { return decodeURIComponent(escape(atob(b64.replace(/\n/g, '')))); }
        function esc(s) {
            return String(s || '').replace(/[&<>"']/g, function (c) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
            });
        }

        // Isi awal diambil dari halaman ini (dipakai selama profil.json belum ada).
        // Selalu baca teks asli berbahasa Indonesia, walau halaman sedang tampil dalam bahasa Inggris.
        function teks(el) { return el ? (window.teksAsli ? window.teksAsli(el) : el.textContent) : ''; }
        function dariHalaman() {
            var h2 = main.querySelectorAll('h2');
            return {
                nama: teks(judulNama).trim(),
                panggilan: teks(h2[0]).replace(/^Tentang\s+/, '').trim(),
                fakta: Array.prototype.map.call(main.querySelectorAll('.facts li'), function (li) {
                    var isi = li.querySelector('span');
                    return {
                        ikon: teks(li.querySelector('.fi')).trim(),
                        judul: teks(li.querySelector('strong')).trim(),
                        isi: isi && !isi.classList.contains('kosong') ? teks(isi).trim() : ''
                    };
                }),
                judulKata: h2[1] ? teks(h2[1]).trim() : 'Dikenal Sebagai',
                kata: Array.prototype.map.call(main.querySelectorAll('.chip'), function (c) { return teks(c).trim(); }),
                kutipan: teks(main.querySelector('.profile-quote')).trim().replace(/^[“"]|[”"]$/g, '')
            };
        }
        var data = dariHalaman();

        function render() {
            judulNama.textContent = data.nama;
            main.innerHTML =
                '<h2>Tentang ' + esc(data.panggilan || data.nama) + '</h2>' +
                '<ul class="facts">' + data.fakta.map(function (f) {
                    return '<li><div class="fi">' + esc(f.ikon || '•') + '</div><div><strong>' + esc(f.judul) + '</strong>' +
                        (f.isi ? '<span>' + esc(f.isi) + '</span>' : '<span class="kosong">Belum diisi</span>') + '</div></li>';
                }).join('') + '</ul>' +
                (data.kata.length ? '<h2>' + esc(data.judulKata || 'Dikenal Sebagai') + '</h2><div class="chips">' +
                    data.kata.map(function (k) { return '<span class="chip">' + esc(k) + '</span>'; }).join('') + '</div>' : '') +
                (data.kutipan ? '<p class="profile-quote">“' + esc(data.kutipan) + '”</p>' : '');
        }

        function gh(opt, kunci) {
            opt = opt || {};
            opt.headers = { 'Authorization': 'Bearer ' + kunci, 'Accept': 'application/vnd.github+json' };
            opt.cache = 'no-store';
            return fetch(API + (opt.method ? '' : '?ref=' + BRANCH), opt).then(function (r) {
                if (!r.ok) { var err = new Error('github'); err.status = r.status; throw err; }
                return r.json();
            });
        }
        // Dengan kunci: baca langsung dari GitHub (paling baru). Tanpa kunci: baca dari situs.
        var kunci0 = getKunci();
        (kunci0 ? gh(null, kunci0).then(function (d) { return JSON.parse(fromB64(d.content)); }) : Promise.reject())
            .catch(function () { return fetch('profil.json?t=' + Date.now()).then(function (r) { return r.ok ? r.json() : null; }); })
            .catch(function () { return null; })
            .then(function (semua) { if (semua && semua[anggota]) { data = semua[anggota]; render(); } });

        // ---------- Formulir ----------
        var modal = document.createElement('div');
        modal.className = 'modal'; modal.hidden = true;
        modal.innerHTML =
            '<form class="modal-card">' +
            '<button type="button" class="modal-x" data-tutup aria-label="Tutup">✕</button>' +
            '<h2>Ubah Profil</h2>' +
            '<div class="row2"><label>Nama tampilan <input name="nama" required></label>' +
            '<label>Nama panggilan <input name="panggilan" placeholder="untuk judul &quot;Tentang …&quot;"></label></div>' +
            '<fieldset class="f-fakta"><legend>Data diri</legend><div class="fakta-isi"></div>' +
            '<button type="button" class="link" data-tambah>＋ Tambah baris</button></fieldset>' +
            '<label>Judul kata kunci <input name="judulKata" placeholder="contoh: Dikenal Sebagai / Hobi &amp; Minat"></label>' +
            '<label>Kata kunci <textarea name="kata" rows="2" placeholder="Pisahkan dengan koma, contoh: Pekerja Keras, Suka Memasak"></textarea></label>' +
            '<label>Kutipan / motto <input name="kutipan"></label>' +
            '<details class="kunci-box"><summary>🔑 Kunci GitHub <span class="kunci-status"></span></summary>' +
            '<p class="hint">Kunci yang sama dengan di Galeri. Disimpan di perangkat ini saja.</p>' +
            '<input name="kunci" type="password" autocomplete="off" placeholder="github_pat_..."></details>' +
            '<p class="pesan" role="status"></p>' +
            '<div class="modal-actions"><button type="button" class="btn btn-ghost" data-tutup>Batal</button>' +
            '<button type="submit" class="btn">Simpan</button></div>' +
            '</form>';
        document.body.appendChild(modal);
        var form = modal.querySelector('form'), daftar = modal.querySelector('.fakta-isi');
        var pesan = modal.querySelector('.pesan'), btnSimpan = form.querySelector('[type=submit]');
        function info(t, jenis) { pesan.textContent = t; pesan.className = 'pesan ' + (jenis || ''); }

        function baris(f) {
            return '<div class="fakta-baris">' +
                '<input data-f="ikon" value="' + esc(f.ikon) + '" placeholder="🙂" aria-label="Ikon">' +
                '<input data-f="judul" value="' + esc(f.judul) + '" placeholder="Judul, contoh: Hobi" aria-label="Judul">' +
                '<input data-f="isi" value="' + esc(f.isi) + '" placeholder="Isi" aria-label="Isi">' +
                '<button type="button" data-hapus aria-label="Hapus baris">✕</button></div>';
        }
        function buka() {
            form.nama.value = data.nama; form.panggilan.value = data.panggilan || '';
            daftar.innerHTML = data.fakta.map(baris).join('');
            form.judulKata.value = data.judulKata || ''; form.kata.value = data.kata.join(', ');
            form.kutipan.value = data.kutipan || ''; form.kunci.value = ''; info('');
            var ada = !!getKunci();
            modal.querySelector('.kunci-status').textContent = ada ? '· tersimpan ✓' : '· wajib diisi';
            modal.querySelector('.kunci-box').open = !ada;
            modal.hidden = false; document.body.style.overflow = 'hidden';
        }
        function tutup() { if (btnSimpan.disabled) return; modal.hidden = true; document.body.style.overflow = ''; }
        tombol.addEventListener('click', buka);
        modal.addEventListener('click', function (e) {
            if (e.target === modal || e.target.hasAttribute('data-tutup')) return tutup();
            if (e.target.hasAttribute('data-hapus')) e.target.parentNode.remove();
            if (e.target.hasAttribute('data-tambah')) {
                daftar.insertAdjacentHTML('beforeend', baris({ ikon: '', judul: '', isi: '' }));
                daftar.lastChild.querySelector('[data-f=judul]').focus();
            }
        });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) tutup(); });

        function alasan(err) {
            var s = err && err.status;
            if (s === 401) return 'Kunci GitHub salah atau sudah kedaluwarsa.';
            if (s === 403 || s === 404) return 'Kunci tidak punya izin menulis ke repositori ' + REPO + '.';
            if (s === 409 || s === 422) return 'Profil sedang diperbarui. Coba simpan lagi.';
            return 'Gagal menyimpan. Periksa koneksi internet lalu coba lagi.';
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var kunci = form.kunci.value.trim() || getKunci();
            if (!kunci) { modal.querySelector('.kunci-box').open = true; return info('Masukkan Kunci GitHub dulu.', 'error'); }
            var baru = {
                nama: form.nama.value.trim(),
                panggilan: form.panggilan.value.trim(),
                fakta: Array.prototype.map.call(daftar.querySelectorAll('.fakta-baris'), function (b) {
                    return {
                        ikon: b.querySelector('[data-f=ikon]').value.trim(),
                        judul: b.querySelector('[data-f=judul]').value.trim(),
                        isi: b.querySelector('[data-f=isi]').value.trim()
                    };
                }).filter(function (f) { return f.judul || f.isi; }),
                judulKata: form.judulKata.value.trim(),
                kata: form.kata.value.split(/[,\n]/).map(function (k) { return k.trim(); }).filter(Boolean),
                kutipan: form.kutipan.value.trim().replace(/^[“"]|[”"]$/g, '')
            };
            if (!baru.nama) return info('Isi nama tampilan dulu.', 'error');

            btnSimpan.disabled = true; info('Menyimpan…');
            // Baca profil.json terbaru, ganti bagian anggota ini saja, lalu simpan
            gh(null, kunci).then(function (d) {
                return { sha: d.sha, semua: JSON.parse(fromB64(d.content)) };
            }, function (err) {
                if (err.status === 404) return { sha: null, semua: {} }; throw err;
            }).then(function (x) {
                x.semua[anggota] = baru;
                var body = { message: 'Ubah profil: ' + baru.nama, content: toB64(JSON.stringify(x.semua, null, 2) + '\n'), branch: BRANCH };
                if (x.sha) body.sha = x.sha;
                return gh({ method: 'PUT', body: JSON.stringify(body) }, kunci);
            }).then(function () {
                setKunci(kunci);
                data = baru; render();
                btnSimpan.disabled = false; tutup();
                alert('Profil tersimpan! 🎉\n\nPengunjung lain akan melihatnya dalam 1–2 menit, setelah GitHub selesai memperbarui situs.');
            }).catch(function (err) {
                btnSimpan.disabled = false; info(alasan(err), 'error');
            });
        });
    }
})();
