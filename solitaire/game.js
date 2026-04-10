// spider solitaire - animasyonlu + otomatik cozucu
// surukle birak, 3 zorluk, geri al, auto-solve

var DEGER_ADLARI = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
var TAKIM_SEMBOL = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };
var TAKIM_RENK = { spades: 'siyah', hearts: 'kirmizi', diamonds: 'kirmizi', clubs: 'siyah' };

var kolonlar = [];
var stok = [];
var tamamlanan = 0;
var skor = 500;
var hamle = 0;
var gecenSure = 0;
var zamanlayici = null;
var zorluk = 1;
var geriAlYigini = [];
var cozuluyor = false; // otomatik cozucu calisiyor mu

// surukle
var surukAktif = false;
var surukKartlar = [];
var surukKaynakKolon = -1;
var surukKaynakIdx = -1;
var surukDiv = null;
var fareOffsetX = 0, fareOffsetY = 0;

window.addEventListener('DOMContentLoaded', function() {
    kolonlariOlustur();
    yeniOyun();
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
    clearInterval(zamanlayici);
    cozuluyor = false;
    skor = 500; hamle = 0; gecenSure = 0; tamamlanan = 0;
    geriAlYigini = [];

    var takimlar;
    if (zorluk === 1) takimlar = ['spades'];
    else if (zorluk === 2) takimlar = ['spades', 'hearts'];
    else takimlar = ['spades', 'hearts', 'diamonds', 'clubs'];

    // 104 kart olustur
    var deste = [];
    var tekrar = 8 / takimlar.length;
    for (var t = 0; t < takimlar.length; t++) {
        for (var k = 0; k < tekrar; k++) {
            for (var d = 1; d <= 13; d++) {
                deste.push({ takim: takimlar[t], deger: d, acik: false });
            }
        }
    }

    // karistir (fisher-yates)
    for (var i = deste.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = deste[i]; deste[i] = deste[j]; deste[j] = tmp;
    }

    // dagit
    kolonlar = [];
    for (var i = 0; i < 10; i++) kolonlar.push([]);

    var idx = 0;
    for (var i = 0; i < 10; i++) {
        var adet = (i < 4) ? 6 : 5;
        for (var k = 0; k < adet; k++) {
            var kart = deste[idx++];
            kart.acik = (k === adet - 1);
            kolonlar[i].push(kart);
        }
    }

    stok = deste.slice(idx);

    zamanlayici = setInterval(function() {
        gecenSure++;
        sureGuncelle();
    }, 1000);

    document.getElementById('kazanmaEkrani').style.display = 'none';

    // animasyonlu dagitim
    masayiCiz(true);
    bilgiGuncelle();
}

// ==========================================
// cizim
// ==========================================

function masayiCiz(animasyonlu) {
    for (var k = 0; k < 10; k++) kolonCiz(k, animasyonlu);
    stokCiz();
    tamamlananCiz();
}

function kolonCiz(kolonIdx, animasyonlu) {
    var kolonDiv = document.querySelector('[data-kolon="' + kolonIdx + '"]');
    kolonDiv.innerHTML = '';

    var kartlar = kolonlar[kolonIdx];
    for (var i = 0; i < kartlar.length; i++) {
        var kart = kartlar[i];
        var div = document.createElement('div');

        // offset hesapla
        var offset = 0;
        for (var j = 0; j < i; j++) {
            offset += kartlar[j].acik ? 32 : 16;
        }
        div.style.top = offset + 'px';
        div.style.zIndex = i + 1;

        if (kart.acik) {
            var renk = TAKIM_RENK[kart.takim];
            var sembol = TAKIM_SEMBOL[kart.takim];
            var ad = DEGER_ADLARI[kart.deger];

            div.className = 'kart acik ' + renk;
            div.innerHTML =
                '<span class="kart-ust">' + ad + '<span class="kart-ust-takim">' + sembol + '</span></span>' +
                '<span class="kart-merkez">' + sembol + '</span>' +
                '<span class="kart-alt">' + ad + '<span class="kart-alt-takim">' + sembol + '</span></span>';

            div.setAttribute('data-kolon', kolonIdx);
            div.setAttribute('data-sira', i);
            div.addEventListener('mousedown', surukBaslat);
            div.addEventListener('touchstart', dokunmaBaslat);

            // animasyon
            if (animasyonlu) {
                div.classList.add('dagitim-anim');
                div.style.animationDelay = (kolonIdx * 0.03 + i * 0.02) + 's';
            }
        } else {
            div.className = 'kart kapali';
            if (animasyonlu) {
                div.classList.add('dagitim-anim');
                div.style.animationDelay = (kolonIdx * 0.03 + i * 0.02) + 's';
            }
        }

        kolonDiv.appendChild(div);
    }

    // kolon yüksekligi
    var h = 0;
    for (var j = 0; j < kartlar.length; j++) h += kartlar[j].acik ? 32 : 16;
    kolonDiv.style.minHeight = Math.max(170, h + 130) + 'px';
}

function stokCiz() {
    var gorsel = document.getElementById('stokGorsel');
    gorsel.innerHTML = '';
    var dagitim = Math.floor(stok.length / 10);
    for (var i = 0; i < dagitim; i++) {
        var mini = document.createElement('div');
        mini.className = 'stok-mini';
        gorsel.appendChild(mini);
    }
    document.getElementById('stokSayac').textContent =
        dagitim > 0 ? dagitim + ' dağıtım kaldı' : 'stok bitti';
}

function tamamlananCiz() {
    var alan = document.getElementById('tamamlananAlan');
    alan.innerHTML = '';
    for (var i = 0; i < tamamlanan; i++) {
        var div = document.createElement('div');
        div.className = 'tamamlanan-seri';
        div.innerHTML = '♠<small>K → A</small>';
        alan.appendChild(div);
    }
}

// ==========================================
// surukle birak
// ==========================================

function surukBaslat(e) {
    if (cozuluyor) return;
    e.preventDefault();
    suruklemeyiBaslat(
        parseInt(this.getAttribute('data-kolon')),
        parseInt(this.getAttribute('data-sira')),
        e.clientX, e.clientY
    );
}

function dokunmaBaslat(e) {
    if (cozuluyor) return;
    e.preventDefault();
    var t = e.touches[0];
    suruklemeyiBaslat(
        parseInt(this.getAttribute('data-kolon')),
        parseInt(this.getAttribute('data-sira')),
        t.clientX, t.clientY
    );
}

function suruklemeyiBaslat(kolonIdx, sira, x, y) {
    if (!gecerliSeriMi(kolonIdx, sira)) return;

    surukAktif = true;
    surukKaynakKolon = kolonIdx;
    surukKaynakIdx = sira;
    surukKartlar = kolonlar[kolonIdx].slice(sira);

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
            '<span class="kart-ust">' + ad + '<span class="kart-ust-takim">' + sembol + '</span></span>' +
            '<span class="kart-merkez">' + sembol + '</span>' +
            '<span class="kart-alt">' + ad + '<span class="kart-alt-takim">' + sembol + '</span></span>';
        surukDiv.appendChild(div);
    }

    fareOffsetX = 52;
    fareOffsetY = 20;
    surukDiv.style.left = (x - fareOffsetX) + 'px';
    surukDiv.style.top = (y - fareOffsetY) + 'px';

    // kaynak kartlari soluklas
    var kolonDiv = document.querySelector('[data-kolon="' + kolonIdx + '"]');
    var kartDivler = kolonDiv.querySelectorAll('.kart.acik');
    kartDivler.forEach(function(kd) {
        var s = parseInt(kd.getAttribute('data-sira'));
        if (s >= sira) kd.classList.add('surukleniyor');
    });
}

