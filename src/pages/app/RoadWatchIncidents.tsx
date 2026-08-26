import { useState, useEffect, useMemo } from 'react';
import { clsx } from 'clsx';
import { 
  MapPin, Map, Layers, Search, Filter, Download,
  RefreshCw, AlertTriangle, Eye, EyeOff, ChevronRight,
  Calendar, Camera, Zap, Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { FloodMap } from '../../components/map/FloodMap';
import { LayerControl } from '../../components/map/LayerControl';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/ui/Toast';
import { mockRoads, mockDrains, mockCameraFeeds, mockMapLayers } from '../../data/mockData';
import { RoadWatchService, type RoadWatchIncident } from '../../services/roadwatch';

const severityOptions = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'low', label: 'Low' },
];

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'reported', label: 'Reported' },
  { value: 'under-review', label: 'Under Review' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'field-response', label: 'Field Response' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'verified', label: 'Verified' },
];

const issueOptions = [
  { value: 'all', label: 'All Issues' },
  { value: 'waterlogging', label: 'Waterlogging' },
  { value: 'drainage-problem', label: 'Drainage Problem' },
  { value: 'drain-overflow', label: 'Drain Overflow' },
  { value: 'blockage', label: 'Blockage' },
  { value: 'road-damage', label: 'Road Damage' },
];

const mapSeverityToBadge = (severity: 'low' | 'moderate' | 'high' | 'critical'): import('../../types').Severity => {
  switch (severity) {
    case 'low': return 'normal';
    case 'moderate': return 'moderate';
    case 'high': return 'high';
    case 'critical': return 'critical';
  }
};

const mapStatusToBadge = (status: 'reported' | 'under-review' | 'assigned' | 'field-response' | 'resolved' | 'verified'): import('../../types').Severity => {
  switch (status) {
    case 'reported': return 'normal';
    case 'under-review': return 'moderate';
    case 'assigned': return 'high';
    case 'field-response': return 'critical';
    case 'resolved': return 'success';
    case 'verified': return 'success';
  }
};

const getSeverityColor = (severity: 'low' | 'moderate' | 'high' | 'critical'): string => {
  switch (severity) {
    case 'critical': return '#f97316';
    case 'high': return '#ef4444';
    case 'moderate': return '#fbbf24';
    case 'low': return '#22c55e';
  }
};

