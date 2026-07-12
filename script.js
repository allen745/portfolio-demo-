// Buttery smooth scroll + GSAP ScrollTrigger sync
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});
window.lenis = lenis;
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);
lenis.stop(); // lock scroll until intro finishes

// Page-load intro
(function(){
  var pre = document.getElementById('preloader');
  var countEl = pre.querySelector('.preloader-count');
  var fillEl = pre.querySelector('.preloader-fill');
  var counter = { val: 0 };

  var tl = gsap.timeline({
    onComplete: function(){
      pre.remove();
      lenis.start();
    }
  });

  tl.to(counter, {
    val: 100, duration: 1.6, ease: 'power2.inOut',
    onUpdate: function(){
      var v = Math.round(counter.val);
      countEl.textContent = v;
      fillEl.style.width = v + '%';
    }
  });
  tl.to(pre, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '-=0.1');
  tl.fromTo('.hb-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.6');
  tl.fromTo('.hb-letter', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power4.out', stagger: 0.04 }, '-=0.5');
  tl.fromTo('.hb-orb', { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.7)' }, '-=0.6');
  tl.fromTo('.hb-signature', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5');
  tl.fromTo('.hb-scroll', { opacity: 0 }, { opacity: 1, duration: 0.6 }, '-=0.3');
})();

// Make nav-links work with Lenis instead of native scroll
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener('click', function(e){
    var target = document.querySelector(a.getAttribute('href'));
    if(target){
      e.preventDefault();
      lenis.scrollTo(target, { offset: -70 });
    }
  });
});

// Magnetic hover — buttons pull toward cursor
(function(){
  if(window.matchMedia('(pointer: coarse)').matches) return;
  var magnetic = document.querySelectorAll('.btn, .contact-pill, .about-connect-item');
  magnetic.forEach(function(el){
    el.addEventListener('mousemove', function(e){
      var rect = el.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width/2;
      var y = e.clientY - rect.top - rect.height/2;
      el.style.transition = 'none';
      el.style.transform = 'translate(' + (x*0.35) + 'px,' + (y*0.35) + 'px)';
    });
    el.addEventListener('mouseleave', function(){
      el.style.transition = 'transform 0.4s cubic-bezier(.34,1.56,.64,1)';
      el.style.transform = 'translate(0,0)';
    });
  });
})();

// Hero 3D particle sphere
(function(){
  var container = document.getElementById('hero-3d');
  var heroSection = document.getElementById('hero');
  if(!container || typeof THREE === 'undefined') return;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, heroSection.clientWidth / heroSection.clientHeight, 0.1, 100);
  camera.position.z = 5;

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(heroSection.clientWidth, heroSection.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  var count = 2200;
  var positions = new Float32Array(count * 3);
  var colors = new Float32Array(count * 3);
  var colorA = new THREE.Color('#00e5ff');
  var colorB = new THREE.Color('#7c3aed');

  for (var i = 0; i < count; i++) {
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos((Math.random() * 2) - 1);
    var radius = 2.1 + Math.random() * 0.15;

    positions[i*3]   = radius * Math.sin(phi) * Math.cos(theta);
    positions[i*3+1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i*3+2] = radius * Math.cos(phi);

    var mixed = colorA.clone().lerp(colorB, Math.random());
    colors[i*3]   = mixed.r;
    colors[i*3+1] = mixed.g;
    colors[i*3+2] = mixed.b;
  }

  var geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  var material = new THREE.PointsMaterial({
    size: 0.022,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  var points = new THREE.Points(geometry, material);
  points.position.x = 1.6;
  scene.add(points);

  var mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', function(e){
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  var targetRotX = 0, targetRotY = 0;
  function animate(time){
    requestAnimationFrame(animate);
    points.rotation.y += 0.0012;
    targetRotX += (mouseY * 0.25 - targetRotX) * 0.05;
    targetRotY += (mouseX * 0.25 - targetRotY) * 0.05;
    points.rotation.x = targetRotX;
    points.rotation.z = targetRotY * 0.15;
    var breathe = 1 + Math.sin(time * 0.0006) * 0.03;
    points.scale.set(breathe, breathe, breathe);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);

  window.addEventListener('resize', function(){
    camera.aspect = heroSection.clientWidth / heroSection.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(heroSection.clientWidth, heroSection.clientHeight);
  });
})();

// Hanging thread cards — drag to stretch, springs back on release
(function(){
  document.querySelectorAll('.hang-wrap').forEach(function(wrap){
    var thread = wrap.querySelector('.thread');
    var card = wrap.querySelector('.hang-card');
    if(!thread || !card) return;
    var baseHeight = thread.offsetHeight || 90;
    var dragging = false, startX = 0, startY = 0;

    function applyDrag(dx, dy){
      var stretch = Math.min(160, Math.max(0, dy * 0.6));
      var rotate = Math.min(14, Math.max(-14, dx * 0.15));
      thread.style.height = (baseHeight + stretch) + 'px';
      card.style.transform = 'rotate(' + rotate + 'deg)';
    }
    function reset(){
      thread.style.transition = 'height 0.6s cubic-bezier(.34,1.56,.64,1)';
      card.style.transition = 'transform 0.6s cubic-bezier(.34,1.56,.64,1)';
      thread.style.height = baseHeight + 'px';
      card.style.transform = 'rotate(0deg)';
    }
    card.addEventListener('pointerdown', function(e){
      dragging = true; startX = e.clientX; startY = e.clientY;
      thread.style.transition = 'none'; card.style.transition = 'none';
      card.setPointerCapture(e.pointerId);
    });
    card.addEventListener('pointermove', function(e){
      if(!dragging) return;
      applyDrag(e.clientX - startX, e.clientY - startY);
    });
    function endDrag(e){
      if(!dragging) return;
      dragging = false;
      reset();
    }
    card.addEventListener('pointerup', endDrag);
    card.addEventListener('pointercancel', endDrag);
    card.addEventListener('lostpointercapture', endDrag);
  });
})();

// Hamburger menu
document.getElementById('hamburger').addEventListener('click',function(){
  document.getElementById('navLinks').classList.toggle('open');
});

// Scroll reveals — staggered, eased, replay on scroll-back
gsap.utils.toArray('.fade-in').forEach(function(el){
  gsap.fromTo(el,
    { opacity: 0, y: 40 },
    {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none reverse'
      }
    }
  );
});

// Proficiency bars
var barObs=new IntersectionObserver(function(entries){
  entries.forEach(function(entry){
    if(entry.isIntersecting){
      entry.target.querySelectorAll('.prof-fill').forEach(function(f){f.style.width=f.dataset.width+'%';});
    } else {
      entry.target.querySelectorAll('.prof-fill').forEach(function(f){f.style.width='0%';});
    }
  });
},{threshold:0.3});
document.querySelectorAll('.prof-grid').forEach(function(el){barObs.observe(el);});

// Fluid liquid cursor — desktop/mouse only, skipped entirely on touch devices
(function(){
  if(window.matchMedia('(pointer: coarse)').matches) return;

  var blob = document.createElement('div'); blob.className = 'cursor-blob';
  document.body.appendChild(blob);
  document.body.classList.add('custom-cursor-active');

  var mouseX = -100, mouseY = -100, x = -100, y = -100;
  var started = false;

  window.addEventListener('mousemove', function(e){
    mouseX = e.clientX; mouseY = e.clientY;
    if(!started){ x = mouseX; y = mouseY; started = true; }
  });

  function loop(){
    var prevX = x, prevY = y;
    x += (mouseX - x) * 0.18;
    y += (mouseY - y) * 0.18;
    var vx = x - prevX, vy = y - prevY;
    var speed = Math.sqrt(vx*vx + vy*vy);
    var angle = Math.atan2(vy, vx) * 180 / Math.PI;
    var stretch = Math.min(speed * 0.06, 0.9);
    blob.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%) rotate(' + angle + 'deg) scale(' + (1 + stretch) + ',' + (1 - stretch*0.35) + ')';
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  var interactiveSelector = 'a, button, .btn, .proj-card, .pin-card, .phase-card, .contact-pill, .hang-card, .about-connect-item, .badge-card';
  document.querySelectorAll(interactiveSelector).forEach(function(el){
    el.addEventListener('mouseenter', function(){ blob.classList.add('is-hover'); });
    el.addEventListener('mouseleave', function(){ blob.classList.remove('is-hover'); });
  });
})();

// Project case-study system — click a card, scroll horizontally through the story
(function(){
  const projects = {
    vertex: {
      num: "01", tag: "Founder & CEO · Imagine Cup 2027",
      title: "Vertex — AI Career Intelligence Platform",
      desc: "A data-driven platform helping tech students decide what to learn next: real salary data across 15 countries, a 10-year demand forecast, and an AI advisor that actually knows where each student stands.",
      highlights: [
        "Phase-based roadmaps with 70+ curated resources per domain",
        "Salary and demand data projected to 2036",
        "Vertice AI reads a student's progress before responding, no generic answers"
      ],
      tech: ["FastAPI","React.js","Azure OpenAI","Recharts","Microsoft Auth"],
      theme: { bg:"#2b1d14", panel:"#3a2718", text:"#f3e9dd", muted:"#c9b8a8", border:"rgba(255,255,255,0.14)", accent:"#e8a25c" },
      images: ["images/projects/vertex/1.png","images/projects/vertex/2.png","images/projects/vertex/3.png","images/projects/vertex/4.png","images/projects/vertex/5.png"],
      stories: [
        { title: "The Reframe", sub: "Most platforms give you a list. We give you a moving picture." },
        { title: "Pick Your Track", sub: "6 domains mapped, ML Engineer live first." },
        { title: "The Roadmap", sub: "11 structured phases, zero guesswork." },
        { title: "Vertice AI", sub: "A mentor grounded in your actual progress." }
      ]
    },
    patent: {
      num: "02", tag: "Government of India Patent",
      title: "Spring-Loaded Piezoelectric Generating Striker Device",
      desc: "A novel ambient energy harvesting device converting footstep mechanical energy into electrical power via a spring-loaded hammer striking a PZT piezoelectric disc. Built into a physical exhibit, 'Power Strikes,' showing the concept live.",
      highlights: [
        "Design No. 450815-001, registered with the Patent Office, Government of India",
        "4-phase cycle: Loading, Release, Impact, Energy Output",
        "Built as a hands-on exhibit installation, not just a spec sheet"
      ],
      tech: ["Piezoelectric","PZT-5A/5H","Mechanical Design"],
      theme: { bg:"#0f2018", panel:"#183526", text:"#eaf4ec", muted:"#a9c6b1", border:"rgba(255,255,255,0.14)", accent:"#4ade80" },
      images: ["images/projects/patent/1.png","images/projects/patent/2.png","images/projects/patent/3.jpeg","images/projects/patent/4.png"],
      stories: [
        { title: "The Engineering", sub: "7-view technical model, working principle mapped in 4 steps." },
        { title: "Use It or Lose It", sub: "Hands-on energy generation, hit, charge, repeat." },
        { title: "The Redesign", sub: "An alternate colorway built for the same exhibit." }
      ]
    },
    devmind: {
      num: "03", tag: "Live Product · 2025–2026",
      title: "DevMind AI — AI Developer Toolkit",
      desc: "An AI-powered developer productivity platform with five tools for reviewing, fixing, documenting, and analyzing code, independently designed, deployed, and maintained end-to-end.",
      highlights: [
        "5 tools: code review, bug fixing, docs generation, complexity analysis, commit messages",
        "Direct GitHub file URL ingestion, no copy-paste required",
        "Live at devmind-ai-topaz.vercel.app"
      ],
      tech: ["FastAPI","Groq","React.js","Vercel"],
      theme: { bg:"#1c1c1e", panel:"#28282b", text:"#f0f0f0", muted:"#a8a8ac", border:"rgba(255,255,255,0.14)", accent:"#5eead4" },
      images: ["images/projects/devmind/1.png","images/projects/devmind/2.png","images/projects/devmind/3.png","images/projects/devmind/4.png","images/projects/devmind/5.png","images/projects/devmind/6.png"],
      stories: [
        { title: "Sign In", sub: "Google OAuth, straight into the toolkit." },
        { title: "Five Tools, One Dashboard", sub: "Code review, bug hunt, docs, complexity, commits." },
        { title: "Code Review, Scored", sub: "80/100, bugs flagged with fixes attached." },
        { title: "Docs, Auto-Generated", sub: "A full README written straight from the code." },
        { title: "Complexity, Explained", sub: "Time complexity broken down function by function." }
      ]
    },
    casaas: {
      num: "04", tag: "B2B SaaS · In Progress",
      title: "CA SaaS — B2B AI Platform for Chartered Accountants",
      desc: "A full-stack B2B SaaS platform for India's 400,000+ practicing Chartered Accountants, combining client management with an AI layer that reads documents, drafts notices, and flags anomalies.",
      highlights: [
        "JWT auth with full client management, PAN details included",
        "AI-powered ITR summarization and notice reply drafting",
        "20+ REST API endpoints across auth, clients, documents, AI, and notices"
      ],
      tech: ["FastAPI","PostgreSQL","React.js","Groq/LLaMA-3.3"],
      theme: { bg:"#ded8f9", panel:"#cfc7f3", text:"#251f47", muted:"#5c5480", border:"rgba(0,0,0,0.12)", accent:"#6c4fe0" },
      images: ["images/projects/casaas/1.png","images/projects/casaas/2.png","images/projects/casaas/3.png","images/projects/casaas/4.png","images/projects/casaas/5.png"],
      stories: [
        { title: "Sign In", sub: "JWT-secured login, built for CA workflows." },
        { title: "The Dashboard", sub: "128 clients, 342 documents, 7 anomalies flagged." },
        { title: "Upload and Extract", sub: "Drag in a notice, get clean extracted text in seconds." },
        { title: "AI Insights", sub: "Income mismatches and penalty risk, flagged automatically." }
      ]
    },
    devmindagent: {
      num: "05", tag: "Microsoft Agents League 2026",
      title: "DevMind AI Agent — Autonomous Repository Intelligence Agent",
      desc: "A 4-step autonomous reasoning agent that turns any public GitHub repo into a cited Project Health Report, built around a dual-model reasoning pipeline instead of single-shot analysis.",
      highlights: [
        "GitHub fetch, parallel per-file analysis, cross-file pattern detection, Foundry IQ synthesis",
        "Grounded, cited 0 to 100 health score with top 5 recommended fixes",
        "Submitted to Microsoft Agents League 2026, Reasoning Agents track"
      ],
      tech: ["FastAPI","Groq/LLaMA-3.3-70b","Microsoft Foundry IQ","GitHub REST API"],
      theme: { bg:"#1a1442", panel:"#241b58", text:"#ece9ff", muted:"#b3a9e0", border:"rgba(255,255,255,0.14)", accent:"#8b7cf6" },
      images: ["images/projects/devmindagent/1.png","images/projects/devmindagent/2.png","images/projects/devmindagent/3.png","images/projects/devmindagent/4.png"],
      stories: [
        { title: "Analysis Summary", sub: "A real repo scanned in seconds, health score 55/100." },
        { title: "The Reasoning Pipeline", sub: "4 steps, 2 models: fetch, analyze, cross-reference, synthesize." },
        { title: "File by File", sub: "Bugs, security, quality and severity, all cited." }
      ]
    },
    trackbot: {
      num: "06", tag: "SSIP-Funded Team Project · ADIT, CVM University",
      title: "TrackBot 1 — Low-Cost Autonomous Warehouse AGV",
      desc: "A single-MCU autonomous warehouse AGV designed around RFID-corrected odometry, A* pathfinding, and a non-invasive embedded AI advisory layer, built within a \u20b935,000 SSIP-funded budget. Currently in build phase; I led electrical power systems and electronics integration on a 4-person research team.",
      highlights: [
        "Co-authored an IEEE-formatted paper documenting the architecture, 11 hardware-software conflict resolutions, and evaluation criteria",
        "RFID-corrected encoder odometry + A* pathfinding for real-time replanning, entirely on a single ESP32-S3",
        "4-module embedded AI advisory layer: offline-trained coefficients only, zero cloud dependency, zero impact on navigation firmware"
      ],
      tech: ["ESP32-S3","A* Pathfinding","RFID Localization","scikit-learn"],
      theme: { bg:"#0a1428", panel:"#0f1c38", text:"#e6edf7", muted:"#93a4c2", border:"rgba(255,255,255,0.14)", accent:"#4d9fff" },
      images: ["images/projects/trackbot/1.png","images/projects/trackbot/2.png","images/projects/trackbot/3.png"],
      stories: [
        { title: "The Architecture", sub: "Mecanum drive, RFID navigation, live telemetry, AI advisory, one ESP32-S3." },
        { title: "Under the Hood", sub: "Dual-core split: real-time navigation on one core, I/O on the other." }
      ]
    },
    autoseed: {
      num: "07", tag: "IoT + Precision Agriculture · 2025",
      title: "AutoSeed Bot — Autonomous Agricultural Robot",
      desc: "An autonomous seed-planting robot automating planting operations for small-scale farms, using an Arduino-based control system with ultrasonic sensing, motor control, and precision seed dispersion.",
      highlights: [
        "Sensor-based autonomous navigation across the field",
        "Precision seed dispersion with continuous feedback, live seed count on an onboard LCD",
        "Addresses labour inefficiency in small-scale farming"
      ],
      tech: ["Arduino","Ultrasonic Sensing","Motor Control","IoT"],
      theme: { bg:"#ede4d3", panel:"#e2d6bd", text:"#3a3226", muted:"#7a6f5c", border:"rgba(0,0,0,0.12)", accent:"#7c8f52" },
      images: ["images/projects/autoseed/1.png","images/projects/autoseed/2.png"],
      stories: [
        { title: "Status: Running", sub: "12 seeds planted and counting, live on the onboard LCD." }
      ]
    }
  };

  var panels = [];
  var track = document.getElementById('pdTrack');
  var detailEl = document.getElementById('project-detail');

  function buildTrack(data){
    track.innerHTML = ''; panels = [];
    var intro = document.createElement('div');
    intro.className = 'intro-panel';
    intro.innerHTML =
      '<div class="intro-text">' +
        '<div class="intro-num">PROJECT — ' + data.num + '</div>' +
        '<h2 class="intro-title">' + data.title + '</h2>' +
        '<p class="intro-desc">' + data.desc + '</p>' +
        '<ul class="intro-highlights">' + data.highlights.map(function(h){return '<li>'+h+'</li>';}).join('') + '</ul>' +
        '<div class="intro-tech">' + data.tech.map(function(t){return '<span>'+t+'</span>';}).join('') + '</div>' +
      '</div>' +
      '<div class="intro-image-frame"><img src="' + data.images[0] + '"></div>';
    track.appendChild(intro); panels.push(intro);

    for(var i = 1; i < data.images.length; i++){
      var story = data.stories[i-1] || { title:'', sub:'' };
      var panel = document.createElement('div');
      panel.className = 'story-panel';
      panel.innerHTML =
        '<img src="' + data.images[i] + '">' +
        '<div class="story-wash"></div>' +
        '<div class="story-index">0' + i + ' / 0' + (data.images.length-1) + '</div>' +
        '<div class="story-title">' + story.title + '</div>' +
        '<div class="story-sub">' + story.sub + '</div>';
      track.appendChild(panel); panels.push(panel);
    }
  }

  function openProject(id){
    var data = projects[id];
    if(!data) return;
    buildTrack(data);
    targetX = 0; trackX = 0;
    track.style.transform = 'translateX(0px)';

    var th = data.theme;
    detailEl.style.setProperty('--pd-bg', th.bg);
    detailEl.style.setProperty('--pd-panel', th.panel);
    detailEl.style.setProperty('--pd-text', th.text);
    detailEl.style.setProperty('--pd-muted', th.muted);
    detailEl.style.setProperty('--pd-border', th.border);
    detailEl.style.setProperty('--pd-accent', th.accent);

    detailEl.classList.add('open');
    document.body.style.overflow = 'hidden';
    if(window.lenis) lenis.stop();
    requestAnimationFrame(updateMax);
  }
  function closeProject(){
    detailEl.classList.remove('open');
    document.body.style.overflow = '';
    if(window.lenis) lenis.start();
  }

  document.querySelectorAll('.proj-card[data-project]').forEach(function(card){
    card.addEventListener('click', function(){ openProject(card.dataset.project); });
  });
  document.getElementById('pdClose').addEventListener('click', closeProject);

  var trackX = 0, targetX = 0, maxX = 0;
  function updateMax(){ maxX = Math.max(0, track.scrollWidth - window.innerWidth); }

  detailEl.addEventListener('wheel', function(e){
    if(!detailEl.classList.contains('open')) return;
    e.preventDefault();
    updateMax();
    targetX += e.deltaY;
    targetX = Math.max(0, Math.min(maxX, targetX));
  }, { passive: false });

  function raf(){
    trackX += (targetX - trackX) * 0.09;
    track.style.transform = 'translateX(' + (-trackX) + 'px)';

    var vw = window.innerWidth;
    var centerX = vw / 2;
    var maxDist = vw * 0.78;
    for(var i = 0; i < panels.length; i++){
      var rect = panels[i].getBoundingClientRect();
      var panelCenter = rect.left + rect.width / 2;
      var dist = Math.abs(panelCenter - centerX);
      var prox = Math.max(0, Math.min(1, 1 - dist / maxDist));
      panels[i].style.opacity = Math.max(0.08, prox);
      panels[i].style.transform = 'scale(' + (0.9 + prox * 0.1) + ')';
    }
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  window.addEventListener('resize', updateMax);
})();