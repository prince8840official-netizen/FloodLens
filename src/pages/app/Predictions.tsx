import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import { 
  AlertTriangle, MapPin, Droplets, Search, 
  ChevronDown, Clock, Map, Eye, Download, BarChart,
  TrendingUp, TrendingDown, MapPin as MapPinIcon
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge, SeverityIndicator } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DataTable } from '../../components/ui/Table';
import { FloodMap } from '../../components/map/FloodMap';
import { useApp } from '../../context/AppContext';
import { mockRoads, mockIncidents, getSeverityColor, formatTime } from '../../data/mockData';
import type { Road } from '../../types';

const timeOptions = [
  { value: '30', label: 'Next 30 minutes' },
  { value: '60', label: 'Next 1 hour' },
  { value: '180', label: 'Next 3 hours' },
  { value: '360', label: 'Next 6 hours' },
];

const severityOptions = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'normal', label: 'Normal' },
];

export function Predictions() {
  const { roads, onRoadClick, activeMapLayers, mapCenter, mapZoom, onMapClick, setActiveMapLayers } = useApp();
  const [timeFilter, setTimeFilter] = useState('60');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoads = useMemo(() => roads.filter(road => {
    const matchesTime = timeFilter === 'all' || road.expectedOnset <= parseInt(timeFilter);
    const matchesSeverity = severityFilter === 'all' || road.severity === severityFilter;
    const matchesSearch = searchQuery === '' || road.name.toLowerCase().includes(searchQuery.toLowerCase()) || road.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTime && matchesSeverity && matchesSearch;
  }).sort((a, b) => b.probability - a.probability), [roads, timeFilter, severityFilter, searchQuery]);

  const handleLayerToggle = (layerId: string) => setActiveMapLayers(prev => prev.includes(layerId) ? prev.filter(l => l !== layerId) : [...prev, layerId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-flood-text">Flood Predictions</h1><p className="text-flood-muted text-sm">AI-powered road-level nowcasting — next 6 hours</p></div><Button variant="secondary" icon={<Download className="w-4 h-4" />}>Export CSV</Button></div>
      <Card variant="strong"><CardContent className="p-4"><div className="flex flex-wrap gap-4 items-end"><div className="flex-1 min-w-[180px]"><label className="block text-sm font-medium text-flood-muted mb-1">Time Horizon</label><Select value={timeFilter} onChange={e => setTimeFilter(e.target.value)} options={timeOptions} placeholder="Select time" /></div><div className="flex-1 min-w-[180px]"><label className="block text-sm font-medium text-flood-muted mb-1">Severity</label><Select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} options={severityOptions} placeholder="Select severity" /></div><div className="flex-1 min-w-[200px]"><label className="block text-sm font-medium text-flood-muted mb-1">Search Road</label><Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search road name or ID..." /></div></div></CardContent></Card>
      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-6">
          <Card variant="strong" className="overflow-hidden"><div className="p-4 border-b border-flood-border"><h2 className="font-semibold text-flood-text">Risk Map</h2></div><CardContent className="p-0"><FloodMap roads={roads} drains={[]} incidents={mockIncidents} teams={[]} cameras={[]} activeLayers={activeMapLayers} center={mapCenter} zoom={mapZoom} onRoadClick={onRoadClick} onDrainClick={() => {}} onIncidentClick={() => {}} onTeamClick={() => {}} onCameraClick={() => {}} onMapClick={onMapClick} height="480px" /></CardContent></Card>
          <Card variant="strong"><div className="p-4 border-b border-flood-border flex items-center justify-between"><h2 className="font-semibold text-flood-text">Road Risk Table</h2><span className="text-sm text-flood-muted">{filteredRoads.length} roads</span></div><CardContent className="p-0"><DataTable columns={[{ key: 'id', header: 'Road', render: (row: Road) => <div><span className="font-mono text-xs text-flood-primary">{row.id}</span><p className="text-sm text-flood-muted">{row.name}</p></div> }, { key: 'probability', header: 'Probability', render: (row: Road) => <div className="flex items-center gap-2"><span className="font-mono font-bold" style={{ color: getSeverityColor(row.severity) }}>{row.probability}%</span><div className="w-24 h-1.5 bg-flood-border rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${row.probability}%`, backgroundColor: getSeverityColor(row.severity) }} /></div></div> }, { key: 'expectedOnset', header: 'Expected Onset', render: (row: Road) => <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-flood-muted" /><span className="font-mono">{formatTime(row.expectedOnset)}</span></div> }, { key: 'severity', header: 'Severity', render: (row: Road) => <StatusBadge status={row.severity} /> }, { key: 'probableCause', header: 'Probable Cause', render: (row: Road) => <div><span className="text-sm">{row.probableCause}</span><p className="text-xs text-flood-muted">{row.causeConfidence}% confidence</p></div> }, { key: 'aiConfidence', header: 'AI Confidence', render: (row: Road) => <span className="font-mono">{row.aiConfidence}%</span> }]} data={filteredRoads} keyExtractor={row => row.id} onRowClick={onRoadClick} hoverable emptyMessage="No roads match current filters" /></CardContent></Card>
        </div>
        <div className="space-y-6">
          <Card variant="strong"><div className="p-4 border-b border-flood-border"><h2 className="font-semibold text-flood-text">Time Forecast</h2></div><CardContent className="p-4 space-y-4">{timeOptions.slice(0, 4).map((opt, i) => { const count = roads.filter(r => r.expectedOnset <= parseInt(opt.value) && r.severity !== 'normal').length; const critical = roads.filter(r => r.expectedOnset <= parseInt(opt.value) && r.severity === 'critical').length; return <div key={opt.value} className="flex items-center justify-between p-3 rounded-lg bg-flood-bg"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: i === 0 ? '#ef4444' : i === 1 ? '#f97316' : i === 2 ? '#fbbf24' : '#06b6d4' }}>{opt.value === '30' ? '30m' : opt.value === '60' ? '1h' : opt.value === '180' ? '3h' : '6h'}</div><div><p className="font-medium text-flood-text">{opt.label}</p><p className="text-xs text-flood-muted">{count} roads at risk</p></div></div><div className="text-right"><p className="text-2xl font-bold text-flood-danger">{critical}</p><p className="text-xs text-flood-muted">Critical</p></div></div> })}</CardContent></Card>
          <Card variant="strong"><div className="p-4 border-b border-flood-border"><h2 className="font-semibold text-flood-text">Risk Distribution</h2></div><CardContent className="p-4 space-y-3">{['critical', 'high', 'moderate', 'normal'].map(sev => { const count = roads.filter(r => r.severity === sev).length; return <div key={sev} className="flex items-center justify-between"><div className="flex items-center gap-3"><SeverityIndicator severity={sev as any} showLabel={true} size="sm" /><span className="text-sm font-medium text-flood-text">{sev.charAt(0).toUpperCase() + sev.slice(1)}</span></div><div className="flex items-center gap-3"><div className="w-32 h-2 bg-flood-border rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(count / roads.length) * 100}%`, backgroundColor: getSeverityColor(sev as any) }} /></div><span className="font-mono text-sm w-10 text-right">{count}</span></div></div> })}</CardContent></Card>
        </div>
      </div>
    </div>
  );
}