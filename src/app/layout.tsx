import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Supademo | AI-Powered Interactive Product Demos & Enablement',
  description:
    'Create interactive product demos, HTML sandboxes, AI voiceovers, showcases, in-app demo hubs, and route hubs in minutes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
