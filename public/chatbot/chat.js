// basit sohbet botu
// kalıp eşleştirme ile çalışıyor

var mesajlarDiv = document.getElementById('mesajlar');
var yaziyorDiv = document.getElementById('yaziyor');
var koyu = true;

// bot yanıt veritabanı
var yanitlar = {
    selamlama: [
        'selam! nasıl yardımcı olabilirim?',
        'merhaba! bugün nasıl bir gün geçiriyorsun?',
        'hey! sana nasıl yardım edebilirim?'
    ],
    nasilsin: [
        'ben bir botum ama sanırım iyiyim 😄',
        'harika hissediyorum! sen nasılsın?',
        'her zamanki gibi, kodların arasında takılıyorum'
    ],
    isim: [
        'benim adım t4lhBot, talha tarafından yapıldım!',
        't4lhBot diyebilirsin bana'
    ],
    hava: [
        'hava durumunu hava durumu projemden kontrol edebilirsin! havadurumu/index.html',
        'pencereden bakmayı denedin mi? 😄 şaka şaka, havadurumu projemize göz at!'
    ],
    tesekkur: [
        'rica ederim! 😊',
        'ne demek, her zaman!',
        'yardımcı olabildiysem ne mutlu bana'
    ],
    elveda: [
        'görüşürüz! iyi günler 👋',
        'hoşça kal! tekrar gel ama',
        'bay bay! kendine iyi bak'
    ],
    espri: [
        'neden programcılar gözlük takar? çünkü C# yapamıyorlar 😄',
        'bir bug bar\'a girmiş. barmen demiş ki: "burası senin için uygun değil, lütfen git". bug demiş: "zaten gitmiyorum ki, o yüzden burdayım"',
        'HTML bir programlama dili midir? bu soru yüzünden kaç dostluk bitti bilmiyorum',
        'javascript\'te == ve === arasındaki fark nedir? birisi "belki eşittir" diğeri "kesin eşittir"'
    ],
    yardim: [
        'şunları sorabilirsin:\n- "nasılsın"\n- "adın ne"\n- "hava nasıl"\n- "espri yap"\n- "matematik: 2+2"\n- veya herhangi bir şey!'
    ],
    bilinmiyor: [
        'hmm bunu tam anlayamadım, başka bir şekilde sormayı dener misin?',
        'ilginç bir soru ama cevabını bilmiyorum 🤔',
        'bu konuda pek bilgim yok, ama öğrenmeye açığım!',
        'bunu anlamak için daha çok eğitilmem lazım galiba 😄'
    ]
};

// sayfa açılınca karşılama
window.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        botMesajEkle('merhaba! ben t4lhBot 🤖\nsize nasıl yardımcı olabilirim?\n"yardım" yazarak neler yapabileceğimi görebilirsin');
    }, 500);
});

// form gönder
document.getElementById('mesajForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var input = document.getElementById('mesajInput');
    var metin = input.value.trim();
    if (!metin) return;

    kullaniciMesajEkle(metin);
    input.value = '';

    // yazıyor göster
    yaziyorDiv.style.display = 'flex';
    mesajlarDiv.scrollTop = mesajlarDiv.scrollHeight;

    // biraz bekleyip cevap ver (gerçekçi hissettirmek için)
    var bekleme = 600 + Math.random() * 800;
    setTimeout(function() {
        yaziyorDiv.style.display = 'none';
        var cevap = cevapBul(metin);
        botMesajEkle(cevap);
    }, bekleme);
});

function kullaniciMesajEkle(metin) {
    var div = document.createElement('div');
    div.className = 'mesaj kullanici';
    div.innerHTML = metin + '<span class="zaman">' + saatAl() + '</span>';
    mesajlarDiv.appendChild(div);
    mesajlarDiv.scrollTop = mesajlarDiv.scrollHeight;
}

function botMesajEkle(metin) {
    var div = document.createElement('div');
    div.className = 'mesaj bot';
    div.innerHTML = metin.replace(/\n/g, '<br>') + '<span class="zaman">' + saatAl() + '</span>';
    mesajlarDiv.appendChild(div);
    mesajlarDiv.scrollTop = mesajlarDiv.scrollHeight;
}

function saatAl() {
    var simdi = new Date();
    var saat = simdi.getHours().toString().padStart(2, '0');
    var dakika = simdi.getMinutes().toString().padStart(2, '0');
    return saat + ':' + dakika;
}

// cevap bulma - kalıp eşleştirme
function cevapBul(metin) {
    var kucuk = metin.toLowerCase().replace(/[?!.,]/g, '');

    // selamlama
    if (/^(merhaba|selam|hey|naber|sa|selamun|slm)/.test(kucuk)) {
        return rastgele(yanitlar.selamlama);
    }

    // nasılsın
    if (/nasıl(sın|sin)|naber|ne haber|iyi misin/.test(kucuk)) {
        return rastgele(yanitlar.nasilsin);
    }

    // isim
    if (/adın ne|ismin ne|sen kimsin|kim(sin| olduğun)/.test(kucuk)) {
        return rastgele(yanitlar.isim);
    }

    // hava
    if (/hava|sıcaklık|yağmur|kar|güneş/.test(kucuk)) {
        return rastgele(yanitlar.hava);
    }

    // teşekkür
    if (/teşekkür|sağ ol|eyvallah|tesekkur|tşk/.test(kucuk)) {
        return rastgele(yanitlar.tesekkur);
    }

    // elveda
    if (/hoşça kal|görüşürüz|bye|bb|bay bay|güle güle/.test(kucuk)) {
        return rastgele(yanitlar.elveda);
    }

    // espri
    if (/espri|şaka|komik|fıkra|güldür/.test(kucuk)) {
        return rastgele(yanitlar.espri);
    }

    // yardım
    if (/yardım|help|ne yapabilirsin|komutlar/.test(kucuk)) {
        return rastgele(yanitlar.yardim);
    }

    // matematik
    if (/^matematik:|^hesapla:/.test(kucuk) || /^\d+[\s]*[+\-*/][\s]*\d+$/.test(kucuk.trim())) {
        return matematikCoz(kucuk);
    }

    // saat
    if (/saat kaç|saat ne/.test(kucuk)) {
        return 'şu an saat ' + saatAl() + ' ⏰';
    }

    // tarih
    if (/bugün ne|tarih|gün ne/.test(kucuk)) {
        var bugun = new Date();
        var gunler = ['pazar', 'pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma', 'cumartesi'];
        return 'bugün ' + gunler[bugun.getDay()] + ', ' + bugun.toLocaleDateString('tr-TR');
    }

    return rastgele(yanitlar.bilinmiyor);
}

function matematikCoz(metin) {
    try {
        var ifade = metin.replace(/matematik:|hesapla:/g, '').trim();
        // güvenlik: sadece sayı ve operatör
        if (!/^[\d\s+\-*/().]+$/.test(ifade)) return 'geçerli bir matematik ifadesi yaz';
        var sonuc = Function('"use strict"; return (' + ifade + ')')();
        return ifade + ' = ' + sonuc + ' 🧮';
    } catch(e) {
        return 'bu ifadeyi çözemedim, düzgün yazdığından emin ol';
    }
}

function rastgele(dizi) {
    return dizi[Math.floor(Math.random() * dizi.length)];
}

// tema değiştirme
function temaDegistir() {
    koyu = !koyu;
    document.body.classList.toggle('acik-tema');
    document.getElementById('temaBtn').textContent = koyu ? '🌙' : '☀️';
}