export function RoadWatchIncidents() {
  const { 
    activeMapLayers, mapCenter, mapZoom,
    onMapClick,
    dispatch,
  } = useApp();
  const { toast } = useToast();
  
  const [incidents, setIncidents] = useState<RoadWatchIncident[]>(() => {
    const stored = localStorage.getItem('roadwatch_incidents');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.map((i: any) => ({
          ...i,
          location: { ...i.location, timestamp: new Date(i.location.timestamp) },
          createdAt: new Date(i.createdAt),
          updatedAt: new Date(i.updatedAt),
        }));
      } catch {
        return [];
      }
    }
    return [];
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [issueFilter, setIssueFilter] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState<RoadWatchIncident | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    localStorage.setItem('roadwatch_incidents', JSON.stringify(incidents));
  }, [incidents]);

  const filteredIncidents = useMemo(() => 
    incidents.filter(inc => {
      const matchesSearch = !searchQuery || 
        inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inc.affectedRoad?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        inc.location.address?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || inc.severity === severityFilter;
      const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;
      const matchesIssue = issueFilter === 'all' || inc.issue === issueFilter;
      return matchesSearch && matchesSeverity && matchesStatus && matchesIssue;
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  [incidents, searchQuery, severityFilter, statusFilter, issueFilter]);

  const stats = useMemo(() => ({
    total: incidents.length,
    active: incidents.filter(i => i.status !== 'resolved' && i.status !== 'verified').length,
    critical: incidents.filter(i => i.severity === 'critical').length,
    resolved: incidents.filter(i => i.status === 'resolved' || i.status === 'verified').length,
  }), [incidents]);

  const handleStatusChange = (incidentId: string, newStatus: RoadWatchIncident['status']) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === incidentId ? { ...inc, status: newStatus, updatedAt: new Date() } : inc
    ));
    toast({ type: 'success', title: 'Status Updated', message: `Incident status changed to ${newStatus}` });
  };

  const handleAssignTeam = (incidentId: string, teamId: string, teamName: string) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === incidentId ? { ...inc, assignedTeamId: teamId, assignedTeamName: teamName, status: 'assigned' as const, updatedAt: new Date() } : inc
    ));
    toast({ type: 'success', title: 'Team Assigned', message: `${teamName} assigned to ${incidentId}` });
  };

  const handleDelete = (incidentId: string) => {
    if (confirm('Delete this incident? This cannot be undone.')) {
      setIncidents(current => {
        const filtered = current.filter(inc => inc.id !== incidentId);
        localStorage.setItem('roadwatch_incidents', JSON.stringify(filtered));
        return filtered;
      });
      toast({ type: 'success', title: 'Deleted', message: 'Incident removed' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-flood-text">RoadWatch Incidents</h1>
          <p className="text-flood-muted text-sm">Mobile camera flood detection reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setShowMap(!showMap)} icon={showMap ? <MapPin className="w-4 h-4" /> : <Map className="w-4 h-4" />}>
            {showMap ? 'List View' : 'Map View'}
          </Button>
          <Button variant="secondary" icon={<Download className="w-4 h-4" />}>Export CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card variant="hover" className="text-center p-4 border-l-4 border-flood-primary">
          <div className="text-3xl font-bold text-flood-primary">{stats.total}</div>
          <div className="text-sm text-flood-muted">Total Reports</div>
        </Card>
        <Card variant="hover" className="text-center p-4 border-l-4 border-flood-warning">
          <div className="text-3xl font-bold text-flood-warning">{stats.active}</div>
          <div className="text-sm text-flood-muted">Active</div>
        </Card>
        <Card variant="hover" className="text-center p-4 border-l-4 border-flood-critical">
          <div className="text-3xl font-bold text-flood-critical">{stats.critical}</div>
          <div className="text-sm text-flood-muted">Critical</div>
        </Card>
        <Card variant="hover" className="text-center p-4 border-l-4 border-flood-success">
          <div className="text-3xl font-bold text-flood-success">{stats.resolved}</div>
          <div className="text-sm text-flood-muted">Resolved</div>
        </Card>
      </div>

      {showMap ? (
        <Card variant="strong" className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-[600px]">
              <FloodMap
                roads={mockRoads}
                drains={mockDrains}
                incidents={[]}
                teams={[]}
                cameras={mockCameraFeeds}
                activeLayers={['flooded-roads', 'flood-predictions', 'drainage-network']}
                center={mapCenter}
                zoom={mapZoom}
                onRoadClick={() => {}}
                onDrainClick={() => {}}
                onIncidentClick={() => {}}
                onTeamClick={() => {}}
                onCameraClick={() => {}}
                onMapClick={onMapClick}
                className="h-full w-full"
              />
              {filteredIncidents.map(incident => (
                <div 
                  key={incident.id}
                  className="absolute z-10 cursor-pointer"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                  onClick={() => setSelectedIncident(incident)}
                >
                  <div 
                    className="w-6 h-6 rounded-full border-3 border-white flex items-center justify-center shadow-lg hover:scale-125 transition-transform"
                    style={{ backgroundColor: getSeverityColor(incident.severity) }}
                  >
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card variant="strong">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[250px]">
                  <label className="block text-sm font-medium text-flood-muted mb-1">Search</label>
                  <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search incident ID, location, road..." />
                </div>
                <div className="min-w-[160px]">
                  <label className="block text-sm font-medium text-flood-muted mb-1">Severity</label>
                  <Select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} options={severityOptions} placeholder="All" />
                </div>
                <div className="min-w-[160px]">
                  <label className="block text-sm font-medium text-flood-muted mb-1">Status</label>
                  <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={statusOptions} placeholder="All" />
                </div>
                <div className="min-w-[160px]">
                  <label className="block text-sm font-medium text-flood-muted mb-1">Issue</label>
                  <Select value={issueFilter} onChange={e => setIssueFilter(e.target.value)} options={issueOptions} placeholder="All" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="strong">
            <CardContent className="p-0">
              {filteredIncidents.length === 0 ? (
                <div className="p-12 text-center text-flood-muted">
                  <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No incidents match current filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-flood-border">
                        <th className="px-4 py-3 text-left font-medium text-flood-muted">Incident ID</th>
                        <th className="px-4 py-3 text-left font-medium text-flood-muted">Location</th>
                        <th className="px-4 py-3 text-left font-medium text-flood-muted">Issue</th>
                        <th className="px-4 py-3 text-left font-medium text-flood-muted">Severity</th>
                        <th className="px-4 py-3 text-left font-medium text-flood-muted">Confidence</th>
                        <th className="px-4 py-3 text-left font-medium text-flood-muted">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-flood-muted">Reported</th>
                        <th className="px-4 py-3 text-left font-medium text-flood-muted">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIncidents.map(incident => (
                        <tr key={incident.id} className="border-b border-flood-border/50 hover:bg-flood-card/50 cursor-pointer" onClick={() => setSelectedIncident(incident)}>
                          <td className="px-4 py-3 font-mono text-xs text-flood-primary">{incident.id}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-flood-text">{incident.affectedRoad || 'Unknown Road'}</div>
                            <div className="text-xs text-flood-muted">{incident.location.address || `${incident.location.latitude.toFixed(4)}, ${incident.location.longitude.toFixed(4)}`}</div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="default" size="sm" className="capitalize">{incident.issue.replace('-', ' ')}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={mapSeverityToBadge(incident.severity)} size="sm" />
                          </td>
                          <td className="px-4 py-3 font-mono">{incident.confidence}%</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={mapStatusToBadge(incident.status)} size="sm" />
                          </td>
                          <td className="px-4 py-3 text-sm font-mono">{new Date(incident.createdAt).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedIncident(incident); }} icon={<Eye className="w-4 h-4" />} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {selectedIncident && (
        <Modal 
          isOpen={!!selectedIncident} 
          onClose={() => setSelectedIncident(null)} 
          title={selectedIncident.id} 
          size="xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card variant="hover"><CardContent className="p-4 text-center"><p className="text-sm text-flood-muted">Severity</p><StatusBadge status={mapSeverityToBadge(selectedIncident.severity)} /></CardContent></Card>
              <Card variant="hover"><CardContent className="p-4 text-center"><p className="text-sm text-flood-muted">Status</p><StatusBadge status={mapStatusToBadge(selectedIncident.status)} /></CardContent></Card>
              <Card variant="hover"><CardContent className="p-4 text-center"><p className="text-sm text-flood-muted">Confidence</p><p className="font-bold text-2xl text-flood-primary">{selectedIncident.confidence}%</p></CardContent></Card>
              <Card variant="hover"><CardContent className="p-4 text-center"><p className="text-sm text-flood-muted">Priority</p><Badge variant="warning" size="md">{selectedIncident.priority.toUpperCase()}</Badge></CardContent></Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card variant="strong">
                <CardHeader><CardTitle>Location & Details</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-flood-muted">Latitude</p><p className="font-mono">{selectedIncident.location.latitude.toFixed(6)}</p></div>
                    <div><p className="text-flood-muted">Longitude</p><p className="font-mono">{selectedIncident.location.longitude.toFixed(6)}</p></div>
                    <div><p className="text-flood-muted">Accuracy</p><p className="font-mono">±{Math.round(selectedIncident.location.accuracy)}m</p></div>
                    <div><p className="text-flood-muted">Address</p><p className="font-medium truncate">{selectedIncident.location.address || 'Not available'}</p></div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-flood-muted">Issue</span><span className="font-medium capitalize">{selectedIncident.issue.replace('-', ' ')}</span></div>
                    <div className="flex justify-between"><span className="text-flood-muted">Possible Cause</span><span className="font-medium">{selectedIncident.possibleCause}</span></div>
                    <div className="flex justify-between"><span className="text-flood-muted">Affected Area</span><span className="font-medium">{selectedIncident.detection.affectedArea}</span></div>
                    <div className="flex justify-between"><span className="text-flood-muted">Recommended Action</span><span className="font-medium">{selectedIncident.recommendedAction}</span></div>
                    <div className="flex justify-between"><span className="text-flood-muted">Reported</span><span className="font-mono">{new Date(selectedIncident.createdAt).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-flood-muted">Source</span><span className="font-medium">{selectedIncident.reporterSource}</span></div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="strong">
                <CardHeader><CardTitle>Generative Report</CardTitle></CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-flood-text">{selectedIncident.generativeReport}</p>
                </CardContent>
              </Card>

              <Card variant="strong">
                <CardHeader><CardTitle>Image Evidence</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <div className="aspect-video relative">
                    <img src={selectedIncident.imageUrl} alt="RoadWatch evidence" className="w-full h-full object-cover" />
                  </div>
                </CardContent>
              </Card>

              <Card variant="strong">
                <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Select 
                      value={selectedIncident.status} 
                      onChange={e => handleStatusChange(selectedIncident.id, e.target.value as any)}
                      options={statusOptions.filter(o => o.value !== 'all')}
                      placeholder="Change Status"
                      className="flex-1"
                    />
                    <Button variant="secondary" size="sm" onClick={() => handleAssignTeam(selectedIncident.id, 'TM-001', 'Drainage Team 01')}>
                      Assign Team
                    </Button>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(selectedIncident.id)} className="w-full justify-center">
                    Delete Incident
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}