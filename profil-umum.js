// Halaman profil untuk anggota yang ditambahkan lewat Kelola Anggota (profil.html?id=...)
(function () {
    var RAW = 'https://raw.githubusercontent.com/triwaluyo1140/thetrifamily/main/';
    var EMOJI = { L: '👨', P: '👩' };
    var id = new URLSearchParams(location.search).get('id') || '';
    var $ = function (x) { return document.getElementById(x); };
    function esc(s) {
        return String(s || '').replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function foto(m, kecil) {
        if (!m.foto) return EMOJI[m.jk] || '👤';
        return '<img src="' + esc(m.foto) + '" alt="' + (kecil ? '' : 'Foto ' + esc(m.nama)) + '" onerror="if(this.src.indexOf(\'' + RAW + '\')){this.src=\'' + RAW + esc(m.foto) + '\'}else{this.remove()}">';
    }

    window.GH.bacaJson('anggota.json').then(function (d) {
        var grup = null, m = null;
        (d && d.grup || []).forEach(function (g) { g.anggota.forEach(function (a) { if (a.id === id) { grup = g; m = a; } }); });
        if (!m) {
            $('pu-nama').textContent = 'Anggota tidak ditemukan';
            document.querySelector('.profile-main').innerHTML = '<p class="hint">Anggota ini mungkin sudah dihapus. Kembali ke halaman Anggota.</p>';
            return;
        }
        // Anggota dengan halaman profil khusus (mis. ayah.html) diarahkan ke sana
        if (m.profil) { location.replace(m.profil); return; }

        document.title = 'Profil ' + m.nama + ' — Keluarga Tri Waluyo';
        $('profil-umum').classList.add(m.warna || 'ayah');
        $('pu-foto').innerHTML = foto(m);
        $('pu-nama').textContent = m.nama;
        $('pu-peran').textContent = m.peran || grup.judul;
        // Isi awal profil (dipakai selama belum diubah lewat ✏️ Ubah profil)
        var panggil = m.nama.split(' ')[0];
        document.querySelector('.profile-main').innerHTML =
            '<h2>Tentang ' + esc(panggil) + '</h2><ul class="facts">' +
            '<li><div class="fi">👤</div><div><strong>Nama Lengkap</strong><span>' + esc(m.nama) + '</span></div></li>' +
            '<li><div class="fi">📍</div><div><strong>Tempat / Tanggal Lahir</strong><span class="kosong">Belum diisi</span></div></li>' +
            '<li><div class="fi">👪</div><div><strong>Status</strong>' + (m.peran ? '<span>' + esc(m.peran) + '</span>' : '<span class="kosong">Belum diisi</span>') + '</div></li>' +
            '<li><div class="fi">💼</div><div><strong>Pekerjaan</strong><span class="kosong">Belum diisi</span></div></li></ul>' +
            (m.desk ? '<p class="profile-quote">“' + esc(m.desk) + '”</p>' : '');

        // Anggota lain di kelompok yang sama
        var lain = grup.anggota.filter(function (a) { return a.id !== m.id; });
        if (lain.length) {
            $('pu-saudara').hidden = false;
            $('pu-saudara').querySelector('.sib-list').innerHTML = lain.map(function (a) {
                return '<a href="' + esc(a.profil || 'profil.html?id=' + encodeURIComponent(a.id)) + '" class="sib ' + esc(a.warna || 'ayah') + '">' +
                    '<span class="mini">' + foto(a, true) + '</span>' + esc(a.nama.split(' ')[0]) + (a.peran ? ' · ' + esc(a.peran) : '') + '</a>';
            }).join('');
        }
        // Beri tahu editor profil bahwa isi halaman sudah siap
        document.dispatchEvent(new CustomEvent('profil-siap', { detail: m.id }));
    });
})();
