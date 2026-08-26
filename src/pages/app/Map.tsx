import { useState } from 'react';
import { clsx } from 'clsx';
import { 
  MapPin, Layers, Search, Eye, EyeOff, Download,
  Maximize, Minimize, Navigation, Target, AlertTriangle
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FloodMap } from '../../components/map/FloodMap';
import { LayerControl } from '../../components/map/LayerControl';
import { MapControls } from '../../components/map/LayerControl';
import { useApp } from '../../context/AppContext';
import { mockRoads, mockDrains, mockIncidents, mockTeams, mockCameraFeeds, mockMapLayers } from '../../data/mockData';

export function MapPage() {
  const { 
    roads, drains, incidents, teams, cameras, 
    activeMapLayers, mapCenter, mapZoom,
    onRoadClick, onDrainClick, onIncidentClick, onTeamClick, onCameraClick, onMapClick,
    setActiveMapLayers,
    selectedRoad, selectedIncident, selectedDrain, selectedTeam,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [showLayers, setShowLayers] = useState(true);
  const [showControls, setShowControls] = useState(true);

  const handleSearch = (query: string) => {
    const road = roads.find(r => r.name.toLowerCase().includes(query.toLowerCase()) || r.id.toLowerCase().includes(query.toLowerCase()));
    const incident = incidents.find(i => i.roadName.toLowerCase().includes(query.toLowerCase()) || i.id.toLowerCase().includes(query.toLowerCase()));
    const drain = drains.find(d => d.name.toLowerCase().includes(query.toLowerCase()) || d.id.toLowerCase().includes(query.toLowerCase()));
    const team = teams.find(t => t.name.toLowerCase().includes(query.toLowerCase()) || t.id.toLowerCase().includes(query.toLowerCase()));
    
    const target = road || incident || drain || team;
    if (target && 'coordinates' in target) {
      onMapClick(target.coordinates, 15);
      if ('id' in target && 'roadName' in target) onIncidentClick(target as any);
      else if ('id' in target && 'name' in target && 'type' in target) onTeamClick(target as any);
      else if ('id' in target && 'capacity' in target) onDrainClick(target as any);
      else onRoadClick(target as any);
    }
    setSearchQuery('');
  };

  return (
    <div className={clsx('h-[calc(100vh-4rem)] flex flex-col', fullscreen && 'fixed inset-0 z-50')}>
      <div className={clsx('flex-1 flex flex-row overflow-hidden', fullscreen && 'h-full')}>
        <div className={clsx('relative flex-1 overflow-hidden', fullscreen && 'h-full')}>
          <FloodMap
            roads={roads}
            drains={drains}
            incidents={incidents}
            teams={teams}
            cameras={cameras}
            activeLayers={activeMapLayers}
            center={mapCenter}
            zoom={mapZoom}
            onRoadClick={onRoadClick}
            onDrainClick={onDrainClick}
            onIncidentClick={onIncidentClick}
            onTeamClick={onTeamClick}
            onCameraClick={onCameraClick}
            onMapClick={onMapClick}
            selectedRoad={selectedRoad}
            selectedIncident={selectedIncident}
            className="h-full w-full"
          />

          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <div className="glass-strong rounded-xl p-3 border border-flood-border flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-flood-muted" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch(searchQuery)}
                  placeholder="Search road, incident, drain, team..."
                  className="input pl-10 pr-32 py-2 text-sm w-64"
                />
              </div>
            </div>
          </div>

          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <div className="glass-strong rounded-xl p-2 border border-flood-border flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => setFullscreen(!fullscreen)} icon={fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />} />
              <Button variant="ghost" size="sm" onClick={() => setShowLayers(!showLayers)} icon={showLayers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />} />
              <Button variant="ghost" size="sm" onClick={() => setShowControls(!showControls)} icon={<Layers className="w-4 h-4" />} />
            </div>
          </div>

          {showLayers && (
            <div className="absolute bottom-4 left-4 z-20">
              <LayerControl layers={mockMapLayers} activeLayers={activeMapLayers} onToggle={setActiveMapLayers} />
            </div>
          )}

          {showControls && (
            <div className="absolute bottom-4 right-4 z-20">
              <MapControls
                zoom={mapZoom}
                center={mapCenter}
                onZoomIn={() => onMapClick(mapCenter, mapZoom + 1)}
                onZoomOut={() => onMapClick(mapCenter, mapZoom - 1)}
                onLocate={() => { if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => onMapClick({ lat: p.coords.latitude, lng: p.coords.longitude }, 15)); }}
                onFullscreen={() => setFullscreen(!fullscreen)}
                onSearch={handleSearch}
              />
            </div>
          )}

          {selectedRoad && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 max-w-md">
              <Card variant="strong" className="w-full">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-flood-text">{selectedRoad.name}</p>
                      <p className="text-sm text-flood-muted">{selectedRoad.id} · {selectedRoad.ward}</p>
                    </div>
                    <StatusBadge status={selectedRoad.severity} size="sm" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                    <div><p className="text-flood-muted">Probability</p><p className="font-bold">{selectedRoad.probability}%</p></div>
                    <div><p className="text-flood-muted">Onset</p><p className="font-bold">{Math.round(selectedRoad.expectedOnset)}min</p></div>
                    <div><p className="text-flood-muted">AI Confidence</p><p className="font-bold">{selectedRoad.aiConfidence}%</p></div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => window.location.href = `/roads/${selectedRoad.id}`}>Details</Button>
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => window.location.href = `/incidents?road=${selectedRoad.id}`}>Incidents</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedIncident && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 max-w-md">
              <Card variant="strong" className="w-full border-l-4 border-flood-danger">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-flood-text">{selectedIncident.roadName}</p>
                      <p className="text-sm text-flood-muted">{selectedIncident.id}</p>
                    </div>
                    <StatusBadge status={selectedIncident.severity} size="sm" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                    <div><p className="text-flood-muted">Probability</p><p className="font-bold">{selectedIncident.probability}%</p></div>
                    <div><p className="text-flood-muted">Cause</p><p className="font-bold text-xs">{selectedIncident.probableCause}</p></div>
                    <div><p className="text-flood-muted">Status</p><p className="font-bold capitalize">{selectedIncident.status.replace('-', ' ')}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => window.location.href = `/incidents/${selectedIncident.id}`}>View Details</Button>
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => window.location.href = `/teams/${selectedIncident.assignedTeamId}`}>Team</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className={clsx('w-72 lg:w-80 bg-flood-card border-l border-flood-border flex flex-col overflow-hidden', fullscreen && 'hidden')}>
          <div className="p-4 border-b border-flood-border">
            <h2 className="font-semibold text-flood-text">Legend & Info</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <h3 className="font-medium text-flood-text mb-3">Incident Severity</h3>
              <div className="space-y-2">
                {['critical', 'high', 'moderate', 'normal', 'resolved'].map(s => (
                  <div key={s} className="flex items-center gap-2 text-sm">
                    <StatusBadge status={s as any} size="sm" />
                    <span className="text-flood-text capitalize">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-flood-text mb-3">Team Status</h3>
              <div className="space-y-2">
                {['idle', 'enroute', 'on-site', 'resolving', 'completed'].map(s => (
                  <div key={s} className="flex items-center gap-2 text-sm">
                    <StatusBadge status={s as any} size="sm" />
                    <span className="text-flood-text capitalize">{s.replace('-', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-flood-text mb-3">Drain Status</h3>
              <div className="space-y-2">
                {['normal', 'stressed', 'blocked', 'maintenance'].map(s => (
                  <div key={s} className="flex items-center gap-2 text-sm">
                    <StatusBadge status={s as any} size="sm" />
                    <span className="text-flood-text capitalize">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-flood-border">
              <h3 className="font-medium text-flood-text mb-3">Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-flood-muted">Active Incidents</span><span className="font-bold">{incidents.filter(i => i.status !== 'resolved').length}</span></div>
                <div className="flex justify-between"><span className="text-flood-muted">Critical Roads</span><span className="font-bold text-flood-danger">{roads.filter(r => r.severity === 'critical').length}</span></div>
                <div className="flex justify-between"><span className="text-flood-muted">Blocked Drains</span><span className="font-bold text-flood-critical">{drains.filter(d => d.status === 'blocked').length}</span></div>
                <div className="flex justify-between"><span className="text-flood-muted">Teams Deployed</span><span className="font-bold">{teams.filter(t => t.status !== 'idle').length}</span></div>
                <div className="flex justify-between"><span className="text-flood-muted">Cameras Online</span><span className="font-bold text-flood-success">{cameras.filter(c => c.status === 'online').length}/{cameras.length}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { clsx } from 'clsx';
import { StatusBadge } from '../../components/ui/Badge';