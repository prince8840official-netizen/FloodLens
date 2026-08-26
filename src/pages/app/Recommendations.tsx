import { useState } from 'react';
import { clsx } from 'clsx';
import { 
  Lightbulb, AlertTriangle, MapPin, Truck, Wrench,
  Search, Filter, ChevronDown, CheckCircle, XCircle,
  Clock, Eye, Download, Flag, Brain, Zap, TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { useApp } from '../../context/AppContext';
import { mockRecommendations, mockTeams, mockRoads, mockDrains, formatTime, formatDistance } from '../../data/mockData';
import type { AIRecommendation } from '../../types';

const priorityOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'drainage', label: 'Drainage' },
  { value: 'traffic', label: 'Traffic' },
  { value: 'preventive', label: 'Preventive' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'maintenance', label: 'Maintenance' },
];

const priorityIcons = { critical: AlertTriangle, high: MapPin, medium: Wrench, low: Clock };

export function Recommendations() {
  const { recommendations, assignTeamToIncident, onIncidentClick } = useApp();
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRec, setSelectedRec] = useState<AIRecommendation | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  const filteredRecs = recommendations.filter(rec => {
    const matchesPriority = priorityFilter === 'all' || rec.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || rec.category === categoryFilter;
    const matchesSearch = searchQuery === '' || rec.title.toLowerCase().includes(searchQuery.toLowerCase()) || rec.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesCategory && matchesSearch;
  });

  const criticalCount = recommendations.filter(r => r.priority === 'critical').length;
  const highCount = recommendations.filter(r => r.priority === 'high').length;

  const recItems = filteredRecs.map((rec, i) => (
    <Card key={rec.id} variant="hover" className={clsx('border-l-4', rec.priority === 'critical' && 'border-flood-critical', rec.priority === 'high' && 'border-flood-danger', rec.priority === 'medium' && 'border-flood-warning', rec.priority === 'low' && 'border-flood-primary')}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: rec.priority === 'critical' ? '#f97316' : rec.priority === 'high' ? '#ef4444' : rec.priority === 'medium' ? '#fbbf24' : '#06b6d4' }}>
                {(() => { const PriorityIcon = priorityIcons[rec.priority]; return <PriorityIcon className="w-5 h-5" />; })()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-flood-text">{rec.title}</h3>
                  <Badge variant={rec.priority === 'critical' ? 'critical' : rec.priority === 'high' ? 'high' : rec.priority === 'medium' ? 'moderate' : 'normal'} size="sm">{rec.priority.toUpperCase()}</Badge>
                  <Badge variant="info" size="sm" className="capitalize">{rec.category}</Badge>
                  <Badge variant="default" size="sm">{rec.confidence}% confidence</Badge>
                </div>
              </div>
            </div>
            <p className="text-flood-muted mb-2">{rec.description}</p>
            <div className="flex items-center gap-2 text-sm text-flood-muted mb-3"><Brain className="w-4 h-4" /><span>{rec.reason}</span></div>
            <div className="flex items-center gap-2 text-sm"><Wrench className="w-4 h-4 text-flood-primary" /><span className="font-medium text-flood-text">Action: </span><span className="text-flood-muted">{rec.action}</span></div>
            <div className="flex items-center gap-2 text-sm mt-1"><MapPin className="w-4 h-4 text-flood-muted" /><span className="text-flood-muted">Affected: {rec.affectedAssets.join(', ')}</span></div>
            <div className="flex items-center gap-2 text-sm mt-1"><TrendingUp className="w-4 h-4 text-flood-success" /><span className="text-flood-muted">Impact: {rec.estimatedImpact}</span></div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button size="sm" variant={rec.priority === 'critical' ? 'danger' : rec.priority === 'high' ? 'primary' : 'secondary'} onClick={() => { setSelectedRec(rec); setShowActionModal(true); }} icon={<CheckCircle className="w-4 h-4" />}>{rec.category === 'traffic' ? 'Review Route' : rec.category === 'preventive' ? 'Schedule' : 'Create Task'}</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedRec(rec)} icon={<Eye className="w-4 h-4" />}>Details</Button>
            <Button size="sm" variant="ghost" icon={<XCircle className="w-4 h-4" />}>Dismiss</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-flood-text">AI Response Intelligence</h1>
          <p className="text-flood-muted text-sm">Automated priority actions based on real-time evidence fusion</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-flood-muted">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-flood-critical animate-pulse" /> {criticalCount} Critical</span>
          <span className="flex items-center gap-1 ml-4"><span className="w-2 h-2 rounded-full bg-flood-danger" /> {highCount} High</span>
        </div>
      </div>

      <Card variant="strong"><CardContent className="p-4"><div className="flex flex-wrap gap-4 items-end"><div className="flex-1 min-w-[250px]"><label className="block text-sm font-medium text-flood-muted mb-1">Search</label><Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search recommendations..." /></div><div className="min-w-[160px]"><label className="block text-sm font-medium text-flood-muted mb-1">Priority</label><Select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} options={priorityOptions} placeholder="All" /></div><div className="min-w-[160px]"><label className="block text-sm font-medium text-flood-muted mb-1">Category</label><Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} options={categoryOptions} placeholder="All" /></div></div></CardContent></Card>

      <div className="space-y-4">{filteredRecs.map((rec, i) => (
        <Card key={rec.id} variant="hover" className={clsx('border-l-4', rec.priority === 'critical' && 'border-flood-critical', rec.priority === 'high' && 'border-flood-danger', rec.priority === 'medium' && 'border-flood-warning', rec.priority === 'low' && 'border-flood-primary')}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: rec.priority === 'critical' ? '#f97316' : rec.priority === 'high' ? '#ef4444' : rec.priority === 'medium' ? '#fbbf24' : '#06b6d4' }}>
                    {(() => { const PriorityIcon = priorityIcons[rec.priority]; return <PriorityIcon className="w-5 h-5" />; })()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-flood-text">{rec.title}</h3>
                      <Badge variant={rec.priority === 'critical' ? 'critical' : rec.priority === 'high' ? 'high' : rec.priority === 'medium' ? 'moderate' : 'normal'} size="sm">{rec.priority.toUpperCase()}</Badge>
                      <Badge variant="info" size="sm" className="capitalize">{rec.category}</Badge>
                      <Badge variant="default" size="sm">{rec.confidence}% confidence</Badge>
                    </div>
                  </div>
                </div>
                <p className="text-flood-muted mb-2">{rec.description}</p>
                <div className="flex items-center gap-2 text-sm text-flood-muted mb-3"><Brain className="w-4 h-4" /><span>{rec.reason}</span></div>
                <div className="flex items-center gap-2 text-sm"><Wrench className="w-4 h-4 text-flood-primary" /><span className="font-medium text-flood-text">Action: </span><span className="text-flood-muted">{rec.action}</span></div>
                <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-flood-muted" /><span className="text-flood-muted">Affected: {rec.affectedAssets.join(', ')}</span></div>
                <div className="flex items-center gap-2 text-sm mt-1"><TrendingUp className="w-4 h-4 text-flood-success" /><span className="text-flood-muted">Impact: {rec.estimatedImpact}</span></div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Button size="sm" variant={rec.priority === 'critical' ? 'danger' : rec.priority === 'high' ? 'primary' : 'secondary'} onClick={() => { setSelectedRec(rec); setShowActionModal(true); }} icon={<CheckCircle className="w-4 h-4" />}>{rec.category === 'traffic' ? 'Review Route' : rec.category === 'preventive' ? 'Schedule' : 'Create Task'}</Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedRec(rec)} icon={<Eye className="w-4 h-4" />}>Details</Button>
                <Button size="sm" variant="ghost" icon={<XCircle className="w-4 h-4" />}>Dismiss</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}{filteredRecs.length === 0 && <Card variant="hover" className="text-center py-12"><Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50 text-flood-muted" /><p className="text-flood-muted">No recommendations match current filters</p></Card>}</div>

      <Modal isOpen={showActionModal} onClose={() => { setShowActionModal(false); setSelectedRec(null); }} title="Execute Recommendation" size="md">{selectedRec && <div className="space-y-4"><div className="p-4 bg-flood-bg rounded-lg"><h4 className="font-semibold text-flood-text mb-1">{selectedRec.title}</h4><p className="text-sm text-flood-muted">{selectedRec.description}</p><div className="mt-3 grid grid-cols-2 gap-2 text-sm"><div><p className="text-flood-muted">Priority</p><Badge variant={selectedRec.priority === 'critical' ? 'critical' : selectedRec.priority === 'high' ? 'high' : 'moderate'}>{selectedRec.priority}</Badge></div><div><p className="text-flood-muted">Confidence</p><p className="font-bold">{selectedRec.confidence}%</p></div><div><p className="text-flood-muted">Category</p><Badge variant="info" className="capitalize">{selectedRec.category}</Badge></div><div><p className="text-flood-muted">Assets</p><p className="font-mono text-xs">{selectedRec.affectedAssets.join(', ')}</p></div></div></div><div className="p-4 bg-flood-primary/10 rounded-lg border border-flood-primary/30"><p className="text-sm text-flood-primary"><strong>Action:</strong> {selectedRec.action}</p><p className="text-sm text-flood-primary mt-1"><strong>Reason:</strong> {selectedRec.reason}</p></div>{selectedRec.category === 'drainage' && selectedRec.affectedAssets.some(a => a.startsWith('D-')) && <div className="space-y-2"><p className="text-sm text-flood-muted">Assign team to inspect drain:</p><select className="input" defaultValue=""><option value="">Select team...</option>{mockTeams.filter(t => t.type === 'drainage' && t.status === 'idle').map(t => <option key={t.id} value={t.id}>{t.name} — {formatDistance(t.distance)} away, ETA {formatTime(t.eta)}</option>)}</select></div>}<div className="flex justify-end gap-3 pt-4 border-t border-flood-border"><Button variant="secondary" onClick={() => setShowActionModal(false)}>Cancel</Button><Button onClick={() => { setShowActionModal(false); setSelectedRec(null); }}>Execute Action</Button></div></div>}</Modal>
    </div>
  );
}

import { useState } from 'react';