function fareTasi(e) {
    if (!surukAktif || !surukDiv) return;
    surukDiv.style.left = (e.clientX - fareOffsetX) + 'px';
    surukDiv.style.top = (e.clientY - fareOffsetY) + 'px';
    hedefVurgula(e.clientX, e.clientY);
}

function dokunmaTasi(e) {
    if (!surukAktif) return;
    e.preventDefault();
    var t = e.touches[0];
    surukDiv.style.left = (t.clientX - fareOffsetX) + 'px';
    surukDiv.style.top = (t.clientY - fareOffsetY) + 'px';
    hedefVurgula(t.clientX, t.clientY);
}

function fareBirak(e) { if (surukAktif) birak(e.clientX, e.clientY); }
function dokunmaBirak(e) { if (surukAktif) birak(e.changedTouches[0].clientX, e.changedTouches[0].clientY); }

function hedefVurgula(x, y) {
    document.querySelectorAll('.kolon').forEach(function(k) { k.classList.remove('hedef-gecerli'); });
    var h = hedefKolonBul(x, y);
    if (h >= 0 && h !== surukKaynakKolon && birakGecerliMi(h)) {
        document.querySelector('[data-kolon="' + h + '"]').classList.add('hedef-gecerli');
    }
}

function birak(x, y) {
    document.querySelectorAll('.kolon').forEach(function(k) { k.classList.remove('hedef-gecerli'); });
    var hedef = hedefKolonBul(x, y);

    if (hedef >= 0 && hedef !== surukKaynakKolon && birakGecerliMi(hedef)) {
        hamleYap(surukKaynakKolon, surukKaynakIdx, hedef);
    }

    if (surukDiv) { document.body.removeChild(surukDiv); surukDiv = null; }
    surukAktif = false;
    surukKartlar = [];
    masayiCiz(false);
}

