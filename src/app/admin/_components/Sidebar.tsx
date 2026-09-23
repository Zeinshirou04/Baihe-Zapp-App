"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, List, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/series', label: 'Series', icon: BookOpen },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
] as const;

interface SidebarProps {
  onClose?: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  open: boolean;
}

export function Sidebar({ onClose, collapsed, onToggleCollapsed, open }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 bg-white/80 backdrop-blur-sm border-r border-ink/10 transition-all duration-300 flex flex-col ${
        open ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] ${collapsed ? 'w-16' : 'w-64'}`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-16 px-4 border-b border-ink/10">
          {!collapsed && (
            <span className="font-medium text-ink whitespace-nowrap">Overview</span>
          )}
          <button
            onClick={onToggleCollapsed}
            className="p-1.5 rounded-md text-ink/60 hover:bg-ink/5 hover:text-brass transition-colors flex-shrink-0"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {menuItems.map(item => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brass/10 text-brass'
                    : 'text-ink/60 hover:bg-ink/5 hover:text-brass'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-ink/10">
          {!collapsed && (
            <p className="text-xs text-ink/40 text-center">
              Baihe Translation Admin
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}