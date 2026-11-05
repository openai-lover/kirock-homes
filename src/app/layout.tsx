import type { Metadata } from 'next';
import './globals.css';
import './attraction.css';
import './entry.css';
export const metadata: Metadata = {
  title: 'Kirock Homes — Room of Suspects | 킬록 홈즈',
  applicationName: 'Kirock Homes',
  description: 'Your room. Three suspects. One liar. Turn your photo into a cozy comedy mystery with Kirock, your resident ghost detective.',
  openGraph: {
    title: 'Kirock Homes — Room of Suspects',
    siteName: 'Kirock Homes',
    description: 'Your room. Three suspects. One liar. A cozy comedy mystery in your own photo.',
    type: 'website',
  },
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
