// Animasi halus saat elemen muncul di layar
(function () {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
        items.forEach(function (el) { el.classList.add('show'); });
        return;
    }
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); }
        });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
})();

// Galeri: klik foto untuk melihat lebih besar
(function () {
    var box = document.getElementById('lightbox');
    if (!box) return;
    var img = box.querySelector('img'), cap = box.querySelector('figcaption');
    var i = 0;
    function photos() { return Array.prototype.slice.call(document.querySelectorAll('.photo:not(.kosong)')); }
    function show(n) {
        var list = photos(); if (!list.length) return;
        i = (n + list.length) % list.length;
        var p = list[i], src = p.querySelector('img');
        img.src = src.src; img.alt = src.alt;
        cap.innerHTML = '<strong>' + p.querySelector('strong').textContent + '</strong>' + p.querySelector('.when').textContent;
        box.hidden = false; document.body.style.overflow = 'hidden';
    }
    function close() { box.hidden = true; document.body.style.overflow = ''; }
    document.querySelector('.gallery').addEventListener('click', function (e) {
        var p = e.target.closest('.photo');
        if (p && !p.classList.contains('kosong')) show(photos().indexOf(p));
    });
    box.querySelector('.lb-close').onclick = close;
    box.querySelector('.lb-prev').onclick = function () { show(i - 1); };
    box.querySelector('.lb-next').onclick = function () { show(i + 1); };
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
        if (box.hidden) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') show(i - 1);
        if (e.key === 'ArrowRight') show(i + 1);
    });
})();
