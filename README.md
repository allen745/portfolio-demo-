# Allen Christian — Portfolio

Personal portfolio for **Allen Stivanson Christian** — B.Tech AI & Data Science student building ML systems, products, and platforms.

**Live site:** [portfolio-demo-tan-six.vercel.app](https://portfolio-demo-tan-six.vercel.app/)

## About

A static, cinematic single-page site that presents:

- **About** — background, proof points, and focus (AI / Data Science / systems that ship)
- **Skills** — stack and domains
- **Projects** — patents, platforms, and builds with a horizontal detail reel
- **Moments** — scrolling field-still gallery from labs, exhibits, and builds
- **Recognition** — awards and proof
- **Experience** — journey / education timeline
- **Contact** — get in touch
- **Credits** — end-credits closing sequence

Navigation uses a floating **Bubble Menu** over the current page section.

## Tech stack

| Layer | Details |
| --- | --- |
| Markup / style | HTML5, CSS3 (`styles.css`) |
| Behavior | Vanilla JavaScript (`script.js`) |
| Motion | [GSAP](https://gsap.com/) + ScrollTrigger |
| Smooth scroll | [Lenis](https://github.com/darkroomengineering/lenis) |
| Gallery | [OGL](https://github.com/oframe/ogl)-based circular strip (`circular-gallery.js`) |
| Fonts | Cinzel, DM Sans, Space Mono (Google Fonts) |
| Hosting | Vercel (static) |

No build step or package manager required.

## Project structure

```text
├── index.html              # Main page
├── styles.css              # Global styles
├── script.js               # Interactions, sections, project overlay
├── circular-gallery.js     # Moments curved image reel
├── audio/                  # Ambient soundtrack
├── images/                 # Hero, journey, project stills
├── videos/                 # Section cinematic plates + posters
├── favicon.* / og-image.jpg
├── site.webmanifest
└── robots.txt
```

## Run locally

Serve the folder with any static server (required for some media / module loads):

```bash
# Python
python3 -m http.server 8080

# Node (if you have npx)
npx serve .
```

Then open `http://localhost:8080`.

Or open `index.html` directly in a browser for a quick look (some features may be limited without a local server).

## Customize

| Goal | Where |
| --- | --- |
| Copy & sections | `index.html` |
| Look & layout | `styles.css` |
| Motion / menu / project detail | `script.js` |
| Moments images | `circular-gallery.js` + `images/fol/` |
| SEO / social preview | `<head>` in `index.html`, `og-image.jpg` |

## License

Portfolio content and media belong to Allen Stivanson Christian.  
Ask before reusing personal photos, project assets, or branding.
