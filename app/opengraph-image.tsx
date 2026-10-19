import { ImageResponse } from 'next/og';
import { projects, site } from '@/content/projects';

export const alt = `${site.name} — I build apps that open doors.`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#EAEFFC', padding: 96, color: '#141413' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 40, fontWeight: 600 }}>{site.name}</div>
            <div style={{ fontSize: 72, fontWeight: 600, letterSpacing: '-0.03em', marginTop: 16, display: 'flex' }}>
              I build apps that&nbsp;<span style={{ color: '#2F5BEA' }}>open doors.</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            {projects.map((p) => (
              <div key={p.name} style={{ width: 22, height: 22, borderRadius: 11, background: p.color }} />
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
