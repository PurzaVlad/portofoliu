export type Project = {
  name: string;
  kind: string;
  /** Accent color: dot, headline highlight, app icon. */
  color: string;
  /** Background of the placeholder screen. */
  screen: string;
  /** Page background while this project is active. */
  tint: string;
  /** Path under /public, e.g. '/videos/defile.mp4'. Empty = placeholder. */
  video: string;
  blurb: string;
};

export const projects: Project[] = [
  { name: 'Zero Gravity', kind: 'Client', color: '#2F5BEA', screen: '#E9EEFD', tint: '#EAEFFC', video: '', blurb: 'Gym management app — members tap their phone and the 2N door opens.' },
  { name: 'Défilé', kind: 'Own', color: '#B0144F', screen: '#FBE8EF', tint: '#F8EAF0', video: '/videos/defile.mp4', blurb: 'An iOS coach for runway walk and posture.' },
  { name: 'Insight', kind: 'Thesis', color: '#0F7A5F', screen: '#E3F3EC', tint: '#E7F3EE', video: '', blurb: 'On-device AI document agent. My UPT thesis.' },
  { name: 'Event Entry', kind: 'Client', color: '#C2410C', screen: '#FCEBDF', tint: '#F9EDE4', video: '', blurb: 'QR tickets that open the venue gates through 2N access control.' },
  { name: 'Six Venues', kind: 'Client', color: '#6741D9', screen: '#EEE9FC', tint: '#EFEBFA', video: '', blurb: 'One app for six businesses under one owner.' },
  { name: 'The Building', kind: 'Client', color: '#475569', screen: '#E8ECF0', tint: '#ECEFF2', video: '', blurb: 'An app for one real building, with a procedurally generated 3D model at its heart.' },
  { name: 'Promo Studio', kind: 'Own', color: '#8A6A00', screen: '#F7F0D9', tint: '#F5F0E0', video: '', blurb: 'AI-generated marketing videos for small businesses.' },
  { name: 'Tennis Journal', kind: 'Idea', color: '#2B7A3B', screen: '#E5F2E7', tint: '#E9F2EA', video: '', blurb: 'A match journal for players who care about technique.' },
  { name: 'EasyLife', kind: 'Idea', color: '#0B6E80', screen: '#E1F1F4', tint: '#E6F1F3', video: '', blurb: 'One project memory across every AI you work with.' },
];

export const site = {
  name: 'Vlad Purza',
  email: 'vpurza@gmail.com',
  // TODO: replace with real profile URLs.
  github: 'https://github.com/',
  linkedin: 'https://www.linkedin.com/',
  // Absolute base for OG image URLs. On Vercel the production domain is filled in automatically.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000'),
  description: 'Vlad Purza builds apps that open doors — access control, AI tools and iOS apps.',
};
