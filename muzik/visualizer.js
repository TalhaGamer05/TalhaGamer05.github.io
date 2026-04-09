// muzik gorsellestiricisi
// web audio api + canvas

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var audioCtx, analyser, kaynak, dataArray, bufferLength;
var aktifMod = 'bar'; // bar, dalga, daire
var caliyorMu = false;
var audio = null;
var mikAktif = false;

// canvas boyutlandırma
function boyutAyarla() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
boyutAyarla();
window.addEventListener('resize', boyutAyarla);

// audio context oluştur
function audioBaslat() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
}

// dosya seçme
document.getElementById('dosyaSec').addEventListener('change', function(e) {
    var dosya = e.target.files[0];
    if (!dosya) return;

    document.getElementById('dosyaAdi').textContent = dosya.name;

    audioBaslat();

    // önceki varsa durdur
    if (audio) {
        audio.pause();
        audio.remove();
    }

    audio = new Audio();
    audio.src = URL.createObjectURL(dosya);

    kaynak = audioCtx.createMediaElementSource(audio);
    kaynak.connect(analyser);
    analyser.connect(audioCtx.destination);

    audio.volume = document.getElementById('sesSlider').value / 100;

    document.getElementById('oynatBtn').disabled = false;
    document.getElementById('duraklatBtn').disabled = false;

    // otomatik başlat
    audio.play();
    caliyorMu = true;
    ciz();
});

// oynat duraklat
document.getElementById('oynatBtn').addEventListener('click', function() {
    if (audio && !caliyorMu) {
        audioCtx.resume();
        audio.play();
        caliyorMu = true;
        ciz();
    }
});

document.getElementById('duraklatBtn').addEventListener('click', function() {
    if (audio && caliyorMu) {
        audio.pause();
        caliyorMu = false;
    }
});

// mikrofon
document.getElementById('mikBtn').addEventListener('click', function() {
    if (mikAktif) return;

    audioBaslat();
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
            var mikKaynak = audioCtx.createMediaStreamSource(stream);
            mikKaynak.connect(analyser);
            // analyser'ı speakera bağlama yoksa feedback olur
            mikAktif = true;
            caliyorMu = true;
            document.getElementById('mikBtn').style.background = 'rgba(239,68,68,0.3)';
            document.getElementById('mikBtn').textContent = '🎤 aktif';
            ciz();
        })
        .catch(function(err) {
            alert('mikrofon izni alınamadı');
        });
});

// ses seviyesi
document.getElementById('sesSlider').addEventListener('input', function() {
    if (audio) audio.volume = this.value / 100;
});

// mod değiştirme
document.querySelectorAll('.mod-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.mod-btn').forEach(function(b) { b.classList.remove('aktif'); });
        btn.classList.add('aktif');
        aktifMod = btn.getAttribute('data-mod');
    });
});

// çizim döngüsü
function ciz() {
    if (!caliyorMu) return;
    requestAnimationFrame(ciz);

    analyser.getByteFrequencyData(dataArray);

    // arkaplan temizle (hafif iz bırak)
    ctx.fillStyle = 'rgba(10, 10, 15, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (aktifMod === 'bar') barCiz();
    else if (aktifMod === 'dalga') dalgaCiz();
    else if (aktifMod === 'daire') daireCiz();
}

function barCiz() {
    var barW = (canvas.width / bufferLength) * 2.5;
    var x = 0;

    for (var i = 0; i < bufferLength; i++) {
        var h = dataArray[i] / 255 * canvas.height * 0.8;
        var hue = i / bufferLength * 300;

        // glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'hsl(' + hue + ', 100%, 50%)';

        ctx.fillStyle = 'hsl(' + hue + ', 80%, 55%)';
        ctx.fillRect(x, canvas.height - h, barW - 2, h);

        ctx.shadowBlur = 0;
        x += barW;
    }
}

function dalgaCiz() {
    analyser.getByteTimeDomainData(dataArray);

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#8b5cf6';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#8b5cf6';

    ctx.beginPath();
    var dilim = canvas.width / bufferLength;
    var x = 0;

    for (var i = 0; i < bufferLength; i++) {
        var v = dataArray[i] / 128;
        var y = (v * canvas.height) / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += dilim;
    }
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function daireCiz() {
    var merkezX = canvas.width / 2;
    var merkezY = canvas.height / 2;
    var yaricap = Math.min(canvas.width, canvas.height) * 0.25;

    for (var i = 0; i < bufferLength; i++) {
        var aci = (i / bufferLength) * Math.PI * 2;
        var genlik = dataArray[i] / 255;
        var r = yaricap + genlik * yaricap * 1.2;

        var x1 = merkezX + Math.cos(aci) * yaricap * 0.5;
        var y1 = merkezY + Math.sin(aci) * yaricap * 0.5;
        var x2 = merkezX + Math.cos(aci) * r;
        var y2 = merkezY + Math.sin(aci) * r;

        var hue = (i / bufferLength) * 360;
        ctx.strokeStyle = 'hsl(' + hue + ', 90%, ' + (40 + genlik * 30) + '%)';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'hsl(' + hue + ', 90%, 50%)';

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    ctx.shadowBlur = 0;
}

// sayfa açılınca animasyon döngüsü başlat (boş görüntü için)
function bostaCiz() {
    if (caliyorMu) return;
    requestAnimationFrame(bostaCiz);

    ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // dekoratif yüzen parçacıklar
    var t = Date.now() * 0.001;
    for (var i = 0; i < 5; i++) {
        var x = canvas.width / 2 + Math.cos(t + i * 1.3) * 150;
        var y = canvas.height / 2 + Math.sin(t * 0.7 + i * 0.9) * 100;
        ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}
bostaCiz();
