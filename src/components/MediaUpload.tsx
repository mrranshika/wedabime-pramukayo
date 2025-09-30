'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, Video, Trash2, Download, Plus, Edit, Eye, Leaf, TreePine, Sprout } from 'lucide-react';

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
        ctx.strokeStyle = '#059669'; // Green color for drawing
        setDrawingContext(ctx);
      }
    }
  }, [drawingMode, drawingCanvas]);

  // Camera functions
  const startCamera = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.cancelBubble = true;
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
      e.cancelBubble = true;
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
      e.cancelBubble = true;
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
      e.cancelBubble = true;
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
      e.cancelBubble = true;
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
      e.cancelBubble = true;
    }
    setDrawingMode(true);
  };

  const stopDrawing = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.cancelBubble = true;
    }
    setDrawingMode(false);
    setIsDrawing(false);
  };

  const handleDrawingStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.cancelBubble = true;
    if (!drawingContext || !drawingCanvas) return;
    
    setIsDrawing(true);
    const rect = drawingCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    drawingContext.beginPath();
    drawingContext.moveTo(x, y);
    
    return false;
  };

  const handleDrawingMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.cancelBubble = true;
    if (!isDrawing || !drawingContext || !drawingCanvas) return;
    
    const rect = drawingCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    drawingContext.lineTo(x, y);
    drawingContext.stroke();
    
    return false;
  };

  const handleDrawingEnd = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.cancelBubble = true;
    if (!drawingContext) return;
    drawingContext.closePath();
    setIsDrawing(false);
    
    return false;
  };

  const saveDrawing = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.cancelBubble = true;
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
      e.cancelBubble = true;
    }
    if (drawingContext && drawingCanvas) {
      drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    }
  };

  const removeMedia = (type: 'image' | 'drawing' | 'video', id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.cancelBubble = true;
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
      e.cancelBubble = true;
    }
    const link = document.createElement('a');
    link.href = media.data;
    link.download = media.name;
    link.click();
  };

  return (
    <div 
      className="space-y-6" 
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.cancelBubble = true;
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.cancelBubble = true;
      }}
      onMouseUp={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.cancelBubble = true;
      }}
      onMouseMove={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.cancelBubble = true;
      }}
    >
      {/* Camera Section */}
      <Card className="border-green-200 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              <Camera className="h-5 w-5" />
            </div>
            Camera & Media
          </CardTitle>
          <CardDescription className="text-green-700">
            Capture photos, record videos, and create drawings for site documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera Controls */}
          <div className="flex flex-wrap gap-2" onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.cancelBubble = true;
          }}>
            <Button
              onClick={(e) => cameraActive ? stopCamera(e) : startCamera(e)}
              variant={cameraActive ? "destructive" : "default"}
              disabled={recording}
              type="button"
              className={cameraActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700 text-white"}
            >
              {cameraActive ? "Stop Camera" : "Start Camera"}
            </Button>
            
            <Button
              onClick={(e) => capturePhoto(e)}
              disabled={!cameraActive || recording || images.length >= maxImages}
              variant="outline"
              type="button"
              className="border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-50"
            >
              <Camera className="h-4 w-4 mr-2" />
              Capture Photo ({images.length}/{maxImages})
            </Button>
            
            <Button
              onClick={(e) => recording ? stopRecording(e) : startRecording(e)}
              disabled={!cameraActive || videos.length >= maxVideos}
              variant={recording ? "destructive" : "outline"}
              type="button"
              className={recording ? "bg-red-600 hover:bg-red-700" : "border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-50"}
            >
              <Video className="h-4 w-4 mr-2" />
              {recording ? `Stop Recording (${recordingTime}s)` : `Record Video (${videos.length}/${maxVideos})`}
            </Button>
            
            <Button
              onClick={(e) => drawingMode ? stopDrawing(e) : startDrawing(e)}
              variant={drawingMode ? "destructive" : "outline"}
              disabled={drawings.length >= maxDrawings}
              type="button"
              className={drawingMode ? "bg-red-600 hover:bg-red-700" : "border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-50"}
            >
              <Edit className="h-4 w-4 mr-2" />
              {drawingMode ? "Stop Drawing" : `Start Drawing (${drawings.length}/${maxDrawings})`}
            </Button>
          </div>

          {/* Camera Preview */}
          {cameraActive && (
            <div className="relative" onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.cancelBubble = true;
            }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-md rounded-lg border-2 border-green-200 shadow-md"
              />
              {recording && (
                <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm animate-pulse">
                  REC {recordingTime}s
                </div>
              )}
            </div>
          )}

          {/* Drawing Canvas */}
          {drawingMode && (
            <div className="space-y-2" onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.cancelBubble = true;
            }}>
              <canvas
                ref={(canvas) => setDrawingCanvas(canvas)}
                width={800}
                height={600}
                className="border-2 border-green-200 rounded-lg cursor-crosshair max-w-full bg-white shadow-md"
                onMouseDown={handleDrawingStart}
                onMouseMove={handleDrawingMove}
                onMouseUp={handleDrawingEnd}
                onMouseLeave={handleDrawingEnd}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.cancelBubble = true;
                  const touch = e.touches[0];
                  const mouseEvent = new MouseEvent('mousedown', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                  });
                  if (drawingCanvas) {
                    drawingCanvas.dispatchEvent(mouseEvent);
                  }
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.cancelBubble = true;
                  const touch = e.touches[0];
                  const mouseEvent = new MouseEvent('mousemove', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                  });
                  if (drawingCanvas) {
                    drawingCanvas.dispatchEvent(mouseEvent);
                  }
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.cancelBubble = true;
                  const mouseEvent = new MouseEvent('mouseup', {});
                  if (drawingCanvas) {
                    drawingCanvas.dispatchEvent(mouseEvent);
                  }
                }}
                style={{ touchAction: 'none' }}
              />
              <div className="flex gap-2" onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.cancelBubble = true;
              }}>
                <Button onClick={(e) => saveDrawing(e)} variant="outline" type="button" className="border-green-600 text-green-700 hover:bg-green-50">
                  <Plus className="h-4 w-4 mr-2" />
                  Save Drawing
                </Button>
                <Button onClick={(e) => clearDrawing(e)} variant="outline" type="button" className="border-red-600 text-red-700 hover:bg-red-50">
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
        <Card className="border-green-200 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
            <CardTitle className="flex items-center justify-between text-green-800">
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" />
                Photos
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">{images.length}/{maxImages}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.data}
                    alt={image.name}
                    className="w-full h-20 object-cover rounded border-2 border-green-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => downloadMedia(image, e)}
                      className="h-6 w-6 p-0 text-white hover:text-green-300"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => removeMedia('image', image.id, e)}
                      className="h-6 w-6 p-0 text-white hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Drawings Gallery */}
        <Card className="border-emerald-200 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200">
            <CardTitle className="flex items-center justify-between text-emerald-800">
              <div className="flex items-center gap-2">
                <TreePine className="h-4 w-4 text-emerald-600" />
                Drawings
              </div>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">{drawings.length}/{maxDrawings}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {drawings.map((drawing) => (
                <div key={drawing.id} className="relative group">
                  <img
                    src={drawing.data}
                    alt={drawing.name}
                    className="w-full h-20 object-cover rounded border-2 border-emerald-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => downloadMedia(drawing, e)}
                      className="h-6 w-6 p-0 text-white hover:text-emerald-300"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => removeMedia('drawing', drawing.id, e)}
                      className="h-6 w-6 p-0 text-white hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Videos Gallery */}
        <Card className="border-teal-200 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-200">
            <CardTitle className="flex items-center justify-between text-teal-800">
              <div className="flex items-center gap-2">
                <Sprout className="h-4 w-4 text-teal-600" />
                Videos
              </div>
              <Badge variant="secondary" className="bg-teal-100 text-teal-800">{videos.length}/{maxVideos}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {videos.map((video) => (
                <div key={video.id} className="relative group">
                  <video
                    src={video.data}
                    className="w-full h-20 object-cover rounded border-2 border-teal-200"
                    muted
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-white hover:text-teal-300"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-teal-800">Video Preview</DialogTitle>
                          <DialogDescription className="text-teal-700">
                            {video.name} - {new Date(video.timestamp).toLocaleString()}
                          </DialogDescription>
                        </DialogHeader>
                        <video
                          src={video.data}
                          controls
                          className="w-full rounded-lg"
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => downloadMedia(video, e)}
                      className="h-6 w-6 p-0 text-white hover:text-teal-300"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => removeMedia('video', video.id, e)}
                      className="h-6 w-6 p-0 text-white hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                    {Math.round((video.size || 0) / 1024 / 1024 * 10) / 10}MB
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}