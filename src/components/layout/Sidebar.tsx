import { useState } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { 
  LayoutDashboard, Map, AlertTriangle, ListChecks, 
  Route, GitBranch, Video, Users, MessageSquare,
  BarChart, Clock, Lightbulb, FlaskConical, 
  Bell, Settings, ChevronLeft, ChevronRight,
  Zap, Shield, Database, Globe, Camera
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'map', label: 'Live Map', icon: Map, path: '/map' },
  { id: 'predictions', label: 'Flood Predictions', icon: AlertTriangle, path: '/predictions' },
  { id: 'incidents', label: 'Incidents', icon: ListChecks, path: '/incidents' },
  { id: 'roads', label: 'Road Intelligence', icon: Route, path: '/roads' },
  { id: 'drainage', label: 'Drainage Network', icon: GitBranch, path: '/drainage' },
  { id: 'roadeye', label: 'RoadEye AI', icon: Video, path: '/roadeye' },
  { id: 'roadwatch', label: 'RoadWatch', icon: Camera, path: '/roadwatch' },
  { id: 'teams', label: 'Response Teams', icon: Users, path: '/teams' },
  { id: 'citizen-reports', label: 'Citizen Reports', icon: MessageSquare, path: '/citizen-reports' },
  { id: 'analytics', label: 'Analytics', icon: BarChart, path: '/analytics' },
  { id: 'history', label: 'Flood History', icon: Clock, path: '/history' },
  { id: 'recommendations', label: 'AI Recommendations', icon: Lightbulb, path: '/recommendations' },
  { id: 'simulation', label: 'What-If Simulation', icon: FlaskConical, path: '/simulation' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

const roleNavigation: Record<string, typeof navigation> = {
  'control-officer': navigation,
  'drainage-engineer': navigation.filter(n => ['overview', 'map', 'predictions', 'incidents', 'roads', 'drainage', 'roadeye', 'roadwatch', 'recommendations', 'simulation', 'analytics', 'history', 'settings'].includes(n.id)),
  'response-team': navigation.filter(n => ['overview', 'map', 'incidents', 'teams', 'roadwatch', 'notifications', 'settings'].includes(n.id)),
  'citizen': navigation.filter(n => ['map', 'citizen-reports', 'roadwatch', 'notifications', 'settings'].includes(n.id)),
};

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed, userRole, dispatch } = useApp();
  const location = useLocation();
  const [hovered, setHovered] = useState(false);
  const isCollapsed = sidebarCollapsed && !hovered;
  
  const currentNav = roleNavigation[userRole] || navigation;

  return (
    <aside 
      className={clsx(
        'fixed left-0 top-0 z-40 h-screen bg-flood-card border-r border-flood-border transition-all duration-300 flex flex-col',
        isCollapsed ? 'w-16' : 'w-64'
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Main navigation"
    >
      <div className={clsx('flex items-center justify-between h-16 px-4 border-b border-flood-border', isCollapsed && 'justify-center')}>
        <Link to="/dashboard" className="flex items-center gap-2" aria-label="FloodLens Home">
          <div className="w-8 h-8 rounded-lg bg-flood-primary flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-flood-bg" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold text-flood-text">FloodLens</span>
          )}
        </Link>
        {!isCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded-lg text-flood-muted hover:text-flood-text hover:bg-flood-border transition-colors"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Navigation">
        {currentNav.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'));
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive: active }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                'group',
                active 
                  ? 'bg-flood-primary/10 text-flood-primary border border-flood-primary/30' 
                  : 'text-flood-muted hover:text-flood-text hover:bg-flood-card/50',
                isCollapsed && 'justify-center px-2'
              )}
              title={isCollapsed ? item.label : undefined}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={clsx('w-5 h-5 flex-shrink-0', isCollapsed ? 'mx-auto' : '')} aria-hidden="true" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className={clsx('p-3 border-t border-flood-border', isCollapsed && 'hidden')}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-flood-bg border border-flood-border">
          <Shield className="w-5 h-5 text-flood-success flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-flood-text truncate">System Status</p>
            <p className="text-xs text-flood-success flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-flood-success animate-pulse" />
              All Systems Operational
            </p>
          </div>
        </div>
      </div>

      {isCollapsed && !sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(true)}
          className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-8 rounded-r-lg bg-flood-card border border-flood-border border-l-0 flex items-center justify-center text-flood-muted hover:text-flood-text"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </aside>
  );
}