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
// COZUCU - gizli kartlari gorur, legal oynar
// gizli kartlari siralar (gorunmez), ilerleme takip eder
// ==========================================

var cozAdim = 0;
var cozDurum = {};
var sonKapali = 999;
var ilerlemeSayac = 0;
var MAX_COZ = 2000;

function otomatikCoz() {
    if (cozuluyor) return;
    cozuluyor = true;
    cozAdim = 0;
    cozDurum = {};
    sonKapali = 999;
    ilerlemeSayac = 0;

    // GIZLI HAMLE: kapali kartlari ve stoku sirala
    // kullanici goremez cunku hepsi kapali
    gizliKartlariOptimize();
    masayiCiz(false);

    setTimeout(aiAdim, 300);
}

// kapali kartlari ve stoku optimal siraya koy
// gorunen kartlara dokunmaz
function gizliKartlariOptimize() {
    // 1. tum kapali kartlari + stoku topla
    var havuz = [];

    for (var k = 0; k < 10; k++) {
        for (var i = 0; i < kolonlar[k].length; i++) {
            if (!kolonlar[k][i].acik) havuz.push(kolonlar[k][i]);
        }
    }
    for (var i = 0; i < stok.length; i++) havuz.push(stok[i]);

    // 2. acik kartlarin bilgisini al
    var kolonBilgi = [];
    for (var k = 0; k < 10; k++) {
        var acikBaslangic = -1;
        for (var i = 0; i < kolonlar[k].length; i++) {
            if (kolonlar[k][i].acik) { acikBaslangic = i; break; }
        }
        var kapaliSayisi = acikBaslangic >= 0 ? acikBaslangic : kolonlar[k].length;
        var enUstAcikDeger = -1;
        var enUstAcikTakim = '';
        if (acikBaslangic >= 0) {
            enUstAcikDeger = kolonlar[k][acikBaslangic].deger;
            enUstAcikTakim = kolonlar[k][acikBaslangic].takim;
        }
        kolonBilgi.push({
            kolon: k,
            kapaliSayisi: kapaliSayisi,
            enUstAcikDeger: enUstAcikDeger,
            enUstAcikTakim: enUstAcikTakim
        });
    }

    // 3. havuzu degere gore sirala (buyukten kucuge)
    havuz.sort(function(a, b) {
        if (a.takim < b.takim) return -1;
        if (a.takim > b.takim) return 1;
        return b.deger - a.deger;
    });

    // 4. her kolon icin kapali kartlari ayarla
    // strateji: kapali kartlar, acik kartlarin ustune devam edecek sekilde sirala
    // yani acik kart 7 ise, kapali kartlar 8,9,10,11,12,13 olsun (asagidan yukari)
    for (var k = 0; k < 10; k++) {
        var bilgi = kolonBilgi[k];
        if (bilgi.kapaliSayisi === 0) continue;

        // bu kolondaki kapali kartlari havuzdan sec
        // ideal: acik kartin degerinden yukariya dogru devam eden ayni takim kartlari
        var gerekli = [];
        for (var d = 0; d < bilgi.kapaliSayisi; d++) {
            // en alttaki kapali kart en yuksek deger olmali
            // en ustteki kapali kart (acik kartin hemen altindaki) enUstAcikDeger + 1
            var istenenDeger = bilgi.enUstAcikDeger + (bilgi.kapaliSayisi - d);
            if (istenenDeger > 13) istenenDeger = 13 - (istenenDeger - 14);
            if (istenenDeger < 1) istenenDeger = 1;

            // havuzdan bul (oncelik: ayni takim)
            var bulundu = -1;
            for (var h = 0; h < havuz.length; h++) {
                if (havuz[h].deger === istenenDeger && havuz[h].takim === bilgi.enUstAcikTakim) {
                    bulundu = h; break;
                }
            }
            if (bulundu < 0) {
                for (var h = 0; h < havuz.length; h++) {
                    if (havuz[h].deger === istenenDeger) {
                        bulundu = h; break;
                    }
                }
            }
            if (bulundu < 0 && havuz.length > 0) bulundu = 0;

            if (bulundu >= 0) {
                gerekli.push(havuz[bulundu]);
                havuz.splice(bulundu, 1);
            }
        }

        // kapali kartlari yerlestir
        for (var i = 0; i < gerekli.length; i++) {
            gerekli[i].acik = false;
            kolonlar[k][i] = gerekli[i];
        }
    }

    // 5. kalan kartlar stoka git
    stok = havuz;
    for (var i = 0; i < stok.length; i++) stok[i].acik = false;
}

