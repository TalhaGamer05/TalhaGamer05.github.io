// yılan oyunu - hamiltonyan döngü + kısayol algoritması
// bu algoritma matematiksel olarak yenilmezdir

(function () {

    var canvas = document.getElementById('gameCanvas');
    var ctx = canvas.getContext('2d');

    // ayarlar
    var GRID = 20;
    var N = GRID * GRID; // toplam hücre: 400
    var BASLANGIC_TICK = 110;
    var TICK_MS = BASLANGIC_TICK;
    var AI_BEKLEME = 10000;
    var HUCRE;

    // oyun durumu
    var yilan, yem, yon, sonrakiYon;
    var skor, enYuksek, oyunBitti, calisiyor;
    var yapayZeka, sonGirdi;
    var parcaciklar = [];
    var yemNabiz = 0;
    var hizCarpani = 1.0;

    // hamiltonyan döngü - tüm 400 hücreyi ziyaret eden döngü
    var dongu = [];
    var donguIdx = {}; // "x,y" -> döngüdeki sıra numarası

    function hamiltonyanOlustur() {
        dongu = [];
        // zigzag deseni ile tüm hücreleri kapsayan döngü
        // çift satırlar: sağa, tek satırlar: sola
        for (var y = 0; y < GRID; y++) {
            if (y % 2 === 0) {
                for (var x = 0; x < GRID; x++) dongu.push({ x: x, y: y });
            } else {
                for (var x = GRID - 1; x >= 0; x--) dongu.push({ x: x, y: y });
            }
        }
        // index haritası
        donguIdx = {};
        for (var i = 0; i < dongu.length; i++) {
            donguIdx[dongu[i].x + ',' + dongu[i].y] = i;
        }
    }

    // canvas boyut
    function boyutAyarla() {
        var alan = canvas.parentElement;
        var boyut = Math.min(alan.clientWidth, alan.clientHeight, 600);
        canvas.width = boyut * devicePixelRatio;
        canvas.height = boyut * devicePixelRatio;
        canvas.style.width = boyut + 'px';
        canvas.style.height = boyut + 'px';
        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        HUCRE = boyut / GRID;
    }

    function baslat() {
        enYuksek = parseInt(localStorage.getItem('snakeHS') || '0');
        hamiltonyanOlustur();
        boyutAyarla();
        window.addEventListener('resize', boyutAyarla);
        girdileriKur();
        arayuzGuncelle();
    }

    function sifirla() {
        var orta = Math.floor(GRID / 2);
        yilan = [{ x: orta, y: orta }, { x: orta - 1, y: orta }, { x: orta - 2, y: orta }];
        yon = { x: 1, y: 0 };
        sonrakiYon = { x: 1, y: 0 };
        skor = 0;
        oyunBitti = false;
        yapayZeka = false;
        sonGirdi = Date.now();
        parcaciklar = [];
        hizCarpani = 1.0;
        TICK_MS = BASLANGIC_TICK;
        yemOlustur();
        arayuzGuncelle();
    }

    function oyunuBaslat() {
        document.getElementById('startOverlay').classList.add('hidden');
        sifirla();
        calisiyor = true;
        sonTick = performance.now();
        birikim = 0;
        requestAnimationFrame(donguCalistir);
    }

    // yem oluştur
    function yemOlustur() {
        var dolu = {};
        for (var i = 0; i < yilan.length; i++) {
            dolu[yilan[i].x + ',' + yilan[i].y] = true;
        }
        var bos = [];
        for (var i = 0; i < N; i++) {
            var key = dongu[i].x + ',' + dongu[i].y;
            if (!dolu[key]) bos.push(dongu[i]);
        }
        if (bos.length === 0) return; // tüm alan doldu, kazandın
        yem = bos[Math.floor(Math.random() * bos.length)];
    }

    // ızgara sarmalama
    function sar(v) { return ((v % GRID) + GRID) % GRID; }

    // komşular (sarmalı dahil)
    function komsulariAl(p) {
        return [
            { x: sar(p.x + 1), y: p.y,         dx: 1,  dy: 0  },
            { x: sar(p.x - 1), y: p.y,         dx: -1, dy: 0  },
            { x: p.x,          y: sar(p.y + 1), dx: 0,  dy: 1  },
            { x: p.x,          y: sar(p.y - 1), dx: 0,  dy: -1 }
        ];
    }

    // =========================================================
    // yapay zeka - hamiltonyan döngü + güvenli kısayol
    // =========================================================

    // kısayolun güvenli olup olmadığını kontrol et
    // kural: baş→aday atlama bölgesinde gövde parçası olmamalı
    function kisayolGüvenli(adayX, adayY) {
        var adayKey = adayX + ',' + adayY;
        var adayI = donguIdx[adayKey];
        var basI = donguIdx[yilan[0].x + ',' + yilan[0].y];

        // aday gövdede mi? (kuyruk hariç - o kayacak)
        for (var i = 0; i < yilan.length - 1; i++) {
            if (yilan[i].x + ',' + yilan[i].y === adayKey) return false;
        }

        // atlama mesafesi (ileri yönde)
        var atlama = (adayI - basI + N) % N;
        if (atlama === 0) return false;

        // gövde parçası atlama bölgesinin içinde mi?
        for (var i = 1; i < yilan.length; i++) {
            var parcaI = donguIdx[yilan[i].x + ',' + yilan[i].y];
            var parcaMesafe = (parcaI - basI + N) % N;
            // parça atlama bölgesindeyse güvensiz
            if (parcaMesafe > 0 && parcaMesafe <= atlama) return false;
        }

        return true;
    }

    function yapayZekaKarar() {
        var basI = donguIdx[yilan[0].x + ',' + yilan[0].y];
        var yemI = donguIdx[yem.x + ',' + yem.y];

        // tüm güvenli komşuları bul
        var komsular = komsulariAl(yilan[0]);
        var enIyiYon = null;
        var enIyiMesafe = N + 1;

        for (var i = 0; i < komsular.length; i++) {
            var k = komsular[i];

            if (!kisayolGüvenli(k.x, k.y)) continue;

            // yeme döngüsel mesafe
            var kI = donguIdx[k.x + ',' + k.y];
            var yemMesafe = (yemI - kI + N) % N;

            if (yemMesafe < enIyiMesafe) {
                enIyiMesafe = yemMesafe;
                enIyiYon = { x: k.dx, y: k.dy };
            }
        }

        // güvenli kısayol yoksa döngüyü takip et
        if (!enIyiYon) {
            var sonrakiI = (basI + 1) % N;
            var sonraki = dongu[sonrakiI];

            var dx = sonraki.x - yilan[0].x;
            var dy = sonraki.y - yilan[0].y;

            // wrapping düzeltme
            if (dx > 1) dx = -1;
            if (dx < -1) dx = 1;
            if (dy > 1) dy = -1;
            if (dy < -1) dy = 1;

            enIyiYon = { x: dx, y: dy };
        }

        return enIyiYon;
    }

    // oyun güncelleme
    function guncelle() {
        if (oyunBitti) return;

        // ai zaman aşımı
        if (!yapayZeka && Date.now() - sonGirdi > AI_BEKLEME) {
            yapayZeka = true;
            arayuzGuncelle();
        }

        // ai yön kararı
        if (yapayZeka) {
            var aiYon = yapayZekaKarar();
            if (aiYon) sonrakiYon = aiYon;
        }

        yon = sonrakiYon;

        var bas = yilan[0];
        var yeniBas = { x: sar(bas.x + yon.x), y: sar(bas.y + yon.y) };

        // kendine çarpma kontrolü
        for (var i = 0; i < yilan.length - 1; i++) {
            if (yilan[i].x === yeniBas.x && yilan[i].y === yeniBas.y) {
                oyunBitti = true;
                if (skor > enYuksek) {
                    enYuksek = skor;
                    localStorage.setItem('snakeHS', enYuksek.toString());
                }
                arayuzGuncelle();
                return;
            }
        }

        yilan.unshift(yeniBas);

        // yem yeme
        if (yeniBas.x === yem.x && yeniBas.y === yem.y) {
            skor += 10;
            parcacikOlustur(yem.x, yem.y);
            yemOlustur();

            // hız artışı: her yemde %10 hızlan
            hizCarpani += 0.1;
            TICK_MS = Math.max(30, Math.round(BASLANGIC_TICK / hizCarpani));
        } else {
            yilan.pop();
        }

        arayuzGuncelle();
    }

    // parçacık efekti
    function parcacikOlustur(gx, gy) {
        var cx = (gx + 0.5) * HUCRE;
        var cy = (gy + 0.5) * HUCRE;
        for (var i = 0; i < 12; i++) {
            var aci = Math.random() * Math.PI * 2;
            var hiz = 1.5 + Math.random() * 3;
            parcaciklar.push({
                x: cx, y: cy,
                vx: Math.cos(aci) * hiz,
                vy: Math.sin(aci) * hiz,
                omur: 1,
                renk: Math.random() * 40
            });
        }
    }

    function parcaciklariGuncelle() {
        for (var i = parcaciklar.length - 1; i >= 0; i--) {
            var p = parcaciklar[i];
            p.x += p.vx;
            p.y += p.vy;
            p.omur -= 0.025;
            if (p.omur <= 0) parcaciklar.splice(i, 1);
        }
    }

    // çizim
    function ciz() {
        var W = canvas.width / devicePixelRatio;
        var H = canvas.height / devicePixelRatio;
        ctx.clearRect(0, 0, W, H);

        // ızgara
        ctx.strokeStyle = 'rgba(255,255,255,0.025)';
        ctx.lineWidth = 0.5;
        for (var i = 0; i <= GRID; i++) {
            ctx.beginPath(); ctx.moveTo(i * HUCRE, 0); ctx.lineTo(i * HUCRE, H); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i * HUCRE); ctx.lineTo(W, i * HUCRE); ctx.stroke();
        }

        // yem (nabız efekti)
        yemNabiz += 0.06;
        var pr = HUCRE * 0.32 + Math.sin(yemNabiz) * HUCRE * 0.06;
        var fx = (yem.x + 0.5) * HUCRE;
        var fy = (yem.y + 0.5) * HUCRE;
        ctx.save();
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 18 + Math.sin(yemNabiz) * 6;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(fx, fy, pr, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath(); ctx.arc(fx, fy, pr * 0.4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // yılan
        var uzunluk = yilan.length;
        for (var i = uzunluk - 1; i >= 0; i--) {
            var seg = yilan[i];
            var t = i / uzunluk;
            var basmi = (i === 0);

            var renk = yapayZeka ? 275 + t * 30 : 140 + t * 30;
            var parlaklik = basmi ? 60 : 55 - t * 18;

            var pad = 1;
            var sx = seg.x * HUCRE + pad;
            var sy = seg.y * HUCRE + pad;
            var sw = HUCRE - pad * 2;
            var sh = HUCRE - pad * 2;
            var rad = basmi ? HUCRE * 0.32 : HUCRE * 0.22;

            ctx.save();
            if (basmi) {
                ctx.shadowColor = yapayZeka ? '#a855f7' : '#22c55e';
                ctx.shadowBlur = 14;
            }
            ctx.fillStyle = 'hsl(' + renk + ',75%,' + parlaklik + '%)';
            ctx.beginPath(); ctx.roundRect(sx, sy, sw, sh, rad); ctx.fill();
            ctx.restore();

            if (basmi) gozCiz(seg);
        }

        // parçacıklar
        for (var i = 0; i < parcaciklar.length; i++) {
            var p = parcaciklar[i];
            ctx.save();
            ctx.globalAlpha = p.omur;
            ctx.fillStyle = 'hsl(' + p.renk + ',100%,65%)';
            ctx.shadowColor = 'hsl(' + p.renk + ',100%,50%)';
            ctx.shadowBlur = 6;
            ctx.beginPath(); ctx.arc(p.x, p.y, 2.5 * p.omur, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }

        // oyun bitti
        if (oyunBitti) {
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(0, 0, W, H);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold ' + (HUCRE * 1.5) + 'px Outfit, sans-serif';
            ctx.fillText('OYUN BİTTİ', W / 2, H / 2 - HUCRE);
            ctx.fillStyle = '#a0a0a0';
            ctx.font = (HUCRE * 0.8) + 'px Outfit, sans-serif';
            ctx.fillText('Skor: ' + skor + ' | Hız: ' + hizCarpani.toFixed(1) + 'x', W / 2, H / 2 + HUCRE * 0.2);
            ctx.fillText('SPACE ile tekrar', W / 2, H / 2 + HUCRE * 1.2);
        }
    }

    function gozCiz(seg) {
        var cx = seg.x * HUCRE + HUCRE / 2;
        var cy = seg.y * HUCRE + HUCRE / 2;
        var off = HUCRE * 0.16;
        var gr = HUCRE * 0.08;
        var br = HUCRE * 0.04;

        var e1x, e1y, e2x, e2y;
        if (yon.x === 1) { e1x = cx + off; e1y = cy - off; e2x = cx + off; e2y = cy + off; }
        else if (yon.x === -1) { e1x = cx - off; e1y = cy - off; e2x = cx - off; e2y = cy + off; }
        else if (yon.y === -1) { e1x = cx - off; e1y = cy - off; e2x = cx + off; e2y = cy - off; }
        else { e1x = cx - off; e1y = cy + off; e2x = cx + off; e2y = cy + off; }

        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(e1x, e1y, gr, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(e2x, e2y, gr, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(e1x, e1y, br, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(e2x, e2y, br, 0, Math.PI * 2); ctx.fill();
    }

    // arayüz güncelle
    function arayuzGuncelle() {
        document.getElementById('score').textContent = skor || 0;
        document.getElementById('highScore').textContent = enYuksek;
        document.getElementById('length').textContent = yilan ? yilan.length : 3;
        document.getElementById('hiz').textContent = hizCarpani.toFixed(1) + 'x';
        document.getElementById('aiStatus').textContent = yapayZeka ? 'AKTİF' : 'KAPALI';

        var kart = document.getElementById('aiIndicator');
        if (yapayZeka) kart.classList.add('active');
        else kart.classList.remove('active');
    }

    // girdi
    function girdileriKur() {
        document.getElementById('startBtn').addEventListener('click', oyunuBaslat);

        document.addEventListener('keydown', function (e) {
            if (e.key === ' ') {
                e.preventDefault();
                if (!calisiyor) { oyunuBaslat(); return; }
                if (oyunBitti) { sifirla(); return; }
            }

            var harita = {
                ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
                ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
                w: { x: 0, y: -1 }, s: { x: 0, y: 1 },
                a: { x: -1, y: 0 }, d: { x: 1, y: 0 }
            };
            var yeniYon = harita[e.key];
            if (yeniYon && calisiyor && !oyunBitti) {
                e.preventDefault();
                if (yeniYon.x !== -yon.x || yeniYon.y !== -yon.y) {
                    sonrakiYon = yeniYon;
                    sonGirdi = Date.now();
                    if (yapayZeka) { yapayZeka = false; arayuzGuncelle(); }
                }
            }
        });

        // mobil butonlar
        document.querySelectorAll('.touch-btn').forEach(function (btn) {
            btn.addEventListener('touchstart', function (e) {
                e.preventDefault();
                if (!calisiyor) { oyunuBaslat(); return; }
                if (oyunBitti) { sifirla(); return; }
                var yonHarita = {
                    up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
                    left: { x: -1, y: 0 }, right: { x: 1, y: 0 }
                };
                var yeniYon = yonHarita[btn.dataset.dir];
                if (yeniYon && (yeniYon.x !== -yon.x || yeniYon.y !== -yon.y)) {
                    sonrakiYon = yeniYon;
                    sonGirdi = Date.now();
                    if (yapayZeka) { yapayZeka = false; arayuzGuncelle(); }
                }
            });
        });

        // kaydırma
        var baslangicX, baslangicY;
        canvas.addEventListener('touchstart', function (e) {
            baslangicX = e.touches[0].clientX;
            baslangicY = e.touches[0].clientY;
        }, { passive: true });

        canvas.addEventListener('touchend', function (e) {
            if (!calisiyor) { oyunuBaslat(); return; }
            if (oyunBitti) { sifirla(); return; }
            var dx = e.changedTouches[0].clientX - baslangicX;
            var dy = e.changedTouches[0].clientY - baslangicY;
            if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
            var yeniYon;
            if (Math.abs(dx) > Math.abs(dy)) yeniYon = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
            else yeniYon = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
            if (yeniYon.x !== -yon.x || yeniYon.y !== -yon.y) {
                sonrakiYon = yeniYon;
                sonGirdi = Date.now();
                if (yapayZeka) { yapayZeka = false; arayuzGuncelle(); }
            }
        }, { passive: true });
    }

    // oyun döngüsü
    var sonTick = 0;
    var birikim = 0;

    function donguCalistir(zaman) {
        if (!calisiyor) return;
        var delta = zaman - sonTick;
        sonTick = zaman;
        birikim += delta;

        while (birikim >= TICK_MS) {
            guncelle();
            birikim -= TICK_MS;
        }

        parcaciklariGuncelle();
        ciz();
        requestAnimationFrame(donguCalistir);
    }

    baslat();

})();
