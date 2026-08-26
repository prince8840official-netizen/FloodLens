import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { Search, Bell, HelpCircle, User, LogOut, ChevronDown, Menu, X, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { mockUsers } from '../../data/mockData';
import type { UserRole } from '../../types';

export function Header() {
  const { currentUser, userRole, dispatch, unreadNotificationCount, notifications, logout } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleRoleChange = (role: UserRole) => {
    dispatch({ type: 'SET_ROLE', payload: role });
    setShowProfile(false);
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
    setShowProfile(false);
  };

  const getRoleLabel = (role: UserRole) => {
    const labels: Record<UserRole, string> = {
      'control-officer': 'Municipal Control Officer',
      'drainage-engineer': 'Drainage Engineer',
      'response-team': 'Response Team Member',
      'citizen': 'Citizen',
    };
    return labels[role];
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-flood-card/80 backdrop-blur-md border-b border-flood-border flex items-center">
      <button
        className="lg:hidden p-2 rounded-lg text-flood-text hover:bg-flood-border mr-2"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        aria-label="Toggle menu"
        aria-expanded={showMobileMenu}
      >
        {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <div className="flex-1 flex items-center gap-4 px-4">
        <h1 className="text-lg font-semibold text-flood-text hidden sm:block">
          FloodLens Command Center
        </h1>
        
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-flood-muted" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search road, incident, drain, ward..."
            className="input pl-10 pr-10 py-2 text-sm"
            aria-label="Search"
          />
        </form>
      </div>

      <div className="flex items-center gap-2 px-4">
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-flood-muted hover:text-flood-text hover:bg-flood-border transition-colors"
            aria-label={`Notifications${unreadNotificationCount > 0 ? `, ${unreadNotificationCount} unread` : ''}`}
            aria-expanded={showNotifications}
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-flood-danger text-white text-xs font-medium rounded-full flex items-center justify-center">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 md:w-96 glass-strong rounded-xl border border-flood-border shadow-xl overflow-hidden animate-in z-50">
              <div className="flex items-center justify-between p-3 border-b border-flood-border">
                <h3 className="font-medium text-flood-text">Notifications</h3>
                {notifications.some(n => !n.read) && (
                  <button 
                    onClick={() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })}
                    className="text-xs text-flood-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-flood-muted text-sm">No notifications</div>
                ) : (
                  notifications.slice(0, 10).map(n => (
                    <button
                      key={n.id}
                      onClick={() => { dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id }); if (n.actionUrl) navigate(n.actionUrl); setShowNotifications(false); }}
                      className={clsx('w-full p-3 text-left hover:bg-flood-card/50 transition-colors border-b border-flood-border/50', !n.read && 'bg-flood-primary/5')}
                    >
                      <div className="flex items-start gap-2">
                        <div className={clsx('w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                          n.severity === 'critical' && 'bg-flood-critical',
                          n.severity === 'high' && 'bg-flood-danger',
                          n.severity === 'moderate' && 'bg-flood-warning',
                          n.severity === 'success' && 'bg-flood-success',
                          n.severity === 'normal' && 'bg-flood-primary',
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-flood-text">{n.title}</p>
                          <p className="text-xs text-flood-muted mt-0.5">{n.message}</p>
                          <p className="text-xs text-flood-muted mt-1">{new Date(n.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              {notifications.length > 10 && (
                <Link to="/notifications" className="block p-3 text-center text-sm text-flood-primary hover:bg-flood-card/50 border-t border-flood-border">
                  View all notifications
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-flood-border transition-colors"
            aria-label="User menu"
            aria-expanded={showProfile}
          >
            <div className="w-8 h-8 rounded-full bg-flood-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-flood-primary" />
            </div>
            <span className="hidden sm:block text-sm font-medium text-flood-text">{currentUser?.name || 'Guest'}</span>
            <ChevronDown className="w-4 h-4 text-flood-muted hidden sm:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-xl border border-flood-border shadow-xl overflow-hidden animate-in z-50">
              <div className="p-3 border-b border-flood-border">
                <p className="font-medium text-flood-text">{currentUser?.name || 'Guest User'}</p>
                <p className="text-xs text-flood-muted">{currentUser?.email}</p>
                <span className="badge-info mt-1 inline-block">{getRoleLabel(userRole)}</span>
              </div>
              
              <div className="p-2">
                <p className="px-3 py-1 text-xs font-medium text-flood-muted uppercase">Switch Role (Demo)</p>
                {(['control-officer', 'drainage-engineer', 'response-team', 'citizen'] as UserRole[]).map(role => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={clsx('w-full px-3 py-2 text-left text-sm rounded-lg transition-colors', 
                      userRole === role ? 'bg-flood-primary/10 text-flood-primary' : 'text-flood-text hover:bg-flood-card/50'
                    )}
                  >
                    {getRoleLabel(role)}
                  </button>
                ))}
              </div>
              
              <div className="border-t border-flood-border p-2">
                <Link to="/settings" className="block px-3 py-2 text-sm text-flood-text hover:bg-flood-card/50 rounded-lg transition-colors flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button onClick={handleLogout} className="w-full px-3 py-2 text-sm text-flood-danger hover:bg-flood-card/50 rounded-lg transition-colors flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}