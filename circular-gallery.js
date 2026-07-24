/**
 * Circular Gallery — vanilla port of React Bits CircularGallery (OGL).
 * Drag / wheel inside the stage to spin the arc.
 */
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'https://cdn.jsdelivr.net/npm/ogl@1.0.11/+esm';

function debounce(fn, wait) {
  var t;
  return function () {
    var ctx = this, args = arguments;
    clearTimeout(t);
    t = setTimeout(function () { fn.apply(ctx, args); }, wait);
  };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function autoBind(instance) {
  var proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach(function (key) {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance);
    }
  });
}

function getFontSize(font) {
  var m = String(font || '').match(/(\d+)px/);
  return m ? parseInt(m[1], 10) : 30;
}

function createTextTexture(gl, text, font, color) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  ctx.font = font;
  var metrics = ctx.measureText(text);
  var textWidth = Math.ceil(metrics.width);
  var fontSize = getFontSize(font);
  var textHeight = Math.ceil(fontSize * 1.2);
  canvas.width = textWidth + 24;
  canvas.height = textHeight + 20;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  var texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture: texture, width: canvas.width, height: canvas.height };
}

function Title(opts) {
  autoBind(this);
  this.gl = opts.gl;
  this.plane = opts.plane;
  this.text = opts.text;
  this.textColor = opts.textColor || '#f2f4f8';
  this.font = opts.font || 'bold 28px Syne, sans-serif';
  this.createMesh();
}

Title.prototype.createMesh = function () {
  var pack = createTextTexture(this.gl, this.text, this.font, this.textColor);
  var geometry = new Plane(this.gl);
  var program = new Program(this.gl, {
    vertex: [
      'attribute vec3 position;',
      'attribute vec2 uv;',
      'uniform mat4 modelViewMatrix;',
      'uniform mat4 projectionMatrix;',
      'varying vec2 vUv;',
      'void main(){',
      '  vUv = uv;',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      '}'
    ].join('\n'),
    fragment: [
      'precision highp float;',
      'uniform sampler2D tMap;',
      'varying vec2 vUv;',
      'void main(){',
      '  vec4 color = texture2D(tMap, vUv);',
      '  if (color.a < 0.1) discard;',
      '  gl_FragColor = color;',
      '}'
    ].join('\n'),
    uniforms: { tMap: { value: pack.texture } },
    transparent: true
  });
  this.mesh = new Mesh(this.gl, { geometry: geometry, program: program });
  var aspect = pack.width / pack.height;
  var textHeightScaled = this.plane.scale.y * 0.14;
  var textWidthScaled = textHeightScaled * aspect;
  this.mesh.scale.set(textWidthScaled, textHeightScaled, 1);
  this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeightScaled * 0.55 - 0.04;
  this.mesh.setParent(this.plane);
};

function Media(opts) {
  this.extra = 0;
  this.speed = 0;
  this.isBefore = false;
  this.isAfter = false;
  this.geometry = opts.geometry;
  this.gl = opts.gl;
  this.image = opts.image;
  this.index = opts.index;
  this.length = opts.length;
  this.renderer = opts.renderer;
  this.scene = opts.scene;
  this.screen = opts.screen;
  this.text = opts.text;
  this.viewport = opts.viewport;
  this.bend = opts.bend;
  this.textColor = opts.textColor;
  this.borderRadius = opts.borderRadius == null ? 0.05 : opts.borderRadius;
  this.font = opts.font;
  this.createShader();
  this.createMesh();
  this.createTitle();
  this.onResize();
}

Media.prototype.createShader = function () {
  var self = this;
  var texture = new Texture(this.gl, { generateMipmaps: true });
  this.program = new Program(this.gl, {
    depthTest: false,
    depthWrite: false,
    vertex: [
      'precision highp float;',
      'attribute vec3 position;',
      'attribute vec2 uv;',
      'uniform mat4 modelViewMatrix;',
      'uniform mat4 projectionMatrix;',
      'uniform float uTime;',
      'uniform float uSpeed;',
      'varying vec2 vUv;',
      'void main(){',
      '  vUv = uv;',
      '  vec3 p = position;',
      '  p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.08 + uSpeed * 0.45);',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);',
      '}'
    ].join('\n'),
    fragment: [
      'precision highp float;',
      'uniform vec2 uImageSizes;',
      'uniform vec2 uPlaneSizes;',
      'uniform sampler2D tMap;',
      'uniform float uBorderRadius;',
      'varying vec2 vUv;',
      'float roundedBoxSDF(vec2 p, vec2 b, float r){',
      '  vec2 d = abs(p) - b;',
      '  return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;',
      '}',
      'void main(){',
      '  vec2 ratio = vec2(',
      '    min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),',
      '    min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)',
      '  );',
      '  vec2 uv = vec2(',
      '    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,',
      '    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5',
      '  );',
      '  vec4 color = texture2D(tMap, uv);',
      '  float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);',
      '  float alpha = 1.0 - smoothstep(-0.002, 0.002, d);',
      '  gl_FragColor = vec4(color.rgb, alpha);',
      '}'
    ].join('\n'),
    uniforms: {
      tMap: { value: texture },
      uPlaneSizes: { value: [0, 0] },
      uImageSizes: { value: [1, 1] },
      uSpeed: { value: 0 },
      uTime: { value: 100 * Math.random() },
      uBorderRadius: { value: this.borderRadius }
    },
    transparent: true
  });
  var img = new Image();
  img.decoding = 'async';
  img.src = this.image;
  img.onload = function () {
    texture.image = img;
    self.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
  };
};

