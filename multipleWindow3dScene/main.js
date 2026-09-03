/**
 * Original Project: https://github.com/bgstaal/multipleWindow3dScene
 * Author: bgstaal
 * Licensed under the MIT License.
 * Modified by TalhaGamer05.
 */

// ============================================================
// EKRAN VE WEBGL TUVALİNİ HAZIRLA
// ============================================================
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.style.backgroundColor = "#000000"; 

const canvas = document.createElement('canvas');
canvas.style.position = 'absolute';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100vw';
canvas.style.height = '100vh';
document.body.appendChild(canvas);

const gl = canvas.getContext('webgl');
if (!gl) alert('Tarayıcınız WebGL desteklemiyor.');

// ============================================================
// SHADER'LAR (Çökmeyi Önleyen Zincirleme Matematik)
// ============================================================
const vertShaderSrc = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const fragShaderSrc = `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uSmoothK;
uniform float uDPR;

#define MAX_BLOBS 10
uniform int uBlobCount;
uniform vec3 uBlobs[MAX_BLOBS];
uniform vec3 uColors[MAX_BLOBS];
uniform float uSpeeds[MAX_BLOBS]; 
uniform float uRadii[MAX_BLOBS]; 

vec3 hash3(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
              dot(p, vec3(269.5, 183.3, 246.1)),
              dot(p, vec3(113.5, 271.9, 124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(mix(dot(hash3(i + vec3(0,0,0)), f - vec3(0,0,0)),
                dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
            mix(dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0)),
                dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x), u.y),
        mix(mix(dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1)),
                dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
            mix(dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1)),
                dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x), u.y),
        u.z);
}

vec4 mapBlend(vec3 p) {
    float finalD = 1000.0;
    vec3 finalCol = vec3(0.0);

    // 1. AŞAMA: KÜRELER VE DALGALANMALAR
    for (int i = 0; i < MAX_BLOBS; i++) {
        if (i >= uBlobCount) break;

        vec3 pB = uBlobs[i];
        vec3 dVec = p - pB;

        float ang = uTime * 0.15 + float(i) * 2.0;
        mat3 spin = mat3(cos(ang), 0.0, sin(ang), 0.0, 1.0, 0.0, -sin(ang), 0.0, cos(ang));
        vec3 rotatedVec = spin * dVec;
        
        float currentAmp = 0.04 + (uSpeeds[i] * 0.12);
        float nVal = noise(normalize(rotatedVec) * 6.0 + uTime * 1.5); 
        float dB = length(dVec) - uRadii[i] - nVal * currentAmp;

        if (i == 0) {
            finalD = dB;
            finalCol = uColors[i];
        } else {
            float h = clamp(0.5 + 0.5 * (finalD - dB) / uSmoothK, 0.0, 1.0);
            finalD = mix(finalD, dB, h) - uSmoothK * h * (1.0 - h);
            finalCol = mix(finalCol, uColors[i], smoothstep(0.1, 0.9, h));
        }
    }
    
    // 2. AŞAMA: ZİNCİRLEME SIVI KÖPRÜLERİ (WebGL %100 Uyumlu)
    if (uBlobCount > 1) {
        vec3 pA = uBlobs[0];
        vec3 colA = uColors[0];
        float speedA = uSpeeds[0];

        for (int i = 1; i < MAX_BLOBS; i++) {
            if (i >= uBlobCount) break;

            vec3 pB = uBlobs[i];
            vec3 colB = uColors[i];
            float speedB = uSpeeds[i];

            vec3 ba = pB - pA;
            vec3 pa = p - pA;

            float distAB = length(ba);
            float h_cap = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);

            float avgRadius = (uRadii[i-1] + uRadii[i]) * 0.5;
            float baseThickness = mix(avgRadius * 0.45, 0.02, clamp(distAB / 4.0, 0.0, 1.0));
            float thickness = baseThickness * (1.0 - 0.7 * sin(h_cap * 3.14159));

            float threadWobble = noise(p * 5.0 - uTime * 3.0) * (speedA + speedB) * 0.02;
            float dCap = length(pa - ba * h_cap) - thickness + threadWobble;

            float h_main = clamp(0.5 + 0.5 * (finalD - dCap) / uSmoothK, 0.0, 1.0);
            finalD = mix(finalD, dCap, h_main) - uSmoothK * h_main * (1.0 - h_main);

            vec3 bridgeColor = mix(colA, colB, h_cap);
            finalCol = mix(finalCol, bridgeColor, smoothstep(0.1, 0.9, h_main));

            // Sıradaki köprü için referansları kaydır
            pA = pB; colA = colB; speedA = speedB;
        }
    }

    return vec4(finalD, finalCol);
}

float map(vec3 p) { return mapBlend(p).x; }

vec3 calcNormal(vec3 p) {
    vec2 e = vec2(0.002, 0.0);
    return normalize(vec3(
        map(p + e.xyy) - map(p - e.xyy),
        map(p + e.yxy) - map(p - e.yxy),
        map(p + e.yyx) - map(p - e.yyx)
    ));
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / (400.0 * uDPR); 
    
    vec3 ro = vec3(uv, 5.0); 
    vec3 rd = vec3(0.0, 0.0, -1.0); 

    float t = 0.0;
    vec3 pos;
    bool hit = false;

    for (int i = 0; i < 80; i++) {
        pos = ro + rd * t;
        float d = map(pos);
        if (d < 0.002) { hit = true; break; }
        t += d;
        if (t > 15.0) break;
    }

    vec3 col = vec3(0.0); 

    if (hit) {
        vec3 n = calcNormal(pos);
        vec3 viewDir = vec3(0.0, 0.0, 1.0); 

        vec4 blendRes = mapBlend(pos);
        vec3 baseColor = blendRes.yzw;

        vec3 lightDir = normalize(vec3(0.5, 0.8, 1.0));
        vec3 halfV = normalize(lightDir + viewDir);

        float diffuse = max(dot(n, lightDir), 0.0);
        float spec = pow(max(dot(n, halfV), 0.0), 60.0) * 1.5; 
        float rim = pow(1.0 - max(dot(n, viewDir), 0.0), 2.5); 

        col = baseColor * (diffuse * 0.5 + 0.6); 
        col += baseColor * rim * 1.1;            
        col += vec3(1.0) * spec;                 
    }

    col = pow(col, vec3(0.4545)); 
    gl_FragColor = vec4(col, 1.0);
}
`;

