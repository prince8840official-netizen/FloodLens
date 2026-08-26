import { createContext, useContext, useReducer, useMemo, ReactNode } from 'react';
import type {
  FloodIncident,
  Road,
  Drain,
  ResponseTeam,
  Notification,
  AIRecommendation,
  SimulationScenario,
  HistoricalIncident,
  KPIData,
  User,
  UserRole,
  AppSettings,
  Coordinates,
  CameraFeed,
} from '../types';
import {
  mockIncidents,
  mockRoads,
  mockDrains,
  mockTeams,
  mockNotifications,
  mockRecommendations,
  mockSimulations,
  mockHistory,
  mockKPI,
  mockUsers,
  defaultSettings,
  mockCameraFeeds,
  mockWeather,
} from '../data/mockData';

interface AppState {
  incidents: FloodIncident[];
  roads: Road[];
  drains: Drain[];
  teams: ResponseTeam[];
  notifications: Notification[];
  recommendations: AIRecommendation[];
  simulations: SimulationScenario[];
  history: HistoricalIncident[];
  kpi: KPIData;
  currentUser: User | null;
  userRole: UserRole;
  settings: AppSettings;
  selectedIncident: FloodIncident | null;
  selectedRoad: Road | null;
  selectedDrain: Drain | null;
  selectedTeam: ResponseTeam | null;
  mapCenter: Coordinates;
  mapZoom: number;
  activeMapLayers: string[];
  sidebarCollapsed: boolean;
  rightDrawerOpen: boolean;
  rightDrawerContent: string | null;
  loading: boolean;
}

