'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, Video, Trash2, Download, Plus, Edit, Eye } from 'lucide-react';

interface MediaFile {
  id: string;
  type: 'image' | 'drawing' | 'video';
  data: string; // base64 data
  name: string;
  timestamp: string;
  size?: number;
}

interface MediaUploadProps {
  images: MediaFile[];
  drawings: MediaFile[];
  videos: MediaFile[];
  onImagesChange: (images: MediaFile[]) => void;
  onDrawingsChange: (drawings: MediaFile[]) => void;
  onVideosChange: (videos: MediaFile[]) => void;
  maxImages?: number;
  maxDrawings?: number;
  maxVideos?: number;
  maxVideoDuration?: number; // in seconds
}

export default function MediaUpload({
  images,
  drawings,
  videos,
  onImagesChange,
  onDrawingsChange,
  onVideosChange,
  maxImages = 20,
  maxDrawings = 20,
  maxVideos = 3,
  maxVideoDuration = 60
}: MediaUploadProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawingCanvas, setDrawingCanvas] = useState<HTMLCanvasElement | null>(null);
  const [drawingContext, setDrawingContext] = useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);

  // Initialize drawing canvas
  useEffect(() => {
    if (drawingMode && drawingCanvas) {
      const ctx = drawingCanvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
        setDrawingContext(ctx);
      }
    }
  }, [drawingMode, drawingCanvas]);

  // Camera functions
  const startCamera = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const capturePhoto = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        const newImage: MediaFile = {
          id: Date.now().toString(),
          type: 'image',
          data: imageData,
          name: `photo_${images.length + 1}.jpg`,
          timestamp: new Date().toISOString(),
          size: Math.round(imageData.length * 0.75) // Approximate size
        };
        
        onImagesChange([...images, newImage]);
      }
    }
  };

  // Video recording functions
  const startRecording = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }

      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          const videoData = reader.result as string;
          const newVideo: MediaFile = {
            id: Date.now().toString(),
            type: 'video',
            data: videoData,
            name: `video_${videos.length + 1}.webm`,
            timestamp: new Date().toISOString(),
            size: blob.size
          };
          onVideosChange([...videos, newVideo]);
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
      setRecordingTime(0);
      
      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxVideoDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      setRecordingTimer(timer);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not start recording. Please check permissions.');
    }
  };

  const stopRecording = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
      
      stopCamera();
    }
  };

  // Drawing functions
  const startDrawing = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDrawingMode(true);
  };

  const stopDrawing = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDrawingMode(false);
    setIsDrawing(false);
  };

  const handleDrawingStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!drawingContext || !drawingCanvas) return;
    
    setIsDrawing(true);
    const rect = drawingCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    drawingContext.beginPath();
    drawingContext.moveTo(x, y);
  };

  const handleDrawingMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDrawing || !drawingContext || !drawingCanvas) return;
    
    const rect = drawingCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    drawingContext.lineTo(x, y);
    drawingContext.stroke();
  };

  const handleDrawingEnd = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!drawingContext) return;
    drawingContext.closePath();
    setIsDrawing(false);
  };

  const saveDrawing = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (drawingCanvas) {
      const imageData = drawingCanvas.toDataURL('image/png');
      const newDrawing: MediaFile = {
        id: Date.now().toString(),
        type: 'drawing',
        data: imageData,
        name: `drawing_${drawings.length + 1}.png`,
        timestamp: new Date().toISOString()
      };
      
      onDrawingsChange([...drawings, newDrawing]);
      
      // Clear canvas
      if (drawingContext) {
        drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
      }
    }
  };

  const clearDrawing = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (drawingContext && drawingCanvas) {
      drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    }
  };

  const removeMedia = (type: 'image' | 'drawing' | 'video', id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (type === 'image') {
      onImagesChange(images.filter(img => img.id !== id));
    } else if (type === 'drawing') {
      onDrawingsChange(drawings.filter(draw => draw.id !== id));
    } else if (type === 'video') {
      onVideosChange(videos.filter(vid => vid.id !== id));
    }
  };

  const downloadMedia = (media: MediaFile, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const link = document.createElement('a');
    link.href = media.data;
    link.download = media.name;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Camera Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Camera & Media
          </CardTitle>
          <CardDescription>
            Capture photos, record videos, and create drawings for site documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera Controls */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={(e) => cameraActive ? stopCamera(e) : startCamera(e)}
              variant={cameraActive ? "destructive" : "default"}
              disabled={recording}
              type="button"
            >
              {cameraActive ? "Stop Camera" : "Start Camera"}
            </Button>
            
            <Button
              onClick={(e) => capturePhoto(e)}
              disabled={!cameraActive || recording || images.length >= maxImages}
              variant="outline"
              type="button"
            >
              <Camera className="h-4 w-4 mr-2" />
              Capture Photo ({images.length}/{maxImages})
            </Button>
            
            <Button
              onClick={(e) => recording ? stopRecording(e) : startRecording(e)}
              disabled={!cameraActive || videos.length >= maxVideos}
              variant={recording ? "destructive" : "outline"}
              type="button"
            >
              <Video className="h-4 w-4 mr-2" />
              {recording ? `Stop Recording (${recordingTime}s)` : `Record Video (${videos.length}/${maxVideos})`}
            </Button>
            
            <Button
              onClick={(e) => drawingMode ? stopDrawing(e) : startDrawing(e)}
              variant={drawingMode ? "destructive" : "outline"}
              disabled={drawings.length >= maxDrawings}
              type="button"
            >
              <Edit className="h-4 w-4 mr-2" />
              {drawingMode ? "Stop Drawing" : `Start Drawing (${drawings.length}/${maxDrawings})`}
            </Button>
          </div>

          {/* Camera Preview */}
          {cameraActive && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-md rounded-lg border"
              />
              {recording && (
                <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm">
                  REC {recordingTime}s
                </div>
              )}
            </div>
          )}

          {/* Drawing Canvas */}
          {drawingMode && (
            <div className="space-y-2">
              <canvas
                ref={(canvas) => setDrawingCanvas(canvas)}
                width={800}
                height={600}
                className="border rounded-lg cursor-crosshair max-w-full"
                onMouseDown={handleDrawingStart}
                onMouseMove={handleDrawingMove}
                onMouseUp={handleDrawingEnd}
                onMouseLeave={handleDrawingEnd}
                style={{ touchAction: 'none' }}
              />
              <div className="flex gap-2">
                <Button onClick={(e) => saveDrawing(e)} variant="outline" type="button">
                  <Plus className="h-4 w-4 mr-2" />
                  Save Drawing
                </Button>
                <Button onClick={(e) => clearDrawing(e)} variant="outline" type="button">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>

      {/* Media Galleries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Images Gallery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Photos ({images.length}/{maxImages})</span>
              <Badge variant="secondary">{images.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.data}
                    alt={image.name}
                    className="w-full h-20 object-cover rounded border"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => downloadMedia(image, e)}
                      className="h-6 w-6 p-0"
                      type="button"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => removeMedia('image', image.id, e)}
                      className="h-6 w-6 p-0"
                      type="button"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {images.length === 0 && (
                <div className="col-span-2 text-center text-gray-500 py-4">
                  No photos captured
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Drawings Gallery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Drawings ({drawings.length}/{maxDrawings})</span>
              <Badge variant="secondary">{drawings.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {drawings.map((drawing) => (
                <div key={drawing.id} className="relative group">
                  <img
                    src={drawing.data}
                    alt={drawing.name}
                    className="w-full h-20 object-cover rounded border"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => downloadMedia(drawing, e)}
                      className="h-6 w-6 p-0"
                      type="button"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => removeMedia('drawing', drawing.id, e)}
                      className="h-6 w-6 p-0"
                      type="button"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {drawings.length === 0 && (
                <div className="col-span-2 text-center text-gray-500 py-4">
                  No drawings created
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Videos Gallery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Videos ({videos.length}/{maxVideos})</span>
              <Badge variant="secondary">{videos.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {videos.map((video) => (
                <div key={video.id} className="relative group">
                  <video
                    src={video.data}
                    className="w-full h-20 object-cover rounded border"
                    muted
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{video.name}</DialogTitle>
                        </DialogHeader>
                        <video
                          src={video.data}
                          controls
                          className="w-full max-h-96"
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => downloadMedia(video, e)}
                      className="h-6 w-6 p-0"
                      type="button"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => removeMedia('video', video.id, e)}
                      className="h-6 w-6 p-0"
                      type="button"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                    {video.size ? `${(video.size / 1024 / 1024).toFixed(1)}MB` : ''}
                  </div>
                </div>
              ))}
              {videos.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No videos recorded
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}