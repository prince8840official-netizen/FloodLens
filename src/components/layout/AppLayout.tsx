import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useApp } from '../../context/AppContext';
import { clsx } from 'clsx';
import { useState, useEffect } from 'react';

export function AppLayout() {
  const { sidebarCollapsed } = useApp();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // On mobile, sidebar is a drawer overlay - no padding needed
  // On desktop, sidebar takes space - use padding
  const mainContentClass = clsx(
    'pt-16 min-h-screen transition-all duration-300',
    isMobile 
      ? '' 
      : sidebarCollapsed 
        ? 'pl-16' 
        : 'pl-64'
  );

  return (
    <div className="min-h-screen bg-flood-bg">
      <Sidebar />
      <Header />
      <main 
        className={mainContentClass}
        id="main-content"
        role="main"
      >
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}