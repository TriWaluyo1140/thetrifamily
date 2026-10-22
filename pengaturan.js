// Pengaturan tampilan seluruh situs (tema, warna utama, latar belakang) — disimpan di pengaturan.json
(function () {
    var CACHE = 'pengaturan';
    var PALET = {
        terang: { bg: '#fbf7f1', 'bg-alt': '#f3ece1', card: '#ffffff', ink: '#2b2420', 'ink-soft': '#5f554d', muted: '#8a7f75',
            line: '#e8dfd2', brand: '#c2603d', 'brand-dark': '#9e4a2c', ayah: '#2f6f8f', ibu: '#c2603d', anak1: '#7a5bb5', anak2: '#3d8b5f', w5: '#b83d6e', w6: '#a07818', w7: '#1f7a74',
            'on-brand': '#fff', shadow: '0 1px 2px rgba(60,40,20,.05), 0 8px 24px rgba(60,40,20,.07)',
            'shadow-lg': '0 2px 4px rgba(60,40,20,.06), 0 20px 40px rgba(60,40,20,.12)' },
        gelap: { bg: '#1a1613', 'bg-alt': '#221d19', card: '#2a2420', ink: '#f3ece4', 'ink-soft': '#cfc4b8', muted: '#a0958a',
            line: '#3a322c', brand: '#e0825e', 'brand-dark': '#f09a78', ayah: '#6fb3d4', ibu: '#e0825e', anak1: '#b39ae6', anak2: '#74c497', w5: '#ec8fb4', w6: '#e3bd5c', w7: '#6cc9c0',
            'on-brand': '#1a1613', shadow: '0 1px 2px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.25)',
            'shadow-lg': '0 2px 4px rgba(0,0,0,.3), 0 20px 40px rgba(0,0,0,.35)' }
    };
    var BAWAAN = { tema: 'auto', warna: '', latar: { jenis: 'bawaan', warna: '', gambar: '' } };

    // ---------- Warna ----------
    function rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); var n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
    function hex(c) { return '#' + c.map(function (x) { return ('0' + Math.round(x).toString(16)).slice(-2); }).join(''); }
    function campur(a, b, t) { var x = rgb(a), y = rgb(b); return hex(x.map(function (v, i) { return v + (y[i] - v) * t; })); }
    function terang(h) { var c = rgb(h).map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }

    // ---------- Terapkan ----------
    var lokalGambar = null; // gambar latar yang baru dipilih (sebelum situs diperbarui)
    function terapkan(cfg) {
        cfg = cfg || BAWAAN;
        var latar = cfg.latar || {}, v = {};
        var mode = cfg.tema === 'terang' || cfg.tema === 'gelap' ? cfg.tema : 'auto';
        // Latar warna menentukan tema: latar terang = teks gelap, latar gelap = teks terang
        if (latar.jenis === 'warna' && latar.warna) mode = terang(latar.warna) > .4 ? 'terang' : 'gelap';
        if (mode !== 'auto') { var p = PALET[mode]; for (var k in p) v[k] = p[k]; }
        if (latar.jenis === 'warna' && latar.warna) {
            var gelap = mode === 'gelap';
            v.bg = latar.warna;
            v['bg-alt'] = campur(latar.warna, gelap ? '#ffffff' : '#000000', .04);
            v.card = campur(latar.warna, '#ffffff', gelap ? .07 : .75);
            v.line = campur(latar.warna, gelap ? '#ffffff' : '#000000', gelap ? .14 : .09);
        }
        if (cfg.warna) {
            v.brand = cfg.warna;
            v['brand-dark'] = campur(cfg.warna, mode === 'gelap' ? '#ffffff' : '#000000', .18);
            v['on-brand'] = terang(cfg.warna) > .45 ? '#1a1613' : '#ffffff';
        }
        var css = ':root{' + Object.keys(v).map(function (k) { return '--' + k + ':' + v[k]; }).join(';') +
            (mode !== 'auto' ? ';color-scheme:' + (mode === 'gelap' ? 'dark' : 'light') : '') + '}';
        var gambar = latar.jenis === 'gambar' && (lokalGambar || latar.gambar);
        if (gambar) {
            css += 'body{background:linear-gradient(color-mix(in srgb,var(--bg) 84%,transparent),color-mix(in srgb,var(--bg) 92%,transparent)),' +
                'url("' + String(gambar).replace(/"/g, '') + '") center/cover fixed;}' +
                '.about{background:color-mix(in srgb,var(--bg-alt) 80%,transparent);}';
        }
        var el = document.getElementById('gaya-pengaturan');
        if (!el) { el = document.createElement('style'); el.id = 'gaya-pengaturan'; (document.head || document.documentElement).appendChild(el); }
        el.textContent = css;
    }

    // Terapkan segera dari salinan terakhir (tanpa kedip), lalu perbarui dari pengaturan.json
    var aktif = BAWAAN;
    try { var c = JSON.parse(localStorage.getItem(CACHE) || 'null'); if (c) aktif = c; } catch (e) {}
    terapkan(aktif);
    function simpanCache(cfg) { try { localStorage.setItem(CACHE, JSON.stringify(cfg)); } catch (e) {} }

    function muat() {
        var baca = window.GH ? window.GH.bacaJson('pengaturan.json')
            : fetch('pengaturan.json?t=' + Date.now()).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
        baca.then(function (cfg) {
            cfg = cfg || BAWAAN;
            if (JSON.stringify(cfg) !== JSON.stringify(aktif)) { aktif = cfg; terapkan(aktif); }
            simpanCache(cfg);
        });
    }

    // ---------- Panel pengaturan (hanya mode keluarga) ----------
    var WARNA = ['#c2603d', '#2f6f8f', '#3d8b5f', '#7a5bb5', '#b8860b', '#c0396b', '#0f766e', '#2b2420'];
    var LATAR = ['#fbf7f1', '#ffffff', '#eef6f0', '#eef4fa', '#fbeff1', '#f4f1fa', '#1a1613', '#141b2d', '#12201a'];
    function swatch(nama, daftar, label) {
        return '<div class="swatches" data-nama="' + nama + '">' + daftar.map(function (w) {
            return '<button type="button" class="sw" data-warna="' + w + '" style="--w:' + w + '" aria-label="' + label + ' ' + w + '"></button>';
        }).join('') + '<label class="sw-lain" title="Warna lain"><input type="color" data-warna-lain="' + nama + '"><span>＋</span></label></div>';
    }

    function pasangPanel() {
        if (!document.documentElement.classList.contains('admin') || !window.GH) return;
        var footer = document.querySelector('footer .wrap');
        if (!footer) return;
        footer.insertAdjacentHTML('beforeend', '<button type="button" class="kunci-link" id="buka-pengaturan">⚙️ Pengaturan Situs</button>');

        var modal = document.createElement('div');
        modal.className = 'modal'; modal.hidden = true;
        modal.innerHTML =
            '<form class="modal-card">' +
            '<button type="button" class="modal-x" data-tutup aria-label="Tutup">✕</button>' +
            '<h2>Pengaturan Situs</h2>' +
            '<p class="hint">Berlaku untuk semua halaman. Perubahan langsung terlihat sebagai pratinjau; klik Simpan untuk menerapkannya bagi semua pengunjung.</p>' +
            '<label>Tema <select name="tema"><option value="auto">Otomatis (mengikuti perangkat)</option>' +
            '<option value="terang">Terang</option><option value="gelap">Gelap</option></select></label>' +
            '<fieldset class="f-nikah"><legend>Warna utama</legend>' + swatch('warna', WARNA, 'Warna utama') +
            '<button type="button" class="link" data-bawaan="warna">Pakai warna bawaan</button></fieldset>' +
            '<fieldset class="f-nikah"><legend>Latar belakang</legend>' +
            '<div class="pilih-latar">' +
            '<label><input type="radio" name="latar" value="bawaan"> Bawaan</label>' +
            '<label><input type="radio" name="latar" value="warna"> Warna</label>' +
            '<label><input type="radio" name="latar" value="gambar"> Gambar</label></div>' +
            '<div data-latar="warna">' + swatch('latar', LATAR, 'Warna latar') + '</div>' +
            '<div data-latar="gambar"><label class="pick kecil"><input type="file" name="gambar" accept="image/*"><span class="gambar-teks">🖼 Pilih gambar latar</span></label>' +
            '<p class="hint">Gambar dibuat samar agar tulisan tetap mudah dibaca.</p></div>' +
            '</fieldset>' +
            '<p class="pesan" role="status"></p>' +
            '<div class="modal-actions"><button type="button" class="btn btn-ghost" data-reset>Kembalikan ke bawaan</button>' +
            '<button type="button" class="btn btn-ghost" data-tutup>Batal</button>' +
            '<button type="submit" class="btn">Simpan</button></div>' +
            '</form>';
        document.body.appendChild(modal);
        var form = modal.querySelector('form'), pesan = modal.querySelector('.pesan'), btn = form.querySelector('[type=submit]');
        var draf = null, gambarBaru = null;
        function info(t, j) { pesan.textContent = t; pesan.className = 'pesan ' + (j || ''); }

        function isiForm() {
            form.tema.value = draf.tema || 'auto';
            Array.prototype.forEach.call(form.latar, function (r) { r.checked = r.value === (draf.latar.jenis || 'bawaan'); });
            Array.prototype.forEach.call(modal.querySelectorAll('.swatches'), function (s) {
                var nilai = s.getAttribute('data-nama') === 'warna' ? draf.warna : draf.latar.warna;
                Array.prototype.forEach.call(s.querySelectorAll('.sw'), function (b) { b.classList.toggle('on', b.getAttribute('data-warna') === nilai); });
            });
            Array.prototype.forEach.call(modal.querySelectorAll('[data-latar]'), function (d) { d.hidden = d.getAttribute('data-latar') !== draf.latar.jenis; });
            modal.querySelector('.gambar-teks').textContent = gambarBaru || draf.latar.gambar ? '🖼 Ganti gambar latar' : '🖼 Pilih gambar latar';
            form.tema.disabled = draf.latar.jenis === 'warna';
        }
        function pratinjau() { lokalGambar = gambarBaru ? gambarBaru.dataUrl : null; terapkan(draf); isiForm(); }

        function buka() {
            draf = JSON.parse(JSON.stringify(aktif)); draf.latar = draf.latar || { jenis: 'bawaan' };
            gambarBaru = null; info(''); isiForm();
            modal.hidden = false; document.body.style.overflow = 'hidden';
        }
        function tutup(batal) {
            if (btn.disabled) return;
            if (batal) { lokalGambar = null; terapkan(aktif); }
            modal.hidden = true; document.body.style.overflow = '';
        }
        document.getElementById('buka-pengaturan').addEventListener('click', buka);
        modal.addEventListener('click', function (e) {
            var t = e.target;
            if (t === modal || t.hasAttribute('data-tutup')) return tutup(true);
            var sw = t.closest('.sw');
            if (sw) {
                var nama = sw.parentNode.getAttribute('data-nama');
                if (nama === 'warna') draf.warna = sw.getAttribute('data-warna');
                else { draf.latar.jenis = 'warna'; draf.latar.warna = sw.getAttribute('data-warna'); }
                pratinjau();
            }
            if (t.hasAttribute('data-bawaan')) { draf.warna = ''; pratinjau(); }
            if (t.hasAttribute('data-reset')) { draf = JSON.parse(JSON.stringify(BAWAAN)); gambarBaru = null; pratinjau(); }
        });
        modal.addEventListener('input', function (e) {
            var t = e.target, nama = t.getAttribute('data-warna-lain');
            if (nama === 'warna') draf.warna = t.value;
            else if (nama === 'latar') { draf.latar.jenis = 'warna'; draf.latar.warna = t.value; }
            else if (t.name === 'tema') draf.tema = t.value;
            else if (t.name === 'latar') draf.latar.jenis = t.value;
            else return;
            pratinjau();
        });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) tutup(true); });

        // Gambar latar: perkecil (maks 1920 px) agar situs tetap cepat
        form.gambar.addEventListener('change', function () {
            var f = form.gambar.files[0]; if (!f) return;
            var img = new Image();
            img.onload = function () {
                var k = Math.min(1, 1920 / Math.max(img.naturalWidth, img.naturalHeight));
                var c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
                c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
                var dataUrl = c.toDataURL('image/jpeg', .82);
                gambarBaru = { dataUrl: dataUrl, base64: dataUrl.split(',')[1] };
                draf.latar.jenis = 'gambar'; pratinjau();
            };
            img.onerror = function () { info('Format foto ini tidak bisa dibuka. Gunakan foto JPG atau PNG.', 'error'); };
            img.src = URL.createObjectURL(f);
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (draf.latar.jenis === 'gambar' && !gambarBaru && !draf.latar.gambar) return info('Pilih gambar latarnya dulu.', 'error');
            if (draf.latar.jenis === 'warna' && !draf.latar.warna) return info('Pilih warna latarnya dulu.', 'error');
            var lama = aktif.latar && aktif.latar.gambar;
            var foto = [], hapus = [];
            if (gambarBaru) {
                draf.latar.gambar = 'pengaturan/latar-' + Date.now().toString(36) + '.jpg';
                foto.push({ path: draf.latar.gambar, base64: gambarBaru.base64 });
            }
            if (draf.latar.jenis !== 'gambar') draf.latar.gambar = '';
            // Gambar latar lama yang tidak dipakai lagi ikut dihapus
            if (lama && lama !== draf.latar.gambar && lama.indexOf('pengaturan/') === 0) hapus.push(lama);
            btn.disabled = true; info('Menyimpan…');
            var simpanDraf = JSON.parse(JSON.stringify(draf));
            window.GH.simpan({ json: 'pengaturan.json', foto: foto, hapus: hapus, pesan: 'Ubah pengaturan situs', ubah: function () { return simpanDraf; } })
                .then(function (cfg) {
                    aktif = cfg; simpanCache(cfg); btn.disabled = false; tutup(false);
                    alert('Pengaturan tersimpan! 🎉\n\nPengunjung lain akan melihatnya dalam 1–2 menit, setelah GitHub selesai memperbarui situs.');
                }).catch(function (err) { btn.disabled = false; info(window.GH.alasan(err), 'error'); });
        });
    }

    function siap() { muat(); pasangPanel(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', siap); else siap();
})();
