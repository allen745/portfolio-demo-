// Buttery smooth scroll + GSAP ScrollTrigger sync (guarded if CDNs blocked)
var hasGsap = typeof gsap !== 'undefined';
var hasScrollTrigger = hasGsap && typeof ScrollTrigger !== 'undefined';
var hasLenis = typeof Lenis !== 'undefined';
var lenis = null;

if (hasGsap && hasScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

if (hasLenis) {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  window.lenis = lenis;
  if (hasGsap && hasScrollTrigger) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  } else {
    function lenisLoop(time) {
      lenis.raf(time);
      requestAnimationFrame(lenisLoop);
    }
    requestAnimationFrame(lenisLoop);
  }
  lenis.stop(); // lock scroll until intro finishes
} else {
  window.lenis = null;
}

// Page-load intro — Nolan-style title card (Engineered by / Cinzel name)
(function(){
  var pre = document.getElementById('preloader');
  if(!pre) return;
  var creditEl = pre.querySelector('.preloader-credit');
  var titleEl = pre.querySelector('.preloader-title-line');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function finishIntro(){
    if(pre && pre.parentNode) pre.remove();
    if(window.lenis) lenis.start();
    if(hasGsap && hasScrollTrigger) ScrollTrigger.refresh();
  }

  if(!hasGsap){
    if(creditEl) creditEl.style.opacity = '1';
    if(titleEl) titleEl.style.opacity = '1';
    setTimeout(function(){
      finishIntro();
    }, reduceMotion ? 200 : 1800);
    return;
  }

  gsap.ticker.lagSmoothing(500, 33);
  var tl = gsap.timeline({
    defaults: { force3D: true, ease: 'power2.out' },
    onComplete: function(){
      finishIntro();
    }
  });

  if(reduceMotion){
    gsap.set([creditEl, titleEl], { opacity: 1 });
    tl.to(pre, { opacity: 0, duration: 0.35 }, 0.45);
  } else {
    // Fade in: "Directed by", then the name — hold — dissolve
    if(creditEl){
      gsap.set(creditEl, { opacity: 0 });
      tl.to(creditEl, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.2);
    }
    if(titleEl){
      gsap.set(titleEl, { opacity: 0 });
      tl.to(titleEl, { opacity: 1, duration: 1.05, ease: 'power2.out' }, 0.45);
    }
    tl.to({}, { duration: 1.35 });
    if(creditEl){
      tl.to(creditEl, { opacity: 0, duration: 0.85, ease: 'power2.inOut' }, '>-0.05');
    }
    tl.to(titleEl, { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, '<');
    tl.to(pre, { opacity: 0, duration: 0.7, ease: 'power2.inOut' }, '-=0.45');
  }

  // Hero type reveal after the title card dissolves
  tl.fromTo('.hb-kicker', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.35');
  tl.fromTo('.hb-rule', { opacity: 0, scaleX: 0.35 }, { opacity: 1, scaleX: 1, duration: 1.0, ease: 'power2.out' }, '-=0.45');
  tl.fromTo('.hb-title-text', {
    opacity: 0,
    letterSpacing: window.matchMedia('(max-width: 700px)').matches ? '0.36em' : '0.62em'
  }, {
    opacity: 1,
    letterSpacing: window.matchMedia('(max-width: 700px)').matches ? '0.22em' : '0.42em',
    duration: 1.4,
    ease: 'power2.out'
  }, '-=0.55');
  tl.fromTo('.hb-role', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.7');
  tl.fromTo('.hb-scroll', { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.35');
  tl.fromTo('.hero-plate', { scale: 1.06 }, { scale: 1.02, duration: 2.2, ease: 'power1.out' }, '-=1.6');
})();

// Smooth in-page anchors with Lenis when available
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
  var magnetic = document.querySelectorAll('.btn, .contact-pill, .about-cta');
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

// Gallery — Moments field-reel cinematic background
(function(){
  var section = document.getElementById('gallery');
  var video = document.getElementById('galleryBgVideo');
  if(!section || !video) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function playGalleryVideo(){
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
        if(entry.isIntersecting) playGalleryVideo();
        else if(!video.paused) video.pause();
      });
    }, { threshold: 0.1 });
    vio.observe(section);
  } else {
    playGalleryVideo();
  }

  if(reduceMotion || !window.gsap || !window.ScrollTrigger) return;

  gsap.to(video, {
    scale: 1.12,
    yPercent: 4,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.95
    }
  });
})();