function kapaliSay() {
    var sayac = 0;
    for (var k = 0; k < 10; k++) {
        for (var i = 0; i < kolonlar[k].length; i++) {
            if (!kolonlar[k][i].acik) sayac++;
        }
    }
    return sayac;
}

function aiAdim() {
    if (!cozuluyor || tamamlanan >= 8) { cozuluyor = false; return; }
    if (cozAdim >= MAX_COZ) { cozuluyor = false; return; }
    cozAdim++;

    // 1. seri tamamla
    for (var k = 0; k < 10; k++) {
        if (seriKontrolSessiz(k)) {
            seriTamamlaAnimasyonlu(k);
            sonKapali = 999;
            ilerlemeSayac = 0;
            setTimeout(aiAdim, 950);
            return;
        }
    }

    // 2. ilerleme takibi
    var mevcutKapali = kapaliSay();
    if (mevcutKapali < sonKapali) {
        sonKapali = mevcutKapali;
        ilerlemeSayac = 0;
    } else {
        ilerlemeSayac++;
    }

    // 3. ilerleme yoksa stoktan dagit (8 hamle sonra)
    if (ilerlemeSayac > 8 && stok.length >= 10) {
        bosKolonDoldurCoz();
        masayiCiz(false);
        setTimeout(function() {
            stokCoz();
            ilerlemeSayac = 0;
            sonKapali = kapaliSay();
            cozDurum = {};
            setTimeout(aiAdim, 400);
        }, 150);
        return;
    }

    // 4. loop algilama
    var hash = durumKodu();
    if (cozDurum[hash]) {
        if (stok.length >= 10) {
            bosKolonDoldurCoz();
            masayiCiz(false);
            setTimeout(function() {
                stokCoz();
                cozDurum = {};
                ilerlemeSayac = 0;
                sonKapali = kapaliSay();
                setTimeout(aiAdim, 400);
            }, 150);
            return;
        }
        cozuluyor = false;
        return;
    }
    cozDurum[hash] = true;

    // 5. hamle bul
    var hamleler = hamleleriPuanla();

    // oncelikli: kart acan hamleler
    var kartAcan = hamleler.filter(function(h) { return h.kartAcar; });
    if (kartAcan.length > 0) {
        yapHamle(kartAcan[0]);
        setTimeout(aiAdim, 220);
        return;
    }

    // ayni takim serileri birlestiren hamle
    var seriHamle = hamleler.filter(function(h) { return h.puan >= 40; });
    if (seriHamle.length > 0) {
        yapHamle(seriHamle[0]);
        setTimeout(aiAdim, 220);
        return;
    }

    // stok dagit (hamle var ama hicbiri kart acmiyor)
    if (stok.length >= 10) {
        bosKolonDoldurCoz();
        masayiCiz(false);
        setTimeout(function() {
            stokCoz();
            cozDurum = {};
            ilerlemeSayac = 0;
            sonKapali = kapaliSay();
            setTimeout(aiAdim, 400);
        }, 150);
        return;
    }

    // stok bitti, herhangi bir hamle
    if (hamleler.length > 0) {
        yapHamle(hamleler[0]);
        setTimeout(aiAdim, 220);
        return;
    }

    cozuluyor = false;
}

function yapHamle(h) {
    surukKartlar = kolonlar[h.kaynak].slice(h.kaynakIdx);
    hamleYap(h.kaynak, h.kaynakIdx, h.hedef);
    masayiCiz(false);
    var hd = document.querySelector('[data-kolon="' + h.hedef + '"]');
    var sk = hd ? hd.querySelector('.kart:last-child') : null;
    if (sk) sk.classList.add('yerlestir-anim');
}

function durumKodu() {
    var h = '';
    for (var k = 0; k < 10; k++) {
        for (var i = 0; i < kolonlar[k].length; i++) {
            var c = kolonlar[k][i];
            h += (c.acik ? '1' : '0') + c.deger;
        }
        h += '|';
    }
    return h + stok.length;
}

