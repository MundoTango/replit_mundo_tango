import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, RotateCw, Download, X } from 'lucide-react';

interface ImageCropperProps {
  open: boolean;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
  imageUrl: string;
  aspectRatio?: number;
  cropShape?: 'rect' | 'round';
  title?: string;
}

export default function ImageCropper({
  open,
  onClose,
  onCropComplete,
  imageUrl,
  aspectRatio,
  cropShape = 'rect',
  title = 'Crop Image'
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: aspectRatio ? 50 : 90,
    height: aspectRatio ? 50 / aspectRatio : 90,
    x: aspectRatio ? 25 : 5,
    y: aspectRatio ? 25 : 5
  });
  const [zoom, setZoom] = useState([1]);
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);

  const getCroppedImg = async () => {
    if (!imgRef.current) return;
    
    // Use completedCrop if available, otherwise convert current crop to pixels
    let cropToUse = completedCrop;
    if (!cropToUse) {
      const { width, height } = imgRef.current;
      cropToUse = {
        unit: 'px',
        x: crop.unit === '%' ? (crop.x * width) / 100 : crop.x,
        y: crop.unit === '%' ? (crop.y * height) / 100 : crop.y,
        width: crop.unit === '%' ? (crop.width * width) / 100 : crop.width,
        height: crop.unit === '%' ? (crop.height * height) / 100 : crop.height
      };
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    canvas.width = cropToUse.width;
    canvas.height = cropToUse.height;

    ctx.save();
    
    if (cropShape === 'round') {
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        Math.min(canvas.width, canvas.height) / 2,
        0,
        Math.PI * 2
      );
      ctx.clip();
    }

    ctx.drawImage(
      imgRef.current,
      cropToUse.x * scaleX,
      cropToUse.y * scaleY,
      cropToUse.width * scaleX,
      cropToUse.height * scaleY,
      0,
      0,
      cropToUse.width,
      cropToUse.height
    );

    ctx.restore();

    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
          resolve(file);
        }
      }, 'image/jpeg', 0.95);
    });
  };

  const handleCrop = async () => {
    try {
      // If no crop is completed yet, use the current crop
      if (!completedCrop && imgRef.current) {
        const { width, height } = imgRef.current;
        const cropInPixels: PixelCrop = {
          unit: 'px',
          x: crop.unit === '%' ? (crop.x * width) / 100 : crop.x,
          y: crop.unit === '%' ? (crop.y * height) / 100 : crop.y,
          width: crop.unit === '%' ? (crop.width * width) / 100 : crop.width,
          height: crop.unit === '%' ? (crop.height * height) / 100 : crop.height
        };
        setCompletedCrop(cropInPixels);
        // Wait for state update
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const croppedFile = await getCroppedImg();
      if (croppedFile) {
        onCropComplete(croppedFile);
        onClose();
      } else {
        console.error('Failed to crop image - no file generated');
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Image with crop */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ maxHeight: '60vh' }}>
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              className="max-w-full"
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Crop preview"
                style={{
                  transform: `scale(${zoom[0]}) rotate(${rotation}deg)`,
                  maxWidth: '100%',
                  maxHeight: '60vh',
                  objectFit: 'contain'
                }}
                onLoad={(e) => {
                  const { width, height } = e.currentTarget;
                  if (aspectRatio) {
                    const cropWidth = width * 0.8;
                    const cropHeight = cropWidth / aspectRatio;
                    setCrop({
                      unit: 'px',
                      width: cropWidth,
                      height: cropHeight,
                      x: (width - cropWidth) / 2,
                      y: (height - cropHeight) / 2
                    });
                  }
                }}
              />
            </ReactCrop>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Zoom control */}
            <div className="flex items-center gap-4">
              <ZoomIn className="w-5 h-5 text-gray-600" />
              <Slider
                value={zoom}
                onValueChange={setZoom}
                min={0.5}
                max={3}
                step={0.1}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-12">{zoom[0].toFixed(1)}x</span>
            </div>

            {/* Rotation control */}
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRotate}
                className="border-turquoise-200 text-turquoise-700 hover:bg-turquoise-50"
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Rotate 90°
              </Button>
              <span className="text-sm text-gray-600">{rotation}°</span>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              {cropShape === 'round' 
                ? 'Drag to position your image within the circle. Use zoom to fill the area.'
                : 'Drag the corners to resize, or drag inside to reposition the crop area.'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-gray-300"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleCrop}
            className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Apply & Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}