document.addEventListener('DOMContentLoaded', function() {
    var liste = document.getElementById('proje-listesi');
    var yukleniyor = document.getElementById('yukleniyor');

    // elle eklenen projeler - github api çalışmazsa bunlar gösterilecek
    var projeler = [
        'havadurumu',
        'avmarket',
        'snake',
        'muzik',
        'gorevler',
        'chatbot',
        'yazihizi',
        'pomodoro',
        'solitaire'
    ];

    // github apiden çekmeyi dene, olmazsa yukarıdaki listeyi kullan
    fetch('https://api.github.com/repos/TalhaGamer05/TalhaGamer05.github.io/contents/')
        .then(function(res) {
            if (!res.ok) throw new Error('api hatası');
            return res.json();
        })
        .then(function(data) {
            // sadece klasörleri al, gizli dosyaları atla
            var klasorler = data.filter(function(item) {
                return item.type === 'dir' && !item.name.startsWith('.');
            });
            yukleniyor.style.display = 'none';

            if (klasorler.length === 0) {
                liste.innerHTML = '<p style="color:#666; text-align:center;">henüz proje yok</p>';
                return;
            }

            klasorler.forEach(function(klasor, i) {
                kartEkle(klasor.name, i);
            });
        })
        .catch(function() {
            // api çalışmadı, elle eklenen listeyi kullan
            yukleniyor.style.display = 'none';
            projeler.forEach(function(isim, i) {
                kartEkle(isim, i);
            });
        });

    function kartEkle(klasorAdi, sira) {
        var a = document.createElement('a');
        a.href = klasorAdi + '/index.html';
        a.className = 'proje-kart';
        a.style.animationDelay = (sira * 0.08) + 's';

        // klasör adını düzgün başlığa çevir
        var baslik = klasorAdi
            .replace(/-/g, ' ')
            .replace(/\b\w/g, function(c) { return c.toUpperCase(); });

        a.innerHTML = '<div class="ikon">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>' +
            '</svg></div>' +
            '<h3>' + baslik + '</h3>' +
            '<p class="alt-yazi">projeyi aç</p>';

        // fare takip efekti
        a.addEventListener('mousemove', function(e) {
            var r = a.getBoundingClientRect();
            a.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            a.style.setProperty('--my', (e.clientY - r.top) + 'px');
        });

        liste.appendChild(a);
    }
});
