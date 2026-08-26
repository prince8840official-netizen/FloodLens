export interface CameraState {
  hasPermission: boolean;
  stream: MediaStream | null;
  facingMode: 'environment' | 'user';
  error: string | null;
}

export interface CapturedImage {
  dataUrl: string;
  blob: Blob;
  timestamp: Date;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  address?: string;
}

export interface RoadWatchDetection {
  waterloggingDetected: boolean;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  confidence: number;
  affectedArea: string;
  possibleCause: string;
  recommendedAction: string;
  estimatedVisualSeverity: string;
}

export interface RoadWatchAnalysisResult {
  detection: RoadWatchDetection;
  generativeReport: string;
  isDemoAnalysis: boolean;
}

export interface RoadWatchIncident {
  id: string;
  detectionType: 'mobile-camera';
  issue: 'waterlogging' | 'drainage-problem' | 'drain-overflow' | 'blockage' | 'road-damage';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  confidence: number;
  location: LocationData;
  imageUrl: string;
  thumbnailUrl?: string;
  detection: RoadWatchDetection;
  possibleCause: string;
  affectedRoad?: string;
  recommendedAction: string;
  reporterSource: 'roadwatch-mobile-camera';
  status: 'reported' | 'under-review' | 'assigned' | 'field-response' | 'resolved' | 'verified';
  priority: 'low' | 'moderate' | 'high' | 'critical';
  createdAt: Date;
  updatedAt: Date;
  assignedTeamId?: string;
  assignedTeamName?: string;
  municipalReference?: string;
  duplicateGroupId?: string;
  reportCount: number;
  generativeReport: string;
}

export class CameraService {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  async requestPermission(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  }

  async startPreview(videoElement: HTMLVideoElement): Promise<boolean> {
    this.videoElement = videoElement;
    if (!this.stream) {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) return false;
    }
    
    try {
      videoElement.srcObject = this.stream;
      await videoElement.play();
      return true;
    } catch (error) {
      console.error('Failed to start camera preview:', error);
      return false;
    }
  }

  stopPreview(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
  }

  captureImage(): CapturedImage | null {
    if (!this.videoElement || this.videoElement.readyState !== 4) {
      return null;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;
    ctx.drawImage(this.videoElement, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    
    return new Promise<CapturedImage>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve({
            dataUrl,
            blob,
            timestamp: new Date(),
          });
        } else {
          resolve(null as any);
        }
      }, 'image/jpeg', 0.85);
    }) as any;
  }

  switchCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    // Will need to re-request with opposite facingMode
  }

  getStream(): MediaStream | null {
    return this.stream;
  }
}

export class LocationService {
  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp),
          });
        },
        (error) => {
          let message = 'Unable to retrieve location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location permission was denied';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });
  }

  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) {
        return data.display_name;
      }
      return null;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return null;
    }
  }
}

export class AnalysisService {
  private static readonly DEMO_ANALYSIS_DELAY = 2000;

  static async analyzeImage(imageDataUrl: string, useDemoMode = true): Promise<RoadWatchAnalysisResult> {
    if (useDemoMode) {
      return this.demoAnalysis(imageDataUrl);
    }

    try {
      const response = await fetch('/api/roadwatch/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageDataUrl }),
      });
      
      if (!response.ok) {
        throw new Error('Analysis service unavailable');
      }
      
      return await response.json();
    } catch (error) {
      console.warn('Real analysis failed, falling back to demo:', error);
      return this.demoAnalysis(imageDataUrl);
    }
  }

  async analyze(imageDataUrl: string, useDemoMode = true): Promise<RoadWatchAnalysisResult> {
    return AnalysisService.analyzeImage(imageDataUrl, useDemoMode);
  }

  private static async demoAnalysis(imageDataUrl: string): Promise<RoadWatchAnalysisResult> {
    await new Promise(resolve => setTimeout(resolve, this.DEMO_ANALYSIS_DELAY));

    const severities: ('low' | 'moderate' | 'high' | 'critical')[] = ['low', 'moderate', 'high', 'critical'];
    const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
    
    const confidence = Math.floor(Math.random() * 30) + 70;
    const waterloggingDetected = randomSeverity !== 'low';

    const detection: RoadWatchDetection = {
      waterloggingDetected,
      severity: randomSeverity,
      confidence,
      affectedArea: waterloggingDetected ? 'Road partially covered' : 'No significant waterlogging',
      possibleCause: waterloggingDetected ? 'Drainage blockage / overflow' : 'Normal conditions',
      recommendedAction: waterloggingDetected 
        ? 'Inspect nearby drainage inlet and remove obstruction' 
        : 'No action required',
      estimatedVisualSeverity: waterloggingDetected 
        ? `${randomSeverity.charAt(0).toUpperCase() + randomSeverity.slice(1)} - Estimated visual severity`
        : 'Normal - No waterlogging detected',
    };

    const generativeReport = AnalysisService.generateReport(detection);

    return {
      detection,
      generativeReport,
      isDemoAnalysis: true,
    };
  }

  static generateReport(detection: RoadWatchDetection): string {
    if (!detection.waterloggingDetected) {
      return 'RoadWatch analysis indicates normal road conditions with no visible waterlogging or drainage issues at the captured location. The road appears clear and accessible. No municipal action is recommended at this time.';
    }

    const severityText = {
      low: 'minor waterlogging',
      moderate: 'significant waterlogging',
      high: 'substantial waterlogging',
      critical: 'severe waterlogging',
    };

    const templates = [
      `RoadWatch detected ${severityText[detection.severity]} on the reported road segment. The captured image indicates ${detection.affectedArea.toLowerCase()} affecting road accessibility. The location has been automatically attached using device GPS. Nearby drainage infrastructure should be inspected for possible ${detection.possibleCause.toLowerCase()}. ${detection.recommendedAction}.`,
      `Analysis of the submitted road image reveals ${severityText[detection.severity]}. The visual evidence shows ${detection.affectedArea.toLowerCase()}. GPS coordinates have been recorded automatically. The probable cause appears to be ${detection.possibleCause.toLowerCase()}. Municipal teams are advised to ${detection.recommendedAction.toLowerCase()}. Immediate field verification is recommended.`,
      `RoadWatch AI has identified ${severityText[detection.severity]} at the reported location. The image shows ${detection.affectedArea.toLowerCase()} impacting traffic flow. Location data captured via device GPS. Primary concern: ${detection.possibleCause.toLowerCase()}. Recommended municipal response: ${detection.recommendedAction.toLowerCase()}.`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }
}

export class RoadWatchService {
  static generateIncidentId(): string {
    const now = new Date();
    const year = now.getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RW-KNP-${year}-${random}`;
  }

  static generatePriority(severity: 'low' | 'moderate' | 'high' | 'critical', confidence: number): 'low' | 'moderate' | 'high' | 'critical' {
    if (severity === 'critical' || (severity === 'high' && confidence > 85)) return 'critical';
    if (severity === 'high' || (severity === 'moderate' && confidence > 80)) return 'high';
    if (severity === 'moderate') return 'moderate';
    return 'low';
  }

  static generateGenerativeReport(detection: RoadWatchDetection, location: LocationData): string {
    return AnalysisService.generateReport(detection);
  }
}

export const cameraService = new CameraService();
export const locationService = new LocationService();
export const analysisService = new AnalysisService();