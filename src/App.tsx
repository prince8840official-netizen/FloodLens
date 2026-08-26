import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/ui/Toast';
import { Landing } from './pages/public/Landing';
import { Login } from './pages/public/Login';
import { HowItWorks } from './pages/public/HowItWorks';
import { Technology } from './pages/public/Technology';
import { About } from './pages/public/About';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/app/Dashboard';
import { MapPage } from './pages/app/Map';
import { Predictions } from './pages/app/Predictions';
import { Incidents } from './pages/app/Incidents';
import { IncidentDetails } from './pages/app/IncidentDetails';
import { Roads } from './pages/app/Roads';
import { RoadDetails } from './pages/app/RoadDetails';
import { Drainage } from './pages/app/Drainage';
import { RoadEye } from './pages/app/RoadEye';
import { RoadWatch } from './pages/app/RoadWatch';
import { RoadWatchIncidents } from './pages/app/RoadWatchIncidents';
import { MunicipalDashboard } from './pages/app/MunicipalDashboard';
import { Teams } from './pages/app/Teams';
import { CitizenReports } from './pages/app/CitizenReports';
import { Analytics } from './pages/app/Analytics';
import { History } from './pages/app/History';
import { Recommendations } from './pages/app/Recommendations';
import { Simulation } from './pages/app/Simulation';
import { Notifications } from './pages/app/Notifications';
import { SettingsPage } from './pages/app/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/technology" element={<Technology />} />
            <Route path="/about" element={<About />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/incidents/:id" element={<IncidentDetails />} />
            <Route path="/roads" element={<Roads />} />
            <Route path="/roads/:id" element={<RoadDetails />} />
            <Route path="/drainage" element={<Drainage />} />
            <Route path="/roadeye" element={<RoadEye />} />
            <Route path="/roadwatch" element={<RoadWatch />} />
            <Route path="/roadwatch/incidents" element={<RoadWatchIncidents />} />
            <Route path="/municipal" element={<MunicipalDashboard />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/citizen-reports" element={<CitizenReports />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/history" element={<History />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}