Media.prototype.createMesh = function () {
  this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
  this.plane.setParent(this.scene);
};

Media.prototype.createTitle = function () {
  this.title = new Title({
    gl: this.gl,
    plane: this.plane,
    text: this.text,
    textColor: this.textColor,
    font: this.font
  });
};

Media.prototype.update = function (scroll, direction) {
  this.plane.position.x = this.x - scroll.current - this.extra;
  var x = this.plane.position.x;
  var H = this.viewport.width / 2;

  if (this.bend === 0) {
    this.plane.position.y = 0;
    this.plane.rotation.z = 0;
  } else {
    var B_abs = Math.abs(this.bend);
    var R = (H * H + B_abs * B_abs) / (2 * B_abs);
    var effectiveX = Math.min(Math.abs(x), H);
    var arc = R - Math.sqrt(Math.max(R * R - effectiveX * effectiveX, 0));
    if (this.bend > 0) {
      this.plane.position.y = -arc;
      this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
    } else {
      this.plane.position.y = arc;
      this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
    }
  }

  this.speed = scroll.current - scroll.last;
  this.program.uniforms.uTime.value += 0.04;
  this.program.uniforms.uSpeed.value = this.speed;

  var planeOffset = this.plane.scale.x / 2;
  var viewportOffset = this.viewport.width / 2;
  this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
  this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
  if (direction === 'right' && this.isBefore) {
    this.extra -= this.widthTotal;
    this.isBefore = this.isAfter = false;
  }
  if (direction === 'left' && this.isAfter) {
    this.extra += this.widthTotal;
    this.isBefore = this.isAfter = false;
  }
};

Media.prototype.onResize = function (payload) {
  if (payload && payload.screen) this.screen = payload.screen;
  if (payload && payload.viewport) this.viewport = payload.viewport;
  this.scale = this.screen.height / 1500;
  this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height;
  this.plane.scale.x = (this.viewport.width * (700 * this.scale)) / this.screen.width;
  this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
  this.padding = 2;
  this.width = this.plane.scale.x + this.padding;
  this.widthTotal = this.width * this.length;
  this.x = this.width * this.index;
  if (this.title && this.title.mesh) {
    var aspect = this.title.mesh.scale.x / Math.max(this.title.mesh.scale.y, 0.0001);
    var textHeightScaled = this.plane.scale.y * 0.14;
    this.title.mesh.scale.set(textHeightScaled * aspect, textHeightScaled, 1);
    this.title.mesh.position.y = -this.plane.scale.y * 0.5 - textHeightScaled * 0.55 - 0.04;
  }
};

function App(container, config) {
  config = config || {};
  this.container = container;
  this.scrollSpeed = config.scrollSpeed == null ? 2 : config.scrollSpeed;
  // Slow continuous drift when idle (world units per frame @ ~60fps)
  this.autoScrollSpeed = config.autoScrollSpeed == null ? 0.045 : config.autoScrollSpeed;
  this.autoResumeMs = config.autoResumeMs == null ? 1800 : config.autoResumeMs;
  this.scroll = { ease: config.scrollEase == null ? 0.05 : config.scrollEase, current: 0, target: 0, last: 0 };
  this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);
  this.medias = [];
  this.visible = true;
  this.raf = 0;
  this.isDown = false;
  this.start = 0;
  this.autoPausedUntil = 0;
  this.createRenderer();
  this.createCamera();
  this.createScene();
  this.onResize();
  this.createGeometry();
  this.createMedias(config.items, config.bend, config.textColor, config.borderRadius, config.font);
  this.addEventListeners();
  this.update();
}

App.prototype.pauseAutoScroll = function () {
  this.autoPausedUntil = performance.now() + this.autoResumeMs;
};

