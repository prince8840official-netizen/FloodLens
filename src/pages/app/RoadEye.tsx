import { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import { 
  Video, Search, Eye, EyeOff, AlertTriangle,
  Camera, Wifi, Download, Shield, Play, Pause,
  Volume2, VolumeX, Maximize, Minimize, X
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { useApp } from '../../context/AppContext';
import { mockCameraFeeds } from '../../data/mockData';
import type { CameraFeed } from '../../types';

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'maintenance', label: 'Maintenance' },
];

const detectionOptions = [
  { value: 'all', label: 'All' },
  { value: 'detected', label: 'Flood Detected' },
  { value: 'normal', label: 'Normal' },
];

export function RoadEye() {
  const { cameras, onCameraClick } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detectionFilter, setDetectionFilter] = useState('all');
  const [selectedCamera, setSelectedCamera] = useState<CameraFeed | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const filteredCameras = useMemo(() => cameras.filter(cam => {
    const matchesStatus = statusFilter === 'all' || cam.status === statusFilter;
    const matchesDetection = detectionFilter === 'all' || (detectionFilter === 'detected' && cam.floodDetected) || (detectionFilter === 'normal' && !cam.floodDetected);
    const matchesSearch = searchQuery === '' || cam.name.toLowerCase().includes(searchQuery.toLowerCase()) || cam.ward.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesDetection && matchesSearch;
  }), [cameras, statusFilter, detectionFilter, searchQuery]);

  const detectedCount = cameras.filter(c => c.floodDetected).length;
  const onlineCount = cameras.filter(c => c.status === 'online').length;

  const cameraItems = filteredCameras.map(cam => (
    <Card key={cam.id} variant="hover" className="overflow-hidden" onClick={() => { setSelectedCamera(cam); onCameraClick(cam); setVideoPlaying(true); }}>
      <div className="relative aspect-video overflow-hidden bg-flood-bg">
        <img src={cam.imageUrl} alt={cam.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
          <Button size="lg" variant="secondary" onClick={(e) => { e.stopPropagation(); setSelectedCamera(cam); setVideoPlaying(true); }} icon={<Play className="w-5 h-5" />}>View Live</Button>
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          <StatusBadge status={cam.severity} size="sm" />
          <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', cam.status === 'online' ? 'bg-flood-success/90 text-white' : 'bg-flood-muted/90 text-white')}>
            {cam.status}
          </span>
        </div>
        {cam.floodDetected && (
          <div className="absolute bottom-2 left-2 right-2 bg-flood-danger/90 text-white px-3 py-1 rounded text-center text-sm font-medium animate-pulse">
            🔴 FLOOD DETECTED — {cam.confidence}% confidence
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-flood-text">{cam.name}</h4>
          <span className="text-xs text-flood-muted">{cam.ward}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-flood-muted">Confidence: {cam.confidence}%</span>
          <span className="text-flood-muted">{new Date(cam.lastUpdated).toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  ));

  const modalContent = selectedCamera ? (
    <div className="space-y-4">
      <div className="relative aspect-video bg-flood-bg rounded-lg overflow-hidden">
        <img src={selectedCamera.imageUrl} alt={selectedCamera.name} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => setVideoPlaying(!videoPlaying)} icon={videoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}>{videoPlaying ? 'Pause' : 'Play'}</Button>
              <Button variant="secondary" size="sm" icon={<Volume2 className="w-4 h-4" />}>Unmute</Button>
              <Button variant="secondary" size="sm" icon={<Maximize className="w-4 h-4" />}>Fullscreen</Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={selectedCamera.floodDetected ? 'critical' : 'success'} size="sm">{selectedCamera.floodDetected ? 'Flood Detected' : 'Normal'}</Badge>
              <Badge variant="info" size="sm">{selectedCamera.confidence}% Confidence</Badge>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="hover"><CardContent className="p-4 text-center"><p className="text-sm text-flood-muted">Ward</p><p className="font-medium text-flood-text">{selectedCamera.ward}</p></CardContent></Card>
        <Card variant="hover"><CardContent className="p-4 text-center"><p className="text-sm text-flood-muted">Status</p><StatusBadge status={selectedCamera.status as any} /></CardContent></Card>
        <Card variant="hover"><CardContent className="p-4 text-center"><p className="text-sm text-flood-muted">Severity</p><StatusBadge status={selectedCamera.severity} /></CardContent></Card>
        <Card variant="hover"><CardContent className="p-4 text-center"><p className="text-sm text-flood-muted">Last Updated</p><p className="font-medium text-flood-text">{new Date(selectedCamera.lastUpdated).toLocaleTimeString()}</p></CardContent></Card>
      </div>
      <div className="p-4 bg-flood-success/10 rounded-lg border border-flood-success/30">
        <h4 className="font-medium text-flood-success mb-2 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Privacy Protection Active
        </h4>
        <p className="text-sm text-flood-text">
          Faces and license plates are automatically blurred in real-time. 
          Raw footage is not stored. Only detection metadata and anonymized clips are retained for AI training.
        </p>
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-flood-text">RoadEye AI</h1>
          <p className="text-flood-muted text-sm">Computer vision for real-world flood detection</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-flood-muted">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-flood-danger animate-pulse" /> {detectedCount} Flood Detected</span>
            <span className="flex items-center gap-1 ml-4"><span className="w-2 h-2 rounded-full bg-flood-success" /> {onlineCount}/{cameras.length} Online</span>
          </div>
          <Badge variant="success">Privacy Protected</Badge>
        </div>
      </div>

      <Card variant="strong"><CardContent className="p-4"><div className="flex flex-wrap gap-4 items-end"><div className="flex-1 min-w-[250px]"><label className="block text-sm font-medium text-flood-muted mb-1">Search Cameras</label><Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name, ward..." /></div><div className="min-w-[160px]"><label className="block text-sm font-medium text-flood-muted mb-1">Status</label><Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={statusOptions} placeholder="All" /></div><div className="min-w-[160px]"><label className="block text-sm font-medium text-flood-muted mb-1">Detection</label><Select value={detectionFilter} onChange={e => setDetectionFilter(e.target.value)} options={detectionOptions} placeholder="All" /></div></div></CardContent></Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{cameraItems}{filteredCameras.length === 0 && <div className="col-span-full text-center py-12 text-flood-muted"><Camera className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No cameras match current filters</p></div>}</div>

      <Modal isOpen={!!selectedCamera} onClose={() => { setSelectedCamera(null); setVideoPlaying(false); }} size="xl" title={selectedCamera?.name}>
        {modalContent}
      </Modal>
    </div>
  );
}