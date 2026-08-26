import { useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { 
  Clock, MapPin, AlertTriangle, Search, Filter, 
  ChevronDown, Calendar, Download, BarChart,
  TrendingUp, TrendingDown, Map, Eye, Wrench
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DataTable } from '../../components/ui/Table';
import { FloodMap } from '../../components/map/FloodMap';
import { ChartContainer, HorizontalBarChart, DonutChart } from '../../components/charts/Charts';
import { useApp } from '../../context/AppContext';
import { mockHistory, mockRoads, mockDrains, mockIncidents, getSeverityColor, formatTime, formatCurrency } from '../../data/mockData';
import type { HistoricalIncident } from '../../types';

const yearOptions = [
  { value: 'all', label: 'All Years' },
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
  { value: '2024', label: '2024' },
];

const severityOptions = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'normal', label: 'Normal' },
];

const causeOptions = [
  { value: 'all', label: 'All Causes' },
  { value: 'Drainage Blockage', label: 'Drainage Blockage' },
  { value: 'Drainage Overload', label: 'Drainage Overload' },
  { value: 'Heavy Rainfall', label: 'Heavy Rainfall' },
  { value: 'Pump Failure', label: 'Pump Failure' },
];

export function History() {
  const { history, roads, drains, onRoadClick, activeMapLayers, mapCenter, mapZoom, onMapClick } = useApp();
  const [yearFilter, setYearFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [causeFilter, setCauseFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = useMemo(() => history.filter(h => {
    const matchesYear = yearFilter === 'all' || new Date(h.date).getFullYear().toString() === yearFilter;
    const matchesSeverity = severityFilter === 'all' || h.severity === severityFilter;
    const matchesCause = causeFilter === 'all' || h.cause === causeFilter;
    const matchesSearch = searchQuery === '' || h.roadName.toLowerCase().includes(searchQuery.toLowerCase()) || h.ward.toLowerCase().includes(searchQuery.toLowerCase()) || h.cause.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesYear && matchesSeverity && matchesCause && matchesSearch;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [history, yearFilter, severityFilter, causeFilter, searchQuery]);

  const hotspots = useMemo(() => {
    const counts: Record<string, { count: number; roadName: string; ward: string; severity: any }> = {};
    history.forEach(h => { if (!counts[h.roadId]) counts[h.roadId] = { count: 0, roadName: h.roadName, ward: h.ward, severity: h.severity }; counts[h.roadId].count++; if (h.severity === 'critical' || (h.severity === 'high' && counts[h.roadId].severity !== 'critical')) counts[h.roadId].severity = h.severity; });
    return Object.entries(counts).map(([roadId, data]) => ({ roadId, ...data })).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [history]);

  const totalIncidents = history.length;
  const totalDamage = history.reduce((sum, h) => sum + h.damage, 0);
  const avgResponseTime = history.reduce((sum, h) => sum + h.responseTime, 0) / history.length;
  const avgResolutionTime = history.reduce((sum, h) => sum + h.resolutionTime, 0) / history.length;
  const criticalCount = history.filter(h => h.severity === 'critical').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-flood-text">Historical Flood Intelligence</h1><p className="text-flood-muted text-sm">Learn from the past to predict the future</p></div><Button variant="secondary" icon={<Download className="w-4 h-4" />}>Export History</Button></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card variant="hover" className="text-center p-4 border-l-4 border-flood-primary"><div className="text-3xl font-bold text-flood-text">{totalIncidents}</div><div className="text-sm text-flood-muted">Total Incidents</div></Card>
        <Card variant="hover" className="text-center p-4 border-l-4 border-flood-critical"><div className="text-3xl font-bold text-flood-critical">{criticalCount}</div><div className="text-sm text-flood-muted">Critical Events</div></Card>
        <Card variant="hover" className="text-center p-4 border-l-4 border-flood-warning"><div className="text-3xl font-bold text-flood-warning">{formatCurrency(totalDamage)}</div><div className="text-sm text-flood-muted">Total Damage</div></Card>
        <Card variant="hover" className="text-center p-4 border-l-4 border-flood-success"><div className="text-3xl font-bold text-flood-success">{avgResponseTime.toFixed(0)}min</div><div className="text-sm text-flood-muted">Avg Response</div></Card>
      </div>

      <Card variant="strong"><CardContent className="p-4"><div className="flex flex-wrap gap-4 items-end"><div className="flex-1 min-w-[180px]"><label className="block text-sm font-medium text-flood-muted mb-1">Year</label><Select value={yearFilter} onChange={e => setYearFilter(e.target.value)} options={yearOptions} placeholder="All" /></div><div className="min-w-[160px]"><label className="block text-sm font-medium text-flood-muted mb-1">Severity</label><Select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} options={severityOptions} placeholder="All" /></div><div className="min-w-[180px]"><label className="block text-sm font-medium text-flood-muted mb-1">Cause</label><Select value={causeFilter} onChange={e => setCauseFilter(e.target.value)} options={causeOptions} placeholder="All" /></div><div className="flex-1 min-w-[200px]"><label className="block text-sm font-medium text-flood-muted mb-1">Search</label><Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search road, ward, cause..." /></div></div></CardContent></Card>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-6">
          <Card variant="strong" className="overflow-hidden"><div className="p-4 border-b border-flood-border"><h2 className="font-semibold text-flood-text">Historical Flood Map</h2></div><CardContent className="p-0"><FloodMap roads={roads} drains={drains} incidents={mockIncidents.filter(i => i.status === 'resolved')} teams={[]} cameras={[]} activeLayers={['flooded-roads', 'drainage-network']} center={mapCenter} zoom={mapZoom} onRoadClick={onRoadClick} onDrainClick={() => {}} onIncidentClick={() => {}} onTeamClick={() => {}} onCameraClick={() => {}} onMapClick={onMapClick} height="400px" /></CardContent></Card>
          <Card variant="strong"><div className="p-4 border-b border-flood-border flex items-center justify-between"><h2 className="font-semibold text-flood-text">Incident History</h2><span className="text-sm text-flood-muted">{filteredHistory.length} records</span></div><CardContent className="p-0"><DataTable columns={[{ key: 'date', header: 'Date', render: (row: HistoricalIncident) => <span className="font-mono text-sm">{new Date(row.date).toLocaleDateString()}</span> }, { key: 'roadName', header: 'Road', render: (row: HistoricalIncident) => <span>{row.roadName} ({row.ward})</span> }, { key: 'severity', header: 'Severity', render: (row: HistoricalIncident) => <StatusBadge status={row.severity} size="sm" /> }, { key: 'duration', header: 'Duration', render: (row: HistoricalIncident) => <span className="font-mono">{formatTime(Math.round(row.duration * 60))}</span> }, { key: 'cause', header: 'Cause' }, { key: 'rainfall', header: 'Rainfall', render: (row: HistoricalIncident) => <span className="font-mono">{row.rainfall} mm</span> }, { key: 'responseTime', header: 'Response', render: (row: HistoricalIncident) => <span className="font-mono">{formatTime(Math.round(row.responseTime))}</span> }, { key: 'resolutionTime', header: 'Resolution', render: (row: HistoricalIncident) => <span className="font-mono">{formatTime(Math.round(row.resolutionTime))}</span> }, { key: 'damage', header: 'Damage', render: (row: HistoricalIncident) => <span className="font-mono">{formatCurrency(row.damage)}</span> }]} data={filteredHistory} keyExtractor={row => row.id} hoverable emptyMessage="No historical incidents match current filters" /></CardContent></Card>
        </div>

        <div className="space-y-6">
          <Card variant="strong"><CardHeader><CardTitle>Top Recurring Flood Hotspots</CardTitle></CardHeader><CardContent className="p-0"><div className="divide-y divide-flood-border/50">{hotspots.map((hotspot, i) => (<div key={hotspot.roadId} className="p-4 hover:bg-flood-card/50 flex items-center justify-between"><div className="flex items-center gap-4"><div className="w-8 h-8 rounded-full bg-flood-primary/20 flex items-center justify-center text-flood-primary font-bold text-sm">{i + 1}</div><div><p className="font-medium text-flood-text">{hotspot.roadName}</p><p className="text-sm text-flood-muted">{hotspot.ward} · {hotspot.count} incidents</p></div></div><div className="text-right"><StatusBadge status={hotspot.severity} size="sm" /><p className="text-xs text-flood-muted mt-1">Priority: {hotspot.count > 10 ? 'P1' : hotspot.count > 5 ? 'P2' : 'P3'}</p></div></div>))}</div></CardContent></Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <ChartContainer title="Incidents by Cause" subtitle="Historical root cause distribution" height={300}><DonutChart data={[{ name: 'Drainage Blockage', value: history.filter(h => h.cause === 'Drainage Blockage').length, color: '#ef4444' }, { name: 'Drainage Overload', value: history.filter(h => h.cause === 'Drainage Overload').length, color: '#f97316' }, { name: 'Heavy Rainfall', value: history.filter(h => h.cause === 'Heavy Rainfall').length, color: '#fbbf24' }, { name: 'Pump Failure', value: history.filter(h => h.cause === 'Pump Failure').length, color: '#8b5cf6' }]} height={300} /></ChartContainer>
            <ChartContainer title="Incidents by Year" subtitle="Annual trend" height={300}><HorizontalBarChart data={[{ name: '2024', value: history.filter(h => new Date(h.date).getFullYear() === 2024).length, color: '#06b6d4' }, { name: '2025', value: history.filter(h => new Date(h.date).getFullYear() === 2025).length, color: '#8b5cf6' }, { name: '2026', value: history.filter(h => new Date(h.date).getFullYear() === 2026).length, color: '#ef4444' }]} height={300} /></ChartContainer>
          </div>

          <Card variant="strong"><CardHeader><CardTitle>Maintenance Effectiveness</CardTitle></CardHeader><CardContent className="space-y-3"><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><div className="p-4 bg-flood-bg rounded-lg text-center"><p className="text-2xl font-bold text-flood-success">34%</p><p className="text-sm text-flood-muted">Reduction post-maintenance</p></div><div className="p-4 bg-flood-bg rounded-lg text-center"><p className="text-2xl font-bold text-flood-primary">18 days</p><p className="text-sm text-flood-muted">Avg maintenance interval</p></div><div className="p-4 bg-flood-bg rounded-lg text-center"><p className="text-2xl font-bold text-flood-warning">7</p><p className="text-sm text-flood-muted">Drains overdue</p></div><div className="p-4 bg-flood-bg rounded-lg text-center"><p className="text-2xl font-bold text-flood-critical">3</p><p className="text-sm text-flood-muted">Critical priority</p></div></div><div className="p-4 bg-flood-primary/10 rounded-lg border border-flood-primary/30"><p className="text-sm text-flood-primary"><strong>Insight:</strong> Drains maintained within 14-day intervals show 34% fewer blockage incidents. D-094 (GT Road) and D-045 (Railway Road) are overdue and should be prioritized.</p></div></CardContent></Card>
        </div>
      </div>
    </div>
  );
}