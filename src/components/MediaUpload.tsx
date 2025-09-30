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
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
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

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
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
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
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

  const stopRecording = () => {
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
  const startDrawing = () => {
    setDrawingMode(true);
  };

  const stopDrawing = () => {
    setDrawingMode(false);
    setIsDrawing(false);
  };

  const handleDrawingStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingContext || !drawingCanvas) return;
    
    setIsDrawing(true);
    const rect = drawingCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    drawingContext.beginPath();
    drawingContext.moveTo(x, y);
  };

  const handleDrawingMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawingContext || !drawingCanvas) return;
    
    const rect = drawingCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    drawingContext.lineTo(x, y);
    drawingContext.stroke();
  };

  const handleDrawingEnd = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingContext) return;
    drawingContext.closePath();
    setIsDrawing(false);
  };

  const saveDrawing = () => {
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

  const clearDrawing = () => {
    if (drawingContext && drawingCanvas) {
      drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    }
  };

  const removeMedia = (type: 'image' | 'drawing' | 'video', id: string) => {
    if (type === 'image') {
      onImagesChange(images.filter(img => img.id !== id));
    } else if (type === 'drawing') {
      onDrawingsChange(drawings.filter(draw => draw.id !== id));
    } else if (type === 'video') {
      onVideosChange(videos.filter(vid => vid.id !== id));
    }
  };

  const downloadMedia = (media: MediaFile) => {
    const link = document.createElement('a');
    link.href = media.data;
    link.download = media.name;
    link.click();
  };

  // Wrapper functions to prevent form submission
  const handleStartCamera = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startCamera();
  };

  const handleStopCamera = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    stopCamera();
  };

  const handleCapturePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    capturePhoto();
  };

  const handleStartRecording = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startRecording();
  };

  const handleStopRecording = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    stopRecording();
  };

  const handleStartDrawing = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startDrawing();
  };

  const handleStopDrawing = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    stopDrawing();
  };

  const handleSaveDrawing = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    saveDrawing();
  };

  const handleClearDrawing = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearDrawing();
  };

  const handleRemoveMedia = (type: 'image' | 'drawing' | 'video', id: string) => (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeMedia(type, id);
  };

  const handleDownloadMedia = (media: MediaFile) => (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    downloadMedia(media);
  };

  return (
    <div 
      className="space-y-4 md:space-y-6" 
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
        <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200 p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-green-800 text-lg md:text-xl">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
              <Camera className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            Camera & Media
          </CardTitle>
          <CardDescription className="text-green-700 text-sm md:text-base">
            Capture photos, record videos, and create drawings for site documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4">
          {/* Camera Controls */}
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start" onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.cancelBubble = true;
          }}>
            <Button
              onClick={cameraActive ? handleStopCamera : handleStartCamera}
              variant={cameraActive ? "destructive" : "default"}
              disabled={recording}
              type="button"
              className={`${cameraActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700 text-white"} h-10 md:h-auto text-sm md:text-base min-w-[100px] sm:min-w-[120px]`}
            >
              {cameraActive ? "Stop Camera" : "Start Camera"}
            </Button>
            
            <Button
              onClick={handleCapturePhoto}
              disabled={!cameraActive || recording || images.length >= maxImages}
              variant="outline"
              type="button"
              className="border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-50 h-10 md:h-auto text-sm md:text-base min-w-[100px] sm:min-w-[120px]"
            >
              <Camera className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Capture Photo</span>
              <span className="sm:inline">Photo</span> ({images.length}/{maxImages})
            </Button>
            
            <Button
              onClick={recording ? handleStopRecording : handleStartRecording}
              disabled={!cameraActive || videos.length >= maxVideos}
              variant={recording ? "destructive" : "outline"}
              type="button"
              className={`${recording ? "bg-red-600 hover:bg-red-700" : "border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-50"} h-10 md:h-auto text-sm md:text-base min-w-[100px] sm:min-w-[120px]`}
            >
              <Video className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Record Video</span>
              <span className="sm:inline">Video</span> ({videos.length}/{maxVideos})
            </Button>
            
            <Button
              onClick={drawingMode ? handleStopDrawing : handleStartDrawing}
              variant={drawingMode ? "destructive" : "outline"}
              disabled={drawings.length >= maxDrawings}
              type="button"
              className={`${drawingMode ? "bg-red-600 hover:bg-red-700" : "border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-50"} h-10 md:h-auto text-sm md:text-base min-w-[100px] sm:min-w-[120px]`}
            >
              <Edit className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Start Drawing</span>
              <span className="sm:inline">Draw</span> ({drawings.length}/{maxDrawings})
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
                className="w-full max-w-md rounded-lg border-2 border-green-200 shadow-md mx-auto"
                style={{ maxHeight: '300px' }}
              />
              {recording && (
                <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm md:text-base animate-pulse">
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
                className="border-2 border-green-200 rounded-lg cursor-crosshair max-w-full bg-white shadow-md mx-auto"
                style={{ maxHeight: '400px', width: '100%', touchAction: 'none' }}
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
              />
              <div className="flex gap-2 justify-center" onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.cancelBubble = true;
              }}>
                <Button onClick={handleSaveDrawing} variant="outline" type="button" className="border-green-600 text-green-700 hover:bg-green-50 h-10 md:h-auto text-sm md:text-base">
                  <Plus className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Save Drawing</span>
                  <span className="sm:inline">Save</span>
                </Button>
                <Button onClick={handleClearDrawing} variant="outline" type="button" className="border-red-600 text-red-700 hover:bg-red-50 h-10 md:h-auto text-sm md:text-base">
                  <Trash2 className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Clear</span>
                  <span className="sm:inline">Clear</span>
                </Button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>

      {/* Media Galleries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Images Gallery */}
        <Card className="border-green-200 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-4 md:p-6">
            <CardTitle className="flex items-center justify-between text-green-800 text-lg md:text-xl">
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                Photos
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {images.length}/{maxImages}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {images.length === 0 ? (
              <p className="text-gray-500 text-center text-sm md:text-base">No photos captured yet</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 max-h-64 overflow-y-auto">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.data}
                      alt={image.name}
                      className="w-full h-16 md:h-20 object-cover rounded-lg border border-green-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDownloadMedia(image)}
                        className="h-6 w-6 p-0 text-white hover:text-green-300"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleRemoveMedia('image', image.id)}
                        className="h-6 w-6 p-0 text-white hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Drawings Gallery */}
        <Card className="border-green-200 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-4 md:p-6">
            <CardTitle className="flex items-center justify-between text-green-800 text-lg md:text-xl">
              <div className="flex items-center gap-2">
                <TreePine className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                Drawings
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {drawings.length}/{maxDrawings}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {drawings.length === 0 ? (
              <p className="text-gray-500 text-center text-sm md:text-base">No drawings created yet</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 max-h-64 overflow-y-auto">
                {drawings.map((drawing) => (
                  <div key={drawing.id} className="relative group">
                    <img
                      src={drawing.data}
                      alt={drawing.name}
                      className="w-full h-16 md:h-20 object-cover rounded-lg border border-green-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDownloadMedia(drawing)}
                        className="h-6 w-6 p-0 text-white hover:text-green-300"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleRemoveMedia('drawing', drawing.id)}
                        className="h-6 w-6 p-0 text-white hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Videos Gallery */}
        <Card className="border-green-200 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-4 md:p-6">
            <CardTitle className="flex items-center justify-between text-green-800 text-lg md:text-xl">
              <div className="flex items-center gap-2">
                <Sprout className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                Videos
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {videos.length}/{maxVideos}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {videos.length === 0 ? (
              <p className="text-gray-500 text-center text-sm md:text-base">No videos recorded yet</p>
            ) : (
              <div className="space-y-2 md:space-y-3 max-h-64 overflow-y-auto">
                {videos.map((video) => (
                  <div key={video.id} className="relative group">
                    <video
                      src={video.data}
                      className="w-full h-16 md:h-20 object-cover rounded-lg border border-green-200"
                      muted
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDownloadMedia(video)}
                        className="h-6 w-6 p-0 text-white hover:text-green-300"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleRemoveMedia('video', video.id)}
                        className="h-6 w-6 p-0 text-white hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                      {video.size ? `${(video.size / 1024 / 1024).toFixed(1)}MB` : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}