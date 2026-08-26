import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { 
  ListChecks, Search, AlertTriangle, MapPin, 
  ChevronDown, Clock, Eye, Download, Plus
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DataTable } from '../../components/ui/Table';
import { Tabs } from '../../components/ui/Tabs';
import { useApp } from '../../context/AppContext';
import { mockIncidents, getIncidentStatusLabel } from '../../data/mockData';
import type { FloodIncident } from '../../types';

const statusTabs = [
  { id: 'all', label: 'All' },
  { id: 'critical', label: 'Critical' },
  { id: 'active', label: 'Active' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'resolved', label: 'Resolved' },
];

const severityOptions = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'normal', label: 'Normal' },
  { value: 'resolved', label: 'Resolved' },
];

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'predicted', label: 'Predicted' },
  { value: 'detected', label: 'Detected' },
  { value: 'verified', label: 'Verified' },
  { value: 'registered', label: 'Registered' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'responding', label: 'Responding' },
  { value: 'resolved', label: 'Resolved' },
];

export function Incidents() {
  const { incidents, onIncidentClick } = useApp();
  const [activeTab, setActiveTab] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIncidents = incidents.filter(incident => {
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'critical' && incident.severity === 'critical') ||
      (activeTab === 'active' && incident.status !== 'resolved') ||
      (activeTab === 'assigned' && incident.assignedTeamId) ||
      (activeTab === 'resolved' && incident.status === 'resolved');
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      incident.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.roadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.ward.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSeverity && matchesStatus && matchesSearch;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-flood-text">Flood Incidents</h1>
          <p className="text-flood-muted text-sm">Manage and track all flood incidents</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />}>New Incident</Button>
      </div>

      <Tabs tabs={statusTabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />

      <Card variant="strong">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-flood-muted mb-1">Search</label>
              <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search incident ID, road, ward..." />
            </div>
            <div className="min-w-[160px]">
              <label className="block text-sm font-medium text-flood-muted mb-1">Severity</label>
              <Select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} options={severityOptions} placeholder="All" />
            </div>
            <div className="min-w-[160px]">
              <label className="block text-sm font-medium text-flood-muted mb-1">Status</label>
              <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={statusOptions} placeholder="All" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="strong">
        <CardContent className="p-0">
          <DataTable
            columns={[
              { key: 'id', header: 'Incident ID', render: (row: FloodIncident) => <span className="font-mono text-xs">{row.id}</span> },
              { key: 'roadName', header: 'Location', render: (row: FloodIncident) => <div><span className="font-medium">{row.roadName}</span><p className="text-xs text-flood-muted">{row.ward}, {row.zone}</p></div> },
              { key: 'severity', header: 'Severity', render: (row: FloodIncident) => <StatusBadge status={row.severity} /> },
              { key: 'probability', header: 'Probability', render: (row: FloodIncident) => <span className="font-mono">{row.probability}%</span> },
              { key: 'probableCause', header: 'Cause', render: (row: FloodIncident) => <div><span className="text-sm">{row.probableCause}</span><p className="text-xs text-flood-muted">{row.causeConfidence}% confidence</p></div> },
              { key: 'assignedTeamName', header: 'Team', render: (row: FloodIncident) => row.assignedTeamName ? <span className="text-sm">{row.assignedTeamName}</span> : <Badge variant="moderate" size="sm">Unassigned</Badge> },
              { key: 'createdAt', header: 'Created', render: (row: FloodIncident) => <span className="text-sm font-mono">{new Date(row.createdAt).toLocaleString()}</span> },
              { key: 'status', header: 'Status', render: (row: FloodIncident) => <Badge variant="info" size="sm">{getIncidentStatusLabel(row.status)}</Badge> },
            ]}
            data={filteredIncidents}
            keyExtractor={row => row.id}
            onRowClick={onIncidentClick}
            hoverable
            emptyMessage="No incidents match current filters"
          />
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { Plus } from 'lucide-react';