function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
    return s;
}

const program = gl.createProgram();
gl.attachShader(program, compile(gl.VERTEX_SHADER, vertShaderSrc));
gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragShaderSrc));
gl.linkProgram(program);
gl.useProgram(program);

const quad = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
const aPos = gl.getAttribLocation(program, 'aPos');
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

const U = name => gl.getUniformLocation(program, name);
const uniforms = {
    uRes: U('uRes'), uTime: U('uTime'),
    uSmoothK: U('uSmoothK'), uRadii: U('uRadii'),
    uBlobCount: U('uBlobCount'), uBlobs: U('uBlobs'), 
    uColors: U('uColors'), uSpeeds: U('uSpeeds'),
    uDPR: U('uDPR') 
};

// ============================================================
// ÇOKLU EKRAN & MANTIK AĞI
// ============================================================
const channel = new BroadcastChannel('quantum_fluid_sync');
const myId = Math.random().toString(36).substring(7);
const colors = ['#00e5ff', '#ff0055', '#ffcc00', '#aa00ff'];
const myColor = colors[Math.floor(Math.random() * colors.length)];
let activeWindows = {};

function hexToRgb(hex) {
    return {
        r: parseInt(hex.slice(1,3), 16) / 255,
        g: parseInt(hex.slice(3,5), 16) / 255,
        b: parseInt(hex.slice(5,7), 16) / 255
    };
}

let permissionSupported = 'getScreenDetails' in window;
async function requestScreenPermission() {
    if (!permissionSupported) return;
    try {
        await window.getScreenDetails();
        permBtn.style.display = 'none';
    } catch (err) {}
}

if (permissionSupported && navigator.permissions) {
    navigator.permissions.query({ name: 'window-management' }).then(status => {
        if (status.state === 'granted') requestScreenPermission();
    }).catch(() => {});
}

const permBtn = document.createElement('button');
permBtn.textContent = permissionSupported ? '🖥️ Çoklu Ekran Senkronizasyonunu Aktifleştir' : '⚠️ API Desteklenmiyor';
permBtn.style.cssText = `position:fixed; top:16px; right:16px; z-index:9999; padding:10px 16px; background:#00e5ff; color:#000; border:none; border-radius:8px; cursor:pointer; font-weight:bold;`;
if(permissionSupported) permBtn.onclick = requestScreenPermission;
document.body.appendChild(permBtn);

