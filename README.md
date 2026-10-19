# Joshua Pasacay Palero — Developer Portfolio

Hey! I'm **Joshua Pasacay Palero**, a full-stack software engineer based in Metro Manila, Philippines.

This repository hosts my personal developer portfolio, technical showcase, and interactive digital space. Built with a focus on typography, lightning-fast navigation, minimalist monochrome aesthetics, and modern web standards.

---

## ⚡ What’s Under the Hood

Rather than using heavy all-in-one frameworks, this portfolio was architected with a decoupled, high-performance stack:

* **Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build & Bundling**: [Vite 8](https://vite.dev/) with [LightningCSS](https://lightningcss.dev/) for instant HMR and optimized CSS builds
* **Routing**: [TanStack Router](https://tanstack.com/router) with strict type-safe routes, automatic code-splitting, and SPA fallback rewrites
* **Data Layer**: [TanStack Query v5](https://tanstack.com/query) for declarative edge data fetching and resilient caching
* **Styling & Motion**: Tailwind utility classes, custom monochrome design system, Motion (Framer Motion engine), and GSAP kinetic typography
* **Edge & Micro-Services**: [Cloudflare Workers](https://workers.cloudflare.com/) edge proxy with Cloudflare D1 SQL database and Upstash Redis for live chat, presence counters, and Facebook Graph API caching
* **Hosting**: [Vercel](https://vercel.com/) (Hobby Tier) with 1-year immutable asset caching and modern security headers

---

## ✨ Key Features

* **Spotlight Projects**: Curated case studies and open-source software with direct GitHub repository synchronization.
* **Experience & Career Timeline**: Interactive breakdown of engineering roles, tech stacks, and career milestones.
* **Verified Credentials**: Certifications, licenses, and direct verification links.
* **Community Chat & Live Presence**: Real-time visitor presence counter, avatars, section emoji reactions, and live community overlay.
* **Curated Dev Resources**: Handpicked development roadmaps, learning tracks, and full-stack cheat sheets.
* **Work Together Modal**: Universal contact hub supporting direct draft generation for Gmail, Outlook, Yahoo, and native mailto clients, plus instant Calendly scheduling.
* **Dark / Light / System Mode**: Persistent theme engine utilizing the native **View Transitions API** for fluid circular reveals.
* **2026 Discovery Standards**:
  * Semantic **Schema.org JSON-LD Knowledge Graph** for Google Sitelinks and entity recognition.
  * Native `<script type="speculationrules">` for instant near-zero latency page pre-rendering.
  * Standardized `llms.txt` and `robots.txt` for AI search agents (ChatGPT, Perplexity, Claude).

---

## 📂 Project Architecture

```text
├── public/                 # Static assets, sitemap.xml, robots.txt, llms.txt, resume
├── src/
│   ├── all/
│   │   ├── bio/            # Profile bio & story
│   │   ├── blog/           # Technical writing & Facebook social sync
│   │   ├── certification/  # Engineering licenses & credentials
│   │   ├── community_chat/ # Real-time chat overlay & moderation
│   │   ├── experience/     # Career history & GitHub Gist integration
│   │   ├── gallery/        # Visual moments & photo feed
│   │   ├── live_viewers/   # Real-time presence & section reactions
│   │   ├── navigation/     # Right-side dock, contact modal, social data
│   │   ├── practice_activity/ # Interactive Git & developer cheat sheets
│   │   ├── project/        # Spotlight projects & repo drawer
│   │   ├── recommendations/# Peer endorsements & testimonial submission
│   │   ├── resources/      # Curated learning tracks & roadmaps
│   │   ├── resume/         # CV viewer & download trigger
│   │   ├── seo/            # Metadata factory & OpenGraph head hooks
│   │   ├── tech_stack/     # Categorized skill proficiencies & icons
│   │   ├── theme/          # View Transitions theme switcher
│   │   └── ui/             # Reusable primitives (cards, skeletons, spinner)
│   ├── routes/             # TanStack file-based routes
│   ├── index.css           # Global tokens & LightningCSS baseline
│   └── main.tsx            # App bootstrap & QueryClient setup
├── workers/
│   └── facebook-proxy/     # Cloudflare Worker, D1 migrations & proxy handlers
├── vercel.json             # SPA rewrites, immutable caching & security headers
└── vite.config.ts          # Vite & TanStack Router build configuration
```

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v20+) or [Bun](https://bun.sh/) (v1.2+)

### Installation
```bash
# Clone the repository
git clone https://github.com/joshuapalero/Portfolio.git

# Navigate into the project directory
cd Portfolio

# Install dependencies
npm install
# or
bun install
```

### Local Development
```bash
npm run dev
# or
bun run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 📬 Let's Connect

Feel free to reach out for collaborations, project inquiries, or just to say hi!

* **GitHub**: [@joshuapalero](https://github.com/joshuapalero)
* **LinkedIn**: [linkedin.com/in/joshuapalero](https://linkedin.com/in/joshuapalero)
* **Email**: [joshuapalero111@gmail.com](mailto:joshuapalero111@gmail.com)
* **Facebook**: [facebook.com/joshuapalero](https://facebook.com/joshuapalero)
* **Instagram**: [@joshuapalero](https://instagram.com/joshuapalero)
* **Schedule a Call**: [calendly.com/joshuapalero111](https://calendly.com/joshuapalero111)

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
