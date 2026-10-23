// Bantuan bersama untuk membaca & menyimpan file situs di GitHub (dipakai Pengaturan & Kelola Anggota)
(function () {
    var OWNER = 'triwaluyo1140';
    var REPO = 'thetrifamily';
    var BRANCH = 'main';
    var API = 'https://api.github.com/repos/' + OWNER + '/' + REPO + '/';
    var KEY = 'galeri-kunci'; // kunci yang sama dengan Galeri, Silsilah, dan Profil

    function kunci() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
    function fromB64(b64) { return decodeURIComponent(escape(atob(b64.replace(/\n/g, '')))); }

    function gh(path, opt) {
        opt = opt || {};
        opt.headers = { 'Authorization': 'Bearer ' + kunci(), 'Accept': 'application/vnd.github+json' };
        opt.cache = 'no-store';
        if (opt.body && typeof opt.body !== 'string') opt.body = JSON.stringify(opt.body);
        return fetch(API + path, opt).then(function (r) {
            if (!r.ok) { var err = new Error('github'); err.status = r.status; throw err; }
            return r.json();
        });
    }

    // Baca file JSON: dengan kunci langsung dari GitHub (paling baru), tanpa kunci dari situs. null bila belum ada.
    function bacaJson(path) {
        var lewatSitus = function () {
            return fetch(path + '?t=' + Date.now()).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
        };
        if (!kunci()) return lewatSitus();
        return gh('contents/' + path + '?ref=' + BRANCH)
            .then(function (d) { return JSON.parse(fromB64(d.content)); })
            .catch(function (err) { return err.status === 404 ? null : lewatSitus(); });
    }

    // Simpan beberapa file dalam SATU commit, sehingga situs hanya diperbarui sekali.
    // Satu file data: { json, ubah }; beberapa file data: { berkas: [{ json, ubah }, ...] }.
    // ubah(jsonTerbaru) mengembalikan isi JSON baru; foto: [{ path, base64 }]; hapus: [path]
    function simpan(opsi, coba) {
        var head, hasil;
        var berkas = opsi.berkas || [{ json: opsi.json, ubah: opsi.ubah }];
        var blobs = Promise.all((opsi.foto || []).map(function (f) {
            return f.sha ? f : gh('git/blobs', { method: 'POST', body: { content: f.base64, encoding: 'base64' } })
                .then(function (b) { f.sha = b.sha; return f; });
        }));
        return blobs.then(function () {
            return gh('git/ref/heads/' + BRANCH);
        }).then(function (ref) {
            head = ref.object.sha;
            return Promise.all([gh('git/commits/' + head)].concat(berkas.map(function (b) {
                return gh('contents/' + b.json + '?ref=' + head).then(function (d) { return JSON.parse(fromB64(d.content)); },
                    function (err) { if (err.status === 404) return null; throw err; });
            })));
        }).then(function (r) {
            // Semua data dibaca dulu, baru diubah (agar perubahan saling bisa melihat data terbaru)
            var terbaru = r.slice(1);
            hasil = berkas.map(function (b, i) { return b.ubah(terbaru[i], terbaru); });
            var tree = (opsi.foto || []).map(function (f) { return { path: f.path, mode: '100644', type: 'blob', sha: f.sha }; })
                .concat((opsi.hapus || []).map(function (p) { return { path: p, mode: '100644', type: 'blob', sha: null }; }))
                .concat(berkas.map(function (b, i) {
                    return { path: b.json, mode: '100644', type: 'blob', content: JSON.stringify(hasil[i], null, 2) + '\n' };
                }));
            return gh('git/trees', { method: 'POST', body: { base_tree: r[0].tree.sha, tree: tree } });
        }).then(function (t) {
            return gh('git/commits', { method: 'POST', body: { message: opsi.pesan, tree: t.sha, parents: [head] } });
        }).then(function (c) {
            return gh('git/refs/heads/' + BRANCH, { method: 'PATCH', body: { sha: c.sha } });
        }).then(function () { return opsi.berkas ? hasil : hasil[0]; }).catch(function (err) {
            // Ada perubahan lain di saat yang sama: ulangi sekali dengan data terbaru
            if (err.status === 422 && !coba) return simpan(opsi, true);
            throw err;
        });
    }

    function alasan(err) {
        var s = err && err.status;
        if (s === 401) return 'Kunci GitHub salah atau sudah kedaluwarsa.';
        if (s === 403 || s === 404) return 'Kunci tidak punya izin menulis ke repositori ' + REPO + '.';
        if (s === 409 || s === 422) return 'Data sedang diperbarui. Coba simpan lagi.';
        return 'Gagal menyimpan. Periksa koneksi internet lalu coba lagi.';
    }

    // ---------- Anggota <-> Silsilah ----------
    // Orang silsilah yang tertaut dengan anggota: lewat m.silsilah, atau nama yang sama persis (dan unik)
    function tautan(m, orang) {
        // m.silsilah === '-' : sengaja tidak ditautkan
        if (!m || m.profil || m.silsilah === '-' || !orang || !orang.length) return null;
        if (m.silsilah) { for (var i = 0; i < orang.length; i++) if (orang[i].id === m.silsilah) return orang[i]; }
        var nama = (m.nama || '').trim().toLowerCase();
        var sama = orang.filter(function (o) { return (o.nama || '').trim().toLowerCase() === nama; });
        return sama.length === 1 ? sama[0] : null;
    }
    // Foto anggota: foto di silsilah (bila tertaut & ada), jika tidak foto milik anggota sendiri
    function fotoAnggota(m, orang) {
        var t = tautan(m, orang);
        return t && t.foto ? t.foto : (m.foto || '');
    }
    // Daftar orang silsilah (format baru), [] bila belum ada
    function bacaSilsilah() {
        return bacaJson('silsilah.json').then(function (d) { return d && d.versi === 2 ? d.orang : []; });
    }

    window.GH = { tautan: tautan, fotoAnggota: fotoAnggota, bacaSilsilah: bacaSilsilah, kunci: kunci, bacaJson: bacaJson, simpan: simpan, alasan: alasan };
})();
