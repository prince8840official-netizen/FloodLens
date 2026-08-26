export type Severity = 'normal' | 'moderate' | 'high' | 'critical' | 'resolved' | 'success';
export type IncidentStatus = 'predicted' | 'detected' | 'verified' | 'registered' | 'assigned' | 'responding' | 'resolved';
export type TeamStatus = 'idle' | 'enroute' | 'on-site' | 'responding' | 'resolving' | 'completed';
export type UserRole = 'control-officer' | 'drainage-engineer' | 'response-team' | 'citizen';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Road {
  id: string;
  name: string;
  coordinates: Coordinates[];
  floodScore: number;
  probability: number;
  expectedOnset: number; // minutes
  estimatedDuration: number; // minutes
  severity: Severity;
  aiConfidence: number;
  drainId: string;
  drainStress: number;
  historicalIncidents: number;
  lastMaintenance: number; // days ago
  probableCause: string;
  causeConfidence: number;
  recommendedAction: string;
  ward: string;
  zone: string;
  length: number; // km
  trafficVolume: 'low' | 'medium' | 'high';
  criticalInfrastructure: boolean;
}

export interface Drain {
  id: string;
  name: string;
  type: 'storm-drain' | 'manhole' | 'pump-station' | 'outfall';
  coordinates: Coordinates;
  capacity: number; // percentage stressed
  blockageProbability: number;
  historicalIncidents: number;
  lastMaintenance: number; // days ago
  connectedRoads: string[];
  priority: 'P1' | 'P2' | 'P3';
  status: 'normal' | 'stressed' | 'blocked' | 'maintenance';
  flowRate: number; // liters/sec
  depth: number; // meters
}