// Project case-study system — click a card, scroll horizontally through the story
(function(){
  const projects = {
    devmind: {
      num: "01", tag: "Live Product",
      title: "DevMind AI — AI Developer Toolkit",
      desc: "An AI-powered developer productivity platform with five tools for reviewing, fixing, documenting, and analyzing code — designed, deployed, and maintained end-to-end.",
      highlights: [
        "5 tools: code review, bug fixing, docs generation, complexity analysis, commit messages",
        "Direct GitHub file URL ingestion — no copy-paste required",
        "Live product with Google OAuth and a full dashboard"
      ],
      tech: ["FastAPI","Groq","React.js","Vercel"],
      links: [
        { label: "Live demo", href: "https://dev-mind-ai-isguu.vercel.app/" },
        { label: "GitHub", href: "https://github.com/allen745/devmind-ai" }
      ],
      theme: { bg:"#14102a", panel:"#221a3d", text:"#f0f0f0", muted:"#b4a8d4", border:"rgba(255,255,255,0.14)", accent:"#c084fc", accent2:"#5eead4" },
      images: ["images/projects/devmind/1.jpg","images/projects/devmind/2.png","images/projects/devmind/3.png","images/projects/devmind/4.png","images/projects/devmind/5.png","images/projects/devmind/6.png"],
      stories: [
        { title: "Sign In", sub: "Google OAuth, straight into the toolkit." },
        { title: "Five Tools, One Dashboard", sub: "Code review, bug hunt, docs, complexity, commits." },
        { title: "Code Review, Scored", sub: "80/100, bugs flagged with fixes attached." },
        { title: "Docs, Auto-Generated", sub: "A full README written straight from the code." },
        { title: "Complexity, Explained", sub: "Time complexity broken down function by function." }
      ]
    },
    devmindagent: {
      num: "02", tag: "Reasoning Agent · Agents League",
      title: "DevMind AI Agent — Autonomous Repository Intelligence Agent",
      desc: "A 4-step reasoning agent that turns a public GitHub repo into a cited Project Health Report using a dual-model pipeline. Built for the Microsoft Agents League hackathon.",
      highlights: [
        "Fetch → per-file analysis → cross-file patterns → Foundry IQ synthesis",
        "Grounded 0–100 health score with top recommended fixes",
        "Submitted to the Reasoning Agents track"
      ],
      tech: ["FastAPI","Groq/LLaMA-3.3-70b","Microsoft Foundry IQ","GitHub REST API"],
      links: [
        { label: "GitHub", href: "https://github.com/allen745/DEVMIND-AGENT" }
      ],
      theme: { bg:"#1a1442", panel:"#241b58", text:"#ece9ff", muted:"#b3a9e0", border:"rgba(255,255,255,0.14)", accent:"#8b7cf6", accent2:"#22d3ee" },
      images: ["images/projects/devmindagent/1.png","images/projects/devmindagent/2.png","images/projects/devmindagent/3.png","images/projects/devmindagent/4.png"],
      stories: [
        { title: "Analysis Summary", sub: "A real repo scanned in seconds, health score 55/100." },
        { title: "The Reasoning Pipeline", sub: "4 steps, 2 models: fetch, analyze, cross-reference, synthesize." },
        { title: "File by File", sub: "Bugs, security, quality and severity, all cited." }
      ]
    },
    casaas: {
      num: "03", tag: "B2B SaaS · In Progress",
      title: "CA SaaS — B2B AI Platform for Chartered Accountants",
      desc: "A full-stack B2B SaaS platform for India's practicing Chartered Accountants — client management plus an AI layer that reads documents, drafts notices, and flags anomalies.",
      highlights: [
        "JWT auth with full client management",
        "AI-powered ITR summarization and notice reply drafting",
        "20+ REST API endpoints across auth, clients, documents, AI, and notices"
      ],
      tech: ["FastAPI","PostgreSQL","React.js","Groq/LLaMA-3.3"],
      links: [
        { label: "GitHub", href: "https://github.com/allen745/ca-saas" }
      ],
      theme: { bg:"#101a14", panel:"#1c2a20", text:"#eaf4ec", muted:"#a9c6b1", border:"rgba(255,255,255,0.14)", accent:"#3d8b6e", accent2:"#d4a574" },
      images: ["images/projects/casaas/1.jpg","images/projects/casaas/2.png","images/projects/casaas/3.png","images/projects/casaas/4.png","images/projects/casaas/5.png"],
      stories: [
        { title: "Sign In", sub: "JWT-secured login, built for CA workflows." },
        { title: "The Dashboard", sub: "128 clients, 342 documents, 7 anomalies flagged." },
        { title: "Upload and Extract", sub: "Drag in a notice, get clean extracted text in seconds." },
        { title: "AI Insights", sub: "Income mismatches and penalty risk, flagged automatically." }
      ]
    },
    vertex: {
      num: "04", tag: "Career Intelligence · In Progress",
      title: "Vertex — AI Career Intelligence Platform",
      desc: "A student-built platform helping tech learners decide what to study next: salary signals, demand trends, and an AI advisor grounded in where each student actually stands.",
      highlights: [
        "Phase-based roadmaps with curated resources per domain",
        "Salary and demand signals projected forward",
        "Vertice AI reads progress before responding — no generic answers"
      ],
      tech: ["FastAPI","React.js","Azure OpenAI","Recharts","Microsoft Auth"],
      links: [],
      theme: { bg:"#1a120c", panel:"#2a1c14", text:"#f3e9dd", muted:"#c9b8a8", border:"rgba(255,255,255,0.14)", accent:"#e8a25c", accent2:"#60a5fa" },
      images: ["images/projects/vertex/1.jpg","images/projects/vertex/2.jpg","images/projects/vertex/3.jpg","images/projects/vertex/4.jpg","images/projects/vertex/5.jpg"],
      stories: [
        { title: "The Reframe", sub: "Most platforms give you a list. We give you a moving picture." },
        { title: "Pick Your Track", sub: "6 domains mapped, ML Engineer live first." },
        { title: "The Roadmap", sub: "11 structured phases, zero guesswork." },
        { title: "Vertice AI", sub: "A mentor grounded in your actual progress." }
      ]
    },
    patent: {
      num: "05", tag: "Design Patent · Government of India",
      title: "Spring-Loaded Piezoelectric Generating Striker Device",
      desc: "A design-patented ambient energy harvesting device that converts footstep force into electrical power via a spring-loaded hammer striking a PZT disc. Built as a physical exhibit, not just a drawing.",
      highlights: [
        "Design No. 450815-001 — Patent Office, Government of India (design patent)",
        "4-phase cycle: Loading, Release, Impact, Energy Output",
        "Hands-on Power Strikes exhibit installation"
      ],
      tech: ["Piezoelectric","PZT-5A/5H","Mechanical Design"],
      links: [
        { label: "GitHub", href: "https://github.com/allen745/power-strike-" }
      ],
      theme: { bg:"#0f2018", panel:"#183526", text:"#eaf4ec", muted:"#a9c6b1", border:"rgba(255,255,255,0.14)", accent:"#4ade80", accent2:"#fbbf24" },
      images: ["images/projects/patent/1.jpg","images/projects/patent/2.jpg","images/projects/patent/3.jpeg","images/projects/patent/4.jpg"],
      stories: [
        { title: "The Engineering", sub: "7-view technical model, working principle mapped in 4 steps." },
        { title: "Use It or Lose It", sub: "Hands-on energy generation, hit, charge, repeat." },
        { title: "The Redesign", sub: "An alternate colorway built for the same exhibit." }
      ]
    },
    trackbot: {
      num: "06", tag: "SSIP-Funded Team Project · ADIT, CVM University",
      title: "TrackBot 1 — Low-Cost Autonomous Warehouse AGV",
      desc: "A single-MCU autonomous warehouse AGV designed around RFID-corrected odometry, A* pathfinding, and an embedded AI advisory layer, built within a \u20b935,000 SSIP-funded budget. I led electrical power systems and electronics integration on a 4-person research team.",
      highlights: [
        "Co-authored an IEEE-formatted architecture paper",
        "RFID-corrected odometry + A* on a single ESP32-S3",
        "Offline-trained AI advisory layer with zero cloud dependency"
      ],
      tech: ["ESP32-S3","A* Pathfinding","RFID Localization","scikit-learn"],
      links: [],
      theme: { bg:"#0a1428", panel:"#0f1c38", text:"#e6edf7", muted:"#93a4c2", border:"rgba(255,255,255,0.14)", accent:"#4d9fff", accent2:"#38bdf8" },
      images: ["images/projects/trackbot/1.jpg","images/projects/trackbot/2.jpg","images/projects/trackbot/3.jpg"],
      stories: [
        { title: "The Architecture", sub: "Mecanum drive, RFID navigation, live telemetry, AI advisory, one ESP32-S3." },
        { title: "Under the Hood", sub: "Dual-core split: real-time navigation on one core, I/O on the other." }
      ]
    },
    autoseed: {
      num: "07", tag: "IoT + Precision Agriculture · 2025",
      title: "AutoSeed Bot — Autonomous Agricultural Robot",
      desc: "An autonomous seed-planting robot for small-scale farms using Arduino control, ultrasonic sensing, motor control, and precision seed dispersion.",
      highlights: [
        "Sensor-based autonomous field navigation",
        "Precision seed dispersion with live LCD seed count",
        "Built to address labour inefficiency in small-scale farming"
      ],
      tech: ["Arduino","Ultrasonic Sensing","Motor Control","IoT"],
      links: [],
      theme: { bg:"#1a1810", panel:"#2a2618", text:"#f3e9dd", muted:"#a89f88", border:"rgba(255,255,255,0.14)", accent:"#7c8f52", accent2:"#c4a574" },
      images: ["images/projects/autoseed/1.jpg","images/projects/autoseed/2.jpg"],
      stories: [
        { title: "Status: Running", sub: "12 seeds planted and counting, live on the onboard LCD." }
      ]
    },
    mlportfolio: {
      num: "08", tag: "Learning Series · Classical ML",
      title: "ML Models Portfolio",
      desc: "A curated set of foundational machine learning projects built while learning classical ML — classification, regression, fraud detection, health prediction, and more. Practice work, grouped honestly, not oversold as production systems.",
      highlights: [
        "16 foundational ML projects in one curated repo",
        "Real problem domains: fraud, health, finance, NLP baselines",
        "Built to learn pipelines, EDA, and model evaluation end to end"
      ],
      tech: ["Python","Scikit-learn","Pandas","NumPy"],
      links: [
        { label: "GitHub", href: "https://github.com/allen745/ml-models-portfolio" }
      ],
      theme: { bg:"#0c1218", panel:"#162230", text:"#e8eef4", muted:"#9aafc0", border:"rgba(255,255,255,0.14)", accent:"#64b5f6", accent2:"#80cbc4" },
      images: ["images/projects/mlportfolio/1.jpg","images/projects/mlportfolio/2.jpg"],
      stories: [
        { title: "Foundations First", sub: "Classification, regression, and evaluation — practiced across real datasets." }
      ]
    },
    dlportfolio: {
      num: "09", tag: "Learning Series · Deep Learning",
      title: "DL Models Portfolio",
      desc: "A curated deep learning practice portfolio — TensorFlow/Keras models and computer-vision pipelines built while leveling up DL, including internship CNN work and vision experiments.",
      highlights: [
        "Curated DL models with TensorFlow and Keras",
        "Computer vision and CNN pipelines from CodeAlpha ML work",
        "Framed as learning depth — the foundation under product AI work"
      ],
      tech: ["Python","TensorFlow","Keras","Computer Vision"],
      links: [
        { label: "GitHub", href: "https://github.com/allen745/dl-models-portfolio" },
        { label: "CodeAlpha work", href: "https://github.com/allen745/CodeAlpha_MachineLearning" }
      ],
      theme: { bg:"#140e22", panel:"#221836", text:"#f0eaf8", muted:"#b5a8cc", border:"rgba(255,255,255,0.14)", accent:"#b388ff", accent2:"#5eead4" },
      images: ["images/projects/dlportfolio/1.jpg","images/projects/dlportfolio/2.jpg"],
      stories: [
        { title: "Vision Pipelines", sub: "CNNs and DL workflows practiced before shipping LLM products." }
      ]
    }
  };

  var panels = [];
  var track = document.getElementById('pdTrack');
  var detailEl = document.getElementById('project-detail');
  var chapterEl = document.getElementById('pdChapter');
  var chapterTimer = null;
  // Include regular cards and duo-list rows (ML/DL share one grid slot).
  var projectOrder = Array.prototype.map.call(document.querySelectorAll('[data-project]'), function(el){ return el.dataset.project; });
  var currentProjectId = null;
  var isChaining = false;

  function hideChapter(){
    if(chapterTimer){ clearTimeout(chapterTimer); chapterTimer = null; }
    if(chapterEl){
      chapterEl.classList.remove('is-on');
      chapterEl.setAttribute('aria-hidden', 'true');
    }
  }

  // Lift overlay to <body> so it isn't trapped under section stacking / site nav
  if(detailEl && detailEl.parentElement !== document.body){
    document.body.appendChild(detailEl);
  }

  function hexToRgba(hex, alpha){
    var h = String(hex || '').replace('#','').trim();
    if(h.length === 3) h = h.split('').map(function(c){ return c + c; }).join('');
    if(h.length !== 6) return 'rgba(8,12,18,' + alpha + ')';
    var n = parseInt(h, 16);
    return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + alpha + ')';
  }

  function rgbToHex(r, g, b){
    return '#' + [r, g, b].map(function(v){
      var s = Math.max(0, Math.min(255, Math.round(v))).toString(16);
      return s.length === 1 ? '0' + s : s;
    }).join('');
  }

  function luminance(r, g, b){
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }

  function saturateHex(hex, amount){
    var h = String(hex || '').replace('#','');
    if(h.length !== 6) return hex;
    var r = parseInt(h.slice(0,2), 16) / 255;
    var g = parseInt(h.slice(2,4), 16) / 255;
    var b = parseInt(h.slice(4,6), 16) / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var l = (max + min) / 2;
    var s = 0, hue = 0;
    if(max !== min){
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if(max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if(max === g) hue = ((b - r) / d + 2) / 6;
      else hue = ((r - g) / d + 4) / 6;
    }
    s = Math.max(0, Math.min(1, s + amount));
    function hue2rgb(p, q, t){
      if(t < 0) t += 1;
      if(t > 1) t -= 1;
      if(t < 1/6) return p + (q - p) * 6 * t;
      if(t < 1/2) return q;
      if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    return rgbToHex(
      hue2rgb(p, q, hue + 1/3) * 255,
      hue2rgb(p, q, hue) * 255,
      hue2rgb(p, q, hue - 1/3) * 255
    );
  }

  // Pull dominant colors from the project cover so the overlay theme matches the image.
  function sampleImagePalette(src, done){
    if(!src){ done(null); return; }
    var img = new Image();
    img.decoding = 'async';
    img.onload = function(){
      try {
        var size = 40;
        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext('2d', { willReadFrequently: true });
        if(!ctx){ done(null); return; }
        ctx.drawImage(img, 0, 0, size, size);
        var data = ctx.getImageData(0, 0, size, size).data;
        var buckets = {};
        var dark = { r:0, g:0, b:0, n:0 };
        var i, r, g, b, a, lum, key, sat, score;

        for(i = 0; i < data.length; i += 4){
          r = data[i]; g = data[i+1]; b = data[i+2]; a = data[i+3];
          if(a < 140) continue;
          lum = luminance(r, g, b);
          if(lum < 0.12 || lum > 0.92){
            if(lum < 0.35){ dark.r += r; dark.g += g; dark.b += b; dark.n++; }
            continue;
          }
          // 5-bit quantize keeps similar hues together
          key = (r >> 3) + ',' + (g >> 3) + ',' + (b >> 3);
          sat = (Math.max(r,g,b) - Math.min(r,g,b)) / 255;
          score = 1 + sat * 2.4 + (lum > 0.25 && lum < 0.75 ? 0.6 : 0);
          if(!buckets[key]) buckets[key] = { r:0, g:0, b:0, n:0, score:0 };
          buckets[key].r += r;
          buckets[key].g += g;
          buckets[key].b += b;
          buckets[key].n += 1;
          buckets[key].score += score;
        }

        var ranked = Object.keys(buckets).map(function(k){
          var v = buckets[k];
          var rr = v.r / v.n, gg = v.g / v.n, bb = v.b / v.n;
          var sat = (Math.max(rr,gg,bb) - Math.min(rr,gg,bb)) / 255;
          var lm = luminance(rr, gg, bb);
          // Prefer colorful mid-tones for accents (not near-black / near-white UI chrome)
          var accentScore = v.score * (0.55 + sat * 2.2) * (lm > 0.18 && lm < 0.82 ? 1.35 : 0.55);
          return { r: rr, g: gg, b: bb, score: accentScore, n: v.n, sat: sat, lm: lm };
        }).sort(function(a, b){ return b.score - a.score; });

        if(!ranked.length){ done(null); return; }

        function boostAccent(c){
          // Lift dark/dull samples into a usable glow color
          var rr = c.r, gg = c.g, bb = c.b;
          var lm = luminance(rr, gg, bb);
          if(lm < 0.35){
            var lift = (0.48 - lm) * 255;
            rr = Math.min(255, rr + lift);
            gg = Math.min(255, gg + lift * 0.92);
            bb = Math.min(255, bb + lift * 0.95);
          }
          return saturateHex(rgbToHex(rr, gg, bb), 0.28);
        }

        var primary = ranked[0];
        // If top bucket is dull (cream/gray UI), promote a more saturated color
        if(primary.sat < 0.18){
          for(i = 1; i < ranked.length; i++){
            if(ranked[i].sat > primary.sat + 0.08){ primary = ranked[i]; break; }
          }
        }
        var secondary = ranked[1] || ranked[0];
        for(i = 0; i < ranked.length; i++){
          if(ranked[i] === primary) continue;
          var dr = ranked[i].r - primary.r;
          var dg = ranked[i].g - primary.g;
          var db = ranked[i].b - primary.b;
          if((dr*dr + dg*dg + db*db) > 70*70 && ranked[i].sat > 0.12){
            secondary = ranked[i];
            break;
          }
        }

        var bgR = dark.n ? dark.r / dark.n : primary.r * 0.18;
        var bgG = dark.n ? dark.g / dark.n : primary.g * 0.18;
        var bgB = dark.n ? dark.b / dark.n : primary.b * 0.18;
        // Tint the dark base with a hint of the primary accent
        bgR = bgR * 0.72 + primary.r * 0.12;
        bgG = bgG * 0.72 + primary.g * 0.12;
        bgB = bgB * 0.72 + primary.b * 0.12;
        if(luminance(bgR, bgG, bgB) > 0.38){
          bgR *= 0.32; bgG *= 0.32; bgB *= 0.32;
        }

        var accent = boostAccent(primary);
        var accent2 = boostAccent(secondary);
        var bg = rgbToHex(bgR, bgG, bgB);
        var panelR = Math.min(255, bgR + (primary.r - bgR) * 0.32);
        var panelG = Math.min(255, bgG + (primary.g - bgG) * 0.32);
        var panelB = Math.min(255, bgB + (primary.b - bgB) * 0.32);
        var panel = rgbToHex(panelR, panelG, panelB);

        done({
          bg: bg,
          panel: panel,
          accent: accent,
          accent2: accent2,
          text: '#f2f4f8',
          muted: '#a8b0bc',
          border: 'rgba(255,255,255,0.14)'
        });
      } catch(err){
        done(null);
      }
    };
    img.onerror = function(){ done(null); };
    img.src = src;
  }

  function applyProjectTheme(th){
    var accent2 = th.accent2 || th.accent;
    detailEl.style.setProperty('--pd-bg', th.bg);
    detailEl.style.setProperty('--pd-panel', th.panel);
    detailEl.style.setProperty('--pd-text', th.text);
    detailEl.style.setProperty('--pd-muted', th.muted);
    detailEl.style.setProperty('--pd-border', th.border);
    detailEl.style.setProperty('--pd-accent', th.accent);
    // Opaque themed plate (hides page content) + glowing accents for the animation layer
    detailEl.style.setProperty('--pd-bg-wash', th.bg);
    detailEl.style.setProperty('--pd-accent-glow', hexToRgba(th.accent, 0.78));
    detailEl.style.setProperty('--pd-accent-soft', hexToRgba(th.accent, 0.38));
    detailEl.style.setProperty('--pd-accent2-glow', hexToRgba(accent2, 0.68));
    detailEl.style.setProperty('--pd-accent2-soft', hexToRgba(accent2, 0.32));
    detailEl.style.setProperty('--pd-base-a', th.bg);
    detailEl.style.setProperty('--pd-base-b', th.panel);
    detailEl.style.setProperty('--pd-base-c', th.bg);
    detailEl.style.setProperty('--pd-sweep', hexToRgba(th.accent, 0.14));
    detailEl.dataset.themeReady = '1';
  }

  function mergeTheme(base, sampled){
    if(!sampled) return base;
    return {
      bg: sampled.bg || base.bg,
      panel: sampled.panel || base.panel,
      text: sampled.text || base.text,
      muted: sampled.muted || base.muted,
      border: sampled.border || base.border,
      accent: sampled.accent || base.accent,
      accent2: sampled.accent2 || sampled.accent || base.accent
    };
  }

  function buildTrack(data){
    track.innerHTML = ''; panels = [];
    var intro = document.createElement('div');
    intro.className = 'intro-panel';
    var linksHtml = '';
    if(data.links && data.links.length){
      linksHtml =
        '<div class="intro-links">' +
          data.links.map(function(link){
            return '<a class="intro-link" href="' + link.href + '" target="_blank" rel="noopener noreferrer">' + link.label + ' ↗</a>';
          }).join('') +
        '</div>';
    }
    intro.innerHTML =
      '<div class="intro-text">' +
        '<div class="intro-num">PROJECT — ' + data.num + '</div>' +
        '<h2 class="intro-title">' + data.title + '</h2>' +
        '<p class="intro-desc">' + data.desc + '</p>' +
        '<ul class="intro-highlights">' + data.highlights.map(function(h){return '<li>'+h+'</li>';}).join('') + '</ul>' +
        '<div class="intro-tech">' + data.tech.map(function(t){return '<span>'+t+'</span>';}).join('') + '</div>' +
        linksHtml +
        '<button type="button" class="intro-back">&larr; Back to Projects</button>' +
      '</div>' +
      '<div class="intro-image-frame"><img src="' + data.images[0] + '" alt="' + data.title.replace(/"/g, '&quot;') + ' preview"></div>';
    track.appendChild(intro); panels.push(intro);
    intro.querySelector('.intro-back').addEventListener('click', closeProject);

    for(var i = 1; i < data.images.length; i++){
      var story = data.stories[i-1] || { title:'', sub:'' };
      var panel = document.createElement('div');
      panel.className = 'story-panel';
      var imgAlt = (story.title || (data.title + ' still ' + i)).replace(/"/g, '&quot;');
      panel.innerHTML =
        '<img src="' + data.images[i] + '" alt="' + imgAlt + '">' +
        '<div class="story-wash"></div>' +
        '<div class="story-index">0' + i + ' / 0' + (data.images.length-1) + '</div>' +
        '<div class="story-title">' + story.title + '</div>' +
        '<div class="story-sub">' + story.sub + '</div>';
      track.appendChild(panel); panels.push(panel);
    }
  }

  function themeFromCover(data, apply){
    var fallback = data.theme;
    applyProjectTheme(fallback);
    var cover = (data.images && data.images[0]) || null;
    sampleImagePalette(cover, function(sampled){
      // Ignore stale samples if the user already switched projects
      if(currentProjectId && projects[currentProjectId] !== data) return;
      applyProjectTheme(mergeTheme(fallback, sampled));
      if(typeof apply === 'function') apply();
    });
  }

  function openProject(id){
    var data = projects[id];
    if(!data) return;
    hideChapter();
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

    themeFromCover(data);

    detailEl.classList.add('open');
    detailEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('pd-open');
    document.body.style.overflow = 'hidden';
    if(window.lenis) lenis.stop();
    requestAnimationFrame(updateMax);
    var closeBtn = document.getElementById('pdCloseBtn');
    if(closeBtn) closeBtn.focus();
  }
  function closeProject(){
    hideChapter();
    detailEl.classList.remove('open');
    detailEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('pd-open');
    document.body.style.overflow = '';
    if(window.lenis) lenis.start();
    // Reset fade state so the next open is never stuck invisible.
    track.style.opacity = '1';
    isChaining = false;
  }

  function bindProjectTrigger(el){
    var id = el.dataset.project;
    if(!id) return;
    var labelEl = el.querySelector('.proj-title, .proj-duo-name');
    var label = labelEl ? labelEl.textContent.trim() : id;
    if(el.tagName !== 'BUTTON'){
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
    }
    el.setAttribute('aria-label', 'Open project ' + label);
    el.addEventListener('click', function(){ openProject(id); });
    el.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        openProject(id);
      }
    });
  }

  document.querySelectorAll('.proj-card[data-project], .proj-duo-item[data-project]').forEach(bindProjectTrigger);

  var pdCloseBtn = document.getElementById('pdCloseBtn');
  if(pdCloseBtn){
    pdCloseBtn.addEventListener('click', function(){ closeProject(); });
  }

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && detailEl.classList.contains('open')){
      e.preventDefault();
      closeProject();
    }
  });


  var trackX = 0, targetX = 0, maxX = 0;
  function updateMax(){ maxX = Math.max(0, track.scrollWidth - window.innerWidth); }

  function chainToProject(id, overflow, direction){
    isChaining = true;
    hideChapter();
    track.style.opacity = '0';

    setTimeout(function(){
      var data = projects[id];
      if(!data){ isChaining = false; return; }
      currentProjectId = id;
      buildTrack(data);
      themeFromCover(data);

      updateMax();
      // Land on a clear project boundary — intro for next, last panel for previous.
      // Do not carry overflow into mid-story (that felt like a continuous scroll).
      if(direction === 1){
        targetX = 0;
        trackX = 0;
      } else {
        targetX = maxX;
        trackX = maxX;
      }
      track.style.transform = 'translateX(' + (-trackX) + 'px)';

      var kicker = document.getElementById('pdChapterKicker');
      var numEl = document.getElementById('pdChapterNum');
      var titleEl = document.getElementById('pdChapterTitle');
      if(kicker) kicker.textContent = direction === 1 ? 'Next project' : 'Previous project';
      if(numEl) numEl.textContent = data.num || '';
      if(titleEl) titleEl.textContent = data.title || '';

      if(chapterEl){
        chapterEl.classList.add('is-on');
        chapterEl.setAttribute('aria-hidden', 'false');
      }

      var hold = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 380 : 1150;
      chapterTimer = setTimeout(function(){
        hideChapter();
        track.style.opacity = '1';
        setTimeout(function(){ isChaining = false; }, 400);
      }, hold);
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

  function nudgeTrack(delta){
    if(!detailEl.classList.contains('open') || isChaining) return;
    updateMax();
    var next = targetX + delta;

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
  }

  detailEl.addEventListener('wheel', function(e){
    if(!detailEl.classList.contains('open') || isChaining) return;
    e.preventDefault();
    nudgeTrack(e.deltaY);
  }, { passive: false });

  // Touch / pointer drag — required for phones & tablets
  var drag = { active: false, startX: 0, startTarget: 0, moved: false, pointerId: null };
  detailEl.addEventListener('pointerdown', function(e){
    if(!detailEl.classList.contains('open') || isChaining) return;
    if(e.target.closest('button, a, input, textarea, label')) return;
    drag.active = true;
    drag.moved = false;
    drag.startX = e.clientX;
    drag.startTarget = targetX;
    drag.pointerId = e.pointerId;
    try { detailEl.setPointerCapture(e.pointerId); } catch(err){}
  });
  detailEl.addEventListener('pointermove', function(e){
    if(!drag.active || drag.pointerId !== e.pointerId) return;
    var dx = drag.startX - e.clientX;
    if(Math.abs(dx) > 6) drag.moved = true;
    if(!drag.moved) return;
    e.preventDefault();
    updateMax();
    targetX = Math.max(0, Math.min(maxX, drag.startTarget + dx));
  }, { passive: false });
  function endDrag(e){
    if(!drag.active || (e && drag.pointerId !== e.pointerId)) return;
    var dx = drag.startX - (e ? e.clientX : drag.startX);
    drag.active = false;
    if(!drag.moved) return;
    // Fling past edges chains to next/prev project
    if(dx > 80 && targetX >= maxX - 2){
      var idx = projectOrder.indexOf(currentProjectId);
      if(idx < projectOrder.length - 1) chainToProject(projectOrder[idx + 1], 40, 1);
      else if(dx > 140) exitToPortfolio();
    } else if(dx < -80 && targetX <= 2){
      var idx2 = projectOrder.indexOf(currentProjectId);
      if(idx2 > 0) chainToProject(projectOrder[idx2 - 1], 40, -1);
    }
  }
  detailEl.addEventListener('pointerup', endDrag);
  detailEl.addEventListener('pointercancel', endDrag);

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
// Bubble Menu — full-screen floating pills (React Bits–style)
(function(){
  var menuBtn = document.getElementById('menuToggle');
  var overlay = document.getElementById('bubbleMenu');
  if(!menuBtn || !overlay) return;

  var bubbles = Array.prototype.slice.call(overlay.querySelectorAll('.pill-link'));
  var labels = bubbles.map(function(b){ return b.querySelector('.pill-label'); });
  var isOpen = false;
  var showOverlay = false;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var animEase = 'back.out(1.5)';
  var animDuration = 0.5;
  var staggerDelay = 0.1;

  function desktopRot(bubble){
    if(window.innerWidth < 900) return 0;
    var n = parseFloat(bubble.getAttribute('data-rot') || '0');
    return isNaN(n) ? 0 : n;
  }

  function setOpenChrome(open){
    menuBtn.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('bubble-open', open);
    overlay.classList.toggle('is-open', open);
    overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    // Soft-lock scroll so the menu stays centered on the current page view
    if(window.lenis){
      if(open) lenis.stop();
      else if(!document.body.classList.contains('pd-open')) lenis.start();
    }
  }

  function resetPillVisuals(){
    if(window.gsap){
      gsap.killTweensOf(bubbles.concat(labels.filter(Boolean)));
      gsap.set(bubbles, { scale: 0 });
      gsap.set(labels, { y: 12, autoAlpha: 0 });
    } else {
      bubbles.forEach(function(b, i){
        b.style.transform = 'scale(0)';
        if(labels[i]){ labels[i].style.opacity = '0'; labels[i].style.transform = 'translateY(12px)'; }
      });
    }
  }

  function scrollToSection(target){
    if(!target) return;
    if(window.lenis){
      // Lenis must be running — scrollTo is a no-op while stopped
      if(typeof lenis.start === 'function') lenis.start();
      requestAnimationFrame(function(){
        lenis.scrollTo(target, { offset: -70 });
      });
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /** Close menu immediately, then navigate — used by pill clicks */
  function closeMenuThenScroll(target){
    isOpen = false;
    showOverlay = false;
    resetPillVisuals();
    setOpenChrome(false);
    scrollToSection(target);
  }

  var menuBg = overlay.querySelector('.bubble-menu-bg');
  if(menuBg){
    menuBg.addEventListener('click', function(){ closeMenu(); });
  }

  function playOpen(){
    showOverlay = true;
    setOpenChrome(true);
    if(!window.gsap || reduceMotion){
      bubbles.forEach(function(b, i){
        var rot = desktopRot(b);
        b.style.transform = 'rotate(' + rot + 'deg) scale(1)';
        if(labels[i]){ labels[i].style.opacity = '1'; labels[i].style.transform = 'translateY(0)'; }
      });
      return;
    }
    gsap.killTweensOf(bubbles.concat(labels.filter(Boolean)));
    gsap.set(bubbles, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(labels, { y: 12, autoAlpha: 0 });
    bubbles.forEach(function(bubble, i){
      var rot = desktopRot(bubble);
      gsap.set(bubble, { rotation: rot });
      var delay = i * staggerDelay + gsap.utils.random(-0.04, 0.04);
      var tl = gsap.timeline({ delay: delay });
      tl.to(bubble, { scale: 1, duration: animDuration, ease: animEase });
      if(labels[i]){
        tl.to(labels[i], {
          y: 0,
          autoAlpha: 1,
          duration: animDuration,
          ease: 'power3.out'
        }, '-=' + (animDuration * 0.9));
      }
    });
  }

  function playClose(){
    if(!isOpen && !showOverlay) return;
    isOpen = false;
    function finish(){
      setOpenChrome(false);
      showOverlay = false;
    }
    if(!window.gsap || reduceMotion || !showOverlay){
      bubbles.forEach(function(b, i){
        b.style.transform = 'scale(0)';
        if(labels[i]){ labels[i].style.opacity = '0'; labels[i].style.transform = 'translateY(12px)'; }
      });
      finish();
      return;
    }
    gsap.killTweensOf(bubbles.concat(labels.filter(Boolean)));
    gsap.to(labels, { y: 12, autoAlpha: 0, duration: 0.18, ease: 'power3.in' });
    gsap.to(bubbles, {
      scale: 0,
      duration: 0.2,
      ease: 'power3.in',
      onComplete: finish
    });
  }

  function openMenu(){
    isOpen = true;
    playOpen();
  }
  function closeMenu(){
    if(!isOpen && !showOverlay) return;
    playClose();
  }

  menuBtn.addEventListener('click', function(){
    if(isOpen) closeMenu();
    else openMenu();
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeMenu();
  });

  bubbles.forEach(function(a){
    // Capture phase so we own navigation before the global Lenis anchor handler
    // (which would call scrollTo while Lenis is still stopped).
    a.addEventListener('click', function(e){
      e.preventDefault();
      e.stopImmediatePropagation();
      var target = document.querySelector(a.getAttribute('href'));
      closeMenuThenScroll(target);
    }, true);
    a.addEventListener('mouseenter', function(){
      if(!isOpen || !window.gsap || reduceMotion) return;
      gsap.to(a, { scale: 1.06, duration: 0.28, ease: 'power2.out', overwrite: 'auto' });
    });
    a.addEventListener('mouseleave', function(){
      if(!isOpen || !window.gsap || reduceMotion) return;
      gsap.to(a, { scale: 1, duration: 0.28, ease: 'power2.out', overwrite: 'auto' });
    });
  });

  window.addEventListener('resize', function(){
    if(!isOpen) return;
    bubbles.forEach(function(bubble){
      var rot = desktopRot(bubble);
      if(window.gsap) gsap.set(bubble, { rotation: rot });
      else bubble.style.transform = 'rotate(' + rot + 'deg) scale(1)';
    });
  });

  // Scroll-spy: tint the pill for the section in view
  var sections = [];
  bubbles.forEach(function(a){
    var sec = document.querySelector(a.getAttribute('href'));
    if(sec) sections.push({ link: a, el: sec });
  });
  if('IntersectionObserver' in window && sections.length){
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        var match = sections.find(function(s){ return s.el === entry.target; });
        if(!match || !entry.isIntersecting) return;
        sections.forEach(function(s){ s.link.classList.remove('is-active'); });
        match.link.classList.add('is-active');
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(function(s){ spy.observe(s.el); });
  }
})();

// About — legendary systems-builder reveal
(function(){
  var section = document.getElementById('about');
  if(!section) return;

  var headingLines = section.querySelectorAll('.about-heading-line');
  var top = section.querySelector('.about-top');
  var lede = section.querySelector('.about-lede');
  var desc = section.querySelector('.about-desc');
  var proof = section.querySelector('.about-proof');
  var stats = section.querySelectorAll('.about-stat-num');
  var cta = section.querySelector('.about-cta');
  var ledger = section.querySelector('.about-ledger');
  var links = section.querySelectorAll('.about-links a');
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

  function fillStats(){
    stats.forEach(function(el){
      var n = parseInt(el.getAttribute('data-count'), 10) || 0;
      el.textContent = el.getAttribute('data-count') === '7' ? '7+' : String(n);
    });
  }

  if(reduceMotion || !window.gsap || !window.ScrollTrigger){
    fillStats();
    return;
  }

  if(video){
    gsap.to(video, {
      scale: 1.1,
      yPercent: 5,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.9
      }
    });
  }

  if(top){
    gsap.fromTo(top,
      { opacity: 0, y: 16 },
      {
        opacity: 1, y: 0, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: top, start: 'top 90%', toggleActions: 'play none none reverse' }
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
        yPercent: 0, duration: 1.15, ease: 'power4.out',
        scrollTrigger: { trigger: line, start: 'top 88%', toggleActions: 'play none none reverse' }
      }
    );
  });

  if(lede){
    gsap.fromTo(lede,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: lede, start: 'top 90%', toggleActions: 'play none none reverse' }
      }
    );
  }
  if(desc){
    gsap.fromTo(desc,
      { opacity: 0, y: 18 },
      {
        opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', delay: 0.05,
        scrollTrigger: { trigger: desc, start: 'top 90%', toggleActions: 'play none none reverse' }
      }
    );
  }

  if(proof){
    gsap.fromTo(proof,
      { opacity: 0, y: 22 },
      {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: proof, start: 'top 92%', toggleActions: 'play none none reverse' }
      }
    );
  }

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

  if(cta){
    gsap.fromTo(cta,
      { opacity: 0, y: 14 },
      {
        opacity: 1, y: 0, duration: 0.75, ease: 'power3.out',
        scrollTrigger: { trigger: cta, start: 'top 94%', toggleActions: 'play none none reverse' }
      }
    );
  }
  if(ledger){
    gsap.fromTo(ledger,
      { opacity: 0, x: 24 },
      {
        opacity: 1, x: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: ledger, start: 'top 88%', toggleActions: 'play none none reverse' }
      }
    );
  }
  if(links.length){
    gsap.fromTo(links,
      { opacity: 0, y: 10 },
      {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power3.out',
        scrollTrigger: { trigger: links[0], start: 'top 95%', toggleActions: 'play none none reverse' }
      }
    );
  }
})();

