// spider solitaire
// surukle birak + zorluk secimi

var DEGER_ADLARI = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
var TAKIM_SEMBOL = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };
var TAKIM_RENK = { spades: 'siyah', hearts: 'kirmizi', diamonds: 'kirmizi', clubs: 'siyah' };

// oyun durumu
var kolonlar = [];     // 10 kolon, her biri kart dizisi
var stok = [];          // dagitilmamis kartlar
var tamamlanan = 0;     // tamamlanan K-A seri sayisi
var skor = 500;
var hamle = 0;
var gecenSure = 0;
var zamanlayici = null;
var zorluk = 1;         // 1, 2, 4 takim
var geriAlYigini = [];

// surukle birak
var surukAktif = false;
var surukKartlar = [];  // suruklenen kartlar
var surukKaynakKolon = -1;
var surukKaynakIdx = -1;
var surukDiv = null;
var fareOffsetX = 0, fareOffsetY = 0;

// sayfa yuklenince
window.addEventListener('DOMContentLoaded', function() {
    kolonlariOlustur();
    yeniOyun();

    // fare olaylari
    document.addEventListener('mousemove', fareTasi);
    document.addEventListener('mouseup', fareBirak);
    document.addEventListener('touchmove', dokunmaTasi, { passive: false });
    document.addEventListener('touchend', dokunmaBirak);
});

function kolonlariOlustur() {
    var masa = document.getElementById('masa');
    masa.innerHTML = '';
    for (var i = 0; i < 10; i++) {
        var div = document.createElement('div');
        div.className = 'kolon';
        div.setAttribute('data-kolon', i);
        masa.appendChild(div);
    }
}

function zorluguDegistir() {
    zorluk = parseInt(document.getElementById('zorlukSec').value);
    yeniOyun();
}

function yeniOyun() {
    // temizle
    clearInterval(zamanlayici);
    skor = 500;
    hamle = 0;
    gecenSure = 0;
    tamamlanan = 0;
    geriAlYigini = [];

    // deste olustur
    var takimlar;
    if (zorluk === 1) takimlar = ['spades'];
    else if (zorluk === 2) takimlar = ['spades', 'hearts'];
    else takimlar = ['spades', 'hearts', 'diamonds', 'clubs'];

    // 104 kart (8 * 13 = 104 veya gerekli kadar tekrar)
    var deste = [];
    var tekrarSayisi = 8 / takimlar.length; // her takimdan kac kopya
    for (var t = 0; t < takimlar.length; t++) {
        for (var kopya = 0; kopya < tekrarSayisi; kopya++) {
            for (var d = 1; d <= 13; d++) {
                deste.push({ takim: takimlar[t], deger: d, acik: false });
            }
        }
    }

    // karistir
    for (var i = deste.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var gecici = deste[i];
        deste[i] = deste[j];
        deste[j] = gecici;
    }

    // dagit: ilk 4 kolon 6 kart, son 6 kolon 5 kart
    kolonlar = [];
    for (var i = 0; i < 10; i++) kolonlar.push([]);

    var idx = 0;
    for (var i = 0; i < 10; i++) {
        var kartSayisi = (i < 4) ? 6 : 5;
        for (var k = 0; k < kartSayisi; k++) {
            var kart = deste[idx++];
            // en ustteki acilik
            kart.acik = (k === kartSayisi - 1);
            kolonlar[i].push(kart);
        }
    }

    // kalan kartlar stoka
    stok = deste.slice(idx);

    // zamanlayici
    zamanlayici = setInterval(function() {
        gecenSure++;
        sureGuncelle();
    }, 1000);

    // kazanma ekranini gizle
    document.getElementById('kazanmaEkrani').style.display = 'none';

    masayiCiz();
    bilgiGuncelle();
}

// masayi ciz
function masayiCiz() {
    for (var kolon = 0; kolon < 10; kolon++) {
        kolonCiz(kolon);
    }
    stokCiz();
    tamamlananCiz();
}

