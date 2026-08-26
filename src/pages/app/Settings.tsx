import { useState } from 'react';
import { clsx } from 'clsx';
import { 
  Settings, User as UserIcon, Bell, MapPin, Brain, Shield, 
  Database, Globe, Key, Palette, Moon, Sun,
  ChevronRight, Check, X, Eye, EyeOff, Save,
  UserPlus, UserMinus, Trash2, Edit2, Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { useApp } from '../../context/AppContext';
import { mockUsers, defaultSettings } from '../../data/mockData';
import type { AppSettings, UserRole, User } from '../../types';

const settingsTabs = [
  { id: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { id: 'map', label: 'Map', icon: <MapPin className="w-4 h-4" /> },
  { id: 'ai', label: 'AI', icon: <Brain className="w-4 h-4" /> },
  { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" /> },
  { id: 'users', label: 'Users & Roles', icon: <Users className="w-4 h-4" /> },
];

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'control-officer', label: 'Municipal Control Officer' },
  { value: 'drainage-engineer', label: 'Drainage Engineer' },
  { value: 'response-team', label: 'Response Team Member' },
  { value: 'citizen', label: 'Citizen' },
];

const modelInfo = [
  { name: 'Flood Nowcaster', version: 'v2.3.1', accuracy: '91%', lastUpdated: '2026-07-15' },
  { name: 'RoadEye Detector', version: 'v1.8.0', accuracy: '94% mIoU', lastUpdated: '2026-07-10' },
  { name: 'Cause Classifier', version: 'v1.2.0', accuracy: '87%', lastUpdated: '2026-06-28' },
  { name: 'Team Optimizer', version: 'v1.0.5', accuracy: 'N/A', lastUpdated: '2026-07-01' },
  { name: 'Resolution Verifier', version: 'v1.4.2', accuracy: '96%', lastUpdated: '2026-07-12' },
];

const layerOptions = [
  { id: 'flooded-roads', label: 'Flooded Roads', enabled: true },
  { id: 'flood-predictions', label: 'Flood Predictions', enabled: true },
  { id: 'drainage-network', label: 'Drainage Network', enabled: false },
  { id: 'blocked-drains', label: 'Blocked Drains', enabled: true },
  { id: 'cctv-cameras', label: 'CCTV Cameras', enabled: false },
  { id: 'water-sensors', label: 'Water Sensors', enabled: false },
  { id: 'response-teams', label: 'Response Teams', enabled: true },
  { id: 'critical-infra', label: 'Critical Infrastructure', enabled: false },
];

const channelOptions = [
  { id: 'push', label: 'Push Notifications', desc: 'Real-time browser notifications', enabled: true },
  { id: 'email', label: 'Email Alerts', desc: 'Critical alerts via email', enabled: true },
  { id: 'sms', label: 'SMS Alerts', desc: 'Critical incidents only (requires Twilio)', enabled: false },
];

const rolePermissions = [
  { role: 'control-officer', label: 'Municipal Control Officer', perms: ['Full system access', 'Incident management', 'Team dispatch', 'Settings', 'Analytics', 'User management'] },
  { role: 'drainage-engineer', label: 'Drainage Engineer', perms: ['Drainage network', 'Incidents', 'Simulations', 'Recommendations', 'Analytics'] },
  { role: 'response-team', label: 'Response Team Member', perms: ['Assigned incidents', 'Team status', 'Navigation', 'Notifications'] },
  { role: 'citizen', label: 'Citizen', perms: ['Submit reports', 'View alerts', 'Public map view'] },
];

export function SettingsPage() {
  const { settings, dispatch, currentUser, userRole } = useApp();
  const [activeTab, setActiveTab] = useState('general');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'citizen' as UserRole });
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleSaveSettings = (section: keyof AppSettings, newSettings: Partial<AppSettings[typeof section]>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { [section]: { ...settings[section], ...newSettings } } });
  };

  const generalTab = (
    <div className="space-y-6">
      <Card variant="strong">
        <CardHeader><CardTitle>System Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-flood-muted">Timezone</label>
              <Select value="Asia/Kolkata" onChange={() => {}} options={[{ value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' }]} />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-flood-muted">Date Format</label>
              <Select value="DD/MM/YYYY" onChange={() => {}} options={[{ value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' }, { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' }, { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }]} />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-flood-muted">Units</label>
              <Select value="metric" onChange={() => {}} options={[{ value: 'metric', label: 'Metric (mm, m, km)' }, { value: 'imperial', label: 'Imperial (in, ft, mi)' }]} />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-flood-muted">Language</label>
              <Select value="en" onChange={() => {}} options={[{ value: 'en', label: 'English' }, { value: 'hi', label: 'Hindi' }]} />
            </div>
          </div>
          <div className="pt-4 border-t border-flood-border">
            <Button icon={<Save className="w-4 h-4" />}>Save General Settings</Button>
          </div>
        </CardContent>
      </Card>
      <Card variant="strong">
        <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-flood-text">Dark Mode</p>
              <p className="text-sm text-flood-muted">Always enabled for command center operations</p>
            </div>
            <div className="flex items-center gap-2"><Badge variant="success" size="sm">Active</Badge></div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-flood-text">High Contrast</p>
              <p className="text-sm text-flood-muted">Enhanced visibility for outdoor use</p>
            </div>
            <Button variant="secondary" size="sm">Enable</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-flood-text">Reduced Motion</p>
              <p className="text-sm text-flood-muted">Minimize animations</p>
            </div>
            <Button variant="secondary" size="sm">Enable</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const notificationsTab = (
    <div className="space-y-6">
      <Card variant="strong">
        <CardHeader><CardTitle>Alert Thresholds</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-flood-muted">Rainfall Threshold</label>
              <div className="flex items-center gap-2">
                <input type="range" min="10" max="100" step="5" defaultValue={settings.alerts.rainfallThreshold} className="flex-1 h-2 bg-flood-border rounded-lg appearance-none accent-flood-primary" />
                <input type="number" min="10" max="100" step="5" defaultValue={settings.alerts.rainfallThreshold} className="input w-20 text-center font-mono" />
                <span className="text-flood-muted">mm/hr</span>
              </div>
              <p className="text-xs text-flood-muted">Trigger prediction alerts above this rainfall rate</p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-flood-muted">Flood Probability Threshold</label>
              <div className="flex items-center gap-2">
                <input type="range" min="30" max="90" step="5" defaultValue={settings.alerts.floodProbabilityThreshold} className="flex-1 h-2 bg-flood-border rounded-lg appearance-none accent-flood-primary" />
                <input type="number" min="30" max="90" step="5" defaultValue={settings.alerts.floodProbabilityThreshold} className="input w-20 text-center font-mono" />
                <span className="text-flood-muted">%</span>
              </div>
              <p className="text-xs text-flood-muted">Auto-create incidents when probability exceeds this</p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-flood-muted">Drainage Stress Threshold</label>
              <div className="flex items-center gap-2">
                <input type="range" min="50" max="95" step="5" defaultValue={settings.alerts.drainageStressThreshold} className="flex-1 h-2 bg-flood-border rounded-lg appearance-none accent-flood-primary" />
                <input type="number" min="50" max="95" step="5" defaultValue={settings.alerts.drainageStressThreshold} className="input w-20 text-center font-mono" />
                <span className="text-flood-muted">%</span>
              </div>
              <p className="text-xs text-flood-muted">Blockage warnings when drainage stress exceeds this</p>
            </div>
          </div>
          <Button icon={<Save className="w-4 h-4" />}>Save Thresholds</Button>
        </CardContent>
      </Card>
      <Card variant="strong">
        <CardHeader><CardTitle>Delivery Channels</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {channelOptions.map(channel => (
            <label key={channel.id} className="flex items-center justify-between p-4 bg-flood-bg rounded-lg cursor-pointer">
              <div className="flex items-center gap-4">
                <input type="checkbox" defaultChecked={channel.enabled} className="w-5 h-5 rounded border-flood-border text-flood-primary focus:ring-flood-primary" />
                <div>
                  <p className="font-medium text-flood-text">{channel.label}</p>
                  <p className="text-sm text-flood-muted">{channel.desc}</p>
                </div>
              </div>
            </label>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const mapTab = (
    <div className="space-y-6">
      <Card variant="strong">
        <CardHeader><CardTitle>Default Map View</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-flood-muted">Default Center (Lat, Lng)</label>
              <div className="flex gap-2">
                <Input placeholder="Latitude" defaultValue={settings.map.defaultCenter.lat.toString()} />
                <Input placeholder="Longitude" defaultValue={settings.map.defaultCenter.lng.toString()} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-flood-muted">Default Zoom</label>
              <Input type="number" min="1" max="19" defaultValue={settings.map.defaultZoom} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-flood-muted">Base Layer</label>
              <Select value="dark" onChange={() => {}} options={[{ value: 'dark', label: 'Dark (CARTO)' }, { value: 'light', label: 'Light (CARTO)' }, { value: 'satellite', label: 'Satellite' }]} />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-flood-bg rounded-lg">
            <div>
              <p className="font-medium text-flood-text">Show Traffic Layer</p>
              <p className="text-sm text-flood-muted">Real-time traffic overlay</p>
            </div>
            <input type="checkbox" defaultChecked={settings.map.showTraffic} className="w-5 h-5 rounded border-flood-border text-flood-primary focus:ring-flood-primary" />
          </div>
          <div className="flex items-center justify-between p-3 bg-flood-bg rounded-lg">
            <div>
              <p className="font-medium text-flood-text">Show Critical Infrastructure</p>
              <p className="text-sm text-flood-muted">Hospitals, power stations, etc.</p>
            </div>
            <input type="checkbox" defaultChecked={settings.map.showInfrastructure} className="w-5 h-5 rounded border-flood-border text-flood-primary focus:ring-flood-primary" />
          </div>
          <Button icon={<Save className="w-4 h-4" />}>Save Map Settings</Button>
        </CardContent>
      </Card>
      <Card variant="strong">
        <CardHeader><CardTitle>Default Active Layers</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {layerOptions.map(layer => (
            <label key={layer.id} className="flex items-center justify-between p-3 bg-flood-bg rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <input type="checkbox" defaultChecked={layer.enabled} className="w-5 h-5 rounded border-flood-border text-flood-primary focus:ring-flood-primary" />
                <p className="font-medium text-flood-text">{layer.label}</p>
              </div>
            </label>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const aiTab = (
    <div className="space-y-6">
      <Card variant="strong">
        <CardHeader><CardTitle>AI Model Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-flood-muted">Confidence Threshold</label>
            <div className="flex items-center gap-4">
              <input type="range" min="50" max="95" step="5" defaultValue={settings.ai.confidenceThreshold} className="flex-1 h-2 bg-flood-border rounded-lg appearance-none accent-flood-primary" />
              <input type="number" min="50" max="95" step="5" defaultValue={settings.ai.confidenceThreshold} className="input w-20 text-center font-mono" />
              <span className="text-flood-muted">%</span>
            </div>
            <p className="text-xs text-flood-muted">Minimum AI confidence for auto-actions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-3 bg-flood-bg rounded-lg">
              <div>
                <p className="font-medium text-flood-text">Auto-Create Incidents</p>
                <p className="text-sm text-flood-muted">From evidence fusion</p>
              </div>
              <input type="checkbox" defaultChecked={settings.ai.autoCreateIncidents} className="w-5 h-5 rounded border-flood-border text-flood-primary focus:ring-flood-primary" />
            </div>
            <div className="flex items-center justify-between p-3 bg-flood-bg rounded-lg">
              <div>
                <p className="font-medium text-flood-text">Auto-Assign Teams</p>
                <p className="text-sm text-flood-muted">Optimal dispatch</p>
              </div>
              <input type="checkbox" defaultChecked={settings.ai.autoAssignTeams} className="w-5 h-5 rounded border-flood-border text-flood-primary focus:ring-flood-primary" />
            </div>
            <div className="flex items-center justify-between p-3 bg-flood-bg rounded-lg">
              <div>
                <p className="font-medium text-flood-text">Verification Required</p>
                <p className="text-sm text-flood-muted">Human confirmation</p>
              </div>
              <input type="checkbox" defaultChecked={settings.ai.verificationRequired} className="w-5 h-5 rounded border-flood-border text-flood-primary focus:ring-flood-primary" />
            </div>
          </div>
          <Button icon={<Save className="w-4 h-4" />}>Save AI Settings</Button>
        </CardContent>
      </Card>
      <Card variant="strong">
        <CardHeader><CardTitle>Model Information</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {modelInfo.map(model => (
            <div key={model.name} className="flex items-center justify-between p-3 bg-flood-bg rounded-lg">
              <div>
                <p className="font-medium text-flood-text">{model.name}</p>
                <p className="text-sm text-flood-muted">v{model.version} · {model.accuracy} · Updated {model.lastUpdated}</p>
              </div>
              <Button variant="secondary" size="sm">Update</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const privacyTab = (
    <div className="space-y-6">
      <Card variant="strong">
        <CardHeader><CardTitle>Data Retention</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-flood-muted">Incident Data Retention</label>
            <div className="flex items-center gap-2">
              <input type="number" min="30" max="2555" step="30" defaultValue={settings.privacy.dataRetentionDays} className="input w-32 font-mono" />
              <span className="text-flood-muted">days</span>
            </div>
            <p className="text-xs text-flood-muted">How long to keep incident records and evidence</p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-flood-muted">Citizen Report Retention</label>
            <div className="flex items-center gap-2">
              <input type="number" min="30" max="730" step="30" defaultValue={90} className="input w-32 font-mono" />
              <span className="text-flood-muted">days</span>
            </div>
            <p className="text-xs text-flood-muted">Auto-delete unverified citizen reports</p>
          </div>
          <Button icon={<Save className="w-4 h-4" />}>Save Retention Policy</Button>
        </CardContent>
      </Card>
      <Card variant="strong">
        <CardHeader><CardTitle>Anonymization & Sharing</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-flood-bg rounded-lg">
            <div>
              <p className="font-medium text-flood-text">Anonymize Citizen Reports</p>
              <p className="text-sm text-flood-muted">Remove PII from public views</p>
            </div>
            <input type="checkbox" defaultChecked={settings.privacy.anonymizeCitizenReports} className="w-5 h-5 rounded border-flood-border text-flood-primary focus:ring-flood-primary" />
          </div>
          <div className="flex items-center justify-between p-3 bg-flood-bg rounded-lg">
            <div>
              <p className="font-medium text-flood-text">Share with Partner Agencies</p>
              <p className="text-sm text-flood-muted">NDMA, IMD, State Disaster Authority</p>
            </div>
            <input type="checkbox" defaultChecked={settings.privacy.shareWithAgencies} className="w-5 h-5 rounded border-flood-border text-flood-primary focus:ring-flood-primary" />
          </div>
          <div className="flex items-center justify-between p-3 bg-flood-bg rounded-lg">
            <div>
              <p className="font-medium text-flood-text">Audit Logging</p>
              <p className="text-sm text-flood-muted">Log all data access</p>
            </div>
            <input type="checkbox" defaultChecked={true} className="w-5 h-5 rounded border-flood-border text-flood-primary focus:ring-flood-primary" />
          </div>
          <Button icon={<Save className="w-4 h-4" />}>Save Privacy Settings</Button>
        </CardContent>
      </Card>
    </div>
  );

  const usersTab = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-flood-text">User Management</h2>
        <Button onClick={() => setShowAddUser(true)} icon={<UserPlus className="w-4 h-4" />}>Add User</Button>
      </div>
      <Card variant="strong">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-flood-border">
                <th className="px-4 py-3 text-left font-medium text-flood-muted">User</th>
                <th className="px-4 py-3 text-left font-medium text-flood-muted">Email</th>
                <th className="px-4 py-3 text-left font-medium text-flood-muted">Role</th>
                <th className="px-4 py-3 text-left font-medium text-flood-muted">Ward/Zone</th>
                <th className="px-4 py-3 text-left font-medium text-flood-muted">Status</th>
                <th className="px-4 py-3 text-left font-medium text-flood-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map(user => (
                <tr key={user.id} className="border-b border-flood-border/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-flood-primary/20 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-flood-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-flood-text">{user.name}</p>
                        {user.id === currentUser?.id && <span className="text-xs text-flood-primary">(You)</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-flood-muted">{user.email}</td>
                  <td className="px-4 py-3"><Badge variant="info" size="sm" className="capitalize">{user.role.replace('-', ' ')}</Badge></td>
                  <td className="px-4 py-3 text-sm text-flood-muted">{user.ward || '—'} / {user.zone || '—'}</td>
                  <td className="px-4 py-3"><Badge variant="success" size="sm">Active</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" icon={<Edit2 className="w-4 h-4" />} onClick={() => setEditingUser(user)}>Edit</Button>
                      {user.id !== currentUser?.id && <Button variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4" />} className="text-flood-danger hover:text-flood-danger">Remove</Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card variant="strong">
        <CardHeader><CardTitle>Role Permissions</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {rolePermissions.map(r => (
            <div key={r.role} className="p-4 bg-flood-bg rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-flood-text">{r.label}</h4>
                <Badge variant={r.role === userRole ? 'success' : 'info'} size="sm">{r.role === userRole ? 'Current' : 'Available'}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {r.perms.map((p, i) => (<Badge key={i} variant="default" size="sm">{p}</Badge>))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-flood-text">Settings</h1><p className="text-flood-muted text-sm">Configure FloodLens command center</p></div></div>
      <Tabs tabs={settingsTabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />
      {activeTab === 'general' && generalTab}
      {activeTab === 'notifications' && notificationsTab}
      {activeTab === 'map' && mapTab}
      {activeTab === 'ai' && aiTab}
      {activeTab === 'privacy' && privacyTab}
      {activeTab === 'users' && usersTab}

      <Modal isOpen={showAddUser} onClose={() => { setShowAddUser(false); setNewUser({ name: '', email: '', role: 'citizen' }); }} title="Add New User" size="md">
        <div className="space-y-4">
          <Input label="Full Name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="John Doe" required />
          <Input label="Email" type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="john@kanpur.gov.in" required />
          <Select label="Role" value={newUser.role} onChange={v => setNewUser({ ...newUser, role: v as any })} options={roleOptions} />
          <div className="flex justify-end gap-3 pt-4 border-t border-flood-border">
            <Button variant="secondary" onClick={() => setShowAddUser(false)}>Cancel</Button>
            <Button onClick={() => { setShowAddUser(false); setNewUser({ name: '', email: '', role: 'citizen' }); }}>Add User</Button>
          </div>
        </div>
      </Modal>
      {editingUser && (
        <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Edit User" size="md">
          <div className="space-y-4">
            <Input label="Full Name" defaultValue={editingUser.name} />
            <Input label="Email" type="email" defaultValue={editingUser.email} />
            <Select label="Role" value={editingUser.role} onChange={v => setEditingUser({ ...editingUser!, role: v as any })} options={roleOptions} />
            <div className="flex justify-end gap-3 pt-4 border-t border-flood-border">
              <Button variant="secondary" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button onClick={() => setEditingUser(null)}>Save Changes</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}