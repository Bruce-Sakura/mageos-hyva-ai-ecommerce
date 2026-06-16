/**
 * Premium homepage effects — Hyvä-native ports of two React Bits components.
 *
 *  - lightRays  : a faithful port of <LightRays/>. The original used `ogl` (a thin
 *                 WebGL wrapper) + React. The actual visual is the GLSL fragment
 *                 shader below, kept verbatim; `ogl`'s Renderer/Program/Triangle/Mesh
 *                 are replaced with ~40 lines of raw WebGL. No React, no ogl.
 *  - borderGlow : a port of <BorderGlow/>. That component is ~95% CSS (see
 *                 components/border-glow.css); the only JS is pointer tracking that
 *                 writes two CSS custom properties, which is all this does.
 *
 * Both are registered as Alpine.js components, the idiomatic Hyvä way.
 */
(function () {
    'use strict';

    /* ------------------------------------------------------------------ *
     *  LightRays (raw WebGL)
     * ------------------------------------------------------------------ */

    const VERT = `attribute vec2 position;
varying vec2 vUv;
void main(){ vUv = position * 0.5 + 0.5; gl_Position = vec4(position, 0.0, 1.0); }`;

    // Fragment shader copied unchanged from the React Bits component.
    const FRAG = `precision highp float;

uniform float iTime;
uniform vec2  iResolution;

uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;

  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);

  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);

  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,
                           1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,
                           1.1 * raysSpeed);

  fragColor = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.1 + brightness * 0.8;
  fragColor.y *= 0.3 + brightness * 0.6;
  fragColor.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  fragColor.rgb *= raysColor;
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}`;

    function hexToRgb(hex) {
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
    }

    function getAnchorAndDir(origin, w, h) {
        const o = 0.2;
        switch (origin) {
            case 'top-left': return { anchor: [0, -o * h], dir: [0, 1] };
            case 'top-right': return { anchor: [w, -o * h], dir: [0, 1] };
            case 'left': return { anchor: [-o * w, 0.5 * h], dir: [1, 0] };
            case 'right': return { anchor: [(1 + o) * w, 0.5 * h], dir: [-1, 0] };
            case 'bottom-left': return { anchor: [0, (1 + o) * h], dir: [0, -1] };
            case 'bottom-center': return { anchor: [0.5 * w, (1 + o) * h], dir: [0, -1] };
            case 'bottom-right': return { anchor: [w, (1 + o) * h], dir: [0, -1] };
            default: return { anchor: [0.5 * w, -o * h], dir: [0, 1] };
        }
    }

    function compileShader(gl, type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.warn('LightRays shader compile error:', gl.getShaderInfoLog(s));
        }
        return s;
    }

    function lightRays(opts) {
        opts = opts || {};
        return {
            o: {
                raysOrigin: opts.raysOrigin || 'top-center',
                raysColor: opts.raysColor || '#ffffff',
                raysSpeed: opts.raysSpeed != null ? opts.raysSpeed : 1,
                lightSpread: opts.lightSpread != null ? opts.lightSpread : 1,
                rayLength: opts.rayLength != null ? opts.rayLength : 2,
                pulsating: opts.pulsating ? 1 : 0,
                fadeDistance: opts.fadeDistance != null ? opts.fadeDistance : 1,
                saturation: opts.saturation != null ? opts.saturation : 1,
                followMouse: opts.followMouse != null ? opts.followMouse : true,
                mouseInfluence: opts.mouseInfluence != null ? opts.mouseInfluence : 0.1,
                noiseAmount: opts.noiseAmount != null ? opts.noiseAmount : 0,
                distortion: opts.distortion != null ? opts.distortion : 0
            },
            _gl: null, _prog: null, _loc: {}, _canvas: null, _raf: null, _io: null,
            _onResize: null, _onMove: null,
            _mouse: { x: 0.5, y: 0.5 }, _smooth: { x: 0.5, y: 0.5 },

            init() {
                if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    return; // respect reduced-motion: leave the dark container as-is
                }
                if (!window.WebGLRenderingContext) {
                    return; // graceful no-op when WebGL is unavailable
                }
                this._io = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting) {
                        this._start();
                    } else {
                        this._stop();
                    }
                }, { threshold: 0.05 });
                this._io.observe(this.$el);
            },

            destroy() {
                this._stop();
                if (this._io) { this._io.disconnect(); this._io = null; }
                if (this._onResize) { window.removeEventListener('resize', this._onResize); this._onResize = null; }
                if (this._onMove) { window.removeEventListener('mousemove', this._onMove); this._onMove = null; }
                if (this._gl) {
                    const ext = this._gl.getExtension('WEBGL_lose_context');
                    if (ext) { ext.loseContext(); }
                    this._gl = null;
                }
                if (this._canvas && this._canvas.parentNode) {
                    this._canvas.parentNode.removeChild(this._canvas);
                }
                this._canvas = null;
            },

            _start() {
                if (this._gl) { if (!this._raf) { this._loop(performance.now()); } return; }

                const canvas = document.createElement('canvas');
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.display = 'block';
                const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: true });
                if (!gl) { return; }

                this._canvas = canvas;
                this._gl = gl;

                const prog = gl.createProgram();
                gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, VERT));
                gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, FRAG));
                gl.linkProgram(prog);
                gl.useProgram(prog);
                this._prog = prog;

                // Full-screen triangle covering clip space (replaces ogl's Triangle geometry)
                const buf = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
                const posLoc = gl.getAttribLocation(prog, 'position');
                gl.enableVertexAttribArray(posLoc);
                gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

                ['iTime', 'iResolution', 'rayPos', 'rayDir', 'raysColor', 'raysSpeed',
                 'lightSpread', 'rayLength', 'pulsating', 'fadeDistance', 'saturation',
                 'mousePos', 'mouseInfluence', 'noiseAmount', 'distortion'
                ].forEach((n) => { this._loc[n] = gl.getUniformLocation(prog, n); });

                const o = this.o, L = this._loc;
                gl.uniform3fv(L.raysColor, hexToRgb(o.raysColor));
                gl.uniform1f(L.raysSpeed, o.raysSpeed);
                gl.uniform1f(L.lightSpread, o.lightSpread);
                gl.uniform1f(L.rayLength, o.rayLength);
                gl.uniform1f(L.pulsating, o.pulsating);
                gl.uniform1f(L.fadeDistance, o.fadeDistance);
                gl.uniform1f(L.saturation, o.saturation);
                gl.uniform1f(L.mouseInfluence, o.followMouse ? o.mouseInfluence : 0);
                gl.uniform1f(L.noiseAmount, o.noiseAmount);
                gl.uniform1f(L.distortion, o.distortion);
                gl.uniform2f(L.mousePos, 0.5, 0.5);

                this.$el.appendChild(canvas);

                this._onResize = () => this._resize();
                window.addEventListener('resize', this._onResize);

                if (o.followMouse) {
                    this._onMove = (e) => {
                        const r = this.$el.getBoundingClientRect();
                        this._mouse = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
                    };
                    window.addEventListener('mousemove', this._onMove);
                }

                this._resize();
                this._loop(performance.now());
            },

            _stop() {
                if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
            },

            _resize() {
                const gl = this._gl;
                if (!gl) { return; }
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                const w = Math.max(1, Math.floor(this.$el.clientWidth * dpr));
                const h = Math.max(1, Math.floor(this.$el.clientHeight * dpr));
                this._canvas.width = w;
                this._canvas.height = h;
                gl.viewport(0, 0, w, h);
                gl.uniform2f(this._loc.iResolution, w, h);
                const ad = getAnchorAndDir(this.o.raysOrigin, w, h);
                gl.uniform2f(this._loc.rayPos, ad.anchor[0], ad.anchor[1]);
                gl.uniform2f(this._loc.rayDir, ad.dir[0], ad.dir[1]);
            },

            _loop(t) {
                const gl = this._gl;
                if (!gl) { return; }
                gl.uniform1f(this._loc.iTime, t * 0.001);
                if (this.o.followMouse && this.o.mouseInfluence > 0) {
                    const s = 0.92;
                    this._smooth.x = this._smooth.x * s + this._mouse.x * (1 - s);
                    this._smooth.y = this._smooth.y * s + this._mouse.y * (1 - s);
                    gl.uniform2f(this._loc.mousePos, this._smooth.x, this._smooth.y);
                }
                gl.drawArrays(gl.TRIANGLES, 0, 3);
                this._raf = requestAnimationFrame((tt) => this._loop(tt));
            }
        };
    }

    /* ------------------------------------------------------------------ *
     *  BorderGlow (pointer tracking only — all visuals live in CSS)
     * ------------------------------------------------------------------ */

    function borderGlow(opts) {
        opts = opts || {};
        return {
            init() {
                // CSS handles the resting state; nothing to do until the pointer moves.
            },
            onMove(e) {
                const el = this.$el;
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const cx = rect.width / 2;
                const cy = rect.height / 2;
                const dx = x - cx;
                const dy = y - cy;

                let kx = Infinity;
                let ky = Infinity;
                if (dx !== 0) { kx = cx / Math.abs(dx); }
                if (dy !== 0) { ky = cy / Math.abs(dy); }
                const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);

                let deg = 0;
                if (dx !== 0 || dy !== 0) {
                    deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
                    if (deg < 0) { deg += 360; }
                }

                el.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
                el.style.setProperty('--cursor-angle', deg.toFixed(3) + 'deg');
            }
        };
    }

    /* ------------------------------------------------------------------ *
     *  Invite / referral entry modal (£50 reward + perpetual 99% bar)
     * ------------------------------------------------------------------ */

    function inviteModal() {
        return {
            open: false,
            progress: 99.8, // fixed, no animation
            copied: false,
            canShare: false,
            link: '',

            init() {
                // Personal-looking referral link
                const code = 'GET50-' + Math.random().toString(36).slice(2, 8).toUpperCase();
                const origin = window.location && window.location.origin ? window.location.origin : '';
                this.link = origin + '/?ref=' + code;
                this.canShare = typeof navigator !== 'undefined' && !!navigator.share;

                // Show on every visit/entry
                this.open = true;
            },

            close() {
                this.open = false;
            },

            copy() {
                const done = () => { this.copied = true; setTimeout(() => { this.copied = false; }, 2000); };
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(this.link).then(done).catch(() => {});
                } else if (this.$refs.linkInput) {
                    this.$refs.linkInput.select();
                    try { document.execCommand('copy'); done(); } catch (e) {}
                }
            },

            share() {
                if (navigator.share) {
                    navigator.share({
                        title: 'Get £50 at Develo',
                        text: 'Join Develo with my link and we both get £50 credit.',
                        url: this.link
                    }).catch(() => {});
                }
            }
        };
    }

    document.addEventListener('alpine:init', () => {
        window.Alpine.data('lightRays', lightRays);
        window.Alpine.data('borderGlow', borderGlow);
        window.Alpine.data('inviteModal', inviteModal);
    });
})();
