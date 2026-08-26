import { useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { 
  MessageSquare, Search, Image, MapPin, 
  ChevronDown, Clock, Eye, Download, CheckCircle, XCircle,
  AlertTriangle, Brain, Share2, Flag
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DataTable } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { useApp } from '../../context/AppContext';
import { mockIncidents, formatTime } from '../../data/mockData';
import type { CitizenReport } from '../../types';

const mockCitizenReports: CitizenReport[] = [
  { id: 'CR-8392', coordinates: { lat: 26.4652, lng: 80.3402 }, address: 'Mall Road, near Naveen Market', description: 'Severe waterlogging, cars stuck, water entering shops', imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop', aiClassification: 'Waterlogging', aiConfidence: 96, matchedIncidentId: 'FLD-KNP-2026-000184', status: 'merged', timestamp: new Date(Date.now() - 20 * 60 * 1000), reporterId: 'CIT-7421' },
  { id: 'CR-8395', coordinates: { lat: 26.4648, lng: 80.3395 }, address: 'Mall Road, Phool Bagh crossing', description: 'Knee-deep water, traffic at standstill', aiClassification: 'Waterlogging', aiConfidence: 91, matchedIncidentId: 'FLD-KNP-2026-000184', status: 'merged', timestamp: new Date(Date.now() - 18 * 60 * 1000), reporterId: 'CIT-3891' },
  { id: 'CR-8398', coordinates: { lat: 26.4655, lng: 80.3410 }, address: 'The Mall, near Z Square Mall', description: 'Water rising fast, drain overflowing', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop', aiClassification: 'Drain Overflow', aiConfidence: 88, matchedIncidentId: 'FLD-KNP-2026-000184', status: 'verified', timestamp: new Date(Date.now() - 15 * 60 * 1000), reporterId: 'CIT-1204' },
  { id: 'CR-8401', coordinates: { lat: 26.4580, lng: 80.3350 }, address: 'Railway Road, near station', description: 'Moderate waterlogging on service lane', aiClassification: 'Waterlogging', aiConfidence: 82, matchedIncidentId: 'FLD-KNP-2026-000185', status: 'verified', timestamp: new Date(Date.now() - 45 * 60 * 1000), reporterId: 'CIT-5567' },
  { id: 'CR-8403', coordinates: { lat: 26.4450, lng: 80.3280 }, address: 'Station Road, platform exit', description: 'Ankle deep water near taxi stand', aiClassification: 'Waterlogging', aiConfidence: 76, status: 'pending', timestamp: new Date(Date.now() - 30 * 60 * 1000), reporterId: 'CIT-9021' },
];

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'merged', label: 'Merged' },
  { value: 'rejected', label: 'Rejected' },
];

const classificationOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'Waterlogging', label: 'Waterlogging' },
  { value: 'Drain Overflow', label: 'Drain Overflow' },
  { value: 'Road Damage', label: 'Road Damage' },
  { value: 'Traffic Disruption', label: 'Traffic Disruption' },
];

