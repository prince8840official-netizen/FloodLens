import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { 
  GitBranch, Search, AlertTriangle, MapPin, 
  ChevronDown, Clock, Map, Eye, Download, Wrench,
  Droplets, Database, TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge, SeverityIndicator } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DataTable } from '../../components/ui/Table';
import { FloodMap } from '../../components/map/FloodMap';
import { useApp } from '../../context/AppContext';
import { mockDrains, mockRoads, mockIncidents, mockCameraFeeds, getSeverityColor, formatTime } from '../../data/mockData';
import type { Drain } from '../../types';

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'storm-drain', label: 'Storm Drains' },
  { value: 'manhole', label: 'Manholes' },
  { value: 'pump-station', label: 'Pump Stations' },
  { value: 'outfall', label: 'Outfalls' },
];

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'normal', label: 'Normal' },
  { value: 'stressed', label: 'Stressed' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'maintenance', label: 'Maintenance' },
];

export function Drainage() {
  const { drains, onDrainClick, activeMapLayers, mapCenter, mapZoom, onMapClick } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredDrains = useMemo(() => drains.filter(drain => {
    const matchesType = typeFilter === 'all' || drain.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || drain.status === statusFilter;
    const matchesSearch = searchQuery === '' || drain.name.toLowerCase().includes(searchQuery.toLowerCase()) || drain.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  }).sort((a, b) => b.capacity - a.capacity), [drains, typeFilter, statusFilter, searchQuery]);

  const blockedDrains = drains.filter(d => d.status === 'blocked' || d.blockageProbability > 70);
  const stressedDrains = drains.filter(d => d.status === 'stressed');
  const normalDrains = drains.filter(d => d.status === 'normal');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-flood-text">Drainage Digital Twin</h1><p className="text-flood-muted text-sm">Real-time drainage network monitoring & analysis</p></div></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card variant="hover" className="text-center p-4 border-l-4 border-flood-critical"><div className="text-3xl font-bold text-flood-critical">{blockedDrains.length}</div><div className="text-sm text-flood-muted">Blocked Drains</div></Card>
        <Card variant="hover" className="text-center p-4 border-l-4 border-flood-warning"><div className="text-3xl font-bold text-flood-warning">{stressedDrains.length}</div><div className="text-sm text-flood-muted">Stressed</div></Card>
        <Card variant="hover" className="text-center p-4 border-l-4 border-flood-primary"><div className="text-3xl font-bold text-flood-primary">{normalDrains.length}</div><div className="text-sm text-flood-muted">Normal</div></Card>
        <Card variant="hover" className="text-center p-4 border-l-4 border-flood-success"><div className="text-3xl font-bold text-flood-success">{drains.filter(d => d.type === 'pump-station').length}</div><div className="text-sm text-flood-muted">Pump Stations</div></Card>
      </div>

      <Card variant="strong"><CardContent className="p-4"><div className="flex flex-wrap gap-4 items-end"><div className="flex-1 min-w-[250px]"><label className="block text-sm font-medium text-flood-muted mb-1">Search Drains</label><Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name or ID..." /></div><div className="min-w-[160px]"><label className="block text-sm font-medium text-flood-muted mb-1">Type</label><Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} options={typeOptions} placeholder="All" /></div><div className="min-w-[160px]"><label className="block text-sm font-medium text-flood-muted mb-1">Status</label><Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={statusOptions} placeholder="All" /></div></div></CardContent></Card>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <Card variant="strong" className="overflow-hidden"><div className="p-4 border-b border-flood-border"><h2 className="font-semibold text-flood-text">Drainage Network Map</h2></div><CardContent className="p-0"><FloodMap roads={[]} drains={drains} incidents={mockIncidents} teams={[]} cameras={mockCameraFeeds} activeLayers={['drainage-network', 'blocked-drains', 'water-sensors', 'critical-infra']} center={mapCenter} zoom={mapZoom} onRoadClick={() => {}} onDrainClick={onDrainClick} onIncidentClick={() => {}} onTeamClick={() => {}} onCameraClick={() => {}} onMapClick={onMapClick} height="500px" /></CardContent></Card>

        <div className="space-y-6">
          <Card variant="strong"><div className="p-4 border-b border-flood-border"><h2 className="font-semibold text-flood-text">Drain Status Overview</h2></div><CardContent className="p-4 space-y-3">{filteredDrains.map(drain => (<div key={drain.id} className="flex items-center justify-between p-3 bg-flood-bg rounded-lg hover:bg-flood-card/50 cursor-pointer" onClick={() => onDrainClick(drain)}><div className="flex items-center gap-3"><span className="font-mono text-xs text-flood-primary">{drain.id}</span><span className="text-sm font-medium">{drain.name}</span></div><div className="flex items-center gap-2"><StatusBadge status={drain.status} size="sm" /><span className="font-mono text-sm">{drain.capacity}%</span></div></div>))}</CardContent></Card>

          <Card variant="strong"><CardContent className="p-4"><h3 className="font-semibold text-flood-text mb-3">Quick Actions</h3><div className="space-y-2"><Button className="w-full justify-start" icon={<Wrench className="w-4 h-4" />}>Schedule Maintenance</Button><Button variant="secondary" className="w-full justify-start" icon={<AlertTriangle className="w-4 h-4" />}>View Blocked Drains</Button><Button variant="secondary" className="w-full justify-start" icon={<Droplets className="w-4 h-4" />}>Check Pump Stations</Button><Button variant="secondary" className="w-full justify-start" icon={<Download className="w-4 h-4" />}>Export Network Report</Button></div></CardContent></Card>
        </div>
      </div>

      <Card variant="strong"><div className="p-4 border-b border-flood-border"><h2 className="font-semibold text-flood-text">Drainage Network Table</h2></div><CardContent className="p-0"><DataTable columns={[{ key: 'id', header: 'ID', render: (row: Drain) => <Link to={`/drainage/${row.id}`} className="font-mono text-xs text-flood-primary hover:underline">{row.id}</Link> }, { key: 'name', header: 'Name' }, { key: 'type', header: 'Type', render: (row: Drain) => <Badge variant="default" size="sm" className="capitalize">{row.type.replace('-', ' ')}</Badge> }, { key: 'capacity', header: 'Capacity %', render: (row: Drain) => <span className="font-mono" style={{ color: row.capacity > 70 ? '#ef4444' : row.capacity > 50 ? '#f97316' : '#06b6d4' }}>{row.capacity}%</span> }, { key: 'blockageProbability', header: 'Blockage %', render: (row: Drain) => <span className="font-mono" style={{ color: row.blockageProbability > 70 ? '#ef4444' : row.blockageProbability > 40 ? '#f97316' : '#22c55e' }}>{row.blockageProbability}%</span> }, { key: 'flowRate', header: 'Flow (L/s)', render: (row: Drain) => <span className="font-mono">{row.flowRate}</span> }, { key: 'depth', header: 'Depth (m)', render: (row: Drain) => <span className="font-mono">{row.depth}</span> }, { key: 'status', header: 'Status', render: (row: Drain) => <StatusBadge status={row.status} size="sm" /> }, { key: 'priority', header: 'Priority', render: (row: Drain) => <Badge variant={row.priority === 'P1' ? 'critical' : row.priority === 'P2' ? 'high' : 'moderate'} size="sm">{row.priority}</Badge> }, { key: 'lastMaintenance', header: 'Last Maint.', render: (row: Drain) => <span className="font-mono">{row.lastMaintenance}d ago</span> }, { key: 'historicalIncidents', header: 'Incidents', render: (row: Drain) => <span className="font-mono">{row.historicalIncidents}</span> }, { key: 'connectedRoads', header: 'Roads', render: (row: Drain) => <span className="font-mono text-xs">{row.connectedRoads.join(', ')}</span> }]} data={drains} keyExtractor={row => row.id} onRowClick={onDrainClick} hoverable /></CardContent></Card>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';