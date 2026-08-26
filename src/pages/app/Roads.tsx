import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { 
  Route, Search, AlertTriangle, MapPin, 
  ChevronDown, Clock, Map, Eye, Download, BarChart,
  TrendingUp, Database, Wrench
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge, SeverityIndicator } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DataTable } from '../../components/ui/Table';
import { FloodMap } from '../../components/map/FloodMap';
import { useApp } from '../../context/AppContext';
import { mockRoads, mockDrains, getSeverityColor, formatTime } from '../../data/mockData';
import type { Road } from '../../types';

const severityOptions = [
  { value: 'all', label: 'All' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'normal', label: 'Normal' },
];

export function Roads() {
  const { roads, onRoadClick, activeMapLayers, mapCenter, mapZoom, onMapClick } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filteredRoads = roads.filter(road => {
    const matchesSeverity = severityFilter === 'all' || road.severity === severityFilter;
    const matchesSearch = searchQuery === '' || 
      road.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      road.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      road.ward.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  }).sort((a, b) => b.floodScore - a.floodScore);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-flood-text">Road Intelligence</h1>
          <p className="text-flood-muted text-sm">Flood risk scoring for all monitored road segments</p>
        </div>
      </div>

      <Card variant="strong"><CardContent className="p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[250px]"><label className="block text-sm font-medium text-flood-muted mb-1">Search Roads</label><Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name, ID, or ward..." /></div>
          <div className="min-w-[160px]"><label className="block text-sm font-medium text-flood-muted mb-1">Severity</label><Select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} options={severityOptions} placeholder="All" /></div>
        </div>
      </CardContent></Card>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <Card variant="strong" className="overflow-hidden"><div className="p-4 border-b border-flood-border"><h2 className="font-semibold text-flood-text">Road Risk Map</h2></div><CardContent className="p-0">
          <FloodMap roads={roads} drains={mockDrains.filter(d => d.type === 'storm-drain')} incidents={[]} teams={[]} cameras={[]} activeLayers={['flooded-roads', 'flood-predictions', 'drainage-network']} center={mapCenter} zoom={mapZoom} onRoadClick={onRoadClick} onDrainClick={() => {}} onIncidentClick={() => {}} onTeamClick={() => {}} onCameraClick={() => {}} onMapClick={onMapClick} height="500px" />
        </CardContent></Card>

        <div className="space-y-6">
          <Card variant="strong"><CardContent className="p-4"><h3 className="font-semibold text-flood-text mb-3">Flood Score Breakdown</h3><div className="space-y-3">
            {['Rainfall Risk', 'Drainage Stress', 'Terrain', 'Historical Risk', 'Visual Evidence', 'Sensor Evidence'].map((factor, i) => {
              const avg = mockRoads.reduce((sum, r) => sum + (r as any)[factor.toLowerCase().replace(' ', '')] || 0, 0) / mockRoads.length;
              return <div key={factor} className="flex items-center gap-3"><span className="w-36 text-sm text-flood-muted">{factor}</span><div className="flex-1 h-2 bg-flood-border rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${avg}%`, backgroundColor: avg > 70 ? '#ef4444' : avg > 50 ? '#f97316' : avg > 30 ? '#fbbf24' : '#06b6d4' }} /></div><span className="font-mono text-sm w-10 text-right">{Math.round(avg)}</span></div>;
            })}
          </div></CardContent></Card>
          <Card variant="strong"><CardContent className="p-4"><h3 className="font-semibold text-flood-text mb-3">Risk Distribution</h3><div className="space-y-3">
            {['critical', 'high', 'moderate', 'normal'].map(sev => {
              const count = roads.filter(r => r.severity === sev).length;
              return <div key={sev} className="flex items-center justify-between"><SeverityIndicator severity={sev as any} showLabel={true} size="sm" /><div className="flex items-center gap-3 flex-1"><div className="flex-1 h-2 bg-flood-border rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(count / roads.length) * 100}%`, backgroundColor: getSeverityColor(sev as any) }} /></div><span className="font-mono text-sm w-10 text-right">{count}</span></div></div>;
            })}
          </div></CardContent></Card>
        </div>
      </div>

      <Card variant="strong"><div className="p-4 border-b border-flood-border flex items-center justify-between"><h2 className="font-semibold text-flood-text">Road Risk Table</h2><span className="text-sm text-flood-muted">{filteredRoads.length} roads</span></div><CardContent className="p-0">
        <DataTable columns={[
          { key: 'id', header: 'Road', render: (row: Road) => <Link to={`/roads/${row.id}`} className="font-mono text-xs text-flood-primary hover:underline">{row.id}</Link> },
          { key: 'name', header: 'Name' },
          { key: 'floodScore', header: 'Flood Score', render: (row: Road) => <div className="flex items-center gap-2"><span className="font-bold" style={{ color: getSeverityColor(row.severity) }}>{row.floodScore}</span><div className="w-20 h-1.5 bg-flood-border rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${row.floodScore}%`, backgroundColor: getSeverityColor(row.severity) }} /></div></div> },
          { key: 'probability', header: 'Probability', render: (row: Road) => <span className="font-mono">{row.probability}%</span> },
          { key: 'expectedOnset', header: 'Onset', render: (row: Road) => <span className="font-mono">{formatTime(row.expectedOnset)}</span> },
          { key: 'severity', header: 'Severity', render: (row: Road) => <StatusBadge status={row.severity} /> },
          { key: 'drainStress', header: 'Drain Stress', render: (row: Road) => <span className="font-mono">{row.drainStress}%</span> },
          { key: 'historicalIncidents', header: 'History', render: (row: Road) => <span className="font-mono">{row.historicalIncidents}</span> },
          { key: 'status', header: 'Status', render: (row: Road) => row.severity === 'critical' ? <Badge variant="critical" size="sm">Action Required</Badge> : row.severity === 'high' ? <Badge variant="high" size="sm">Monitor</Badge> : <Badge variant="normal" size="sm">Normal</Badge> },
        ]} data={filteredRoads} keyExtractor={row => row.id} onRowClick={onRoadClick} hoverable emptyMessage="No roads match current filters" />
      </CardContent></Card>
    </div>
  );
}

import { useState } from 'react';