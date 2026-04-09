// ============================================
// 🐍 SNAKE OYUNU — Yenilmez AI Algoritması
// BFS + Güvenlik Kontrolü + Kuyruk Takibi
// ============================================

(function () {
    'use strict';

    // ─── Yapılandırma ───
    const GRID       = 20;         // 20x20 ızgara
    const TICK_MS    = 110;        // ms/tick (~9 FPS oyun mantığı)
    const AI_TIMEOUT = 10000;      // 10 saniye hareketsizlik → AI devralır

    // ─── Canvas Referansları ───
    const canvas = document.getElementById('gameCanvas');
    const ctx    = canvas.getContext('2d');
    let CELL;  // piksel cinsinden hücre boyutu

    // ─── Oyun Durumu ───
    let snake, food, dir, nextDir;
    let score, highScore, gameRunning, gameOver;
    let isAI, lastInputTime;
    let particles = [];
    let foodPulse = 0;

    // ─── Başlatma ───
    function init() {
        highScore = parseInt(localStorage.getItem('snakeHS') || '0');
        resize();
        window.addEventListener('resize', resize);
        setupInput();
        updateUI();
    }

    function resize() {
        const area = canvas.parentElement;
        const size = Math.min(area.clientWidth, area.clientHeight, 600);
        canvas.width  = size * devicePixelRatio;
        canvas.height = size * devicePixelRatio;
        canvas.style.width  = size + 'px';
        canvas.style.height = size + 'px';
        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        CELL = size / GRID;
    }

    function resetGame() {
        const mid = Math.floor(GRID / 2);
        snake   = [{ x: mid, y: mid }, { x: mid - 1, y: mid }, { x: mid - 2, y: mid }];
        dir     = { x: 1, y: 0 };
        nextDir = { x: 1, y: 0 };
        score   = 0;
        gameOver = false;
        isAI    = false;
        lastInputTime = Date.now();
        particles = [];
        spawnFood();
        updateUI();
    }

    function startGame() {
        document.getElementById('startOverlay').classList.add('hidden');
        resetGame();
        gameRunning = true;
        lastTick = performance.now();
        accumulator = 0;
        requestAnimationFrame(loop);
    }

    // ─── Yem Üretimi ───
    function spawnFood() {
        const occupied = new Set(snake.map(s => s.x + ',' + s.y));
        let pos;
        do {
            pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
        } while (occupied.has(pos.x + ',' + pos.y));
        food = pos;
    }

    // ─── Izgara Sarmalama (Wrapping) ───
    function wrap(v) { return ((v % GRID) + GRID) % GRID; }

    // ─── Komşu Hücreler (Sarmalı) ───
    function neighbors(p) {
        return [
            { x: wrap(p.x + 1), y: p.y,          dx: 1,  dy: 0  },
            { x: wrap(p.x - 1), y: p.y,          dx: -1, dy: 0  },
            { x: p.x,           y: wrap(p.y + 1), dx: 0,  dy: 1  },
            { x: p.x,           y: wrap(p.y - 1), dx: 0,  dy: -1 }
        ];
    }

    // ============================================
    // 🧠 YAPAY ZEKA — BFS Yol Bulma (Toroidal Izgara)
    // ============================================

    /**
     * BFS ile start → target arası en kısa yolu bulur.
     * İlk adımdaki yönü döndürür veya yol yoksa null.
     * @param {Object} start - Başlangıç konumu {x, y}
     * @param {Object} target - Hedef konum {x, y}
     * @param {Array} blocked - Engelli hücreler listesi
     * @returns {Object|null} İlk adımın yönü {x, y} veya null
     */
    function bfs(start, target, blocked) {
        const blockSet = new Set();
        for (let i = 0; i < blocked.length; i++) {
            blockSet.add(blocked[i].x + ',' + blocked[i].y);
        }
        // Hedef ve başlangıcı engellerden çıkar
        blockSet.delete(target.x + ',' + target.y);
        blockSet.delete(start.x + ',' + start.y);

        const visited = new Set();
        visited.add(start.x + ',' + start.y);

        const queue = [{ x: start.x, y: start.y, fdx: 0, fdy: 0, hasDir: false }];
        let head = 0; // Kuyruk optimizasyonu: shift() yerine index

        while (head < queue.length) {
            const cur = queue[head++];

            if (cur.x === target.x && cur.y === target.y) {
                return { x: cur.fdx, y: cur.fdy };
            }

            const nbs = neighbors(cur);
            for (let i = 0; i < nbs.length; i++) {
                const n = nbs[i];
                const key = n.x + ',' + n.y;
                if (!visited.has(key) && !blockSet.has(key)) {
                    visited.add(key);
                    queue.push({
                        x: n.x, y: n.y,
                        fdx: cur.hasDir ? cur.fdx : n.dx,
                        fdy: cur.hasDir ? cur.fdy : n.dy,
                        hasDir: true
                    });
                }
            }
        }
        return null;
    }

    /**
     * Belirli bir hücreden erişilebilir boş alan sayısını hesaplar.
     * Yılanın hareket alanının yeterliliğini kontrol etmek için kullanılır.
     */
    function floodCount(start, blocked) {
        const blockSet = new Set();
        for (let i = 0; i < blocked.length; i++) {
            blockSet.add(blocked[i].x + ',' + blocked[i].y);
        }
        blockSet.delete(start.x + ',' + start.y);

        const visited = new Set();
        visited.add(start.x + ',' + start.y);
        const stack = [start];
        let count = 0;

        while (stack.length > 0) {
            const cur = stack.pop();
            count++;
            const nbs = neighbors(cur);
            for (let i = 0; i < nbs.length; i++) {
                const n = nbs[i];
                const key = n.x + ',' + n.y;
                if (!visited.has(key) && !blockSet.has(key)) {
                    visited.add(key);
                    stack.push({ x: n.x, y: n.y });
                }
            }
        }
        return count;
    }

    /**
     * 🧠 AI Karar Motoru
     * 
     * Strateji Sırası:
     * 1. BFS ile yeme git + güvenlik kontrolü (kuyruk erişilebilirliği)
     * 2. Güvenli değilse → kuyruğu takip et
     * 3. Kuyruk erişilemezse → en geniş alana açılan hamle
     */
    function aiDecide() {
        const head = snake[0];
        const tail = snake[snake.length - 1];

        // ── Strateji 1: Yeme güvenle git ──
        const dirToFood = bfs(head, food, snake);

        if (dirToFood) {
            const newHead = { x: wrap(head.x + dirToFood.x), y: wrap(head.y + dirToFood.y) };
            const isEating = (newHead.x === food.x && newHead.y === food.y);

            // Hamle sonrası sanal yılan oluştur
            let virtualSnake;
            if (isEating) {
                virtualSnake = [newHead, ...snake]; // Büyüme simülasyonu
            } else {
                virtualSnake = [newHead, ...snake.slice(0, -1)];
            }

            // Güvenlik: kuyruk hâlâ erişilebilir mi?
            const vTail = virtualSnake[virtualSnake.length - 1];
            const canReachTail = bfs(newHead, vTail, virtualSnake);

            if (canReachTail) {
                return dirToFood;
            }
        }

        // ── Strateji 2: Kuyruğu takip et ──
        const dirToTail = bfs(head, tail, snake.slice(0, -1));
        if (dirToTail) {
            return dirToTail;
        }

        // ── Strateji 3: En geniş alana açılan hamle ──
        const nbs = neighbors(head);
        const bodySet = new Set(snake.map(s => s.x + ',' + s.y));
        let bestDir  = null;
        let bestArea = -1;

        for (let i = 0; i < nbs.length; i++) {
            const n = nbs[i];
            const key = n.x + ',' + n.y;
            if (!bodySet.has(key)) {
                const virtualSnake2 = [{ x: n.x, y: n.y }, ...snake.slice(0, -1)];
                const area = floodCount({ x: n.x, y: n.y }, virtualSnake2);
                if (area > bestArea) {
                    bestArea = area;
                    bestDir = { x: n.dx, y: n.dy };
                }
            }
        }

        return bestDir || dir; // Son çare: mevcut yön
    }

    // ─── Oyun Güncelleme ───
    function update() {
        if (gameOver) return;

        // AI zaman aşımı kontrolü
        if (!isAI && Date.now() - lastInputTime > AI_TIMEOUT) {
            isAI = true;
            updateUI();
        }

        // AI yön kararı
        if (isAI) {
            const aiDir = aiDecide();
            if (aiDir) nextDir = aiDir;
        }

        dir = nextDir;

        const head    = snake[0];
        const newHead = { x: wrap(head.x + dir.x), y: wrap(head.y + dir.y) };

        // Kendi kendine çarpma kontrolü
        for (let i = 0; i < snake.length - 1; i++) {
            if (snake[i].x === newHead.x && snake[i].y === newHead.y) {
                gameOver = true;
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('snakeHS', highScore.toString());
                }
                updateUI();
                return;
            }
        }

        snake.unshift(newHead);

        // Yem yeme kontrolü
        if (newHead.x === food.x && newHead.y === food.y) {
            score += 10;
            spawnParticles(food.x, food.y);
            spawnFood();
        } else {
            snake.pop();
        }

        updateUI();
    }

    // ─── Parçacık Efektleri ───
    function spawnParticles(gx, gy) {
        const cx = (gx + 0.5) * CELL;
        const cy = (gy + 0.5) * CELL;
        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3;
            particles.push({
                x: cx, y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                hue: 0 + Math.random() * 40 // Kırmızı-Turuncu
            });
        }
    }

    function tickParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.025;
            if (p.life <= 0) particles.splice(i, 1);
        }
    }

    // ============================================
    // 🎨 Render — Canvas Çizimi
    // ============================================

    function draw() {
        const W = canvas.width / devicePixelRatio;
        const H = canvas.height / devicePixelRatio;
        ctx.clearRect(0, 0, W, H);

        // Izgara çizgileri
        ctx.strokeStyle = 'rgba(255,255,255,0.025)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= GRID; i++) {
            ctx.beginPath();
            ctx.moveTo(i * CELL, 0);
            ctx.lineTo(i * CELL, H);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * CELL);
            ctx.lineTo(W, i * CELL);
            ctx.stroke();
        }

        // Yem (nabız efektli)
        foodPulse += 0.06;
        const pulseR = CELL * 0.32 + Math.sin(foodPulse) * CELL * 0.06;
        const fx = (food.x + 0.5) * CELL;
        const fy = (food.y + 0.5) * CELL;

        ctx.save();
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 18 + Math.sin(foodPulse) * 6;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(fx, fy, pulseR, 0, Math.PI * 2);
        ctx.fill();
        // İç parlak çekirdek
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(fx, fy, pulseR * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Yılan
        const len = snake.length;
        for (let i = len - 1; i >= 0; i--) {
            const seg = snake[i];
            const t = i / len;
            const isHead = (i === 0);

            // Renk: Yeşil (normal) veya Mor (AI)
            const hue = isAI ? 275 + t * 30 : 140 + t * 30;
            const sat = 75;
            const lum = isHead ? 60 : 55 - t * 18;

            const pad = 1;
            const sx = seg.x * CELL + pad;
            const sy = seg.y * CELL + pad;
            const sw = CELL - pad * 2;
            const sh = CELL - pad * 2;
            const rad = isHead ? CELL * 0.32 : CELL * 0.22;

            ctx.save();
            if (isHead) {
                ctx.shadowColor = isAI ? '#a855f7' : '#22c55e';
                ctx.shadowBlur = 14;
            }
            ctx.fillStyle = 'hsl(' + hue + ',' + sat + '%,' + lum + '%)';
            ctx.beginPath();
            ctx.roundRect(sx, sy, sw, sh, rad);
            ctx.fill();
            ctx.restore();

            // Göz çizimi (sadece baş)
            if (isHead) {
                drawEyes(seg);
            }
        }

        // Parçacıklar
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = 'hsl(' + p.hue + ',100%,65%)';
            ctx.shadowColor = 'hsl(' + p.hue + ',100%,50%)';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.5 * p.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Oyun Bitti ekranı
        if (gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(0, 0, W, H);

            ctx.textAlign = 'center';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold ' + (CELL * 1.5) + 'px Outfit, sans-serif';
            ctx.fillText('OYUN BİTTİ', W / 2, H / 2 - CELL);

            ctx.fillStyle = '#a0a0a0';
            ctx.font = (CELL * 0.8) + 'px Outfit, sans-serif';
            ctx.fillText('Skor: ' + score, W / 2, H / 2 + CELL * 0.2);
            ctx.fillText('Yeniden başlamak için SPACE', W / 2, H / 2 + CELL * 1.2);
        }
    }

    function drawEyes(seg) {
        const cx = seg.x * CELL + CELL / 2;
        const cy = seg.y * CELL + CELL / 2;
        const off = CELL * 0.16;
        const eyeR = CELL * 0.08;
        const pupR = CELL * 0.04;

        let e1x, e1y, e2x, e2y;
        if (dir.x === 1)       { e1x = cx + off; e1y = cy - off; e2x = cx + off; e2y = cy + off; }
        else if (dir.x === -1) { e1x = cx - off; e1y = cy - off; e2x = cx - off; e2y = cy + off; }
        else if (dir.y === -1) { e1x = cx - off; e1y = cy - off; e2x = cx + off; e2y = cy - off; }
        else                   { e1x = cx - off; e1y = cy + off; e2x = cx + off; e2y = cy + off; }

        // Beyaz göz
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(e1x, e1y, eyeR, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(e2x, e2y, eyeR, 0, Math.PI * 2); ctx.fill();
        // Siyah göz bebeği
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(e1x, e1y, pupR, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(e2x, e2y, pupR, 0, Math.PI * 2); ctx.fill();
    }

    // ─── UI Güncelleme ───
    function updateUI() {
        document.getElementById('score').textContent     = score || 0;
        document.getElementById('highScore').textContent  = highScore;
        document.getElementById('length').textContent     = snake ? snake.length : 3;
        document.getElementById('aiStatus').textContent   = isAI ? 'AKTİF' : 'KAPALI';

        const card = document.getElementById('aiIndicator');
        if (isAI) card.classList.add('active');
        else      card.classList.remove('active');
    }

    // ─── Girdi Yönetimi ───
    function setupInput() {
        // Başlat butonu
        document.getElementById('startBtn').addEventListener('click', startGame);

        // Klavye
        document.addEventListener('keydown', function (e) {
            if (e.key === ' ') {
                e.preventDefault();
                if (!gameRunning) { startGame(); return; }
                if (gameOver) { resetGame(); return; }
            }

            const map = {
                ArrowUp:    { x: 0, y: -1 }, ArrowDown:  { x: 0, y: 1 },
                ArrowLeft:  { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
                w: { x: 0, y: -1 }, s: { x: 0, y: 1 },
                a: { x: -1, y: 0 }, d: { x: 1, y: 0 }
            };
            const nd = map[e.key];
            if (nd && gameRunning && !gameOver) {
                e.preventDefault();
                if (nd.x !== -dir.x || nd.y !== -dir.y) {
                    nextDir = nd;
                    lastInputTime = Date.now();
                    if (isAI) { isAI = false; updateUI(); }
                }
            }
        });

        // Mobil dokunmatik butonlar
        document.querySelectorAll('.touch-btn').forEach(function (btn) {
            btn.addEventListener('touchstart', function (e) {
                e.preventDefault();
                if (!gameRunning) { startGame(); return; }
                if (gameOver) { resetGame(); return; }

                const dirMap = {
                    up:    { x: 0, y: -1 }, down:  { x: 0, y: 1 },
                    left:  { x: -1, y: 0 }, right: { x: 1, y: 0 }
                };
                const nd = dirMap[btn.dataset.dir];
                if (nd && (nd.x !== -dir.x || nd.y !== -dir.y)) {
                    nextDir = nd;
                    lastInputTime = Date.now();
                    if (isAI) { isAI = false; updateUI(); }
                }
            });
        });

        // Kaydırma (Swipe) kontrolleri
        let touchStartX, touchStartY;
        canvas.addEventListener('touchstart', function (e) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        canvas.addEventListener('touchend', function (e) {
            if (!gameRunning) { startGame(); return; }
            if (gameOver) { resetGame(); return; }

            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;

            let nd;
            if (Math.abs(dx) > Math.abs(dy)) {
                nd = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
            } else {
                nd = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
            }
            if (nd.x !== -dir.x || nd.y !== -dir.y) {
                nextDir = nd;
                lastInputTime = Date.now();
                if (isAI) { isAI = false; updateUI(); }
            }
        }, { passive: true });
    }

    // ─── Oyun Döngüsü (Sabit tick + 60fps render) ───
    let lastTick = 0;
    let accumulator = 0;

    function loop(timestamp) {
        if (!gameRunning) return;

        const delta = timestamp - lastTick;
        lastTick = timestamp;
        accumulator += delta;

        // Sabit adım güncelleme
        while (accumulator >= TICK_MS) {
            update();
            accumulator -= TICK_MS;
        }

        tickParticles();
        draw();
        requestAnimationFrame(loop);
    }

    // ─── Başlat ───
    init();

})();
