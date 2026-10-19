import fs from 'node:fs';
import path from 'node:path';
import { projects } from '@/content/projects';
import Portfolio, { type ResolvedProject } from '@/components/Portfolio';

// Resolved at build time: a project only gets a <video> if the file is
// actually in /public, and a poster if the matching .jpg exists.
function resolve(): ResolvedProject[] {
  const pub = path.join(process.cwd(), 'public');
  const exists = (p: string) => !!p && fs.existsSync(path.join(pub, p));
  return projects.map((p) => {
    const video = exists(p.video) ? p.video : '';
    const posterPath = video.replace(/\.[^.]+$/, '.jpg');
    return { ...p, video, poster: video && exists(posterPath) ? posterPath : '' };
  });
}

export default function Page() {
  return <Portfolio projects={resolve()} />;
}