App.prototype.createRenderer = function () {
  this.renderer = new Renderer({
    alpha: true,
    antialias: true,
    dpr: Math.min(window.devicePixelRatio || 1, 2)
  });
  this.gl = this.renderer.gl;
  this.gl.clearColor(0, 0, 0, 0);
  var canvas = this.renderer.gl.canvas;
  canvas.className = 'cg-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  this.container.appendChild(canvas);
};

App.prototype.createCamera = function () {
  this.camera = new Camera(this.gl);
  this.camera.fov = 45;
  this.camera.position.z = 20;
};

App.prototype.createScene = function () {
  this.scene = new Transform();
};

App.prototype.createGeometry = function () {
  this.planeGeometry = new Plane(this.gl, { heightSegments: 40, widthSegments: 80 });
};

App.prototype.createMedias = function (items, bend, textColor, borderRadius, font) {
  bend = bend == null ? 1 : bend;
  textColor = textColor || '#f4f1ea';
  borderRadius = borderRadius == null ? 0.05 : borderRadius;
  font = font || '600 28px Syne, sans-serif';
  var galleryItems = (items && items.length) ? items : [];
  // Duplicate for seamless infinite loop
  this.mediasImages = galleryItems.concat(galleryItems);
  var self = this;
  this.medias = this.mediasImages.map(function (data, index) {
    return new Media({
      geometry: self.planeGeometry,
      gl: self.gl,
      image: data.image,
      index: index,
      length: self.mediasImages.length,
      renderer: self.renderer,
      scene: self.scene,
      screen: self.screen,
      text: data.text,
      viewport: self.viewport,
      bend: bend,
      textColor: textColor,
      borderRadius: borderRadius,
      font: font
    });
  });
};

App.prototype.onTouchDown = function (e) {
  this.isDown = true;
  this.pauseAutoScroll();
  this.scroll.position = this.scroll.current;
  this.start = e.touches ? e.touches[0].clientX : e.clientX;
  this.container.classList.add('is-dragging');
  if (window.lenis) window.lenis.stop();
};

App.prototype.onTouchMove = function (e) {
  if (!this.isDown) return;
  this.pauseAutoScroll();
  var x = e.touches ? e.touches[0].clientX : e.clientX;
  // Gentle drag so the ring turns slowly under the finger
  var distance = (this.start - x) * (this.scrollSpeed * 0.018);
  this.scroll.target = (this.scroll.position || 0) + distance;
  if (e.cancelable) e.preventDefault();
};

App.prototype.onTouchUp = function () {
  this.isDown = false;
  this.pauseAutoScroll();
  this.container.classList.remove('is-dragging');
  // Don't snap-to-item — keep free continuous scroll for auto-drift
  if (window.lenis) window.lenis.start();
};

App.prototype.onWheel = function (e) {
  this.pauseAutoScroll();
  var delta = e.deltaY || e.wheelDelta || e.detail || 0;
  this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.12;
  e.preventDefault();
};

App.prototype.onCheck = function () {
  if (!this.medias || !this.medias[0]) return;
  var width = this.medias[0].width;
  var itemIndex = Math.round(Math.abs(this.scroll.target) / width);
  var item = width * itemIndex;
  this.scroll.target = this.scroll.target < 0 ? -item : item;
};

App.prototype.onResize = function () {
  this.screen = {
    width: this.container.clientWidth || 1,
    height: this.container.clientHeight || 1
  };
  this.renderer.setSize(this.screen.width, this.screen.height);
  this.camera.perspective({ aspect: this.screen.width / this.screen.height });
  var fov = (this.camera.fov * Math.PI) / 180;
  var height = 2 * Math.tan(fov / 2) * this.camera.position.z;
  var width = height * this.camera.aspect;
  this.viewport = { width: width, height: height };
  if (this.medias) {
    var self = this;
    this.medias.forEach(function (media) {
      media.onResize({ screen: self.screen, viewport: self.viewport });
    });
  }
};

App.prototype.update = function () {
  var self = this;
  if (this.visible) {
    // Steady slow spin when the user isn't dragging / just finished interacting
    if (!this.isDown && performance.now() >= this.autoPausedUntil) {
      this.scroll.target += this.autoScrollSpeed;
    }
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    var direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
    this.medias.forEach(function (media) {
      media.update(self.scroll, direction);
    });
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
  }
  this.raf = requestAnimationFrame(function () { self.update(); });
};

App.prototype.setVisible = function (on) {
  this.visible = !!on;
};

