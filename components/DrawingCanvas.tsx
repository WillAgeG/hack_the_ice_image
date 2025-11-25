
import React, { useRef, useState, useEffect } from 'react';
import { DoodleButton, DoodleCard, Tape } from './DoodleComponents';
import { GeminiCritic } from './GeminiCritic';

interface DrawingCanvasProps {
  onSave: (data: string) => void;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [imageData, setImageData] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = 400; // Fixed height
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
        // Stop current path
        const ctx = canvas.getContext('2d');
        ctx?.beginPath();
        // Save state for preview
        setImageData(canvas.toDataURL('image/png'));
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e as React.MouseEvent).clientX - rect.left;
      y = (e as React.MouseEvent).clientY - rect.top;
    }

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setImageData(null);
      }
    }
  };

  const handleSave = () => {
    if (canvasRef.current && imageData) {
      onSave(imageData);
    } else if (canvasRef.current) {
       // Just in case imageData isn't set but canvas exists
       onSave(canvasRef.current.toDataURL('image/png'));
    }
  };

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 text-gray-900">
      <h2 className="text-4xl hand-font mb-6 text-center text-blue-600 rotate-[-2deg]">
        🎨 Нарисуй своего Маскота!
      </h2>
      
      <div className="w-full flex flex-col md:flex-row gap-6">
        {/* Tools Panel */}
        <DoodleCard className="flex-none md:w-48 bg-yellow-50 flex flex-col gap-4 text-gray-900" rotate="rotate-1" borderColor="border-orange-500">
           <Tape />
           <h3 className="text-xl font-bold text-center mb-2 text-black">Инструменты</h3>
           
           <div className="grid grid-cols-2 gap-2">
             {colors.map(c => (
               <button
                 key={c}
                 onClick={() => setColor(c)}
                 className={`w-10 h-10 rounded-full border-2 border-black shadow-sm transform transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                 style={{ backgroundColor: c }}
                 aria-label={`Select color ${c}`}
               />
             ))}
           </div>

           <div className="mt-4">
             <label className="block text-sm font-bold mb-1 text-black">Толщина: {lineWidth}</label>
             <input 
               type="range" 
               min="1" 
               max="20" 
               value={lineWidth} 
               onChange={(e) => setLineWidth(Number(e.target.value))}
               className="w-full"
             />
           </div>

           <div className="mt-auto pt-4 flex flex-col gap-3">
              <DoodleButton 
                onClick={handleSave}
                className="w-full text-sm py-2 px-1 bg-green-400 hover:bg-green-300 border-green-900 text-white"
              >
                💾 Сохранить
              </DoodleButton>
              <button 
                onClick={clearCanvas}
                className="w-full py-2 px-4 bg-white border-2 border-black rounded-xl font-bold hover:bg-red-50 text-red-600"
              >
                🗑️ Очистить
              </button>
           </div>
        </DoodleCard>

        {/* Canvas Area */}
        <div className="flex-grow relative">
          <canvas
            ref={canvasRef}
            className="w-full bg-white cursor-crosshair border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,0.15)] rounded-sm touch-none"
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
          />
          <div className="absolute -bottom-6 -right-4 text-gray-400 hand-font rotate-[-5deg]">
            * Рисуй прямо здесь!
          </div>
        </div>
      </div>

      <GeminiCritic imageData={imageData} />
    </div>
  );
};
