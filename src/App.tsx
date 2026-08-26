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
import { Teams } from './pages/app/Teams';
import { CitizenReports } from './pages/app/CitizenReports';
import { Analytics } from './pages/app/Analytics';
import { History } from './pages/app/History';
import { Recommendations } from './pages/app/Recommendations';
import { Simulation } from './pages/app/Simulation';
import { Notifications } from './pages/app/Notifications';
import { SettingsPage as Settings } from './pages/app/Settings';

function PrivateRoute({ element }: { element: React.ReactNode }) {
  return (
    <AppLayout>
      {element}
    </AppLayout>
  );
}

function PublicRoute({ element }: { element: React.ReactNode }) {
  return <>{element}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppProvider>
          <Routes>
            <Route path="/" element={<PublicRoute element={<Landing />} />} />
            <Route path="/login" element={<PublicRoute element={<Login />} />} />
            <Route path="/how-it-works" element={<PublicRoute element={<HowItWorks />} />} />
            <Route path="/technology" element={<PublicRoute element={<Technology />} />} />
            <Route path="/about" element={<PublicRoute element={<About />} />} />
            
            <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
            <Route path="/map" element={<PrivateRoute element={<MapPage />} />} />
            <Route path="/predictions" element={<PrivateRoute element={<Predictions />} />} />
            <Route path="/incidents" element={<PrivateRoute element={<Incidents />} />} />
            <Route path="/incidents/:id" element={<PrivateRoute element={<IncidentDetails />} />} />
            <Route path="/roads" element={<PrivateRoute element={<Roads />} />} />
            <Route path="/roads/:id" element={<PrivateRoute element={<RoadDetails />} />} />
            <Route path="/drainage" element={<PrivateRoute element={<Drainage />} />} />
            <Route path="/roadeye" element={<PrivateRoute element={<RoadEye />} />} />
            <Route path="/teams" element={<PrivateRoute element={<Teams />} />} />
            <Route path="/citizen-reports" element={<PrivateRoute element={<CitizenReports />} />} />
            <Route path="/analytics" element={<PrivateRoute element={<Analytics />} />} />
            <Route path="/history" element={<PrivateRoute element={<History />} />} />
            <Route path="/recommendations" element={<PrivateRoute element={<Recommendations />} />} />
            <Route path="/simulation" element={<PrivateRoute element={<Simulation />} />} />
            <Route path="/notifications" element={<PrivateRoute element={<Notifications />} />} />
            <Route path="/settings" element={<PrivateRoute element={<Settings />} />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;