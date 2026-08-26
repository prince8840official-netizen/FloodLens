import { useState } from 'react';
import { clsx } from 'clsx';
import { 
  BarChart, TrendingUp, TrendingDown, Clock, AlertTriangle, 
  CheckCircle, Users, Download, Filter, Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui';
import { 
  ChartContainer, MultiLineChart, HorizontalBarChart, 
  VerticalBarChart, DonutChart, ComposedBarLineChart, MetricCard
} from '../../components/charts/Charts';
import { useApp } from '../../context/AppContext';
import { mockIncidents, mockHistory, mockRoads, mockTeams, formatTime, getSeverityColor } from '../../data/mockData';

const timeRangeOptions = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' },
];

const incidentsOverTime = [
  { name: 'Week 1', incidents: 12, critical: 3, high: 4, moderate: 5 },
  { name: 'Week 2', incidents: 18, critical: 5, high: 6, moderate: 7 },
  { name: 'Week 3', incidents: 15, critical: 2, high: 5, moderate: 8 },
  { name: 'Week 4', incidents: 22, critical: 6, high: 8, moderate: 8 },
  { name: 'Week 5', incidents: 19, critical: 4, high: 7, moderate: 8 },
  { name: 'Week 6', incidents: 25, critical: 7, high: 9, moderate: 9 },
  { name: 'Week 7', incidents: 17, critical: 3, high: 5, moderate: 9 },
  { name: 'Week 8', incidents: 20, critical: 5, high: 7, moderate: 8 },
];

const severityData = [
  { name: 'Critical', value: 32, color: '#f97316' },
  { name: 'High', value: 48, color: '#ef4444' },
  { name: 'Moderate', value: 67, color: '#fbbf24' },
  { name: 'Normal', value: 41, color: '#06b6d4' },
];

const hotspotData = [
  { name: 'Mall Road (R-047)', value: 17, color: '#ef4444' },
  { name: 'GT Road (R-102)', value: 12, color: '#f97316' },
  { name: 'Rawatpur Rd (R-074)', value: 9, color: '#fbbf24' },
  { name: 'Railway Rd (R-018)', value: 8, color: '#06b6d4' },
  { name: 'Station Rd (R-089)', value: 5, color: '#22c55e' },
  { name: 'Kalyanpur Rd (R-203)', value: 6, color: '#8b5cf6' },
  { name: 'Kakadeo Rd (R-156)', value: 3, color: '#ec4899' },
  { name: 'Govind Nagar (R-131)', value: 4, color: '#06b6d4' },
];

const causeData = [
  { name: 'Drainage Blockage', value: 45, color: '#ef4444' },
  { name: 'Drainage Overload', value: 32, color: '#f97316' },
  { name: 'Heavy Rainfall', value: 18, color: '#fbbf24' },
  { name: 'Pump Failure', value: 5, color: '#8b5cf6' },
];

const responseMetrics = [
  { name: 'Detection', avg: 8, min: 2, max: 25, unit: 'min' },
  { name: 'Assignment', avg: 11, min: 3, max: 45, unit: 'min' },
  { name: 'Response', avg: 19, min: 5, max: 60, unit: 'min' },
  { name: 'Resolution', avg: 127, min: 30, max: 420, unit: 'min' },
];

const performanceOverTime = [
  { name: 'Week 1', detection: 12, assignment: 15, response: 25, resolution: 180 },
  { name: 'Week 2', detection: 10, assignment: 12, response: 22, resolution: 165 },
  { name: 'Week 3', detection: 8, assignment: 10, response: 18, resolution: 145 },
  { name: 'Week 4', detection: 7, assignment: 9, response: 17, resolution: 130 },
  { name: 'Week 5', detection: 6, assignment: 8, response: 16, resolution: 125 },
  { name: 'Week 6', detection: 5, assignment: 7, response: 15, resolution: 118 },
];

