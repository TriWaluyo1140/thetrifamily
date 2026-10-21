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
