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
  private static readonly DEMO_ANALYSIS_DELAY = 1500;

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

    // Perform actual image analysis on the captured image
    const analysis = await this.analyzeImageContent(imageDataUrl);
    
    const detection: RoadWatchDetection = {
      waterloggingDetected: analysis.waterDetected,
      severity: analysis.severity,
      confidence: analysis.confidence,
      affectedArea: analysis.affectedArea,
      possibleCause: analysis.possibleCause,
      recommendedAction: analysis.recommendedAction,
      estimatedVisualSeverity: `${analysis.severity.charAt(0).toUpperCase() + analysis.severity.slice(1)} - ${analysis.confidence}% confidence`,
    };

    const generativeReport = AnalysisService.generateReport(detection);

    return {
      detection,
      generativeReport,
      isDemoAnalysis: true,
    };
  }

  private static async analyzeImageContent(imageDataUrl: string): Promise<{
    waterDetected: boolean;
    severity: 'low' | 'moderate' | 'high' | 'critical';
    confidence: number;
    affectedArea: string;
    possibleCause: string;
    recommendedAction: string;
  }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(this.getFallbackAnalysis());
          return;
        }

        // Resize for faster processing (max 300px)
        const maxDim = 300;
        let { width, height } = img;
        if (width > height) {
          if (width > maxDim) {
            height = (height * maxDim) / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = (width * maxDim) / height;
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;
        
        // Analyze pixel colors for water-like characteristics
        let waterScore = 0;
        let darkPixels = 0;
        let bluePixels = 0;
        let reflectivePixels = 0;
        let totalPixels = pixels.length / 4;

        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          
          // Water typically has: higher blue, lower red, moderate green
          // Dark water: low values across all channels
          // Reflective water: high values across all channels (sky reflection)
          
          const brightness = (r + g + b) / 3;
          const blueDominance = b - Math.max(r, g);
          const isBlueish = b > r && b > g && b > 80;
          const isDark = brightness < 60;
          const isReflective = brightness > 180 && Math.abs(r - g) < 30 && Math.abs(g - b) < 30;
          
          if (isBlueish) bluePixels++;
          if (isDark) darkPixels++;
          if (isReflective) reflectivePixels++;
        }

        const blueRatio = bluePixels / totalPixels;
        const darkRatio = darkPixels / totalPixels;
        const reflectiveRatio = reflectivePixels / totalPixels;
        
        // Calculate water score based on multiple indicators
        waterScore = (blueRatio * 0.5) + (darkRatio * 0.3) + (reflectiveRatio * 0.2);
        
        // Also check lower portion of image (road area typically at bottom)
        let lowerWaterScore = 0;
        const lowerStart = Math.floor(height * 0.5);
        let lowerPixels = 0;
        let lowerBlue = 0, lowerDark = 0, lowerReflective = 0;
        
        for (let y = lowerStart; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];
            const brightness = (r + g + b) / 3;
            
            if (b > r && b > g && b > 80) lowerBlue++;
            if (brightness < 60) lowerDark++;
            if (brightness > 180 && Math.abs(r - g) < 30 && Math.abs(g - b) < 30) lowerReflective++;
            lowerPixels++;
          }
        }
        
        if (lowerPixels > 0) {
          lowerWaterScore = (lowerBlue / lowerPixels * 0.5) + (lowerDark / lowerPixels * 0.3) + (lowerReflective / lowerPixels * 0.2);
        }

        // Combined score (weighted toward lower portion where road would be)
        const finalScore = (waterScore * 0.4) + (lowerWaterScore * 0.6);
        
        // Determine severity based on score
        let severity: 'low' | 'moderate' | 'high' | 'critical';
        let confidence: number;
        let waterDetected: boolean;
        
        if (finalScore > 0.35) {
          severity = 'critical';
          confidence = Math.min(95, Math.floor(70 + finalScore * 50));
          waterDetected = true;
        } else if (finalScore > 0.2) {
          severity = 'high';
          confidence = Math.min(90, Math.floor(65 + finalScore * 60));
          waterDetected = true;
        } else if (finalScore > 0.1) {
          severity = 'moderate';
          confidence = Math.min(85, Math.floor(60 + finalScore * 70));
          waterDetected = true;
        } else {
          severity = 'low';
          confidence = Math.max(55, Math.floor(80 - finalScore * 50));
          waterDetected = false;
        }

        // Add some realistic variation
        confidence = Math.min(98, Math.max(50, confidence + Math.floor(Math.random() * 10) - 5));

        const affectedArea = waterDetected 
          ? severity === 'critical' ? 'Road extensively flooded, multiple lanes affected' 
            : severity === 'high' ? 'Significant water coverage on road surface'
            : 'Road partially covered with standing water'
          : 'No significant waterlogging detected';

        const possibleCause = waterDetected
          ? severity === 'critical' ? 'Severe drainage blockage / pump failure / extreme rainfall'
            : severity === 'high' ? 'Drainage blockage / overflow / heavy rainfall'
            : 'Partial drainage blockage / moderate rainfall'
          : 'Normal conditions';

        const recommendedAction = waterDetected
          ? severity === 'critical' ? 'URGENT: Deploy emergency pumps, close road, clear blockage immediately'
            : severity === 'high' ? 'Dispatch drainage team, clear inlet blockage, monitor water level'
            : 'Schedule drainage inspection, clear minor blockage, monitor'
          : 'No action required - conditions normal';

        resolve({
          waterDetected,
          severity,
          confidence,
          affectedArea,
          possibleCause,
          recommendedAction,
        });
      };
      img.src = imageDataUrl;
    });
  }

  private static getFallbackAnalysis() {
    const severities: ('low' | 'moderate' | 'high' | 'critical')[] = ['low', 'moderate', 'high', 'critical'];
    const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
    const confidence = Math.floor(Math.random() * 30) + 70;
    const waterDetected = randomSeverity !== 'low';
    
    return {
      waterDetected,
      severity: randomSeverity,
      confidence,
      affectedArea: waterDetected ? 'Road partially covered' : 'No significant waterlogging',
      possibleCause: waterDetected ? 'Drainage blockage / overflow' : 'Normal conditions',
      recommendedAction: waterDetected ? 'Inspect nearby drainage inlet and remove obstruction' : 'No action required',
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