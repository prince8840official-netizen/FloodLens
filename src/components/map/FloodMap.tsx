import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, LayerGroup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { clsx } from 'clsx';
import type { Road, Drain, FloodIncident, ResponseTeam, CameraFeed, Coordinates, MapLayer } from '../../types';
import { getSeverityColor } from '../../data/mockData';

const kanpurCenter: Coordinates = { lat: 26.4499, lng: 80.3319 };

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapReadyHandler({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, []);
  return null;
}

interface MapMarkersProps {
  roads: Road[];
  drains: Drain[];
  incidents: FloodIncident[];
  teams: ResponseTeam[];
  cameras: CameraFeed[];
  activeLayers: string[];
  onRoadClick: (road: Road) => void;
  onDrainClick: (drain: Drain) => void;
  onIncidentClick: (incident: FloodIncident) => void;
  onTeamClick: (team: ResponseTeam) => void;
  onCameraClick: (camera: CameraFeed) => void;
  selectedRoad?: Road;
  selectedIncident?: FloodIncident;
}

function MapMarkers({ 
  roads, drains, incidents, teams, cameras, activeLayers, 
  onRoadClick, onDrainClick, onIncidentClick, onTeamClick, onCameraClick,
  selectedRoad, selectedIncident 
}: MapMarkersProps) {
  const floodedRoads = roads.filter(r => r.severity === 'critical' || r.severity === 'high');
  const predictedRoads = roads.filter(r => r.severity === 'moderate' && r.probability > 50);
  const blockedDrains = drains.filter(d => d.status === 'blocked' || d.blockageProbability > 70);

  const handlePolylineClick = (callback: () => void) => ({
    onClick: callback
  });

  const handleCircleMarkerClick = (callback: () => void) => ({
    onClick: callback
  });

  const handleMarkerClick = (callback: () => void) => ({
    onClick: callback
  });

  return (
    <>
      {activeLayers.includes('flooded-roads') && (
        <LayerGroup>
          {floodedRoads.map(road => (
            <Polyline
              key={road.id}
              positions={road.coordinates.map(c => [c.lat, c.lng])}
              color={getSeverityColor(road.severity)}
              weight={4}
              opacity={0.8}
              className={clsx('leaflet-interactive', selectedRoad?.id === road.id && 'selected')}
              eventHandlers={{
                click: () => onRoadClick(road)
              }}
            >
              <Popup>
                <div className="p-1">
                  <strong>{road.name}</strong> ({road.id})<br />
                  <span className="text-flood-danger">FLOODED</span> - {road.probability}% probability
                </div>
              </Popup>
            </Polyline>
          ))}
        </LayerGroup>
      )}

      {activeLayers.includes('flood-predictions') && (
        <LayerGroup>
          {predictedRoads.map(road => (
            <Polyline
              key={`pred-${road.id}`}
              positions={road.coordinates.map(c => [c.lat, c.lng])}
              color={getSeverityColor(road.severity)}
              weight={3}
              opacity={0.6}
              dashArray="8, 6"
              className="leaflet-interactive"
              eventHandlers={{
                click: () => onRoadClick(road)
              }}
            >
              <Popup>
                <div className="p-1">
                  <strong>{road.name}</strong> ({road.id})<br />
                  <span className="text-flood-warning">PREDICTED</span> - {road.probability}% in {road.expectedOnset}min
                </div>
              </Popup>
            </Polyline>
          ))}
        </LayerGroup>
      )}

      {activeLayers.includes('drainage-network') && (
        <LayerGroup>
          {drains.filter(d => d.type === 'storm-drain').map(drain => (
            <CircleMarker
              key={drain.id}
              center={[drain.coordinates.lat, drain.coordinates.lng]}
              radius={8}
              color="#06b6d4"
              fillColor={drain.status === 'blocked' ? '#ef4444' : drain.status === 'stressed' ? '#f97316' : '#06b6d4'}
              fillOpacity={0.8}
              weight={2}
              className="leaflet-interactive"
              eventHandlers={{
                click: () => onDrainClick(drain)
              }}
            >
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <strong>{drain.name}</strong> ({drain.id})<br />
                  Type: {drain.type.replace('-', ' ')}<br />
                  Capacity: {drain.capacity}% stressed<br />
                  Blockage risk: {drain.blockageProbability}%
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </LayerGroup>
      )}

      {activeLayers.includes('blocked-drains') && (
        <LayerGroup>
          {blockedDrains.map(drain => (
            <Marker
              key={`blocked-${drain.id}`}
              position={[drain.coordinates.lat, drain.coordinates.lng]}
              icon={L.divIcon({
                className: 'blocked-drain-marker',
                html: `<div class="w-6 h-6 rounded-full bg-flood-critical border-2 border-white flex items-center justify-center animate-pulse"><svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              })}
              eventHandlers={{
                click: () => onDrainClick(drain)
              }}
            >
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <strong className="text-flood-critical">⚠ BLOCKED</strong> {drain.name}<br />
                  Blockage: {drain.blockageProbability}%<br />
                  Priority: {drain.priority}
                </div>
              </Popup>
            </Marker>
          ))}
        </LayerGroup>
      )}

      {activeLayers.includes('cctv-cameras') && (
        <LayerGroup>
          {cameras.filter(c => c.status === 'online').map(camera => (
            <Marker
              key={camera.id}
              position={[camera.coordinates.lat, camera.coordinates.lng]}
              icon={L.divIcon({
                className: 'camera-marker',
                html: `<div class="w-7 h-7 rounded-lg bg-flood-primary/90 border-2 border-white flex items-center justify-center ${camera.floodDetected ? 'animate-pulse ring-2 ring-flood-danger' : ''}"><svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7z"/></svg></div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14],
              })}
              eventHandlers={{
                click: () => onCameraClick(camera)
              }}
            >
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <strong>{camera.name}</strong><br />
                  Status: <span className={camera.floodDetected ? 'text-flood-danger' : 'text-flood-success'}>{camera.floodDetected ? 'FLOOD DETECTED' : 'Normal'}</span><br />
                  Confidence: {camera.confidence}%<br />
                  Ward: {camera.ward}
                </div>
              </Popup>
            </Marker>
          ))}
        </LayerGroup>
      )}

      {activeLayers.includes('water-sensors') && (
        <LayerGroup>
          {drains.map(drain => (
            <Marker
              key={`sensor-${drain.id}`}
              position={[drain.coordinates.lat, drain.coordinates.lng]}
              icon={L.divIcon({
                className: 'sensor-marker',
                html: `<div class="w-6 h-6 rounded bg-flood-success/90 border-2 border-white flex items-center justify-center"><svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              })}
              eventHandlers={{
                click: () => onDrainClick(drain)
              }}
            >
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <strong>Sensor at {drain.name}</strong><br />
                  Water Level: {drain.capacity}% capacity<br />
                  Flow: {drain.flowRate} L/s<br />
                  Status: {drain.status}
                </div>
              </Popup>
            </Marker>
          ))}
        </LayerGroup>
      )}

      {activeLayers.includes('response-teams') && (
        <LayerGroup>
          {teams.map(team => (
            <Marker
              key={team.id}
              position={[team.coordinates.lat, team.coordinates.lng]}
              icon={L.divIcon({
                className: 'team-marker',
                html: `<div class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center ${team.status === 'enroute' ? 'animate-pulse ring-2 ring-flood-warning' : team.status === 'on-site' ? 'ring-2 ring-flood-primary' : ''}">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                  </svg>
                </div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
              })}
              eventHandlers={{
                click: () => onTeamClick(team)
              }}
            >
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <strong>{team.name}</strong><br />
                  Status: <span className="capitalize">{team.status.replace('-', ' ')}</span><br />
                  {team.currentIncidentName && `Incident: ${team.currentIncidentName}`}<br />
                  ETA: {team.eta}min ({team.distance}km)
                </div>
              </Popup>
            </Marker>
          ))}
        </LayerGroup>
      )}

      {activeLayers.includes('critical-infra') && (
        <LayerGroup>
          {drains.filter(d => d.type === 'pump-station' || d.type === 'outfall').map(drain => (
            <Marker
              key={`infra-${drain.id}`}
              position={[drain.coordinates.lat, drain.coordinates.lng]}
              icon={L.divIcon({
                className: 'infra-marker',
                html: `<div class="w-7 h-7 rounded bg-flood-critical/90 border-2 border-white flex items-center justify-center"><svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg></div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14],
              })}
              eventHandlers={{
                click: () => onDrainClick(drain)
              }}
            >
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <strong>{drain.name}</strong> ({drain.id})<br />
                  Type: {drain.type.replace('-', ' ')}<br />
                  Capacity: {drain.capacity}%<br />
                  Status: {drain.status}
                </div>
              </Popup>
            </Marker>
          ))}
        </LayerGroup>
      )}

      {incidents.map(incident => (
        <Marker
          key={incident.id}
          position={[incident.coordinates.lat, incident.coordinates.lng]}
          icon={L.divIcon({
            className: 'incident-marker',
            html: `<div class="w-9 h-9 rounded-full border-3 border-white flex items-center justify-center ${selectedIncident?.id === incident.id ? 'ring-2 ring-flood-primary' : ''} animate-pulse" style="background: ${getSeverityColor(incident.severity)}">
              <span className="text-white text-xs font-bold">!</span>
            </div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          })}
          eventHandlers={{
            click: () => onIncidentClick(incident)
          }}
        >
          <Popup>
            <div className="p-1 min-w-[220px]">
              <strong>{incident.roadName}</strong> ({incident.id})<br />
              <span className={clsx('badge', getSeverityColor(incident.severity).includes('flood-critical') && 'badge-critical', getSeverityColor(incident.severity).includes('flood-danger') && 'badge-high', getSeverityColor(incident.severity).includes('flood-warning') && 'badge-moderate', getSeverityColor(incident.severity).includes('flood-success') && 'badge-success')}>
                {incident.severity.toUpperCase()}
              </span><br />
              Probability: {incident.probability}%<br />
              Status: {incident.status.replace('-', ' ').toUpperCase()}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

interface FloodMapProps {
  roads: Road[];
  drains: Drain[];
  incidents: FloodIncident[];
  teams: ResponseTeam[];
  cameras: CameraFeed[];
  activeLayers: string[];
  center: Coordinates;
  zoom: number;
  onRoadClick: (road: Road) => void;
  onDrainClick: (drain: Drain) => void;
  onIncidentClick: (incident: FloodIncident) => void;
  onTeamClick: (team: ResponseTeam) => void;
  onCameraClick: (camera: CameraFeed) => void;
  onMapClick: (center: Coordinates, zoom: number) => void;
  selectedRoad?: Road;
  selectedIncident?: FloodIncident;
  className?: string;
  height?: string;
}

export function FloodMap({ 
  roads, drains, incidents, teams, cameras, activeLayers, 
  center, zoom, onRoadClick, onDrainClick, onIncidentClick, onTeamClick, onCameraClick, onMapClick,
  selectedRoad, selectedIncident, className, height = '400px' 
}: FloodMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;
    setMapReady(true);
    
    map.on('moveend', () => {
      const c = map.getCenter();
      onMapClick({ lat: c.lat, lng: c.lng }, map.getZoom());
    });
  };

  // Handle center/zoom changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo([center.lat, center.lng], zoom, { animate: true, duration: 1 });
    }
  }, [center, zoom]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo([center.lat, center.lng], zoom, { animate: true, duration: 1 });
    }
  }, [center, zoom]);

return (
    <div className={clsx('rounded-xl overflow-hidden border border-flood-border', className)} style={{ height }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />
        <MapMarkers
          roads={roads}
          drains={drains}
          incidents={incidents}
          teams={teams}
          cameras={cameras}
          activeLayers={activeLayers}
          onRoadClick={onRoadClick}
          onDrainClick={onDrainClick}
          onIncidentClick={onIncidentClick}
          onTeamClick={onTeamClick}
          onCameraClick={onCameraClick}
          selectedRoad={selectedRoad}
          selectedIncident={selectedIncident}
        />
      </MapContainer>
    </div>
  );
}

export function MiniMap({ center, zoom, className }: { center: Coordinates; zoom: number; className?: string }) {
  return (
    <div className={clsx('rounded-lg overflow-hidden border border-flood-border', className)} style={{ height: '200px', width: '100%' }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution=''
          subdomains="abcd"
          maxZoom={19}
        />
      </MapContainer>
    </div>
  );
}