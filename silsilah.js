// Silsilah keluarga: nama kakek & nenek dari silsilah.json, bisa diubah lewat GitHub
(function () {
    var OWNER = 'triwaluyo1140';
    var REPO = 'thetrifamily';
    var BRANCH = 'main';
    var API = 'https://api.github.com/repos/' + OWNER + '/' + REPO + '/contents/silsilah.json';
    var KEY = 'galeri-kunci'; // kunci yang sama dengan Galeri

    var ORANG = [
        { key: 'ayah.bapak', label: 'Kakek (ayah dari Ayah)' },
        { key: 'ayah.ibu', label: 'Nenek (ibu dari Ayah)' },
        { key: 'ibu.bapak', label: 'Kakek (ayah dari Ibu)' },
        { key: 'ibu.ibu', label: 'Nenek (ibu dari Ibu)' }
    ];
    var data = { ayah: { bapak: {}, ibu: {} }, ibu: { bapak: {}, ibu: {} } };

    function getKunci() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
    function setKunci(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
    function toB64(str) { return btoa(unescape(encodeURIComponent(str))); }
    function fromB64(b64) { return decodeURIComponent(escape(atob(b64.replace(/\n/g, '')))); }
    function ambil(key) { var k = key.split('.'); return (data[k[0]] && data[k[0]][k[1]]) || {}; }

    // ---------- Tampilkan ----------
    function render() {
        ORANG.forEach(function (o) {
            var el = document.querySelector('.person[data-key="' + o.key + '"]');
            var p = ambil(o.key);
            el.querySelector('.p-name').textContent = p.nama || 'Belum diisi';
            el.querySelector('.p-ket').textContent = p.ket || '';
            el.classList.toggle('kosong', !p.nama);
        });
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

    function muat() {
        // Dengan kunci: baca langsung dari GitHub (paling baru). Tanpa kunci: baca dari situs.
        var kunci = getKunci();
        var req = kunci ? gh(null, kunci).then(function (d) { return JSON.parse(fromB64(d.content)); }) : Promise.reject();
        req.catch(function () {
            return fetch('silsilah.json?t=' + Date.now()).then(function (r) { return r.ok ? r.json() : null; });
        }).catch(function () { return null; }).then(function (d) { if (d) data = d; render(); });
    }

    // ---------- Formulir ubah ----------
    var modal = document.createElement('div');
    modal.className = 'modal'; modal.hidden = true;
    modal.innerHTML =
        '<form class="modal-card">' +
        '<button type="button" class="modal-x" data-tutup aria-label="Tutup">✕</button>' +
        '<h2>Ubah Silsilah</h2>' +
        ORANG.map(function (o) {
            return '<fieldset class="orang"><legend>' + o.label + '</legend>' +
                '<input name="' + o.key + '.nama" placeholder="Nama lengkap">' +
                '<input name="' + o.key + '.ket" placeholder="Keterangan (opsional), contoh: Solo · Alm.">' +
                '</fieldset>';
        }).join('') +
        '<details class="kunci-box"><summary>🔑 Kunci GitHub <span class="kunci-status"></span></summary>' +
        '<p class="hint">Kunci yang sama dengan di Galeri. Disimpan di perangkat ini saja.</p>' +
        '<input name="kunci" type="password" autocomplete="off" placeholder="github_pat_..."></details>' +
        '<p class="pesan" role="status"></p>' +
        '<div class="modal-actions"><button type="button" class="btn btn-ghost" data-tutup>Batal</button>' +
        '<button type="submit" class="btn">Simpan</button></div>' +
        '</form>';
    document.body.appendChild(modal);

    var form = modal.querySelector('form');
    var pesan = modal.querySelector('.pesan'), btnSimpan = form.querySelector('[type=submit]');
    function info(t, jenis) { pesan.textContent = t; pesan.className = 'pesan ' + (jenis || ''); }

    function buka() {
        ORANG.forEach(function (o) {
            var p = ambil(o.key);
            form.elements[o.key + '.nama'].value = p.nama || '';
            form.elements[o.key + '.ket'].value = p.ket || '';
        });
        form.kunci.value = ''; info('');
        var ada = !!getKunci();
        modal.querySelector('.kunci-status').textContent = ada ? '· tersimpan ✓' : '· wajib diisi';
        modal.querySelector('.kunci-box').open = !ada;
        modal.hidden = false; document.body.style.overflow = 'hidden';
    }
    function tutup() {
        if (btnSimpan.disabled) return;
        modal.hidden = true; document.body.style.overflow = '';
    }
    document.getElementById('btn-ubah').addEventListener('click', buka);
    modal.addEventListener('click', function (e) {
        if (e.target === modal || e.target.hasAttribute('data-tutup')) tutup();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) tutup(); });

    function alasan(err) {
        var s = err && err.status;
        if (s === 401) return 'Kunci GitHub salah atau sudah kedaluwarsa.';
        if (s === 403 || s === 404) return 'Kunci tidak punya izin menulis ke repositori ' + REPO + '.';
        if (s === 409 || s === 422) return 'Silsilah sedang diperbarui. Coba simpan lagi.';
        return 'Gagal menyimpan. Periksa koneksi internet lalu coba lagi.';
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var kunci = form.kunci.value.trim() || getKunci();
        if (!kunci) { modal.querySelector('.kunci-box').open = true; return info('Masukkan Kunci GitHub dulu.', 'error'); }

        var baru = { ayah: { bapak: {}, ibu: {} }, ibu: { bapak: {}, ibu: {} } };
        ORANG.forEach(function (o) {
            var k = o.key.split('.');
            baru[k[0]][k[1]] = {
                nama: form.elements[o.key + '.nama'].value.trim(),
                ket: form.elements[o.key + '.ket'].value.trim()
            };
        });

        btnSimpan.disabled = true; info('Menyimpan…');
        // File lama perlu "sha"-nya untuk diganti; kalau belum ada, buat baru
        gh(null, kunci).then(function (d) { return d.sha; }, function (err) {
            if (err.status === 404) return null; throw err;
        }).then(function (sha) {
            var body = { message: 'Perbarui silsilah keluarga', content: toB64(JSON.stringify(baru, null, 2) + '\n'), branch: BRANCH };
            if (sha) body.sha = sha;
            return gh({ method: 'PUT', body: JSON.stringify(body) }, kunci);
        }).then(function () {
            setKunci(kunci);
            data = baru; render();
            btnSimpan.disabled = false; tutup();
            alert('Silsilah tersimpan! 🎉\n\nPengunjung lain akan melihatnya dalam 1–2 menit, setelah GitHub selesai memperbarui situs.');
        }).catch(function (err) {
            btnSimpan.disabled = false; info(alasan(err), 'error');
        });
    });

    muat();
})();