export interface FloodIncident {
  id: string;
  roadId: string;
  roadName: string;
  coordinates: Coordinates;
  ward: string;
  zone: string;
  timestamp: Date;
  severity: Severity;
  probability: number;
  aiConfidence: number;
  rainfall: number; // mm
  drainageStress: number;
  probableCause: string;
  causeConfidence: number;
  status: IncidentStatus;
  assignedTeamId?: string;
  assignedTeamName?: string;
  evidence: Evidence[];
  sensorData: SensorReading[];
  cameraData: CameraFeed[];
  citizenReports: CitizenReport[];
  resolution?: Resolution;
  timeline: TimelineEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Evidence {
  id: string;
  type: 'camera' | 'sensor' | 'citizen' | 'dashcam' | 'satellite';
  source: string;
  confidence: number;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

export interface SensorReading {
  id: string;
  sensorId: string;
  type: 'water-level' | 'flow' | 'pressure' | 'rainfall';
  value: number;
  unit: string;
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
  timestamp: Date;
  coordinates: Coordinates;
}

export interface CameraFeed {
  id: string;
  name: string;
  coordinates: Coordinates;
  status: 'online' | 'offline' | 'maintenance';
  floodDetected: boolean;
  confidence: number;
  severity: Severity;
  imageUrl: string;
  lastUpdated: Date;
  ward: string;
}

export interface CitizenReport {
  id: string;
  coordinates: Coordinates;
  address: string;
  description: string;
  imageUrl?: string;
  aiClassification: string;
  aiConfidence: number;
  matchedIncidentId?: string;
  status: 'pending' | 'verified' | 'merged' | 'rejected';
  timestamp: Date;
  reporterId: string;
}

export interface Resolution {
  beforeImageUrl: string;
  afterImageUrl: string;
  sensorVerification: boolean;
  cameraVerification: boolean;
  aiVerification: boolean;
  verifiedAt: Date;
  verifiedBy: string;
  notes: string;
}

export interface TimelineEvent {
  id: string;
  stage: IncidentStatus;
  timestamp: Date;
  description: string;
  actor: string;
  automated: boolean;
}

export interface ResponseTeam {
  id: string;
  name: string;
  type: 'drainage' | 'emergency' | 'traffic' | 'medical' | 'utility';
  status: TeamStatus;
  coordinates: Coordinates;
  currentIncidentId?: string;
  currentIncidentName?: string;
  distance: number; // km
  eta: number; // minutes
  priority: 'P1' | 'P2' | 'P3';
  members: number;
  vehicle: string;
  equipment: string[];
  ward: string;
  zone: string;
}

export interface WeatherData {
  currentRainfall: number; // mm/hr
  forecast: RainfallForecast[];
  alerts: WeatherAlert[];
}

export interface RainfallForecast {
  time: Date;
  rainfall: number; // mm
  probability: number;
  intensity: 'light' | 'moderate' | 'heavy' | 'extreme';
}

export interface WeatherAlert {
  id: string;
  type: 'rainfall' | 'flood' | 'storm' | 'cyclone';
  severity: Severity;
  message: string;
  areas: string[];
  validFrom: Date;
  validUntil: Date;
}

export interface Notification {
  id: string;
  type: 'incident' | 'prediction' | 'team' | 'resolution' | 'system' | 'maintenance';
  severity: Severity;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
  metadata: Record<string, unknown>;
}

export interface SimulationScenario {
  id: string;
  name: string;
  rainfall: number; // mm
  duration: number; // minutes
  drainCondition: 'normal' | 'blocked' | 'partially-blocked' | 'cleared';
  targetDrainId?: string;
  results: SimulationResult;
}

export interface SimulationResult {
  affectedRoads: number;
  highRiskRoads: number;
  criticalInfrastructure: number;
  drainageStress: number;
  trafficDisruption: 'low' | 'medium' | 'high' | 'severe';
  estimatedDamage: number; // INR lakhs
  comparison?: {
    before: Partial<SimulationResult>;
    after: Partial<SimulationResult>;
  };
}

export interface AIRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'drainage' | 'traffic' | 'preventive' | 'emergency' | 'maintenance';
  title: string;
  description: string;
  reason: string;
  action: string;
  affectedAssets: string[];
  estimatedImpact: string;
  confidence: number;
  createdAt: Date;
}

export interface HistoricalIncident {
  id: string;
  date: Date;
  roadId: string;
  roadName: string;
  ward: string;
  severity: Severity;
  duration: number; // hours
  cause: string;
  rainfall: number; // mm
  responseTime: number; // minutes
  resolutionTime: number; // minutes
  damage: number; // INR lakhs
  resolved: boolean;
}

export interface KPIData {
  highRiskRoads: number;
  criticalIncidents: number;
  predictedEvents: number;
  activeTeams: number;
  aiVerifiedResolved: number;
  avgResponseTime: number; // minutes
  avgResolutionTime: number; // minutes
  systemUptime: number; // percentage
}

export interface MapLayer {
  id: string;
  name: string;
  icon: string;
  color: string;
  visible: boolean;
  type: 'marker' | 'polyline' | 'polygon' | 'heatmap';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  ward?: string;
  zone?: string;
  permissions: string[];
}

export interface AppSettings {
  alerts: {
    rainfallThreshold: number;
    floodProbabilityThreshold: number;
    drainageStressThreshold: number;
    enablePush: boolean;
    enableEmail: boolean;
    enableSMS: boolean;
  };
  map: {
    defaultLayers: string[];
    defaultZoom: number;
    defaultCenter: Coordinates;
    showTraffic: boolean;
    showInfrastructure: boolean;
  };
  ai: {
    confidenceThreshold: number;
    autoCreateIncidents: boolean;
    autoAssignTeams: boolean;
    verificationRequired: boolean;
  };
  privacy: {
    dataRetentionDays: number;
    anonymizeCitizenReports: boolean;
    shareWithAgencies: boolean;
  };
  users: {
    allowSelfRegistration: boolean;
    defaultRole: UserRole;
    sessionTimeout: number; // minutes
  };
}