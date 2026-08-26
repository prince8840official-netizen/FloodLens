import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useApp } from '../../context/AppContext';
import { clsx } from 'clsx';

export function AppLayout() {
  const { sidebarCollapsed } = useApp();

  return (
    <div className="min-h-screen bg-flood-bg">
      <Sidebar />
      <Header />
      <main 
        className={clsx('pt-16 min-h-screen transition-all duration-300', sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64')}
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