// Skills — legendary systems stack reveal
(function(){
  var section = document.getElementById('skills');
  if(!section) return;

  var top = section.querySelector('.skills-top');
  var headingLines = section.querySelectorAll('.skills-heading-line');
  var lede = section.querySelector('.skills-lede');
  var entries = section.querySelectorAll('.skills-entry');
  var ledger = section.querySelector('.skills-ledger');
  var cta = section.querySelector('.skills-cta');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if(reduceMotion || !window.gsap || !window.ScrollTrigger){
    return;
  }

  if(top){
    gsap.fromTo(top,
      { opacity: 0, y: 16 },
      {
        opacity: 1, y: 0, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: top, start: 'top 90%', toggleActions: 'play none none reverse' }
      }
    );
  }

  headingLines.forEach(function(line){
    var text = line.textContent;
    line.innerHTML = '<span class="skills-heading-inner">' + text + '</span>';
    var inner = line.querySelector('.skills-heading-inner');
    gsap.fromTo(inner,
      { yPercent: 110 },
      {
        yPercent: 0, duration: 1.15, ease: 'power4.out',
        scrollTrigger: { trigger: line, start: 'top 88%', toggleActions: 'play none none reverse' }
      }
    );
  });

  if(lede){
    gsap.fromTo(lede,
      { opacity: 0, y: 18 },
      {
        opacity: 1, y: 0, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: lede, start: 'top 90%', toggleActions: 'play none none reverse' }
      }
    );
  }

  entries.forEach(function(entry, i){
    gsap.fromTo(entry,
      { opacity: 0, y: 22 },
      {
        opacity: 1, y: 0, duration: 0.75, ease: 'power3.out',
        delay: Math.min(i * 0.04, 0.2),
        scrollTrigger: {
          trigger: entry,
          start: 'top 92%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  if(ledger){
    gsap.fromTo(ledger,
      { opacity: 0, x: 22 },
      {
        opacity: 1, x: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: ledger, start: 'top 88%', toggleActions: 'play none none reverse' }
      }
    );
  }
  if(cta){
    gsap.fromTo(cta,
      { opacity: 0, y: 12 },
      {
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: cta, start: 'top 94%', toggleActions: 'play none none reverse' }
      }
    );
  }
})();