function hedefKolonBul(x, y) {
    var divler = document.querySelectorAll('.kolon');
    for (var i = 0; i < divler.length; i++) {
        var r = divler[i].getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return i;
    }
    return -1;
}

// ==========================================
// oyun mantigi
// ==========================================

function gecerliSeriMi(kolonIdx, baslangic) {
    var kartlar = kolonlar[kolonIdx];
    if (!kartlar[baslangic] || !kartlar[baslangic].acik) return false;
    for (var i = baslangic; i < kartlar.length - 1; i++) {
        if (kartlar[i].takim !== kartlar[i + 1].takim) return false;
        if (kartlar[i].deger !== kartlar[i + 1].deger + 1) return false;
    }
    return true;
}

function birakGecerliMi(hedefKolon) {
    var hk = kolonlar[hedefKolon];
    if (hk.length === 0) return true;
    return hk[hk.length - 1].deger === surukKartlar[0].deger + 1;
}

function hamleYap(kaynakKolon, kaynakIdx, hedefKolon) {
    var tasinanlar = kolonlar[kaynakKolon].splice(kaynakIdx);

    // geri al kaydı
    var ustAcik = false;
    if (kaynakIdx > 0) ustAcik = kolonlar[kaynakKolon][kaynakIdx - 1].acik;

    geriAlYigini.push({
        kaynak: kaynakKolon,
        hedef: hedefKolon,
        kartSayisi: tasinanlar.length,
        kaynakIdx: kaynakIdx,
        ustKartAcikti: ustAcik
    });

    for (var i = 0; i < tasinanlar.length; i++) {
        kolonlar[hedefKolon].push(tasinanlar[i]);
    }

    // kaynak ustteki karti ac
    var kaynak = kolonlar[kaynakKolon];
    if (kaynak.length > 0 && !kaynak[kaynak.length - 1].acik) {
        kaynak[kaynak.length - 1].acik = true;
    }

    hamle++;
    skor = Math.max(0, skor - 1);

    tamamlanmisSeriKontrol(hedefKolon);
    bilgiGuncelle();
}

function tamamlanmisSeriKontrol(kolonIdx) {
    var kartlar = kolonlar[kolonIdx];
    if (kartlar.length < 13) return false;

    var son13 = kartlar.slice(kartlar.length - 13);
    var takim = son13[0].takim;

    for (var i = 0; i < 13; i++) {
        if (!son13[i].acik) return false;
        if (son13[i].takim !== takim) return false;
        if (son13[i].deger !== 13 - i) return false;
    }

    // seri toplama animasyonu
    var kolonDiv = document.querySelector('[data-kolon="' + kolonIdx + '"]');
    var acikKartlar = kolonDiv.querySelectorAll('.kart.acik');
    var sonKartlar = [];
    for (var i = acikKartlar.length - 13; i < acikKartlar.length; i++) {
        if (acikKartlar[i]) sonKartlar.push(acikKartlar[i]);
    }
    sonKartlar.forEach(function(k, i) {
        k.classList.add('seri-toplama');
        k.style.animationDelay = (i * 0.04) + 's';
    });

    // kisa bir bekledikten sonra kaldir
    setTimeout(function() {
        kolonlar[kolonIdx].splice(kartlar.length - 13);
        tamamlanan++;
        skor += 100;

        var kalan = kolonlar[kolonIdx];
        if (kalan.length > 0 && !kalan[kalan.length - 1].acik) {
            kalan[kalan.length - 1].acik = true;
        }

        masayiCiz(false);
        bilgiGuncelle();

        if (tamamlanan >= 8) {
            clearInterval(zamanlayici);
            setTimeout(function() { kazanmaGoster(); }, 300);
        }
    }, 650);

    return true;
}