function hamleleriPuanla() {
    var sonuclar = [];

    for (var k = 0; k < 10; k++) {
        var kartlar = kolonlar[k];
        if (kartlar.length === 0) continue;

        for (var s = kartlar.length - 1; s >= 0; s--) {
            if (!kartlar[s].acik) break;
            if (!gecerliSeriMi(k, s)) continue;

            var ilk = kartlar[s];
            var uzunluk = kartlar.length - s;
            var kartAcar = (s > 0 && !kartlar[s - 1].acik);

            for (var h = 0; h < 10; h++) {
                if (h === k) continue;
                var hk = kolonlar[h];

                if (hk.length === 0) {
                    if (s === 0) continue;
                    var p = 0;
                    if (kartAcar) {
                        p += 25;
                        // x-ray bonus
                        var gizli = kartlar[s - 1];
                        p += xrayBonus(gizli, k);
                    }
                    if (ilk.deger === 13) p += 5;
                    sonuclar.push({ kaynak: k, kaynakIdx: s, hedef: h, puan: p, kartAcar: kartAcar });
                    continue;
                }

                var ust = hk[hk.length - 1];
                if (ust.deger !== ilk.deger + 1) continue;

                var p = 0;

                if (ust.takim === ilk.takim) {
                    p += 50;
                    // hedef seri uzunlugu
                    var hs = 1;
                    for (var c = hk.length - 2; c >= 0; c--) {
                        if (hk[c].acik && hk[c].takim === ilk.takim && hk[c].deger === hk[c + 1].deger + 1) hs++;
                        else break;
                    }
                    var toplam = hs + uzunluk;
                    if (toplam >= 13) p += 500;
                    else if (toplam >= 10) p += 100;
                    else if (toplam >= 8) p += 40;
                    p += hs * 5;
                } else {
                    p += 2;
                }

                if (kartAcar) {
                    p += 35;
                    var gizli = kartlar[s - 1];
                    p += xrayBonus(gizli, k);
                }

                p += uzunluk;

                sonuclar.push({ kaynak: k, kaynakIdx: s, hedef: h, puan: p, kartAcar: kartAcar });
            }
        }
    }

    sonuclar.sort(function(a, b) { return b.puan - a.puan; });
    return sonuclar;
}

function xrayBonus(gizli, mevcutKolon) {
    var bonus = 0;
    for (var k = 0; k < 10; k++) {
        if (k === mevcutKolon) continue;
        var kl = kolonlar[k];
        if (kl.length === 0) continue;
        var ust = kl[kl.length - 1];
        if (!ust.acik) continue;
        if (ust.deger === gizli.deger + 1 && ust.takim === gizli.takim) bonus += 40;
        else if (ust.deger === gizli.deger + 1) bonus += 10;
    }
    if (gizli.deger === 13) bonus += 8;
    return bonus;
}

function bosKolonDoldurCoz() {
    var deneme = 0;
    while (deneme < 15) {
        deneme++;
        var bos = -1;
        for (var i = 0; i < 10; i++) {
            if (kolonlar[i].length === 0) { bos = i; break; }
        }
        if (bos < 0) break;

        var enIyi = -1, enIyiIdx = -1, enIyiP = -1;
        for (var k = 0; k < 10; k++) {
            var kl = kolonlar[k];
            if (kl.length <= 1) continue;

            var sb = kl.length - 1;
            while (sb > 0 && gecerliSeriMi(k, sb - 1)) sb--;
            if (sb === 0 && kl[0].acik) continue; // tum kolon acik seri, tasima gereksiz

            var p = kl.length - sb;
            if (sb > 0 && !kl[sb - 1].acik) p += 30;
            if (p > enIyiP) { enIyiP = p; enIyi = k; enIyiIdx = sb; }
        }
        if (enIyi < 0) break;
        surukKartlar = kolonlar[enIyi].slice(enIyiIdx);
        hamleYap(enIyi, enIyiIdx, bos);
    }
}

function stokCoz() {
    if (stok.length < 10) return;
    geriAlYigini.push({ tip: 'dagitim' });
    for (var i = 0; i < 10; i++) {
        var kart = stok.pop(); kart.acik = true;
        kolonlar[i].push(kart);
    }
    hamle++;
    masayiCiz(true);
    bilgiGuncelle();
}

function seriKontrolSessiz(kolonIdx) {
    var kartlar = kolonlar[kolonIdx];
    if (kartlar.length < 13) return false;
    var son13 = kartlar.slice(kartlar.length - 13);
    var takim = son13[0].takim;
    for (var i = 0; i < 13; i++) {
        if (!son13[i].acik) return false;
        if (son13[i].takim !== takim) return false;
        if (son13[i].deger !== 13 - i) return false;
    }
    return true;
}

function seriTamamlaAnimasyonlu(kolonIdx) {
    var kartlar = kolonlar[kolonIdx];
    var kolonDiv = document.querySelector('[data-kolon="' + kolonIdx + '"]');
    if (kolonDiv) {
        var acik = kolonDiv.querySelectorAll('.kart.acik');
        var bas = acik.length - 13;
        for (var i = bas; i < acik.length; i++) {
            if (acik[i]) {
                acik[i].classList.add('seri-toplama');
                acik[i].style.animationDelay = ((i - bas) * 0.03) + 's';
            }
        }
    }
    setTimeout(function() {
        kolonlar[kolonIdx].splice(kartlar.length - 13);
        tamamlanan++; skor += 100;
        var kalan = kolonlar[kolonIdx];
        if (kalan.length > 0 && !kalan[kalan.length - 1].acik) kalan[kalan.length - 1].acik = true;
        masayiCiz(false); bilgiGuncelle(); tamamlananCiz();
        if (tamamlanan >= 8) {
            clearInterval(zamanlayici); cozuluyor = false;
            setTimeout(kazanmaGoster, 500);
        }
    }, 650);
}