App.prototype.addEventListeners = function () {
  this.boundOnResize = this.onResize.bind(this);
  this.boundOnWheel = this.onWheel.bind(this);
  this.boundOnTouchDown = this.onTouchDown.bind(this);
  this.boundOnTouchMove = this.onTouchMove.bind(this);
  this.boundOnTouchUp = this.onTouchUp.bind(this);
  window.addEventListener('resize', this.boundOnResize);
  // Scope interaction to the gallery only (don't fight Lenis site scroll)
  this.container.addEventListener('wheel', this.boundOnWheel, { passive: false });
  this.container.addEventListener('mousedown', this.boundOnTouchDown);
  window.addEventListener('mousemove', this.boundOnTouchMove);
  window.addEventListener('mouseup', this.boundOnTouchUp);
  this.container.addEventListener('touchstart', this.boundOnTouchDown, { passive: true });
  this.container.addEventListener('touchmove', this.boundOnTouchMove, { passive: false });
  this.container.addEventListener('touchend', this.boundOnTouchUp);
};

App.prototype.destroy = function () {
  cancelAnimationFrame(this.raf);
  window.removeEventListener('resize', this.boundOnResize);
  this.container.removeEventListener('wheel', this.boundOnWheel);
  this.container.removeEventListener('mousedown', this.boundOnTouchDown);
  window.removeEventListener('mousemove', this.boundOnTouchMove);
  window.removeEventListener('mouseup', this.boundOnTouchUp);
  this.container.removeEventListener('touchstart', this.boundOnTouchDown);
  this.container.removeEventListener('touchmove', this.boundOnTouchMove);
  this.container.removeEventListener('touchend', this.boundOnTouchUp);
  if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
    this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
  }
};

var DEFAULT_ITEMS = [
  { image: 'images/fol/1000253866.jpg', text: 'Pitch Day' },
  { image: 'images/fol/1000253867.jpg', text: 'Review Meet' },
  { image: 'images/fol/1000253868.jpg', text: 'Power Strikes' },
  { image: 'images/fol/1000253869.jpg', text: 'Exhibit Frame' },
  { image: 'images/fol/1000253870.jpg', text: 'Build Stage' },
  { image: 'images/fol/1000253871.jpg', text: 'Workshop Build' },
  { image: 'images/fol/1000253872.jpg', text: 'Soldering' },
  { image: 'images/fol/1000253873.jpg', text: 'Team Build' },
  { image: 'images/fol/1000253874.jpg', text: 'Bench Work' },
  { image: 'images/fol/1000253875.jpg', text: 'Wiring' },
  { image: 'images/fol/1000253876.jpg', text: 'Piezo Array' },
  { image: 'images/fol/1000253877.jpg', text: 'Sensor Grid' },
  { image: 'images/fol/1000253878.jpg', text: 'Pipe Matrix' },
  { image: 'images/fol/1000253879.jpg', text: 'Prototype Deck' },
  { image: 'images/fol/1000253880.jpg', text: 'Circuit Board' },
  { image: 'images/fol/1000253881.jpg', text: 'Hardware Lab' },
  { image: 'images/fol/1000253882.jpg', text: 'Campus Crew' },
  { image: 'images/fol/1000253883.jpg', text: 'Certificate' },
  { image: 'images/fol/1000253884.jpg', text: 'Recognition' },
  { image: 'images/fol/1000253885.jpg', text: 'Power Team' },
  { image: 'images/fol/1000253886.jpg', text: 'Exhibit Night' }
];

function bootCircularGallery() {
  var stage = document.getElementById('circularGallery');
  if (!stage) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = DEFAULT_ITEMS;

  // Prefer images/fol/* discovered from data attributes if present
  var preset = stage.getAttribute('data-items');
  if (preset) {
    try { items = JSON.parse(preset); } catch (e) {}
  }

  if (reduceMotion) {
    stage.classList.add('cg-fallback');
    stage.innerHTML = items.map(function (it) {
      return '<figure class="cg-fallback-card"><img src="' + it.image + '" alt="' + it.text.replace(/"/g, '&quot;') + '" loading="lazy"><figcaption>' + it.text + '</figcaption></figure>';
    }).join('');
    return;
  }

  var app = null;
  function start() {
    if (app) return;
    app = new App(stage, {
      items: items,
      bend: 1,
      textColor: '#f4efe6',
      borderRadius: 0.05,
      font: '600 28px Syne, sans-serif',
      scrollSpeed: 1.6,
      scrollEase: 0.045,
      autoScrollSpeed: 0.048,
      autoResumeMs: 1600
    });
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          start();
          if (app) app.setVisible(true);
        } else if (app) {
          app.setVisible(false);
        }
      });
    }, { threshold: 0.12 });
    io.observe(stage);
  } else {
    start();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootCircularGallery);
} else {
  bootCircularGallery();
}