// Skills — warm light worm hover (cursor-linked bloom)
(function(){
  var section = document.getElementById('skills');
  if(!section) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if(window.matchMedia('(pointer: coarse)').matches) return;

  var entries = section.querySelectorAll('.skills-entry');
  entries.forEach(function(entry){
    if(!entry.querySelector('.skills-entry-glow')){
      var glow = document.createElement('span');
      glow.className = 'skills-entry-glow';
      glow.setAttribute('aria-hidden', 'true');
      entry.insertBefore(glow, entry.firstChild);
    }
    if(!entry.querySelector('.skills-entry-worm')){
      var worm = document.createElement('span');
      worm.className = 'skills-entry-worm';
      worm.setAttribute('aria-hidden', 'true');
      entry.insertBefore(worm, entry.firstChild);
    }

    var wormEl = entry.querySelector('.skills-entry-worm');

    function replayWorm(){
      if(!wormEl) return;
      entry.classList.add('is-warm-replay');
      void wormEl.offsetWidth;
      entry.classList.remove('is-warm-replay');
    }

    entry.addEventListener('mouseenter', function(){
      entry.classList.add('is-warm');
      replayWorm();
    });
    entry.addEventListener('mousemove', function(e){
      var rect = entry.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
      var y = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 100;
      entry.style.setProperty('--skills-warm-x', x.toFixed(2) + '%');
      entry.style.setProperty('--skills-warm-y', y.toFixed(2) + '%');
    });
    entry.addEventListener('mouseleave', function(){
      entry.classList.remove('is-warm');
      entry.style.setProperty('--skills-warm-x', '50%');
      entry.style.setProperty('--skills-warm-y', '50%');
    });
  });
})();

