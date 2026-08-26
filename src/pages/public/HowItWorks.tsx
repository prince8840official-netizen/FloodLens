import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { 
  Zap, Brain, Eye, Search, AlertTriangle, CheckCircle, 
  BarChart, ArrowRight, ChevronRight, Droplets, 
  Cpu, Shield, Database, Users, Video, MapPin
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const steps = [
  {
    id: 'predict',
    number: '1',
    title: 'PREDICT',
    subtitle: 'Road-Level Flood Nowcasting',
    icon: Brain,
    color: '#06b6d4',
    description: 'AI models ingest rainfall forecasts (IMD, GPM), drainage network topology, terrain elevation (SRTM), soil saturation, and historical flood records to generate probabilistic flood forecasts for individual road segments up to 6 hours ahead.',
    details: [
      'Spatiotemporal LSTM + Graph Neural Networks',
      '100m resolution road-segment predictions',
      'Ensemble forecasting with uncertainty quantification',
      'Updates every 15 minutes with latest radar/rainfall data',
    ],
    inputs: ['Rainfall forecasts', 'Drainage capacity', 'Terrain & elevation', 'Historical patterns', 'Soil moisture'],
    outputs: ['Flood probability %', 'Expected onset time', 'Estimated duration', 'Severity classification', 'Confidence score'],
  },
  {
    id: 'see',
    number: '2',
    title: 'SEE',
    subtitle: 'CCTV & Dashcam Computer Vision',
    icon: Eye,
    color: '#8b5cf6',
    description: 'RoadEye AI processes live CCTV feeds and crowdsourced dashcam footage using YOLOv8 + DeepSORT to detect waterlogging, classify severity, estimate water depth, and track flood progression in real-time.',
    details: [
      'Water segmentation with 94% mIoU',
      'Depth estimation from visual cues',
      'Vehicle behavior analysis for validation',
      'Privacy-preserving: faces/plates blurred',
    ],
    inputs: ['CCTV streams (RTSP/HTTP)', 'Citizen dashcam uploads', 'Traffic camera feeds'],
    outputs: ['Flood detection Y/N', 'Severity level', 'Water depth estimate', 'Confidence score', 'Geo-tagged evidence'],
  },
  {
    id: 'understand',
    number: '3',
    title: 'UNDERSTAND',
    subtitle: 'Probable Cause Detection',
    icon: Search,
    color: '#f97316',
    description: 'Evidence fusion engine correlates multi-source signals (rainfall, sensors, cameras, citizen reports, drainage topology) using Bayesian networks to identify root causes: blockage, hydraulic overload, pump failure, or terrain trapping.',
    details: [
      'Bayesian evidence fusion',
      'Causal inference from observational data',
      'Drainage network topology analysis',
      'Historical pattern matching',
    ],
    inputs: ['Rainfall intensity', 'Drain sensor readings', 'Camera detections', 'Citizen reports', 'Drainage topology'],
    outputs: ['Primary cause', 'Cause confidence %', 'Contributing factors', 'Recommended intervention'],
  },
  {
    id: 'act',
    number: '4',
    title: 'ACT',
    subtitle: 'Automatic Incident & Team Assignment',
    icon: AlertTriangle,
    color: '#ef4444',
    description: 'When evidence fusion crosses confidence threshold, incidents are auto-registered with full evidence packages. AI dispatcher recommends optimal teams based on proximity, expertise, equipment, current workload, and incident priority.',
    details: [
      'Auto-incident registration',
      'Multi-criteria team optimization',
      'Real-time resource tracking',
      'Escalation protocols',
    ],
    inputs: ['Fused evidence package', 'Team locations & status', 'Equipment inventory', 'Incident priority'],
    outputs: ['Incident ID', 'Assigned team', 'ETA', 'Recommended actions', 'Escalation path'],
  },
  {
    id: 'verify',
    number: '5',
    title: 'VERIFY',
    subtitle: 'AI Resolution Verification',
    icon: CheckCircle,
    color: '#22c55e',
    description: 'Post-response, RoadEye compares before/after imagery and sensor trends. Only when visual clearance, sensor normalization, and temporal stability are confirmed does the incident move to RESOLVED — entering the historical knowledge base.',
    details: [
      'Before/after semantic segmentation',
      'Water level trend analysis',
      'Temporal stability checking',
      'Human-in-the-loop option',
    ],
    inputs: ['Post-response imagery', 'Sensor time series', 'Team completion report'],
    outputs: ['Verification status', 'Confidence score', 'Resolution timestamp', 'Evidence package'],
  },
  {
    id: 'learn',
    number: '6',
    title: 'LEARN',
    subtitle: 'Historical Flood Intelligence',
    icon: BarChart,
    color: '#ec4899',
    description: 'Every verified incident enriches the knowledge graph. Recurring hotspots, seasonal patterns, maintenance effectiveness, infrastructure aging, and response performance feed continuous model retraining and infrastructure planning.',
    details: [
      'Hotspot recurrence analysis',
      'Maintenance ROI tracking',
      'Model drift detection',
      'Infrastructure investment prioritization',
    ],
    inputs: ['Historical incidents', 'Maintenance logs', 'Response metrics', 'Infrastructure age'],
    outputs: ['Hotspot rankings', 'Maintenance schedules', 'Model updates', 'Capital planning inputs'],
  },
];

const techStack = [
  { category: 'AI/ML', items: ['PyTorch', 'YOLOv8', 'DeepSORT', 'Graph Neural Networks', 'Bayesian Networks', 'Scikit-learn', 'ONNX Runtime'] },
  { category: 'Backend', items: ['FastAPI', 'PostgreSQL + PostGIS', 'Redis', 'TimescaleDB', 'Kafka', 'Celery', 'Docker'] },
  { category: 'Frontend', items: ['React 18', 'TypeScript', 'Tailwind CSS', 'Leaflet', 'Recharts', 'React Router', 'Vite'] },
  { category: 'Data/IO', items: ['IMD API', 'GPM/IMERG', 'OpenStreetMap', 'SRTM', 'MQTT', 'WebRTC', 'S3/MinIO'] },
  { category: 'Infrastructure', items: ['Kubernetes', 'Prometheus', 'Grafana', 'ELK Stack', 'NGINX', 'Certbot', 'GitLab CI'] },
];

export function HowItWorks() {
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
            <Link to="/technology" className="text-sm text-flood-muted hover:text-flood-text">Technology</Link>
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
                SIH26085 — Urban Flood Nowcasting System
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-flood-text mb-6">How FloodLens Works</h1>
              <p className="text-xl text-flood-muted max-w-3xl mx-auto">
                A complete closed-loop flood management platform. Six integrated capabilities that transform 
                reactive complaint-driven response into predictive evidence-based action.
              </p>
            </div>

            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={step.id} className={clsx('grid lg:grid-cols-3 gap-8 items-start', index % 2 === 1 && 'lg:direction-rtl')}>
                  <div className="lg:col-span-1">
                    <Card variant="strong" className="h-full sticky top-24">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: step.color }}>
                          <step.icon className="w-8 h-8" />
                        </div>
                        <div>
                          <span className="text-4xl font-bold text-flood-text font-mono">{step.number}</span>
                          <div className="text-xs text-flood-muted uppercase tracking-wider mt-1">{step.title}</div>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-flood-text mb-3">{step.subtitle}</h3>
                      <p className="text-flood-muted mb-6">{step.description}</p>
                      <div className="space-y-2">
                        {step.details.map((d, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-flood-text">
                            <CheckCircle className="w-4 h-4" style={{ color: step.color }} />
                            {d}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                  <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card variant="hover">
                        <h4 className="text-sm font-medium text-flood-muted mb-3 uppercase tracking-wider">Inputs</h4>
                        <ul className="space-y-2">
                          {step.inputs.map((input, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-flood-text">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: step.color }} />
                              {input}
                            </li>
                          ))}
                        </ul>
                      </Card>
                      <Card variant="hover">
                        <h4 className="text-sm font-medium text-flood-muted mb-3 uppercase tracking-wider">Outputs</h4>
                        <ul className="space-y-2">
                          {step.outputs.map((output, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-flood-text">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: step.color }} />
                              {output}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </div>
                    <Card variant="hover" className="border-l-4" style={{ borderLeftColor: step.color }}>
                      <h4 className="text-sm font-medium text-flood-muted mb-3 uppercase tracking-wider">Data Flow</h4>
                      <div className="flex flex-wrap gap-2">
                        {step.inputs.map((input, i) => (
                          <Badge key={input} variant="info" size="sm" className="group-hover:bg-flood-primary/20">{input}</Badge>
                        ))}
                        <ChevronRight className="w-4 h-4 text-flood-muted my-auto" />
                        {step.outputs.map((output, i) => (
                          <Badge key={output} variant="success" size="sm" className="group-hover:bg-flood-success/20">{output}</Badge>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link to="/technology">
                <Button size="lg" variant="secondary" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
                  View Technical Architecture
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-flood-card/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-flood-text mb-4">Technology Stack</h2>
              <p className="text-flood-muted max-w-2xl mx-auto">Modern, scalable, cloud-native architecture built for municipal deployment</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {techStack.map((cat, i) => (
                <Card key={i} variant="hover">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-flood-primary/20 flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-flood-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-flood-text">{cat.category}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map((item, j) => (
                      <Badge key={j} variant="default" size="sm">{item}</Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-flood-text mb-4">Ready to See It in Action?</h2>
            <p className="text-flood-muted mb-8 max-w-2xl mx-auto">
              Launch the command center and experience the complete flood response loop with live demo data.
            </p>
            <Link to="/login">
              <Button size="lg" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
                Launch Command Center
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-flood-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-flood-muted">
          Prototype for SIH26085 — Demo data only, not for operational use
        </div>
      </footer>
    </div>
  );
}