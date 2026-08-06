# Allen Christian — Engineer Portfolio

**ASC Portfolio** is a cinematic, engineer-first **personal site** for **Allen Stivanson Christian** — B.Tech. **Artificial Intelligence and Data Science** at **A D Patel Institute of Technology (ADIT)**, **CVM University**.

It presents shipped products, a Government of India design patent, ML/DL learning series, recognition, and experience in one scrollable page — built to read as an **engineer who ships**, not a generic template.

> Live site: **[https://portfolio-demo-tan-six.vercel.app](https://portfolio-demo-tan-six.vercel.app)**  
> Repository: **[https://github.com/allen745/portfolio-demo-](https://github.com/allen745/portfolio-demo-)**

---

## Why this portfolio exists

Most student portfolios either look like dashboards or oversell tutorial projects. This site was built so a visitor (recruiter, founder, collaborator) can open **one page** and immediately see:

1. **Who Allen is** — AI & Data Science engineer, brand-first hero
2. **What he ships** — live products (DevMind, Agent, Vertex) with demo links
3. **What’s real** — design patent, curated recognition, honest ML/DL learning series
4. **How he builds** — FastAPI, agents, classical ML, deep learning, delivery

It is **not** a blog theme. It is a **case-study surface**: click a project, scrub the story, open the live demo.

---

## Who this site is for

- **Primary:** recruiters / hiring managers looking for an AI–ML / backend / agent builder
- **Also useful for:** collaborators, hackathon teams, and anyone evaluating shipped work vs. filler
- **Tone:** engineer-level, cinematic polish — cinema as craft, not franchise cosplay

---

## What’s on the page (section deep-dive)

### 1. Hero — engineer landing

Pro engineering aesthetic (blueprint grid, technical frame, HUD, node field):

- Role kicker: **AI & Data Science Engineer**
- Brand: **Allen Christian**
- Line: ships FastAPI backends, LLM agents, production tools
- Stack cue: Python · FastAPI · ML · Agents
- CTAs: **View the work** · **Contact**

### 2. About

- “Built to ship, not just to show.”
- Background (ADIT · CVM University), patent + products proof points
- Focus rail: APIs · Agents · Products

### 3. Skills

Stack ledger + logo loop:

| Track | What’s listed |
|-------|----------------|
| **Python & Data** | Python · NumPy · Pandas · Scikit-learn |
| **Backend APIs** | FastAPI · REST · Pydantic · JWT · PostgreSQL |
| **Classical ML** | Classification · Regression · Pipelines · EDA |
| **Deep Learning** | TensorFlow · Keras · CNNs · Computer Vision |
| **LLMs & Agents** | Groq · LLaMA · Foundry IQ · Reasoning Agents |
| **Delivery** | Git · GitHub · Vercel · End-to-end shipping |

### 4. Projects — case studies

Click a card → horizontal project reel with tech tags and **Live demo / GitHub** buttons where available.

| Project | Tag | Live |
|---------|-----|------|
| **DevMind AI** | Live product | [devmind-ai-topaz.vercel.app](https://devmind-ai-topaz.vercel.app/) |
| **DevMind AI Agent** | Reasoning agent · Agents League | [devmind-agent.onrender.com](https://devmind-agent.onrender.com/) |
| **CA SaaS** | B2B SaaS · in progress | GitHub |
| **Vertex** | Career intelligence · in progress | [vertex-api-allen07.azurewebsites.net](https://vertex-api-allen07.azurewebsites.net/) |
| **Piezoelectric Striker** | Design patent · GoI | GitHub |
| **TrackBot 1** | SSIP-funded team project | — |
| **AutoSeed Bot** | IoT · precision agriculture | — |
| **ML & DL Portfolios** | Learning series (one dual card) | GitHub |

ML/DL are framed honestly as **practice while learning**, not production products.

### 5. Moments

Curved WebGL image reel (`circular-gallery.js`) — labs, exhibits, builds, field notes. Drag or scroll sideways to scrub; auto-spins when idle.

### 6. Recognition (curated)

High-signal only (from real certificates — not every course badge):

1. India Design Patent — Spring-Loaded Piezoelectric Generating Striker Device (No. **450815-001**)
2. Research paper on the same device
3. InAmigos Foundation — Top Intern
4. TCS Rural IT Quiz 2024 — National
5. Techfest AIKYAM — SPEC Innovation Award
6. Debate Championship — 1st place (CEMS)
7. Chatkaro 2024 — Model Presentation (2nd)
8. HackZero ’26 CTF — OWASP VIT Bhopal

### 7. Experience & Education

Pinned scroll journey: InAmigos internship → My Job Grow AI training → B.Tech AI&DS (ADIT) → school foundation.

### 8. Contact + Credits

- Contact plate + form
- Engineer closing credits (stack, selected work, recognition)

Navigation uses a floating **Bubble Menu** over the current section. Optional Interstellar ambient via the Sound control.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Markup | HTML5 (`index.html`) |
| Style | Custom CSS (`styles.css`) — cinematic + engineering tokens |
| Behavior | Vanilla JS (`script.js`) |
| Logo loop | Vanilla port of React Bits–style marquee (`logo-loop.js`) |
| Motion | [GSAP](https://gsap.com/) + ScrollTrigger |
| Smooth scroll | [Lenis](https://github.com/darkroomengineering/lenis) |
| Moments gallery | [OGL](https://github.com/oframe/ogl) circular strip (`circular-gallery.js`) |
| Fonts | Cinzel · DM Sans · Space Mono |
| Hosting | [Vercel](https://portfolio-demo-tan-six.vercel.app) (static) |
| Source | GitHub — [allen745/portfolio-demo-](https://github.com/allen745/portfolio-demo-) |

Architecture is intentionally simple — **no build step**, no package manager:

- `index.html` — sections, copy, project grid
- `styles.css` — visual system (hero engineering field, skills, projects, moments, recognition)
- `script.js` — intro, Lenis/GSAP, project case-study overlay, section motion
- `circular-gallery.js` — Moments WebGL reel
- `logo-loop.js` — Skills logo marquee
- `images/` · `videos/` · `audio/` — media plates

---

## How to use the site (visitor walkthrough)

1. Open the [live portfolio](https://portfolio-demo-tan-six.vercel.app).
2. Land on the **engineer hero** — read the line, open **View the work** or scroll.
3. Skim **Skills** (stack + logo loop).
4. Open a **Project** card — scrub the horizontal story; hit **Live demo ↗** when present.
5. Pass through **Moments**, **Recognition**, and **Experience**.
6. Use **Contact** to reach out (or the nav **Say Hello** pill).

---

## Run locally

Requirements: any static file server (recommended). Node/Python optional.

```bash
git clone https://github.com/allen745/portfolio-demo-.git
cd portfolio-demo-

# Python
python3 -m http.server 8080

# or Node
npx serve .
```

Then open `http://localhost:8080` (or the URL your server prints).

> Opening `index.html` via `file://` may limit modules / some media. Prefer a local server.

---

## Project structure

```text
portfolio-demo-/
├── index.html              # Full single-page portfolio
├── styles.css              # Visual system
├── script.js               # Interactions, projects overlay, motion
├── circular-gallery.js     # Moments curved reel (OGL)
├── logo-loop.js            # Skills logo marquee
├── audio/                  # Ambient soundtrack
├── images/
│   ├── logos/              # Stack SVGs for logo loop
│   ├── projects/           # Case-study stills
│   └── fol/                # Moments field stills
├── videos/                 # Section plates + posters
├── favicon.* / og-image.jpg
├── site.webmanifest
├── robots.txt
└── README.md
```

---

## Customize

| Goal | Where |
|------|--------|
| Copy & sections | `index.html` |
| Look / hero engineering field | `styles.css` |
| Project data, links, motion | `script.js` (`projects` object) |
| Moments images | `circular-gallery.js` + `images/fol/` |
| Skills logos | `logo-loop.js` + `images/logos/` |
| SEO / social preview | `<head>` in `index.html`, `og-image.jpg` |

---

## Deploy

Already live on Vercel:

**https://portfolio-demo-tan-six.vercel.app**

To deploy a fork:

```bash
npx vercel --prod
```

Or connect the GitHub repo to Vercel for automatic deploys on every push to `main`.

---

## Project links

- **Live portfolio:** https://portfolio-demo-tan-six.vercel.app  
- **This repository:** https://github.com/allen745/portfolio-demo-  
- **DevMind (live):** https://devmind-ai-topaz.vercel.app  
- **DevMind Agent (live):** https://devmind-agent.onrender.com  
- **Vertex (live):** https://vertex-api-allen07.azurewebsites.net  

---

## License & disclaimer

- Portfolio content, writing, and personal media belong to **Allen Stivanson Christian**.
- Ask before reusing personal photos, project assets, or branding.
- Third-party logos (skills loop) are trademarks of their respective owners; used here for technology identification only.
- No warranty; the site is a personal presentation of work.

---

## About the author

<p align="center">
  <a href="https://github.com/allen745">
    <img src="https://github.com/allen745.png" width="100" height="100" alt="Allen Stivanson Christian" style="border-radius:50%;" />
  </a>
</p>

<p align="center">
  <strong>Allen Stivanson Christian</strong><br/>
  <a href="https://github.com/allen745">@allen745</a>
</p>

Click the profile picture above to open the GitHub profile: **[https://github.com/allen745](https://github.com/allen745)**

| | |
|---|---|
| **Name** | Allen Stivanson Christian |
| **Role** | AI & Data Science Engineer · APIs · Agents · Products |
| **Education** | B.Tech AI & Data Science · ADIT, CVM University |
| **Location** | Gujarat, India |
| **Focus** | FastAPI · LLM agents · ML foundations · end-to-end shipping |
| **Credential** | Design Patent · Government of India (No. 450815-001) |
| **GitHub** | [github.com/allen745](https://github.com/allen745) |
| **Portfolio** | [portfolio-demo-tan-six.vercel.app](https://portfolio-demo-tan-six.vercel.app/) |
| **LinkedIn** | [linkedin.com/in/allen-christian-708545409](https://www.linkedin.com/in/allen-christian-708545409/) |
| **Email** | [allenschristian07@gmail.com](mailto:allenschristian07@gmail.com) |

Allen builds practical AI and backend products while studying AI & Data Science — clean APIs, measurable results, and work that ships. **This repository** is the public front for that work: one page, case studies, live demos.

Other public work includes [DevMind](https://github.com/allen745/devmind-ai), [DevMind Agent](https://github.com/allen745/DEVMIND-AGENT), [CA SaaS](https://github.com/allen745/ca-saas), [Pulse](https://github.com/allen745/pulse-todo), and ML/DL learning portfolios on [GitHub @allen745](https://github.com/allen745).

### Connect

- **GitHub:** [https://github.com/allen745](https://github.com/allen745)  
- **Portfolio:** [https://portfolio-demo-tan-six.vercel.app/](https://portfolio-demo-tan-six.vercel.app/)  
- **LinkedIn:** [https://www.linkedin.com/in/allen-christian-708545409/](https://www.linkedin.com/in/allen-christian-708545409/)  
- **Email:** [allenschristian07@gmail.com](mailto:allenschristian07@gmail.com)  
- **Pulse (ADIT day planner):** [https://pulse-todo-xi.vercel.app](https://pulse-todo-xi.vercel.app)

---

<p align="center">
  <em>Built to ship, not just to show.</em><br/>
  Allen Christian — AI &amp; Data Science Engineer
</p>
