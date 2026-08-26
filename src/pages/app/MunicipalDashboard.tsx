import { useState, useMemo, useEffect } from 'react';
import { clsx } from 'clsx';
import { 
  AlertTriangle, MapPin, Droplets, Users, CheckCircle, 
  ChevronRight, Map, ListChecks, Route, GitBranch, 
  Video, BarChart, Clock, Lightbulb, FlaskConical, Bell, Settings,
  Camera, Zap, Shield, TrendingUp, TrendingDown, Download,
  PieChart, Map as MapIcon, Target, Filter
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
import { mockRoads, mockDrains, mockIncidents, mockTeams, mockCameraFeeds, mockMapLayers, formatTime, formatDistance } from '../../data/mockData';
import { RoadWatchService, type RoadWatchIncident } from '../../services/roadwatch';

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

const priorityColors = {
  critical: 'text-flood-critical bg-flood-critical/10 border-flood-critical/30',
  high: 'text-flood-danger bg-flood-danger/10 border-flood-danger/30',
  moderate: 'text-flood-warning bg-flood-warning/10 border-flood-warning/30',
  low: 'text-flood-success bg-flood-success/10 border-flood-success/30',
};

export function MunicipalDashboard() {
  const { 
    activeMapLayers, mapCenter, mapZoom,
    onMapClick,
    dispatch,
  } = useApp();
  const { toast } = useToast();
  
  const [roadwatchIncidents, setRoadwatchIncidents] = useState<RoadWatchIncident[]>(() => {
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
  
  const [selectedIncident, setSelectedIncident] = useState<RoadWatchIncident | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    const stored = localStorage.getItem('roadwatch_incidents');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRoadwatchIncidents(parsed.map((i: any) => ({
          ...i,
          location: { ...i.location, timestamp: new Date(i.location.timestamp) },
          createdAt: new Date(i.createdAt),
          updatedAt: new Date(i.updatedAt),
        })));
      } catch {
        setRoadwatchIncidents([]);
      }
    }
  }, []);

  const stats = useMemo(() => {
    const incidents = roadwatchIncidents;
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return {
      total: incidents.length,
      last24h: incidents.filter(i => i.createdAt >= last24h).length,
      active: incidents.filter(i => i.status !== 'resolved' && i.status !== 'verified').length,
      critical: incidents.filter(i => i.severity === 'critical').length,
      high: incidents.filter(i => i.severity === 'high').length,
      moderate: incidents.filter(i => i.severity === 'moderate').length,
      low: incidents.filter(i => i.severity === 'low').length,
      resolved: incidents.filter(i => i.status === 'resolved' || i.status === 'verified').length,
      avgResponseTime: 0,
      avgResolutionTime: 0,
      hotspots: [] as { ward: string; count: number }[],
    };
  }, [roadwatchIncidents]);

  const severityDistribution = useMemo(() => [
    { label: 'Critical', value: stats.critical, color: '#f97316' },
    { label: 'High', value: stats.high, color: '#ef4444' },
    { label: 'Moderate', value: stats.moderate, color: '#fbbf24' },
    { label: 'Low', value: stats.low, color: '#22c55e' },
  ].filter(s => s.value > 0), [stats]);

  const statusDistribution = useMemo(() => [
    { label: 'Reported', value: roadwatchIncidents.filter(i => i.status === 'reported').length, color: '#06b6d4' },
    { label: 'Under Review', value: roadwatchIncidents.filter(i => i.status === 'under-review').length, color: '#8b5cf6' },
    { label: 'Assigned', value: roadwatchIncidents.filter(i => i.status === 'assigned').length, color: '#f97316' },
    { label: 'Field Response', value: roadwatchIncidents.filter(i => i.status === 'field-response').length, color: '#ef4444' },
    { label: 'Resolved', value: roadwatchIncidents.filter(i => i.status === 'resolved').length, color: '#22c55e' },
    { label: 'Verified', value: roadwatchIncidents.filter(i => i.status === 'verified').length, color: '#22c55e' },
  ].filter(s => s.value > 0), [roadwatchIncidents]);

  const wardStats = useMemo(() => {
    const wards: Record<string, number> = {};
    roadwatchIncidents.forEach(inc => {
      const ward = inc.location.address?.split(',').find((part: string) => part.includes('Nagar') || part.includes('Lines') || part.includes('Road'))?.trim() || 'Unknown';
      wards[ward] = (wards[ward] || 0) + 1;
    });
    return Object.entries(wards).map(([ward, count]) => ({ ward, count })).sort((a, b) => b.count - a.count);
  }, [roadwatchIncidents]);

  const handleStatusChange = (incidentId: string, newStatus: RoadWatchIncident['status']) => {
    setRoadwatchIncidents(prev => prev.map(inc => 
      inc.id === incidentId ? { ...inc, status: newStatus, updatedAt: new Date() } : inc
    ));
    localStorage.setItem('roadwatch_incidents', JSON.stringify(
      roadwatchIncidents.map(inc => inc.id === incidentId ? { ...inc, status: newStatus, updatedAt: new Date() } : inc)
    ));
    toast({ type: 'success', title: 'Status Updated', message: `Incident status changed to ${newStatus}` });
  };

  const handleAssignTeam = (incidentId: string, teamId: string, teamName: string) => {
    setRoadwatchIncidents(prev => prev.map(inc => 
      inc.id === incidentId ? { ...inc, assignedTeamId: teamId, assignedTeamName: teamName, status: 'assigned' as const, updatedAt: new Date() } : inc
    ));
    localStorage.setItem('roadwatch_incidents', JSON.stringify(
      roadwatchIncidents.map(inc => inc.id === incidentId ? { ...inc, assignedTeamId: teamId, assignedTeamName: teamName, status: 'assigned' as const, updatedAt: new Date() } : inc)
    ));
    toast({ type: 'success', title: 'Team Assigned', message: `${teamName} assigned to ${incidentId}` });
  };

  const recentIncidents = useMemo(() => 
    roadwatchIncidents
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10),
  [roadwatchIncidents]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-flood-text">Municipal Control Room</h1>
          <p className="text-flood-muted text-sm">RoadWatch Incident Management — Kanpur Municipal Corporation</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={timeRange} 
            onChange={e => setTimeRange(e.target.value)}
            className="input py-2 px-3 text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button variant="secondary" icon={<Download className="w-4 h-4" />}>Export Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <Card variant="hover" className="text-center p-4 border-l-4 border-flood-primary">
          <div className="text-3xl font-bold text-flood-primary">{stats.total}</div>
          <div className="text-sm text-flood-muted">Total Reports</div>
        </Card>
        <Card variant="hover" className="text-center p-4 border-l-4 border-flood-warning">
          <div className="text-3xl font-bold text-flood-warning">{stats.last24h}</div>
          <div className="text-sm text-flood-muted">Last 24h</div>
        </Card>
        <Card variant="hover" className="text-center p-4 border-l-4 border-flood-critical">
          <div className="text-3xl font-bold text-flood-critical">{stats.active}</div>
          <div className="text-sm text-flood-muted">Active</div>
        </Card>
        <Card variant="hover" className="text-center p-4 border-l-4 border-flood-danger">
          <div className="text-3xl font-bold text-flood-danger">{stats.critical}</div>
          <div className="text-sm text-flood-muted">Critical</div>
        </Card>
        <Card variant="hover" className="text-center p-4 border-l-4 border-flood-success">
          <div className="text-3xl font-bold text-flood-success">{stats.resolved}</div>
          <div className="text-sm text-flood-muted">Resolved</div>
        </Card>
        <Card variant="hover" className="text-center p-4 border-l-4 border-flood-primary">
          <div className="text-3xl font-bold text-flood-primary">{wardStats.length}</div>
          <div className="text-sm text-flood-muted">Wards Affected</div>
        </Card>
        <Card variant="hover" className="text-center p-4 border-l-4 border-flood-warning">
          <div className="text-3xl font-bold text-flood-warning">12 min</div>
          <div className="text-sm text-flood-muted">Avg Response</div>
        </Card>
        <Card variant="hover" className="text-center p-4 border-l-4 border-flood-success">
          <div className="text-3xl font-bold text-flood-success">94%</div>
          <div className="text-sm text-flood-muted">Resolution Rate</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-6">
          <Card variant="strong" className="overflow-hidden">
            <CardHeader className="flex items-center justify-between p-4 border-b border-flood-border">
              <CardTitle className="flex items-center gap-2">
                <MapIcon className="w-5 h-5" /> Live Incident Map
              </CardTitle>
              <LayerControl layers={mockMapLayers} activeLayers={activeMapLayers} onToggle={(layerId) => dispatch({ type: 'TOGGLE_MAP_LAYER', payload: layerId })} />
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative h-[500px]">
                <FloodMap
                  roads={mockRoads}
                  drains={mockDrains}
                  incidents={mockIncidents}
                  teams={mockTeams}
                  cameras={mockCameraFeeds}
                  activeLayers={['flooded-roads', 'flood-predictions', 'drainage-network', 'blocked-drains']}
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
                {roadwatchIncidents.map(incident => (
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
                      className="w-7 h-7 rounded-full border-3 border-white flex items-center justify-center shadow-lg hover:scale-125 transition-transform animate-pulse"
                      style={{ backgroundColor: getSeverityColor(incident.severity) }}
                    >
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card variant="strong">
              <CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="w-5 h-5" /> Severity Distribution</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-3">
                {severityDistribution.map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="font-medium text-flood-text">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-flood-border rounded-full overflow-hidden" style={{ width: '80px' }}>
                        <div className="h-full rounded-full" style={{ width: `${stats.total > 0 ? (s.value / stats.total) * 100 : 0}%`, backgroundColor: s.color }} />
                      </div>
                      <span className="font-mono text-sm w-10 text-right">{s.value}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card variant="strong">
              <CardHeader><CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" /> Status Pipeline</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-3">
                {statusDistribution.map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="font-medium text-flood-text">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-flood-border rounded-full overflow-hidden" style={{ width: '80px' }}>
                        <div className="h-full rounded-full" style={{ width: `${stats.total > 0 ? (s.value / stats.total) * 100 : 0}%`, backgroundColor: s.color }} />
                      </div>
                      <span className="font-mono text-sm w-10 text-right">{s.value}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card variant="strong">
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-flood-critical" /> Flood Hotspots</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-3">
              {wardStats.slice(0, 5).map((w, i) => (
                <div key={w.ward} className="flex items-center justify-between p-3 bg-flood-bg rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-flood-primary/10 flex items-center justify-center text-flood-primary font-bold text-sm">{i + 1}</span>
                    <div>
                      <p className="font-medium text-flood-text">{w.ward}</p>
                      <p className="text-xs text-flood-muted">{w.count} incidents</p>
                    </div>
                  </div>
                  <Badge variant={w.count > 5 ? 'critical' : w.count > 2 ? 'high' : 'moderate'} size="sm">{w.count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card variant="strong">
            <CardHeader className="flex items-center justify-between p-4 border-b border-flood-border">
              <CardTitle className="flex items-center gap-2"><Camera className="w-5 h-5" /> Recent RoadWatch Reports</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowMap(false)}>View All</Button>
            </CardHeader>
            <CardContent className="p-0">
              {recentIncidents.length === 0 ? (
                <div className="p-8 text-center text-flood-muted">
                  <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No RoadWatch incidents yet</p>
                </div>
              ) : (
                <div className="divide-y divide-flood-border/50">
                  {recentIncidents.map(incident => (
                    <button 
                      key={incident.id}
                      onClick={() => setSelectedIncident(incident)}
                      className="w-full p-4 text-left hover:bg-flood-card/50 transition-colors flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${getSeverityColor(incident.severity)}20` }}>
                        <span className="text-lg font-bold" style={{ color: getSeverityColor(incident.severity) }}>{incident.severity[0].toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-flood-text truncate">{incident.id}</p>
                        <p className="text-xs text-flood-muted">{incident.affectedRoad || 'Unknown'} · {incident.location.address?.split(',')[0] || 'Unknown location'}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={mapSeverityToBadge(incident.severity)} size="sm" />
                        <span className="text-xs text-flood-muted">{new Date(incident.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

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
                      options={[
                        { value: 'reported', label: 'Reported' },
                        { value: 'under-review', label: 'Under Review' },
                        { value: 'assigned', label: 'Assigned' },
                        { value: 'field-response', label: 'Field Response' },
                        { value: 'resolved', label: 'Resolved' },
                        { value: 'verified', label: 'Verified' },
                      ]}
                      placeholder="Change Status"
                      className="flex-1"
                    />
                    <Button variant="secondary" size="sm" onClick={() => handleAssignTeam(selectedIncident.id, 'TM-001', 'Drainage Team 01')}>
                      Assign Team
                    </Button>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => {
                    if (confirm('Delete this incident?')) {
                      setRoadwatchIncidents(current => {
                        const filtered = current.filter(i => i.id !== selectedIncident?.id);
                        localStorage.setItem('roadwatch_incidents', JSON.stringify(filtered));
                        return filtered;
                      });
                      setSelectedIncident(null);
                      toast({ type: 'success', title: 'Deleted', message: 'Incident removed' });
                    }
                  }} className="w-full justify-center">
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