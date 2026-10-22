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
