# Portfolio

Next.js 16 + React Three Fiber portfolio. See README.md for structure and commands.

- Package manager: pnpm. Check with `pnpm lint` and `npx tsc --noEmit`; `pnpm build` must pass before shipping.
- Project content is MDX in `content/projects`; card art in `public/projects/<slug>`.
- Helix look is tuned in `lib/helix.ts`; card shader in `components/canvas/CardMaterial.ts`.
- Personal details (email, LinkedIn, domain) live in `lib/site.ts`.
