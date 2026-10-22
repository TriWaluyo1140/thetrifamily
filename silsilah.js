// Silsilah keluarga: pohon keturunan dari silsilah.json, bisa ditambah & diubah lewat GitHub
(function () {
    var OWNER = 'triwaluyo1140';
    var REPO = 'thetrifamily';
    var BRANCH = 'main';
    var API = 'https://api.github.com/repos/' + OWNER + '/' + REPO + '/';
    var RAW = 'https://raw.githubusercontent.com/' + OWNER + '/' + REPO + '/' + BRANCH + '/';
    var KEY = 'galeri-kunci'; // kunci yang sama dengan Galeri
    var FOLDER = 'silsilah/';  // foto yang diunggah dari halaman ini

    var $ = function (id) { return document.getElementById(id); };
    var orang = [];   // [{ id, nama, jk, ket, foto, profil, ortu: [id], pasangan: [id] }]
    var byId = {};
    var lokal = {};   // foto baru: path -> dataUrl (tampil sebelum situs diperbarui)
    var kelola = false;

    function getKunci() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
    function setKunci(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
    function fromB64(b64) { return decodeURIComponent(escape(atob(b64.replace(/\n/g, '')))); }
    function esc(s) {
        return String(s || '').replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    // ---------- Data ----------
    // Format lama (4 kakek-nenek) diubah otomatis ke format baru
    function migrasi(d) {
        if (d && d.versi === 2) return d.orang;
        var g = function (a, b) { return (d && d[a] && d[a][b]) || {}; };
        var o = function (id, nama, jk, x) {
            return Object.assign({ id: id, nama: nama, jk: jk, ket: '', foto: '', ortu: [], pasangan: [] }, x || {});
        };
        return [
            o('kakek-ayah', g('ayah', 'bapak').nama || 'Kakek (dari Ayah)', 'L', { ket: g('ayah', 'bapak').ket || '', pasangan: ['nenek-ayah'] }),
            o('nenek-ayah', g('ayah', 'ibu').nama || 'Nenek (dari Ayah)', 'P', { ket: g('ayah', 'ibu').ket || '', pasangan: ['kakek-ayah'] }),
            o('ayah', 'Tri Waluyo', 'L', { foto: 'ayah.jpg', profil: 'ayah.html', ortu: ['kakek-ayah', 'nenek-ayah'], pasangan: ['ibu'] }),
            o('kakek-ibu', g('ibu', 'bapak').nama || 'Kakek (dari Ibu)', 'L', { ket: g('ibu', 'bapak').ket || '', pasangan: ['nenek-ibu'] }),
            o('nenek-ibu', g('ibu', 'ibu').nama || 'Nenek (dari Ibu)', 'P', { ket: g('ibu', 'ibu').ket || '', pasangan: ['kakek-ibu'] }),
            o('ibu', 'Siti Umiyati', 'P', { foto: 'ibu.jpg', profil: 'ibu.html', ortu: ['kakek-ibu', 'nenek-ibu'], pasangan: ['ayah'] }),
            o('sylda', 'Sylda Frizqia Qiftiyani Putri', 'P', { foto: 'anak1.jpg', profil: 'anak1.html', ortu: ['ayah', 'ibu'] }),
            o('haidar', 'Haidar Fawaz Alhuzam Putra', 'L', { foto: 'anak2.jpg', profil: 'anak2.html', ortu: ['ayah', 'ibu'] })
        ];
    }
    function pakai(list) {
        orang = list; byId = {};
        orang.forEach(function (p) { p.ortu = p.ortu || []; p.pasangan = p.pasangan || []; byId[p.id] = p; });
    }
    function nama(id) { return byId[id] ? byId[id].nama : ''; }
    function pasangan(p) { return p.pasangan.map(function (id) { return byId[id]; }).filter(Boolean); }
    // Urutan kelahiran: dari kolom "Anak ke-", atau dibaca dari keterangan ("Anak Pertama", "Anak ke-3")
    var KATA = ['pertama', 'kedua', 'ketiga', 'keempat', 'kelima', 'keenam', 'ketujuh', 'kedelapan', 'kesembilan', 'kesepuluh'];
    function urutan(p) {
        if (p.urutan) return +p.urutan;
        var t = (p.ket || '').toLowerCase();
        var m = t.match(/anak\s*(?:ke[-\s]*)?(\d+)/);
        if (m) return +m[1];
        if (/anak\s+(sulung|tertua)/.test(t)) return 1;
        for (var i = 0; i < KATA.length; i++) if (new RegExp('anak\\s+' + KATA[i] + '\\b').test(t)) return i + 1;
        return 0;
    }
    function anakDari(ids) {
        var anak = orang.filter(function (c) { return c.ortu.some(function (o) { return ids.indexOf(o) >= 0; }); });
        // Yang punya nomor urut di depan (kecil ke besar); yang belum, di belakang sesuai urutan ditambahkan
        return anak.map(function (c, i) { return { c: c, u: urutan(c) || 1000 + i }; })
            .sort(function (a, b) { return a.u - b.u; })
            .map(function (x) { return x.c; });
    }

    // Akar pohon: orang tanpa orang tua yang bukan "menantu" (pasangannya juga tanpa orang tua)
    function akar() {
        return orang.filter(function (p) {
            if (p.ortu.length) return false;
            var ps = pasangan(p);
            if (ps.some(function (s) { return s.ortu.length; })) return false;
            // Dari sepasang suami-istri, cukup satu yang jadi akar (utamakan laki-laki)
            return !ps.some(function (s) {
                if (s.jk !== p.jk) return s.jk === 'L';
                return orang.indexOf(s) < orang.indexOf(p);
            });
        });
    }

    // ---------- Gambar pohon ----------
    var EMOJI = { L: '👨', P: '👩' };
    window.silsilahFotoGagal = function (img) {
        var path = img.getAttribute('data-path');
        if (img.src.indexOf(RAW) !== 0 && path) { img.src = RAW + path; return; }
        img.replaceWith(EMOJI[img.getAttribute('data-jk')] || '👤');
    };
    function ava(p) {
        if (!p.foto) return EMOJI[p.jk] || '👤';
        return '<img src="' + esc(lokal[p.foto] || p.foto) + '" alt="" data-path="' + esc(p.foto) + '" data-jk="' + p.jk +
            '" onerror="silsilahFotoGagal(this)">';
    }
    function kartu(p) {
        return '<button type="button" class="pc ' + (p.jk === 'P' ? 'pc-p' : 'pc-l') + '" data-id="' + esc(p.id) + '">' +
            '<span class="pc-ava">' + ava(p) + '</span>' +
            '<span class="pc-nama">' + esc(p.nama) + '</span>' +
            (p.ket ? '<span class="pc-ket">' + esc(p.ket) + '</span>' : '') + '</button>';
    }
    function simpul(p, jalur) {
        if (jalur.indexOf(p.id) >= 0 || jalur.length > 12) return '';
        jalur = jalur.concat(p.id);
        var ps = pasangan(p);
        var anak = anakDari([p.id].concat(ps.map(function (s) { return s.id; })));
        return '<li><div class="fam">' + kartu(p) + ps.map(function (s) { return '<span class="fam-ring">💍</span>' + kartu(s); }).join('') + '</div>' +
            (anak.length ? '<ul>' + anak.map(function (c) { return simpul(c, jalur); }).join('') + '</ul>' : '') + '</li>';
    }
    function render() {
        var roots = akar();
        $('pohon').innerHTML = roots.length ? roots.map(function (r) {
            var ps = pasangan(r);
            var judul = 'Keluarga Besar ' + r.nama + (ps.length ? ' & ' + ps[0].nama : '');
            return '<div class="ft-blok"><h3>' + esc(judul) + '</h3><div class="ft-scroll"><ul class="ft">' + simpul(r, []) + '</ul></div></div>';
        }).join('') : '<p class="hint" style="text-align:center">Silsilah masih kosong.</p>';
        // Pohon lebar: mulai dari tengah agar akar terlihat, dan beri petunjuk untuk menggeser
        Array.prototype.forEach.call(document.querySelectorAll('.ft-scroll'), function (el) {
            el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
            if (el.scrollWidth > el.clientWidth + 4) {
                el.insertAdjacentHTML('beforebegin', '<p class="ft-geser">↔ Geser ke samping untuk melihat semua</p>');
            }
        });
    }

    // ---------- GitHub ----------
    function gh(path, opt, kunci) {
        opt = opt || {};
        opt.headers = { 'Authorization': 'Bearer ' + kunci, 'Accept': 'application/vnd.github+json' };
        opt.cache = 'no-store';
        if (opt.body && typeof opt.body !== 'string') opt.body = JSON.stringify(opt.body);
        return fetch(API + path, opt).then(function (r) {
            if (!r.ok) { var err = new Error('github'); err.status = r.status; throw err; }
            return r.json();
        });
    }
    function bacaData(kunci, ref) {
        return gh('contents/silsilah.json?ref=' + ref, null, kunci)
            .then(function (d) { return migrasi(JSON.parse(fromB64(d.content))); })
            .catch(function (err) { if (err.status === 404) return migrasi(null); throw err; });
    }
    // Simpan silsilah.json + foto baru (+ hapus foto lama) dalam SATU commit
    function simpan(kunci, file, ubah, pesanCommit, coba) {
        var head;
        return gh('git/ref/heads/' + BRANCH, null, kunci).then(function (ref) {
            head = ref.object.sha;
            return Promise.all([gh('git/commits/' + head, null, kunci), bacaData(kunci, head)]);
        }).then(function (r) {
            var list = ubah(r[1]);
            var tree = file.map(function (f) { return { path: f.path, mode: '100644', type: 'blob', sha: f.sha }; });
            tree.push({ path: 'silsilah.json', mode: '100644', type: 'blob', content: JSON.stringify({ versi: 2, orang: list }, null, 2) + '\n' });
            return gh('git/trees', { method: 'POST', body: { base_tree: r[0].tree.sha, tree: tree } }, kunci)
                .then(function (t) { return gh('git/commits', { method: 'POST', body: { message: pesanCommit, tree: t.sha, parents: [head] } }, kunci); })
                .then(function (c) { return gh('git/refs/heads/' + BRANCH, { method: 'PATCH', body: { sha: c.sha } }, kunci); })
                .then(function () { return list; });
        }).catch(function (err) {
            // Ada perubahan lain di saat yang sama: ulangi sekali dengan data terbaru
            if (err.status === 422 && !coba) return simpan(kunci, file, ubah, pesanCommit, true);
            throw err;
        });
    }
    function alasan(err) {
        var s = err && err.status;
        if (s === 401) return 'Kunci GitHub salah atau sudah kedaluwarsa.';
        if (s === 403 || s === 404) return 'Kunci tidak punya izin menulis ke repositori ' + REPO + '.';
        if (s === 409 || s === 422) return 'Silsilah sedang diperbarui. Coba simpan lagi.';
        return 'Gagal menyimpan. Periksa koneksi internet lalu coba lagi.';
    }

    function muat() {
        // Dengan kunci: baca langsung dari GitHub (paling baru). Tanpa kunci: baca dari situs.
        var kunci = getKunci();
        var req = kunci ? bacaData(kunci, BRANCH) : Promise.reject();
        req.catch(function () {
            return fetch('silsilah.json?t=' + Date.now()).then(function (r) { return r.ok ? r.json() : null; })
                .catch(function () { return null; }).then(migrasi);
        }).then(function (list) { pakai(list); render(); });
    }

    // ---------- Modal umum ----------
    function bukaModal(m) { m.hidden = false; document.body.style.overflow = 'hidden'; }
    function tutupModal(m) { m.hidden = true; if ($('modal-detail').hidden && $('modal-orang').hidden) document.body.style.overflow = ''; }
    [$('modal-detail'), $('modal-orang')].forEach(function (m) {
        m.addEventListener('click', function (e) {
            if ((e.target === m || e.target.hasAttribute('data-tutup')) && !sibuk) tutupModal(m);
        });
    });
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape' || sibuk) return;
        if (!$('modal-orang').hidden) tutupModal($('modal-orang'));
        else if (!$('modal-detail').hidden) tutupModal($('modal-detail'));
    });

    // ---------- Mode kelola ----------
    $('btn-kelola').addEventListener('click', function () {
        kelola = !kelola;
        this.setAttribute('aria-pressed', kelola);
        this.textContent = kelola ? '✓ Selesai Mengelola' : '✏️ Kelola Silsilah';
        $('kelola-hint').hidden = !kelola;
        document.body.classList.toggle('kelola', kelola);
    });

    // ---------- Detail seseorang ----------
    var aktif = null;
    function daftarNama(ids) {
        return ids.filter(function (id) { return byId[id]; }).map(function (id) {
            return '<button type="button" class="link" data-id="' + esc(id) + '">' + esc(nama(id)) + '</button>';
        }).join(', ');
    }
    function detail(id) {
        var p = byId[id]; if (!p) return;
        aktif = p;
        $('d-ava').innerHTML = ava(p);
        $('d-nama').textContent = p.nama;
        $('d-ket').textContent = p.ket || '';
        var anak = anakDari([p.id]).map(function (c) { return c.id; });
        var rel = [];
        if (p.ortu.length) rel.push(['Orang tua', daftarNama(p.ortu)]);
        if (p.pasangan.length) rel.push(['Pasangan', daftarNama(p.pasangan)]);
        if (anak.length) rel.push(['Anak', daftarNama(anak)]);
        $('d-rel').innerHTML = rel.map(function (r) { return '<li><strong>' + r[0] + '</strong> ' + r[1] + '</li>'; }).join('') +
            (p.profil ? '<li><a href="' + esc(p.profil) + '">Lihat halaman profil →</a></li>' : '');
        $('d-aksi').hidden = !kelola;
        $('d-aksi').querySelector('[data-aksi=ortu]').hidden = p.ortu.length >= 2;
        bukaModal($('modal-detail'));
    }
    $('pohon').addEventListener('click', function (e) {
        var b = e.target.closest('.pc'); if (b) detail(b.getAttribute('data-id'));
    });
    $('d-rel').addEventListener('click', function (e) {
        var b = e.target.closest('[data-id]'); if (b) detail(b.getAttribute('data-id'));
    });
    $('d-aksi').addEventListener('click', function (e) {
        var b = e.target.closest('[data-aksi]'); if (!b || !aktif) return;
        var a = b.getAttribute('data-aksi');
        if (a === 'hapus') hapus(aktif); else bukaForm(a, aktif);
    });

    // ---------- Foto: potong persegi & perkecil ----------
    function perkecil(file) {
        return new Promise(function (ok, gagal) {
            var img = new Image();
            img.onload = function () {
                var w = img.naturalWidth, h = img.naturalHeight, s = Math.min(w, h), out = 500;
                // Foto tegak: ambil bagian atas (biasanya wajah)
                var sx = (w - s) / 2, sy = h > w ? Math.min((h - s) / 2, h * 0.08) : (h - s) / 2;
                var c = document.createElement('canvas'); c.width = c.height = Math.min(out, s);
                c.getContext('2d').drawImage(img, sx, sy, s, s, 0, 0, c.width, c.height);
                URL.revokeObjectURL(img.src);
                var dataUrl = c.toDataURL('image/jpeg', 0.88);
                ok({ dataUrl: dataUrl, base64: dataUrl.split(',')[1] });
            };
            img.onerror = function () { URL.revokeObjectURL(img.src); gagal(new Error('format')); };
            img.src = URL.createObjectURL(file);
        });
    }

    // ---------- Formulir tambah / ubah ----------
    var form = $('form-orang'), pesan = form.querySelector('.pesan'), btnSimpan = form.querySelector('[type=submit]');
    var mode = null, fotoBaru = null, sibuk = false;
    function info(t, jenis) { pesan.textContent = t; pesan.className = 'pesan ' + (jenis || ''); }
    function lawan(jk) { return jk === 'L' ? 'P' : 'L'; }

    function bukaForm(tipe, p) {
        form.reset(); fotoBaru = null; info('');
        mode = { tipe: tipe, id: p.id };
        var judul = { ubah: 'Ubah Data', anak: 'Tambah Anak', pasangan: 'Tambah Pasangan', ortu: 'Tambah Orang Tua' }[tipe];
        var ps = pasangan(p);
        var sub = {
            ubah: p.nama,
            anak: 'Anak dari ' + p.nama + (ps.length ? ' & ' + ps[0].nama : ''),
            pasangan: 'Pasangan dari ' + p.nama,
            ortu: 'Ayah atau ibu dari ' + p.nama
        }[tipe];
        $('f-judul').textContent = judul; $('f-sub').textContent = sub;
        // "Anak ke-" hanya untuk orang yang punya orang tua di silsilah
        $('f-urutan').hidden = tipe === 'pasangan' || tipe === 'ortu' || (tipe === 'ubah' && !p.ortu.length);
        if (tipe === 'anak') {
            // Usulkan nomor berikutnya
            var saudara = anakDari([p.id].concat(ps.map(function (s) { return s.id; })));
            form.urutan.value = saudara.length + 1;
        }
        if (tipe === 'ubah') {
            form.nama.value = p.nama; form.jk.value = p.jk; form.ket.value = p.ket || '';
            form.urutan.value = urutan(p) || '';
            $('f-prev').innerHTML = ava(p);
            $('f-pick-text').textContent = p.foto ? 'Ganti foto' : 'Pilih foto (opsional)';
        } else {
            $('f-prev').textContent = '📷'; $('f-pick-text').textContent = 'Pilih foto (opsional)';
            if (tipe === 'pasangan') form.jk.value = lawan(p.jk);
            if (tipe === 'ortu') form.jk.value = p.ortu.length && byId[p.ortu[0]] ? lawan(byId[p.ortu[0]].jk) : 'L';
        }
        var ada = !!getKunci();
        form.querySelector('.kunci-status').textContent = ada ? '· tersimpan ✓' : '· wajib diisi';
        form.querySelector('.kunci-box').open = !ada;
        tutupModal($('modal-detail'));
        bukaModal($('modal-orang'));
        if (tipe !== 'ubah') form.nama.focus();
    }

    form.foto.addEventListener('change', function () {
        var f = form.foto.files[0]; if (!f) return;
        perkecil(f).then(function (x) {
            fotoBaru = x; $('f-prev').innerHTML = '<img src="' + x.dataUrl + '" alt="">'; $('f-pick-text').textContent = 'Ganti foto';
        }).catch(function () { info('Format foto ini tidak bisa dibuka. Gunakan foto JPG atau PNG.', 'error'); });
    });

    function mulai() { sibuk = true; btnSimpan.disabled = true; }
    function selesai() { sibuk = false; btnSimpan.disabled = false; }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var kunci = form.kunci.value.trim() || getKunci();
        if (!kunci) { form.querySelector('.kunci-box').open = true; return info('Masukkan Kunci GitHub dulu.', 'error'); }
        var isi = { nama: form.nama.value.trim(), jk: form.jk.value, ket: form.ket.value.trim() };
        if (!$('f-urutan').hidden) isi.urutan = parseInt(form.urutan.value, 10) || 0;
        if (!isi.nama) return info('Isi namanya dulu.', 'error');

        var m = mode, idBaru = 'p' + Date.now().toString(36);
        var targetId = m.tipe === 'ubah' ? m.id : idBaru;
        var fotoPath = fotoBaru ? FOLDER + targetId + '-' + Date.now().toString(36) + '.jpg' : null;
        var fotoLama = m.tipe === 'ubah' ? byId[m.id].foto : '';

        mulai(); info(fotoBaru ? 'Mengunggah foto…' : 'Menyimpan…');
        var unggah = fotoBaru
            ? gh('git/blobs', { method: 'POST', body: { content: fotoBaru.base64, encoding: 'base64' } }, kunci)
                .then(function (b) { return [{ path: fotoPath, sha: b.sha }]; })
            : Promise.resolve([]);

        unggah.then(function (file) {
            // Foto lama yang diunggah dari halaman ini ikut dihapus (foto profil seperti ayah.jpg tidak disentuh)
            if (fotoPath && fotoLama && fotoLama.indexOf(FOLDER) === 0) file.push({ path: fotoLama, sha: null });
            info('Menyimpan…');
            var judul = { ubah: 'Ubah data: ', anak: 'Tambah anak: ', pasangan: 'Tambah pasangan: ', ortu: 'Tambah orang tua: ' }[m.tipe];
            return simpan(kunci, file, function (list) {
                pakai(list);
                var t = byId[m.id];
                if (!t) { var err = new Error('hilang'); err.status = 410; throw err; }
                if (m.tipe === 'ubah') {
                    Object.assign(t, isi); if (fotoPath) t.foto = fotoPath;
                } else {
                    var p = Object.assign({ id: idBaru, foto: fotoPath || '', ortu: [], pasangan: [] }, isi);
                    if (m.tipe === 'anak') p.ortu = [t.id].concat(t.pasangan.filter(function (id) { return byId[id]; }).slice(0, 1));
                    if (m.tipe === 'pasangan') { p.pasangan = [t.id]; t.pasangan.push(p.id); }
                    if (m.tipe === 'ortu') {
                        // Orang tua kedua otomatis jadi pasangan orang tua pertama
                        var lain = byId[t.ortu[0]];
                        if (lain) { p.pasangan = [lain.id]; lain.pasangan.push(p.id); }
                        t.ortu.push(p.id);
                    }
                    // Taruh orang baru di dekat kerabatnya agar urutan rapi
                    list.splice(m.tipe === 'ortu' ? list.indexOf(t) : list.length, 0, p);
                }
                return list;
            }, judul + isi.nama);
        }).then(function (list) {
            setKunci(kunci);
            if (fotoPath) lokal[fotoPath] = fotoBaru.dataUrl;
            pakai(list); render(); selesai();
            tutupModal($('modal-orang'));
            alert('Silsilah tersimpan! 🎉\n\nPengunjung lain akan melihatnya dalam 1–2 menit, setelah GitHub selesai memperbarui situs.');
        }).catch(function (err) {
            selesai();
            info(err.status === 410 ? 'Orang ini sudah dihapus dari perangkat lain. Muat ulang halaman.' : alasan(err), 'error');
        });
    });

    // ---------- Hapus ----------
    function hapus(p) {
        var kunci = getKunci();
        if (!kunci) { alert('Simpan Kunci GitHub dulu lewat tombol ✏️ Ubah / Foto.'); return; }
        var anak = anakDari([p.id]);
        // Pasangan yang "masuk" ke keluarga ini dan tidak punya hubungan lain (orang tua, pasangan lain, anak) ikut dihapus
        var ikut = pasangan(p).filter(function (s) {
            return !s.ortu.length && s.pasangan.length === 1 && !anakDari([s.id]).length;
        });
        var buang = [p].concat(ikut);
        var tanya = 'Hapus "' + p.nama + '" dari silsilah?' +
            (ikut.length ? '\n\nPasangannya (' + ikut.map(function (s) { return s.nama; }).join(', ') + ') juga ikut dihapus.' : '') +
            (anak.length ? '\n\n' + anak.length + ' anaknya tetap ada di silsilah.' : '');
        if (!confirm(tanya)) return;
        var ids = buang.map(function (o) { return o.id; });
        var file = buang.filter(function (o) { return o.foto && o.foto.indexOf(FOLDER) === 0; })
            .map(function (o) { return { path: o.foto, sha: null }; });
        sibuk = true;
        simpan(kunci, file, function (list) {
            return list.filter(function (o) { return ids.indexOf(o.id) < 0; }).map(function (o) {
                o.ortu = (o.ortu || []).filter(function (id) { return ids.indexOf(id) < 0; });
                o.pasangan = (o.pasangan || []).filter(function (id) { return ids.indexOf(id) < 0; });
                return o;
            });
        }, 'Hapus dari silsilah: ' + p.nama).then(function (list) {
            pakai(list); render(); sibuk = false; tutupModal($('modal-detail'));
        }).catch(function (err) {
            sibuk = false; alert(alasan(err).replace('menyimpan', 'menghapus'));
        });
    }

    muat();
})();
