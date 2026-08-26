import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { 
  Route, MapPin, AlertTriangle, Droplets, Database, 
  Brain, Clock, Wrench, CheckCircle, XCircle, ArrowLeft, BarChart, Map,
  Eye, Wifi, Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge, SeverityIndicator } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { FloodMap } from '../../components/map/FloodMap';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/ui/Toast';
import { Tooltip } from '../../components/ui/Tooltip';
import { mockRoads, mockDrains, mockIncidents, getSeverityColor, formatTime } from '../../data/mockData';
import type { Road, Drain } from '../../types';

const roadTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'flood-score', label: 'Flood Score' },
  { id: 'drainage', label: 'Drainage' },
  { id: 'incidents', label: 'Incidents' },
  { id: 'cameras', label: 'Cameras' },
  { id: 'sensors', label: 'Sensors' },
];

export function RoadDetails() {
  const { id } = useParams<{ id: string }>();
  const { roads, drains, incidents, cameras, onRoadClick, activeMapLayers, mapCenter, mapZoom, onMapClick, createIncidentFromPrediction } = useApp();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const road = roads.find(r => r.id === id);
  const drain = drains.find(d => d.id === road?.drainId);
  const roadIncidents = incidents.filter(i => i.roadId === id);
  const roadCameras = cameras.filter(c => c.ward === road?.ward);

  if (!road) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-flood-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-flood-text">Road Not Found</h2>
          <Link to="/roads">
            <Button variant="secondary" className="mt-4" icon={<ArrowLeft className="w-4 h-4" />}>Back to Roads</Button>
          </Link>
        </div>
      </div>
    );
  }

  const overviewContent = (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="hover"><CardContent className="p-4"><p className="text-sm text-flood-muted">Flood Probability</p><p className="font-bold text-3xl" style={{ color: getSeverityColor(road.severity) }}>{road.probability}%</p></CardContent></Card>
        <Card variant="hover"><CardContent className="p-4"><p className="text-sm text-flood-muted">Expected Onset</p><p className="font-bold text-3xl text-flood-text">{formatTime(road.expectedOnset)}</p></CardContent></Card>
        <Card variant="hover"><CardContent className="p-4"><p className="text-sm text-flood-muted">Est. Duration</p><p className="font-bold text-3xl text-flood-text">{formatTime(road.estimatedDuration)}</p></CardContent></Card>
        <Card variant="hover"><CardContent className="p-4"><p className="text-sm text-flood-muted">AI Confidence</p><p className="font-bold text-3xl text-flood-primary">{road.aiConfidence}%</p></CardContent></Card>
      </div>

      <Card variant="strong">
        <CardHeader><CardTitle>AI Analysis</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-flood-bg rounded-lg">
              <div className="flex items-center gap-2 mb-2"><Brain className="w-5 h-5 text-flood-critical" /><h4 className="font-medium text-flood-text">Probable Cause</h4></div>
              <p className="text-lg font-semibold text-flood-text">{road.probableCause}</p>
              <p className="text-sm text-flood-muted mt-1">Confidence: {road.causeConfidence}%</p>
            </div>
            <div className="p-4 bg-flood-bg rounded-lg">
              <div className="flex items-center gap-2 mb-2"><Wrench className="w-5 h-5 text-flood-primary" /><h4 className="font-medium text-flood-text">Recommended Action</h4></div>
              <p className="text-flood-text">{road.recommendedAction}</p>
            </div>
          </div>
          <div className="p-4 bg-flood-primary/10 rounded-lg border border-flood-primary/30">
            <h4 className="font-medium text-flood-primary mb-2 flex items-center gap-2"><AlertTriangle className="w-5 h-5" />Risk Factors</h4>
            <ul className="space-y-1 text-sm text-flood-text">
              <li>• Drainage stress at {road.drainStress}% (threshold: 70%)</li>
              <li>• {road.historicalIncidents} historical flood incidents</li>
              <li>• Last maintenance: {road.lastMaintenance} days ago</li>
              <li>• Traffic volume: {road.trafficVolume}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card variant="strong">
        <CardHeader><CardTitle>Road Map View</CardTitle></CardHeader>
        <CardContent className="p-0">
          <FloodMap 
            roads={mockRoads.filter(r => r.id === road.id)} 
            drains={drain ? [drain] : []} 
            incidents={roadIncidents} 
            teams={[]} 
            cameras={roadCameras} 
            activeLayers={['flooded-roads', 'flood-predictions', 'drainage-network', 'cctv-cameras']} 
            center={{ lat: road.coordinates[0].lat, lng: road.coordinates[0].lng }} 
            zoom={15} 
            onRoadClick={onRoadClick} 
            onDrainClick={() => {}} 
            onIncidentClick={() => {}} 
            onTeamClick={() => {}} 
            onCameraClick={() => {}} 
            onMapClick={onMapClick} 
            height="300px" 
          />
        </CardContent>
      </Card>
    </>
  );

  const floodScoreContent = (
    <Card variant="strong">
      <CardHeader><CardTitle>Road Flood Score: {road.floodScore}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-8">
          <div className="w-32 h-32 rounded-full border-4 flex items-center justify-center mx-auto" style={{ borderColor: getSeverityColor(road.severity) }}>
            <span className="text-4xl font-bold" style={{ color: getSeverityColor(road.severity) }}>{road.floodScore}</span>
          </div>
          <p className="mt-4 text-flood-muted">Composite risk score (0-100)</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Rainfall Risk', value: 92, color: '#06b6d4' },
            { label: 'Drainage Stress', value: road.drainStress, color: '#f97316' },
            { label: 'Terrain', value: 76, color: '#8b5cf6' },
            { label: 'Historical Risk', value: 89, color: '#ec4899' },
            { label: 'Visual Evidence', value: 95, color: '#ef4444' },
            { label: 'Sensor Evidence', value: 91, color: '#22c55e' }
          ].map((factor, i) => (
            <div key={factor.label} className="p-4 bg-flood-bg rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-flood-text">{factor.label}</span>
                <span className="font-bold" style={{ color: factor.color }}>{factor.value}</span>
              </div>
              <div className="h-2 bg-flood-border rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${factor.value}%`, backgroundColor: factor.color }} />
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-flood-primary/10 rounded-lg border border-flood-primary/30">
          <h4 className="font-medium text-flood-primary mb-2">Score Calculation</h4>
          <p className="text-sm text-flood-text">Flood Score = (Rainfall × 0.25) + (Drainage × 0.25) + (Terrain × 0.15) + (Historical × 0.15) + (Visual × 0.10) + (Sensor × 0.10)<br />Weights calibrated on 5 years of Kanpur flood data. Updated daily with latest sensor readings.</p>
        </div>
      </CardContent>
    </Card>
  );

  const drainageContent = drain && (
    <Card variant="strong">
      <CardHeader><CardTitle>Connected Drain: {drain.name}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="hover"><CardContent className="p-4 text-center"><p className="text-sm text-flood-muted">Capacity Stress</p><p className="font-bold text-3xl text-flood-warning">{drain.capacity}%</p></CardContent></Card>
          <Card variant="hover"><CardContent className="p-4 text-center"><p className="text-sm text-flood-muted">Blockage Risk</p><p className="font-bold text-3xl text-flood-critical">{drain.blockageProbability}%</p></CardContent></Card>
          <Card variant="hover"><CardContent className="p-4 text-center"><p className="text-sm text-flood-muted">Flow Rate</p><p className="font-bold text-3xl text-flood-primary">{drain.flowRate} L/s</p></CardContent></Card>
          <Card variant="hover"><CardContent className="p-4 text-center"><p className="text-sm text-flood-muted">Priority</p><Badge variant={drain.priority === 'P1' ? 'critical' : drain.priority === 'P2' ? 'high' : 'moderate'} size="md">{drain.priority}</Badge></CardContent></Card>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card variant="hover"><CardContent className="p-4"><h4 className="font-medium text-flood-text mb-2">Status Details</h4><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-flood-muted">Status</span><StatusBadge status={drain.status as any} /></div><div className="flex justify-between"><span className="text-flood-muted">Depth</span><span className="font-medium">{drain.depth}m</span></div><div className="flex justify-between"><span className="text-flood-muted">Last Maintenance</span><span className="font-medium">{drain.lastMaintenance} days ago</span></div><div className="flex justify-between"><span className="text-flood-muted">Historical Incidents</span><span className="font-medium">{drain.historicalIncidents}</span></div><div className="flex justify-between"><span className="text-flood-muted">Type</span><span className="font-medium capitalize">{drain.type.replace('-', ' ')}</span></div></div></CardContent></Card>
          <Card variant="hover"><CardContent className="p-4"><h4 className="font-medium text-flood-text mb-2">Connected Roads</h4><div className="space-y-1">{drain.connectedRoads.map(rid => {const r = mockRoads.find(ro => ro.id === rid); return r ? <Link key={rid} to={`/roads/${rid}`} className="flex items-center justify-between text-sm p-2 hover:bg-flood-bg rounded-lg"><span>{r.name} ({rid})</span><StatusBadge status={r.severity} size="sm" /></Link> : null; })}</div></CardContent></Card>
        </div>
        <Button className="w-full" icon={<Wrench className="w-4 h-4" />}>Create Inspection Task</Button>
      </CardContent>
    </Card>
  );

  const incidentsContent = (
    <Card variant="strong">
      <CardHeader><CardTitle>Historical Incidents ({roadIncidents.length})</CardTitle></CardHeader>
      <CardContent className="p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-flood-border">
              <th className="px-4 py-3 text-left font-medium text-flood-muted">Incident ID</th>
              <th className="px-4 py-3 text-left font-medium text-flood-muted">Date</th>
              <th className="px-4 py-3 text-left font-medium text-flood-muted">Severity</th>
              <th className="px-4 py-3 text-left font-medium text-flood-muted">Duration</th>
              <th className="px-4 py-3 text-left font-medium text-flood-muted">Cause</th>
              <th className="px-4 py-3 text-left font-medium text-flood-muted">Status</th>
            </tr>
          </thead>
          <tbody>
            {roadIncidents.map(inc => (
              <tr key={inc.id} className="border-b border-flood-border/50 hover:bg-flood-card/50 cursor-pointer" onClick={() => window.location.href = `/incidents/${inc.id}`}>
                <td className="px-4 py-3 font-mono text-xs">{inc.id}</td>
                <td className="px-4 py-3 text-sm">{new Date(inc.timestamp).toLocaleDateString()}</td>
                <td className="px-4 py-3"><StatusBadge status={inc.severity} size="sm" /></td>
                <td className="px-4 py-3 text-sm">{formatTime(Math.round((new Date(inc.updatedAt).getTime() - new Date(inc.timestamp).getTime()) / 60000))}</td>
                <td className="px-4 py-3 text-sm">{inc.probableCause}</td>
                <td className="px-4 py-3"><Badge variant="info" size="sm">{inc.status.replace('-', ' ').toUpperCase()}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );

  const camerasContent = (
    <Card variant="strong">
      <CardHeader><CardTitle>CCTV Cameras in {road.ward}</CardTitle></CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {roadCameras.map(cam => (
            <div key={cam.id} className="group relative rounded-lg overflow-hidden bg-flood-bg">
              <div className="aspect-video relative"><img src={cam.imageUrl} alt={cam.name} className="w-full h-full object-cover" /></div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-flood-text">{cam.name}</h4>
                  <StatusBadge status={cam.severity} size="sm" />
                </div>
                <p className="text-xs text-flood-muted">Confidence: {cam.confidence}% · {new Date(cam.lastUpdated).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const sensorsContent = (() => {
    const sensors = drain ? [
      { id: `WL-${drain.id}`, type: 'water-level', value: drain.capacity > 70 ? 2.6 : 1.2, unit: 'm', threshold: drain.depth, status: drain.capacity > 70 ? 'critical' : 'normal' },
      { id: `FL-${drain.id}`, type: 'flow', value: drain.flowRate, unit: 'L/s', threshold: drain.flowRate * 2, status: 'normal' }
    ] : [];

    return (
      <Card variant="strong">
        <CardHeader><CardTitle>Water Level Sensors</CardTitle></CardHeader>
        <CardContent className="p-4">
          <p className="text-sm text-flood-muted mb-4">Sensors monitoring drainage network connected to {road.name}</p>
          <div className="space-y-2">
            {sensors.map(sensor => (
              <div key={sensor.id} className="flex items-center justify-between p-3 bg-flood-bg rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-flood-primary/20 flex items-center justify-center">
                    <Database className="w-4 h-4 text-flood-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-flood-text">{sensor.id}</p>
                    <p className="text-xs text-flood-muted">{sensor.type.replace('-', ' ')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-flood-text">{sensor.value} {sensor.unit}</p>
                  <StatusBadge status={sensor.status as any} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  })();

  const tabContent = {
    overview: overviewContent,
    'flood-score': floodScoreContent,
    drainage: drainageContent,
    incidents: incidentsContent,
    cameras: camerasContent,
    sensors: sensorsContent,
  };

  if (!road) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-flood-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-flood-text">Road Not Found</h2>
          <Link to="/roads"><Button variant="secondary" className="mt-4" icon={<ArrowLeft className="w-4 h-4" />}>Back to Roads</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/roads"><Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />} size="sm">Back</Button></Link>
          <div>
            <h1 className="text-2xl font-bold text-flood-text">{road.name}</h1>
            <p className="text-flood-muted text-sm">{road.id} · {road.ward}, {road.zone}</p>
          </div>
        </div>
        <div className="flex items-center gap-3"><StatusBadge status={road.severity} size="lg" /><SeverityIndicator severity={road.severity} showLabel={false} size="lg" /></div>
      </div>
      <Tabs tabs={[{ id: 'overview', label: 'Overview' }, { id: 'flood-score', label: 'Flood Score' }, { id: 'drainage', label: 'Drainage' }, { id: 'incidents', label: 'Incidents' }, { id: 'cameras', label: 'Cameras' }, { id: 'sensors', label: 'Sensors' }]} activeTab={activeTab} onChange={setActiveTab} variant="pills" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">{tabContent[activeTab]}</div>
        <div className="space-y-6">
          <Card variant="strong"><CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader><CardContent className="space-y-3">{road.severity !== 'normal' && <Tooltip content="Create incident from this road prediction"><Button className="w-full justify-start" icon={<AlertTriangle className="w-4 h-4" />} onClick={() => { toast({ type: 'info', title: 'Creating Incident', message: 'Auto-registering incident from prediction...' }); setTimeout(() => { createIncidentFromPrediction(road.id); toast({ type: 'success', title: 'Incident Created', message: `Incident auto-registered for ${road.name}` }); }, 800); }}>Create Incident</Button></Tooltip>}{drain && <Button variant="secondary" className="w-full justify-start" icon={<Wrench className="w-4 h-4" />}>Schedule Drain Inspection</Button>}<Button variant="secondary" className="w-full justify-start" icon={<Eye className="w-4 h-4" />}>View Live Cameras</Button><Button variant="secondary" className="w-full justify-start" icon={<Download className="w-4 h-4" />}>Export Road Report</Button></CardContent></Card><Card variant="strong"><CardHeader><CardTitle>Road Details</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-flood-muted">Road ID</span><span className="font-mono">{road.id}</span></div><div className="flex justify-between"><span className="text-flood-muted">Name</span><span>{road.name}</span></div><div className="flex justify-between"><span className="text-flood-muted">Length</span><span>{road.length} km</span></div><div className="flex justify-between"><span className="text-flood-muted">Ward</span><span>{road.ward}</span></div><div className="flex justify-between"><span className="text-flood-muted">Zone</span><span>{road.zone}</span></div><div className="flex justify-between"><span className="text-flood-muted">Traffic</span><span className="capitalize">{road.trafficVolume}</span></div><div className="flex justify-between"><span className="text-flood-muted">Critical Infra</span><span>{road.criticalInfrastructure ? 'Yes' : 'No'}</span></div><div className="flex justify-between"><span className="text-flood-muted">Drain</span><span>{road.drainId}</span></div><div className="flex justify-between"><span className="text-flood-muted">Last Maintenance</span><span>{road.lastMaintenance} days ago</span></div></CardContent></Card>
        </div>
      </div>
    </div>
  );
}