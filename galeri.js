// Galeri liburan: tampilkan foto dari galeri.json dan tambah foto baru lewat GitHub
(function () {
    // Repositori tempat situs ini disimpan
    var OWNER = 'triwaluyo1140';
    var REPO = 'thetrifamily';
    var BRANCH = 'main';
    var API = 'https://api.github.com/repos/' + OWNER + '/' + REPO + '/contents/';
    var RAW = 'https://raw.githubusercontent.com/' + OWNER + '/' + REPO + '/' + BRANCH + '/';
    var KEY = 'galeri-kunci';

    var grid = document.getElementById('gallery');
    var empty = document.getElementById('gallery-empty');
    var modal = document.getElementById('modal-tambah');
    var form = document.getElementById('form-tambah');
    var pesan = document.getElementById('pesan');
    var preview = document.getElementById('preview');
    var pickText = document.getElementById('pick-text');
    var btnSimpan = document.getElementById('btn-simpan');
    var fotoBaru = null; // { base64, dataUrl }

    function getKunci() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
    function setKunci(v) { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch (e) {} }

    // Teks UTF-8 <-> base64 (agar huruf dan emoji aman)
    function toB64(str) { return btoa(unescape(encodeURIComponent(str))); }
    function fromB64(b64) { return decodeURIComponent(escape(atob(b64.replace(/\n/g, '')))); }

    function esc(s) {
        return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
    }

    // ---------- Tampilkan galeri ----------
    function render(list) {
        grid.innerHTML = list.slice().reverse().map(function (f) {
            var when = [f.kota, f.waktu].filter(Boolean).join(' · ');
            return '<figure class="photo show">' +
                '<img src="' + esc(f.src || f.file) + '" alt="Liburan ke ' + esc(f.tempat) + '" loading="lazy"' +
                ' onerror="this.onerror=null;this.src=\'' + RAW + esc(f.file) + '\'">' +
                '<figcaption><strong>' + esc(f.tempat) + '</strong>' +
                '<span class="when">' + (when ? '📍 ' + esc(when) : '') + '</span>' +
                (f.cerita ? '<span class="story">' + esc(f.cerita) + '</span>' : '') +
                '</figcaption></figure>';
        }).join('');
        empty.hidden = list.length > 0;
    }

    var daftar = [];
    function muat() {
        // Dengan kunci: baca langsung dari GitHub (paling baru). Tanpa kunci: baca dari situs.
        var kunci = getKunci();
        var req = kunci
            ? fetch(API + 'galeri.json?ref=' + BRANCH, { headers: header(kunci), cache: 'no-store' })
                .then(function (r) { if (!r.ok) throw r; return r.json(); })
                .then(function (d) { return JSON.parse(fromB64(d.content)); })
            : Promise.reject();
        return req.catch(function () {
            return fetch('galeri.json?t=' + Date.now()).then(function (r) { return r.ok ? r.json() : []; });
        }).catch(function () { return []; }).then(function (list) { daftar = list; render(daftar); });
    }

    // ---------- GitHub ----------
    function header(kunci) {
        return { 'Authorization': 'Bearer ' + kunci, 'Accept': 'application/vnd.github+json' };
    }
    function ambil(path, kunci) {
        return fetch(API + path + '?ref=' + BRANCH, { headers: header(kunci), cache: 'no-store' }).then(function (r) {
            if (r.status === 404) return null;
            if (!r.ok) throw r;
            return r.json();
        });
    }
    function simpan(path, base64, message, sha, kunci) {
        var body = { message: message, content: base64, branch: BRANCH };
        if (sha) body.sha = sha;
        return fetch(API + path, { method: 'PUT', headers: header(kunci), body: JSON.stringify(body) }).then(function (r) {
            if (!r.ok) throw r;
            return r.json();
        });
    }
    function alasan(err) {
        var s = err && err.status;
        if (s === 401) return 'Kunci GitHub salah atau sudah kedaluwarsa.';
        if (s === 403 || s === 404) return 'Kunci tidak punya izin menulis ke repositori ' + REPO + '.';
        if (s === 409 || s === 422) return 'Galeri sedang diperbarui. Coba simpan lagi.';
        return 'Gagal menyimpan. Periksa koneksi internet lalu coba lagi.';
    }

    // ---------- Perkecil foto (maks 1600px, JPEG) ----------
    function perkecil(file) {
        return new Promise(function (ok, gagal) {
            var img = new Image();
            img.onload = function () {
                var max = 1600, w = img.naturalWidth, h = img.naturalHeight;
                var k = Math.min(1, max / Math.max(w, h));
                var c = document.createElement('canvas');
                c.width = Math.round(w * k); c.height = Math.round(h * k);
                c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
                URL.revokeObjectURL(img.src);
                var dataUrl = c.toDataURL('image/jpeg', 0.85);
                ok({ dataUrl: dataUrl, base64: dataUrl.split(',')[1] });
            };
            img.onerror = function () { gagal(new Error('format')); };
            img.src = URL.createObjectURL(file);
        });
    }

    // ---------- Formulir ----------
    function info(teks, jenis) { pesan.textContent = teks; pesan.className = 'pesan ' + (jenis || ''); }

    function bukaForm() {
        form.reset(); fotoBaru = null;
        preview.hidden = true; pickText.hidden = false; info('');
        var ada = !!getKunci();
        document.getElementById('kunci-status').textContent = ada ? '· tersimpan ✓' : '· wajib diisi';
        document.getElementById('kunci-box').open = !ada;
        document.getElementById('lupakan-kunci').hidden = !ada;
        modal.hidden = false; document.body.style.overflow = 'hidden';
    }
    function tutupForm() { modal.hidden = true; document.body.style.overflow = ''; }

    document.getElementById('btn-tambah').addEventListener('click', bukaForm);
    modal.addEventListener('click', function (e) {
        if (e.target === modal || e.target.hasAttribute('data-tutup')) tutupForm();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) tutupForm(); });
    document.getElementById('lupakan-kunci').addEventListener('click', function () {
        setKunci(''); bukaForm(); info('Kunci dihapus dari perangkat ini.');
    });

    form.foto.addEventListener('change', function () {
        var file = form.foto.files[0];
        if (!file) return;
        info('Menyiapkan foto…');
        perkecil(file).then(function (f) {
            fotoBaru = f; preview.src = f.dataUrl; preview.hidden = false; pickText.hidden = true; info('');
        }).catch(function () {
            fotoBaru = null; form.foto.value = '';
            info('Format foto ini tidak bisa dibuka. Gunakan foto JPG atau PNG.', 'error');
        });
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var kunci = form.kunci.value.trim() || getKunci();
        if (!fotoBaru) return info('Pilih fotonya dulu.', 'error');
        if (!kunci) { document.getElementById('kunci-box').open = true; return info('Masukkan Kunci GitHub dulu.', 'error'); }

        var item = {
            file: 'galeri/' + new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14) + '.jpg',
            tempat: form.tempat.value.trim(),
            kota: form.kota.value.trim(),
            waktu: form.waktu.value.trim(),
            cerita: form.cerita.value.trim()
        };
        btnSimpan.disabled = true;
        info('Mengunggah foto…');

        simpan(item.file, fotoBaru.base64, 'Tambah foto galeri: ' + item.tempat, null, kunci)
            .then(function () {
                info('Memperbarui daftar galeri…');
                return ambil('galeri.json', kunci);
            })
            .then(function (d) {
                var list = d ? JSON.parse(fromB64(d.content)) : [];
                list.push(item);
                return simpan('galeri.json', toB64(JSON.stringify(list, null, 2) + '\n'),
                    'Perbarui galeri: ' + item.tempat, d && d.sha, kunci).then(function () { return list; });
            })
            .then(function (list) {
                setKunci(kunci);
                // Tampilkan langsung; situs untuk pengunjung lain diperbarui GitHub dalam 1–2 menit
                var lokal = list.map(function (f) { return f.file === item.file ? Object.assign({ src: fotoBaru.dataUrl }, f) : f; });
                daftar = list; render(lokal);
                tutupForm();
                alert('Foto tersimpan! 🎉\n\nPengunjung lain akan melihatnya dalam 1–2 menit, setelah GitHub selesai memperbarui situs.');
            })
            .catch(function (err) { info(alasan(err), 'error'); })
            .then(function () { btnSimpan.disabled = false; });
    });

    muat();
})();