function kolonCiz(kolonIdx) {
    var kolonDiv = document.querySelector('[data-kolon="' + kolonIdx + '"]');
    kolonDiv.innerHTML = '';

    var kartlar = kolonlar[kolonIdx];
    for (var i = 0; i < kartlar.length; i++) {
        var kart = kartlar[i];
        var div = document.createElement('div');

        // kartlar arasi bosluk
        var offset = 0;
        for (var j = 0; j < i; j++) {
            offset += kartlar[j].acik ? 28 : 14;
        }
        div.style.top = offset + 'px';
        div.style.zIndex = i + 1;

        if (kart.acik) {
            var renk = TAKIM_RENK[kart.takim];
            var sembol = TAKIM_SEMBOL[kart.takim];
            var ad = DEGER_ADLARI[kart.deger];

            div.className = 'kart acik ' + renk;
            div.innerHTML =
                '<span class="kart-ust">' + ad + sembol + '</span>' +
                '<span class="kart-merkez">' + sembol + '</span>' +
                '<span class="kart-alt">' + ad + sembol + '</span>';

            // surukle baslat
            div.setAttribute('data-kolon', kolonIdx);
            div.setAttribute('data-sira', i);
            div.addEventListener('mousedown', surukBaslat);
            div.addEventListener('touchstart', dokunmaBaslat);
        } else {
            div.className = 'kart kapali';
        }

        kolonDiv.appendChild(div);
    }

    // kolon yuksekligini ayarla
    var sonOffset = 0;
    for (var j = 0; j < kartlar.length; j++) {
        sonOffset += kartlar[j].acik ? 28 : 14;
    }
    kolonDiv.style.minHeight = Math.max(140, sonOffset + 105) + 'px';
}

function stokCiz() {
    var gorsel = document.getElementById('stokGorsel');
    gorsel.innerHTML = '';
    var dagitimSayisi = Math.floor(stok.length / 10);
    for (var i = 0; i < dagitimSayisi; i++) {
        var mini = document.createElement('div');
        mini.className = 'stok-mini';
        gorsel.appendChild(mini);
    }
    document.getElementById('stokSayac').textContent =
        dagitimSayisi > 0 ? dagitimSayisi + ' dağıtım kaldı' : 'stok bitti';
}

function tamamlananCiz() {
    var alan = document.getElementById('tamamlananAlan');
    alan.innerHTML = '';
    for (var i = 0; i < tamamlanan; i++) {
        var div = document.createElement('div');
        div.className = 'tamamlanan-seri';
        div.textContent = '♠';
        alan.appendChild(div);
    }
}

// surukle birak - fare
function surukBaslat(e) {
    e.preventDefault();
    var kolonIdx = parseInt(this.getAttribute('data-kolon'));
    var sira = parseInt(this.getAttribute('data-sira'));
    suruklemeyiBaslat(kolonIdx, sira, e.clientX, e.clientY);
}

function dokunmaBaslat(e) {
    e.preventDefault();
    var kolonIdx = parseInt(this.getAttribute('data-kolon'));
    var sira = parseInt(this.getAttribute('data-sira'));
    var touch = e.touches[0];
    suruklemeyiBaslat(kolonIdx, sira, touch.clientX, touch.clientY);
}

function suruklemeyiBaslat(kolonIdx, sira, x, y) {
    var kartlar = kolonlar[kolonIdx];

    // Bu karttan asagidakiler gecerli seri mi?
    if (!gecerliSeriMi(kolonIdx, sira)) return;

    surukAktif = true;
    surukKaynakKolon = kolonIdx;
    surukKaynakIdx = sira;
    surukKartlar = kartlar.slice(sira);

    // surukleme gorunumu olustur
    surukDiv = document.createElement('div');
    surukDiv.id = 'surukGrup';
    document.body.appendChild(surukDiv);

    for (var i = 0; i < surukKartlar.length; i++) {
        var kart = surukKartlar[i];
        var renk = TAKIM_RENK[kart.takim];
        var sembol = TAKIM_SEMBOL[kart.takim];
        var ad = DEGER_ADLARI[kart.deger];

        var div = document.createElement('div');
        div.className = 'kart acik ' + renk;
        div.innerHTML =
            '<span class="kart-ust">' + ad + sembol + '</span>' +
            '<span class="kart-merkez">' + sembol + '</span>' +
            '<span class="kart-alt">' + ad + sembol + '</span>';
        surukDiv.appendChild(div);
    }

    fareOffsetX = 45;
    fareOffsetY = 15;
    surukDiv.style.left = (x - fareOffsetX) + 'px';
    surukDiv.style.top = (y - fareOffsetY) + 'px';

    // kaynak kartlari soluklas
    var kolonDiv = document.querySelector('[data-kolon="' + kolonIdx + '"]');
    var kartDivler = kolonDiv.querySelectorAll('.kart.acik');
    for (var i = 0; i < kartDivler.length; i++) {
        var s = parseInt(kartDivler[i].getAttribute('data-sira'));
        if (s >= sira) kartDivler[i].classList.add('surukleniyor');
    }
}

