// pomodoro zamanlayıcı

var sureler = {
    calisma: 25 * 60,   // 25 dakika
    mola: 5 * 60,       // 5 dk
    uzunMola: 15 * 60   // 15 dk
};

var aktifMod = 'calisma';
var kalanSaniye = sureler.calisma;
var calisiyor = false;
var zamanlayici = null;
var tamamlananTur = 0;
var toplamCalisma = 0; // saniye cinsinden

var cember = document.getElementById('ilerlemeCember');
var cevresi = 2 * Math.PI * 90; // svg r=90

// sayfa açılınca
guncelle();
turNoktalariniCiz();

function modSec(mod) {
    if (calisiyor) return; // çalışırken mod değiştirme

    aktifMod = mod;
    kalanSaniye = sureler[mod];

    // buton stilini güncelle
    document.querySelectorAll('.mod-btn').forEach(function(b) { b.classList.remove('aktif'); });
    document.querySelector('[data-mod="' + mod + '"]').classList.add('aktif');

    // cember rengini güncelle
    if (mod === 'calisma') cember.style.stroke = '#ef4444';
    else if (mod === 'mola') cember.style.stroke = '#22c55e';
    else cember.style.stroke = '#3b82f6';

    guncelle();
}

function baslatDuraklat() {
    if (calisiyor) {
        // duraklat
        clearInterval(zamanlayici);
        calisiyor = false;
        document.getElementById('baslatBtn').textContent = '▶ devam';
    } else {
        // başlat
        calisiyor = true;
        document.getElementById('baslatBtn').textContent = '⏸ duraklat';

        zamanlayici = setInterval(function() {
            kalanSaniye--;

            if (aktifMod === 'calisma') toplamCalisma++;

            if (kalanSaniye <= 0) {
                clearInterval(zamanlayici);
                calisiyor = false;

                // bildirim
                bildirimGonder();

                if (aktifMod === 'calisma') {
                    tamamlananTur++;
                    turNoktalariniCiz();
                    istatistikleriGuncelle();

                    // her 4 turda uzun mola
                    if (tamamlananTur % 4 === 0) {
                        modSec('uzunMola');
                    } else {
                        modSec('mola');
                    }
                } else {
                    // mola bitti, çalışmaya dön
                    modSec('calisma');
                }

                document.getElementById('baslatBtn').textContent = '▶ başlat';
            }

            guncelle();
        }, 1000);
    }
}

function sifirla() {
    clearInterval(zamanlayici);
    calisiyor = false;
    kalanSaniye = sureler[aktifMod];
    document.getElementById('baslatBtn').textContent = '▶ başlat';
    guncelle();
}

function guncelle() {
    // saat gösterimi
    var dk = Math.floor(kalanSaniye / 60);
    var sn = kalanSaniye % 60;
    document.getElementById('saat').textContent =
        (dk < 10 ? '0' : '') + dk + ':' + (sn < 10 ? '0' : '') + sn;

    // daire ilerleme
    var toplam = sureler[aktifMod];
    var gecen = toplam - kalanSaniye;
    var oran = gecen / toplam;
    var offset = cevresi * (1 - oran);
    cember.style.strokeDashoffset = offset;
}

function istatistikleriGuncelle() {
    document.getElementById('turSayac').textContent = tamamlananTur;
    document.getElementById('toplamDakika').textContent = Math.floor(toplamCalisma / 60);

    // hedef kontrolü
    if (tamamlananTur >= 8) {
        document.getElementById('hedef').textContent = '🏆';
    }
}

function turNoktalariniCiz() {
    var alan = document.getElementById('turGorunumu');
    alan.innerHTML = '';

    // 8 tur hedefi göster
    for (var i = 0; i < 8; i++) {
        var nokta = document.createElement('div');
        nokta.className = 'tur-nokta';
        if (i < tamamlananTur) nokta.classList.add('dolu');
        alan.appendChild(nokta);
    }
}

function bildirimGonder() {
    // tarayıcı bildirimi
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification('pomodoro', {
                body: aktifMod === 'calisma' ? 'çalışma süresi bitti! mola zamanı 🎉' : 'mola bitti! çalışmaya dön 💪',
                icon: '🍅'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }

    // ses çal
    try {
        var ses = new AudioContext();
        var osc = ses.createOscillator();
        var gain = ses.createGain();
        osc.connect(gain);
        gain.connect(ses.destination);
        osc.frequency.value = 800;
        gain.gain.value = 0.3;
        osc.start();
        osc.stop(ses.currentTime + 0.3);
        // ikinci bip
        setTimeout(function() {
            var osc2 = ses.createOscillator();
            var gain2 = ses.createGain();
            osc2.connect(gain2);
            gain2.connect(ses.destination);
            osc2.frequency.value = 1000;
            gain2.gain.value = 0.3;
            osc2.start();
            osc2.stop(ses.currentTime + 0.3);
        }, 400);
    } catch(e) {
        // ses çalamazsa sorun değil
    }
}

// sayfa açılınca bildirim izni iste
if ('Notification' in window && Notification.permission === 'default') {
    // kullanıcı ilk butona basınca iste
    document.getElementById('baslatBtn').addEventListener('click', function() {
        Notification.requestPermission();
    }, { once: true });
}
