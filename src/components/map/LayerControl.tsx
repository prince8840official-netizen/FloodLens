import { clsx } from 'clsx';
import type { MapLayer } from '../../types';
import { 
  Route, GitBranch, AlertCircle, Wifi, 
  Database, Truck, Building2, Eye, EyeOff
} from 'lucide-react';

const layerIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'flooded-roads': Route,
  'flood-predictions': AlertCircle,
  'drainage-network': GitBranch,
  'blocked-drains': AlertCircle,
  'cctv-cameras': Wifi,
  'water-sensors': Database,
  'response-teams': Truck,
  'critical-infra': Building2,
};

interface LayerControlProps {
  layers: MapLayer[];
  activeLayers: string[];
  onToggle: (layerId: string) => void;
  className?: string;
}

export function LayerControl({ layers, activeLayers, onToggle, className }: LayerControlProps) {
  return (
    <div className={clsx('glass-strong rounded-xl p-3 border border-flood-border', className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-flood-text">Map Layers</h3>
        <span className="text-xs text-flood-muted">{activeLayers.length} active</span>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {layers.map(layer => {
          const Icon = layerIcons[layer.id] || Eye;
          const isActive = activeLayers.includes(layer.id);
          return (
            <label 
              key={layer.id} 
              className={clsx('flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors hover:bg-flood-card/50')}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => onToggle(layer.id)}
                className="w-4 h-4 rounded border-flood-border text-flood-primary focus:ring-flood-primary"
                aria-label={layer.name}
              />
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: layer.color }}
                />
                <Icon className={clsx('w-4 h-4 flex-shrink-0', isActive ? 'text-flood-text' : 'text-flood-muted')} />
                <span className={clsx('text-sm font-medium truncate', isActive ? 'text-flood-text' : 'text-flood-muted')}>
                  {layer.name}
                </span>
              </div>
              {isActive && <Eye className="w-4 h-4 text-flood-primary" />}
            </label>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-flood-border flex gap-2">
        <button 
          onClick={() => layers.filter(l => activeLayers.includes(l.id)).forEach(l => onToggle(l.id))}
          className="btn-ghost text-xs flex-1"
        >
          <EyeOff className="w-3.5 h-3.5 mr-1" />
          Hide All
        </button>
        <button 
          onClick={() => layers.filter(l => !activeLayers.includes(l.id)).forEach(l => onToggle(l.id))}
          className="btn-ghost text-xs flex-1"
        >
          <Eye className="w-3.5 h-3.5 mr-1" />
          Show All
        </button>
      </div>
    </div>
  );
}

interface MapControlsProps {
  zoom: number;
  center: { lat: number; lng: number };
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
  onFullscreen: () => void;
  onSearch: (query: string) => void;
  className?: string;
}

export function MapControls({ zoom, center, onZoomIn, onZoomOut, onLocate, onFullscreen, onSearch, className }: MapControlsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className={clsx('glass-strong rounded-xl p-3 border border-flood-border flex flex-col gap-3', className)}>
      <div className="flex items-center gap-2">
        <button onClick={onZoomIn} className="btn-ghost p-2" aria-label="Zoom in" title="Zoom in">+</button>
        <button onClick={onZoomOut} className="btn-ghost p-2" aria-label="Zoom out" title="Zoom out">−</button>
        <div className="w-px h-8 bg-flood-border mx-1" />
        <button onClick={onLocate} className="btn-ghost p-2" aria-label="Locate me" title="Locate me">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        </button>
        <button onClick={onFullscreen} className="btn-ghost p-2 ml-auto" aria-label="Fullscreen" title="Fullscreen">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
        </button>
      </div>
      
      <div className="pt-2 border-t border-flood-border">
        <div className="relative">
          <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-flood-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearch(searchQuery)}
            placeholder="Search location..."
            className="input pl-10 py-2 text-sm"
          />
        </div>
      </div>
      
      <div className="pt-2 border-t border-flood-border text-xs text-flood-muted">
        <div className="flex justify-between">
          <span>Zoom: {zoom}</span>
          <span>{center.lat.toFixed(4)}, {center.lng.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';