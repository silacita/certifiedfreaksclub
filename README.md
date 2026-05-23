# Certified Freaks Club

Cinematic web experience for Certified Freaks Club — landing entry, Mirror Room, and the **1 UNHEARD MESSAGE** audio journey.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4

## Prerequisites

- Node.js 20+
- npm

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Routes:

- `/` — home / Mirror Room entry
- `/unheard-message` — 1 UNHEARD MESSAGE experience

## Build for production

```bash
npm install
npm run build
npm start
```

Lint:

```bash
npm run lint
```

## Audio assets

Static files live under `public/audio/` and are served at `/audio/...`:

- `public/audio/experience/` — ring, pickup, disconnect, tape hiss (WAV placeholders; replace with mastered assets if needed)
- `public/audio/voices/manifesto/` — unheard-message voice sequence
- `public/audio/voices/mirror room/` — Mirror Room voice clips

Regenerate placeholder experience WAVs:

```bash
python3 scripts/generate-experience-audio.py
```

## Deploy

Compatible with [Vercel](https://vercel.com) and any Node host that runs `next build` + `next start`. Ensure `public/audio` is included in the deployment artifact (default for this repo).