function fareTasi(e) {
    if (!surukAktif || !surukDiv) return;
    surukDiv.style.left = (e.clientX - fareOffsetX) + 'px';
    surukDiv.style.top = (e.clientY - fareOffsetY) + 'px';
    hedefVurgula(e.clientX, e.clientY);
}

function dokunmaTasi(e) {
    if (!surukAktif || !surukDiv) return;
    e.preventDefault();
    var touch = e.touches[0];
    surukDiv.style.left = (touch.clientX - fareOffsetX) + 'px';
    surukDiv.style.top = (touch.clientY - fareOffsetY) + 'px';
    hedefVurgula(touch.clientX, touch.clientY);
}

function fareBirak(e) {
    if (!surukAktif) return;
    birak(e.clientX, e.clientY);
}

function dokunmaBirak(e) {
    if (!surukAktif) return;
    var touch = e.changedTouches[0];
    birak(touch.clientX, touch.clientY);
}

function hedefVurgula(x, y) {
    // tum vurgulamalari kaldir
    document.querySelectorAll('.kolon').forEach(function(k) { k.classList.remove('hedef-gecerli'); });

    var hedef = hedefKolonBul(x, y);
    if (hedef >= 0 && hedef !== surukKaynakKolon && birakGecerliMi(hedef)) {
        document.querySelector('[data-kolon="' + hedef + '"]').classList.add('hedef-gecerli');
    }
}

function birak(x, y) {
    // vurgulamalari kaldir
    document.querySelectorAll('.kolon').forEach(function(k) { k.classList.remove('hedef-gecerli'); });

    var hedef = hedefKolonBul(x, y);

    if (hedef >= 0 && hedef !== surukKaynakKolon && birakGecerliMi(hedef)) {
        // geri al icin kaydet
        var ustKartAcikMi = false;
        if (surukKaynakIdx > 0) {
            ustKartAcikMi = kolonlar[surukKaynakKolon][surukKaynakIdx - 1].acik;
        }
        geriAlYigini.push({
            kaynak: surukKaynakKolon,
            hedef: hedef,
            kartSayisi: surukKartlar.length,
            kaynakIdx: surukKaynakIdx,
            ustKartAcikti: ustKartAcikMi
        });

        // kartlari tasi
        kolonlar[surukKaynakKolon].splice(surukKaynakIdx);
        for (var i = 0; i < surukKartlar.length; i++) {
            kolonlar[hedef].push(surukKartlar[i]);
        }

        // kaynak kolonun ustteki kartini ac
        var kaynakKartlar = kolonlar[surukKaynakKolon];
        if (kaynakKartlar.length > 0 && !kaynakKartlar[kaynakKartlar.length - 1].acik) {
            kaynakKartlar[kaynakKartlar.length - 1].acik = true;
        }

        hamle++;
        skor = Math.max(0, skor - 1);

        // tamamlanmis seri kontrolu
        tamamlanmisSeriKontrol(hedef);

        bilgiGuncelle();
    }

    // temizle
    if (surukDiv) {
        document.body.removeChild(surukDiv);
        surukDiv = null;
    }
    surukAktif = false;
    surukKartlar = [];

    masayiCiz();
}

function hedefKolonBul(x, y) {
    var kolonDivler = document.querySelectorAll('.kolon');
    for (var i = 0; i < kolonDivler.length; i++) {
        var rect = kolonDivler[i].getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            return i;
        }
    }
    return -1;
}

// gecerlilik kontrolleri
function gecerliSeriMi(kolonIdx, baslangicIdx) {
    var kartlar = kolonlar[kolonIdx];
    // baslangic karti acik olmali
    if (!kartlar[baslangicIdx].acik) return false;

    // baslangictan sona kadar ayni takim ve azalan deger
    for (var i = baslangicIdx; i < kartlar.length - 1; i++) {
        if (kartlar[i].takim !== kartlar[i + 1].takim) return false;
        if (kartlar[i].deger !== kartlar[i + 1].deger + 1) return false;
    }
    return true;
}

function birakGecerliMi(hedefKolon) {
    var hedefKartlar = kolonlar[hedefKolon];

    // bos kolona her sey konabilir
    if (hedefKartlar.length === 0) return true;

    // ustteki kart suruklenen ilk karttan 1 buyuk olmali
    var ustKart = hedefKartlar[hedefKartlar.length - 1];
    var surukIlk = surukKartlar[0];

    return ustKart.deger === surukIlk.deger + 1;
}

