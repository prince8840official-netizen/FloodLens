import { useState, useEffect, useRef, useCallback } from 'react';
import { clsx } from 'clsx';
import { 
  Camera, X, CheckCircle, AlertCircle, MapPin, 
  Clock, Image, Send, RefreshCw, Shield, Zap,
  ArrowRight, ArrowLeft, ChevronRight, Download,
  Eye, EyeOff, Settings, HelpCircle, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Tooltip } from '../../components/ui/Tooltip';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/ui/Toast';
import { 
  cameraService, 
  locationService, 
  AnalysisService,
  RoadWatchService,
  type CapturedImage,
  type LocationData,
  type RoadWatchAnalysisResult,
  type RoadWatchIncident,
} from '../../services/roadwatch';

type RoadWatchStep = 
  | 'permission' 
  | 'camera' 
  | 'preview' 
  | 'analyzing' 
  | 'location' 
  | 'report' 
  | 'submitting' 
  | 'success';

const stepConfig: Record<RoadWatchStep, { label: string; icon: React.ReactNode; description: string }> = {
  permission: { label: 'Permissions', icon: <Shield className="w-5 h-5" />, description: 'Grant camera & location access' },
  camera: { label: 'Capture', icon: <Camera className="w-5 h-5" />, description: 'Take a photo of the road condition' },
  preview: { label: 'Preview', icon: <Eye className="w-5 h-5" />, description: 'Review captured image' },
  analyzing: { label: 'Analyzing', icon: <Zap className="w-5 h-5 animate-spin" />, description: 'AI is analyzing the image' },
  location: { label: 'Location', icon: <MapPin className="w-5 h-5" />, description: 'Getting GPS coordinates' },
  report: { label: 'Report', icon: <AlertTriangle className="w-5 h-5" />, description: 'Review generated incident report' },
  submitting: { label: 'Submitting', icon: <Send className="w-5 h-5 animate-spin" />, description: 'Sending to municipal authority' },
  success: { label: 'Complete', icon: <CheckCircle className="w-5 h-5 text-flood-success" />, description: 'Incident reported successfully' },
};

const stepOrder: RoadWatchStep[] = ['permission', 'camera', 'preview', 'analyzing', 'location', 'report', 'submitting', 'success'];

const mapSeverityToBadge = (severity: 'low' | 'moderate' | 'high' | 'critical'): import('../../types').Severity => {
  switch (severity) {
    case 'low': return 'normal';
    case 'moderate': return 'moderate';
    case 'high': return 'high';
    case 'critical': return 'critical';
  }
};

const mapStatusToBadge = (status: 'reported' | 'under-review' | 'assigned' | 'field-response' | 'resolved' | 'verified'): import('../../types').Severity => {
  switch (status) {
    case 'reported': return 'normal';
    case 'under-review': return 'moderate';
    case 'assigned': return 'high';
    case 'field-response': return 'critical';
    case 'resolved': return 'success';
    case 'verified': return 'success';
  }
};

