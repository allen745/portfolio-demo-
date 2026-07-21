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
      ScrollTrigger.refresh();
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
  tl.fromTo('.hb-house', { opacity: 0, letterSpacing: '0.5em' }, { opacity: 1, letterSpacing: '0.28em', duration: 0.8, ease: 'power3.out' }, '-=0.55');
  tl.fromTo('.hb-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.55');
  tl.fromTo('.hb-letter', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power4.out', stagger: 0.04 }, '-=0.5');
  tl.fromTo('.hb-orb', { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.7)' }, '-=0.6');
  tl.fromTo('.hb-signature', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5');
  tl.fromTo('.hb-scroll', { opacity: 0 }, { opacity: 1, duration: 0.6 }, '-=0.3');
  tl.fromTo('.hero-letterbox span', { scaleY: 1.6 }, { scaleY: 1, duration: 1.1, ease: 'power3.out' }, '-=1.2');
  tl.fromTo('.hero-video', { scale: 1.28 }, { scale: 1.12, duration: 2.2, ease: 'power2.out' }, '-=1.4');
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



// Hanging thread cards — drag to stretch, springs back on release
(function(){
  document.querySelectorAll('.hang-wrap').forEach(function(wrap){
    var thread = wrap.querySelector('.thread');
    var card = wrap.querySelector('.hang-card');
    if(!thread || !card) return;
    var baseHeight = 72;
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
      // Prefer the revealed rest length after the journey scrub lands
      baseHeight = Math.max(56, parseFloat(thread.style.height) || thread.offsetHeight || 72);
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

// Experience & Education — Lusion-style pinned scroll storytelling
(function(){
  if(!window.gsap || !window.ScrollTrigger) return;
  var section = document.getElementById('experience');
  if(!section) return;

  var pinWrap = section.querySelector('.exp-pin-wrap');
  var stage = section.querySelector('.exp-pin-stage');
  var steps = Array.prototype.slice.call(section.querySelectorAll('.exp-step'));
  var chapterNum = document.getElementById('expChapterNum');
  var chapterName = document.getElementById('expChapterName');
  var chapterCopy = document.getElementById('expChapterCopy');
  var progressFill = document.getElementById('expProgressFill');
  var progressCurrent = document.getElementById('expProgressCurrent');
  var spineLine = document.getElementById('expSpineLine');
  var orbA = section.querySelector('.exp-orb-a');
  var orbB = section.querySelector('.exp-orb-b');

  if(!pinWrap || !stage || !steps.length) return;

  var chapters = [
    {
      num: '01',
      name: 'Work Experience',
      copy: 'Roles, training, and the work that shaped how I build.'
    },
    {
      num: '02',
      name: 'Education',
      copy: 'The academic path behind the systems, models, and products.'
    }
  ];
  var activeChapter = -1;
  var activeStep = -1;
  var chapterTween = null;
  var journeyTriggers = [];
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktopPin = window.matchMedia('(min-width: 981px)');

  function pad(n){ return (n < 10 ? '0' : '') + n; }

  function setChapter(idx, immediate){
    if(idx === activeChapter || !chapters[idx]) return;
    activeChapter = idx;
    var data = chapters[idx];
    if(chapterTween){ chapterTween.kill(); chapterTween = null; }
    if(immediate || reduceMotion){
      gsap.set([chapterNum, chapterName, chapterCopy], { clearProps: 'opacity,transform,clipPath' });
      chapterNum.textContent = data.num;
      chapterName.textContent = data.name;
      chapterCopy.textContent = data.copy;
      return;
    }
    chapterTween = gsap.timeline({
      onComplete: function(){ chapterTween = null; }
    })
      .to([chapterNum, chapterName, chapterCopy], {
        opacity: 0, y: 18, duration: 0.28, ease: 'power2.in', stagger: 0.03
      })
      .add(function(){
        chapterNum.textContent = data.num;
        chapterName.textContent = data.name;
        chapterCopy.textContent = data.copy;
      })
      .fromTo([chapterNum, chapterName, chapterCopy],
        { opacity: 0, y: -22, clipPath: 'inset(100% 0 0 0)' },
        { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)', duration: 0.55, ease: 'power3.out', stagger: 0.05 }
      );
  }

  function setStepIndex(idx){
    if(idx === activeStep) return;
    activeStep = idx;
    if(progressCurrent) progressCurrent.textContent = pad(Math.max(1, idx + 1));
    var chapterIdx = parseInt(steps[Math.max(0, idx)].dataset.chapter, 10) || 0;
    setChapter(chapterIdx, false);
    steps.forEach(function(step, i){
      step.classList.toggle('is-active', i === idx);
    });
  }

  var journeyTl = null;

  function buildPinnedTimeline(){
    // CSS sticky stage + scrub tied to the tall runway. Cards must change
    // WHILE the sticky viewport is on screen — not after the section leaves.
    var seg = 1 / steps.length;
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: pinWrap,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.45,
        invalidateOnRefresh: true,
        onUpdate: function(self){
          var idx = Math.min(
            steps.length - 1,
            Math.floor(self.progress * steps.length)
          );
          // Keep the last card active through the final stretch
          if(self.progress >= 0.99) idx = steps.length - 1;
          setStepIndex(idx);
        }
      }
    });

    if(orbA){
      tl.fromTo(orbA, { x: -30, y: 16, opacity: 0.4 }, { x: 24, y: -36, opacity: 0.7, duration: 1, ease: 'none' }, 0);
    }
    if(orbB){
      tl.fromTo(orbB, { x: 24, y: -12, opacity: 0.3 }, { x: -28, y: 28, opacity: 0.55, duration: 1, ease: 'none' }, 0);
    }
    if(spineLine){
      tl.fromTo(spineLine, { height: '0%' }, { height: '100%', duration: 1, ease: 'none' }, 0);
    }
    if(progressFill){
      tl.fromTo(progressFill, { width: '0%' }, { width: '100%', duration: 1, ease: 'none' }, 0);
    }

    steps.forEach(function(step, i){
      var thread = step.querySelector('.thread');
      var card = step.querySelector('.hang-card');
      var enterAt = i * seg;
      var exitAt = (i + 1) * seg;
      var enterDur = Math.min(0.1, seg * 0.35);
      var exitDur = Math.min(0.08, seg * 0.28);

      if(i === 0){
        // Already visible on arrival — hold, then hand off
        tl.set(step, { opacity: 1, y: 0, scale: 1 }, 0);
        if(thread) tl.set(thread, { height: 72 }, 0);
        if(card) tl.set(card, { y: 0, rotate: 0, opacity: 1 }, 0);
      } else {
        tl.fromTo(step,
          { opacity: 0, y: 56, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: enterDur, ease: 'power3.out' },
          enterAt
        );
        if(thread){
          tl.fromTo(thread,
            { height: 0 },
            { height: 72, duration: enterDur * 0.85, ease: 'power2.out' },
            enterAt
          );
        }
        if(card){
          tl.fromTo(card,
            { y: -20, rotate: -4, opacity: 0.2 },
            { y: 0, rotate: 0, opacity: 1, duration: enterDur, ease: 'power3.out' },
            enterAt + 0.01
          );
        }
      }

      if(i < steps.length - 1){
        tl.to(step, {
          opacity: 0, y: -40, scale: 0.97,
          duration: exitDur, ease: 'power2.in'
        }, exitAt - exitDur);
      } else {
        // Hold the final card through the end of the sticky runway
        tl.to(step, { opacity: 1, y: 0, scale: 1, duration: seg * 0.5, ease: 'none' }, enterAt + enterDur);
      }
    });

    return tl;
  }

  function buildMobileTimeline(){
    steps.forEach(function(step, i){
      var thread = step.querySelector('.thread');
      var card = step.querySelector('.hang-card');
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: step,
          start: 'top 88%',
          end: 'top 45%',
          scrub: 0.8,
          onEnter: function(){ setStepIndex(i); },
          onEnterBack: function(){ setStepIndex(i); }
        }
      })
        .to(step, { opacity: 1, y: 0, rotateX: 0, ease: 'power3.out' }, 0)
        .to(thread, { height: 72, ease: 'power2.out' }, 0)
        .to(card, { y: 0, rotate: 0, opacity: 1, ease: 'power3.out' }, 0.05);
      if(tl.scrollTrigger) journeyTriggers.push(tl.scrollTrigger);
    });

    if(progressFill){
      var progressTween = gsap.to(progressFill, {
        width: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: pinWrap,
          start: 'top 70%',
          end: 'bottom 40%',
          scrub: true
        }
      });
      if(progressTween.scrollTrigger) journeyTriggers.push(progressTween.scrollTrigger);
    }
  }

  function killJourney(){
    if(journeyTl){
      if(journeyTl.scrollTrigger) journeyTl.scrollTrigger.kill();
      journeyTl.kill();
      journeyTl = null;
    }
    journeyTriggers.forEach(function(st){ if(st && st.kill) st.kill(); });
    journeyTriggers = [];
  }

  function resetVisualState(){
    steps.forEach(function(step, i){
      var thread = step.querySelector('.thread');
      var card = step.querySelector('.hang-card');
      if(i === 0){
        // First card is ready the moment the sticky stage lands
        gsap.set(step, { opacity: 1, y: 0, scale: 1, x: 0, rotateX: 0 });
        if(thread) gsap.set(thread, { height: 72 });
        if(card) gsap.set(card, { y: 0, rotate: 0, opacity: 1 });
      } else {
        gsap.set(step, { opacity: 0, y: 56, scale: 0.96, x: 0, rotateX: 0 });
        if(thread) gsap.set(thread, { height: 0 });
        if(card) gsap.set(card, { y: -20, rotate: -4, opacity: 0.2 });
      }
    });
    if(spineLine) gsap.set(spineLine, { height: '0%' });
    if(progressFill) gsap.set(progressFill, { width: '0%' });
    activeChapter = -1;
    activeStep = -1;
    setChapter(0, true);
    setStepIndex(0);
  }

  function setup(){
    killJourney();
    resetVisualState();

    if(reduceMotion){
      steps.forEach(function(step){
        var thread = step.querySelector('.thread');
        var card = step.querySelector('.hang-card');
        gsap.set(step, { opacity: 1, y: 0, rotateX: 0, x: 0 });
        if(thread) gsap.set(thread, { height: 72 });
        if(card) gsap.set(card, { y: 0, rotate: 0, opacity: 1 });
      });
      if(spineLine) gsap.set(spineLine, { height: '100%' });
      if(progressFill) gsap.set(progressFill, { width: '100%' });
      return;
    }

    if(desktopPin.matches){
      journeyTl = buildPinnedTimeline();
    } else {
      buildMobileTimeline();
    }
  }

  setup();
  // Refresh after layout/fonts settle so pin distances stay accurate
  requestAnimationFrame(function(){ ScrollTrigger.refresh(); });
  window.addEventListener('load', function(){ ScrollTrigger.refresh(); });
  desktopPin.addEventListener('change', function(){
    setup();
    ScrollTrigger.refresh();
  });
})();


