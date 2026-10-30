// Galeri liburan: album foto & video dari galeri.json, tambah banyak sekaligus lewat GitHub
(function () {
    // Repositori tempat situs ini disimpan
    var OWNER = 'triwaluyo1140';
    var REPO = 'thetrifamily';
    var BRANCH = 'main';
    var API = 'https://api.github.com/repos/' + OWNER + '/' + REPO + '/';
    var RAW = 'https://raw.githubusercontent.com/' + OWNER + '/' + REPO + '/' + BRANCH + '/';
    var KEY = 'galeri-kunci';
    var MAKS_FOTO = 50;
    // Batas video: GitHub menolak file di atas 100 MB (dan unggahan base64 jadi ±1/3 lebih besar)
    var MAKS_VIDEO_MB = 90, SARAN_VIDEO_MB = 50;
    var POSTER_KOSONG = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="#2b2420"/></svg>');

    var $ = function (id) { return document.getElementById(id); };
    var grid = $('gallery'), empty = $('gallery-empty');
    var modal = $('modal-tambah'), form = $('form-tambah'), pesan = $('pesan');
    var thumbs = $('thumbs'), pickText = $('pick-text'), progres = $('progres');
    var pilihAlbum = $('pilih-album'), infoBaru = $('info-baru'), btnSimpan = $('btn-simpan');

    var daftar = [];   // isi galeri.json
    var lokal = {};    // foto yang baru diunggah: path -> dataUrl (tampil sebelum situs diperbarui)
    var antre = [];    // foto yang dipilih di formulir: { base64, dataUrl }

    function getKunci() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
    function setKunci(v) { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch (e) {} }

    // Teks UTF-8 <-> base64 (agar huruf dan emoji aman)
    function toB64(str) { return btoa(unescape(encodeURIComponent(str))); }
    function fromB64(b64) { return decodeURIComponent(escape(atob(b64.replace(/\n/g, '')))); }

    function esc(s) {
        return String(s || '').replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    // Album lama hanya punya "file"; album baru punya "files"
    function fotoAlbum(a) { return a.files || (a.file ? [a.file] : []); }
    function src(path) { return lokal[path] || path; }
    // Cadangan dari GitHub hanya untuk file di repositori (bukan link YouTube / gambar kosong)
    function raw(path) { return /^(https?|data):/.test(path) ? path : RAW + path; }
    function imgTag(path, alt, extra) {
        return '<img src="' + esc(src(path)) + '" alt="' + esc(alt) + '"' + (extra || '') +
            ' onerror="this.onerror=null;this.src=\'' + esc(raw(path)) + '\'">';
    }

    // ---------- Video ----------
    // Isi album: foto (galeri/x.jpg), video (galeri/x.mp4), atau link YouTube (https://youtu.be/ID)
    function ytId(s) {
        var m = String(s || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/);
        return m ? m[1] : '';
    }
    function jenis(path) {
        if (ytId(path)) return 'yt';
        return /\.(mp4|webm|mov|m4v)$/i.test(path) ? 'video' : 'foto';
    }
    // Gambar yang mewakili isi album: foto itu sendiri, atau sampul video
    function gambar(a, path) {
        if (jenis(path) === 'yt') return 'https://i.ytimg.com/vi/' + ytId(path) + '/hqdefault.jpg';
        if (jenis(path) === 'video') return (a.poster && a.poster[path]) || POSTER_KOSONG;
        return path;
    }
    function hitung(foto) {
        var v = foto.filter(function (p) { return jenis(p) !== 'foto'; }).length, f = foto.length - v;
        return [f ? '📷 ' + f + ' foto' : '', v ? '🎬 ' + v + ' video' : ''].filter(Boolean).join(' · ');
    }
    function keterangan(a) { return [a.kota, a.waktu].filter(Boolean).join(' · '); }

    // ---------- Tampilkan galeri ----------
    function render() {
        grid.innerHTML = daftar.map(function (a, i) {
            var foto = fotoAlbum(a), when = keterangan(a);
            if (!foto.length) return '';
            // Album berisi banyak foto: semua foto ditumpuk, lalu berganti otomatis (foto berjalan)
            var slides = foto.map(function (f, n) {
                var g = gambar(a, f), vid = jenis(f) !== 'foto' ? ' data-video' : '';
                return n === 0
                    ? imgTag(g, 'Liburan ke ' + a.tempat, ' class="slide on" loading="lazy"' + vid)
                    : '<img class="slide" alt="" data-src="' + esc(src(g)) + '" data-raw="' + esc(raw(g)) + '"' + vid + '>';
            }).join('');
            var titik = foto.length > 1 && foto.length <= 12
                ? '<span class="dots">' + foto.map(function (f, n) { return '<i' + (n === 0 ? ' class="on"' : '') + '></i>'; }).join('') + '</span>'
                : '';
            var ikon = foto.some(function (f) { return jenis(f) !== 'foto'; }) ? '<span class="play" aria-hidden="true">▶</span>' : '';
            return '<figure class="photo" data-i="' + i + '">' +
                '<div class="cover' + (foto.length > 1 ? ' berjalan' : '') + (jenis(foto[0]) !== 'foto' ? ' main-video' : '') + '">' + slides + ikon + titik +
                (foto.length > 1 || jenis(foto[0]) !== 'foto' ? '<span class="count">' + hitung(foto) + '</span>' : '') + '</div>' +
                '<figcaption><strong>' + esc(a.tempat) + '</strong>' +
                '<span class="when">' + (when ? '📍 ' + esc(when) : '') + '</span>' +
                (a.cerita ? '<span class="story">' + esc(a.cerita) + '</span>' : '') +
                '</figcaption></figure>';
        }).reverse().join('');
        empty.hidden = daftar.length > 0;
    }

    function muat() {
        // Dengan kunci: baca langsung dari GitHub (paling baru). Tanpa kunci: baca dari situs.
        var kunci = getKunci();
        var req = kunci ? bacaJson(kunci, BRANCH) : Promise.reject();
        return req.catch(function () {
            return fetch('galeri.json?t=' + Date.now()).then(function (r) { return r.ok ? r.json() : []; });
        }).catch(function () { return []; }).then(function (list) { daftar = list; render(); });
    }

    // ---------- Lihat album (lightbox) ----------
    var box = $('lightbox'), lbImg = box.querySelector('img'), lbCap = box.querySelector('figcaption');
    var lbVid = box.querySelector('video'), lbYt = box.querySelector('.lb-yt');
    var album = null, pos = 0;
    // Hentikan video yang sedang diputar (saat pindah atau menutup album)
    function hentikan() {
        lbVid.pause(); lbVid.removeAttribute('src'); lbVid.removeAttribute('poster'); lbVid.load();
        lbYt.innerHTML = '';
    }
    function tampil(n) {
        var foto = fotoAlbum(album);
        pos = (n + foto.length) % foto.length;
        var path = foto[pos], j = jenis(path);
        hentikan();
        lbImg.hidden = j !== 'foto'; lbVid.hidden = j !== 'video'; lbYt.hidden = j !== 'yt';
        if (j === 'video') {
            var p = gambar(album, path);
            if (p !== POSTER_KOSONG) lbVid.poster = src(p);
            lbVid.onerror = function () { lbVid.onerror = null; if (!lokal[path]) { lbVid.src = RAW + path; } };
            lbVid.src = src(path);
        } else if (j === 'yt') {
            lbYt.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + ytId(path) + '?rel=0" title="' + esc(album.tempat) +
                '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
        } else {
            lbImg.onerror = function () { lbImg.onerror = null; lbImg.src = RAW + path; };
            lbImg.src = src(path);
        }
        lbImg.alt = album.tempat;
        $('hapus-foto').textContent = j === 'foto' ? '🗑 Hapus foto ini' : '🗑 Hapus video ini';
        var when = keterangan(album);
        lbCap.innerHTML = '<strong>' + esc(album.tempat) + '</strong>' + (when ? '📍 ' + esc(when) : '') +
            (foto.length > 1 ? ' <span class="lb-num">' + (pos + 1) + ' / ' + foto.length + '</span>' : '');
        box.classList.toggle('single', foto.length < 2);
        $('lb-tools').hidden = !getKunci();
        $('hapus-album').hidden = foto.length < 2;
        $('jadi-sampul').hidden = $('geser-kiri').hidden = pos === 0;
        $('geser-kanan').hidden = pos === foto.length - 1;
    }
    function bukaAlbum(i, mulai) { album = daftar[i]; tampil(mulai || 0); box.hidden = false; document.body.style.overflow = 'hidden'; }
    function tutupAlbum() { hentikan(); box.hidden = true; document.body.style.overflow = ''; }

    grid.addEventListener('click', function (e) {
        var p = e.target.closest('.photo');
        // Buka album tepat di foto yang sedang tampil di sampul
        if (p) bukaAlbum(+p.getAttribute('data-i'), +(p.querySelector('.cover').getAttribute('data-pos') || 0));
    });

    // ---------- Foto berjalan di sampul album ----------
    var JEDA = 3500;
    var gerakDikurangi = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function geser(cover) {
        var slides = cover.querySelectorAll('.slide');
        var pos = +(cover.getAttribute('data-pos') || 0), next = (pos + 1) % slides.length;
        // Lewati foto yang gagal dimuat
        for (var k = 0; k < slides.length && slides[next].classList.contains('rusak'); k++) next = (next + 1) % slides.length;
        if (next === pos) return;
        var img = slides[next];
        // Foto dimuat saat akan tampil (hemat kuota), lalu foto setelahnya disiapkan
        function siapkan(el) {
            if (el && el.getAttribute('data-src')) {
                el.onerror = function () { el.onerror = null; el.src = el.getAttribute('data-raw'); };
                el.src = el.getAttribute('data-src'); el.removeAttribute('data-src');
            }
        }
        siapkan(img); siapkan(slides[(next + 1) % slides.length]);
        function tukar() {
            slides[pos].classList.remove('on'); img.classList.add('on');
            cover.setAttribute('data-pos', next);
            cover.classList.toggle('main-video', img.hasAttribute('data-video'));
            var dots = cover.querySelectorAll('.dots i');
            if (dots.length) { dots[pos].classList.remove('on'); dots[next].classList.add('on'); }
        }
        tukar();
    }
    // Foto yang tetap gagal (juga dari cadangan GitHub) ditandai agar dilewati
    grid.addEventListener('error', function (e) {
        var el = e.target;
        if (el.classList && el.classList.contains('slide') && el.src.indexOf(RAW) === 0) el.classList.add('rusak');
    }, true);
    setInterval(function () {
        if (document.hidden || !box.hidden || !modal.hidden || gerakDikurangi) return;
        Array.prototype.forEach.call(grid.querySelectorAll('.cover.berjalan'), function (cover, n) {
            var r = cover.getBoundingClientRect();
            if (r.bottom < 0 || r.top > innerHeight) return;            // tidak terlihat di layar
            if (cover.matches(':hover')) return;                        // berhenti saat disorot mouse
            // Beri jeda berbeda tiap album agar tidak berganti bersamaan
            setTimeout(function () { geser(cover); }, (n % 4) * 400);
        });
    }, JEDA);
    box.querySelector('.lb-close').onclick = tutupAlbum;
    box.querySelector('.lb-prev').onclick = function () { tampil(pos - 1); };
    box.querySelector('.lb-next').onclick = function () { tampil(pos + 1); };
    box.addEventListener('click', function (e) { if (e.target === box) tutupAlbum(); });
    // Geser (swipe) di HP
    var x0 = null;
    box.addEventListener('touchstart', function (e) {
        // Menggeser tombol putar video tidak dihitung sebagai pindah foto
        x0 = e.target.closest('video') ? null : e.touches[0].clientX;
    }, { passive: true });
    box.addEventListener('touchend', function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0; x0 = null;
        if (Math.abs(dx) > 50) tampil(pos + (dx < 0 ? 1 : -1));
    });

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
    function bacaJson(kunci, ref) {
        return gh('contents/galeri.json?ref=' + ref, null, kunci)
            .then(function (d) { return JSON.parse(fromB64(d.content)); })
            .catch(function (err) { if (err.status === 404) return []; throw err; });
    }
    // Semua foto + galeri.json disimpan dalam SATU commit, jadi situs hanya diperbarui sekali
    function simpanSemua(kunci, blobs, ubahDaftar, pesanCommit, coba) {
        var head;
        return gh('git/ref/heads/' + BRANCH, null, kunci).then(function (ref) {
            head = ref.object.sha;
            return Promise.all([gh('git/commits/' + head, null, kunci), bacaJson(kunci, head)]);
        }).then(function (r) {
            var list = ubahDaftar(r[1]);
            // sha null = file dihapus dari repositori
            var tree = blobs.map(function (b) { return { path: b.path, mode: '100644', type: 'blob', sha: b.sha }; });
            tree.push({ path: 'galeri.json', mode: '100644', type: 'blob', content: JSON.stringify(list, null, 2) + '\n' });
            return gh('git/trees', { method: 'POST', body: { base_tree: r[0].tree.sha, tree: tree } }, kunci)
                .then(function (t) { return gh('git/commits', { method: 'POST', body: { message: pesanCommit, tree: t.sha, parents: [head] } }, kunci); })
                .then(function (c) { return gh('git/refs/heads/' + BRANCH, { method: 'PATCH', body: { sha: c.sha } }, kunci); })
                .then(function () { return list; });
        }).catch(function (err) {
            // Ada perubahan lain di saat yang sama: ulangi sekali dengan data terbaru
            if (err.status === 422 && !coba) return simpanSemua(kunci, blobs, ubahDaftar, pesanCommit, true);
            throw err;
        });
    }
    function alasan(err) {
        var s = err && err.status;
        if (s === 401) return 'Kunci GitHub salah atau sudah kedaluwarsa.';
        if (s === 403 || s === 404) return 'Kunci tidak punya izin menulis ke repositori ' + REPO + '.';
        if (s === 409 || s === 422) return 'Galeri sedang diperbarui. Coba simpan lagi.';
        return 'Gagal menyimpan. Periksa koneksi internet lalu coba lagi.';
    }

    // ---------- Hapus foto / album ----------
    function hapus(semua) {
        var kunci = getKunci();
        var foto = fotoAlbum(album), path = foto[pos];
        var tanya = semua
            ? 'Hapus album "' + album.tempat + '" beserta ' + foto.length + ' fotonya?'
            : (jenis(path) === 'foto' ? 'Hapus foto ini dari album "' : 'Hapus video ini dari album "') + album.tempat + '"?' +
              (foto.length === 1 ? '\nIni foto terakhir, jadi albumnya ikut terhapus.' : '');
        if (!confirm(tanya + '\n\nFoto yang dihapus tidak bisa dikembalikan dari halaman ini.')) return;

        var tombol = $('lb-tools').querySelectorAll('button');
        Array.prototype.forEach.call(tombol, function (b) { b.disabled = true; });
        var dibuang = semua ? foto.slice() : [path];
        var pesanCommit = (semua ? 'Hapus album: ' : 'Hapus foto dari ') + album.tempat;
        // File yang ikut dihapus dari repositori: foto/video beserta sampul videonya (link YouTube tidak punya file)
        var poster = album.poster || {};
        var berkas = dibuang.filter(function (p) { return jenis(p) !== 'yt'; })
            .concat(dibuang.map(function (p) { return poster[p]; }).filter(Boolean));

        simpanSemua(kunci, berkas.map(function (p) { return { path: p, sha: null }; }), function (list) {
            // Cari album berdasarkan foto yang dimilikinya (aman walau urutan berubah)
            return list.map(function (a) {
                var sisa = fotoAlbum(a).filter(function (p) { return dibuang.indexOf(p) < 0; });
                if (sisa.length === fotoAlbum(a).length) return a;
                if (!sisa.length) return null;
                var baru = Object.assign({}, a, { files: sisa }); delete baru.file;
                if (baru.poster) {
                    baru.poster = Object.assign({}, baru.poster);
                    dibuang.forEach(function (p) { delete baru.poster[p]; });
                    if (!Object.keys(baru.poster).length) delete baru.poster;
                }
                return baru;
            }).filter(Boolean);
        }, pesanCommit).then(function (list) {
            daftar = list; render();
            var sisa = foto.filter(function (p) { return dibuang.indexOf(p) < 0; });
            var masih = sisa.length && daftar.filter(function (a) { return fotoAlbum(a).indexOf(sisa[0]) >= 0; })[0];
            if (masih) { album = masih; tampil(Math.min(pos, fotoAlbum(masih).length - 1)); }
            else tutupAlbum();
        }).catch(function (err) {
            // Foto sudah tidak ada di GitHub (mis. dihapus dari perangkat lain)
            alert(err.status === 422 ? 'Foto ini sudah terhapus sebelumnya. Muat ulang halaman.' : alasan(err).replace('menyimpan', 'menghapus'));
        }).then(function () {
            Array.prototype.forEach.call(tombol, function (b) { b.disabled = false; });
        });
    }
    $('hapus-foto').addEventListener('click', function () { hapus(false); });
    $('hapus-album').addEventListener('click', function () { hapus(true); });

    // ---------- Ubah album: keterangan, sampul, urutan foto ----------
    // ubah(a) mengubah album di data terbaru; posisiBaru(a) = foto yang ditampilkan sesudahnya
    function ubahAlbum(ubah, pesanCommit, posisiBaru) {
        var ciri = fotoAlbum(album).slice();
        var tombol = $('lb-tools').querySelectorAll('button');
        Array.prototype.forEach.call(tombol, function (b) { b.disabled = true; });
        return window.GH.simpan({
            json: 'galeri.json', pesan: pesanCommit,
            ubah: function (list) {
                // Album dikenali dari fotonya (aman walau urutan album berubah)
                var a = (list || []).filter(function (x) { return fotoAlbum(x).some(function (p) { return ciri.indexOf(p) >= 0; }); })[0];
                if (!a) { var err = new Error('hilang'); err.status = 410; throw err; }
                a.files = fotoAlbum(a); delete a.file;
                ubah(a);
                return list;
            }
        }).then(function (list) {
            daftar = list; render();
            album = list.filter(function (x) { return fotoAlbum(x).some(function (p) { return ciri.indexOf(p) >= 0; }); })[0] || album;
            tampil(posisiBaru ? posisiBaru(album) : pos);
        }).catch(function (err) {
            alert(err.status === 410 ? 'Album ini sudah dihapus dari perangkat lain. Muat ulang halaman.' : window.GH.alasan(err));
        }).then(function () {
            Array.prototype.forEach.call(tombol, function (b) { b.disabled = false; });
        });
    }
    function geserFoto(arah) {
        var path = fotoAlbum(album)[pos];
        ubahAlbum(function (a) {
            var i = a.files.indexOf(path), j = i + arah;
            if (i < 0 || j < 0 || j >= a.files.length) return;
            a.files.splice(j, 0, a.files.splice(i, 1)[0]);
        }, 'Urutkan foto: ' + album.tempat, function (a) { return a.files.indexOf(path); });
    }
    $('geser-kiri').addEventListener('click', function () { geserFoto(-1); });
    $('geser-kanan').addEventListener('click', function () { geserFoto(1); });
    $('jadi-sampul').addEventListener('click', function () {
        var path = fotoAlbum(album)[pos];
        ubahAlbum(function (a) {
            var i = a.files.indexOf(path);
            if (i > 0) a.files.unshift(a.files.splice(i, 1)[0]);
        }, 'Ganti sampul: ' + album.tempat, function () { return 0; });
    });

    // Formulir ubah keterangan album
    var mKet = document.createElement('div');
    mKet.className = 'modal'; mKet.hidden = true;
    mKet.innerHTML = '<form class="modal-card"><button type="button" class="modal-x" data-tutup aria-label="Tutup">✕</button>' +
        '<h2>Ubah Keterangan Album</h2>' +
        '<label>Nama tempat <input name="tempat" required placeholder="contoh: Pantai Kuta"></label>' +
        '<div class="row2"><label>Kota <input name="kota" placeholder="contoh: Bali"></label>' +
        '<label>Waktu <input name="waktu" placeholder="contoh: Juli 2024"></label></div>' +
        '<label>Cerita singkat <textarea name="cerita" rows="3" placeholder="Apa yang paling berkesan?"></textarea></label>' +
        '<p class="pesan" role="status"></p><div class="modal-actions"><button type="button" class="btn btn-ghost" data-tutup>Batal</button>' +
        '<button type="submit" class="btn">Simpan</button></div></form>';
    document.body.appendChild(mKet);
    var fKet = mKet.querySelector('form');
    function tutupKet() { if (!fKet.querySelector('[type=submit]').disabled) mKet.hidden = true; }
    mKet.addEventListener('click', function (e) { if (e.target === mKet || e.target.hasAttribute('data-tutup')) tutupKet(); });
    $('ubah-album').addEventListener('click', function () {
        fKet.tempat.value = album.tempat || ''; fKet.kota.value = album.kota || '';
        fKet.waktu.value = album.waktu || ''; fKet.cerita.value = album.cerita || '';
        fKet.querySelector('.pesan').textContent = '';
        mKet.hidden = false; fKet.tempat.focus();
    });
    fKet.addEventListener('submit', function (e) {
        e.preventDefault();
        var isi = { tempat: fKet.tempat.value.trim(), kota: fKet.kota.value.trim(), waktu: fKet.waktu.value.trim(), cerita: fKet.cerita.value.trim() };
        if (!isi.tempat) return;
        var btn = fKet.querySelector('[type=submit]'); btn.disabled = true;
        fKet.querySelector('.pesan').className = 'pesan'; fKet.querySelector('.pesan').textContent = 'Menyimpan…';
        ubahAlbum(function (a) { Object.assign(a, isi); }, 'Ubah keterangan album: ' + isi.tempat).then(function () {
            btn.disabled = false; tutupKet();
        });
    });

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
            img.onerror = function () { URL.revokeObjectURL(img.src); gagal(new Error('format')); };
            img.src = URL.createObjectURL(file);
        });
    }

    // ---------- Siapkan video: ambil gambar sampul dari detik ke-1 ----------
    function ekstensi(file) {
        var m = (file.name || '').match(/\.(mp4|webm|mov|m4v)$/i);
        if (m) return m[1].toLowerCase();
        return { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' }[file.type] || '';
    }
    function siapkanVideo(file) {
        return new Promise(function (ok) {
            var url = URL.createObjectURL(file), v = document.createElement('video'), beres = false;
            function hasil(dataUrl) {
                if (beres) return; beres = true; clearTimeout(batas);
                v.removeAttribute('src'); v.load();
                // Tanpa sampul berarti browser ini tidak bisa memutar videonya (mis. .mov HEVC dari iPhone)
                ok({ jenis: 'video', file: file, url: url, ext: ekstensi(file), mb: file.size / 1048576,
                     dataUrl: dataUrl || POSTER_KOSONG, posterB64: dataUrl ? dataUrl.split(',')[1] : '' });
            }
            var batas = setTimeout(function () { hasil(''); }, 15000);
            v.muted = true; v.playsInline = true; v.preload = 'auto';
            v.onloadedmetadata = function () { v.currentTime = Math.min(1, (v.duration || 0) / 3); };
            v.onseeked = function () {
                if (!v.videoWidth) return hasil('');
                var k = Math.min(1, 1280 / Math.max(v.videoWidth, v.videoHeight));
                var c = document.createElement('canvas');
                c.width = Math.round(v.videoWidth * k); c.height = Math.round(v.videoHeight * k);
                try { c.getContext('2d').drawImage(v, 0, 0, c.width, c.height); hasil(c.toDataURL('image/jpeg', 0.8)); }
                catch (e) { hasil(''); }
            };
            v.onerror = function () { hasil(''); };
            v.src = url;
        });
    }
    function bacaB64(file) {
        return new Promise(function (ok, gagal) {
            var r = new FileReader();
            r.onload = function () { ok(r.result.slice(r.result.indexOf(',') + 1)); };
            r.onerror = function () { gagal(new Error('baca')); };
            r.readAsDataURL(file);
        });
    }
    // Unggah file besar (video) dengan tampilan persen; fetch tidak bisa melaporkan kemajuan unggah
    function unggahBesar(base64, kunci, kemajuan) {
        return new Promise(function (ok, gagal) {
            var x = new XMLHttpRequest();
            x.open('POST', API + 'git/blobs');
            x.setRequestHeader('Authorization', 'Bearer ' + kunci);
            x.setRequestHeader('Accept', 'application/vnd.github+json');
            x.setRequestHeader('Content-Type', 'application/json');
            x.upload.onprogress = function (e) { if (e.lengthComputable) kemajuan(e.loaded / e.total); };
            x.onload = function () {
                if (x.status >= 200 && x.status < 300) return ok(JSON.parse(x.responseText));
                var err = new Error('github'); err.status = x.status; gagal(err);
            };
            x.onerror = function () { var err = new Error('jaringan'); err.status = 0; gagal(err); };
            x.send(new Blob(['{"encoding":"base64","content":"', base64, '"}'], { type: 'application/json' }));
        });
    }

    // ---------- Formulir ----------
    function info(teks, jenis) { pesan.textContent = teks; pesan.className = 'pesan ' + (jenis || ''); }

    function gambarThumbs() {
        thumbs.innerHTML = antre.map(function (f, i) {
            var label = f.jenis === 'yt' ? '<em>▶ YouTube</em>'
                : f.jenis === 'video' ? '<em' + (f.mb > SARAN_VIDEO_MB ? ' class="besar"' : '') + '>🎬 ' + Math.ceil(f.mb) + ' MB</em>' : '';
            return '<div class="thumb' + (f.jenis ? ' thumb-video' : '') + '"><img src="' + esc(f.dataUrl) + '" alt="">' + label +
                '<button type="button" data-hapus="' + i + '" aria-label="Batalkan foto ini">✕</button>' +
                (i === 0 && !pilihAlbum.value ? '<span>Sampul</span>' : '') + '</div>';
        }).join('');
        pickText.innerHTML = antre.length
            ? '＋ Tambah foto / video lagi <small>(' + antre.length + ' dipilih)</small>'
            : '📷 Klik untuk memilih foto atau video<br><small>Bisa pilih banyak sekaligus</small>';
        $('pick').classList.toggle('kecil', antre.length > 0);
    }

    function bukaForm(albumIndex) {
        form.reset(); antre = []; gambarThumbs(); info('');
        progres.hidden = true;
        pilihAlbum.innerHTML = '<option value="">＋ Liburan baru</option>' + daftar.map(function (a, i) {
            return '<option value="' + i + '">' + esc(a.tempat) + (a.waktu ? ' (' + esc(a.waktu) + ')' : '') + '</option>';
        }).reverse().join('');
        if (albumIndex != null) pilihAlbum.value = albumIndex;
        infoBaru.hidden = !!pilihAlbum.value;
        var ada = !!getKunci();
        $('kunci-status').textContent = ada ? '· tersimpan ✓' : '· wajib diisi';
        $('kunci-box').open = !ada;
        $('lupakan-kunci').hidden = !ada;
        modal.hidden = false; document.body.style.overflow = 'hidden';
    }
    function tutupForm() {
        if (btnSimpan.disabled) return; // sedang mengunggah
        modal.hidden = true; document.body.style.overflow = '';
    }

    $('btn-tambah').addEventListener('click', function () { bukaForm(null); });
    modal.addEventListener('click', function (e) {
        if (e.target === modal || e.target.hasAttribute('data-tutup')) tutupForm();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { if (!mKet.hidden) tutupKet(); else if (!modal.hidden) tutupForm(); else if (!box.hidden) tutupAlbum(); }
        if (!mKet.hidden) return; // sedang mengetik keterangan
        if (!box.hidden && e.key === 'ArrowLeft') tampil(pos - 1);
        if (!box.hidden && e.key === 'ArrowRight') tampil(pos + 1);
    });
    $('lupakan-kunci').addEventListener('click', function () {
        setKunci(''); $('kunci-status').textContent = '· wajib diisi'; this.hidden = true;
        info('Kunci dihapus dari perangkat ini.');
    });
    pilihAlbum.addEventListener('change', function () { infoBaru.hidden = !!pilihAlbum.value; gambarThumbs(); });
    thumbs.addEventListener('click', function (e) {
        var i = e.target.getAttribute('data-hapus');
        if (i !== null) {
            var f = antre.splice(+i, 1)[0];
            if (f.url) URL.revokeObjectURL(f.url);
            gambarThumbs();
        }
    });

    form.foto.addEventListener('change', function () {
        var files = Array.prototype.slice.call(form.foto.files);
        form.foto.value = '';
        if (!files.length) return;
        var sisa = MAKS_FOTO - antre.length;
        var catatan = [];
        if (files.length > sisa) catatan.push('Maksimal ' + MAKS_FOTO + ' foto sekali simpan. ' + (files.length - sisa) + ' foto tidak ikut.');
        files = files.slice(0, Math.max(0, sisa));
        var gagal = 0, selesai = 0, terlaluBesar = [], besar = 0, tidakDiputar = 0;
        btnSimpan.disabled = true;
        // Satu per satu agar HP tidak kehabisan memori
        files.reduce(function (p, file) {
            return p.then(function () {
                var video = /^video\//.test(file.type) || ekstensi(file);
                info('Menyiapkan foto ' + (++selesai) + ' dari ' + files.length + '…');
                if (!video) return perkecil(file).then(function (f) { antre.push(f); gambarThumbs(); }, function () { gagal++; });
                if (!ekstensi(file)) { gagal++; return; }
                if (file.size > MAKS_VIDEO_MB * 1048576) { terlaluBesar.push(file.name); return; }
                return siapkanVideo(file).then(function (f) {
                    if (f.mb > SARAN_VIDEO_MB) besar++;
                    if (!f.posterB64) tidakDiputar++;
                    antre.push(f); gambarThumbs();
                });
            });
        }, Promise.resolve()).then(function () {
            btnSimpan.disabled = false;
            if (gagal) catatan.push(gagal + ' file tidak bisa dibuka (gunakan foto JPG/PNG atau video MP4).');
            if (terlaluBesar.length) catatan.push('Video terlalu besar (lebih dari ' + MAKS_VIDEO_MB + ' MB) tidak ikut: ' + terlaluBesar.join(', ') +
                '. Unggah video panjang ke YouTube, lalu tempel linknya di bawah.');
            if (besar) catatan.push('⚠️ Ada video di atas ' + SARAN_VIDEO_MB + ' MB: unggahnya lama dan bisa gagal bila sinyal lemah.');
            if (tidakDiputar) catatan.push('⚠️ Browser ini tidak bisa memutar ' + tidakDiputar + ' video (biasanya .mov dari iPhone). Video tetap bisa disimpan, tapi sebaiknya pakai MP4 agar semua orang bisa menonton.');
            info(catatan.join(' '), catatan.length ? 'error' : '');
        });
    });

    // Tempel link YouTube
    function tambahYt() {
        var link = $('yt-link').value.trim(), id = ytId(link);
        if (!link) return;
        if (!id) return info('Link YouTube tidak dikenali. Contoh: https://youtu.be/abcdefghijk', 'error');
        if (antre.length >= MAKS_FOTO) return info('Maksimal ' + MAKS_FOTO + ' foto sekali simpan. 1 foto tidak ikut.', 'error');
        antre.push({ jenis: 'yt', link: 'https://youtu.be/' + id, dataUrl: 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg' });
        $('yt-link').value = ''; info(''); gambarThumbs();
    }
    $('tambah-yt').addEventListener('click', tambahYt);
    $('yt-link').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); tambahYt(); } });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var kunci = form.kunci.value.trim() || getKunci();
        var idx = pilihAlbum.value === '' ? null : +pilihAlbum.value;
        var tempat = idx === null ? form.tempat.value.trim() : daftar[idx].tempat;
        if (!antre.length) return info('Pilih fotonya dulu.', 'error');
        if (!tempat) { form.tempat.focus(); return info('Isi nama tempatnya dulu.', 'error'); }
        if (!kunci) { $('kunci-box').open = true; return info('Masukkan Kunci GitHub dulu.', 'error'); }

        var stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
        var foto = antre.map(function (f, i) {
            var dasar = 'galeri/' + stamp + '-' + (i + 1);
            if (f.jenis === 'yt') return { path: f.link, f: f };
            if (f.jenis === 'video') return { path: dasar + '.' + f.ext, poster: f.posterB64 ? dasar + '-sampul.jpg' : '', f: f };
            return { path: dasar + '.jpg', f: f };
        });
        var albumAsli = idx === null ? null : daftar[idx];
        var paths = foto.map(function (x) { return x.path; });
        var adaVideo = paths.some(function (p) { return jenis(p) !== 'foto'; });

        btnSimpan.disabled = true;
        progres.hidden = false; progres.max = foto.length + 1; progres.value = 0;

        // 1) Unggah foto & video satu per satu
        var blobs = [], poster = {}, sedang = null;
        function blob(path, base64) {
            return gh('git/blobs', { method: 'POST', body: { content: base64, encoding: 'base64' } }, kunci)
                .then(function (b) { blobs.push({ path: path, sha: b.sha }); });
        }
        foto.reduce(function (p, x, i) {
            return p.then(function () {
                sedang = x;
                if (x.f.jenis === 'yt') { progres.value = i + 1; return; }
                if (x.f.jenis !== 'video') {
                    info('Mengunggah foto ' + (i + 1) + ' dari ' + foto.length + '…');
                    return blob(x.path, x.f.base64).then(function () { progres.value = i + 1; });
                }
                var teks = 'Mengunggah video ' + (i + 1) + ' dari ' + foto.length + ' (' + Math.ceil(x.f.mb) + ' MB)…';
                info(teks);
                return bacaB64(x.f.file).then(function (b64) {
                    return unggahBesar(b64, kunci, function (k) {
                        progres.value = i + k;
                        info(teks + ' ' + Math.floor(k * 100) + '%');
                    });
                }).then(function (b) {
                    blobs.push({ path: x.path, sha: b.sha });
                    if (!x.poster) return;
                    poster[x.path] = x.poster;
                    return blob(x.poster, x.f.posterB64);
                }).then(function () { progres.value = i + 1; });
            });
        }, Promise.resolve()).then(function () {
            sedang = null;
            // 2) Simpan semua foto + daftar galeri sekaligus
            info('Menyimpan album…');
            var adaPoster = Object.keys(poster).length > 0;
            return simpanSemua(kunci, blobs, function (list) {
                var target = albumAsli && list.filter(function (a) {
                    return fotoAlbum(a)[0] === fotoAlbum(albumAsli)[0];
                })[0];
                if (target) {
                    target.files = fotoAlbum(target).concat(paths);
                    delete target.file;
                    if (adaPoster) target.poster = Object.assign({}, target.poster, poster);
                } else {
                    var baru = {
                        tempat: tempat, kota: form.kota.value.trim(), waktu: form.waktu.value.trim(),
                        cerita: form.cerita.value.trim(), files: paths
                    };
                    if (adaPoster) baru.poster = poster;
                    list.push(baru);
                }
                return list;
            }, (albumAsli ? 'Tambah foto ke ' : 'Album baru: ') + tempat + ' (' + hitung(paths).replace(/(📷|🎬) /g, '') + ')');
        }).then(function (list) {
            progres.value = progres.max;
            setKunci(kunci);
            foto.forEach(function (x) {
                if (x.f.jenis === 'video') { lokal[x.path] = x.f.url; if (x.poster) lokal[x.poster] = x.f.dataUrl; }
                else if (!x.f.jenis) lokal[x.path] = x.f.dataUrl;
            });
            daftar = list; render();
            btnSimpan.disabled = false;
            tutupForm();
            alert((adaVideo ? hitung(paths) : foto.length + ' foto') + ' tersimpan! 🎉\n\nPengunjung lain akan melihatnya dalam 1–2 menit, setelah GitHub selesai memperbarui situs.');
        }).catch(function (err) {
            btnSimpan.disabled = false; progres.hidden = true;
            // Video gagal: hampir selalu karena terlalu besar atau koneksi putus di tengah jalan
            var s = err && err.status;
            if (sedang && sedang.f.jenis === 'video' && s !== 401 && s !== 403 && s !== 404) {
                return info('Video gagal diunggah (terlalu besar atau koneksi terputus). Coba video di bawah ' + SARAN_VIDEO_MB +
                    ' MB, atau unggah ke YouTube lalu tempel linknya.', 'error');
            }
            info(alasan(err), 'error');
        });
    });

    muat();
})();