// tamamlanmis seri kontrolu (K den A ya ayni takim)
function tamamlanmisSeriKontrol(kolonIdx) {
    var kartlar = kolonlar[kolonIdx];
    if (kartlar.length < 13) return;

    // son 13 kart K-A ayni takim mi?
    var son13 = kartlar.slice(kartlar.length - 13);
    var takim = son13[0].takim;

    for (var i = 0; i < 13; i++) {
        if (!son13[i].acik) return;
        if (son13[i].takim !== takim) return;
        if (son13[i].deger !== 13 - i) return; // K=13, Q=12, ... A=1
    }

    // seriyi kaldir
    kolonlar[kolonIdx].splice(kartlar.length - 13);
    tamamlanan++;
    skor += 100;

    // ustteki karti ac
    var kalan = kolonlar[kolonIdx];
    if (kalan.length > 0 && !kalan[kalan.length - 1].acik) {
        kalan[kalan.length - 1].acik = true;
    }

    masayiCiz();
    bilgiGuncelle();

    // kazanma kontrolu
    if (tamamlanan >= 8) {
        clearInterval(zamanlayici);
        setTimeout(kazanmaGoster, 500);
    }
}

// stok dagit
function stokDagit() {
    if (stok.length < 10) return;

    // bos kolon varsa dagitamazsin
    for (var i = 0; i < 10; i++) {
        if (kolonlar[i].length === 0) {
            // bos kolona uyari
            var kolonDiv = document.querySelector('[data-kolon="' + i + '"]');
            kolonDiv.style.background = 'rgba(255,100,100,0.2)';
            kolonDiv.style.borderColor = 'rgba(255,100,100,0.5)';
            setTimeout(function() {
                document.querySelectorAll('.kolon').forEach(function(k) {
                    k.style.background = '';
                    k.style.borderColor = '';
                });
            }, 800);
            return;
        }
    }

    // geri al icin kaydet
    geriAlYigini.push({ tip: 'dagitim' });

    // her kolona 1 kart dagit
    for (var i = 0; i < 10; i++) {
        var kart = stok.pop();
        kart.acik = true;
        kolonlar[i].push(kart);
    }

    hamle++;
    masayiCiz();
    bilgiGuncelle();

    // dagitimdan sonra seri kontrolu
    for (var i = 0; i < 10; i++) {
        tamamlanmisSeriKontrol(i);
    }
}

// geri al
function geriAl() {
    if (geriAlYigini.length === 0) return;
    var son = geriAlYigini.pop();

    if (son.tip === 'dagitim') {
        // dagitimi geri al - her kolondan son karti stoka geri koy
        for (var i = 9; i >= 0; i--) {
            var kart = kolonlar[i].pop();
            kart.acik = false;
            stok.push(kart);
        }
    } else {
        // hareketi geri al
        var tasinanKartlar = kolonlar[son.hedef].splice(
            kolonlar[son.hedef].length - son.kartSayisi
        );

        // kaynak kolondaki ustteki karti tekrar kapat (gerekirse)
        if (son.kaynakIdx > 0 && !son.ustKartAcikti) {
            kolonlar[son.kaynak][son.kaynakIdx - 1].acik = false;
        }

        // kartlari geri koy
        for (var i = 0; i < tasinanKartlar.length; i++) {
            kolonlar[son.kaynak].push(tasinanKartlar[i]);
        }
    }

    hamle++;
    skor = Math.max(0, skor - 5);
    masayiCiz();
    bilgiGuncelle();
}

// bilgi guncelleme
function bilgiGuncelle() {
    document.getElementById('skorText').textContent = skor;
    document.getElementById('hamleText').textContent = hamle;
    document.getElementById('tamamText').textContent = tamamlanan + '/8';
}

function sureGuncelle() {
    var dk = Math.floor(gecenSure / 60);
    var sn = gecenSure % 60;
    document.getElementById('sureText').textContent = dk + ':' + (sn < 10 ? '0' : '') + sn;
}

function kazanmaGoster() {
    document.getElementById('kazanmaEkrani').style.display = 'flex';
    document.getElementById('sonSkor').textContent = skor;
    document.getElementById('sonHamle').textContent = hamle;
    var dk = Math.floor(gecenSure / 60);
    var sn = gecenSure % 60;
    document.getElementById('sonSure').textContent = dk + ':' + (sn < 10 ? '0' : '') + sn;
}