// Scroll reveals — cinematic rise + soft scale, replay on scroll-back
gsap.utils.toArray('.fade-in').forEach(function(el){
  gsap.fromTo(el,
    { opacity: 0, y: 56, scale: 0.975 },
    {
      opacity: 1, y: 0, scale: 1,
      duration: 1.15, ease: 'power4.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        toggleActions: 'play none none reverse'
      }
    }
  );
});

// Projects — cinematic nature-rain background plate
(function(){
  var section = document.getElementById('projects');
  var video = document.getElementById('projectsBgVideo');
  if(!section || !video) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function playProjectsVideo(){
    if(reduceMotion) return;
    video.muted = true;
    var p = video.play();
    if(p && p.then){
      p.then(function(){ video.classList.add('is-ready'); }).catch(function(){});
    } else {
      video.classList.add('is-ready');
    }
  }

  video.addEventListener('loadeddata', function(){
    if(!video.paused) video.classList.add('is-ready');
  });

  if('IntersectionObserver' in window){
    var vio = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting) playProjectsVideo();
        else if(!video.paused) video.pause();
      });
    }, { threshold: 0.1 });
    vio.observe(section);
  } else {
    playProjectsVideo();
  }

  if(reduceMotion || !window.gsap || !window.ScrollTrigger) return;

  gsap.to(video, {
    scale: 1.14,
    yPercent: 5,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.9
    }
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
  var projectOrder = Array.prototype.map.call(document.querySelectorAll('.proj-card[data-project]'), function(card){ return card.dataset.project; });
  var currentProjectId = null;
  var isChaining = false;

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
        '<button type="button" class="intro-back">&larr; Back to Projects</button>' +
      '</div>' +
      '<div class="intro-image-frame"><img src="' + data.images[0] + '"></div>';
    track.appendChild(intro); panels.push(intro);
    intro.querySelector('.intro-back').addEventListener('click', closeProject);

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
    currentProjectId = id;
    isChaining = false;
    buildTrack(data);

    // Always start a freshly opened project at the beginning of its track —
    // otherwise a leftover scroll position from a previous visit pushes the
    // newly built panels outside the visible (overflow: hidden) viewport.
    // Also restore opacity: exitToPortfolio fades the track out and previously
    // left it at 0, so reopening showed only the theme background.
    trackX = 0; targetX = 0;
    track.style.transform = 'translateX(0px)';
    track.style.opacity = '1';

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
    // Reset fade state so the next open is never stuck invisible.
    track.style.opacity = '1';
    isChaining = false;
  }

  document.querySelectorAll('.proj-card[data-project]').forEach(function(card){
    card.addEventListener('click', function(){ openProject(card.dataset.project); });
  });


  var trackX = 0, targetX = 0, maxX = 0;
  function updateMax(){ maxX = Math.max(0, track.scrollWidth - window.innerWidth); }

  function chainToProject(id, overflow, direction){
    isChaining = true;
    track.style.opacity = '0';

    setTimeout(function(){
      var data = projects[id];
      currentProjectId = id;
      buildTrack(data);

      var th = data.theme;
      detailEl.style.setProperty('--pd-bg', th.bg);
      detailEl.style.setProperty('--pd-panel', th.panel);
      detailEl.style.setProperty('--pd-text', th.text);
      detailEl.style.setProperty('--pd-muted', th.muted);
      detailEl.style.setProperty('--pd-border', th.border);
      detailEl.style.setProperty('--pd-accent', th.accent);

      updateMax();
      targetX = direction === 1 ? Math.max(0, Math.min(maxX, overflow)) : Math.max(0, maxX - overflow);
      trackX = targetX;
      track.style.transform = 'translateX(' + (-trackX) + 'px)';

      requestAnimationFrame(function(){
        track.style.opacity = '1';
        setTimeout(function(){ isChaining = false; }, 380);
      });
    }, 350);
  }
  function exitToPortfolio(){
    isChaining = true;
    track.style.opacity = '0';

    setTimeout(function(){
      closeProject();
      var next = document.getElementById('achievements');
      if(next && window.lenis){
        lenis.scrollTo(next, { offset: -70 });
      }
      setTimeout(function(){ isChaining = false; }, 400);
    }, 350);
  }

  detailEl.addEventListener('wheel', function(e){
    if(!detailEl.classList.contains('open') || isChaining) return;
    e.preventDefault();
    updateMax();
    var next = targetX + e.deltaY;

    if(next > maxX){
      var idx = projectOrder.indexOf(currentProjectId);
      if(idx < projectOrder.length - 1){ chainToProject(projectOrder[idx + 1], next - maxX, 1); return; }
      exitToPortfolio();
      return;
    }
    if(next < 0){
      var idx2 = projectOrder.indexOf(currentProjectId);
      if(idx2 > 0){ chainToProject(projectOrder[idx2 - 1], -next, -1); return; }
      targetX = 0; return;
    }
    targetX = next;
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
// Lusion-style pill nav — menu flips to close, panel scroll-spies the active section
(function(){
  var menuBtn = document.getElementById('menuToggle');
  var panel = document.getElementById('navPanel');
  var label = menuBtn.querySelector('.nav-pill-label');

  function closePanel(){
    panel.classList.remove('open');
    menuBtn.classList.remove('is-open');
    label.textContent = 'Menu';
  }
  function openPanel(){
    panel.classList.add('open');
    menuBtn.classList.add('is-open');
    label.textContent = 'Close';
  }
  menuBtn.addEventListener('click', function(){
    panel.classList.contains('open') ? closePanel() : openPanel();
  });

  document.addEventListener('click', function(e){
    if(panel.classList.contains('open') && !panel.contains(e.target) && !menuBtn.contains(e.target)){
      closePanel();
    }
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closePanel();
  });

  // Clicking a link inside the panel closes it (actual scrolling is already handled
  // by your existing Lenis nav-link handler above)
  document.querySelectorAll('.nav-panel-list a').forEach(function(a){
    a.addEventListener('click', function(){ closePanel(); });
  });

  // Scroll-spy: light up the dot next to whichever section is actually in view
  var sections = [];
  document.querySelectorAll('.nav-panel-list a').forEach(function(a){
    var sec = document.querySelector(a.getAttribute('href'));
    if(sec) sections.push({ li: a.closest('li'), el: sec });
  });

  var spy = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      var match = sections.find(function(s){ return s.el === entry.target; });
      if(!match || !entry.isIntersecting) return;
      sections.forEach(function(s){ s.li.classList.remove('active'); });
      match.li.classList.add('active');
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach(function(s){ spy.observe(s.el); });
})();

// About — cinematic editorial reveal + refined signature path (no body-level SVG)
(function(){
  var section = document.getElementById('about');
  if(!section) return;

  var path = document.getElementById('aboutPath');
  var dot = document.getElementById('aboutPathDot');
  var photoMask = section.querySelector('.about-photo-mask');
  var photo = section.querySelector('.about-photo');
  var headingLines = section.querySelectorAll('.about-heading-line');
  var house = section.querySelector('.about-house-mark');
  var eyebrow = section.querySelector('.about-eyebrow');
  var script = section.querySelector('.about-script');
  var descs = section.querySelectorAll('.about-desc');
  var stats = section.querySelectorAll('.about-stat-num');
  var pill = section.querySelector('.about-approach-pill');
  var connect = section.querySelectorAll('.about-connect-item');
  var corners = section.querySelectorAll('.about-frame-corner');
  var video = document.getElementById('aboutBgVideo');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function playAboutVideo(){
    if(!video || reduceMotion) return;
    video.muted = true;
    var p = video.play();
    if(p && p.then){
      p.then(function(){ video.classList.add('is-ready'); }).catch(function(){});
    } else {
      video.classList.add('is-ready');
    }
  }
  if(video){
    video.addEventListener('loadeddata', function(){
      if(!video.paused) video.classList.add('is-ready');
    });
    if('IntersectionObserver' in window){
      var vio = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting) playAboutVideo();
          else if(!video.paused) video.pause();
        });
      }, { threshold: 0.12 });
      vio.observe(section);
    } else {
      playAboutVideo();
    }
  }

  // Prepare signature path length for draw-on
  var pathLen = 0;
  if(path){
    pathLen = path.getTotalLength();
    path.style.strokeDasharray = String(pathLen);
    path.style.strokeDashoffset = String(pathLen);
  }
  if(dot && path){
    var start = path.getPointAtLength(0);
    dot.setAttribute('cx', start.x);
    dot.setAttribute('cy', start.y);
  }

  if(reduceMotion || !window.gsap || !window.ScrollTrigger){
    if(path) path.style.strokeDashoffset = '0';
    stats.forEach(function(el){
      var n = parseInt(el.getAttribute('data-count'), 10) || 0;
      el.textContent = el.getAttribute('data-count') === '7' ? '7+' : String(n);
    });
    return;
  }

  // Soft parallax on the about video plate
  if(video){
    gsap.to(video, {
      scale: 1.16,
      yPercent: 6,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.85
      }
    });
  }

  // Photo mask + scale reveal
  if(photoMask){
    gsap.set(photoMask, { clipPath: 'inset(48% 48% 48% 48%)' });
    gsap.to(photoMask, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1.35, ease: 'power4.out',
      scrollTrigger: { trigger: photoMask, start: 'top 80%', toggleActions: 'play none none reverse' }
    });
  }
  if(photo){
    gsap.fromTo(photo,
      { scale: 1.22, filter: 'contrast(1.1) brightness(0.85)' },
      {
        scale: 1.08, filter: 'contrast(1.04) saturate(0.96) brightness(1)',
        duration: 1.6, ease: 'power3.out',
        scrollTrigger: { trigger: photo, start: 'top 80%', toggleActions: 'play none none reverse' }
      }
    );
  }
  if(corners.length){
    gsap.fromTo(corners,
      { opacity: 0, scale: 0.6 },
      {
        opacity: 1, scale: 1, duration: 0.7, stagger: 0.06, ease: 'power3.out',
        scrollTrigger: { trigger: section.querySelector('.about-frame'), start: 'top 82%', toggleActions: 'play none none reverse' }
      }
    );
  }

  if(house){
    gsap.fromTo(house,
      { opacity: 0, y: 16 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: house, start: 'top 90%', toggleActions: 'play none none reverse' }
      }
    );
  }
  if(eyebrow){
    gsap.fromTo(eyebrow,
      { opacity: 0, x: -24 },
      {
        opacity: 1, x: 0, duration: 0.75, ease: 'power3.out',
        scrollTrigger: { trigger: eyebrow, start: 'top 88%', toggleActions: 'play none none reverse' }
      }
    );
  }

  headingLines.forEach(function(line){
    var text = line.textContent;
    line.innerHTML = '<span class="about-heading-inner">' + text + '</span>';
    var inner = line.querySelector('.about-heading-inner');
    gsap.fromTo(inner,
      { yPercent: 110 },
      {
        yPercent: 0, duration: 1.05, ease: 'power4.out',
        scrollTrigger: { trigger: line, start: 'top 88%', toggleActions: 'play none none reverse' }
      }
    );
  });

  if(script){
    gsap.fromTo(script,
      { opacity: 0, y: 18 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: script, start: 'top 90%', toggleActions: 'play none none reverse' }
      }
    );
  }
  if(descs.length){
    gsap.fromTo(descs,
      { opacity: 0, y: 22 },
      {
        opacity: 1, y: 0, duration: 0.85, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: descs[0], start: 'top 90%', toggleActions: 'play none none reverse' }
      }
    );
  }

  // Signature path draw + trailing focus dot
  if(path){
    var draw = { v: 0 };
    gsap.to(draw, {
      v: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: section.querySelector('.about-media'),
        start: 'top 75%',
        end: 'bottom 45%',
        scrub: 0.65,
        onUpdate: function(){
          path.style.strokeDashoffset = String(pathLen * (1 - draw.v));
          if(dot){
            var pt = path.getPointAtLength(pathLen * draw.v);
            dot.setAttribute('cx', pt.x);
            dot.setAttribute('cy', pt.y);
          }
        }
      }
    });
  }

  // Count-up stats
  stats.forEach(function(el){
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var isPlus = el.getAttribute('data-count') === '7';
    var obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.35,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        toggleActions: 'play none none reverse'
      },
      onUpdate: function(){
        var n = Math.round(obj.val);
        el.textContent = isPlus ? (n + '+') : String(n);
      }
    });
  });

  if(pill){
    gsap.fromTo(pill,
      { opacity: 0, y: 18 },
      {
        opacity: 1, y: 0, duration: 0.75, ease: 'power3.out',
        scrollTrigger: { trigger: pill, start: 'top 92%', toggleActions: 'play none none reverse' }
      }
    );
  }
  if(connect.length){
    gsap.fromTo(connect,
      { opacity: 0, y: 14 },
      {
        opacity: 1, y: 0, duration: 0.55, stagger: 0.06, ease: 'power3.out',
        scrollTrigger: { trigger: connect[0], start: 'top 94%', toggleActions: 'play none none reverse' }
      }
    );
  }

  // Soft parallax on photo while the section is in view
  if(photo){
    gsap.to(photo, {
      yPercent: 6,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  }
})();

