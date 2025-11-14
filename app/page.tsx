'use client';

import { useRef, useState, useEffect } from 'react';
import * as fabric from 'fabric';

// Available stickers
const STICKERS = [
  '/stickers/Frame 25.png',
  '/stickers/Frame 26.png',
  '/stickers/Frame 27.png',
  '/stickers/Frame 28.png',
  '/stickers/Frame 29.png',
  '/stickers/Frame 30.png',
  '/stickers/Frame 31.png',
  '/stickers/Frame 32.png',
  '/stickers/Frame 33.png',
  '/stickers/Frame 34.png',
  '/stickers/Frame 35.png',
  '/stickers/Frame 36.png',
  '/stickers/Frame 37.png',
  '/stickers/Frame 38.png',
];

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const editCanvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [showEditPage, setShowEditPage] = useState(false);
  const [currentEditIndex, setCurrentEditIndex] = useState(0);
  const [userName, setUserName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
      setIsCameraOn(true);
      setError(null);
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraOn(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // Start countdown before capture
  const startCountdown = () => {
    setIsCountingDown(true);
    setCountdown(3);
  };

  // Countdown effect
  useEffect(() => {
    if (countdown === null || countdown === 0) {
      if (countdown === 0) {
        // Capture the photo when countdown reaches 0
        capturePhotoNow();
        setCountdown(null);
        setIsCountingDown(false);
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // Actual photo capture
  const capturePhotoNow = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Flip the image horizontally
        context.save();
        context.scale(-1, 1);
        context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        context.restore();
        
        const imageDataUrl = canvas.toDataURL('image/png');
        // Add new photo to the array (limit to 1 photo)
        setCapturedImages(prev => {
          if (prev.length >= 1) {
            return [imageDataUrl]; // Replace existing photo
          }
          return [...prev, imageDataUrl];
        });
      }
    }
  };

  // Delete a specific photo
  const deletePhoto = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all photos
  const clearAllPhotos = () => {
    setCapturedImages([]);
  };

  // Go to edit page
  const goToEdit = () => {
    stopCamera();
    setShowNameInput(true);
  };

  // After name is entered, go to edit page
  const proceedToEdit = () => {
    if (userName.trim()) {
      setShowNameInput(false);
      setShowEditPage(true);
      setCurrentEditIndex(0);
    } else {
      alert('Please enter your name!');
    }
  };

  // Calculate font size based on name length (for download - full size)
  const getNameFontSize = () => {
    const length = userName.length;
    if (length <= 4) return '120px';
    if (length <= 6) return '100px';
    if (length <= 8) return '80px';
    if (length <= 10) return '75px';
    if (length <= 14) return '55px';
    if (length <= 18) return '40px';
    if (length <= 22) return '32px';
    return '28px';
  };

  // Calculate font size for display (scaled down by 0.659)
  const getDisplayFontSize = () => {
    const fullSize = parseInt(getNameFontSize());
    return `${Math.round(fullSize * 0.659)}px`;
  };

  // Go back to camera
  const backToCamera = () => {
    setShowEditPage(false);
  };

  // Initialize Fabric.js canvas when edit page is shown
  useEffect(() => {
    let mounted = true;

    const initializeCanvas = async () => {
      if (!showEditPage || !editCanvasRef.current || fabricCanvasRef.current) return;

      // Canvas covers the entire poster area (500x735)
      const canvas = new fabric.Canvas(editCanvasRef.current, {
        width: 500,
        height: 735,
        backgroundColor: 'transparent',
      });

      fabricCanvasRef.current = canvas;

      try {
        // Load the frame first as base layer
        const frameImg = await fabric.FabricImage.fromURL('/frame/frame.svg');
        if (!mounted) return;

        frameImg.scaleToWidth(500);
        frameImg.scaleToHeight(735);
        frameImg.set({
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
        });
        canvas.add(frameImg);

        // Then load the photo and position it on top of the black area
        if (capturedImages[currentEditIndex]) {
          const photoImg = await fabric.FabricImage.fromURL(capturedImages[currentEditIndex]);
          if (!mounted) return;

          photoImg.scaleToWidth(410);
          photoImg.scaleToHeight(308.5);
          photoImg.set({
            left: 40,
            top: 154.5,
            selectable: false,
            evented: false,
          });
          canvas.add(photoImg);

          // Ensure photo is above frame's black rectangle
          canvas.bringObjectToFront(photoImg);
        }

        canvas.renderAll();
      } catch (error) {
        console.error('Error loading images:', error);
      }
    };

    initializeCanvas();

    // Cleanup Fabric canvas when leaving edit page
    return () => {
      mounted = false;
      if (fabricCanvasRef.current) {
        try {
          // Clear all objects before disposing
          fabricCanvasRef.current.clear();
          fabricCanvasRef.current.dispose();
        } catch (e) {
          console.warn('Canvas disposal error:', e);
        }
        fabricCanvasRef.current = null;
      }
    };
  }, [showEditPage, currentEditIndex, capturedImages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (fabricCanvasRef.current) {
        try {
          fabricCanvasRef.current.clear();
          fabricCanvasRef.current.dispose();
        } catch (e) {
          console.warn('Canvas cleanup error:', e);
        }
      }
    };
  }, []);

  // Add sticker to Fabric.js canvas
  const addSticker = (stickerSrc: string) => {
    if (!fabricCanvasRef.current) return;

    fabric.FabricImage.fromURL(stickerSrc).then((img) => {
      img.scale(0.5); // Scale down to reasonable size
      img.set({
        left: 250, // Center of 500px canvas
        top: 367.5, // Center of 735px canvas
        selectable: true,
        hasControls: true,
        hasBorders: true,
      });

      fabricCanvasRef.current?.add(img);
      fabricCanvasRef.current?.setActiveObject(img);
      fabricCanvasRef.current?.renderAll();
    });
  };

  // Remove selected sticker from Fabric canvas
  const removeSticker = () => {
    if (!fabricCanvasRef.current) return;
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject && activeObject !== fabricCanvasRef.current.backgroundImage) {
      fabricCanvasRef.current.remove(activeObject);
      fabricCanvasRef.current.renderAll();
    }
  };

  // Download the final poster using Fabric.js
  const downloadPoster = async () => {
    if (!fabricCanvasRef.current) return;

    try {
      // Wait for fonts to load
      await document.fonts.ready;

      // Create a temporary Fabric canvas for rendering the full poster at high resolution
      const tempCanvas = document.createElement('canvas');
      const scaleFactor = 759 / 500; // Scale from 500px to 759px
      tempCanvas.width = 759;
      tempCanvas.height = 1117;

      const fabricPosterCanvas = new fabric.Canvas(tempCanvas, {
        width: 759,
        height: 1117,
      });

      // Get the current editing canvas as an image (includes frame + photo + stickers)
      const editCanvasDataURL = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: scaleFactor, // Scale up to high resolution
      });

      // Load and draw the entire poster content
      const posterImg = await fabric.FabricImage.fromURL(editCanvasDataURL);
      posterImg.scaleToWidth(759);
      posterImg.scaleToHeight(1117);
      posterImg.set({ left: 0, top: 0, selectable: false });
      fabricPosterCanvas.add(posterImg);

      // Draw the name text with custom styling on top
      const centerX = 759 / 2;
      const centerY = 865;

      const nameText = new fabric.FabricText(userName, {
        left: centerX,
        top: centerY,
        fontSize: parseInt(getNameFontSize()),
        fontFamily: 'Times New Roman',
        fontWeight: 'bold',
        fill: '#000',
        originX: 'center',
        originY: 'center',
        charSpacing: 10,
        scaleY: 1.5, // Vertical stretch
        selectable: false,
      });

      fabricPosterCanvas.add(nameText);
      fabricPosterCanvas.renderAll();

      // Download
      const link = document.createElement('a');
      link.download = 'wanted-poster.png';
      link.href = fabricPosterCanvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1,
      });
      link.click();

      // Cleanup temporary canvas
      fabricPosterCanvas.dispose();
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading. Please try again: ' + error);
    }
  };

  // Show name input modal
  if (showNameInput) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          backgroundImage: 'url(/images/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div 
          className="bg-white p-8 border-4 border-black shadow-2xl"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))',
            maxWidth: '500px',
            width: '100%'
          }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
            Enter Your Name
          </h2>
          <input
            ref={nameInputRef}
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value.toUpperCase())}
            placeholder="YOUR NAME"
            className="w-full px-4 py-3 text-2xl font-bold border-4 border-black mb-6 text-center text-black active-route uppercase"
            style={{ 
              fontFamily: 'Times New Roman, serif',
              clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
            }}
            maxLength={30}
            autoFocus
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                proceedToEdit();
              }
            }}
          />
          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowNameInput(false);
                setUserName('');
              }}
              className="flex-1 px-6 py-3 bg-white text-black hover:opacity-80 font-bold text-sm border-4 border-black shadow-lg transition-all"
              style={{
                fontFamily: 'Times New Roman, serif',
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
              }}
            >
              Cancel
            </button>
            <button
              onClick={proceedToEdit}
              className="flex-1 px-6 py-3 text-black hover:opacity-80 font-bold text-sm border-4 border-black shadow-lg transition-all"
              style={{
                backgroundColor: '#F3CFEB',
                fontFamily: 'Times New Roman, serif',
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If on edit page, show sticker editor
  if (showEditPage) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-6 gap-6"
        style={{
          backgroundImage: 'url(/images/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Header with title and close button */}
        <div className="w-full max-w-4xl flex justify-between items-center">
          <h1 
            className="text-white font-bold text-2xl tracking-wider"
            style={{
              textShadow: '4px 4px 0px #000',
              fontFamily: 'var(--font-press-start)',
            }}
          >
            NAKAMA BOOTH
          </h1>
          <button
            onClick={() => {
              if (fabricCanvasRef.current) {
                try {
                  fabricCanvasRef.current.clear();
                  fabricCanvasRef.current.dispose();
                } catch (e) {
                  console.warn('Canvas disposal error:', e);
                }
                fabricCanvasRef.current = null;
              }
              setShowEditPage(false);
              setUserName('');
            }}
            className="text-white text-3xl hover:opacity-80 transition-all"
            style={{ textShadow: '2px 2px 0px #000' }}
          >
            ✕
          </button>
        </div>

        {/* Horizontal Sticker Gallery */}
        <div className="w-full max-w-4xl overflow-x-auto pb-2">
          <div className="flex gap-3 min-w-max px-2">
            {STICKERS.map((sticker, index) => (
              <button
                key={index}
                onClick={() => addSticker(sticker)}
                className="hover:opacity-80 transition-all p-2 flex-shrink-0"
                style={{
                  backgroundColor: '#585898',
                  width: '80px',
                  height: '80px',
                  border: 'none',
                }}
              >
                <img src={sticker} alt={`Sticker ${index + 1}`} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* Main editing area */}
        <div className="flex flex-col items-center gap-6">
          {/* Wanted Poster with Fabric.js Canvas */}
          <div className="relative" ref={posterRef} style={{ width: '500px', height: '735px' }}>
            <canvas ref={editCanvasRef} />

            {/* Name text box positioned on the poster - matching SVG rect */}
            <div
              className="absolute flex items-center justify-center pointer-events-none"
              style={{
                left: '39.5px',
                top: '527px',
                width: '402px',
                height: '85.5px',
              }}
            >
              <div
                data-name-text
                className="font-bold text-center uppercase break-words px-4"
                style={{
                  fontFamily: 'Times New Roman, serif',
                  fontSize: getDisplayFontSize(),
                  lineHeight: '1',
                  color: '#000',
                  maxWidth: '100%',
                  wordWrap: 'break-word',
                  letterSpacing: '6.6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'scaleY(1.5)', // Stretch text vertically by 1.5x
                }}
              >
                {userName || 'YOUR NAME'}
              </div>
            </div>
          </div>

          {/* Action buttons below the poster */}
          <div className="flex gap-4">
            <button
              onClick={removeSticker}
              className="px-6 py-3 bg-red-500 text-white hover:bg-red-600 font-bold text-sm border-4 border-black shadow-2xl transition-all"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                fontFamily: 'var(--font-press-start)',
              }}
            >
              DELETE
            </button>
            <button
              onClick={downloadPoster}
              className="px-6 py-3 text-black hover:opacity-80 font-bold text-sm border-4 border-black shadow-2xl transition-all"
              style={{
                backgroundColor: '#F3CFEB',
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                fontFamily: 'var(--font-press-start)',
              }}
            >
              DOWNLOAD
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex gap-4 p-8"
      style={{
        backgroundImage: 'url(/images/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Main camera section */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        {error && (
          <div 
            className="text-black px-6 py-4 shadow-lg border-4 border-black"
            style={{ 
              backgroundColor: '#F3CFEB',
              clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
            }}
          >
            {error}
          </div>
        )}


        {/* Countdown display above camera - always reserve space */}
        <div style={{ height: '80px' }} className="flex items-center justify-center">
          {isCountingDown && countdown !== null && countdown > 0 && (
            <div 
              className="text-white font-bold border-4 border-white bg-black px-8 py-4"
              style={{
                fontSize: '48px',
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                textShadow: '3px 3px 0px #F3CFEB'
              }}
            >
              {countdown}
            </div>
          )}
        </div>

        {/* Video preview */}
        <div className="relative">
          <div 
            className="bg-white bg-opacity-90 p-4 border-4 border-black shadow-2xl"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))'
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`border-2 border-black ${isCameraOn ? 'block' : 'hidden'}`}
              style={{ maxWidth: '640px', width: '100%', minHeight: '480px', transform: 'scaleX(-1)' }}
            />
            
            {!isCameraOn && capturedImages.length === 0 && (
              <div 
                className="w-full flex items-center justify-center border-2 border-black" 
                style={{ minHeight: '480px', maxWidth: '640px', backgroundColor: '#F3CFEB' }}
              >
                <p className="text-black text-sm font-bold px-4 text-center">
                  Camera Off
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Controls */}
        <div className="flex gap-4 flex-wrap justify-center">
          {!isCameraOn ? (
            <button
              onClick={startCamera}
              className="px-8 py-4 text-black hover:opacity-80 font-bold text-sm border-4 border-black shadow-2xl transition-all"
              style={{ 
                backgroundColor: '#F3CFEB',
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                imageRendering: 'pixelated'
              }}
            >
              Start Camera
            </button>
          ) : (
            <>
              <button
                onClick={startCountdown}
                disabled={capturedImages.length >= 1 || isCountingDown}
                className="px-8 py-4 text-black hover:opacity-80 font-bold text-sm border-4 border-black shadow-2xl transition-all disabled:opacity-50"
                style={{ 
                  backgroundColor: '#F3CFEB',
                  clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
                }}
              >
                {isCountingDown ? `${countdown}...` : `Capture (${capturedImages.length}/1)`}
              </button>
              <button
                onClick={stopCamera}
                className="px-8 py-4 bg-white text-black hover:opacity-80 font-bold text-sm border-4 border-black shadow-2xl transition-all"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
                }}
              >
                Stop Camera
              </button>
            </>
          )}
        </div>
      </div>

      {/* Captured photos sidebar */}
      {capturedImages.length > 0 && (
        <div 
          className="w-80 bg-white bg-opacity-90 p-4 border-4 border-black shadow-2xl overflow-y-auto"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))',
            maxHeight: 'calc(100vh - 4rem)'
          }}
        >
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-black">
                Photos ({capturedImages.length}/1)
              </h3>
              <button
                onClick={clearAllPhotos}
                className="px-3 py-2 text-black text-xs font-bold border-2 border-black hover:opacity-80 transition-all"
                style={{ 
                  backgroundColor: '#F3CFEB',
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                }}
              >
                Clear All
              </button>
            </div>
            
            {/* Next button */}
            <button
              onClick={goToEdit}
              className="w-full px-4 py-3 text-black font-bold text-sm border-4 border-black hover:opacity-80 transition-all shadow-lg"
              style={{ 
                backgroundColor: '#F3CFEB',
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
              }}
            >
              Next: Add Stickers
            </button>
          </div>
          
          <div className="flex flex-col gap-4">
            {capturedImages.map((image, index) => (
              <div 
                key={index} 
                className="border-4 border-black shadow-lg"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
                }}
              >
                <img
                  src={image}
                  alt={`Captured ${index + 1}`}
                  className="w-full border-2 border-black"
                />
                <div className="flex gap-2 p-2 bg-white">
                  <a
                    href={image}
                    download={`anime-lens-photo-${index + 1}.png`}
                    className="flex-1 px-3 py-2 bg-white text-black text-xs font-bold border-2 border-black hover:opacity-80 text-center transition-all"
                    style={{
                      clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                    }}
                  >
                    Download
                  </a>
                  <button
                    onClick={() => deletePhoto(index)}
                    className="flex-1 px-3 py-2 text-black text-xs font-bold border-2 border-black hover:opacity-80 transition-all"
                    style={{ 
                      backgroundColor: '#F3CFEB',
                      clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}