const bgVideo = document.getElementById('bg-video');
let glAnimationId;

function startWebGLFisheye() {
    const canvas = document.getElementById('glassCanvas');
    // Sayfaya göre ilgili kapsayıcıyı seç:
    const dashboard = document.querySelector('.weather-dashboard') || document.querySelector('.content-dashboard');
    
    if (!canvas || !dashboard) return;

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) {
        console.error("Tarayıcı WebGL desteklemiyor!");
        return;
    }

    const vsSource = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y); 
}
`;

    // FRAGMENT SHADER: Apple / iPhone tarzı Glossy Cam, Işık Kırılması ve Bükülme (Refraction)
    const fsSource = `
precision mediump float;
uniform vec2 u_windowResolution; 
uniform vec2 u_canvasOffset;
uniform vec2 u_coverScale;
uniform sampler2D u_videoTexture;
varying vec2 v_texCoord;

void main() {
    vec2 globalPixelCoords = u_canvasOffset + gl_FragCoord.xy;
    vec2 globalUV = globalPixelCoords / u_windowResolution;
    
    globalUV.y = 1.0 - globalUV.y;

    // Video arka planını ekrana tam oturtma koordinatları
    vec2 coverUV = (globalUV - 0.5) * u_coverScale + 0.5;
    
    // Merkeze göre yerel (canvas) koordinatlarımız (-1.0 ile 1.0 arası)
    vec2 localUV = v_texCoord * 2.0 - 1.0;
    
    // Sadece ve sadece kenarları tespit etmek için YUMUŞATILMIŞ köşeli (Superellipse) hesaplama
    float edgeDist = pow( pow(abs(localUV.x), 30.0) + pow(abs(localUV.y), 30.0), 1.0/30.0 );
    
    // ÇOK İNCE BÜKÜLME ALANI
    float distortionEdge = smoothstep(0.95, 1.0, edgeDist);
    
    // 1. İNCE VE KESKİN BÜKÜLME:
    vec2 distortionVec = localUV * distortionEdge * -0.035; 
    
    // 2. ÇOK İNCE IŞIK KIRILMASI (Refraction):
    float refractionEdge = smoothstep(0.98, 1.0, edgeDist);
    float refractionStrength = refractionEdge * 0.012; 
    
    vec2 baseUV = coverUV + distortionVec;
    
    // Kanalları çok ince okuyarak kırılma efekti veriyoruz
    float rChannel = texture2D(u_videoTexture, baseUV + localUV * refractionStrength).r;
    float gChannel = texture2D(u_videoTexture, baseUV).g;
    float bChannel = texture2D(u_videoTexture, baseUV - localUV * refractionStrength).b;
    
    vec4 color = vec4(rChannel, gChannel, bChannel, 1.0);
    
    // 3. GLOSSY (Yansıma) EFEKTİ: iPhone tarzı iç cam yansıma
    float edgeHighlight = smoothstep(0.98, 1.0, edgeDist) * 0.25;
    
    // Orta kısımdaki çok hafif cam parlaması
    float diagonal = (localUV.x + localUV.y) * 0.5;
    float sheen = smoothstep(-0.1, 0.0, diagonal) * smoothstep(0.1, 0.0, diagonal) * 0.03;

    // Işıkları birleştir
    color.rgb += vec3(edgeHighlight + sheen);

    gl_FragColor = color;
}
`;
    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0, -1.0, 1.0, 1.0
    ]), gl.STATIC_DRAW);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 1.0, 0.0, 1.0, 1.0
    ]), gl.STATIC_DRAW);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

    const windowResLocation = gl.getUniformLocation(program, "u_windowResolution");
    const canvasOffsetLocation = gl.getUniformLocation(program, "u_canvasOffset");
    const coverScaleLocation = gl.getUniformLocation(program, "u_coverScale");

    function render() {
        if (!bgVideo || bgVideo.paused || bgVideo.ended) {
            glAnimationId = requestAnimationFrame(render);
            return;
        }

        const rect = dashboard.getBoundingClientRect();
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
            canvas.width = rect.width;
            canvas.height = rect.height;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bgVideo);

        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(texCoordLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(windowResLocation, window.innerWidth, window.innerHeight);

        const vWidth = bgVideo.videoWidth || 1920;
        const vHeight = bgVideo.videoHeight || 1080;

        const windowRatio = window.innerWidth / window.innerHeight;
        const videoRatio = vWidth / vHeight;

        let scaleX = 1.0;
        let scaleY = 1.0;

        if (windowRatio > videoRatio) {
            scaleY = videoRatio / windowRatio;
        } else {
            scaleX = windowRatio / videoRatio;
        }

        const zoomOutFactor = 1.0;

        gl.uniform2f(coverScaleLocation, scaleX * zoomOutFactor, scaleY * zoomOutFactor);
        gl.uniform2f(canvasOffsetLocation, rect.left, window.innerHeight - rect.bottom);

        gl.drawArrays(gl.TRIANGLES, 0, 12);

        glAnimationId = requestAnimationFrame(render);
    }

    cancelAnimationFrame(glAnimationId);
    render();
}

const observer = new MutationObserver(() => {
    if (document.getElementById('glassCanvas')) {
        cancelAnimationFrame(glAnimationId);
        startWebGLFisheye();
    }
});

const containerToObserve = document.getElementById('weatherContainer') || document.body;
if (containerToObserve) {
    observer.observe(containerToObserve, { childList: true, subtree: true });
}

if (bgVideo) {
    bgVideo.addEventListener('loadeddata', startWebGLFisheye);
}

// Check initial status incase it loads fast
if (document.getElementById('glassCanvas')) {
    startWebGLFisheye();
}