// Achievements + Experience — shared minimal cinematic runway.
// Recognition — cinematic honors dossier over shared video runway.
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
  var top = content.querySelector('.ach-top');
  var headingLines = content.querySelectorAll('.ach-heading-line');
  var lede = content.querySelector('.ach-lede');
  var entries = content.querySelectorAll('.ach-entry');
  var ledger = content.querySelector('.ach-ledger');
  var cta = content.querySelector('.ach-cta');

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
      var vio = new IntersectionObserver(function(entriesObs){
        entriesObs.forEach(function(entry){
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
      scale: 1.1,
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

  if(top){
    gsap.fromTo(top,
      { opacity: 0, y: 16 },
      {
        opacity: 1, y: 0, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: top, start: 'top 90%', toggleActions: 'play none none reverse' }
      }
    );
  }
  headingLines.forEach(function(line){
    var text = line.textContent;
    line.innerHTML = '<span class="ach-heading-inner">' + text + '</span>';
    var inner = line.querySelector('.ach-heading-inner');
    gsap.fromTo(inner,
      { yPercent: 110 },
      {
        yPercent: 0, duration: 1.15, ease: 'power4.out',
        scrollTrigger: { trigger: line, start: 'top 88%', toggleActions: 'play none none reverse' }
      }
    );
  });
  if(lede){
    gsap.fromTo(lede,
      { opacity: 0, y: 18 },
      {
        opacity: 1, y: 0, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: lede, start: 'top 90%', toggleActions: 'play none none reverse' }
      }
    );
  }

  entries.forEach(function(entry, i){
    gsap.fromTo(entry,
      { opacity: 0, y: 22 },
      {
        opacity: 1, y: 0, duration: 0.75, ease: 'power3.out',
        delay: Math.min(i * 0.04, 0.2),
        scrollTrigger: {
          trigger: entry,
          start: 'top 92%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  if(ledger){
    gsap.fromTo(ledger,
      { opacity: 0, x: 22 },
      {
        opacity: 1, x: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: ledger, start: 'top 88%', toggleActions: 'play none none reverse' }
      }
    );
  }
  if(cta){
    gsap.fromTo(cta,
      { opacity: 0, y: 12 },
      {
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: cta, start: 'top 94%', toggleActions: 'play none none reverse' }
      }
    );
  }
})();

// Cinematic high-professional transitions between every major section while scrolling.
// For each section (after the hero's own intro): a glowing seam that draws across the
// boundary, a veil that lifts as the section arrives / settles back on exit, and a
// clip-path title reveal on the section header. Content itself keeps using the
// enhanced .fade-in system above — this layer handles the between-section moment.
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if(!window.gsap || !window.ScrollTrigger) return;

  var sectionIds = ['about', 'skills', 'projects', 'achievements', 'experience', 'contact', 'credits'];

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
        child.classList.contains('end-credits-stage') ||
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
    var tag = section.querySelector('.section-tag, .about-index, .collab-tag');
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

  // Production end-card reveal
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

// Thank You — direct inbox delivery via FormSubmit (no mail app)
(function(){
  var form = document.getElementById('tyMailForm');
  if(!form) return;

  var submitBtn = document.getElementById('tyMailSubmit');
  var statusEl = document.getElementById('tyMailStatus');
  var labelEl = submitBtn ? submitBtn.querySelector('.ty-mail-send-label') : null;
  var nextInput = document.getElementById('tyMailNext');
  var subjectInput = document.getElementById('tyMailSubject');
  var replyInput = document.getElementById('tyMailReplyTo');
  var sending = false;

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

  function returnUrl(){
    var url = new URL(window.location.href);
    url.searchParams.set('mail', 'sent');
    url.hash = 'contact';
    return url.toString();
  }

  if(nextInput) nextInput.value = returnUrl();

  // After FormSubmit delivers, it redirects back here with ?mail=sent
  (function showReturnStatus(){
    try {
      var params = new URLSearchParams(window.location.search);
      if(params.get('mail') === 'sent'){
        setStatus('Sent. I will get back to you soon.', 'is-ok');
        params.delete('mail');
        var clean = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + '#contact';
        if(window.history && history.replaceState) history.replaceState(null, '', clean);
        if(window.lenis){
          var target = document.getElementById('contact');
          if(target) lenis.scrollTo(target, { offset: -70 });
        }
      }
    } catch(err){}
  })();

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

    if(nextInput) nextInput.value = returnUrl();
    if(subjectInput) subjectInput.value = 'Portfolio message from ' + fields.name;
    if(replyInput) replyInput.value = fields.email;

    setBusy(true);
    setStatus('Sending your message…');

    // Native FormSubmit POST — delivers to inbox, then returns to this page.
    // No mailto / mail app.
    form.removeAttribute('target');
    HTMLFormElement.prototype.submit.call(form);
  });
})();