export function RoadWatch() {
  const { dispatch, currentUser, userRole } = useApp();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentStep, setCurrentStep] = useState<RoadWatchStep>('permission');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<CapturedImage | null>(null);
  const [analysisResult, setAnalysisResult] = useState<RoadWatchAnalysisResult | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedIncident, setSubmittedIncident] = useState<RoadWatchIncident | null>(null);
  const [showExistingIncidents, setShowExistingIncidents] = useState(false);

  const goToStep = useCallback((step: RoadWatchStep) => {
    const currentIndex = stepOrder.indexOf(currentStep);
    const targetIndex = stepOrder.indexOf(step);
    if (targetIndex >= 0) {
      setCurrentStep(step);
    }
  }, [currentStep]);

  const nextStep = useCallback(() => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  }, [currentStep]);

  const handleCameraPermission = async () => {
    setIsLoading(true);
    setCameraError(null);
    try {
      const hasPermission = await cameraService.requestPermission();
      if (hasPermission) {
        nextStep();
      } else {
        setCameraError('Camera permission is required to capture road conditions. Please enable camera access in your browser settings.');
      }
    } catch (error) {
      setCameraError('Failed to access camera. Please check permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;
    setIsLoading(true);
    setCameraError(null);
    try {
      const started = await cameraService.startPreview(videoRef.current);
      if (!started) {
        setCameraError('Failed to start camera preview');
      }
    } catch (error) {
      setCameraError('Failed to start camera');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentStep === 'camera') {
      startCamera();
    } else {
      cameraService.stopPreview();
    }
    return () => cameraService.stopPreview();
  }, [currentStep, startCamera]);

  const handleCapture = useCallback(async () => {
    const image = cameraService.captureImage();
    if (image) {
      setCapturedImage(image);
      cameraService.stopPreview();
      nextStep();
    }
  }, [nextStep]);

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setLocationData(null);
    setCurrentStep('camera');
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!capturedImage) return;
    setCurrentStep('analyzing');
    setIsLoading(true);
    try {
      const result = await AnalysisService.analyzeImage(capturedImage.dataUrl, true);
      setAnalysisResult(result);
      nextStep();
    } catch (error) {
      toast({ type: 'error', title: 'Analysis Failed', message: 'Could not analyze image. Please try again.' });
      setCurrentStep('preview');
    } finally {
      setIsLoading(false);
    }
  }, [capturedImage, nextStep, toast]);

  const handleGetLocation = useCallback(async () => {
    setCurrentStep('location');
    setIsLoading(true);
    setLocationError(null);
    try {
      const location = await locationService.getCurrentLocation();
      const address = await locationService.reverseGeocode(location.latitude, location.longitude);
      setLocationData({ ...location, address });
      nextStep();
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Failed to get location');
      toast({ type: 'warning', title: 'Location Unavailable', message: 'You can still submit the report without GPS coordinates.' });
      nextStep();
    } finally {
      setIsLoading(false);
    }
  }, [nextStep, toast]);

  const handleSubmit = useCallback(async () => {
    if (!capturedImage || !analysisResult || !locationData) return;
    
    setCurrentStep('submitting');
    setIsLoading(true);
    
    try {
      const incidentId = RoadWatchService.generateIncidentId();
      const priority = RoadWatchService.generatePriority(
        analysisResult.detection.severity, 
        analysisResult.detection.confidence
      );

      const incident: RoadWatchIncident = {
        id: incidentId,
        detectionType: 'mobile-camera',
        issue: analysisResult.detection.waterloggingDetected ? 'waterlogging' : 'drainage-problem',
        severity: analysisResult.detection.severity,
        confidence: analysisResult.detection.confidence,
        location: locationData,
        imageUrl: capturedImage.dataUrl,
        detection: analysisResult.detection,
        possibleCause: analysisResult.detection.possibleCause,
        affectedRoad: locationData.address ? locationData.address.split(',')[0] : 'Not available',
        recommendedAction: analysisResult.detection.recommendedAction,
        reporterSource: 'roadwatch-mobile-camera',
        status: 'reported',
        priority,
        createdAt: new Date(),
        updatedAt: new Date(),
        reportCount: 1,
        generativeReport: analysisResult.generativeReport,
      };

      dispatch({ type: 'ADD_NOTIFICATION', payload: {
        id: `NOT-${Date.now()}`,
        type: 'incident',
        severity: mapSeverityToBadge(incident.severity),
        title: `New RoadWatch Incident: ${incidentId}`,
        message: `${incident.severity.toUpperCase()} ${incident.issue} reported via mobile camera`,
        read: false,
        timestamp: new Date(),
        actionUrl: `/roadwatch/incidents/${incidentId}`,
        metadata: { incidentId, source: 'roadwatch' },
      }});

      setSubmittedIncident(incident);
      nextStep();
      
      toast({ 
        type: 'success', 
        title: 'Incident Submitted', 
        message: `Incident ${incidentId} sent to municipal authority`,
        action: { label: 'View', onClick: () => setShowExistingIncidents(true) }
      });
    } catch (error) {
      toast({ type: 'error', title: 'Submission Failed', message: 'Could not submit incident. Please try again.' });
      setCurrentStep('report');
    } finally {
      setIsLoading(false);
    }
  }, [capturedImage, analysisResult, locationData, dispatch, toast, nextStep]);

  const resetFlow = useCallback(() => {
    setCurrentStep('permission');
    setCapturedImage(null);
    setAnalysisResult(null);
    setLocationData(null);
    setSubmittedIncident(null);
    setCameraError(null);
    setLocationError(null);
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-flood-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-flood-text flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-flood-primary/10 flex items-center justify-center text-flood-primary">
                  <Camera className="w-6 h-6" />
                </span>
                RoadWatch
              </h1>
              <p className="text-flood-muted mt-2">Mobile Camera Flood Detection & Municipal Reporting</p>
            </div>
            <Badge variant="warning" className="text-sm">MOBILE CAMERA PROTOTYPE</Badge>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {stepOrder.map((step, index) => {
              const config = stepConfig[step];
              const isActive = step === currentStep;
              const isCompleted = stepOrder.indexOf(step) < stepOrder.indexOf(currentStep);
              return (
                <div key={step} className="flex items-center gap-2 flex-shrink-0">
                  <div className={clsx(
                    'flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all',
                    isActive ? 'bg-flood-primary text-white' : 
                    isCompleted ? 'bg-flood-success text-white' : 
                    'bg-flood-border text-flood-muted'
                  )}>
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : config.icon}
                  </div>
                  {index < stepOrder.length - 1 && (
                    <div className={clsx('w-16 h-0.5 hidden sm:block', isCompleted ? 'bg-flood-success' : 'bg-flood-border')} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {currentStep === 'permission' && (
          <Card variant="strong" className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-flood-primary/10 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-flood-primary" />
              </div>
              <h2 className="text-2xl font-bold text-flood-text mb-2">Permission Required</h2>
              <p className="text-flood-muted mb-6">RoadWatch needs access to your camera and location to capture and geotag road condition reports.</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-flood-bg rounded-lg">
                  <Camera className="w-8 h-8 text-flood-primary mx-auto mb-2" />
                  <p className="font-medium text-flood-text">Camera</p>
                  <p className="text-sm text-flood-muted">Capture road images</p>
                </div>
                <div className="p-4 bg-flood-bg rounded-lg">
                  <MapPin className="w-8 h-8 text-flood-primary mx-auto mb-2" />
                  <p className="font-medium text-flood-text">Location</p>
                  <p className="text-sm text-flood-muted">Auto-attach GPS coordinates</p>
                </div>
              </div>
              <Button size="lg" onClick={handleCameraPermission} disabled={isLoading} loading={isLoading} className="w-full">
                Grant Permissions & Continue
              </Button>
              {cameraError && (
                <div className="mt-4 p-3 bg-flood-danger/10 border border-flood-danger/30 rounded-lg text-sm text-flood-danger">
                  {cameraError}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === 'camera' && (
          <Card variant="strong" className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Camera className="w-5 h-5" /> Capture Road Condition
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="relative aspect-video bg-flood-bg rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  autoPlay
                  muted
                />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-flood-primary border-t-transparent" />
                  </div>
                )}
              </div>
              {cameraError && (
                <div className="mt-3 p-3 bg-flood-danger/10 border border-flood-danger/30 rounded-lg text-sm text-flood-danger">
                  {cameraError}
                </div>
              )}
              <div className="flex gap-4 mt-6">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="flex-1" 
                  onClick={() => setCurrentStep('permission')}
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button 
                  size="lg" 
                  className="flex-1" 
                  onClick={handleCapture}
                  disabled={isLoading}
                  icon={<Camera className="w-4 h-4" />}
                >
                  Capture Image
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'preview' && capturedImage && (
          <Card variant="strong" className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Eye className="w-5 h-5" /> Preview Image
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="relative aspect-video bg-flood-bg rounded-lg overflow-hidden mb-4">
                <img src={capturedImage.dataUrl} alt="Captured road condition" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-4">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="flex-1" 
                  onClick={handleRetake}
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Retake
                </Button>
                <Button 
                  size="lg" 
                  className="flex-1" 
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  loading={isLoading}
                  icon={<Zap className="w-4 h-4" />}
                >
                  Analyze Road Condition
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'analyzing' && (
          <Card variant="strong" className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-flood-primary/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Zap className="w-10 h-10 text-flood-primary" />
              </div>
              <h2 className="text-2xl font-bold text-flood-text mb-2">Analyzing Road Condition</h2>
              <p className="text-flood-muted mb-6">RoadWatch AI is analyzing the image for waterlogging and drainage issues...</p>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-center gap-2 text-flood-muted">
                  <span className="w-6 h-6 rounded-full border-2 border-flood-primary border-t-transparent animate-spin" />
                  <span>Detecting waterlogging...</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-flood-muted">
                  <span className="w-6 h-6 rounded-full border-2 border-flood-border border-t-transparent" />
                  <span>Assessing severity...</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-flood-muted">
                  <span className="w-6 h-6 rounded-full border-2 border-flood-border border-t-transparent" />
                  <span>Identifying cause...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'location' && (
          <Card variant="strong" className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5" /> Location Capture
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-flood-primary border-t-transparent mx-auto mb-4" />
                  <p className="text-flood-muted">Getting GPS coordinates...</p>
                </div>
              ) : (
                <>
                  {locationData && (
                    <div className="space-y-3 mb-4">
                      <div className="p-4 bg-flood-bg rounded-lg">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-6 h-6 text-flood-primary" />
                          <div>
                            <p className="font-mono text-sm text-flood-text">
                              {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
                            </p>
                            <p className="text-xs text-flood-muted">Accuracy: ±{Math.round(locationData.accuracy)}m</p>
                          </div>
                        </div>
                      </div>
                      {locationData.address && (
                        <div className="p-3 bg-flood-success/10 border border-flood-success/30 rounded-lg text-sm text-flood-success">
                          Address: {locationData.address}
                        </div>
                      )}
                    </div>
                  )}
                  {!locationData && locationError && (
                    <div className="p-4 bg-flood-warning/10 border border-flood-warning/30 rounded-lg text-flood-warning text-center">
                      <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                      <p>{locationError}</p>
                      <p className="text-sm mt-2">You can still submit without location data.</p>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      className="flex-1" 
                      onClick={() => setCurrentStep('preview')}
                      icon={<ArrowLeft className="w-4 h-4" />}
                    >
                      Back
                    </Button>
                    {locationData && (
                      <Button 
                        size="lg" 
                        className="flex-1" 
                        onClick={nextStep}
                        icon={<ArrowRight className="w-4 h-4" />}
                      >
                        Generate Report
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === 'report' && analysisResult && locationData && capturedImage && (
          <Card variant="strong" className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Incident Report Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="p-3 bg-flood-primary/10 border border-flood-primary/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', 
                    analysisResult.detection.severity === 'critical' && 'bg-flood-critical text-white',
                    analysisResult.detection.severity === 'high' && 'bg-flood-danger text-white',
                    analysisResult.detection.severity === 'moderate' && 'bg-flood-warning text-white',
                    analysisResult.detection.severity === 'low' && 'bg-flood-success text-white'
                  )}>
                    {analysisResult.detection.severity.toUpperCase()}
                  </span>
                  <Badge variant="info" size="sm">{analysisResult.detection.confidence}% Confidence</Badge>
                  {analysisResult.isDemoAnalysis && <Badge variant="warning" size="sm">DEMO ANALYSIS</Badge>}
                </div>
                <p className="text-sm text-flood-text">{analysisResult.detection.estimatedVisualSeverity}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-flood-muted">Issue</span><span className="font-medium capitalize">{analysisResult.detection.waterloggingDetected ? 'Waterlogging detected' : 'No waterlogging'}</span></div>
                <div className="flex justify-between"><span className="text-flood-muted">Possible Cause</span><span className="font-medium">{analysisResult.detection.possibleCause}</span></div>
                <div className="flex justify-between"><span className="text-flood-muted">Recommended Action</span><span className="font-medium">{analysisResult.detection.recommendedAction}</span></div>
                <div className="flex justify-between"><span className="text-flood-muted">Location</span><span className="font-medium">{locationData.address || `${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)}`}</span></div>
                <div className="flex justify-between"><span className="text-flood-muted">Time</span><span className="font-medium">{new Date().toLocaleString()}</span></div>
              </div>

              <div className="p-3 bg-flood-bg rounded-lg border">
                <p className="text-sm text-flood-text">{analysisResult.generativeReport}</p>
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="flex-1" 
                  onClick={() => setCurrentStep('location')}
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button 
                  size="lg" 
                  className="flex-1" 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  loading={isLoading}
                  icon={<Send className="w-4 h-4" />}
                >
                  Submit to Municipal Authority
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'submitting' && (
          <Card variant="strong" className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-flood-primary border-t-transparent mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-flood-text mb-2">Submitting Incident Report</h2>
              <p className="text-flood-muted">Sending to municipal control room...</p>
            </CardContent>
          </Card>
        )}

        {currentStep === 'success' && submittedIncident && (
          <Card variant="strong" className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-flood-success/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-flood-success" />
              </div>
              <h2 className="text-2xl font-bold text-flood-text mb-2">Incident Reported Successfully!</h2>
              <p className="text-flood-muted mb-6">Your report has been sent to the municipal authority.</p>
              
              <div className="p-4 bg-flood-bg rounded-lg text-left mb-6">
                <p className="font-mono text-lg text-flood-primary mb-2">{submittedIncident.id}</p>
<div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-flood-muted">Severity</span><StatusBadge status={mapSeverityToBadge(submittedIncident.severity)} /></div>
                    <div className="flex justify-between"><span className="text-flood-muted">Priority</span><span className="font-medium capitalize">{submittedIncident.priority}</span></div>
                    <div className="flex justify-between"><span className="text-flood-muted">Status</span><StatusBadge status={mapStatusToBadge(submittedIncident.status)} /></div>
                    <div className="flex justify-between"><span className="text-flood-muted">Confidence</span><span className="font-medium">{submittedIncident.confidence}%</span></div>
                  </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="flex-1" 
                  onClick={() => setShowExistingIncidents(true)}
                  icon={<Eye className="w-4 h-4" />}
                >
                  View All Incidents
                </Button>
                <Button 
                  size="lg" 
                  className="flex-1" 
                  onClick={resetFlow}
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Report Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 p-4 bg-gradient-to-r from-flood-primary/10 to-flood-critical/10 rounded-xl border border-flood-primary/30">
          <div className="text-center">
            <p className="font-bold text-flood-text mb-2">FUTURE ROADMAP</p>
            <div className="flex flex-wrap justify-center items-center gap-2 text-sm text-flood-muted">
              <span className="px-2 py-1 bg-flood-primary/20 text-flood-primary rounded">TODAY: Mobile Camera</span>
              <ChevronRight className="w-4 h-4" />
              <span className="px-2 py-1 bg-flood-critical/20 text-flood-critical rounded">NEXT: Government Vehicle Dashcams</span>
              <ChevronRight className="w-4 h-4" />
              <span className="px-2 py-1 bg-flood-warning/20 text-flood-warning rounded">FUTURE: Automobile Partnerships</span>
              <ChevronRight className="w-4 h-4" />
              <span className="px-2 py-1 bg-flood-success/20 text-flood-success rounded">VISION: India-Wide Flood Intelligence</span>
            </div>
            <p className="text-xs text-flood-muted mt-2">Pilot City: Kanpur, Uttar Pradesh → UP → Major Cities → All India</p>
          </div>
        </div>
      </div>
    </div>
  );
}