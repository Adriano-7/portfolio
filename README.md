# Portfolio

A personal site for machine-learning work: a 3D helix of project cards you scroll through, a list view, and case-study pages. Built with Next.js 16, React Three Fiber and GSAP.

## Run

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # static production build
pnpm lint
```

## Where things live

| Path | What |
| --- | --- |
| `content/projects/*.mdx` | One file per project. Frontmatter drives the card (title, year, tags, accent, `featured`, `repo`, `report`). The body is only rendered for `featured: true` projects at `/work/<slug>`. |
| `public/projects/<slug>/` | `cover.webp` (1280×800) and `cover-sm.webp` (640×400) for the card, plus any figures the case study uses. |
| `scripts/covers.mjs`, `scripts/figures.mjs` | Sharp scripts that produced the WebP assets from the original repo figures. |
| `scripts/avatar.mjs` | Builds `public/avatar.webp` and the favicons in `app/` from `content/profile.jpg`. |
| `lib/helix.ts` | Pure layout math and the tunable helix parameters (`DESKTOP_HELIX`, `MOBILE_HELIX`). |
| `lib/virtualScroll.ts` | Wheel / drag / touch / keyboard accumulator that drives the helix. |
| `components/canvas/CardMaterial.ts` | GLSL for the cards: cover-fit, "denoise" reveal, depth dim + mip-bias blur, hover zoom, rounded corners. |
| `components/canvas/Helix.tsx` | Scene: poses, hover/click, list-view preview, click-to-case-study transition. |
| `components/ui/*` | Header, spiral/list toggle, menu, loader, active-card caption, list view. |
| `lib/site.ts` | Name, links, e-mail, canonical URL. |

## Adding a project

1. Create `content/projects/<slug>.mdx` with frontmatter (copy an existing one). `order` controls the position in the helix.
2. Add `public/projects/<slug>/cover.webp` and `cover-sm.webp` (16:10). `node scripts/covers.mjs <dir>` shows how they were made.
3. If `featured: true`, write the body using `<Lead>`, `<Figure>` and `<Table>` (see `components/mdx`).

## Behaviour notes

- Home page: the helix drifts slowly while idle; wheel, drag, touch and arrow keys rotate it; the bottom-left caption names the front card (or the hovered one); click opens the case study (featured) or the GitHub repo.
- `?view=list` opens the list view directly. Reduced-motion users and browsers without WebGL get the list view.
- The canvas lives in the root layout so textures survive navigation.

## Deploy

Push to GitHub and import the repo in Vercel. No environment variables are needed. Update `site.url` in `lib/site.ts` to the final domain for correct Open Graph and sitemap URLs.
