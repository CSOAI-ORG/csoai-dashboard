/**
 * Exam Proctoring Interface
 * Real-time monitoring and AI-based cheating detection
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Mic,
  Monitor,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface ProctoringStatus {
  sessionId: string;
  status: 'initializing' | 'active' | 'completed';
  integrityScore: number;
  suspiciousEvents: number;
  timeRemaining: number;
  cameraActive: boolean;
  microphoneActive: boolean;
  screenSharing: boolean;
}

interface ProctoringEvent {
  type: 'eye_movement' | 'face_detection' | 'screen_change' | 'audio_detection' | 'suspicious_behavior';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
}

export function ExamProctoring() {
  const [status, setStatus] = useState<ProctoringStatus>({
    sessionId: '',
    status: 'initializing',
    integrityScore: 100,
    suspiciousEvents: 0,
    timeRemaining: 5400, // 90 minutes
    cameraActive: false,
    microphoneActive: false,
    screenSharing: false,
  });

  const [events, setEvents] = useState<ProctoringEvent[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize proctoring
  useEffect(() => {
    initializeProctoring();
  }, []);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus((prev) => ({
        ...prev,
        timeRemaining: Math.max(0, prev.timeRemaining - 1),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Monitor for suspicious activity
  useEffect(() => {
    if (status.suspiciousEvents > 3) {
      setShowWarning(true);
      toast.warning('Multiple suspicious activities detected. Exam may be flagged.');
    }
  }, [status.suspiciousEvents]);

  const initializeProctoring = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setStatus((prev) => ({
        ...prev,
        status: 'active',
        cameraActive: true,
        microphoneActive: true,
        sessionId: `PROC-${Date.now()}`,
      }));

      // Start monitoring
      startMonitoring();
    } catch (error) {
      toast.error('Failed to initialize proctoring. Please check camera/microphone permissions.');
    }
  };

  const startMonitoring = () => {
    // Simulate monitoring (in production, would use actual computer vision)
    const monitoringInterval = setInterval(() => {
      // Random event simulation for demo
      if (Math.random() > 0.95) {
        const eventTypes: ProctoringEvent['type'][] = [
          'eye_movement',
          'face_detection',
          'screen_change',
          'audio_detection',
          'suspicious_behavior',
        ];

        const severities: ProctoringEvent['severity'][] = ['low', 'medium', 'high', 'critical'];

        const newEvent: ProctoringEvent = {
          type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          description: 'Detected suspicious activity',
          timestamp: new Date(),
        };

        setEvents((prev) => [newEvent, ...prev]);

        // Update integrity score
        const scoreDeduction = newEvent.severity === 'low' ? 2 : newEvent.severity === 'medium' ? 5 : 10;
        setStatus((prev) => ({
          ...prev,
          integrityScore: Math.max(0, prev.integrityScore - scoreDeduction),
          suspiciousEvents: prev.suspiciousEvents + 1,
        }));
      }
    }, 5000);

    return () => clearInterval(monitoringInterval);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSeverityColor = (severity: ProctoringEvent['severity']) => {
    switch (severity) {
      case 'low':
        return 'text-yellow-600';
      case 'medium':
        return 'text-orange-600';
      case 'high':
        return 'text-red-600';
      case 'critical':
        return 'text-red-900';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityBg = (severity: ProctoringEvent['severity']) => {
    switch (severity) {
      case 'low':
        return 'bg-yellow-50';
      case 'medium':
        return 'bg-orange-50';
      case 'high':
        return 'bg-red-50';
      case 'critical':
        return 'bg-red-100';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Proctored Exam</h1>
          <p className="text-gray-600">CEASA Fundamentals Certification</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Session ID: {status.sessionId}
        </Badge>
      </motion.div>

      {/* Warning Banner */}
      {showWarning && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Multiple suspicious activities have been detected. This exam may be flagged for manual
            review. Continue at your own risk.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Exam Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Camera Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Camera Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Status Indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {status.cameraActive && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm"
                    >
                      <div className="w-2 h-2 bg-white rounded-full" />
                      Recording
                    </motion.div>
                  )}
                </div>

                {/* Integrity Score Overlay */}
                <div className="absolute bottom-4 left-4 bg-black/80 text-white px-4 py-2 rounded-lg">
                  <p className="text-sm font-semibold">Integrity Score</p>
                  <p className="text-2xl font-bold">{status.integrityScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exam Content */}
          <Card>
            <CardHeader>
              <CardTitle>Question 1 of 50</CardTitle>
              <Progress value={2} className="mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold mb-4">
                  Which of the following is NOT a prohibited AI practice under the EU AI Act?
                </p>
                <div className="space-y-2">
                  {[
                    'Real-time biometric identification in public spaces',
                    'Social scoring systems',
                    'AI systems for medical diagnosis assistance',
                    'Subliminal manipulation techniques',
                  ].map((option, idx) => (
                    <label
                      key={idx}
                      className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-blue-50"
                    >
                      <input type="radio" name="question" className="mr-3" />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">Previous</Button>
                <Button>Next</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Monitoring & Status */}
        <div className="space-y-4">
          {/* Timer */}
          <Card className="border-2 border-emerald-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Time Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-4xl font-bold text-emerald-600 font-mono">
                  {formatTime(status.timeRemaining)}
                </p>
                <p className="text-sm text-gray-600 mt-2">90 minutes total</p>
              </div>
            </CardContent>
          </Card>

          {/* Monitoring Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monitoring Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span>Camera</span>
                </div>
                {status.cameraActive ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  <span>Microphone</span>
                </div>
                {status.microphoneActive ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  <span>Screen Share</span>
                </div>
                {status.screenSharing ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Integrity Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Integrity Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={status.integrityScore} className="h-3" />
              <div className="flex justify-between text-sm">
                <span className="font-semibold">{status.integrityScore}%</span>
                <span className="text-gray-600">
                  {status.suspiciousEvents} suspicious events
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {events.length === 0 ? (
                  <p className="text-sm text-gray-600 text-center py-4">No events detected</p>
                ) : (
                  events.slice(0, 5).map((event, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-2 rounded text-sm ${getSeverityBg(event.severity)}`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${getSeverityColor(event.severity)}`} />
                        <div className="flex-1">
                          <p className={`font-semibold ${getSeverityColor(event.severity)}`}>
                            {event.type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-gray-600">
                            {event.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t">
        <p className="text-sm text-gray-600">
          This exam is being proctored. Your camera, microphone, and screen are being monitored.
        </p>
        <Button variant="outline" className="text-red-600 hover:text-red-700">
          End Exam
        </Button>
      </div>
    </div>
  );
}
