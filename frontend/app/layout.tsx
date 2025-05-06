import './globals.css';
import type { Metadata } from 'next';
import { Quicksand } from 'next/font/google';
import { Providers } from './providers';
import PageLoading from './components/PageLoading';

const quicksand = Quicksand({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-quicksand',
});

export const metadata: Metadata = {
  title: 'Flashcard Game',
  description: 'A multiplayer flashcard game for learning vocabulary',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={quicksand.className}>
        <Providers>
          <PageLoading />
          {children}
        </Providers>
      </body>
    </html>
  );
}