type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_ROLE'; payload: UserRole }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_INCIDENT'; payload: Partial<FloodIncident> & { id: string } }
  | { type: 'ADD_INCIDENT'; payload: FloodIncident }
  | { type: 'UPDATE_ROAD'; payload: Partial<Road> & { id: string } }
  | { type: 'UPDATE_DRAIN'; payload: Partial<Drain> & { id: string } }
  | { type: 'UPDATE_TEAM'; payload: Partial<ResponseTeam> & { id: string } }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'UPDATE_KPI'; payload: Partial<KPIData> }
  | { type: 'SET_SELECTED_INCIDENT'; payload: FloodIncident | null }
  | { type: 'SET_SELECTED_ROAD'; payload: Road | null }
  | { type: 'SET_SELECTED_DRAIN'; payload: Drain | null }
  | { type: 'SET_SELECTED_TEAM'; payload: ResponseTeam | null }
  | { type: 'SET_MAP_VIEW'; payload: { center?: Coordinates; zoom?: number } }
  | { type: 'TOGGLE_MAP_LAYER'; payload: string }
  | { type: 'SET_ACTIVE_LAYERS'; payload: string[] }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'OPEN_RIGHT_DRAWER'; payload: string }
  | { type: 'CLOSE_RIGHT_DRAWER' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'ADD_RECOMMENDATION'; payload: AIRecommendation }
  | { type: 'DISMISS_RECOMMENDATION'; payload: string }
  | { type: 'ADD_SIMULATION'; payload: SimulationScenario }
  | { type: 'ADD_HISTORY'; payload: HistoricalIncident }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AppState = {
  incidents: mockIncidents,
  roads: mockRoads,
  drains: mockDrains,
  teams: mockTeams,
  notifications: mockNotifications,
  recommendations: mockRecommendations,
  simulations: mockSimulations,
  history: mockHistory,
  kpi: mockKPI,
  currentUser: null,
  userRole: 'control-officer',
  settings: defaultSettings,
  selectedIncident: null,
  selectedRoad: null,
  selectedDrain: null,
  selectedTeam: null,
  mapCenter: { lat: 26.4499, lng: 80.3319 },
  mapZoom: 13,
  activeMapLayers: ['flooded-roads', 'flood-predictions', 'blocked-drains', 'response-teams'],
  sidebarCollapsed: false,
  rightDrawerOpen: false,
  rightDrawerContent: null,
  loading: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload, userRole: action.payload.role };
    
    case 'SET_ROLE':
      return { ...state, userRole: action.payload };
    
    case 'LOGOUT':
      return { ...state, currentUser: null, userRole: 'control-officer' };
    
    case 'UPDATE_INCIDENT':
      return {
        ...state,
        incidents: state.incidents.map(inc =>
          inc.id === action.payload.id ? { ...inc, ...action.payload, updatedAt: new Date() } : inc
        ),
        selectedIncident: state.selectedIncident?.id === action.payload.id
          ? { ...state.selectedIncident, ...action.payload, updatedAt: new Date() }
          : state.selectedIncident,
      };
    
    case 'ADD_INCIDENT':
      return {
        ...state,
        incidents: [action.payload, ...state.incidents],
        kpi: { ...state.kpi, predictedEvents: state.kpi.predictedEvents + 1 },
      };
    
    case 'UPDATE_ROAD':
      return {
        ...state,
        roads: state.roads.map(road =>
          road.id === action.payload.id ? { ...road, ...action.payload } : road
        ),
        selectedRoad: state.selectedRoad?.id === action.payload.id
          ? { ...state.selectedRoad, ...action.payload }
          : state.selectedRoad,
      };
    
    case 'UPDATE_DRAIN':
      return {
        ...state,
        drains: state.drains.map(drain =>
          drain.id === action.payload.id ? { ...drain, ...action.payload } : drain
        ),
        selectedDrain: state.selectedDrain?.id === action.payload.id
          ? { ...state.selectedDrain, ...action.payload }
          : state.selectedDrain,
      };
    
    case 'UPDATE_TEAM':
      return {
        ...state,
        teams: state.teams.map(team =>
          team.id === action.payload.id ? { ...team, ...action.payload } : team
        ),
        selectedTeam: state.selectedTeam?.id === action.payload.id
          ? { ...state.selectedTeam, ...action.payload }
          : state.selectedTeam,
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
      };
    
    case 'UPDATE_KPI':
      return { ...state, kpi: { ...state.kpi, ...action.payload } };
    
    case 'SET_SELECTED_INCIDENT':
      return { ...state, selectedIncident: action.payload };
    
    case 'SET_SELECTED_ROAD':
      return { ...state, selectedRoad: action.payload };
    
    case 'SET_SELECTED_DRAIN':
      return { ...state, selectedDrain: action.payload };
    
    case 'SET_SELECTED_TEAM':
      return { ...state, selectedTeam: action.payload };
    
    case 'SET_MAP_VIEW':
      return {
        ...state,
        mapCenter: action.payload.center ?? state.mapCenter,
        mapZoom: action.payload.zoom ?? state.mapZoom,
      };
    
    case 'TOGGLE_MAP_LAYER':
      return {
        ...state,
        activeMapLayers: state.activeMapLayers.includes(action.payload)
          ? state.activeMapLayers.filter(l => l !== action.payload)
          : [...state.activeMapLayers, action.payload],
      };
    
    case 'SET_ACTIVE_LAYERS':
      return { ...state, activeMapLayers: action.payload };
    
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    
    case 'SET_SIDEBAR_COLLAPSED':
      return { ...state, sidebarCollapsed: action.payload };
    
    case 'OPEN_RIGHT_DRAWER':
      return { ...state, rightDrawerOpen: true, rightDrawerContent: action.payload };
    
    case 'CLOSE_RIGHT_DRAWER':
      return { ...state, rightDrawerOpen: false, rightDrawerContent: null };
    
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    
    case 'ADD_RECOMMENDATION':
      return { ...state, recommendations: [action.payload, ...state.recommendations] };
    
    case 'DISMISS_RECOMMENDATION':
      return {
        ...state,
        recommendations: state.recommendations.filter(r => r.id !== action.payload),
      };
    
    case 'ADD_SIMULATION':
      return { ...state, simulations: [action.payload, ...state.simulations] };
    
    case 'ADD_HISTORY':
      return {
        ...state,
        history: [action.payload, ...state.history],
        kpi: { ...state.kpi, aiVerifiedResolved: state.kpi.aiVerifiedResolved + 1 },
      };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    default:
      return state;
  }
}

