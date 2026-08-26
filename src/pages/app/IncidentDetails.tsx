import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { clsx } from 'clsx';
import { 
  AlertTriangle, MapPin, Clock, Droplets, Database, 
  Camera, MessageSquare, Brain, CheckCircle, 
  ChevronRight, ArrowLeft, Download, Share2, 
  Map, Eye, AlertCircle, Check, X, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { useApp } from '../../context/AppContext';
import { mockIncidents, getIncidentStatusLabel, formatTime } from '../../data/mockData';
import type { FloodIncident } from '../../types';

const timelineStages = [
  { id: 'predicted', label: 'Predicted', icon: AlertTriangle },
  { id: 'detected', label: 'Detected', icon: Eye },
  { id: 'verified', label: 'Verified', icon: CheckCircle },
  { id: 'registered', label: 'Registered', icon: Database },
  { id: 'assigned', label: 'Assigned', icon: AlertCircle },
  { id: 'responding', label: 'Responding', icon: MapPin },
  { id: 'resolved', label: 'Resolved', icon: Check },
];

const evidenceTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'camera', label: 'Camera Evidence' },
  { id: 'sensors', label: 'Sensors' },
  { id: 'citizen', label: 'Citizen Reports' },
  { id: 'rainfall', label: 'Rainfall' },
  { id: 'ai', label: 'AI Analysis' },
];