// stok dagit
function stokDagit() {
    if (cozuluyor) return;
    if (stok.length < 10) return;

    // bos kolon kontrolu
    for (var i = 0; i < 10; i++) {
        if (kolonlar[i].length === 0) {
            var kd = document.querySelector('[data-kolon="' + i + '"]');
            kd.classList.add('bos-uyari');
            setTimeout(function() {
                document.querySelectorAll('.kolon').forEach(function(k) { k.classList.remove('bos-uyari'); });
            }, 800);
            return;
        }
    }

    geriAlYigini.push({ tip: 'dagitim' });

    for (var i = 0; i < 10; i++) {
        var kart = stok.pop();
        kart.acik = true;
        kolonlar[i].push(kart);
    }

    hamle++;
    masayiCiz(true); // animasyonlu dagitim
    bilgiGuncelle();

    setTimeout(function() {
        for (var i = 0; i < 10; i++) tamamlanmisSeriKontrol(i);
    }, 400);
}

// geri al
function geriAl() {
    if (geriAlYigini.length === 0 || cozuluyor) return;
    var son = geriAlYigini.pop();

    if (son.tip === 'dagitim') {
        for (var i = 9; i >= 0; i--) {
            var kart = kolonlar[i].pop();
            kart.acik = false;
            stok.push(kart);
        }
    } else {
        var tasinan = kolonlar[son.hedef].splice(kolonlar[son.hedef].length - son.kartSayisi);
        if (son.kaynakIdx > 0 && !son.ustKartAcikti) {
            kolonlar[son.kaynak][son.kaynakIdx - 1].acik = false;
        }
        for (var i = 0; i < tasinan.length; i++) kolonlar[son.kaynak].push(tasinan[i]);
    }

    hamle++;
    skor = Math.max(0, skor - 5);
    masayiCiz(false);
    bilgiGuncelle();
}

// ==========================================
// TANRI MODU - tum kartlari gorur, kesin bitirir
// faz 1: stogu bosalt
// faz 2: kapali kartlari ac
// faz 3: tum kartlari topla ve sirala
// faz 4: serileri tek tek tamamla
// ==========================================

var cozFazSayac = 0;

function otomatikCoz() {
    if (cozuluyor) return;
    cozuluyor = true;
    cozFazSayac = 0;
    cozFaz1();
}

// faz 1 - stogu bosalt (animasyonlu)
function cozFaz1() {
    if (!cozuluyor) return;

    if (stok.length >= 10) {
        // bos kolon varsa doldur
        var bosVar = false;
        for (var i = 0; i < 10; i++) {
            if (kolonlar[i].length === 0) { bosVar = true; break; }
        }

        if (bosVar) {
            // herhangi bir dolu kolondan bos kolona tasi
            for (var i = 0; i < 10; i++) {
                if (kolonlar[i].length === 0) {
                    // en yakindaki dolu kolondan 1 kart al
                    for (var j = 0; j < 10; j++) {
                        if (kolonlar[j].length > 1) {
                            var kart = kolonlar[j].pop();
                            kart.acik = true;
                            kolonlar[i].push(kart);
                            break;
                        }
                    }
                }
            }
            masayiCiz(false);
        }

        // dagit
        geriAlYigini.push({ tip: 'dagitim' });
        for (var i = 0; i < 10; i++) {
            var kart = stok.pop();
            kart.acik = true;
            kolonlar[i].push(kart);
        }
        hamle++;
        masayiCiz(true);
        bilgiGuncelle();

        setTimeout(cozFaz1, 350);
        return;
    }

    // stok bitti, faz 2
    setTimeout(cozFaz2, 400);
}