interface AppContextType {
  incidents: FloodIncident[];
  roads: Road[];
  drains: Drain[];
  teams: ResponseTeam[];
  notifications: Notification[];
  recommendations: AIRecommendation[];
  simulations: SimulationScenario[];
  history: HistoricalIncident[];
  kpi: KPIData;
  currentUser: User | null;
  userRole: UserRole;
  settings: AppSettings;
  selectedIncident: FloodIncident | null;
  selectedRoad: Road | null;
  selectedDrain: Drain | null;
  selectedTeam: ResponseTeam | null;
  mapCenter: Coordinates;
  mapZoom: number;
  activeMapLayers: string[];
  sidebarCollapsed: boolean;
  rightDrawerOpen: boolean;
  rightDrawerContent: string | null;
  loading: boolean;
  cameras: CameraFeed[];
  dispatch: React.Dispatch<AppAction>;
  login: (email: string, password: string) => Promise<boolean>;
  demoLogin: () => void;
  assignTeamToIncident: (incidentId: string, teamId: string) => void;
  resolveIncident: (incidentId: string, resolution: FloodIncident['resolution']) => void;
  createIncidentFromPrediction: (roadId: string) => void;
  runSimulation: (scenario: Omit<SimulationScenario, 'id' | 'results'>) => void;
  getIncidentsByStatus: (status: 'predicted' | 'detected' | 'verified' | 'registered' | 'assigned' | 'responding' | 'resolved') => FloodIncident[];
  getRoadsBySeverity: (severity: 'normal' | 'moderate' | 'high' | 'critical' | 'resolved') => Road[];
  getAvailableTeams: () => ResponseTeam[];
  unreadNotificationCount: number;
  onRoadClick: (road: Road) => void;
  onDrainClick: (drain: Drain) => void;
  onIncidentClick: (incident: FloodIncident) => void;
  onTeamClick: (team: ResponseTeam) => void;
  onCameraClick: (camera: CameraFeed) => void;
  onMapClick: (center: Coordinates, zoom: number) => void;
  setActiveMapLayers: (layers: string[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const unreadNotificationCount = state.notifications.filter(n => !n.read).length;

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = mockUsers.find(u => u.email === email);
    if (user && password === 'demo123') {
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_LOADING', payload: false });
      return true;
    }
    
    dispatch({ type: 'SET_LOADING', payload: false });
    return false;
  };

  const demoLogin = () => {
    const user = mockUsers[0];
    dispatch({ type: 'SET_USER', payload: user });
  };

  const assignTeamToIncident = (incidentId: string, teamId: string) => {
    const incident = state.incidents.find(i => i.id === incidentId);
    const team = state.teams.find(t => t.id === teamId);
    
    if (!incident || !team) return;

    const now = new Date();
    
    dispatch({
      type: 'UPDATE_INCIDENT',
      payload: {
        id: incidentId,
        status: 'assigned',
        assignedTeamId: teamId,
        assignedTeamName: team.name,
        timeline: [
          ...incident.timeline,
          {
            id: `TL-${Date.now()}`,
            stage: 'assigned',
            timestamp: now,
            description: `${team.name} assigned to incident`,
            actor: state.currentUser?.name || 'Control Officer',
            automated: false,
          },
        ],
      },
    });

    dispatch({
      type: 'UPDATE_TEAM',
      payload: {
        id: teamId,
        status: 'enroute',
        currentIncidentId: incidentId,
        currentIncidentName: incident.roadName,
        distance: team.distance,
        eta: team.eta,
      },
    });

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `NOT-${Date.now()}`,
        type: 'team',
        severity: 'high',
        title: 'Team Assigned',
        message: `${team.name} assigned to ${incident.roadName}. ETA: ${team.eta} minutes.`,
        read: false,
        timestamp: now,
        actionUrl: `/incidents/${incidentId}`,
        metadata: { incidentId, teamId },
      },
    });
  };

  const resolveIncident = (incidentId: string, resolution: FloodIncident['resolution']) => {
    const incident = state.incidents.find(i => i.id === incidentId);
    const team = incident?.assignedTeamId ? state.teams.find(t => t.id === incident.assignedTeamId) : null;
    
    if (!incident) return;

    const now = new Date();
    
    dispatch({
      type: 'UPDATE_INCIDENT',
      payload: {
        id: incidentId,
        status: 'resolved',
        resolution,
        timeline: [
          ...incident.timeline,
          {
            id: `TL-${Date.now()}`,
            stage: 'resolved',
            timestamp: now,
            description: 'AI verified resolution - road clear confirmed',
            actor: 'FloodLens AI',
            automated: true,
          },
        ],
      },
    });

    if (team) {
      dispatch({
        type: 'UPDATE_TEAM',
        payload: {
          id: team.id,
          status: 'completed',
          currentIncidentId: undefined,
          currentIncidentName: undefined,
        },
      });
    }

    const road = state.roads.find(r => r.id === incident.roadId);
    if (road) {
      dispatch({
        type: 'UPDATE_ROAD',
        payload: {
          id: road.id,
          severity: 'resolved',
          probability: Math.max(5, road.probability - 40),
          floodScore: Math.max(10, road.floodScore - 50),
        },
      });
    }

    const historyEntry: HistoricalIncident = {
      id: `HIS-${Date.now()}`,
      date: now,
      roadId: incident.roadId,
      roadName: incident.roadName,
      ward: incident.ward,
      severity: incident.severity,
      duration: (now.getTime() - incident.timestamp.getTime()) / (1000 * 60 * 60),
      cause: incident.probableCause,
      rainfall: incident.rainfall,
      responseTime: incident.timeline.find(t => t.stage === 'assigned') 
        ? (incident.timeline.find(t => t.stage === 'assigned')!.timestamp.getTime() - incident.timestamp.getTime()) / (1000 * 60)
        : 0,
      resolutionTime: (now.getTime() - incident.timestamp.getTime()) / (1000 * 60),
      damage: Math.random() * 50 + 10,
      resolved: true,
    };

    dispatch({ type: 'ADD_HISTORY', payload: historyEntry });

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `NOT-${Date.now()}`,
        type: 'resolution',
        severity: 'success',
        title: 'Incident Resolved',
        message: `Incident ${incidentId} (${incident.roadName}) AI verified resolved.`,
        read: false,
        timestamp: now,
        actionUrl: `/incidents/${incidentId}`,
        metadata: { incidentId },
      },
    });

    dispatch({
      type: 'UPDATE_KPI',
      payload: {
        criticalIncidents: Math.max(0, state.kpi.criticalIncidents - 1),
        aiVerifiedResolved: state.kpi.aiVerifiedResolved + 1,
      },
    });
  };

  const createIncidentFromPrediction = (roadId: string) => {
    const road = state.roads.find(r => r.id === roadId);
    if (!road) return;

    const availableTeams = state.teams.filter(t => t.status === 'idle' && t.type === 'drainage');
    const assignedTeam = availableTeams[0];

    const newIncident: FloodIncident = {
      id: `FLD-KNP-${new Date().getFullYear()}-${String(state.incidents.length + 185).padStart(6, '0')}`,
      roadId: road.id,
      roadName: road.name,
      coordinates: road.coordinates[0],
      ward: road.ward,
      zone: road.zone,
      timestamp: new Date(),
      severity: road.severity,
      probability: road.probability,
      aiConfidence: road.aiConfidence,
      rainfall: mockWeather.currentRainfall,
      drainageStress: road.drainStress,
      probableCause: road.probableCause,
      causeConfidence: road.causeConfidence,
      status: 'registered',
      assignedTeamId: assignedTeam?.id,
      assignedTeamName: assignedTeam?.name,
      evidence: [],
      sensorData: [],
      cameraData: [],
      citizenReports: [],
      timeline: [
        {
          id: `TL-${Date.now()}-1`,
          stage: 'predicted',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          description: `AI predicted ${road.probability}% flood probability for ${road.name}`,
          actor: 'FloodLens AI',
          automated: true,
        },
        {
          id: `TL-${Date.now()}-2`,
          stage: 'detected',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          description: 'RoadEye AI confirmed waterlogging via CCTV',
          actor: 'RoadEye AI',
          automated: true,
        },
        {
          id: `TL-${Date.now()}-3`,
          stage: 'verified',
          timestamp: new Date(Date.now() - 2 * 60 * 1000),
          description: 'Multi-source evidence fusion confirmed flood event',
          actor: 'FloodLens AI',
          automated: true,
        },
        {
          id: `TL-${Date.now()}-4`,
          stage: 'registered',
          timestamp: new Date(),
          description: 'Incident automatically registered',
          actor: 'System',
          automated: true,
        },
        ...(assignedTeam ? [{
          id: `TL-${Date.now()}-5`,
          stage: 'assigned' as 'assigned',
          timestamp: new Date(),
          description: `${assignedTeam.name} auto-assigned (closest available)`,
          actor: 'System',
          automated: true,
        }] : []),
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dispatch({ type: 'ADD_INCIDENT', payload: newIncident });

    if (assignedTeam) {
      dispatch({
        type: 'UPDATE_TEAM',
        payload: {
          id: assignedTeam.id,
          status: 'enroute',
          currentIncidentId: newIncident.id,
          currentIncidentName: newIncident.roadName,
        },
      });
    }

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `NOT-${Date.now()}`,
        type: 'incident',
        severity: road.severity === 'critical' ? 'critical' : 'high',
        title: 'New Incident Registered',
        message: `Incident ${newIncident.id} created for ${road.name} (${road.ward})`,
        read: false,
        timestamp: new Date(),
        actionUrl: `/incidents/${newIncident.id}`,
        metadata: { incidentId: newIncident.id },
      },
    });
  };

  const runSimulation = (scenario: Omit<SimulationScenario, 'id' | 'results'>) => {
    const affectedRoads = Math.floor(Math.random() * 20) + 5;
    const highRiskRoads = Math.floor(affectedRoads * 0.4);
    const criticalInfra = Math.floor(highRiskRoads * 0.5);
    const drainageStress = Math.min(95, 40 + scenario.rainfall * 0.5 + (scenario.drainCondition === 'blocked' ? 30 : 0));
    
    const trafficDisruption: SimulationScenario['results']['trafficDisruption'] = 
      drainageStress > 85 ? 'severe' : drainageStress > 70 ? 'high' : drainageStress > 50 ? 'medium' : 'low';
    
    const estimatedDamage = Math.floor(affectedRoads * criticalInfra * (scenario.rainfall / 10));

    const newSimulation: SimulationScenario = {
      id: `SIM-${Date.now()}`,
      ...scenario,
      results: {
        affectedRoads,
        highRiskRoads,
        criticalInfrastructure: criticalInfra,
        drainageStress,
        trafficDisruption,
        estimatedDamage,
      },
    };

    dispatch({ type: 'ADD_SIMULATION', payload: newSimulation });
  };

  const getIncidentsByStatus = (status: 'predicted' | 'detected' | 'verified' | 'registered' | 'assigned' | 'responding' | 'resolved') => 
    state.incidents.filter(i => i.status === status);

  const getRoadsBySeverity = (severity: 'normal' | 'moderate' | 'high' | 'critical' | 'resolved') =>
    state.roads.filter(r => r.severity === severity);

  const getAvailableTeams = () =>
    state.teams.filter(t => t.status === 'idle');

  const onRoadClick = (road: Road) => {
    dispatch({ type: 'SET_SELECTED_ROAD', payload: road });
    dispatch({ type: 'OPEN_RIGHT_DRAWER', payload: 'road-detail' });
  };

  const onDrainClick = (drain: Drain) => {
    dispatch({ type: 'SET_SELECTED_DRAIN', payload: drain });
    dispatch({ type: 'OPEN_RIGHT_DRAWER', payload: 'drain-detail' });
  };

  const onIncidentClick = (incident: FloodIncident) => {
    dispatch({ type: 'SET_SELECTED_INCIDENT', payload: incident });
    dispatch({ type: 'OPEN_RIGHT_DRAWER', payload: 'incident-detail' });
  };

  const onTeamClick = (team: ResponseTeam) => {
    dispatch({ type: 'SET_SELECTED_TEAM', payload: team });
    dispatch({ type: 'OPEN_RIGHT_DRAWER', payload: 'team-detail' });
  };

  const onCameraClick = (camera: CameraFeed) => {
    // Handle camera click
  };

  const onMapClick = (center: Coordinates, zoom: number) => {
    dispatch({ type: 'SET_MAP_VIEW', payload: { center, zoom } });
  };

  const setActiveMapLayers = (layers: string[]) => {
    dispatch({ type: 'SET_ACTIVE_LAYERS', payload: layers });
  };

  const value = useMemo(() => ({
    ...state,
    cameras: mockCameraFeeds,
    dispatch,
    login,
    demoLogin,
    assignTeamToIncident,
    resolveIncident,
    createIncidentFromPrediction,
    runSimulation,
    getIncidentsByStatus,
    getRoadsBySeverity,
    getAvailableTeams,
    unreadNotificationCount,
    onRoadClick,
    onDrainClick,
    onIncidentClick,
    onTeamClick,
    onCameraClick,
    onMapClick,
    setActiveMapLayers,
  }), [state]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

const AppContext = createContext<AppContextType | undefined>(undefined);