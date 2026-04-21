// yazı hızı testi

var cumleler = [
    'türkiye güzel bir ülkedir ve dört mevsimi aynı anda yaşayabilirsiniz',
    'programlama öğrenmek sabır ve pratik gerektiren bir süreçtir',
    'her gün en az bir saat kod yazmak sizi daha iyi bir geliştirici yapar',
    'web geliştirme html css ve javascript üçlüsü üzerine kuruludur',
    'yapay zeka günümüzde hayatın her alanında kullanılmaya başlandı',
    'bir projede en önemli şey planlama ve doğru mimari seçimidir',
    'açık kaynak yazılımlar dünyayı daha iyi bir yer haline getiriyor',
    'mobil uygulamalar günlük hayatımızın vazgeçilmez bir parçası oldu',
    'siber güvenlik dijital çağın en kritik konularından biridir',
    'bulut bilişim sayesinde verilerimize her yerden erişebiliyoruz',
    'veri tabanı yönetimi her yazılımcının bilmesi gereken temel bir beceridir',
    'iyi bir kullanıcı arayüzü tasarımı kullanıcı deneyimini doğrudan etkiler',
    'git versiyon kontrol sistemi ekip çalışmasında hayat kurtarır',
    'algoritma ve veri yapıları yazılım mühendisliğinin temelidir',
    'responsive tasarım sayesinde web siteleri her cihazda düzgün görünür',
    'test yazmak kodunuzun güvenilirliğini ve kalitesini artırır',
    'performans optimizasyonu kullanıcı memnuniyetini doğrudan etkiler',
    'temiz kod yazmak hem kendiniz hem ekibiniz için çok önemlidir',
    'her programcı en az bir kere unutulmuş noktalı virgül hatası almıştır',
    'kahve ve müzik eşliğinde kod yazmak verimliliği artırır',
    'sabah erken kalkmak günün geri kalanını daha verimli geçirmenizi sağlar',
    'kod yazarken düzenli mola vermek yaratıcılığınızı artırır'
];

var seciliSure = 30;
var kalanSure, zamanlayici;
var basladi = false;
var bitti = false;
var anlikIndex = 0;
var dogruSayisi = 0;
var hataSayisi = 0;
var toplamKarakter = 0;
var aktifMetin = '';
var enIyiWpm = parseInt(localStorage.getItem('yazihizi-eniyi') || '0');

document.getElementById('enIyi').textContent = enIyiWpm;

// süre seçimi
document.querySelectorAll('.sure-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        if (basladi) return;
        document.querySelectorAll('.sure-btn').forEach(function(b) { b.classList.remove('aktif'); });
        btn.classList.add('aktif');
        seciliSure = parseInt(btn.getAttribute('data-sure'));
        document.getElementById('sayac').textContent = seciliSure;
    });
});

// başlangıçta metin hazırla
hazirla();

function hazirla() {
    basladi = false;
    bitti = false;
    anlikIndex = 0;
    dogruSayisi = 0;
    hataSayisi = 0;
    toplamKarakter = 0;
    kalanSure = seciliSure;
    clearInterval(zamanlayici);

    document.getElementById('sayac').textContent = seciliSure;
    document.getElementById('wpm').textContent = '0';
    document.getElementById('dogruluk').textContent = '100';
    document.getElementById('hata').textContent = '0';
    document.getElementById('sonucEkrani').style.display = 'none';

    // rastgele cümleler seç ve birleştir
    var karisik = cumleler.slice().sort(function() { return Math.random() - 0.5; });
    aktifMetin = karisik.slice(0, 4).join(' ');

    // harfleri span olarak ekle
    var alan = document.getElementById('metinAlan');
    alan.innerHTML = '';
    for (var i = 0; i < aktifMetin.length; i++) {
        var span = document.createElement('span');
        span.className = 'harf bekliyor';
        span.textContent = aktifMetin[i];
        if (i === 0) span.classList.add('aktif');
        alan.appendChild(span);
    }

    var input = document.getElementById('yaziInput');
    input.value = '';
    input.disabled = false;
    input.focus();
}

// input dinle
document.getElementById('yaziInput').addEventListener('input', function(e) {
    if (bitti) return;

    // ilk harf yazıldığında sayaç başla
    if (!basladi) {
        basladi = true;
        zamanlayici = setInterval(function() {
            kalanSure--;
            document.getElementById('sayac').textContent = kalanSure;
            if (kalanSure <= 0) {
                bitir();
            }
        }, 1000);
    }

    var girilen = this.value;
    var harfler = document.querySelectorAll('#metinAlan .harf');

    // her harfi kontrol et
    for (var i = 0; i < harfler.length; i++) {
        if (i < girilen.length) {
            if (girilen[i] === aktifMetin[i]) {
                harfler[i].className = 'harf dogru';
            } else {
                harfler[i].className = 'harf yanlis';
            }
        } else if (i === girilen.length) {
            harfler[i].className = 'harf bekliyor aktif';
        } else {
            harfler[i].className = 'harf bekliyor';
        }
    }

    anlikIndex = girilen.length;

    // anlık istatistik güncelle
    var dogru = 0;
    var toplam = girilen.length;
    for (var j = 0; j < toplam; j++) {
        if (girilen[j] === aktifMetin[j]) dogru++;
    }
    var hata = toplam - dogru;

    document.getElementById('hata').textContent = hata;

    var oran = toplam > 0 ? Math.round((dogru / toplam) * 100) : 100;
    document.getElementById('dogruluk').textContent = oran;

    // wpm hesapla
    var gecenSure = seciliSure - kalanSure;
    if (gecenSure > 0) {
        var kelimeSayisi = dogru / 5; // standart: 5 karakter = 1 kelime
        var wpm = Math.round((kelimeSayisi / gecenSure) * 60);
        document.getElementById('wpm').textContent = wpm;
    }

    // metin bittiyse
    if (girilen.length >= aktifMetin.length) {
        bitir();
    }
});

function bitir() {
    bitti = true;
    basladi = false;
    clearInterval(zamanlayici);

    var input = document.getElementById('yaziInput');
    input.disabled = true;
    var girilen = input.value;

    // sonuçları hesapla
    var dogru = 0;
    for (var i = 0; i < girilen.length; i++) {
        if (girilen[i] === aktifMetin[i]) dogru++;
    }
    var hata = girilen.length - dogru;
    var oran = girilen.length > 0 ? Math.round((dogru / girilen.length) * 100) : 0;
    var gecenSure = seciliSure - kalanSure;
    if (gecenSure < 1) gecenSure = 1;
    var wpm = Math.round(((dogru / 5) / gecenSure) * 60);

    // sonuç ekranını göster
    document.getElementById('sonWpm').textContent = wpm;
    document.getElementById('sonDogruluk').textContent = oran;
    document.getElementById('sonKarakter').textContent = girilen.length;
    document.getElementById('sonHata').textContent = hata;
    document.getElementById('sonucEkrani').style.display = 'block';

    // en iyi skor
    if (wpm > enIyiWpm) {
        enIyiWpm = wpm;
        localStorage.setItem('yazihizi-eniyi', enIyiWpm);
        document.getElementById('enIyi').textContent = enIyiWpm;
    }
}

function tekrarBasla() {
    hazirla();
}

// sayfa açılınca input'a focusla
document.getElementById('yaziInput').focus();