// faz 2 - tum kapali kartlari ac (dramatik acilis)
function cozFaz2() {
    if (!cozuluyor) return;

    for (var k = 0; k < 10; k++) {
        for (var i = 0; i < kolonlar[k].length; i++) {
            kolonlar[k][i].acik = true;
        }
    }
    masayiCiz(true); // dagitim animasyonuyla hepsi gorunur
    setTimeout(cozFaz3, 700);
}

// faz 3 - tum kartlari topla, sirala, 8 seri olustur
function cozFaz3() {
    if (!cozuluyor) return;

    // tum kartlari tek havuzda topla
    var tumKartlar = [];
    for (var k = 0; k < 10; k++) {
        while (kolonlar[k].length > 0) tumKartlar.push(kolonlar[k].pop());
    }
    // stokta kalan varsa onlari da al
    while (stok.length > 0) tumKartlar.push(stok.pop());

    // takima gore grupla, sonra degere gore azalan sirala
    tumKartlar.sort(function(a, b) {
        if (a.takim < b.takim) return -1;
        if (a.takim > b.takim) return 1;
        return b.deger - a.deger; // K=13, Q=12, ..., A=1
    });

    // 8 tane 13'lu seri olustur
    for (var s = 0; s < 8; s++) {
        kolonlar[s] = [];
        for (var i = 0; i < 13; i++) {
            var kart = tumKartlar[s * 13 + i];
            kart.acik = true;
            kolonlar[s].push(kart);
        }
    }
    kolonlar[8] = [];
    kolonlar[9] = [];

    masayiCiz(true); // siralanmis hali goster
    cozFazSayac = 0;
    setTimeout(cozFaz4, 900);
}

// faz 4 - serileri tek tek tamamla (patir patir)
function cozFaz4() {
    if (!cozuluyor) return;
    if (cozFazSayac >= 8) {
        cozuluyor = false;
        return;
    }

    var kolonIdx = cozFazSayac;

    // seri gecerli mi kontrol
    var kartlar = kolonlar[kolonIdx];
    if (kartlar.length >= 13) {
        var gecerli = true;
        var son13 = kartlar.slice(kartlar.length - 13);
        var takim = son13[0].takim;
        for (var i = 0; i < 13; i++) {
            if (son13[i].takim !== takim || son13[i].deger !== 13 - i) {
                gecerli = false; break;
            }
        }

        if (gecerli) {
            // seri toplama animasyonu goster
            var kolonDiv = document.querySelector('[data-kolon="' + kolonIdx + '"]');
            if (kolonDiv) {
                var acikKartlar = kolonDiv.querySelectorAll('.kart.acik');
                for (var i = 0; i < acikKartlar.length; i++) {
                    acikKartlar[i].classList.add('seri-toplama');
                    acikKartlar[i].style.animationDelay = (i * 0.04) + 's';
                }
            }

            // kartlari kaldir
            setTimeout(function() {
                kolonlar[kolonIdx].splice(0, 13);
                tamamlanan++;
                skor += 100;
                masayiCiz(false);
                bilgiGuncelle();

                if (tamamlanan >= 8) {
                    clearInterval(zamanlayici);
                    cozuluyor = false;
                    setTimeout(kazanmaGoster, 400);
                    return;
                }
            }, 600);
        }
    }

    cozFazSayac++;
    setTimeout(cozFaz4, 850);
}

// ==========================================
// bilgi ve kazanma
// ==========================================

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

    // konfeti
    konfetiBaslat();
}

function konfetiBaslat() {
    var renkler = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316'];
    for (var i = 0; i < 80; i++) {
        var parca = document.createElement('div');
        parca.className = 'konfeti-parca';
        parca.style.left = Math.random() * 100 + 'vw';
        parca.style.top = -10 + 'px';
        parca.style.background = renkler[Math.floor(Math.random() * renkler.length)];
        parca.style.animationDelay = (Math.random() * 2) + 's';
        parca.style.animationDuration = (2 + Math.random() * 2) + 's';
        parca.style.width = (6 + Math.random() * 8) + 'px';
        parca.style.height = (6 + Math.random() * 8) + 'px';
        document.body.appendChild(parca);

        // belirli sure sonra kaldir
        (function(p) {
            setTimeout(function() { if (p.parentNode) p.parentNode.removeChild(p); }, 5000);
        })(parca);
    }
}
