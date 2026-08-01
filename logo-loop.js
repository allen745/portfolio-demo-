/**
 * Logo Loop — vanilla port of React Bits LogoLoop (TS-CSS).
 * Velocity-based seamless marquee with hover slowdown / pause.
 */
(function () {
  'use strict';

  var ANIMATION_CONFIG = {
    SMOOTH_TAU: 0.25,
    MIN_COPIES: 2,
    COPY_HEADROOM: 2
  };

  // Portfolio stack — ivory monochrome via CSS filter on .logoloop img
  var SKILLS_LOGOS = [
    { src: 'images/logos/python.svg', alt: 'Python' },
    { src: 'images/logos/fastapi.svg', alt: 'FastAPI' },
    { src: 'images/logos/tensorflow.svg', alt: 'TensorFlow' },
    { src: 'images/logos/scikitlearn.svg', alt: 'scikit-learn' },
    { src: 'images/logos/numpy.svg', alt: 'NumPy' },
    { src: 'images/logos/pandas.svg', alt: 'Pandas' },
    { src: 'images/logos/react.svg', alt: 'React' },
    { src: 'images/logos/postgresql.svg', alt: 'PostgreSQL' },
    { src: 'images/logos/javascript.svg', alt: 'JavaScript' },
    { src: 'images/logos/git.svg', alt: 'Git' },
    { src: 'images/logos/github.svg', alt: 'GitHub' },
    { src: 'images/logos/vercel.svg', alt: 'Vercel' }
  ];

  function LogoLoop(root, options) {
    options = options || {};
    this.root = root;
    this.logos = options.logos || SKILLS_LOGOS;
    this.speed = options.speed != null ? Number(options.speed) : 100;
    this.direction = options.direction || 'left';
    this.logoHeight = options.logoHeight != null ? Number(options.logoHeight) : 36;
    this.gap = options.gap != null ? Number(options.gap) : 48;
    this.hoverSpeed = options.hoverSpeed != null ? Number(options.hoverSpeed) : 0;
    this.fadeOut = options.fadeOut !== false;
    this.fadeOutColor = options.fadeOutColor || '#06080d';
    this.scaleOnHover = options.scaleOnHover !== false;
    this.ariaLabel = options.ariaLabel || 'Technology stack logos';

    this.isVertical = this.direction === 'up' || this.direction === 'down';
    this.copyCount = ANIMATION_CONFIG.MIN_COPIES;
    this.seqWidth = 0;
    this.seqHeight = 0;
    this.isHovered = false;
    this.visible = true;
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.offset = 0;
    this.velocity = 0;
    this.lastTimestamp = null;
    this.raf = 0;

    this.track = null;
    this.seqEl = null;

    this.mount();
    this.bind();
    this.updateDimensions();
    this.setVisible(true);
  }

  LogoLoop.prototype.targetVelocity = function () {
    var magnitude = Math.abs(this.speed);
    var dirMult;
    if (this.isVertical) dirMult = this.direction === 'up' ? 1 : -1;
    else dirMult = this.direction === 'left' ? 1 : -1;
    var speedMult = this.speed < 0 ? -1 : 1;
    return magnitude * dirMult * speedMult;
  };

  LogoLoop.prototype.mount = function () {
    var root = this.root;
    root.classList.add('logoloop', this.isVertical ? 'logoloop--vertical' : 'logoloop--horizontal');
    if (this.fadeOut) root.classList.add('logoloop--fade');
    if (this.scaleOnHover) root.classList.add('logoloop--scale-hover');
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', this.ariaLabel);
    root.style.setProperty('--logoloop-gap', this.gap + 'px');
    root.style.setProperty('--logoloop-logoHeight', this.logoHeight + 'px');
    if (this.fadeOutColor) root.style.setProperty('--logoloop-fadeColor', this.fadeOutColor);

    root.innerHTML = '<div class="logoloop__track"></div>';
    this.track = root.querySelector('.logoloop__track');
    this.renderCopies();
  };

  LogoLoop.prototype.renderItem = function (item) {
    var alt = (item.alt || item.title || 'Logo').replace(/"/g, '&quot;');
    var img =
      '<img src="' + item.src + '" alt="' + alt + '" loading="lazy" decoding="async" draggable="false">';
    if (item.href) {
      return (
        '<li class="logoloop__item">' +
          '<a class="logoloop__link" href="' + item.href + '" target="_blank" rel="noopener noreferrer" aria-label="' + alt + '">' +
            img +
          '</a>' +
        '</li>'
      );
    }
    return '<li class="logoloop__item">' + img + '</li>';
  };

  LogoLoop.prototype.renderCopies = function () {
    var self = this;
    var itemsHtml = this.logos.map(function (item) { return self.renderItem(item); }).join('');
    var html = '';
    for (var i = 0; i < this.copyCount; i++) {
      html +=
        '<ul class="logoloop__list"' +
        (i === 0 ? ' data-logoloop-seq="true"' : ' aria-hidden="true"') +
        '>' +
        itemsHtml +
        '</ul>';
    }
    this.track.innerHTML = html;
    this.seqEl = this.track.querySelector('[data-logoloop-seq]');
  };

  LogoLoop.prototype.updateDimensions = function () {
    if (!this.seqEl || !this.root) return;
    var containerWidth = this.root.clientWidth || 0;
    var rect = this.seqEl.getBoundingClientRect();
    var sequenceWidth = rect.width || 0;
    var sequenceHeight = rect.height || 0;

    if (this.isVertical) {
      if (sequenceHeight > 0) {
        this.seqHeight = Math.ceil(sequenceHeight);
        var viewport = this.root.clientHeight || sequenceHeight;
        var copiesNeeded = Math.ceil(viewport / sequenceHeight) + ANIMATION_CONFIG.COPY_HEADROOM;
        var next = Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded);
        if (next !== this.copyCount) {
          this.copyCount = next;
          this.renderCopies();
          return this.updateDimensions();
        }
      }
    } else if (sequenceWidth > 0) {
      this.seqWidth = Math.ceil(sequenceWidth);
      var copiesNeededH = Math.ceil(containerWidth / sequenceWidth) + ANIMATION_CONFIG.COPY_HEADROOM;
      var nextH = Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeededH);
      if (nextH !== this.copyCount) {
        this.copyCount = nextH;
        this.renderCopies();
        return this.updateDimensions();
      }
    }
  };

  LogoLoop.prototype.applyTransform = function () {
    if (!this.track) return;
    if (this.isVertical) {
      this.track.style.transform = 'translate3d(0, ' + (-this.offset) + 'px, 0)';
    } else {
      this.track.style.transform = 'translate3d(' + (-this.offset) + 'px, 0, 0)';
    }
  };

  LogoLoop.prototype.tick = function (timestamp) {
    var self = this;
    if (!this.visible || this.reduceMotion) {
      this.raf = 0;
      return;
    }

    if (this.lastTimestamp === null) this.lastTimestamp = timestamp;
    var deltaTime = Math.max(0, timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    var target = this.isHovered ? this.hoverSpeed : this.targetVelocity();
    var easingFactor = 1 - Math.exp(-deltaTime / ANIMATION_CONFIG.SMOOTH_TAU);
    this.velocity += (target - this.velocity) * easingFactor;

    var seqSize = this.isVertical ? this.seqHeight : this.seqWidth;
    if (seqSize > 0) {
      var nextOffset = this.offset + this.velocity * deltaTime;
      nextOffset = ((nextOffset % seqSize) + seqSize) % seqSize;
      this.offset = nextOffset;
      this.applyTransform();
    }

    this.raf = requestAnimationFrame(function (t) { self.tick(t); });
  };

  LogoLoop.prototype.setVisible = function (on) {
    var next = !!on;
    this.visible = next;
    if (this.reduceMotion) {
      this.offset = 0;
      this.applyTransform();
      return;
    }
    if (next) {
      if (!this.raf) {
        this.lastTimestamp = null;
        var self = this;
        this.raf = requestAnimationFrame(function (t) { self.tick(t); });
      }
    } else if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.lastTimestamp = null;
    }
  };

  LogoLoop.prototype.bind = function () {
    var self = this;

    this.onEnter = function () { self.isHovered = true; };
    this.onLeave = function () { self.isHovered = false; };
    this.root.addEventListener('mouseenter', this.onEnter);
    this.root.addEventListener('mouseleave', this.onLeave);
    this.root.addEventListener('focusin', this.onEnter);
    this.root.addEventListener('focusout', this.onLeave);

    this.onResize = function () { self.updateDimensions(); };
    if (window.ResizeObserver) {
      this.ro = new ResizeObserver(this.onResize);
      this.ro.observe(this.root);
    } else {
      window.addEventListener('resize', this.onResize);
    }

    // Recalc after images paint
    var imgs = this.root.querySelectorAll('img');
    var pending = imgs.length;
    if (!pending) return;
    var done = function () {
      pending -= 1;
      if (pending <= 0) self.updateDimensions();
    };
    imgs.forEach(function (img) {
      if (img.complete) done();
      else {
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      }
    });
  };

  function boot() {
    var root = document.getElementById('skillsLogoLoop');
    if (!root) return;

    var loop = new LogoLoop(root, {
      logos: SKILLS_LOGOS,
      speed: Number(root.getAttribute('data-speed') || 100),
      direction: root.getAttribute('data-direction') || 'left',
      logoHeight: Number(root.getAttribute('data-logo-height') || 36),
      gap: Number(root.getAttribute('data-gap') || 48),
      hoverSpeed: Number(root.getAttribute('data-hover-speed') || 0),
      fadeOutColor: root.getAttribute('data-fade-color') || '#06080d',
      ariaLabel: root.getAttribute('aria-label') || 'Technology stack logos'
    });

    var section = document.getElementById('skills') || root;
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          loop.setVisible(entry.isIntersecting);
        });
      }, { threshold: 0.08, rootMargin: '10% 0px' });
      io.observe(section);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
