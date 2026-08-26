import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { 
  Zap, Target, Users, Award, Globe, Shield, 
  Lightbulb, Heart, Code, BookOpen, ArrowRight, CheckCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const values = [
  { icon: Target, title: 'Evidence First', desc: 'Every decision backed by multi-source evidence. No action without verification.' },
  { icon: Shield, title: 'Public Safety', desc: 'Citizen protection is the north star. Speed saves lives.' },
  { icon: Lightbulb, title: 'Continuous Learning', desc: 'Every incident improves the system. Models retrain weekly.' },
  { icon: Globe, title: 'Open Collaboration', desc: 'Standards-based. Interoperable. Built for municipal ecosystems.' },
  { icon: Code, title: 'Privacy by Design', desc: 'Data minimization. Anonymization. Consent-driven.' },
  { icon: Heart, title: 'Human in the Loop', desc: 'AI recommends, humans decide. Accountability preserved.' },
];

const team = [
  { name: 'Dr. Rajesh Kumar', role: 'Project Lead / Hydrologist', expertise: 'Urban flood modeling, 15+ years' },
  { name: 'Priya Sharma', role: 'AI/ML Engineer', expertise: 'Computer vision, spatiotemporal forecasting' },
  { name: 'Amit Singh', role: 'Full Stack Developer', expertise: 'React, GIS, real-time systems' },
  { name: 'Sneha Patel', role: 'GIS Specialist', expertise: 'PostGIS, drainage networks, spatial analysis' },
  { name: 'Vikram Rao', role: 'DevOps / Infrastructure', expertise: 'Kubernetes, edge deployment, monitoring' },
  { name: 'Anita Desai', role: 'Domain Expert / Municipal Liaison', expertise: 'Urban drainage operations, stakeholder coordination' },
];

const milestones = [
  { date: 'Jan 2026', title: 'Problem Discovery', desc: 'Municipal workshops identify complaint-to-action gap', status: 'completed' },
  { date: 'Feb 2026', title: 'Architecture Design', desc: 'Six-layer architecture finalized, tech stack selected', status: 'completed' },
  { date: 'Mar 2026', title: 'Data Pipeline MVP', desc: 'Rainfall + sensor ingestion operational', status: 'completed' },
  { date: 'Apr 2026', title: 'Nowcasting Model v1', desc: 'GNN+LSTM achieves 89% on validation set', status: 'completed' },
  { date: 'May 2026', title: 'RoadEye CV Pipeline', desc: 'YOLOv8 waterlogging detection deployed', status: 'completed' },
  { date: 'Jun 2026', title: 'Evidence Fusion Engine', desc: 'Bayesian network integrates 5+ sources', status: 'completed' },
  { date: 'Jul 2026', title: 'Command Center UI', desc: 'Full dashboard with map, incidents, teams', status: 'completed' },
  { date: 'Aug 2026', title: 'SIH Demo Preparation', desc: 'End-to-end demo flow polished', status: 'current' },
  { date: 'Sep 2026', title: 'Pilot Deployment', desc: 'Kanpur Zone 1 live pilot (planned)', status: 'planned' },
  { date: 'Q4 2026', title: 'City-wide Rollout', desc: 'All 6 zones, citizen app, team mobile app', status: 'planned' },
];

const problemStatement = `Smart India Hackathon 2026 Problem Statement SIH26085: "Urban Flood Nowcasting System (Drainage and Rainfall Coupling)"

Indian cities face recurrent urban flooding during monsoons. Current systems are reactive — they wait for citizen complaints before acting. By the time a complaint reaches authorities, roads are already flooded, traffic is paralyzed, and response teams are dispatched blindly without knowing the cause, severity, or optimal intervention.

FloodLens transforms this paradigm by coupling real-time rainfall intelligence with drainage network analysis, computer vision from CCTV/dashcams, IoT water-level sensors, and citizen reports into a unified AI-powered command center that predicts flooding before it happens, detects it when it occurs, identifies the root cause automatically, dispatches the right team with the right equipment, and verifies resolution with AI — creating a closed loop from prediction to verified resolution.`;

export function About() {
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
            <Link to="/technology" className="text-sm text-flood-muted hover:text-flood-text">Technology</Link>
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
              <h1 className="text-4xl sm:text-5xl font-bold text-flood-text mb-6">About FloodLens</h1>
              <p className="text-xl text-flood-muted max-w-3xl mx-auto">
                A prototype AI-powered municipal flood command center built for the Smart India Hackathon 2026.
              </p>
            </div>

            <div className="prose prose-invert max-w-3xl mx-auto mb-16 text-flood-muted">
              <p className="whitespace-pre-wrap">{problemStatement}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {values.map((v, i) => (
                <Card key={i} variant="hover" className="text-center p-6">
                  <div className="w-14 h-14 rounded-xl bg-flood-primary/20 flex items-center justify-center mx-auto mb-4">
                    <v.icon className="w-7 h-7 text-flood-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-flood-text mb-2">{v.title}</h3>
                  <p className="text-flood-muted text-sm">{v.desc}</p>
                </Card>
              ))}
            </div>

            <div className="mb-16">
              <h2 className="text-3xl font-bold text-flood-text mb-8 text-center">Our Team</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.map((member, i) => (
                  <Card key={i} variant="hover">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-flood-primary/20 flex items-center justify-center flex-shrink-0">
                        <Users className="w-7 h-7 text-flood-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-flood-text">{member.name}</h3>
                        <p className="text-sm text-flood-primary font-medium">{member.role}</p>
                        <p className="text-xs text-flood-muted mt-1">{member.expertise}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="mb-16">
              <h2 className="text-3xl font-bold text-flood-text mb-8 text-center">Journey & Milestones</h2>
              <div className="max-w-3xl mx-auto">
                {milestones.map((m, i) => (
                  <div key={i} className="relative pl-8 pb-8 last:pb-0 before:absolute before:left-3 before:top-0 before:bottom-0 before:w-0.5" style={{ borderLeftColor: m.status === 'completed' ? '#22c55e' : m.status === 'current' ? '#06b6d4' : '#1e293b' }}>
                    <div className="absolute left-0 top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center" style={{ 
                      backgroundColor: m.status === 'completed' ? '#22c55e' : m.status === 'current' ? '#06b6d4' : '#111827',
                      borderColor: m.status === 'completed' ? '#22c55e' : m.status === 'current' ? '#06b6d4' : '#1e293b'
                    }}>
                      {m.status === 'completed' && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                      {m.status === 'current' && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-mono text-flood-muted">{m.date}</span>
                        <Badge variant={m.status === 'completed' ? 'success' : m.status === 'current' ? 'info' : 'default'} size="sm">
                          {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-flood-text">{m.title}</h3>
                      <p className="text-sm text-flood-muted">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-16">
              <Card variant="hover" className="text-center p-6 border-l-4 border-flood-primary">
                <div className="w-12 h-12 rounded-xl bg-flood-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-flood-primary" />
                </div>
                <h3 className="text-lg font-semibold text-flood-text mb-1">SIH26085 Finalist</h3>
                <p className="text-sm text-flood-muted">Smart India Hackathon 2026</p>
              </Card>
              <Card variant="hover" className="text-center p-6 border-l-4 border-flood-success">
                <div className="w-12 h-12 rounded-xl bg-flood-success/20 flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-6 h-6 text-flood-success" />
                </div>
                <h3 className="text-lg font-semibold text-flood-text mb-1">Open Source</h3>
                <p className="text-sm text-flood-muted">MIT License — Community driven</p>
              </Card>
              <Card variant="hover" className="text-center p-6 border-l-4 border-flood-warning">
                <div className="w-12 h-12 rounded-xl bg-flood-warning/20 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-flood-warning" />
                </div>
                <h3 className="text-lg font-semibold text-flood-text mb-1">Research Backed</h3>
                <p className="text-sm text-flood-muted">Peer-reviewed methodologies</p>
              </Card>
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-bold text-flood-text mb-4">Disclaimer</h2>
              <p className="text-flood-muted max-w-2xl mx-auto mb-8">
                FloodLens is a prototype developed for the Smart India Hackathon 2026 (SIH26085). 
                All data shown is synthetic demo data for demonstration purposes only. 
                This system is not connected to any live municipal infrastructure and should not be used for operational decision-making. 
                No official government affiliation or endorsement is implied.
              </p>
              <Link to="/login">
                <Button size="lg" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
                  Experience the Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-flood-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-flood-muted">
          FloodLens — SIH26085 Prototype | Built for Smart India Hackathon 2026
        </div>
      </footer>
    </div>
  );
}