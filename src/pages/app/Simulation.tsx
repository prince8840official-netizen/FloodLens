import { useState } from 'react';
import { clsx } from 'clsx';
import { 
  FlaskConical, AlertTriangle, MapPin, 
  ChevronDown, Clock, Map, Eye, Download, Play,
  TrendingUp, TrendingDown, BarChart, ArrowRight,
  RefreshCw, Settings, Layers, CheckCircle, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { FloodMap } from '../../components/map/FloodMap';
import { ChartContainer, HorizontalBarChart, DonutChart } from '../../components/charts/Charts';
import { useApp } from '../../context/AppContext';
import { mockSimulations, mockRoads, mockDrains, mockIncidents, mockTeams, formatTime, formatDistance, getSeverityColor, formatCurrency } from '../../data/mockData';
import type { SimulationScenario, SimulationResult } from '../../types';

const drainOptions = [
  { value: 'all', label: 'All Drains' },
  ...mockDrains.filter(d => d.type === 'storm-drain').map(d => ({ value: d.id, label: `${d.name} (${d.id})` })),
];

const conditionOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'partially-blocked', label: 'Partially Blocked' },
  { value: 'cleared', label: 'Cleared (Post-Maintenance)' },
];

export function Simulation() {
  const { simulations, roads, drains, incidents, teams, runSimulation, activeMapLayers, mapCenter, mapZoom, onMapClick } = useApp();
  const [rainfall, setRainfall] = useState(50);
  const [duration, setDuration] = useState(60);
  const [targetDrain, setTargetDrain] = useState('all');
  const [drainCondition, setDrainCondition] = useState('normal');
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<SimulationResult | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<{ before: SimulationResult; after: SimulationResult } | null>(null);

  const handleRunSimulation = async () => {
    setRunning(true);
    await new Promise(r => setTimeout(r, 1500));
    const affectedRoads = Math.floor(Math.random() * 15) + 5;
    const highRiskRoads = Math.floor(affectedRoads * 0.4);
    const criticalInfra = Math.floor(highRiskRoads * 0.5);
    const drainageStress = Math.min(95, 40 + rainfall * 0.5 + (drainCondition === 'blocked' ? 30 : drainCondition === 'partially-blocked' ? 15 : 0));
    const trafficDisruption: SimulationResult['trafficDisruption'] = drainageStress > 85 ? 'severe' : drainageStress > 70 ? 'high' : drainageStress > 50 ? 'medium' : 'low';
    const estimatedDamage = Math.floor(affectedRoads * criticalInfra * (rainfall / 10));
    const result: SimulationResult = { affectedRoads, highRiskRoads, criticalInfrastructure: criticalInfra, drainageStress, trafficDisruption, estimatedDamage };
    setLastResult(result);
    if (compareMode && targetDrain !== 'all') {
      const clearedStress = Math.min(95, 40 + rainfall * 0.5);
      const clearedAffected = Math.floor(affectedRoads * 0.5);
      const clearedHighRisk = Math.floor(highRiskRoads * 0.3);
      const clearedCritical = Math.floor(criticalInfra * 0.2);
      const clearedDamage = Math.floor(estimatedDamage * 0.3);
      setComparisonResult({ before: result, after: { affectedRoads: clearedAffected, highRiskRoads: clearedHighRisk, criticalInfrastructure: clearedCritical, drainageStress: clearedStress, trafficDisruption: clearedStress > 85 ? 'severe' : clearedStress > 70 ? 'high' : clearedStress > 50 ? 'medium' : 'low', estimatedDamage: clearedDamage } });
    }
    setRunning(false);
  };

  const scenarioCards = [
    { id: 'current', title: 'Current Conditions', rainfall: 50, duration: 60, drainCondition: 'blocked' as const, targetDrain: 'D-182', color: '#ef4444' },
    { id: 'cleared', title: 'Drain D-182 Cleared', rainfall: 50, duration: 60, drainCondition: 'cleared' as const, targetDrain: 'D-182', color: '#22c55e' },
    { id: 'heavy', title: 'Heavy Rainfall (100mm/hr)', rainfall: 100, duration: 120, drainCondition: 'normal' as const, color: '#f97316' },
    { id: 'prepared', title: 'Pre-Monsoon Preparedness', rainfall: 75, duration: 90, drainCondition: 'cleared' as const, color: '#06b6d4' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-flood-text">What-If Flood Simulation</h1><p className="text-flood-muted text-sm">Test drainage interventions & rainfall scenarios</p></div><div className="flex items-center gap-2"><Button variant="secondary" icon={<RefreshCw className="w-4 h-4" />} onClick={() => { setLastResult(null); setComparisonResult(null); }}>Reset</Button><Button variant="secondary" icon={<Download className="w-4 h-4" />}>Export Results</Button></div></div>
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <Card variant="strong"><CardHeader><CardTitle>Simulation Parameters</CardTitle></CardHeader><CardContent className="space-y-6">
          <div><label className="block text-sm font-medium text-flood-muted mb-2">Rainfall Intensity</label><div className="flex items-center gap-4"><input type="range" min="0" max="150" step="5" value={rainfall} onChange={e => setRainfall(Number(e.target.value))} className="flex-1 h-2 bg-flood-border rounded-lg appearance-none accent-flood-primary" /><div className="flex items-center gap-2 w-24"><input type="number" min="0" max="150" step="5" value={rainfall} onChange={e => setRainfall(Number(e.target.value))} className="input text-center text-lg font-mono" /><span className="text-flood-muted">mm/hr</span></div></div><p className="text-xs text-flood-muted mt-1">{rainfall === 0 ? 'No rain' : rainfall < 20 ? 'Light' : rainfall < 40 ? 'Moderate' : rainfall < 70 ? 'Heavy' : 'Extreme'}</p></div>
          <div><label className="block text-sm font-medium text-flood-muted mb-2">Duration</label><div className="flex items-center gap-4"><input type="range" min="15" max="240" step="15" value={duration} onChange={e => setDuration(Number(e.target.value))} className="flex-1 h-2 bg-flood-border rounded-lg appearance-none accent-flood-primary" /><div className="flex items-center gap-2 w-24"><input type="number" min="15" max="240" step="15" value={duration} onChange={e => setDuration(Number(e.target.value))} className="input text-center text-lg font-mono" /><span className="text-flood-muted">minutes</span></div></div></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-flood-muted mb-2">Target Drain</label><Select value={targetDrain} onChange={e => setTargetDrain(e.target.value)} options={drainOptions} placeholder="Select drain" /></div><div><label className="block text-sm font-medium text-flood-muted mb-2">Drain Condition</label><Select value={drainCondition} onChange={e => setDrainCondition(e.target.value)} options={conditionOptions} placeholder="Select condition" /></div></div>
          <div className="flex items-center gap-3 p-3 bg-flood-primary/10 rounded-lg border border-flood-primary/30"><input type="checkbox" id="compareMode" checked={compareMode} onChange={e => setCompareMode(e.target.checked)} className="w-4 h-4 rounded border-flood-border text-flood-primary focus:ring-flood-primary" /><label htmlFor="compareMode" className="flex-1 cursor-pointer"><p className="font-medium text-flood-text">Enable Comparison Mode</p><p className="text-xs text-flood-muted">Compare before/after for selected drain intervention</p></label></div>
          <Button className="w-full" size="lg" onClick={handleRunSimulation} disabled={running} loading={running} icon={<Play className="w-5 h-5" />}>{running ? 'Running Simulation...' : 'RUN SIMULATION'}</Button>
        </CardContent></Card>
        <Card variant="strong"><CardHeader><CardTitle>Quick Scenarios</CardTitle></CardHeader><CardContent className="space-y-3">{scenarioCards.map(scenario => (<Button key={scenario.id} variant="secondary" className="w-full justify-start gap-3" onClick={() => { setRainfall(scenario.rainfall); setDuration(scenario.duration); setDrainCondition(scenario.drainCondition); setTargetDrain(scenario.targetDrain || 'all'); if (scenario.targetDrain) setCompareMode(true); }}><div className="w-3 h-3 rounded-full" style={{ backgroundColor: scenario.color }} /><div className="flex-1 text-left"><p className="font-medium text-flood-text">{scenario.title}</p><p className="text-xs text-flood-muted">{scenario.rainfall}mm/hr · {scenario.duration}min · {scenario.drainCondition}</p></div><ArrowRight className="w-4 h-4 text-flood-muted" /></Button>))}</CardContent></Card>
      </div>
      {(lastResult || comparisonResult) && <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><Card variant="hover" className="text-center p-4 border-l-4 border-flood-danger"><div className="text-3xl font-bold text-flood-danger">{lastResult?.affectedRoads ?? 0}</div><div className="text-sm text-flood-muted">Affected Roads</div></Card><Card variant="hover" className="text-center p-4 border-l-4 border-flood-warning"><div className="text-3xl font-bold text-flood-warning">{lastResult?.highRiskRoads ?? 0}</div><div className="text-sm text-flood-muted">High Risk</div></Card><Card variant="hover" className="text-center p-4 border-l-4 border-flood-critical"><div className="text-3xl font-bold text-flood-critical">{lastResult?.criticalInfrastructure ?? 0}</div><div className="text-sm text-flood-muted">Critical Infra</div></Card><Card variant="hover" className="text-center p-4 border-l-4 border-flood-primary"><div className="text-3xl font-bold text-flood-primary">{lastResult?.drainageStress ?? 0}%</div><div className="text-sm text-flood-muted">Drainage Stress</div></Card></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><Card variant="hover" className="text-center p-4"><div className="text-2xl font-bold text-flood-text">{lastResult?.trafficDisruption || '—'}</div><div className="text-sm text-flood-muted">Traffic Disruption</div></Card><Card variant="hover" className="text-center p-4"><div className="text-2xl font-bold text-flood-text">{lastResult?.estimatedDamage ? formatCurrency(lastResult.estimatedDamage) : '—'}</div><div className="text-sm text-flood-muted">Est. Damage</div></Card><Card variant="hover" className="text-center p-4"><div className="text-2xl font-bold text-flood-text">{Math.floor((roads.filter(r => r.severity !== 'normal').length / roads.length) * 100)}%</div><div className="text-sm text-flood-muted">Network Risk</div></Card><Card variant="hover" className="text-center p-4"><div className="text-2xl font-bold text-flood-text">{teams.filter(t => t.status !== 'idle').length}</div><div className="text-sm text-flood-muted">Teams Needed</div></Card></div>
        {comparisonResult && <Card variant="strong" className="border-l-4 border-flood-success"><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-flood-success" />Intervention Impact Analysis</CardTitle></CardHeader><CardContent className="space-y-6"><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[ { label: 'Affected Roads', before: comparisonResult.before.affectedRoads, after: comparisonResult.after.affectedRoads, unit: '', good: 'down' }, { label: 'High Risk Roads', before: comparisonResult.before.highRiskRoads, after: comparisonResult.after.highRiskRoads, unit: '', good: 'down' }, { label: 'Critical Infra', before: comparisonResult.before.criticalInfrastructure, after: comparisonResult.after.criticalInfrastructure, unit: '', good: 'down' }, { label: 'Drainage Stress', before: comparisonResult.before.drainageStress, after: comparisonResult.after.drainageStress, unit: '%', good: 'down' }, { label: 'Traffic Disruption', before: comparisonResult.before.trafficDisruption, after: comparisonResult.after.trafficDisruption, unit: '', good: 'down' }, { label: 'Est. Damage', before: comparisonResult.before.estimatedDamage, after: comparisonResult.after.estimatedDamage, unit: '', good: 'down', format: formatCurrency } ].map((metric, i) => (<Card key={i} variant="hover" className="text-center p-4"><p className="text-sm text-flood-muted mb-2">{metric.label}</p><div className="flex items-center justify-center gap-3"><div className="text-2xl font-bold text-flood-muted">{metric.format ? metric.format(metric.before as any) : metric.before}{metric.unit}</div><ArrowRight className="w-5 h-5 text-flood-primary" /><div className="text-2xl font-bold" style={{ color: ((metric.before as any) > (metric.after as any)) ? '#22c55e' : ((metric.before as any) < (metric.after as any)) ? '#ef4444' : '#06b6d4' }}>{metric.format ? metric.format(metric.after as any) : metric.after}{metric.unit}</div></div><div className="mt-2 text-sm" style={{ color: ((metric.before as any) > (metric.after as any)) ? '#22c55e' : ((metric.before as any) < (metric.after as any)) ? '#ef4444' : '#06b6d4' }}>{(metric.before as any) !== 0 ? Math.round((((metric.before as any) - (metric.after as any)) / (metric.before as any)) * 100) : 0}% {((metric.before as any) > (metric.after as any)) ? 'improvement' : ((metric.before as any) < (metric.after as any)) ? 'increase' : 'no change'}</div></Card>))}</div></CardContent></Card>}
        <Card variant="strong"><CardHeader><CardTitle>Simulation History</CardTitle></CardHeader><CardContent className="p-0"><table className="w-full"><thead><tr className="border-b border-flood-border"><th className="px-4 py-3 text-left font-medium text-flood-muted">Scenario</th><th className="px-4 py-3 text-left font-medium text-flood-muted">Rainfall</th><th className="px-4 py-3 text-left font-medium text-flood-muted">Duration</th><th className="px-4 py-3 text-left font-medium text-flood-muted">Drain Condition</th><th className="px-4 py-3 text-left font-medium text-flood-muted">Affected Roads</th><th className="px-4 py-3 text-left font-medium text-flood-muted">High Risk</th><th className="px-4 py-3 text-left font-medium text-flood-muted">Est. Damage</th><th className="px-4 py-3 text-left font-medium text-flood-muted">Time</th></tr></thead><tbody>{[...simulations].reverse().slice(0, 10).map(sim => (<tr key={sim.id} className="border-b border-flood-border/50 hover:bg-flood-card/50"><td className="px-4 py-3 font-medium text-flood-text">{sim.name}</td><td className="px-4 py-3 font-mono">{sim.rainfall} mm/hr</td><td className="px-4 py-3 font-mono">{sim.duration} min</td><td className="px-4 py-3"><Badge variant="default" size="sm" className="capitalize">{sim.drainCondition.replace('-', ' ')}</Badge></td><td className="px-4 py-3 font-mono">{sim.results.affectedRoads}</td><td className="px-4 py-3 font-mono">{sim.results.highRiskRoads}</td><td className="px-4 py-3 font-mono">{formatCurrency(sim.results.estimatedDamage)}</td><td className="px-4 py-3 text-sm text-flood-muted">{new Date().toLocaleTimeString()}</td></tr>))}</tbody></table></CardContent></Card>
      </div> }
    </div>
  );
}