// Skills — cinematic corkboard pin-drop + thread draw
(function(){
  var section = document.getElementById('skills');
  if(!section) return;

  var path = document.getElementById('skillsThreadPath') || section.querySelector('.corkboard-path');
  var dot = document.getElementById('skillsThreadDot');
  var anchors = section.querySelector('.corkboard-anchors');
  var cork = section.querySelector('.corkboard');
  var house = section.querySelector('.skills-house-mark');
  var eyebrow = section.querySelector('.skills-eyebrow');
  var headingLines = section.querySelectorAll('.skills-heading-line');
  var lede = section.querySelector('.skills-lede');
  var cards = section.querySelectorAll('.pin-card');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var pathLen = 0;
  if(path){
    pathLen = path.getTotalLength();
    path.style.strokeDasharray = String(pathLen);
    path.style.strokeDashoffset = String(pathLen);
  }
  if(dot && path){
    var start = path.getPointAtLength(0);
    dot.setAttribute('cx', start.x);
    dot.setAttribute('cy', start.y);
  }

  function settlePose(card){
    var rot = getComputedStyle(card).getPropertyValue('--pin-rot').trim() || '0deg';
    var y = getComputedStyle(card).getPropertyValue('--pin-y').trim() || '0px';
    return { rotation: parseFloat(rot) || 0, y: parseFloat(y) || 0 };
  }

  if(reduceMotion || !window.gsap || !window.ScrollTrigger){
    if(path) path.style.strokeDashoffset = '0';
    if(anchors) anchors.style.opacity = '0.5';
    cards.forEach(function(card){ card.classList.add('is-settled'); });
    return;
  }

  if(house){
    gsap.fromTo(house,
      { opacity: 0, y: 18 },
      {
        opacity: 1, y: 0, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: house, start: 'top 90%', toggleActions: 'play none none reverse' }
      }
    );
  }
  if(eyebrow){
    gsap.fromTo(eyebrow,
      { opacity: 0, x: -26 },
      {
        opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: eyebrow, start: 'top 88%', toggleActions: 'play none none reverse' }
      }
    );
  }

  headingLines.forEach(function(line){
    var text = line.textContent;
    line.innerHTML = '<span class="skills-heading-inner">' + text + '</span>';
    var inner = line.querySelector('.skills-heading-inner');
    gsap.fromTo(inner,
      { yPercent: 115 },
      {
        yPercent: 0, duration: 1.1, ease: 'power4.out',
        scrollTrigger: { trigger: line, start: 'top 88%', toggleActions: 'play none none reverse' }
      }
    );
  });

  if(lede){
    gsap.fromTo(lede,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: lede, start: 'top 90%', toggleActions: 'play none none reverse' }
      }
    );
  }

  // Thread draw with trailing focus pin
  if(path && cork){
    var draw = { v: 0 };
    gsap.to(draw, {
      v: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: cork,
        start: 'top 78%',
        end: 'bottom 48%',
        scrub: 0.7,
        onUpdate: function(){
          path.style.strokeDashoffset = String(pathLen * (1 - draw.v));
          if(dot){
            var pt = path.getPointAtLength(pathLen * draw.v);
            dot.setAttribute('cx', pt.x);
            dot.setAttribute('cy', pt.y);
          }
        }
      }
    });
  }
  if(anchors){
    gsap.fromTo(anchors,
      { opacity: 0 },
      {
        opacity: 0.5, duration: 1.1, ease: 'power2.out',
        scrollTrigger: { trigger: cork, start: 'top 72%', toggleActions: 'play none none reverse' }
      }
    );
  }

  // Pin-drop cascade — cards fall in and settle into corkboard tilt
  cards.forEach(function(card, i){
    var pose = settlePose(card);
    var tags = card.querySelectorAll('.tag');
    var mark = card.querySelector('.skill-mark');
    var title = card.querySelector('.skill-title');
    var badge = card.querySelector('.skill-new');
    var pin = card.querySelector('.pin-head');

    gsap.set(card, {
      opacity: 0,
      y: pose.y - 72,
      rotation: pose.rotation - (i % 2 === 0 ? 8 : -8),
      scale: 0.92,
      transformOrigin: '50% 0%'
    });
    if(tags.length) gsap.set(tags, { opacity: 0, y: 10 });
    if(mark) gsap.set(mark, { opacity: 0, y: 12 });
    if(title) gsap.set(title, { opacity: 0, y: 14 });
    if(badge) gsap.set(badge, { opacity: 0, scale: 0.7 });
    if(pin) gsap.set(pin, { scale: 0, opacity: 0 });

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        toggleActions: 'play none none reverse'
      }
    });

    tl.to(card, {
      opacity: 1,
      y: pose.y,
      rotation: pose.rotation,
      scale: 1,
      duration: 1.05,
      ease: 'power4.out'
    }, 0);

    if(pin){
      tl.to(pin, {
        scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2.4)'
      }, 0.18);
    }
    if(mark){
      tl.to(mark, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 0.28);
    }
    if(title){
      tl.to(title, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.36);
    }
    if(badge){
      tl.to(badge, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.8)' }, 0.4);
    }
    if(tags.length){
      tl.to(tags, {
        opacity: 1, y: 0, duration: 0.45, stagger: 0.04, ease: 'power3.out'
      }, 0.48);
    }

    // Soft lift on hover (desktop)
    card.addEventListener('mouseenter', function(){
      gsap.to(card, {
        y: pose.y - 10,
        scale: 1.03,
        boxShadow: '0 26px 42px -16px rgba(20,15,10,0.4), 0 2px 6px rgba(20,15,10,0.08)',
        duration: 0.45,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    });
    card.addEventListener('mouseleave', function(){
      gsap.to(card, {
        y: pose.y,
        rotation: pose.rotation,
        scale: 1,
        boxShadow: '0 18px 34px -16px rgba(20,15,10,0.32), 0 2px 6px rgba(20,15,10,0.07)',
        duration: 0.55,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    });
  });

  // Subtle board parallax while section is in view
  if(cork){
    gsap.to(cork, {
      y: -18,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  }
})();

// Achievements + Experience — shared minimal cinematic runway.
// Quiet full-bleed video plate continues from Recognition through Experience.
(function(){
  var section = document.getElementById('achievements');
  if(!section) return;

  var zone = document.getElementById('ascii-cinema-zone') || section;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stickyBg = zone.querySelector('.ach-sticky-bg') || section.querySelector('.ach-sticky-bg');
  var content = section.querySelector('.ach-content');

  if(!stickyBg){
    stickyBg = document.createElement('div');
    stickyBg.className = 'ach-sticky-bg';
    stickyBg.setAttribute('aria-hidden', 'true');
    stickyBg.innerHTML =
      '<video class="ach-bg-video" id="achBgVideo" muted loop playsinline preload="metadata" poster="videos/hero-poster.jpg">' +
      '<source src="videos/hero-cinematic.mp4" type="video/mp4"></video>' +
      '<div class="ach-video-fallback"></div>' +
      '<div class="ach-video-wash"></div>' +
      '<div class="ach-video-grain"></div>' +
      '<div class="ach-video-vignette"></div>';
    zone.insertBefore(stickyBg, zone.firstChild);
  }
  if(!content){
    content = document.createElement('div');
    content.className = 'ach-content';
    while(section.firstChild) content.appendChild(section.firstChild);
    section.appendChild(content);
  }

  var video = document.getElementById('achBgVideo') || stickyBg.querySelector('.ach-bg-video');
  var house = content.querySelector('.ach-house-mark');
  var eyebrow = content.querySelector('.ach-eyebrow');
  var headingLines = content.querySelectorAll('.ach-heading-line');
  var lede = content.querySelector('.ach-lede');
  var cards = content.querySelectorAll('.phase-card');

  function playBg(){
    if(!video || reduceMotion) return;
    video.muted = true;
    var p = video.play();
    if(p && p.then){
      p.then(function(){ video.classList.add('is-ready'); }).catch(function(){});
    } else {
      video.classList.add('is-ready');
    }
  }

  if(video){
    video.addEventListener('loadeddata', function(){
      if(!video.paused) video.classList.add('is-ready');
    });
    if('IntersectionObserver' in window){
      var vio = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting) playBg();
          else if(!video.paused) video.pause();
        });
      }, { threshold: 0.02 });
      vio.observe(zone);
    } else {
      playBg();
    }
  }

  if(reduceMotion || !window.gsap || !window.ScrollTrigger) return;

  if(video){
    gsap.to(video, {
      scale: 1.12,
      yPercent: 4,
      ease: 'none',
      scrollTrigger: {
        trigger: zone,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.1
      }
    });
  }

  if(house){
    gsap.fromTo(house,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: house, start: 'top 90%', toggleActions: 'play none none reverse' } }
    );
  }
  if(eyebrow){
    gsap.fromTo(eyebrow,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out',
        scrollTrigger: { trigger: eyebrow, start: 'top 88%', toggleActions: 'play none none reverse' } }
    );
  }
  headingLines.forEach(function(line){
    var text = line.textContent;
    line.innerHTML = '<span class="ach-heading-inner">' + text + '</span>';
    var inner = line.querySelector('.ach-heading-inner');
    gsap.fromTo(inner,
      { yPercent: 110 },
      { yPercent: 0, duration: 1.05, ease: 'power4.out',
        scrollTrigger: { trigger: line, start: 'top 88%', toggleActions: 'play none none reverse' } }
    );
  });
  if(lede){
    gsap.fromTo(lede,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: lede, start: 'top 90%', toggleActions: 'play none none reverse' } }
    );
  }

  cards.forEach(function(card, i){
    var fromLeft = i % 2 === 0;
    gsap.fromTo(card,
      { opacity: 0, y: 36, x: fromLeft ? -28 : 28 },
      {
        opacity: 1, y: 0, x: 0,
        duration: 0.95, ease: 'power3.out',
        scrollTrigger: {
          trigger: card, start: 'top 90%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });
})();

// Cinematic high-professional transitions between every major section while scrolling.
// For each section (after the hero's own intro): a glowing seam that draws across the
// boundary, a veil that lifts as the section arrives / settles back on exit, and a
// clip-path title reveal on the section header. Content itself keeps using the
// enhanced .fade-in system above — this layer handles the between-section moment.
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if(!window.gsap || !window.ScrollTrigger) return;

  var sectionIds = ['about', 'skills', 'projects', 'achievements', 'experience', 'contact'];

  sectionIds.forEach(function(id){
    var section = document.getElementById(id);
    if(!section) return;

    // --- Boundary seam (thin cinematic light across the section top) ---
    var seam = document.createElement('div');
    seam.className = 'cinematic-seam';
    seam.setAttribute('aria-hidden', 'true');
    seam.innerHTML = '<span class="cinematic-seam-line"></span><span class="cinematic-seam-glow"></span>';
    // Keep seams above the achievements sticky backdrop by inserting into the
    // content wrapper when present; otherwise at the top of the section.
    var seamHost = section.querySelector('.ach-content') || section;
    seamHost.insertBefore(seam, seamHost.firstChild);

    var seamLine = seam.querySelector('.cinematic-seam-line');
    var seamGlow = seam.querySelector('.cinematic-seam-glow');
    gsap.fromTo(seamLine,
      { scaleX: 0, opacity: 0 },
      {
        scaleX: 1, opacity: 1, duration: 1.25, ease: 'power3.out',
        scrollTrigger: {
          trigger: section, start: 'top 88%', end: 'top 40%',
          toggleActions: 'play none none reverse'
        }
      }
    );
    gsap.fromTo(seamGlow,
      { opacity: 0, scaleX: 0.5 },
      {
        opacity: 1, scaleX: 1, duration: 1.4, ease: 'power2.out',
        scrollTrigger: {
          trigger: section, start: 'top 88%', end: 'top 40%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // --- Enter/exit veil: lifts as the section arrives, softens again on exit ---
    // Inserted behind content (sticky bg stays at the back when present).
    var veil = document.createElement('div');
    veil.className = 'cinematic-veil';
    veil.setAttribute('aria-hidden', 'true');
    var stickyBg = section.querySelector('.ach-sticky-bg');
    if(stickyBg && stickyBg.nextSibling){
      section.insertBefore(veil, stickyBg.nextSibling);
    } else {
      section.insertBefore(veil, section.firstChild);
    }
    // Keep real content above the veil without covering the sticky backdrop.
    // Skip #project-detail: it must stay position:fixed (fullscreen overlay).
    // Forcing relative/z-index here collapses the panel so card clicks look broken.
    Array.prototype.forEach.call(section.children, function(child){
      if(
        child === veil ||
        child.id === 'project-detail' ||
        child.classList.contains('ach-sticky-bg') ||
        child.classList.contains('ty-stage') ||
        child.classList.contains('about-atmosphere') ||
        child.classList.contains('about-stage') ||
        child.classList.contains('projects-stage') ||
        child.classList.contains('skills-atmosphere') ||
        child.classList.contains('hero-stage') ||
        child.classList.contains('cinematic-seam')
      ) return;
      if(!child.style.position) child.style.position = 'relative';
      if(!child.style.zIndex) child.style.zIndex = '2';
    });

    gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.65
      }
    })
      .fromTo(veil, { opacity: 0.65 }, { opacity: 0, duration: 0.32, ease: 'none' }, 0)
      .to(veil, { opacity: 0.28, duration: 0.22, ease: 'none' }, 0.78);

    // --- Header tag + title cinematic reveal ---
    var tag = section.querySelector('.section-tag, .about-eyebrow, .collab-tag');
    var title = section.querySelector('.section-header h2, .thank-you, .exp-title');

    if(tag){
      gsap.fromTo(tag,
        { opacity: 0, x: -28 },
        {
          opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: {
            trigger: tag, start: 'top 90%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    if(title){
      // Avoid fighting the About column's existing .fade-in on the same node tree
      // for the heading when it's nested inside a fade-in — still fine to clip-reveal.
      title.classList.add('cinematic-title-reveal');
      gsap.fromTo(title,
        { opacity: 0, y: 48, clipPath: 'inset(110% 0 0 0)' },
        {
          opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)',
          duration: 1.2, ease: 'power4.out',
          scrollTrigger: {
            trigger: title, start: 'top 90%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

  });

  // After wiring everything, refresh ScrollTrigger so Lenis + new triggers stay in sync
  ScrollTrigger.refresh();
})();
// Interstellar-themed ambient background music
// Track: Starfield Romance (Yoiyami, CC0) + soft generative organ bed
(function(){
  var btn = document.getElementById('soundToggle');
  var audio = document.getElementById('bgMusic');
  if(!btn || !audio) return;

  var label = btn.querySelector('.sound-label');
  var STORAGE_KEY = 'asc-sound-on';
  var TARGET_VOL = 0.32;
  var playing = false;
  var fading = null;
  var ctx = null;
  var masterGain = null;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setUi(on){
    playing = on;
    btn.classList.toggle('is-playing', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Mute background music' : 'Play background music');
    if(label) label.textContent = on ? 'Sound On' : 'Sound';
  }

  function fadeAudioTo(target, ms){
    if(fading) cancelAnimationFrame(fading);
    target = Math.max(0, Math.min(1, Number(target) || 0));
    var start = Math.max(0, Math.min(1, Number(audio.volume) || 0));
    var t0 = performance.now();
    function step(now){
      var p = Math.min(1, (now - t0) / Math.max(1, ms));
      var eased = p * (2 - p);
      var next = start + (target - start) * eased;
      // Clamp — floating-point easing can drift slightly outside [0, 1]
      audio.volume = Math.max(0, Math.min(1, next));
      if(p < 1) fading = requestAnimationFrame(step);
      else {
        fading = null;
        audio.volume = target;
        if(target === 0) audio.pause();
      }
    }
    fading = requestAnimationFrame(step);
  }

  function ensureOrgan(){
    var AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return;
    if(!ctx) ctx = new AC();
    if(ctx.state === 'suspended') ctx.resume();
    if(masterGain) return;

    masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);

    // Quiet pipe-organ style fifths/octaves — Interstellar atmosphere, original bed
    var freqs = [55, 82.5, 110, 165, 220];
    freqs.forEach(function(freq, i){
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      var filter = ctx.createBiquadFilter();
      var lfo = ctx.createOscillator();
      var lfoGain = ctx.createGain();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      filter.type = 'lowpass';
      filter.frequency.value = 420 + i * 40;
      filter.Q.value = 0.7;
      gain.gain.value = 0.045 / (i + 1);
      lfo.type = 'sine';
      lfo.frequency.value = 0.05 + i * 0.01;
      lfoGain.gain.value = 30 + i * 8;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start();
      lfo.start();
    });
  }

  function fadeOrgan(to, seconds){
    if(!masterGain || !ctx) return;
    var now = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(to, now + seconds);
  }

  function startSound(){
    ensureOrgan();
    audio.volume = 0;
    var playPromise = audio.play();
    function go(){
      fadeAudioTo(TARGET_VOL, reduceMotion ? 200 : 1400);
      fadeOrgan(0.11, reduceMotion ? 0.3 : 1.6);
      setUi(true);
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch(e){}
    }
    if(playPromise && playPromise.then){
      playPromise.then(go).catch(function(){
        fadeOrgan(0.16, 1.2);
        setUi(true);
        try { localStorage.setItem(STORAGE_KEY, '1'); } catch(e){}
      });
    } else {
      go();
    }
  }

  function stopSound(){
    fadeAudioTo(0, reduceMotion ? 150 : 700);
    fadeOrgan(0, reduceMotion ? 0.2 : 0.8);
    setUi(false);
    try { localStorage.setItem(STORAGE_KEY, '0'); } catch(e){}
  }

  btn.addEventListener('click', function(){
    if(playing) stopSound();
    else startSound();
  });

  var preferOn = false;
  try { preferOn = localStorage.getItem(STORAGE_KEY) === '1'; } catch(e){}

  if(preferOn){
    var unlock = function(){
      startSound();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }

  document.addEventListener('visibilitychange', function(){
    if(document.hidden){
      if(playing){
        audio.pause();
        fadeOrgan(0, 0.2);
      }
    } else if(playing){
      audio.play().catch(function(){});
      fadeOrgan(0.11, 0.6);
    }
  });
})();

// Thank You end card — cinematic astronaut video + light-level production animation
(function(){
  var section = document.getElementById('contact');
  var video = document.getElementById('tyAstronautVideo');
  if(!section || !video) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stage = section.querySelector('.ty-stage');
  var mark = section.querySelector('.ty-house-mark');
  var title = section.querySelector('.thank-you');
  var sub = section.querySelector('.ty-subcopy');
  var lights = section.querySelectorAll('.ty-light');

  function playVideo(){
    if(reduceMotion) return;
    var p = video.play();
    if(p && p.then){
      p.then(function(){ video.classList.add('is-ready'); })
       .catch(function(){ /* keep poster fallback */ });
    } else {
      video.classList.add('is-ready');
    }
  }

  function pauseVideo(){
    if(!video.paused) video.pause();
  }

  // Lazy-play only while the end card is in view
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting) playVideo();
        else pauseVideo();
      });
    }, { threshold: 0.2 });
    io.observe(section);
  } else {
    playVideo();
  }

  video.addEventListener('loadeddata', function(){
    if(!video.paused) video.classList.add('is-ready');
  });

  if(reduceMotion || !window.gsap || !window.ScrollTrigger) return;

  // Soft parallax drift on the video plate while scrolling the end card
  if(stage){
    gsap.to(video, {
      yPercent: 8,
      scale: 1.14,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.7
      }
    });
  }

  // Production-house end-card reveal
  if(mark){
    gsap.fromTo(mark,
      { opacity: 0, y: 18 },
      {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: mark, start: 'top 88%', toggleActions: 'play none none reverse' }
      }
    );
  }
  if(title){
    gsap.fromTo(title,
      { opacity: 0, y: 56, clipPath: 'inset(110% 0 0 0)' },
      {
        opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)',
        duration: 1.25, ease: 'power4.out',
        scrollTrigger: { trigger: title, start: 'top 86%', toggleActions: 'play none none reverse' }
      }
    );
  }
  if(sub){
    gsap.fromTo(sub,
      { opacity: 0, y: 24 },
      {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.12,
        scrollTrigger: { trigger: sub, start: 'top 90%', toggleActions: 'play none none reverse' }
      }
    );
  }

  // Light-level intensity rises as the end card centers
  if(lights.length){
    gsap.fromTo(lights,
      { opacity: 0.08 },
      {
        opacity: 0.42,
        ease: 'none',
        stagger: 0.04,
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          end: 'center center',
          scrub: 0.8
        }
      }
    );
  }
})();