export function IncidentDetails() {
  const { id } = useParams<{ id: string }>();
  const { incidents, assignTeamToIncident, resolveIncident, getAvailableTeams } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  const incident = incidents.find(i => i.id === id);
  const availableTeams = getAvailableTeams();

  if (!incident) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-flood-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-flood-text">Incident Not Found</h2>
          <p className="text-flood-muted mt-2">Incident {id} does not exist</p>
          <Link to="/incidents"><Button variant="secondary" className="mt-4" icon={<ArrowLeft className="w-4 h-4" />}>Back to Incidents</Button></Link>
        </div>
      </div>
    );
  }

  const completedStages = incident.timeline.map(t => t.stage);

  const handleAssignTeam = () => {
    if (selectedTeam) {
      assignTeamToIncident(incident.id, selectedTeam);
      setShowAssignModal(false);
      setSelectedTeam('');
    }
  };

  const handleResolve = () => {
    resolveIncident(incident.id, {
      beforeImageUrl: incident.evidence[0]?.imageUrl || '',
      afterImageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
      sensorVerification: true,
      cameraVerification: true,
      aiVerification: true,
      verifiedAt: new Date(),
      verifiedBy: 'FloodLens AI',
      notes: 'Road cleared, water level normalized',
    });
    setShowResolveModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/incidents"><Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />} size="sm">Back</Button></Link>
          <div>
            <h1 className="text-2xl font-bold text-flood-text">Incident {incident.id}</h1>
            <p className="text-flood-muted text-sm">{incident.roadName} — {incident.ward}, {incident.zone}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={incident.severity} size="lg" />
          <Badge variant="info" size="sm">{getIncidentStatusLabel(incident.status)}</Badge>
        </div>
      </div>

      <Card variant="strong">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6 flex-wrap">
              {timelineStages.map((stage, i) => (
                <div key={stage.id} className="flex items-center gap-2">
                  <div className={clsx('flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all',
                    completedStages.includes(stage.id as any) ? 'bg-flood-success text-white' : 
                    stage.id === (incident.status as string) ? 'bg-flood-primary/20 text-flood-primary ring-2 ring-flood-primary' :
                    'bg-flood-border text-flood-muted'
                  )}>
                    {completedStages.includes(stage.id as any) ? <Check className="w-4 h-4" /> : <stage.icon className="w-4 h-4" />}
                  </div>
                  <span className={clsx('text-sm font-medium hidden sm:block', 
                    completedStages.includes(stage.id as any) ? 'text-flood-success' : 
                    stage.id === (incident.status as string) ? 'text-flood-primary' : 'text-flood-muted'
                  )}>{stage.label}</span>
                  {i < timelineStages.length - 1 && (
                    <div className={clsx('w-16 h-0.5 hidden sm:block', completedStages.includes(stage.id as any) ? 'bg-flood-success' : 'bg-flood-border')} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs tabs={evidenceTabs} activeTab={activeTab} onChange={setActiveTab} variant="default" />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card variant="hover"><CardContent className="p-4"><p className="text-sm text-flood-muted">Location</p><p className="font-medium text-flood-text">{incident.roadName}</p><p className="text-xs text-flood-muted">{incident.ward}, {incident.zone}</p></CardContent></Card>
                <Card variant="hover"><CardContent className="p-4"><p className="text-sm text-flood-muted">GPS Coordinates</p><p className="font-mono text-xs text-flood-text">{incident.coordinates.lat.toFixed(6)}, {incident.coordinates.lng.toFixed(6)}</p></CardContent></Card>
                <Card variant="hover"><CardContent className="p-4"><p className="text-sm text-flood-muted">Timestamp</p><p className="font-mono text-sm text-flood-text">{new Date(incident.timestamp).toLocaleString()}</p></CardContent></Card>
                <Card variant="hover"><CardContent className="p-4"><p className="text-sm text-flood-muted">AI Confidence</p><p className="font-bold text-2xl text-flood-primary">{incident.aiConfidence}%</p></CardContent></Card>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card variant="hover"><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Droplets className="w-4 h-4 text-flood-primary" /><p className="text-sm text-flood-muted">Rainfall</p></div><p className="font-bold text-xl text-flood-text">{incident.rainfall} mm/hr</p></CardContent></Card>
                <Card variant="hover"><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Database className="w-4 h-4 text-flood-warning" /><p className="text-sm text-flood-muted">Drainage Stress</p></div><p className="font-bold text-xl text-flood-warning">{incident.drainageStress}%</p></CardContent></Card>
                <Card variant="hover"><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Brain className="w-4 h-4 text-flood-critical" /><p className="text-sm text-flood-muted">Probable Cause</p></div><p className="font-medium text-flood-text">{incident.probableCause}</p><p className="text-xs text-flood-muted">{incident.causeConfidence}% confidence</p></CardContent></Card>
                <Card variant="hover"><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-flood-success" /><p className="text-sm text-flood-muted">Status Duration</p></div><p className="font-bold text-xl text-flood-success">{incident.timeline.length > 1 ? formatTime((new Date(incident.timeline[incident.timeline.length - 1].timestamp).getTime() - new Date(incident.timestamp).getTime()) / (1000 * 60)) : 'Just now'}</p></CardContent></Card>
              </div>

              <Card variant="strong">
                <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-0">
                    {incident.timeline.map((event, i) => (
                      <div key={event.id} className={clsx('flex items-start gap-4 p-4 border-l-2', i === incident.timeline.length - 1 ? 'border-flood-primary bg-flood-primary/5' : 'border-flood-border')}>
                        <div className={clsx('flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold', event.automated ? 'bg-flood-primary' : 'bg-flood-warning')}>
                          {event.automated ? <Brain className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1"><span className="font-medium text-flood-text">{event.description}</span><Badge variant={event.automated ? 'info' : 'warning'} size="sm">{event.automated ? 'Auto' : 'Manual'}</Badge></div>
                          <p className="text-sm text-flood-muted">{event.actor} · {new Date(event.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'camera' && (
            <Card variant="strong">
              <CardHeader><CardTitle>Camera Evidence</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  {incident.cameraData.map((cam, i) => (
                    <div key={cam.id} className="group relative rounded-lg overflow-hidden bg-flood-bg">
                      <div className="aspect-video relative"><img src={cam.imageUrl} alt={cam.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" /></div>
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2"><h4 className="font-medium text-flood-text">{cam.name}</h4><StatusBadge status={cam.severity as any} size="sm" /></div>
                        <p className="text-xs text-flood-muted">{cam.ward} · {new Date(cam.lastUpdated).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                  {incident.cameraData.length === 0 && <div className="col-span-2 text-center py-12 text-flood-muted"><Camera className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No camera evidence available</p></div>}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'sensors' && (
            <Card variant="strong">
              <CardHeader><CardTitle>Sensor Readings</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full"><thead><tr className="border-b border-flood-border"><th className="px-4 py-3 text-left font-medium text-flood-muted">Sensor</th><th className="px-4 py-3 text-left font-medium text-flood-muted">Type</th><th className="px-4 py-3 text-left font-medium text-flood-muted">Value</th><th className="px-4 py-3 text-left font-medium text-flood-muted">Threshold</th><th className="px-4 py-3 text-left font-medium text-flood-muted">Status</th><th className="px-4 py-3 text-left font-medium text-flood-muted">Time</th></tr></thead>
                  <tbody>{incident.sensorData.map(sensor => (<tr key={sensor.id} className="border-b border-flood-border/50"><td className="px-4 py-3 font-mono text-sm">{sensor.sensorId}</td><td className="px-4 py-3"><Badge variant="info" size="sm">{sensor.type.replace('-', ' ')}</Badge></td><td className="px-4 py-3 font-mono">{sensor.value} {sensor.unit}</td><td className="px-4 py-3 text-flood-muted">{sensor.threshold} {sensor.unit}</td><td className="px-4 py-3"><StatusBadge status={sensor.status as any} size="sm" /></td><td className="px-4 py-3 text-sm text-flood-muted">{new Date(sensor.timestamp).toLocaleTimeString()}</td></tr>))}</tbody></table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'citizen' && (
            <Card variant="strong">
              <CardHeader><CardTitle>Citizen Reports</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-flood-border/50">
                  {incident.citizenReports.map(report => (
                    <div key={report.id} className="p-4 hover:bg-flood-card/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1"><span className="font-medium text-flood-text">{report.id}</span><StatusBadge status={report.status} size="sm" /></div>
                          <p className="text-sm text-flood-muted">{report.address}</p>
                          <p className="text-sm text-flood-text mt-1">{report.description}</p>
                          <div className="flex items-center gap-2 mt-2"><Badge variant="info" size="sm">{report.aiClassification}</Badge><Badge variant="default" size="sm">{report.aiConfidence}% confidence</Badge></div>
                        </div>
                        {report.imageUrl && <img src={report.imageUrl} alt="Citizen report" className="w-24 h-24 rounded-lg object-cover" />}
                      </div>
                    </div>
                  ))}
                  {incident.citizenReports.length === 0 && <div className="p-8 text-center text-flood-muted"><MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No citizen reports for this incident</p></div>}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'rainfall' && (
            <Card variant="strong">
              <CardHeader><CardTitle>Rainfall Data</CardTitle></CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card variant="hover"><CardContent className="p-4 text-center"><p className="text-sm text-flood-muted">Current Rate</p><p className="font-bold text-3xl text-flood-primary">{incident.rainfall} mm/hr</p></CardContent></Card>
                  <Card variant="hover"><CardContent className="p-4 text-center"><p className="text-sm text-flood-muted">Accumulated (1hr)</p><p className="font-bold text-3xl text-flood-warning">{incident.rainfall * 0.8} mm</p></CardContent></Card>
                  <Card variant="hover"><CardContent className="p-4 text-center"><p className="text-sm text-flood-muted">Forecast (3hr)</p><p className="font-bold text-3xl text-flood-critical">{incident.rainfall * 1.2} mm</p></CardContent></Card>
                  <Card variant="hover"><CardContent className="p-4 text-center"><p className="text-sm text-flood-muted">Intensity</p><Badge variant={incident.rainfall > 50 ? 'critical' : incident.rainfall > 30 ? 'high' : 'moderate'} size="md">{incident.rainfall > 50 ? 'Extreme' : incident.rainfall > 30 ? 'Heavy' : 'Moderate'}</Badge></CardContent></Card>
                </div>
                <p className="text-sm text-flood-muted">Source: IMD NOWCAST + GPM/IMERG satellite estimates. Updated every 15 minutes.</p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'ai' && (
            <Card variant="strong">
              <CardHeader><CardTitle>AI Evidence Fusion</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="bg-flood-bg rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4"><h4 className="font-semibold text-flood-text">Flood Confidence Score</h4><div className="text-4xl font-bold text-flood-primary">95%</div></div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-flood-primary" /><span className="text-sm text-flood-text">Rainfall Correlation</span></div><span className="font-bold text-flood-primary">72%</span></div>
                    <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-flood-critical" /><span className="text-sm text-flood-text">Dashcam Detection</span></div><span className="font-bold text-flood-critical">+15%</span></div>
                    <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-flood-warning" /><span className="text-sm text-flood-text">Drain Sensor</span></div><span className="font-bold text-flood-warning">+8%</span></div>
                    <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-flood-success" /><span className="text-sm text-flood-text">Historical Pattern</span></div><span className="font-bold text-flood-success">+5%</span></div>
                    <div className="border-t border-flood-border pt-3 flex items-center justify-between"><span className="font-semibold text-flood-text">Final Confidence</span><span className="text-2xl font-bold text-flood-primary">95%</span></div>
                  </div>
                </div>
                <div className="p-4 bg-flood-primary/10 rounded-lg border border-flood-primary/30"><p className="text-sm text-flood-primary"><strong>Explanation:</strong> Multiple independent signals indicate a high-probability flood event. Rainfall intensity exceeds drainage capacity. Visual confirmation from CCTV and dashcam. Sensor data shows drainage stress at 82%. Historical pattern matches 17 previous incidents on this road.</p></div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card variant="strong">
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {incident.status === 'verified' && !incident.assignedTeamId && <Button className="w-full justify-start" onClick={() => setShowAssignModal(true)} icon={<MapPin className="w-4 h-4" />}>Assign Response Team</Button>}
              {incident.assignedTeamId && incident.status !== 'resolved' && <Button className="w-full justify-start" variant="secondary" icon={<Eye className="w-4 h-4" />}>View Team Status</Button>}
              {incident.status === 'responding' && <Button className="w-full justify-start" variant="success" onClick={() => setShowResolveModal(true)} icon={<CheckCircle className="w-4 h-4" />}>Mark Work Complete</Button>}
              {incident.status === 'resolved' && <Button className="w-full justify-start" variant="secondary" icon={<Download className="w-4 h-4" />}>Download Report</Button>}
              <Button variant="ghost" className="w-full justify-start" icon={<Share2 className="w-4 h-4" />}>Share Incident</Button>
            </CardContent>
          </Card>

          <Card variant="strong">
            <CardHeader><CardTitle>Evidence Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm"><span className="text-flood-muted">Camera Feeds</span><span className="font-medium">{incident.cameraData.length}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-flood-muted">Sensor Readings</span><span className="font-medium">{incident.sensorData.length}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-flood-muted">Citizen Reports</span><span className="font-medium">{incident.citizenReports.length}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-flood-muted">Evidence Items</span><span className="font-medium">{incident.evidence.length}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Response Team" size="md">
        <div className="space-y-4"><p className="text-flood-muted">Select a team to assign to incident {incident.id}</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {availableTeams.map(team => (<button key={team.id} onClick={() => setSelectedTeam(team.id)} className={clsx('w-full p-3 rounded-lg border text-left transition-colors', selectedTeam === team.id ? 'border-flood-primary bg-flood-primary/10' : 'border-flood-border hover:bg-flood-card/50')}><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-flood-primary/20 flex items-center justify-center"><MapPin className="w-4 h-4 text-flood-primary" /></div><div><p className="font-medium text-flood-text">{team.name}</p><p className="text-xs text-flood-muted">{team.type} · {team.distance}km away · ETA {team.eta}min</p></div></div><StatusBadge status={team.status} size="sm" /></div></button>))}
            {availableTeams.length === 0 && <p className="text-center text-flood-muted py-4">No available teams</p>}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-flood-border"><Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button><Button onClick={handleAssignTeam} disabled={!selectedTeam}>Assign Team</Button></div>
        </div>
      </Modal>

      <Modal isOpen={showResolveModal} onClose={() => setShowResolveModal(false)} title="Verify Resolution" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-flood-bg rounded-lg"><p className="text-sm text-flood-muted">BEFORE</p><img src={incident.evidence[0]?.imageUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'} alt="Before" className="mt-2 rounded-lg w-full h-32 object-cover" /><p className="text-xs text-flood-danger mt-1">Severe Waterlogging</p></div>
            <div className="text-center p-4 bg-flood-bg rounded-lg"><p className="text-sm text-flood-muted">AFTER</p><img src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop" alt="After" className="mt-2 rounded-lg w-full h-32 object-cover" /><p className="text-xs text-flood-success mt-1">Road Clear</p></div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-lg bg-flood-success/10 border border-flood-success/30"><CheckCircle className="w-6 h-6 text-flood-success mx-auto mb-1" /><p className="text-xs text-flood-success">Camera Verified</p></div>
            <div className="p-3 rounded-lg bg-flood-success/10 border border-flood-success/30"><Database className="w-6 h-6 text-flood-success mx-auto mb-1" /><p className="text-xs text-flood-success">Sensor Verified</p></div>
            <div className="p-3 rounded-lg bg-flood-success/10 border border-flood-success/30"><Brain className="w-6 h-6 text-flood-success mx-auto mb-1" /><p className="text-xs text-flood-success">AI Verified</p></div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-flood-border"><Button variant="secondary" onClick={() => setShowResolveModal(false)}>Cancel</Button><Button variant="success" onClick={handleResolve} icon={<CheckCircle className="w-4 h-4" />}>Confirm Resolution</Button></div>
        </div>
      </Modal>
    </div>
  );
}