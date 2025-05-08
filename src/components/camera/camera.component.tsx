'use client';

import { Camera } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CameraCaptureButtonProps } from './camera.types';

export function CameraCaptureButton({ onCapture }: CameraCaptureButtonProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
      setShowCamera(true);
    } catch (err) {
      console.error('Erro ao acessar câmera', err);
    }
  };

  // Aplica o stream no vídeo assim que showCamera for true
  useEffect(() => {
    if (showCamera && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [showCamera, stream]);

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const blobUrl = URL.createObjectURL(blob);
        onCapture(blobUrl);
        setShowCamera(false);

        // Parar câmera
        stream?.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }, 'image/jpeg');
  };

  return (
    <div className="mt-2 flex flex-col items-center gap-2">
      {showCamera ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="aspect-video w-full max-w-md rounded-md border"
          />
          <canvas ref={canvasRef} className="hidden" />
          <button
            type="button"
            onClick={takePhoto}
            className="mt-1 flex items-center justify-center gap-2 rounded bg-primary px-3 py-1 text-white"
          >
            <Camera className="h-5 w-5" />
            Tirar foto
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={startCamera}
          className="rounded bg-secondary px-3 py-1 text-white"
        >
          Usar Câmera
        </button>
      )}
    </div>
  );
}
