import { Link, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { 
  AlertTriangle, MapPin, Droplets, Users, CheckCircle, 
  ChevronRight, Map, ListChecks, Route, GitBranch, 
  Video, BarChart, Clock, Lightbulb, FlaskConical, Bell, Settings
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { KPICard } from '../../components/ui/KPICard';
import { FloodMap } from '../../components/map/FloodMap';
import { LayerControl } from '../../components/map/LayerControl';
import { useApp } from '../../context/AppContext';
import { mockRoads, mockIncidents, mockTeams, mockDrains, mockCameraFeeds, mockMapLayers, getSeverityColor, formatTime, formatDistance } from '../../data/mockData';
import type { Road, FloodIncident, ResponseTeam } from '../../types';

const sidebarNav = [
  { id: 'overview', label: 'Overview', icon: Map, path: '/dashboard' },
  { id: 'map', label: 'Live Map', icon: MapPin, path: '/map' },
  { id: 'predictions', label: 'Flood Predictions', icon: AlertTriangle, path: '/predictions' },
  { id: 'incidents', label: 'Incidents', icon: ListChecks, path: '/incidents' },
  { id: 'roads', label: 'Road Intelligence', icon: Route, path: '/roads' },
  { id: 'drainage', label: 'Drainage Network', icon: GitBranch, path: '/drainage' },
  { id: 'roadeye', label: 'RoadEye AI', icon: Video, path: '/roadeye' },
  { id: 'teams', label: 'Response Teams', icon: Users, path: '/teams' },
  { id: 'citizen-reports', label: 'Citizen Reports', icon: AlertTriangle, path: '/citizen-reports' },
  { id: 'analytics', label: 'Analytics', icon: BarChart, path: '/analytics' },
  { id: 'history', label: 'Flood History', icon: Clock, path: '/history' },
  { id: 'recommendations', label: 'AI Recommendations', icon: Lightbulb, path: '/recommendations' },
  { id: 'simulation', label: 'What-If Simulation', icon: FlaskConical, path: '/simulation' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { 
    roads, incidents, teams, drains, cameras, activeMapLayers, mapCenter, mapZoom,
    selectedRoad, selectedIncident, kpi,
    onRoadClick, onDrainClick, onIncidentClick, onTeamClick, onCameraClick, onMapClick,
    dispatch,
  } = useApp();

  const criticalIncidents = incidents.filter(i => i.severity === 'critical' || i.severity === 'high').slice(0, 5);
  const highRiskRoads = roads.filter(r => r.severity === 'critical' || r.severity === 'high').slice(0, 5);
  const activeTeamsList = teams.filter(t => t.status !== 'idle').slice(0, 4);

  const kpiCards = [
    { title: 'HIGH-RISK ROADS', value: kpi.highRiskRoads, icon: <AlertTriangle className="w-6 h-6" />, trend: { value: 2, label: 'vs 1hr ago' }, status: 'critical' as const, onClick: () => navigate('/roads?severity=critical,high') },
    { title: 'CRITICAL INCIDENTS', value: kpi.criticalIncidents, icon: <MapPin className="w-6 h-6" />, trend: { value: 1, label: 'new' }, status: 'critical' as const, onClick: () => navigate('/incidents?status=critical') },
    { title: 'PREDICTED EVENTS', value: kpi.predictedEvents, icon: <Droplets className="w-6 h-6" />, trend: { value: -3, label: 'vs 1hr ago' }, status: 'warning' as const, onClick: () => navigate('/predictions') },
    { title: 'ACTIVE RESPONSE TEAMS', value: kpi.activeTeams, icon: <Users className="w-6 h-6" />, trend: { value: 0, label: 'deployed' }, status: 'normal' as const, onClick: () => navigate('/teams?status=enroute,on-site,resolving') },
    { title: 'AI-VERIFIED RESOLVED', value: kpi.aiVerifiedResolved, icon: <CheckCircle className="w-6 h-6" />, trend: { value: 3, label: 'today' }, status: 'success' as const, onClick: () => navigate('/incidents?status=resolved') },
  ];

  const handleLayerToggle = (layerId: string) => {
    dispatch({ type: 'TOGGLE_MAP_LAYER', payload: layerId });
  };

  const criticalIncidentItems = criticalIncidents.map(inc => (
    <div key={inc.id} className="flex items-center justify-between p-3 bg-flood-bg rounded-lg hover:bg-flood-card/50 cursor-pointer" onClick={() => onIncidentClick(inc)}>
      <div>
        <p className="font-mono text-xs text-flood-primary">{inc.id}</p>
        <p className="text-sm text-flood-muted">{inc.roadName} ({inc.ward})</p>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={inc.severity} size="sm" />
        <Badge variant="info" size="sm">{inc.probability}%</Badge>
      </div>
    </div>
  ));

  const highRiskRoadItems = highRiskRoads.map(road => (
    <div key={road.id} className="flex items-center justify-between p-3 bg-flood-bg rounded-lg hover:bg-flood-card/50 cursor-pointer" onClick={() => onRoadClick(road)}>
      <div>
        <p className="font-mono text-xs text-flood-primary">{road.id}</p>
        <p className="text-sm text-flood-muted">{road.name}</p>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={road.severity} size="sm" />
        <Badge variant="info" size="sm">{road.probability}%</Badge>
      </div>
    </div>
  ));

  const teamItems = (activeTeamsList.length > 0 ? activeTeamsList : teams.slice(0, 4)).map(team => (
    <div key={team.id} className="flex items-center justify-between p-3 bg-flood-bg rounded-lg hover:bg-flood-card/50 cursor-pointer" onClick={() => onTeamClick(team)}>
      <div>
        <p className="font-medium text-flood-text">{team.name}</p>
        <p className="text-xs text-flood-muted">{team.type} · {team.ward}</p>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={team.status} size="sm" />
        <span className="text-sm text-flood-muted">{formatDistance(team.distance)} · {formatTime(team.eta)}</span>
      </div>
    </div>
  ));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-flood-text">Command Center Overview</h1>
          <p className="text-flood-muted text-sm">Real-time flood intelligence — Kanpur Municipal Corporation (Demo)</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status="active" />
          <span className="text-sm font-medium text-flood-primary">● LIVE SYSTEM</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {kpiCards.map((card, i) => (
          <KPICard key={i} {...card} />
        ))}
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-6">
          <Card variant="strong" className="overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-flood-border">
              <h2 className="font-semibold text-flood-text">Live GIS Map</h2>
              <LayerControl layers={mockMapLayers} activeLayers={activeMapLayers} onToggle={handleLayerToggle} />
            </div>
            <CardContent className="p-0">
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
                height="520px"
              />
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card variant="strong">
              <div className="flex items-center justify-between p-4 border-b border-flood-border">
                <h2 className="font-semibold text-flood-text">Critical Incidents</h2>
                <Link to="/incidents" className="text-sm text-flood-primary hover:underline">View all</Link>
              </div>
              <CardContent className="p-4 space-y-3">{criticalIncidentItems}</CardContent>
            </Card>

            <Card variant="strong">
              <div className="flex items-center justify-between p-4 border-b border-flood-border">
                <h2 className="font-semibold text-flood-text">High-Risk Roads</h2>
                <Link to="/roads" className="text-sm text-flood-primary hover:underline">View all</Link>
              </div>
              <CardContent className="p-4 space-y-3">{highRiskRoadItems}</CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card variant="strong">
            <div className="flex items-center justify-between p-4 border-b border-flood-border">
              <h2 className="font-semibold text-flood-text">Active Response Teams</h2>
              <Link to="/teams" className="text-sm text-flood-primary hover:underline">View all</Link>
            </div>
            <CardContent className="p-4 space-y-3">{teamItems}</CardContent>
          </Card>

          <Card variant="strong">
            <div className="flex items-center justify-between p-4 border-b border-flood-border">
              <h2 className="font-semibold text-flood-text">Quick Actions</h2>
            </div>
            <CardContent className="space-y-3 p-4">
              <Link to="/predictions"><Button variant="secondary" className="w-full justify-start gap-3" icon={<AlertTriangle className="w-5 h-5" />}><div><p className="font-medium text-flood-text">View Flood Predictions</p><p className="text-xs text-flood-muted">6-hour road-level nowcast</p></div></Button></Link>
              <Link to="/roadeye"><Button variant="secondary" className="w-full justify-start gap-3" icon={<Video className="w-5 h-5" />}><div><p className="font-medium text-flood-text">RoadEye AI Cameras</p><p className="text-xs text-flood-muted">Live CCTV & dashcam detection</p></div></Button></Link>
              <Link to="/drainage"><Button variant="secondary" className="w-full justify-start gap-3" icon={<GitBranch className="w-5 h-5" />}><div><p className="font-medium text-flood-text">Drainage Digital Twin</p><p className="text-xs text-flood-muted">Network stress & blockages</p></div></Button></Link>
              <Link to="/recommendations"><Button variant="secondary" className="w-full justify-start gap-3" icon={<Lightbulb className="w-5 h-5" />}><div><p className="font-medium text-flood-text">AI Recommendations</p><p className="text-xs text-flood-muted">Priority actions & insights</p></div></Button></Link>
              <Link to="/simulation"><Button variant="secondary" className="w-full justify-start gap-3" icon={<FlaskConical className="w-5 h-5" />}><div><p className="font-medium text-flood-text">Run What-If Simulation</p><p className="text-xs text-flood-muted">Test drainage interventions</p></div></Button></Link>
            </CardContent>
          </Card>

          <Card variant="strong">
            <div className="flex items-center justify-between p-4 border-b border-flood-border">
              <h2 className="font-semibold text-flood-text">System Status</h2>
            </div>
            <CardContent className="space-y-3 p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between p-2 rounded-lg bg-flood-bg"><span className="text-flood-muted">CCTV Cameras</span><span className="font-medium text-flood-success">6/7 Online</span></div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-flood-bg"><span className="text-flood-muted">Water Sensors</span><span className="font-medium text-flood-success">10/10 Active</span></div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-flood-bg"><span className="text-flood-muted">Drainage Network</span><span className="font-medium text-flood-warning">3 Stressed</span></div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-flood-bg"><span className="text-flood-muted">Pump Stations</span><span className="font-medium text-flood-success">2/2 Operational</span></div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-flood-bg"><span className="text-flood-muted">AI Models</span><span className="font-medium text-flood-success">All Healthy</span></div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-flood-bg"><span className="text-flood-muted">Data Ingestion</span><span className="font-medium text-flood-success">99.7% Uptime</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}