
'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Progress } from './ui/progress';

export function PageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setProgress(0);
    setIsVisible(true);

    const timer = setTimeout(() => setProgress(30 + Math.random() * 30), 100); // Start progress
    const fullProgressTimer = setTimeout(() => {
        setProgress(100);
        // Hide after completion animation
        setTimeout(() => setIsVisible(false), 300);
    }, 500); // Simulate page load time

    return () => {
        clearTimeout(timer);
        clearTimeout(fullProgressTimer);
    };
  }, [pathname, searchParams]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 z-50 w-full h-1">
      <Progress value={progress} className="h-1 rounded-none bg-transparent [&>div]:bg-primary" />
    </div>
  );
}
