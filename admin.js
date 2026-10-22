// Mode keluarga: tombol ubah/tambah hanya tampil di perangkat yang sudah "masuk" dengan Kunci GitHub
(function () {
    var OWNER = 'triwaluyo1140';
    var REPO = 'thetrifamily';
    var KEY = 'galeri-kunci'; // kunci yang sama dipakai Galeri, Silsilah, dan Profil

    function getKunci() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
    function setKunci(v) { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch (e) {} }

    // Tanpa kunci, semua elemen .khusus-admin disembunyikan lewat CSS
    document.documentElement.classList.toggle('admin', !!getKunci());

    function pasang() {
        var footer = document.querySelector('footer .wrap');
        if (!footer) return;
        var masuk = !!getKunci();
        footer.insertAdjacentHTML('beforeend',
            '<button type="button" class="kunci-link" id="kunci-link">' +
            (masuk ? '🔓 Keluar dari mode keluarga' : '🔑 Masuk') + '</button>');

        document.getElementById('kunci-link').addEventListener('click', function () {
            if (getKunci()) {
                if (!confirm('Keluar dari mode keluarga di perangkat ini?\n\nKunci GitHub akan dihapus dari browser ini, dan tombol ubah/tambah tidak tampil lagi.')) return;
                setKunci('');
                location.reload();
            } else {
                buka();
            }
        });

        // Formulir masuk
        var modal = document.createElement('div');
        modal.className = 'modal'; modal.hidden = true;
        modal.innerHTML =
            '<form class="modal-card">' +
            '<button type="button" class="modal-x" data-tutup aria-label="Tutup">✕</button>' +
            '<h2>Masuk Mode Keluarga</h2>' +
            '<p class="hint">Masukkan Kunci GitHub untuk menampilkan tombol tambah & ubah. ' +
            'Lakukan hanya di perangkat milik sendiri, dan pilih <strong>Keluar</strong> bila memakai perangkat orang lain.</p>' +
            '<label>Kunci GitHub <input name="kunci" type="password" autocomplete="off" placeholder="github_pat_..." required></label>' +
            '<p class="pesan" role="status"></p>' +
            '<div class="modal-actions"><button type="button" class="btn btn-ghost" data-tutup>Batal</button>' +
            '<button type="submit" class="btn">Masuk</button></div>' +
            '</form>';
        document.body.appendChild(modal);
        var form = modal.querySelector('form'), pesan = modal.querySelector('.pesan'), btn = form.querySelector('[type=submit]');

        function buka() { form.reset(); pesan.textContent = ''; modal.hidden = false; document.body.style.overflow = 'hidden'; form.kunci.focus(); }
        function tutup() { if (btn.disabled) return; modal.hidden = true; document.body.style.overflow = ''; }
        modal.addEventListener('click', function (e) { if (e.target === modal || e.target.hasAttribute('data-tutup')) tutup(); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) tutup(); });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var kunci = form.kunci.value.trim();
            btn.disabled = true; pesan.className = 'pesan'; pesan.textContent = 'Memeriksa kunci…';
            // Pastikan kunci benar & punya izin menulis ke repositori ini
            fetch('https://api.github.com/repos/' + OWNER + '/' + REPO, {
                headers: { 'Authorization': 'Bearer ' + kunci, 'Accept': 'application/vnd.github+json' }, cache: 'no-store'
            }).then(function (r) {
                if (!r.ok) throw r.status;
                return r.json();
            }).then(function (repo) {
                if (repo.permissions && !repo.permissions.push) throw 403;
                setKunci(kunci);
                location.reload();
            }).catch(function (s) {
                btn.disabled = false; pesan.className = 'pesan error';
                pesan.textContent = s === 401 ? 'Kunci salah atau sudah kedaluwarsa.'
                    : s === 403 || s === 404 ? 'Kunci ini tidak punya izin mengubah situs.'
                    : 'Gagal memeriksa kunci. Periksa koneksi internet.';
            });
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasang); else pasang();
})();
