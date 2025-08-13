'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // For the purpose of this prototype, we'll simulate a logged-in user
    // and redirect to the dashboard.
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Redirigiendo al panel de control...</p>
    </div>
  );
}
