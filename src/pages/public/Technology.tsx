import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { 
  Zap, Brain, Cpu, Database, Globe, Shield, 
  Network, Layers, GitBranch, Search, Eye, 
  AlertTriangle, CheckCircle, BarChart, ArrowRight
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const architectureLayers = [
  { name: 'Data Ingestion', icon: Database, color: '#06b6d4', components: ['Rainfall APIs (IMD, GPM)', 'IoT Sensors (MQTT)', 'CCTV Streams (RTSP)', 'Citizen Reports (Mobile)', 'Dashcam Uploads', 'Historical Archives'] },
  { name: 'Processing & Fusion', icon: Cpu, color: '#8b5cf6', components: ['Stream Processing (Kafka)', 'Evidence Fusion Engine', 'Computer Vision Pipeline', 'Spatiotemporal Models', 'Bayesian Inference', 'Real-time Feature Store'] },
  { name: 'Intelligence & Prediction', icon: Brain, color: '#f97316', components: ['Flood Nowcasting (GNN+LSTM)', 'Cause Detection', 'Risk Scoring', 'Simulation Engine', 'Recommendation Engine', 'Model Registry'] },
  { name: 'Application Services', icon: Layers, color: '#ef4444', components: ['Incident Management', 'Team Dispatch', 'Map Visualization', 'Analytics Dashboard', 'Notification Service', 'API Gateway'] },
  { name: 'Presentation', icon: Globe, color: '#ec4899', components: ['Command Center UI', 'Mobile Responsive', 'Public Alerting', 'Team Mobile App', 'Citizen Portal', 'Admin Console'] },
  { name: 'Infrastructure', icon: Shield, color: '#22c55e', components: ['Kubernetes (EKS/GKE)', 'PostgreSQL + PostGIS', 'TimescaleDB', 'Redis Cluster', 'S3/MinIO', 'Prometheus/Grafana'] },
];

const aiModels = [
  { name: 'Flood Nowcaster', type: 'Graph Neural Network + LSTM', accuracy: '91%', purpose: 'Road-segment flood probability 0-6hr', data: 'Rainfall, drainage, terrain, history' },
  { name: 'RoadEye Detector', type: 'YOLOv8 + DeepSORT', accuracy: '94% mIoU', purpose: 'Waterlogging detection from video', data: 'CCTV, dashcam, traffic cams' },
  { name: 'Cause Classifier', type: 'Bayesian Network', accuracy: '87%', purpose: 'Root cause: blockage/overload/pump/terrain', data: 'Multi-source evidence fusion' },
  { name: 'Team Optimizer', type: 'Multi-criteria Optimization', accuracy: 'N/A', purpose: 'Optimal team assignment', data: 'Location, skills, equipment, load' },
  { name: 'Resolution Verifier', type: 'Siamese Network + Time Series', accuracy: '96%', purpose: 'Before/after verification', data: 'Imagery + sensor trends' },
  { name: 'Hotspot Predictor', type: 'Temporal Point Process', accuracy: '89%', purpose: 'Recurrence forecasting', data: 'Historical incidents + maintenance' },
];

const dataSources = [
  { name: 'Rainfall', providers: ['IMD NOWCAST', 'GPM/IMERG', 'Local AWS'], frequency: '5-15 min', format: 'API, NetCDF', coverage: 'City-wide' },
  { name: 'Drainage', providers: ['SCADA', 'Ultrasonic sensors', 'Pressure transducers'], frequency: '1-5 min', format: 'MQTT, Modbus', coverage: 'Major drains' },
  { name: 'CCTV', providers: ['Traffic police', 'Municipal cameras', 'Private feeds'], frequency: 'Real-time', format: 'RTSP, HLS', coverage: 'Key junctions' },
  { name: 'Citizen', providers: ['Mobile app', 'WhatsApp bot', 'Web portal'], frequency: 'Event-driven', format: 'JSON, Images', coverage: 'City-wide' },
  { name: 'Terrain', providers: ['SRTM 30m', 'LiDAR (where available)', 'Municipal GIS'], frequency: 'Static', format: 'GeoTIFF, Shapefile', coverage: 'City-wide' },
  { name: 'Historical', providers: ['Municipal records', 'News archives', 'Satellite imagery'], frequency: 'Batch', format: 'CSV, PDF, Images', coverage: '5-10 years' },
];

export function Technology() {
  return (
    <div className="min-h-screen bg-flood-bg">
      <header className="fixed top-0 left-0 right-0 z-50 bg-flood-card/80 backdrop-blur-md border-b border-flood-border">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-flood-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-flood-bg" />
            </div>
            <span className="text-xl font-bold text-flood-text">FloodLens</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm text-flood-muted hover:text-flood-text">Home</Link>
            <Link to="/how-it-works" className="text-sm text-flood-muted hover:text-flood-text">How It Works</Link>
            <Link to="/about" className="text-sm text-flood-muted hover:text-flood-text">About</Link>
            <Link to="/login" className="text-sm text-flood-primary hover:underline">Sign In</Link>
          </div>
        </nav>
      </header>

      <main className="pt-16">
        <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="info" className="mb-4 inline-flex" dot>
                <span className="w-2 h-2 bg-flood-primary rounded-full animate-pulse mr-2" />
                Technical Architecture
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-flood-text mb-6">System Architecture</h1>
              <p className="text-xl text-flood-muted max-w-3xl mx-auto">
                Six-layer cloud-native architecture designed for municipal-scale deployment with 
                real-time processing, AI inference, and GIS visualization.
              </p>
            </div>

            <div className="space-y-6 mb-16">
              {architectureLayers.map((layer, i) => (
                <Card key={layer.name} variant="hover" className="overflow-hidden">
                  <div className="grid md:grid-cols-[200px_1fr] gap-6">
                    <div className="p-6 md:p-8 bg-flood-bg border-r border-flood-border flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white mb-4" style={{ backgroundColor: layer.color }}>
                        <layer.icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-flood-text">{layer.name}</h3>
                      <Badge variant="info" className="mt-2" style={{ backgroundColor: `${layer.color}20`, color: layer.color, borderColor: `${layer.color}40` }}>
                        Layer {i + 1}
                      </Badge>
                    </div>
                    <div className="p-6 flex flex-wrap gap-2">
                      {layer.components.map((comp, j) => (
                        <Badge key={j} variant="default" size="sm" className="group-hover:bg-flood-primary/10 group-hover:text-flood-primary">
                          {comp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-flood-text mb-4">AI Models</h2>
              <p className="text-flood-muted max-w-2xl mx-auto">Production-grade models with measurable performance on municipal test sets</p>
            </div>

            <div className="overflow-x-auto mb-16">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-flood-border">
                    <th className="px-4 py-3 text-left font-medium text-flood-muted uppercase tracking-wider">Model</th>
                    <th className="px-4 py-3 text-left font-medium text-flood-muted uppercase tracking-wider">Architecture</th>
                    <th className="px-4 py-3 text-left font-medium text-flood-muted uppercase tracking-wider">Performance</th>
                    <th className="px-4 py-3 text-left font-medium text-flood-muted uppercase tracking-wider">Purpose</th>
                    <th className="px-4 py-3 text-left font-medium text-flood-muted uppercase tracking-wider">Training Data</th>
                  </tr>
                </thead>
                <tbody>
                  {aiModels.map((model, i) => (
                    <tr key={i} className="border-b border-flood-border/50 hover:bg-flood-card/50">
                      <td className="px-4 py-3 font-medium text-flood-text">{model.name}</td>
                      <td className="px-4 py-3 text-flood-muted">{model.type}</td>
                      <td className="px-4 py-3"><Badge variant="success" size="sm">{model.accuracy}</Badge></td>
                      <td className="px-4 py-3 text-flood-text">{model.purpose}</td>
                      <td className="px-4 py-3 text-flood-muted">{model.data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-flood-text mb-4">Data Sources</h2>
              <p className="text-flood-muted max-w-2xl mx-auto">Multi-modal data ingestion from municipal, satellite, and citizen sources</p>
            </div>

            <div className="overflow-x-auto mb-16">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-flood-border">
                    <th className="px-4 py-3 text-left font-medium text-flood-muted uppercase tracking-wider">Source</th>
                    <th className="px-4 py-3 text-left font-medium text-flood-muted uppercase tracking-wider">Providers</th>
                    <th className="px-4 py-3 text-left font-medium text-flood-muted uppercase tracking-wider">Frequency</th>
                    <th className="px-4 py-3 text-left font-medium text-flood-muted uppercase tracking-wider">Format</th>
                    <th className="px-4 py-3 text-left font-medium text-flood-muted uppercase tracking-wider">Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {dataSources.map((source, i) => (
                    <tr key={i} className="border-b border-flood-border/50 hover:bg-flood-card/50">
                      <td className="px-4 py-3 font-medium text-flood-text">{source.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {source.providers.map((p, j) => (
                            <Badge key={j} variant="default" size="sm">{p}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-flood-muted">{source.frequency}</td>
                      <td className="px-4 py-3 text-flood-muted">{source.format}</td>
                      <td className="px-4 py-3 text-flood-muted">{source.coverage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-16">
              <Card variant="hover" className="text-center p-8">
                <div className="w-16 h-16 rounded-xl bg-flood-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-flood-primary" />
                </div>
                <h3 className="text-xl font-bold text-flood-text mb-2">Privacy by Design</h3>
                <p className="text-flood-muted">Faces, license plates, and PII automatically blurred. Citizen reports anonymized. No personal data stored beyond 30 days without consent.</p>
              </Card>
              <Card variant="hover" className="text-center p-8">
                <div className="w-16 h-16 rounded-xl bg-flood-success/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-flood-success" />
                </div>
                <h3 className="text-xl font-bold text-flood-text mb-2">Offline Capable</h3>
                <p className="text-flood-muted">Edge inference for RoadEye. Local caching for map tiles. Graceful degradation when connectivity lost. Sync on reconnect.</p>
              </Card>
              <Card variant="hover" className="text-center p-8">
                <div className="w-16 h-16 rounded-xl bg-flood-warning/20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-flood-warning" />
                </div>
                <h3 className="text-xl font-bold text-flood-text mb-2">Audit Trail</h3>
                <p className="text-flood-muted">Every AI decision logged with confidence, inputs, and model version. Full traceability for accountability and model improvement.</p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-flood-card/30">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-flood-text mb-4">Deploy FloodLens</h2>
            <p className="text-flood-muted mb-8 max-w-2xl mx-auto">
              Containerized deployment with Helm charts. On-premises or cloud. Integrates with existing SCADA, GIS, and dispatch systems.
            </p>
            <Link to="/login">
              <Button size="lg" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
                Request Demo Access
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-flood-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-flood-muted">
          Prototype for SIH26085 — Technical architecture for demonstration purposes
        </div>
      </footer>
    </div>
  );
}