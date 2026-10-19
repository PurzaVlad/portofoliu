import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { site } from '@/content/projects';
import './globals.css';

const geistSans = Geist({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-geist-sans',
  display: 'swap',
});

// Only used for small labels, so it isn't preloaded.
const geistMono = Geist_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400'],
  variable: '--font-geist-mono',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.name} — I build apps that open doors`,
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    url: '/',
    siteName: site.name,
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: site.name, description: site.description },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#EAEFFC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
