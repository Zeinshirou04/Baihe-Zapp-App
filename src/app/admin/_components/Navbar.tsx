"use client";
import Link from 'next/link';
import { logout } from '@/actions/auth';
import { usePathname } from 'next/navigation';
import { LogOut, User, Sun, Moon, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  user: { name?: string | null; email: string } | null;
  isDark?: boolean;
  onThemeToggle?: () => void;
}

const sections = [
  { key: 'overview', label: 'Overview', href: '/admin' },
  { key: 'content', label: 'Content', href: '/admin/series' },
  { key: 'system', label: 'System', href: '/admin/settings' },
] as const;

export function Navbar({ user, isDark = false, onThemeToggle }: NavbarProps) {
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);
  const displayName = user?.name || 'Admin';

  const handleLogout = async () => {
    await logout();
  };

  const currentSection = sections.find(s => pathname.startsWith(s.href)) || sections[0];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-ink/10">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="font-serif-sc text-xl text-ink">
            百合
          </Link>
          <div className="relative">
            <button
              onClick={() => setShowSectionDropdown(!showSectionDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-ink/60 hover:bg-ink/5 hover:text-brass transition-colors"
              aria-label="Switch section"
            >
              <span className="hidden sm:block">{currentSection.label}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {showSectionDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSectionDropdown(false)} />
                <div className="absolute left-0 mt-2 w-40 bg-white border border-ink/10 rounded-md shadow-lg py-1 z-20">
                  {sections.map(s => (
                    <Link
                      key={s.key}
                      href={s.href}
                      onClick={() => setShowSectionDropdown(false)}
                      className={`block px-3 py-2 text-sm transition-colors ${
                        pathname.startsWith(s.href)
                          ? 'bg-brass/10 text-brass'
                          : 'text-ink/60 hover:bg-ink/5 hover:text-brass'
                      }`}
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-md text-ink/60 hover:bg-ink/5 hover:text-brass transition-colors"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-ink/60 hover:bg-ink/5 hover:text-brass transition-colors"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:block">{displayName}</span>
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-ink/10 rounded-md shadow-lg py-1 z-20">
                  <div className="px-3 py-2 border-b border-ink/10">
                    <p className="text-xs font-medium text-ink">{displayName}</p>
                    <p className="text-xs text-ink/50 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 text-left text-sm text-ink/60 hover:bg-ink/5 hover:text-brass transition-colors flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}