/* Original animated-image treatment for the opening music world. The image remains
   visible whenever WebGL is unavailable, motion is paused, or motion is reduced. */
(() => {
  'use strict';
  const page = document.querySelector('#page');
  const stage = document.querySelector('.opening-stage');
  const orb = document.querySelector('.orb-inner');
  const shade = document.querySelector('.orb-shade');
  const heading = document.querySelector('.hero-heading');
  const canvas = document.querySelector('#heroMotionCanvas');
  const source = document.querySelector('.hero-art');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width: 800px)');
  const gl = !reduced.matches && !narrow.matches && canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
  const pointer = { x: .5, y: .5, strength: 0 };
  const smoothed = { x: .5, y: .5, strength: 0 };
  let lastFrame = 0;
  let elapsed = 0;
  let renderer = null;
  let canvasWidth = 1;
  let canvasHeight = 1;

  function createShader(type, sourceCode) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function prepareRenderer() {
    if (!gl || !source.naturalWidth || renderer) return;
    const vertex = createShader(gl.VERTEX_SHADER, `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * .5 + .5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `);
    const fragment = createShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      varying vec2 v_uv;
      uniform sampler2D u_image;
      uniform vec2 u_mouse;
      uniform vec2 u_cover;
      uniform float u_strength;
      uniform float u_time;
      uniform float u_motion;
      void main() {
        vec2 uv = v_uv;
        vec2 delta = uv - u_mouse;
        float radius = length(delta);
        float touch = exp(-dot(delta, delta) * 17.0) * u_strength * u_motion;
        vec2 wave = vec2(
          sin(uv.y * 10.0 + uv.x * 4.0 + u_time * .55) * .0042
            + sin(uv.y * 22.0 - u_time * .84) * .0014,
          sin(uv.x * 11.0 - uv.y * 3.0 - u_time * .49) * .0035
            + cos(uv.x * 19.0 + u_time * .67) * .0012
        );
        wave = wave * u_motion + normalize(delta + vec2(.001)) * touch * (.014 + .009 * sin(radius * 19.0 - u_time * 2.3));
        vec2 textureUV = (uv - .5) * u_cover + .5 + wave;
        vec3 color = texture2D(u_image, clamp(textureUV, .001, .999)).rgb;
        float travelingLight = sin((uv.x + uv.y * .42) * 7.0 - u_time * .48) * .5 + .5;
        color += vec3(.027, .012, .009) * travelingLight;
        color += vec3(.082, .024, .018) * touch;
        gl_FragColor = vec4(color, 1.0);
      }
    `);
    if (!vertex || !fragment) return;
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);
    renderer = {
      cover: gl.getUniformLocation(program, 'u_cover'),
      mouse: gl.getUniformLocation(program, 'u_mouse'),
      strength: gl.getUniformLocation(program, 'u_strength'),
      time: gl.getUniformLocation(program, 'u_time'),
      motion: gl.getUniformLocation(program, 'u_motion')
    };
    stage.classList.add('hero-motion-ready');
    resize();
  }

  function resize() {
    if (!renderer) return;
    const width = page.clientWidth;
    const height = page.clientHeight;
    const resolution = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(2100000 / (width * height)));
    canvasWidth = canvas.width = Math.round(width * resolution);
    canvasHeight = canvas.height = Math.round(height * resolution);
    gl.viewport(0, 0, canvasWidth, canvasHeight);
    const viewportAspect = width / height;
    const imageAspect = source.naturalWidth / source.naturalHeight;
    gl.uniform2f(renderer.cover,
      Math.min(1, viewportAspect / imageAspect),
      Math.min(1, imageAspect / viewportAspect));
  }

  page.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || page.scrollTop > page.clientHeight * 2.6) return;
    const bounds = page.getBoundingClientRect();
    pointer.x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    pointer.y = Math.max(0, Math.min(1, 1 - (event.clientY - bounds.top) / page.clientHeight));
    pointer.strength = 1;
  }, { passive: true });
  page.addEventListener('pointerleave', () => { pointer.strength = 0; }, { passive: true });
  window.addEventListener('blur', () => { pointer.strength = 0; });
  window.addEventListener('resize', resize);
  if (source.complete && source.naturalWidth) prepareRenderer();
  else source.addEventListener('load', prepareRenderer, { once: true });

  function draw(now) {
    requestAnimationFrame(draw);
    if (document.hidden || now - lastFrame < 31) return;
    const delta = Math.min((now - lastFrame) / 1000, .08);
    lastFrame = now;
    const paused = reduced.matches || narrow.matches || document.body.classList.contains('motion-paused');
    const inScene = page.scrollTop < page.clientHeight * 2.6;
    canvas.style.visibility = paused ? 'hidden' : 'visible';
    if (paused || !inScene) {
      orb.style.transform = '';
      heading.style.setProperty('--title-x', '0px');
      heading.style.setProperty('--title-y', '0px');
      return;
    }
    elapsed += delta;
    smoothed.x += (pointer.x - smoothed.x) * .075;
    smoothed.y += (pointer.y - smoothed.y) * .075;
    smoothed.strength += (pointer.strength - smoothed.strength) * .07;
    const driftX = Math.sin(elapsed * .31) * .012;
    const driftY = Math.cos(elapsed * .25) * .01;
    const openingMotion = Math.max(0, 1 - page.scrollTop / (page.clientHeight * .52));
    const x = smoothed.x - .5;
    const y = .5 - smoothed.y;
    orb.style.transform = `translate3d(${((x * -17 + driftX * 55) * openingMotion).toFixed(2)}px, ${((y * -12 + driftY * 55) * openingMotion).toFixed(2)}px, 0)`;
    heading.style.setProperty('--title-x', `${(x * 14).toFixed(2)}px`);
    heading.style.setProperty('--title-y', `${(y * 9).toFixed(2)}px`);
    shade.style.setProperty('--glow-x', `${(50 + x * 18 + driftX * 200).toFixed(2)}%`);
    shade.style.setProperty('--glow-y', `${(50 + y * 15 + driftY * 200).toFixed(2)}%`);
    if (!renderer) return;
    gl.uniform2f(renderer.mouse, smoothed.x, smoothed.y);
    gl.uniform1f(renderer.strength, smoothed.strength);
    gl.uniform1f(renderer.time, elapsed);
    gl.uniform1f(renderer.motion, openingMotion);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  requestAnimationFrame(draw);
})();
