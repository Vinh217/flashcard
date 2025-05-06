'use client';
import { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Loading from './Loading';

function PageLoadingContent() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true);
    };

    const handleStop = () => {
      setIsLoading(false);
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleStart);
    window.addEventListener('load', handleStop);

    return () => {
      window.removeEventListener('beforeunload', handleStart);
      window.removeEventListener('load', handleStop);
    };
  }, []);

  // Reset loading state when pathname or search params change
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-bubble-dark/80 backdrop-blur-md z-50 flex items-center justify-center">
      <Loading className="w-16 h-16" />
    </div>
  );
}

export default function PageLoading() {
  return (
    <Suspense fallback={null}>
      <PageLoadingContent />
    </Suspense>
  );
} 