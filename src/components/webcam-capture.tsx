import React, { useState, useRef, useCallback } from "react";
import { Camera, X, RefreshCw, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WebcamCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (dataUrl: string) => void;
  title: string;
  description?: string;
}

export function WebcamCapture({ open, onOpenChange, onCapture, title, description }: WebcamCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Akses kamera ditolak atau kamera tidak ditemukan. Silakan unggah foto dari perangkat Anda.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Start camera when dialog opens, stop when it closes
  React.useEffect(() => {
    if (open && !previewUrl) {
      startCamera();
    } else {
      stopCamera();
    }
    
    // Reset state on close
    if (!open) {
      setPreviewUrl(null);
      setError(null);
    }
    
    return stopCamera;
  }, [open, previewUrl, startCamera, stopCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Compress and get data URL (limit to ~2MB approx by adjusting quality and max dimensions if needed)
        // For simplicity, just use 0.7 quality jpeg here. If strict 2MB is needed, we'd loop.
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setPreviewUrl(dataUrl);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setPreviewUrl(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (previewUrl) {
      onCapture(previewUrl);
      onOpenChange(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center font-bold text-primary">{title}</DialogTitle>
          {description && <DialogDescription className="text-center">{description}</DialogDescription>}
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4 pt-4">
          {error ? (
            <div className="w-full text-center space-y-4">
              <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm border border-destructive/20">
                {error}
              </div>
              <div className="w-full aspect-video bg-muted rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 relative overflow-hidden">
                 {previewUrl ? (
                   <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                 ) : (
                   <div className="text-muted-foreground flex flex-col items-center">
                     <Camera className="h-10 w-10 mb-2 opacity-50" />
                     <span>Tidak ada pratinjau</span>
                   </div>
                 )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                capture="user" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              {!previewUrl ? (
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="w-full rounded-full"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Unggah Foto
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-3 w-full">
                   <Button variant="outline" onClick={() => {
                     setPreviewUrl(null);
                     fileInputRef.current?.click();
                   }} className="rounded-full">
                     Ganti Foto
                   </Button>
                   <Button onClick={handleConfirm} className="rounded-full">
                     Konfirmasi
                   </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative shadow-inner">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover transform scale-x-[-1]" // mirror effect
                  />
                )}
                
                {/* Frame overlay for nicer UI */}
                {!previewUrl && (
                  <div className="absolute inset-0 pointer-events-none border-4 border-primary/20 rounded-xl z-10 m-4 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-white/50 border-dashed rounded-full" />
                  </div>
                )}
              </div>
              
              {/* Hidden canvas for image capture */}
              <canvas ref={canvasRef} className="hidden" />

              <div className="w-full flex justify-center">
                {!previewUrl ? (
                  <Button 
                    size="lg" 
                    className="w-full max-w-xs rounded-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                    onClick={capturePhoto}
                  >
                    <Camera className="mr-2 h-5 w-5" /> Ambil Foto
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="rounded-full font-semibold border-2"
                      onClick={retakePhoto}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Foto Ulang
                    </Button>
                    <Button 
                      size="lg" 
                      className="rounded-full font-semibold shadow-md"
                      onClick={handleConfirm}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Konfirmasi
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