// Thank You — mail form delivers to inbox via FormSubmit (+ mailto fallback)
(function(){
  var form = document.getElementById('tyMailForm');
  if(!form) return;

  var submitBtn = document.getElementById('tyMailSubmit');
  var fallbackBtn = document.getElementById('tyMailFallback');
  var statusEl = document.getElementById('tyMailStatus');
  var setupEl = document.getElementById('tyMailSetup');
  var labelEl = submitBtn ? submitBtn.querySelector('.ty-mail-send-label') : null;
  var endpoint = 'https://formsubmit.co/ajax/allenschristian07@gmail.com';
  var inbox = 'allenschristian07@gmail.com';
  var sending = false;
  var activatedKey = 'tyMailFormActivated';

  if(setupEl && window.localStorage && localStorage.getItem(activatedKey) === '1'){
    setupEl.classList.add('is-hidden');
  }

  function setStatus(msg, kind){
    if(!statusEl) return;
    statusEl.textContent = msg || '';
    statusEl.classList.remove('is-ok', 'is-err');
    if(kind) statusEl.classList.add(kind);
  }

  function setBusy(busy){
    sending = busy;
    if(submitBtn) submitBtn.disabled = busy;
    if(labelEl) labelEl.textContent = busy ? 'Sending…' : 'Send Mail';
  }

  function validEmail(value){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
  }

  function readFields(){
    return {
      name: String((form.querySelector('#tyMailName') || {}).value || '').trim(),
      email: String((form.querySelector('#tyMailEmail') || {}).value || '').trim(),
      message: String((form.querySelector('#tyMailMessage') || {}).value || '').trim(),
      honey: String((form.querySelector('[name="_honey_trap"]') || {}).value || '').trim()
    };
  }

  function openMailto(fields){
    var subject = 'Portfolio message from ' + (fields.name || 'visitor');
    var body = [
      'Name: ' + fields.name,
      'Email: ' + fields.email,
      '',
      fields.message
    ].join('\n');
    var href = 'mailto:' + encodeURIComponent(inbox)
      + '?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(body);
    window.location.href = href;
  }

  function isSuccessPayload(data){
    if(!data) return false;
    if(data.success === true || data.success === 'true') return true;
    if(data.ok === true) return true;
    return false;
  }

  function looksLikeActivation(data, rawText){
    var msg = '';
    if(data){
      msg = String(data.message || data.error || data.Message || '');
    }
    msg = (msg + ' ' + String(rawText || '')).toLowerCase();
    return msg.indexOf('activat') !== -1
      || msg.indexOf('confirm') !== -1
      || msg.indexOf('check your email') !== -1;
  }

  if(fallbackBtn){
    fallbackBtn.addEventListener('click', function(){
      var fields = readFields();
      if(!fields.name || !fields.email || !fields.message){
        setStatus('Fill name, email, and message first.', 'is-err');
        return;
      }
      if(!validEmail(fields.email)){
        setStatus('Please enter a valid email address.', 'is-err');
        return;
      }
      openMailto(fields);
      setStatus('Opening your mail app…', 'is-ok');
    });
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(sending) return;

    var fields = readFields();

    if(fields.honey){
      setStatus('Thanks — message noted.', 'is-ok');
      form.reset();
      return;
    }
    if(!fields.name || !fields.email || !fields.message){
      setStatus('Please fill in name, email, and message.', 'is-err');
      return;
    }
    if(!validEmail(fields.email)){
      setStatus('Please enter a valid email address.', 'is-err');
      return;
    }

    setBusy(true);
    setStatus('Sending your message…');

    var body = new FormData();
    body.append('name', fields.name);
    body.append('email', fields.email);
    body.append('message', fields.message);
    body.append('_replyto', fields.email);
    body.append('_subject', 'Portfolio message from ' + fields.name);
    body.append('_template', 'table');
    body.append('_captcha', 'false');
    body.append('_honey', '');

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: body
    })
      .then(function(res){
        return res.text().then(function(text){
          var data = {};
          try { data = text ? JSON.parse(text) : {}; } catch(err){ data = { raw: text }; }
          return { ok: res.ok, status: res.status, data: data, text: text };
        });
      })
      .then(function(result){
        var data = result.data || {};
        var activation = looksLikeActivation(data, result.text);

        if(activation){
          if(setupEl) setupEl.classList.remove('is-hidden');
          setStatus('Activation needed: open Gmail for allenschristian07@gmail.com, click FormSubmit Activate, then send again.', 'is-err');
          return;
        }

        if(isSuccessPayload(data)){
          if(window.localStorage) localStorage.setItem(activatedKey, '1');
          if(setupEl) setupEl.classList.add('is-hidden');
          setStatus('Sent. I will get back to you soon.', 'is-ok');
          form.reset();
          return;
        }

        // Do not treat bare HTTP 200 as success — FormSubmit often returns 200 for activation.
        setStatus('Could not deliver yet. Use “Open in Mail app”, or activate FormSubmit in Gmail first.', 'is-err');
        if(setupEl) setupEl.classList.remove('is-hidden');
      })
      .catch(function(){
        setStatus('Network blocked FormSubmit. Opening your mail app instead…', 'is-err');
        openMailto(fields);
      })
      .finally(function(){
        setBusy(false);
      });
  });
})();