// Hero opening — orbit plate + soft embers + atmospheric sparks + Ken Burns
(function(){
  var hero = document.getElementById('hero');
  var plate = document.getElementById('heroPlate');
  var ash = document.getElementById('heroAsh');
  var magic = document.getElementById('heroMagic');
  if(!hero || !plate) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ashRaf = 0;
  var magicRaf = 0;

  function showPlate(){
    plate.classList.add('is-ready');
  }

  if(plate.complete) showPlate();
  else plate.addEventListener('load', showPlate);

  // Soft ember dissolve under the title
  function bootAsh(){
    if(!ash || reduceMotion) return;
    var ctx = ash.getContext('2d');
    if(!ctx) return;
    var particles = [];
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize(){
      var rect = ash.getBoundingClientRect();
      var w = Math.max(320, Math.floor(rect.width));
      var h = Math.max(100, Math.floor(rect.height));
      ash.width = Math.floor(w * dpr);
      ash.height = Math.floor(h * dpr);
      ash.style.width = w + 'px';
      ash.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = [];
      var count = Math.min(200, Math.floor(w * 0.26));
      for(var i = 0; i < count; i++){
        particles.push({
          x: w * (0.08 + Math.random() * 0.84),
          y: h * (0.05 + Math.random() * 0.35),
          r: 0.4 + Math.random() * 1.7,
          a: 0.2 + Math.random() * 0.55,
          vx: (Math.random() - 0.5) * 0.3,
          vy: 0.12 + Math.random() * 0.5,
          life: Math.random(),
          warm: Math.random() > 0.35
        });
      }
      return { w: w, h: h };
    }

    var size = resize();
    window.addEventListener('resize', function(){ size = resize(); });

    function draw(){
      var w = size.w;
      var h = size.h;
      ctx.clearRect(0, 0, w, h);
      for(var i = 0; i < particles.length; i++){
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.004;
        if(p.y > h * 0.95 || p.life > 1){
          p.x = w * (0.1 + Math.random() * 0.8);
          p.y = h * (0.02 + Math.random() * 0.2);
          p.life = 0;
        }
        var fade = Math.max(0, 1 - p.life);
        ctx.beginPath();
        if(p.warm){
          ctx.fillStyle = 'rgba(240,184,110,' + (p.a * fade) + ')';
        } else {
          ctx.fillStyle = 'rgba(245,230,190,' + (p.a * fade * 0.85) + ')';
        }
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ashRaf = requestAnimationFrame(draw);
    }
    ashRaf = requestAnimationFrame(draw);
  }

  // Floating atmospheric sparks across the orbit field
  function bootMagic(){
    if(!magic || reduceMotion) return;
    var ctx = magic.getContext('2d');
    if(!ctx) return;
    var sparks = [];
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0;
    var h = 0;

    function resize(){
      w = hero.clientWidth;
      h = hero.clientHeight;
      magic.width = Math.floor(w * dpr);
      magic.height = Math.floor(h * dpr);
      magic.style.width = w + 'px';
      magic.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sparks = [];
      var count = Math.min(90, Math.floor((w * h) / 18000));
      for(var i = 0; i < count; i++){
        sparks.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.72,
          r: 0.6 + Math.random() * 1.8,
          a: 0.15 + Math.random() * 0.55,
          vx: (Math.random() - 0.5) * 0.22,
          vy: -0.08 - Math.random() * 0.28,
          tw: Math.random() * Math.PI * 2,
          sp: 0.6 + Math.random() * 1.4,
          gold: Math.random() > 0.4
        });
      }
    }

    resize();
    window.addEventListener('resize', resize);

    function draw(now){
      var t = now * 0.001;
      ctx.clearRect(0, 0, w, h);
      for(var i = 0; i < sparks.length; i++){
        var s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        if(s.y < -8 || s.x < -10 || s.x > w + 10){
          s.x = Math.random() * w;
          s.y = h * (0.35 + Math.random() * 0.4);
        }
        var twinkle = 0.45 + 0.55 * Math.sin(t * s.sp + s.tw);
        var glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
        if(s.gold){
          glow.addColorStop(0, 'rgba(255,220,140,' + (0.55 * twinkle * s.a) + ')');
          glow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = 'rgba(240,184,110,' + (s.a * twinkle) + ')';
        } else {
          glow.addColorStop(0, 'rgba(180,230,200,' + (0.4 * twinkle * s.a) + ')');
          glow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = 'rgba(170,220,190,' + (s.a * twinkle * 0.8) + ')';
        }
        ctx.beginPath();
        ctx.fillStyle = glow;
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = s.gold
          ? 'rgba(255,230,170,' + (s.a * twinkle) + ')'
          : 'rgba(200,235,215,' + (s.a * twinkle * 0.85) + ')';
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      magicRaf = requestAnimationFrame(draw);
    }
    magicRaf = requestAnimationFrame(draw);
  }

  bootAsh();
  bootMagic();

  if(reduceMotion || !window.gsap || !window.ScrollTrigger) return;

  gsap.to(plate, {
    scale: 1.08,
    yPercent: 2,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.9
    }
  });

  gsap.to('.hero-mist', {
    opacity: 0.7,
    yPercent: -4,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });
})();