export function Analytics() {
  const { kpi } = useApp();
  const [timeRange, setTimeRange] = useState('30d');

  const kpiItems = [
    { label: 'Incidents Detected', value: mockIncidents.length, trend: '+12%' },
    { label: 'AI Verification Rate', value: '94%', trend: '+3%' },
    { label: 'False Positive Rate', value: '3.2%', trend: '-1.1%' },
    { label: 'Avg Detection Time', value: `${kpi.avgResponseTime} min`, trend: '-15%' },
    { label: 'Avg Assignment Time', value: '11 min', trend: '-8%' },
    { label: 'Avg Response Time', value: `${kpi.avgResolutionTime} min`, trend: '-5%' },
    { label: 'Teams Utilization', value: '73%', trend: '+5%' },
    { label: 'Sensor Coverage', value: '92%', trend: '+2%' },
    { label: 'Camera Uptime', value: '98.5%', trend: '+0.3%' },
  ];

  const riskTrends = mockRoads.slice(0, 8).map(road => (
    <div key={road.id} className="flex items-center justify-between p-3 bg-flood-bg rounded-lg">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-flood-primary">{road.id}</span>
        <span className="text-sm text-flood-text">{road.name}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-bold" style={{ color: getSeverityColor(road.severity) }}>{road.floodScore}</span>
        <StatusBadge status={road.severity} size="sm" />
      </div>
    </div>
  ));

  const teamPerf = mockTeams.slice(0, 6).map(team => (
    <div key={team.id} className="flex items-center justify-between p-3 bg-flood-bg rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-flood-primary/20 flex items-center justify-center">
          <Users className="w-4 h-4 text-flood-primary" />
        </div>
        <div>
          <p className="font-medium text-flood-text">{team.name}</p>
          <p className="text-xs text-flood-muted">{team.type} · {team.ward}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={team.status} size="sm" />
        <span className="text-xs text-flood-muted">{team.currentIncidentName || 'Available'}</span>
      </div>
    </div>
  ));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-flood-text">Flood Analytics</h1>
          <p className="text-flood-muted text-sm">Performance metrics & trend analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onChange={e => setTimeRange(e.target.value)} options={timeRangeOptions} className="w-48" />
          <Button variant="secondary" icon={<Download className="w-4 h-4" />}>Export Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Incidents" value={mockIncidents.length} trend={{ value: 12, label: 'vs last period' }} icon={<AlertTriangle className="w-6 h-6" />} color="#ef4444" />
        <MetricCard label="Avg Detection" value={`${kpi.avgResponseTime}min`} trend={{ value: -15, label: 'improvement' }} icon={<Clock className="w-6 h-6" />} color="#06b6d4" />
        <MetricCard label="Avg Resolution" value={`${kpi.avgResolutionTime}min`} trend={{ value: -8, label: 'improvement' }} icon={<CheckCircle className="w-6 h-6" />} color="#22c55e" />
        <MetricCard label="System Uptime" value={`${kpi.systemUptime}%`} trend={{ value: 0.1, label: 'stable' }} icon={<TrendingUp className="w-6 h-6" />} color="#8b5cf6" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <ChartContainer title="Incidents Over Time" subtitle="Weekly incident trends by severity" height={350}>
          <MultiLineChart data={incidentsOverTime} lines={[{ key: 'critical', color: '#f97316', name: 'Critical' }, { key: 'high', color: '#ef4444', name: 'High' }, { key: 'moderate', color: '#fbbf24', name: 'Moderate' }]} />
        </ChartContainer>
        <ChartContainer title="Incident Severity Distribution" subtitle="Breakdown by severity level" height={350}>
          <DonutChart data={severityData} height={350} />
        </ChartContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <ChartContainer title="Top Flood Hotspots" subtitle="Roads with highest historical incident count" height={350}>
          <HorizontalBarChart data={hotspotData} height={350} maxBars={8} />
        </ChartContainer>
        <ChartContainer title="Probable Causes" subtitle="Root cause analysis of flood incidents" height={350}>
          <DonutChart data={causeData} height={350} />
        </ChartContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <ChartContainer title="Response Performance" subtitle="Average time at each response stage" height={350}>
          <ComposedBarLineChart data={responseMetrics} bars={[{ key: 'avg', color: '#06b6d4', name: 'Average' }, { key: 'min', color: '#22c55e', name: 'Best' }, { key: 'max', color: '#ef4444', name: 'Worst' }]} lines={[]} />
        </ChartContainer>
        <ChartContainer title="Response Time Trends" subtitle="Weekly performance improvement" height={350}>
          <MultiLineChart data={performanceOverTime} lines={[{ key: 'detection', color: '#06b6d4', name: 'Detection' }, { key: 'assignment', color: '#8b5cf6', name: 'Assignment' }, { key: 'response', color: '#f97316', name: 'Response' }, { key: 'resolution', color: '#ef4444', name: 'Resolution' }]} />
        </ChartContainer>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card variant="strong">
          <CardHeader><CardTitle>Key Performance Indicators</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {kpiItems.map((kpi_item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-flood-bg rounded-lg">
                <div>
                  <p className="text-sm text-flood-muted">{kpi_item.label}</p>
                  <p className="font-bold text-flood-text">{kpi_item.value}</p>
                </div>
                <Badge variant={kpi_item.trend.startsWith('+') && !kpi_item.label.includes('False') ? 'success' : kpi_item.trend.startsWith('-') ? 'success' : 'info'} size="sm">
                  {kpi_item.trend}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card variant="strong">
          <CardHeader><CardTitle>Road Risk Trends</CardTitle></CardHeader>
          <CardContent className="space-y-3">{riskTrends}</CardContent>
        </Card>
        <Card variant="strong">
          <CardHeader><CardTitle>Team Performance</CardTitle></CardHeader>
          <CardContent className="space-y-3">{teamPerf}</CardContent>
        </Card>
      </div>
    </div>
  );
}