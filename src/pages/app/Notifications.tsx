import { useState } from 'react';
import { clsx } from 'clsx';
import { 
  Bell, Filter, Search, X, CheckCircle, AlertCircle, 
  MapPin, Truck, Eye, Clock, Download, BellOff, BellRing, Wrench
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DataTable } from '../../components/ui/Table';
import { useApp } from '../../context/AppContext';
import { mockNotifications, mockIncidents, mockTeams } from '../../data/mockData';
import type { Notification } from '../../types';

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'incident', label: 'Incidents' },
  { value: 'prediction', label: 'Predictions' },
  { value: 'team', label: 'Team Updates' },
  { value: 'resolution', label: 'Resolutions' },
  { value: 'system', label: 'System' },
  { value: 'maintenance', label: 'Maintenance' },
];

const severityOptions = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'normal', label: 'Normal' },
  { value: 'success', label: 'Success' },
];

const typeIcons: Record<string, any> = { incident: AlertCircle, prediction: MapPin, team: Truck, resolution: CheckCircle, system: Bell, maintenance: Wrench };

export function Notifications() {
  const { notifications, dispatch, navigate } = useApp();
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filteredNotifications = notifications.filter(n => {
    const matchesType = typeFilter === 'all' || n.type === typeFilter;
    const matchesSeverity = severityFilter === 'all' || n.severity === severityFilter;
    const matchesUnread = !showUnreadOnly || !n.read;
    const matchesSearch = searchQuery === '' || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSeverity && matchesUnread && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.severity === 'critical' && !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notification.id });
    if (notification.actionUrl) navigate(notification.actionUrl);
  };

  const getTypeIcon = (type: string) => { const Icon = typeIcons[type] || Bell; return <Icon className="w-4 h-4" />; };

  function NotificationItem({ notification }: { notification: Notification }) {
    return (
      <button onClick={() => handleNotificationClick(notification)} className="w-full p-4 text-left hover:bg-flood-card/50 transition-colors flex items-start gap-4 bg-flood-primary/5">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-flood-critical/20 text-flood-critical"><span className="w-4 h-4">⚠</span></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-flood-text">{notification.title}</h4>
            {!notification.read && <span className="w-2 h-2 rounded-full bg-flood-primary animate-pulse" />}
          </div>
          <p className="text-sm text-flood-text">{notification.message}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-flood-muted">
            <span>{new Date(notification.timestamp).toLocaleString()}</span>
            <span className="px-2 py-1 text-xs font-medium bg-flood-critical/20 text-flood-critical rounded-full">{notification.severity.toUpperCase()}</span>
            <span className="px-2 py-1 text-xs font-medium bg-flood-primary/20 text-flood-primary rounded-full capitalize">{notification.type}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 text-flood-primary">🔔</span>
          <span className="w-5 h-5 text-flood-muted">🔕</span>
        </div>
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-flood-text">Notification Center</h1>
          <p className="text-flood-muted text-sm">System alerts, incident updates & team notifications</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-flood-muted">
            <input type="checkbox" checked={showUnreadOnly} onChange={e => setShowUnreadOnly(e.target.checked)} className="w-4 h-4 rounded border-flood-border text-flood-primary focus:ring-flood-primary" />
            Unread only ({unreadCount})
          </label>
          {unreadCount > 0 && <Button variant="secondary" onClick={() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })} icon={<CheckCircle className="w-4 h-4" />}>Mark All Read</Button>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card-hover text-center p-4 border-l-4 border-flood-primary"><div className="text-3xl font-bold text-flood-text">{notifications.length}</div><div className="text-sm text-flood-muted">Total Notifications</div></div>
        <div className="card-hover text-center p-4 border-l-4 border-flood-warning"><div className="text-3xl font-bold text-flood-warning">{unreadCount}</div><div className="text-sm text-flood-muted">Unread</div></div>
        <div className="card-hover text-center p-4 border-l-4 border-flood-critical"><div className="text-3xl font-bold text-flood-critical">{criticalCount}</div><div className="text-sm text-flood-muted">Critical Unread</div></div>
        <div className="card-hover text-center p-4 border-l-4 border-flood-success"><div className="text-3xl font-bold text-flood-success">{notifications.filter(n => n.severity === 'success').length}</div><div className="text-sm text-flood-muted">Resolutions</div></div>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-flood-muted mb-1">Search</label>
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search notifications..." />
          </div>
          <div className="min-w-[160px]">
            <label className="block text-sm font-medium text-flood-muted mb-1">Type</label>
            <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} options={typeOptions} placeholder="All" />
          </div>
          <div className="min-w-[160px]">
            <label className="block text-sm font-medium text-flood-muted mb-1">Severity</label>
            <Select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} options={severityOptions} placeholder="All" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="divide-y divide-flood-border/50">
          {filteredNotifications.map(n => <NotificationItem key={n.id} notification={n} />)}
          {filteredNotifications.length === 0 && (
            <div className="p-8 text-center text-flood-muted">
              <span className="w-12 h-12 mx-auto mb-3 opacity-50">🔔</span>
              <p>No notifications match current filters</p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-flood-border">
          <h3 className="font-semibold text-flood-text">Notification Preferences</h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-flood-text">Delivery Channels</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-flood-bg rounded-lg cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked={true} className="w-4 h-4 rounded border-flood-border text-flood-primary focus:ring-flood-primary" />
                    <div>
                      <p className="font-medium text-flood-text">Push Notifications</p>
                      <p className="text-xs text-flood-muted">Real-time alerts on this device</p>
                    </div>
                  </div>
                </label>
                <label className="flex items-center justify-between p-3 bg-flood-bg rounded-lg cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked={true} className="w-4 h-4 rounded border-flood-border text-flood-primary focus:ring-flood-primary" />
                    <div>
                      <p className="font-medium text-flood-text">Email Alerts</p>
                      <p className="text-xs text-flood-muted">Daily digest + critical alerts</p>
                    </div>
                  </div>
                </label>
                <label className="flex items-center justify-between p-3 bg-flood-bg rounded-lg cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked={false} className="w-4 h-4 rounded border-flood-border text-flood-primary focus:ring-flood-primary" />
                    <div>
                      <p className="font-medium text-flood-text">SMS Alerts</p>
                      <p className="text-xs text-flood-muted">Critical incidents only</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-flood-text">Alert Thresholds</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-flood-bg rounded-lg">
                  <div>
                    <p className="font-medium text-flood-text">Rainfall Threshold</p>
                    <p className="text-xs text-flood-muted">Trigger prediction alerts</p>
                  </div>
                  <span className="font-mono text-flood-primary">30 mm/hr</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-flood-bg rounded-lg">
                  <div>
                    <p className="font-medium text-flood-text">Flood Probability</p>
                    <p className="text-xs text-flood-muted">Auto-create incidents</p>
                  </div>
                  <span className="font-mono text-flood-primary">60%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-flood-bg rounded-lg">
                  <div>
                    <p className="font-medium text-flood-text">Drainage Stress</p>
                    <p className="text-xs text-flood-muted">Blockage warnings</p>
                  </div>
                  <span className="font-mono text-flood-primary">70%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}