// Closing roll — auto-scrolling engineer finale after Thank You
(function(){
  var section = document.getElementById('credits');
  if(!section) return;

  var pin = section.querySelector('.end-credits-pin');
  var roll = document.getElementById('endCreditsRoll');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tween = null;
  var playing = false;
  var finished = false;

  if(!pin || !roll) return;

  function startY(){
    return Math.round(pin.clientHeight * 0.72);
  }

  function endY(){
    var finale = roll.querySelector('.end-credits-block--finale');
    var pinH = pin.clientHeight;
    // Leave the finale roughly centered when the roll finishes
    var finaleOffset = finale ? finale.offsetTop : roll.scrollHeight;
    var target = -(finaleOffset - pinH * 0.28);
    var minTravel = -(roll.scrollHeight - pinH * 0.55);
    return Math.min(target, minTravel);
  }

  function stopCredits(){
    if(tween){
      tween.kill();
      tween = null;
    }
    playing = false;
    section.classList.remove('is-rolling');
  }

  function playCredits(fromStart){
    if(reduceMotion) return;
    if(!window.gsap) return;

    if(playing && !fromStart) return;

    stopCredits();
    finished = false;
    section.classList.remove('is-finished');
    section.classList.add('is-rolling');
    roll.classList.add('is-autoplaying');
    playing = true;

    var from = startY();
    var to = endY();
    // Steady scroll pace through the closing roll
    var travel = Math.abs(to - from);
    var duration = Math.max(36, Math.min(58, travel / 30));

    gsap.set(roll, { y: from });
    tween = gsap.to(roll, {
      y: to,
      duration: duration,
      ease: 'none',
      overwrite: true,
      onComplete: function(){
        playing = false;
        finished = true;
        tween = null;
        section.classList.remove('is-rolling');
        section.classList.add('is-finished');
      }
    });
  }

  function pauseCredits(){
    if(tween && playing){
      tween.pause();
      section.classList.remove('is-rolling');
    }
  }

  function resumeCredits(){
    if(finished){
      playCredits(true);
      return;
    }
    if(tween){
      tween.resume();
      section.classList.add('is-rolling');
      playing = true;
      return;
    }
    playCredits(true);
  }

  if(reduceMotion){
    gsap && gsap.set(roll, { clearProps: 'transform' });
    roll.style.transform = 'none';
    section.classList.add('is-finished');
    return;
  }

  // Fallback without GSAP: CSS-free JS interval
  if(!window.gsap){
    var y = startY();
    var to = endY();
    var step = (y - to) / 1800;
    roll.style.transform = 'translate3d(0,' + y + 'px,0)';
    var raf = 0;
    function tick(){
      y -= step;
      if(y <= to){
        y = to;
        roll.style.transform = 'translate3d(0,' + y + 'px,0)';
        section.classList.add('is-finished');
        return;
      }
      roll.style.transform = 'translate3d(0,' + y + 'px,0)';
      raf = requestAnimationFrame(tick);
    }
    if('IntersectionObserver' in window){
      var ioFallback = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            section.classList.add('is-rolling');
            if(!raf) raf = requestAnimationFrame(tick);
          }
        });
      }, { threshold: 0.45 });
      ioFallback.observe(section);
    } else {
      section.classList.add('is-rolling');
      raf = requestAnimationFrame(tick);
    }
    return;
  }

  gsap.set(roll, { y: startY() });

  if(window.ScrollTrigger){
    ScrollTrigger.create({
      trigger: section,
      start: 'top 75%',
      end: 'bottom top',
      onEnter: function(){ resumeCredits(); },
      onEnterBack: function(){ resumeCredits(); },
      onLeave: function(){ pauseCredits(); },
      onLeaveBack: function(){ pauseCredits(); }
    });
  } else if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting) resumeCredits();
        else pauseCredits();
      });
    }, { threshold: 0.4 });
    io.observe(section);
  } else {
    playCredits(true);
  }

  window.addEventListener('resize', function(){
    if(!playing && !finished){
      gsap.set(roll, { y: startY() });
      return;
    }
    if(finished){
      gsap.set(roll, { y: endY() });
      return;
    }
    // Restart at current cinematic pace after resize so end position stays correct
    if(playing) playCredits(true);
  });
})();
