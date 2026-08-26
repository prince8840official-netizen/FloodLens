import { useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { 
  Users, MapPin, Truck, AlertTriangle, Search, 
  ChevronDown, Clock, Map, Eye, Download, Phone,
  Navigation, CheckCircle, XCircle
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DataTable } from '../../components/ui/Table';
import { FloodMap } from '../../components/map/FloodMap';
import { useApp } from '../../context/AppContext';
import { mockTeams, mockIncidents, mockRoads, formatDistance, formatTime } from '../../data/mockData';
import type { ResponseTeam } from '../../types';

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'drainage', label: 'Drainage' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'traffic', label: 'Traffic' },
  { value: 'medical', label: 'Medical' },
  { value: 'utility', label: 'Utility' },
];

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'idle', label: 'Available' },
  { value: 'enroute', label: 'En Route' },
  { value: 'on-site', label: 'On Site' },
  { value: 'resolving', label: 'Resolving' },
  { value: 'completed', label: 'Completed' },
];

export function Teams() {
  const { teams, incidents, onTeamClick, activeMapLayers, mapCenter, mapZoom, onMapClick } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState<ResponseTeam | null>(null);

  const filteredTeams = useMemo(() => teams.filter(team => {
    const matchesType = typeFilter === 'all' || team.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || team.status === statusFilter;
    const matchesSearch = searchQuery === '' || team.name.toLowerCase().includes(searchQuery.toLowerCase()) || team.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  }), [teams, typeFilter, statusFilter, searchQuery]);

  const activeTeams = teams.filter(t => t.status !== 'idle');
  const availableTeams = teams.filter(t => t.status === 'idle');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-flood-text">Response Operations</h1><p className="text-flood-muted text-sm">Track and dispatch response teams</p></div><div className="flex items-center gap-4"><div className="flex items-center gap-2 text-sm text-flood-muted"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-flood-primary animate-pulse" /> {activeTeams.length} Active</span><span className="flex items-center gap-1 ml-4"><span className="w-2 h-2 rounded-full bg-flood-success" /> {availableTeams.length} Available</span></div></div></div>
      <Card variant="strong"><CardContent className="p-4"><div className="flex flex-wrap gap-4 items-end"><div className="flex-1 min-w-[250px]"><label className="block text-sm font-medium text-flood-muted mb-1">Search Teams</label><Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name, ID..." /></div><div className="min-w-[160px]"><label className="block text-sm font-medium text-flood-muted mb-1">Type</label><Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} options={typeOptions} placeholder="All" /></div><div className="min-w-[160px]"><label className="block text-sm font-medium text-flood-muted mb-1">Status</label><Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={statusOptions} placeholder="All" /></div></div></CardContent></Card>
      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <Card variant="strong" className="overflow-hidden"><div className="p-4 border-b border-flood-border"><h2 className="font-semibold text-flood-text">Team Locations</h2></div><CardContent className="p-0"><FloodMap roads={[]} drains={[]} incidents={mockIncidents} teams={teams} cameras={[]} activeLayers={['response-teams', 'flooded-roads']} center={mapCenter} zoom={mapZoom} onRoadClick={() => {}} onDrainClick={() => {}} onIncidentClick={() => {}} onTeamClick={onTeamClick} onCameraClick={() => {}} onMapClick={onMapClick} height="500px" /></CardContent></Card>
        <div className="space-y-6">
          <Card variant="strong"><div className="p-4 border-b border-flood-border"><h2 className="font-semibold text-flood-text">Team Status</h2></div><CardContent className="p-0"><DataTable columns={[{ key: 'name', header: 'Team', render: (row: ResponseTeam) => <div><span className="font-medium">{row.name}</span><p className="text-xs text-flood-muted">{row.type} · {row.ward}</p></div> }, { key: 'type', header: 'Type', render: (row: ResponseTeam) => <Badge variant="info" size="sm" className="capitalize">{row.type}</Badge> }, { key: 'status', header: 'Status', render: (row: ResponseTeam) => <StatusBadge status={row.status} size="sm" /> }, { key: 'currentIncidentName', header: 'Incident', render: (row: ResponseTeam) => row.currentIncidentName ? <div className="flex items-center gap-2"><AlertTriangle className="w-3 h-3 text-flood-warning" /><span className="text-sm">{row.currentIncidentName}</span></div> : <Badge variant="success" size="sm">Available</Badge> }, { key: 'distance', header: 'Distance', render: (row: ResponseTeam) => <span className="font-mono text-sm">{formatDistance(row.distance)}</span> }, { key: 'eta', header: 'ETA', render: (row: ResponseTeam) => <span className="font-mono text-sm">{formatTime(row.eta)}</span> }]} data={filteredTeams} keyExtractor={row => row.id} onRowClick={team => { setSelectedTeam(team); onTeamClick(team); }} hoverable emptyMessage="No teams match current filters" /></CardContent></Card>
          {selectedTeam && <Card variant="strong" className="border-l-4 border-flood-primary"><CardContent className="p-4 space-y-4"><div className="flex items-center justify-between"><div><h3 className="font-semibold text-flood-text">{selectedTeam.name}</h3><p className="text-sm text-flood-muted">{selectedTeam.type} · {selectedTeam.ward}, {selectedTeam.zone}</p></div><StatusBadge status={selectedTeam.status} size="md" /></div><div className="grid grid-cols-2 gap-4 text-sm"><div className="flex justify-between"><span className="text-flood-muted">Vehicle</span><span className="font-medium">{selectedTeam.vehicle}</span></div><div className="flex justify-between"><span className="text-flood-muted">Members</span><span className="font-medium">{selectedTeam.members}</span></div><div className="flex justify-between"><span className="text-flood-muted">Distance</span><span className="font-medium">{formatDistance(selectedTeam.distance)}</span></div><div className="flex justify-between"><span className="text-flood-muted">ETA</span><span className="font-medium">{formatTime(selectedTeam.eta)}</span></div></div>{selectedTeam.currentIncidentId && <div className="p-3 bg-flood-warning/10 rounded-lg border border-flood-warning/30"><h4 className="font-medium text-flood-warning mb-2">Active Incident</h4><p className="text-sm text-flood-text">{selectedTeam.currentIncidentName}</p><div className="flex gap-2 mt-2"><Button size="sm" icon={<Eye className="w-3 h-3" />}>View Incident</Button><Button size="sm" variant="secondary" icon={<Phone className="w-3 h-3" />}>Contact Team</Button><Button size="sm" variant="secondary" icon={<Navigation className="w-3 h-3" />}>Navigate</Button></div></div>}<div className="flex gap-2 pt-2 border-t border-flood-border"><Button size="sm" variant="secondary" icon={<Phone className="w-3 h-3" />}>Contact</Button><Button size="sm" variant="secondary" icon={<Navigation className="w-3 h-3" />}>Track</Button><Button size="sm" variant="secondary" icon={<Activity className="w-3 h-3" />}>View Route</Button></div></CardContent></Card>}
        </div>
      </div>
      <Card variant="strong"><div className="p-4 border-b border-flood-border flex items-center justify-between"><h2 className="font-semibold text-flood-text">All Teams</h2><span className="text-sm text-flood-muted">{filteredTeams.length} teams</span></div><CardContent className="p-0"><DataTable columns={[{ key: 'id', header: 'ID', render: (row: ResponseTeam) => <span className="font-mono text-xs">{row.id}</span> }, { key: 'name', header: 'Team Name' }, { key: 'type', header: 'Type', render: (row: ResponseTeam) => <Badge variant="info" size="sm" className="capitalize">{row.type}</Badge> }, { key: 'status', header: 'Status', render: (row: ResponseTeam) => <StatusBadge status={row.status} size="sm" /> }, { key: 'ward', header: 'Ward' }, { key: 'zone', header: 'Zone' }, { key: 'vehicle', header: 'Vehicle' }, { key: 'members', header: 'Members', render: (row: ResponseTeam) => <span className="font-mono">{row.members}</span> }, { key: 'equipment', header: 'Equipment', render: (row: ResponseTeam) => <span className="text-sm text-flood-muted">{row.equipment.join(', ')}</span> }, { key: 'currentIncidentName', header: 'Current Incident', render: (row: ResponseTeam) => row.currentIncidentName ? <span className="text-sm">{row.currentIncidentName}</span> : <span className="text-flood-muted">—</span> }]} data={filteredTeams} keyExtractor={row => row.id} onRowClick={team => { setSelectedTeam(team); onTeamClick(team); }} hoverable /></CardContent></Card>
    </div>
  );
}

import { Activity } from 'lucide-react';
import { useState } from 'react';