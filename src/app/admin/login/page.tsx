"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/actions/auth';

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    console.log('[Login] Submitting form...');
    const resp = await login(formData);
    console.log('[Login] Response:', resp);
    if (!resp.success) {
      setError(resp.error || 'Invalid credentials');
      return;
    }
    console.log('[Login] Success, redirecting to /admin');
    router.replace('/admin');
    router.refresh();
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-serif-sc text-3xl text-center mb-6 text-ink">百合</h1>
      <form onSubmit={handleSubmit} className="bg-white/60 border border-ink/10 rounded-md p-8">
        {error && <p className="mb-4 text-sm text-plum">{error}</p>}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-ink placeholder-ink/40 focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-ink mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-ink placeholder-ink/40 focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-ink text-paper py-2 text-sm font-medium hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass transition-colors"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}