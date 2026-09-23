"use client";
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Toast } from './Toast';
import { useState, useEffect } from 'react';

interface LayoutShellProps {
  children: React.ReactNode;
  user: { name?: string | null; email: string } | null;
  initialFlash?: { type: 'success' | 'error'; message: string } | null;
}

export function LayoutShell({ children, user, initialFlash }: LayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('dark-mode');
    if (saved !== null) setIsDark(saved === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('dark-mode', String(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) setCollapsed(saved === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleTheme = () => setIsDark(!isDark);
  const toggleCollapse = () => setCollapsed(!collapsed);

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <Toast initialFlash={initialFlash} />
      <Navbar user={user} isDark={isDark} onThemeToggle={toggleTheme} />
      <div className="flex flex-1">
        <Sidebar
          open={sidebarOpen}
          onClose={closeSidebar}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapse}
        />
        <main className="flex-1 min-w-0 lg:ml-0">
          {children}
        </main>
      </div>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-ink/50" 
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
    </div>
  );
}