export function CitizenReports() {
  const { onIncidentClick } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);

  const filteredReports = useMemo(() => mockCitizenReports.filter(report => {
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesClassification = classificationFilter === 'all' || report.aiClassification === classificationFilter;
    const matchesSearch = searchQuery === '' || report.id.toLowerCase().includes(searchQuery.toLowerCase()) || report.address.toLowerCase().includes(searchQuery.toLowerCase()) || report.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesClassification && matchesSearch;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [statusFilter, classificationFilter, searchQuery]);

  const pendingCount = mockCitizenReports.filter(r => r.status === 'pending').length;
  const verifiedCount = mockCitizenReports.filter(r => r.status === 'verified').length;
  const mergedCount = mockCitizenReports.filter(r => r.status === 'merged').length;

  const reportItems = filteredReports.map(report => (
    <div key={report.id} className="p-4 hover:bg-flood-card/50 transition-colors" onClick={() => setSelectedReport(report)}>
      <div className="flex items-start gap-4">
        {report.imageUrl && <img src={report.imageUrl} alt="Citizen report" className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-flood-primary">{report.id}</span>
            <StatusBadge status={report.status} size="sm" />
            <Badge variant="info" size="sm">{report.aiClassification}</Badge>
            <Badge variant="default" size="sm">{report.aiConfidence}% AI confidence</Badge>
          </div>
          <p className="font-medium text-flood-text mb-1">{report.address}</p>
          <p className="text-sm text-flood-muted line-clamp-2">{report.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-flood-muted">
            <span>{new Date(report.timestamp).toLocaleString()}</span>
            <span>Reporter: {report.reporterId}</span>
            {report.matchedIncidentId && <span className="text-flood-primary">→ Merged: {report.matchedIncidentId}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {report.matchedIncidentId && <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); onIncidentClick({ id: report.matchedIncidentId } as any); }}>View Incident</Button>}
          <Eye className="w-5 h-5 text-flood-muted" />
        </div>
      </div>
    </div>
  ));

  const evidenceItems = [
    { label: 'Citizen Reports', count: mockCitizenReports.length, color: '#8b5cf6' },
    { label: 'Dashcam Feeds', count: 2, color: '#06b6d4' },
    { label: 'CCTV Cameras', count: 1, color: '#f97316' },
    { label: 'Water Sensors', count: 5, color: '#22c55e' },
  ];

  const classificationItems = ['Waterlogging', 'Drain Overflow', 'Road Damage', 'Traffic Disruption'].map(cls => {
    const count = mockCitizenReports.filter(r => r.aiClassification === cls).length;
    return (
      <div key={cls} className="flex items-center justify-between">
        <span className="text-sm text-flood-text">{cls}</span>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-flood-border rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-flood-primary" style={{ width: `${(count / mockCitizenReports.length) * 100}%` }} />
          </div>
          <span className="font-mono text-sm w-8 text-right">{count}</span>
        </div>
      </div>
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-flood-text">Citizen Flood Reports</h1>
          <p className="text-flood-muted text-sm">Community-sourced flood intelligence</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-flood-muted">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-flood-warning animate-pulse" /> {pendingCount} Pending</span>
          <span className="flex items-center gap-1 ml-4"><span className="w-2 h-2 rounded-full bg-flood-primary" /> {verifiedCount} Verified</span>
          <span className="flex items-center gap-1 ml-4"><span className="w-2 h-2 rounded-full bg-flood-success" /> {mergedCount} Merged</span>
        </div>
      </div>

      <Card variant="strong">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[250px]">
              <label className="block text-sm font-medium text-flood-muted mb-1">Search Reports</label>
              <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by ID, address, description..." />
            </div>
            <div className="min-w-[160px]">
              <label className="block text-sm font-medium text-flood-muted mb-1">Status</label>
              <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={statusOptions} placeholder="All" />
            </div>
            <div className="min-w-[160px]">
              <label className="block text-sm font-medium text-flood-muted mb-1">Classification</label>
              <Select value={classificationFilter} onChange={e => setClassificationFilter(e.target.value)} options={classificationOptions} placeholder="All" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <Card variant="strong">
          <div className="p-4 border-b border-flood-border flex items-center justify-between">
            <h2 className="font-semibold text-flood-text">Reports Feed</h2>
            <span className="text-sm text-flood-muted">{filteredReports.length} reports</span>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-flood-border/50">
              {reportItems}
              {filteredReports.length === 0 && (
                <div className="p-8 text-center text-flood-muted">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No reports match current filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card variant="strong">
            <CardContent className="p-4">
              <h3 className="font-semibold text-flood-text mb-4">Evidence Fusion</h3>
              <div className="space-y-3">
                {evidenceItems.map(item => (
                  <div key={item.label} className="flex items-center justify-between p-3 bg-flood-bg rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
                        <MessageSquare className="w-4 h-4" style={{ color: item.color }} />
                      </div>
                      <span className="text-sm font-medium text-flood-text">{item.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-xl" style={{ color: item.color }}>{item.count}</span>
                      <p className="text-xs text-flood-muted">sources</p>
                    </div>
                  </div>
                ))}
                <div className="p-3 bg-flood-primary/10 rounded-lg border border-flood-primary/30 mt-4">
                  <p className="text-sm text-flood-primary font-medium">
                    <strong>5 citizen reports + 2 dashcams + 1 sensor = 1 master incident (FLD-KNP-2026-000184)</strong>
                  </p>
                  <p className="text-xs text-flood-muted mt-1">AI automatically merges correlated reports into single incident with full evidence package</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="strong">
            <CardContent className="p-4">
              <h3 className="font-semibold text-flood-text mb-4">AI Classification Breakdown</h3>
              <div className="space-y-2">
                {classificationItems}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal isOpen={!!selectedReport} onClose={() => setSelectedReport(null)} size="lg" title={selectedReport?.id}>
        {selectedReport && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {selectedReport.imageUrl && <img src={selectedReport.imageUrl} alt="Report image" className="w-full rounded-lg object-cover aspect-video" />}
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={selectedReport.status} size="md" />
                  <Badge variant="info" size="sm">{selectedReport.aiClassification}</Badge>
                  <Badge variant="default" size="sm">{selectedReport.aiConfidence}% confidence</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-flood-muted">Report ID</p><p className="font-mono">{selectedReport.id}</p></div>
                  <div><p className="text-flood-muted">Timestamp</p><p>{new Date(selectedReport.timestamp).toLocaleString()}</p></div>
                  <div><p className="text-flood-muted">Location</p><p>{selectedReport.address}</p></div>
                  <div><p className="text-flood-muted">Reporter</p><p>{selectedReport.reporterId}</p></div>
                  <div><p className="text-flood-muted">GPS</p><p className="font-mono text-xs">{selectedReport.coordinates.lat.toFixed(6)}, {selectedReport.coordinates.lng.toFixed(6)}</p></div>
                  <div><p className="text-flood-muted">Matched Incident</p><p>{selectedReport.matchedIncidentId || <span className="text-flood-muted">—</span>}</p></div>
                </div>
                <div>
                  <p className="text-flood-muted mb-1">Description</p>
                  <p className="text-flood-text">{selectedReport.description}</p>
                </div>
                <div className="flex gap-2">
                  {selectedReport.matchedIncidentId && <Button onClick={() => { onIncidentClick({ id: selectedReport.matchedIncidentId } as any); setSelectedReport(null); }} icon={<Eye className="w-4 h-4" />}>View Matched Incident</Button>}
                  <Button variant="secondary" icon={<Share2 className="w-4 h-4" />}>Share</Button>
                  <Button variant="secondary" icon={<Flag className="w-4 h-4" />}>Flag</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}