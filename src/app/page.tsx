'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Portuguese version by default
    router.replace('/pt');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="spinner mx-auto mb-4" />
        <p className="text-white">Redirecting...</p>
      </div>
    </div>
  );
}