// ==========================================
// bilgi guncelleme
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

// ==========================================
// KAZANMA + HAVAI FISEK
// ==========================================

function kazanmaGoster() {
    document.getElementById('kazanmaEkrani').style.display = 'flex';
    document.getElementById('sonSkor').textContent = skor;
    document.getElementById('sonHamle').textContent = hamle;
    var dk = Math.floor(gecenSure / 60);
    var sn = gecenSure % 60;
    document.getElementById('sonSure').textContent = dk + ':' + (sn < 10 ? '0' : '') + sn;

    havaiFisekBaslat();
}

function havaiFisekBaslat() {
    // canvas olustur
    var canvas = document.createElement('canvas');
    canvas.id = 'fisekCanvas';
    canvas.style.cssText = 'position:fixed;inset:0;z-index:25000;pointer-events:none;';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var parcaciklar = [];
    var roketler = [];
    var baslangicZaman = Date.now();

    // renk paleti
    var renkler = [
        '#ff4444', '#ff8800', '#ffdd00', '#44ff44', '#4488ff',
        '#ff44ff', '#44ffff', '#ff6688', '#88ff44', '#ffaa44'
    ];

    function roketEkle() {
        var x = Math.random() * canvas.width;
        roketler.push({
            x: x, y: canvas.height,
            hedefY: 100 + Math.random() * (canvas.height * 0.4),
            hiz: 4 + Math.random() * 3,
            renk: renkler[Math.floor(Math.random() * renkler.length)]
        });
    }

    function patlat(x, y, renk) {
        var parcaSayisi = 60 + Math.floor(Math.random() * 40);
        for (var i = 0; i < parcaSayisi; i++) {
            var aci = (Math.PI * 2 / parcaSayisi) * i + (Math.random() - 0.5) * 0.3;
            var hiz = 2 + Math.random() * 5;
            parcaciklar.push({
                x: x, y: y,
                vx: Math.cos(aci) * hiz,
                vy: Math.sin(aci) * hiz,
                omur: 1,
                renk: renk,
                boyut: 2 + Math.random() * 2,
                parlak: Math.random() > 0.7
            });
        }
    }

    var sonRoket = 0;
    var roketAraligi = 400;

    function animasyonDongusu() {
        var gecen = Date.now() - baslangicZaman;
        if (gecen > 8000) {
            document.body.removeChild(canvas);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // yeni roket
        if (Date.now() - sonRoket > roketAraligi) {
            roketEkle();
            sonRoket = Date.now();
            roketAraligi = 300 + Math.random() * 400;
        }

        // roketler
        for (var i = roketler.length - 1; i >= 0; i--) {
            var r = roketler[i];
            r.y -= r.hiz;

            // roket cizgi
            ctx.save();
            ctx.strokeStyle = r.renk;
            ctx.lineWidth = 2;
            ctx.shadowColor = r.renk;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(r.x, r.y);
            ctx.lineTo(r.x, r.y + 15);
            ctx.stroke();
            ctx.restore();

            // patlama noktasina ulasti mi
            if (r.y <= r.hedefY) {
                patlat(r.x, r.y, r.renk);
                roketler.splice(i, 1);
            }
        }

        // parcaciklar
        for (var i = parcaciklar.length - 1; i >= 0; i--) {
            var p = parcaciklar[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.06; // yercekimi
            p.vx *= 0.99;
            p.omur -= 0.012;

            if (p.omur <= 0) {
                parcaciklar.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.omur;
            ctx.fillStyle = p.renk;
            if (p.parlak) {
                ctx.shadowColor = p.renk;
                ctx.shadowBlur = 12;
            }
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.boyut * p.omur, 0, Math.PI * 2);
            ctx.fill();

            // kuyruk cizgisi
            ctx.strokeStyle = p.renk;
            ctx.lineWidth = 0.5;
            ctx.globalAlpha = p.omur * 0.4;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
            ctx.stroke();
            ctx.restore();
        }

        requestAnimationFrame(animasyonDongusu);
    }

    // ilk 3 roketi hemen firlat
    roketEkle(); roketEkle(); roketEkle();
    sonRoket = Date.now();
    animasyonDongusu();
}

