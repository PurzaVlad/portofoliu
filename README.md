# Vlad Purza — portfolio

Single-page portfolio: a 3D scroll wheel of projects on the left, a pinned phone
screen on the right playing the active project's screen recording.

Next.js (App Router) + TypeScript + Tailwind. No UI or animation libraries — the
wheel is plain scroll math written to `style.transform` in a requestAnimationFrame
(see `components/Portfolio.tsx`).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
```

Deploys to Vercel with no configuration.

## Editing content

Everything lives in `content/projects.ts`: projects (name, kind, colors, video,
blurb) and the header links (`site.github`, `site.linkedin` are placeholders).

## Adding a screen recording

iPhone recordings are HEVC and heavy. Convert them to H.264 (no audio) with a
poster frame:

```bash
scripts/compress-video.sh ~/Desktop/RPReplay_Final123.MP4 defile
# → public/videos/defile.mp4 (+ defile.jpg poster)
```

Then set `video: '/videos/defile.mp4'` on the project. The poster is picked up
automatically when `<name>.jpg` sits next to the video. If the video file is
missing, the project falls back to the placeholder screen. Requires `ffmpeg`.