// Hero opening — extreme cinematic video plate + dust + parallax
(function(){
  var hero = document.getElementById('hero');
  var video = document.getElementById('heroCinematicVideo');
  var dust = document.getElementById('heroDust');
  if(!hero || !video) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function playHero(){
    if(reduceMotion) return;
    var p = video.play();
    if(p && p.then){
      p.then(function(){ video.classList.add('is-ready'); })
       .catch(function(){});
    } else {
      video.classList.add('is-ready');
    }
  }

  video.addEventListener('loadeddata', function(){
    if(!video.paused) video.classList.add('is-ready');
  });

  // Start as soon as possible after first gesture/load; also retry after preloader
  playHero();
  window.addEventListener('pointerdown', playHero, { once: true });
  setTimeout(playHero, 1800);

  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting) playHero();
        else if(!video.paused) video.pause();
      });
    }, { threshold: 0.15 });
    io.observe(hero);
  }

  if(dust && !reduceMotion){
    var html = '';
    for(var i = 0; i < 28; i++){
      var left = Math.random() * 100;
      var delay = Math.random() * 8;
      var dur = 7 + Math.random() * 10;
      var size = 1 + Math.random() * 2.2;
      html += '<span style="left:' + left + '%;bottom:-8%;width:' + size + 'px;height:' + size + 'px;animation-duration:' + dur + 's;animation-delay:' + delay + 's;"></span>';
    }
    dust.innerHTML = html;
  }

  if(reduceMotion || !window.gsap || !window.ScrollTrigger) return;

  // Crazy cinematic push: slow push-in + vertical drift while leaving the opening title
  gsap.to(video, {
    scale: 1.18,
    yPercent: 6,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.8
    }
  });

  gsap.to('.hero-bloom', {
    opacity: 0.15,
    scale: 1.35,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  gsap.to('.hero-letterbox span', {
    scaleY: 1.8,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5
    }
  });
})();
