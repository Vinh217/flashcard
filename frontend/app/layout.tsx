import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import PageLoading from './components/PageLoading';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <Providers>
          <PageLoading />
          {children}
        </Providers>
      </body>
    </html>
  );
}
