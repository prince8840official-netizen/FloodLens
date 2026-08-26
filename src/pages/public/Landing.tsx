import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { 
  Zap, MapPin, Cpu, Shield, Eye, Brain, 
  ArrowRight, CheckCircle, XCircle,
  AlertTriangle, Droplets, Navigation, Search,
  Users, BarChart, Clock, Lightbulb, FlaskConical
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';

const features = [
  { id: 'predict', num: '01', title: 'PREDICT', desc: 'Road-level flood nowcasting', icon: Brain, color: '#06b6d4', details: 'AI models combine rainfall forecasts, drainage capacity, terrain analysis, and historical patterns to predict flooding at individual road segments up to 6 hours in advance with 90%+ accuracy.' },
  { id: 'see', num: '02', title: 'SEE', desc: 'CCTV and Dashcam AI', icon: Eye, color: '#8b5cf6', details: 'RoadEye computer vision analyzes live CCTV feeds and citizen dashcam footage to detect waterlogging in real-time, classifying severity and estimating water depth automatically.' },
  { id: 'understand', num: '03', title: 'UNDERSTAND', desc: 'Probable cause detection', icon: Search, color: '#f97316', details: 'Evidence fusion engine correlates rainfall, sensor data, camera feeds, citizen reports, and drainage topology to identify root causes: blockage, overload, pump failure, or terrain issues.' },
  { id: 'act', num: '04', title: 'ACT', desc: 'Automatic incident & team assignment', icon: AlertTriangle, color: '#ef4444', details: 'Incidents are auto-registered with full evidence packages. AI recommends optimal response teams based on proximity, expertise, equipment, and current workload.' },
  { id: 'verify', num: '05', title: 'VERIFY', desc: 'AI resolution verification', icon: CheckCircle, color: '#22c55e', details: 'Post-response, RoadEye AI compares before/after imagery and sensor data to autonomously verify resolution. Only AI-verified incidents enter the resolved database.' },
  { id: 'learn', num: '06', title: 'LEARN', desc: 'Historical flood intelligence', icon: BarChart, color: '#ec4899', details: 'Every incident builds the knowledge base. Recurring hotspots, seasonal patterns, maintenance effectiveness, and response performance feed continuous model improvement.' },
];

const stats = [
  { value: '24', label: 'Active Risk Zones', icon: AlertTriangle, color: '#f97316' },
  { value: '7', label: 'Critical Incidents', icon: XCircle, color: '#ef4444' },
  { value: '94%', label: 'Highest Road Flood Probability', icon: Droplets, color: '#06b6d4' },
  { value: '18', label: 'Response Teams Active', icon: Users, color: '#22c55e' },
  { value: '42 min', label: 'Predicted Lead Time', icon: Clock, color: '#8b5cf6' },
];

const workflow = [
  { step: 'Rainfall', icon: Droplets, color: '#06b6d4' },
  { step: 'Drainage Stress', icon: GitBranch, color: '#8b5cf6' },
  { step: 'Water Accumulation', icon: Droplets, color: '#f97316' },
  { step: 'Road Disruption', icon: AlertTriangle, color: '#ef4444' },
  { step: 'Manual Complaint', icon: MessageSquare, color: '#fbbf24' },
  { step: 'Delayed Response', icon: Clock, color: '#ec4899' },
];

import { GitBranch, MessageSquare } from 'lucide-react';

const traditional = [
  'Reactive response',
  'Manual complaint-driven',
  'Fragmented data silos',
  'Delayed team dispatch',
  'No resolution verification',
];

const floodlens = [
  'Predictive nowcasting',
  'Automated evidence fusion',
  'Unified command center',
  'AI-optimized dispatch',
  'AI-verified closure',
];

export function Landing() {
  return (
    <div className="min-h-screen bg-flood-bg">
      <header className="fixed top-0 left-0 right-0 z-50 bg-flood-card/80 backdrop-blur-md border-b border-flood-border">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-flood-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-flood-bg" />
            </div>
            <span className="text-xl font-bold text-flood-text">FloodLens</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/how-it-works" className="text-sm text-flood-muted hover:text-flood-text transition-colors">How It Works</Link>
            <Link to="/technology" className="text-sm text-flood-muted hover:text-flood-text transition-colors">Technology</Link>
            <Link to="/about" className="text-sm text-flood-muted hover:text-flood-text transition-colors">About</Link>
            <Link to="/login" className="text-sm text-flood-muted hover:text-flood-text transition-colors">Sign In</Link>
            <Link to="/dashboard">
              <Button size="sm">Launch Command Center</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-16">
        <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-flood-bg via-flood-card/20 to-flood-bg" />
          
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-flood-primary blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-flood-critical blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <Badge variant="info" className="mb-6 inline-flex" dot>
                  <span className="w-2 h-2 bg-flood-primary rounded-full animate-pulse mr-2" />
                  LIVE SYSTEM — DEMO DATA
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-flood-text leading-tight mb-6">
                  Urban FloodIntel Prediction System
                </h1>
                <p className="text-lg sm:text-xl text-flood-muted mb-8 max-w-xl">
                  Predict flooding before it happens. See it when it occurs. Understand the cause. 
                  Automatically coordinate the response. Verify the resolution.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Link to="/dashboard">
                    <Button size="lg" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right" className="w-full sm:w-auto">
                      Launch Command Center
                    </Button>
                  </Link>
                  <Button variant="secondary" size="lg" onClick={() => document.getElementById('solution')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto py-4 px-6 text-base sm:text-lg min-h-[48px]">
                    Explore FloodLens →
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="glass-strong rounded-2xl border border-flood-border overflow-hidden aspect-video lg:aspect-[4/3]">
                  <div className="absolute inset-0 bg-gradient-to-br from-flood-primary/5 via-transparent to-flood-critical/5" />
                  <div className="relative p-4 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-flood-primary animate-pulse" />
                        <span className="text-xs font-medium text-flood-primary uppercase tracking-wider">Live GIS Feed</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-flood-muted">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-flood-critical animate-pulse" /> Critical</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-flood-warning" /> High</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-flood-primary" /> Predicted</span>
                      </div>
                    </div>
                    <div className="flex-1 relative rounded-xl overflow-hidden bg-flood-bg">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 400%22%3E%3Cdefs%3E%3Cpattern id=%22grid%22 width=%2220%22 height=%2220%22 patternUnits=%22userSpaceOnUse%22%3E%3Cpath d=%22M20 0L0 0 0 20%22 fill=%22none%22 stroke=%22%231e293b%22 stroke-width=%220.5%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22url(%23grid)%22/%3E%3C/svg%3E')] opacity-50" />
                      
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#f97316" />
                          </linearGradient>
                          <linearGradient id="predGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.3" />
                          </linearGradient>
                        </defs>
                        
                        <path d="M100,500 Q300,200 500,150 Q650,100 750,80" stroke="url(#roadGrad)" strokeWidth="6" fill="none" strokeLinecap="round" filter="url(#glow)" />
                        <path d="M150,450 Q350,250 550,200 Q700,180 780,160" stroke="#06b6d4" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="8,6" opacity="0.7" />
                        <path d="M50,550 Q200,400 350,300 Q450,250 550,220" stroke="#f97316" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="6,4" opacity="0.5" />
                        <path d="M600,500 Q650,350 700,250 Q750,200 780,180" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
                        
                        <circle cx="300" cy="220" r="12" fill="#ef4444" className="pulse-marker" />
                        <circle cx="450" cy="280" r="10" fill="#f97316" />
                        <circle cx="600" cy="350" r="8" fill="#fbbf24" />
                        <circle cx="720" cy="190" r="8" fill="#22c55e" />
                        <circle cx="150" cy="420" r="6" fill="#a855f7" />
                        <circle cx="400" cy="350" r="6" fill="#06b6d4" />
                        <circle cx="550" cy="230" r="6" fill="#ec4899" />
                        
                        <rect x="100" y="50" width="40" height="40" rx="4" fill="#8b5cf6" opacity="0.9" />
                        <rect x="650" y="50" width="40" height="40" rx="4" fill="#22c55e" opacity="0.9" />
                        <rect x="350" y="50" width="40" height="40" rx="4" fill="#f97316" opacity="0.9" />
                      </svg>
                      
                      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                        <Badge variant="critical" size="sm">R-047: 94%</Badge>
                        <Badge variant="high" size="sm">R-102: 76%</Badge>
                        <Badge variant="moderate" size="sm">R-018: 61%</Badge>
                        <Badge variant="normal" size="sm">R-089: 48%</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="stats" className="py-16 lg:py-24 border-y border-flood-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-flood-text mb-2">LIVE URBAN FLOOD INTELLIGENCE</h2>
              <p className="text-flood-muted">Real-time prototype metrics — demo values only</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
              {stats.map((stat, i) => (
                <Card key={i} variant="hover" className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}20` }}>
                      <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                    </div>
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-flood-text tabular-nums mb-1">{stat.value}</div>
                  <div className="text-sm text-flood-muted">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="problem" className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-flood-text mb-4">Urban Flooding Is a Chain Reaction</h2>
              <p className="text-flood-muted max-w-2xl mx-auto">Traditional systems react to complaints. FloodLens breaks the chain at every link.</p>
            </div>

            <div className="mb-16 overflow-x-auto">
              <div className="flex items-center gap-4 min-w-max px-4 py-8">
                {workflow.map((w, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: w.color }}>
                        <w.icon className="w-7 h-7" />
                      </div>
                      <span className="text-sm font-medium text-flood-text mt-2 text-center max-w-xs">{w.step}</span>
                    </div>
                    {i < workflow.length - 1 && (
                      <svg className="w-12 h-8 text-flood-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card variant="hover" className="border-l-4 border-flood-danger">
                <h3 className="text-lg font-semibold text-flood-text mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-flood-danger" />
                  Traditional System
                </h3>
                <ul className="space-y-3">
                  {traditional.map((t, i) => (
                    <li key={i} className="flex items-center gap-3 text-flood-muted">
                      <XCircle className="w-5 h-5 text-flood-danger/50 flex-shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card variant="hover" className="border-l-4 border-flood-primary">
                <h3 className="text-lg font-semibold text-flood-text mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-flood-primary" />
                  FloodLens
                </h3>
                <ul className="space-y-3">
                  {floodlens.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-flood-muted">
                      <CheckCircle className="w-5 h-5 text-flood-primary/50 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>

        <section id="solution" className="py-16 lg:py-24 bg-flood-card/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-flood-text mb-4">One Platform. The Complete Flood Response Loop.</h2>
              <p className="text-flood-muted max-w-2xl mx-auto">Six integrated capabilities. Zero gaps.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <Link key={f.id} to="/how-it-works" className="group">
                  <Card variant="hover" className="h-full group-hover:border-flood-primary/30 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: f.color }}>
                          <f.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-2xl font-bold text-flood-text font-mono">{f.num}</span>
                          <span className="text-xs text-flood-muted ml-2 uppercase tracking-wider">{f.title}</span>
                        </div>
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-flood-text mb-2">{f.desc}</h4>
                    <p className="text-sm text-flood-muted mb-4 line-clamp-3">{f.details}</p>
                    <div className="flex items-center text-sm text-flood-primary font-medium group-hover:underline">
                      View details <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass-strong rounded-2xl border border-flood-border p-8 lg:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-flood-primary/5 via-transparent to-flood-critical/5" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold text-flood-text mb-4">From Prediction to Verified Resolution</h2>
                <p className="text-flood-muted mb-8 max-w-2xl mx-auto">
                  Every flood event flows through our complete loop. No step skipped. No evidence lost. 
                  Every resolution verified by AI.
                </p>
                <div className="flex flex-wrap justify-center items-center gap-2 mb-8 text-sm font-mono">
                  <span className="px-3 py-1 rounded bg-flood-primary/20 text-flood-primary">PREDICT</span>
                  <span className="text-flood-muted">→</span>
                  <span className="px-3 py-1 rounded bg-flood-primary/20 text-flood-primary">SEE</span>
                  <span className="text-flood-muted">→</span>
                  <span className="px-3 py-1 rounded bg-flood-primary/20 text-flood-primary">UNDERSTAND</span>
                  <span className="text-flood-muted">→</span>
                  <span className="px-3 py-1 rounded bg-flood-primary/20 text-flood-primary">ACT</span>
                  <span className="text-flood-muted">→</span>
                  <span className="px-3 py-1 rounded bg-flood-primary/20 text-flood-primary">VERIFY</span>
                  <span className="text-flood-muted">→</span>
                  <span className="px-3 py-1 rounded bg-flood-primary/20 text-flood-primary">LEARN</span>
                </div>
                <Link to="/dashboard">
                  <Button size="lg" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
                    Open FloodLens Command Center
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-flood-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-flood-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-flood-bg" />
              </div>
              <span className="text-xl font-bold text-flood-text">FloodLens</span>
            </div>
            <p className="text-sm text-flood-muted">
              SIH26085 — Urban Flood Nowcasting System (Drainage and Rainfall Coupling) | Prototype Demo
            </p>
            <div className="flex items-center gap-6 text-sm text-flood-muted">
              <span>Not for operational use</span>
              <span>Demo data only</span>
              <span>No official affiliation</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}