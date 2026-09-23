"use client";
import { useEffect, useState } from 'react';
import type { FlashMessage } from '@/lib/flash';

interface ToastProps {
  initialFlash?: FlashMessage | null;
}

export function Toast({ initialFlash }: ToastProps) {
  const [flash, setFlash] = useState<FlashMessage | null>(initialFlash ?? null);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 3000);
    return () => clearTimeout(t);
  }, [flash]);

  if (!flash) return null;
  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg animate-fade-in ${
        flash.type === 'success' ? 'bg-brass text-paper' : 'bg-plum text-paper'
      }`}
    >
      {flash.message}
    </div>
  );
}