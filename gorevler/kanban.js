// kanban görev yöneticisi
// sürükle bırak + localstorage

var gorevler = JSON.parse(localStorage.getItem('kanban-gorevler')) || [];
var seciliKolon = '';
var seciliRenk = '#3b82f6';

// sayfa yüklenince kartları çiz
window.addEventListener('DOMContentLoaded', function() {
    kartlariCiz();
    istatistikGuncelle();
    renkSecimAyarla();
});

function renkSecimAyarla() {
    document.querySelectorAll('.renk-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.renk-btn').forEach(function(b) { b.classList.remove('aktif'); });
            btn.classList.add('aktif');
            seciliRenk = btn.getAttribute('data-renk');
        });
    });
}

// popup aç kapa
function yeniGorevGoster(kolon) {
    seciliKolon = kolon;
    document.getElementById('popupArka').classList.add('acik');
    document.getElementById('gorevBaslik').value = '';
    document.getElementById('gorevAciklama').value = '';
    document.getElementById('gorevBaslik').focus();
}

function popupKapat() {
    document.getElementById('popupArka').classList.remove('acik');
}

// görev kaydet
function gorevKaydet() {
    var baslik = document.getElementById('gorevBaslik').value.trim();
    if (!baslik) {
        document.getElementById('gorevBaslik').style.borderColor = '#ef4444';
        return;
    }

    var yeniGorev = {
        id: Date.now(),
        baslik: baslik,
        aciklama: document.getElementById('gorevAciklama').value.trim(),
        durum: seciliKolon,
        renk: seciliRenk
    };

    gorevler.push(yeniGorev);
    kaydet();
    kartlariCiz();
    istatistikGuncelle();
    popupKapat();
}

// görev sil
function gorevSil(id) {
    if (!confirm('bu görevi silmek istediğine emin misin?')) return;
    gorevler = gorevler.filter(function(g) { return g.id !== id; });
    kaydet();
    kartlariCiz();
    istatistikGuncelle();
}

// kartları çiz
function kartlariCiz() {
    // kolonları temizle
    document.getElementById('yapilacak').innerHTML = '';
    document.getElementById('devam').innerHTML = '';
    document.getElementById('bitti').innerHTML = '';

    gorevler.forEach(function(gorev) {
        var kart = document.createElement('div');
        kart.className = 'kart';
        kart.draggable = true;
        kart.setAttribute('data-id', gorev.id);

        kart.innerHTML =
            '<div class="renk-serit" style="background:' + gorev.renk + '"></div>' +
            '<h4>' + gorev.baslik + '</h4>' +
            (gorev.aciklama ? '<p>' + gorev.aciklama + '</p>' : '') +
            '<button class="sil-btn" onclick="gorevSil(' + gorev.id + ')">✕</button>';

        // sürükle bırak
        kart.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', gorev.id);
            kart.style.opacity = '0.4';
        });
        kart.addEventListener('dragend', function() {
            kart.style.opacity = '1';
        });

        var hedefKolon = document.getElementById(gorev.durum);
        if (hedefKolon) hedefKolon.appendChild(kart);
    });
}

// sürükle bırak - kolon hedefleri
document.querySelectorAll('.kart-listesi').forEach(function(liste) {
    liste.addEventListener('dragover', function(e) {
        e.preventDefault();
        liste.parentElement.classList.add('hedef');
    });

    liste.addEventListener('dragleave', function() {
        liste.parentElement.classList.remove('hedef');
    });

    liste.addEventListener('drop', function(e) {
        e.preventDefault();
        liste.parentElement.classList.remove('hedef');

        var gorevId = parseInt(e.dataTransfer.getData('text/plain'));
        var yeniDurum = liste.id;

        // durumu güncelle
        gorevler.forEach(function(g) {
            if (g.id === gorevId) g.durum = yeniDurum;
        });

        kaydet();
        kartlariCiz();
        istatistikGuncelle();
    });
});

// istatistik güncelle
function istatistikGuncelle() {
    var toplam = gorevler.length;
    var biten = gorevler.filter(function(g) { return g.durum === 'bitti'; }).length;
    var oran = toplam > 0 ? Math.round((biten / toplam) * 100) : 0;

    document.getElementById('toplamSayac').textContent = toplam + ' görev';
    document.getElementById('yuzde').textContent = oran + '%';
    document.getElementById('ilerlemeDolu').style.width = oran + '%';
}

// localstorage kaydet
function kaydet() {
    localStorage.setItem('kanban-gorevler', JSON.stringify(gorevler));
}

// enter ile kaydet
document.getElementById('gorevBaslik').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') gorevKaydet();
});