function resize() {
    const dpr = Math.min(devicePixelRatio, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener('resize', resize);
resize();

function getRawScreenBounds() {
    const border = Math.max(0, (window.outerWidth - window.innerWidth) / 2);
    const topChrome = Math.max(0, window.outerHeight - window.innerHeight - border);
    
    const contentX = window.screenX + border;
    const contentY = window.screenY + topChrome;
    
    return {
        cx: contentX + (window.innerWidth / 2),
        cy: contentY + (window.innerHeight / 2)
    };
}

channel.onmessage = (e) => {
    activeWindows[e.data.id] = e.data;
};

// ============================================================
// RENDER DÖNGÜSÜ & GLOBAL SIRALAMA MANTIĞI
// ============================================================
let startTime = performance.now();
const PIXEL_SCALE = 400.0; 

let mySpeed = 0;
let lastCx = null, lastCy = null;

function loop() {
    const now = Date.now();
    const time = (performance.now() - startTime) / 1000;
    const bounds = getRawScreenBounds();
    const currentDPR = Math.min(devicePixelRatio, 2); 

    if (lastCx !== null) {
        let dxMove = bounds.cx - lastCx;
        let dyMove = bounds.cy - lastCy;
        let instantVelocity = Math.hypot(dxMove, dyMove);
        mySpeed = mySpeed * 0.88 + instantVelocity * 0.015; 
    }
    lastCx = bounds.cx; lastCy = bounds.cy;

    channel.postMessage({ id: myId, color: myColor, cx: bounds.cx, cy: bounds.cy, time: now, speed: mySpeed });

    gl.uniform2f(uniforms.uRes, canvas.width, canvas.height);
    gl.uniform1f(uniforms.uTime, time);
    gl.uniform1f(uniforms.uDPR, currentDPR);
    gl.uniform1f(uniforms.uSmoothK, 0.9);  

    let allBlobs = Object.values(activeWindows).filter(p => (now - p.time) < 800);
    allBlobs.push({ id: myId, color: myColor, cx: bounds.cx, cy: bounds.cy, speed: mySpeed });
    allBlobs.sort((a, b) => a.id.localeCompare(b.id));

    const maxBlobs = 10;
    let blobsData = new Float32Array(maxBlobs * 3);
    let colorsData = new Float32Array(maxBlobs * 3);
    let speedsData = new Float32Array(maxBlobs);
    let radiiData = new Float32Array(maxBlobs);
    
    let count = 0;
    const BASE_RADIUS = 0.18;
    const MASS_LOSS_FACTOR = 0.025; 
    
    for (let i = 0; i < allBlobs.length; i++) {
        if (count >= maxBlobs) break;
        const peer = allBlobs[i];
        
        let dx = peer.cx - bounds.cx;
        let dy = peer.cy - bounds.cy;

        blobsData[count*3+0] = dx / PIXEL_SCALE;
        blobsData[count*3+1] = -dy / PIXEL_SCALE; 
        blobsData[count*3+2] = 0.0;

        let peerRgb = hexToRgb(peer.color);
        colorsData[count*3+0] = peerRgb.r;
        colorsData[count*3+1] = peerRgb.g;
        colorsData[count*3+2] = peerRgb.b;
        
        speedsData[count] = peer.speed || 0.0;

        // Kütle kaybı hesaplama (uzadıkça küçülme)
        let stretch = 0;
        if (i > 0) {
            let pdx = peer.cx - allBlobs[i-1].cx;
            let pdy = peer.cy - allBlobs[i-1].cy;
            stretch += Math.hypot(pdx, pdy) / PIXEL_SCALE;
        }
        if (i < allBlobs.length - 1) {
            let ndx = peer.cx - allBlobs[i+1].cx;
            let ndy = peer.cy - allBlobs[i+1].cy;
            stretch += Math.hypot(ndx, ndy) / PIXEL_SCALE;
        }
        radiiData[count] = Math.max(0.04, BASE_RADIUS - (stretch * MASS_LOSS_FACTOR));

        count++;
    }

    gl.uniform1i(uniforms.uBlobCount, count);
    gl.uniform3fv(uniforms.uBlobs, blobsData);
    gl.uniform3fv(uniforms.uColors, colorsData);
    gl.uniform1fv(uniforms.uSpeeds, speedsData);
    gl.uniform1fv(uniforms.uRadii, radiiData);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(loop);
}
loop();