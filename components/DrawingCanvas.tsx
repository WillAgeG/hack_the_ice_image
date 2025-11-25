import React, { useRef, useState, useEffect } from 'react';
import { DoodleButton, DoodleCard, Tape } from './DoodleComponents';
import { GeminiCritic } from './GeminiCritic';

interface DrawingCanvasProps {
  onSave: (data: string) => void;
}

type ToolType = 'brush' | 'line' | 'rect' | 'circle' | 'diamond' | 'eraser';

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(15); 
  const [tool, setTool] = useState<ToolType>('brush');
  const [fillShape, setFillShape] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  
  // History for Undo
  const [history, setHistory] = useState<ImageData[]>([]);
  const startPos = useRef<{x: number, y: number} | null>(null);
  const snapshot = useRef<ImageData | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 2000;
      canvas.height = 1200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // Save initial blank state
        const initial = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([initial]);
      }
    }
  }, []);

  const getCoords = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const coords = getCoords(e, canvas);
    startPos.current = coords;

    // Save snapshot for shape preview
    snapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineWidth = lineWidth;
    // Eraser is just white paint
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.fillStyle = tool === 'eraser' ? '#ffffff' : color; 
    
    if (tool === 'brush' || tool === 'eraser') {
       ctx.lineTo(coords.x, coords.y);
       ctx.stroke();
    }
  };

  const drawShape = (ctx: CanvasRenderingContext2D, start: {x: number, y: number}, end: {x: number, y: number}, currentTool: ToolType, filled: boolean) => {
    ctx.beginPath();
    
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const w = Math.abs(end.x - start.x);
    const h = Math.abs(end.y - start.y);

    if (currentTool === 'line') {
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
    } else if (currentTool === 'rect') {
      ctx.rect(x, y, w, h);
    } else if (currentTool === 'circle') {
      ctx.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, 2 * Math.PI);
    } else if (currentTool === 'diamond') {
      // Gem Shape
      const topOffset = w * 0.25; 
      const midHeight = h * 0.35;

      const p1 = { x: x + topOffset, y: y }; 
      const p2 = { x: x + w - topOffset, y: y }; 
      const p3 = { x: x + w, y: y + midHeight }; 
      const p4 = { x: x + w / 2, y: y + h }; 
      const p5 = { x: x, y: y + midHeight }; 

      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.lineTo(p5.x, p5.y);
      ctx.closePath();
      
      // Inner lines (only if not filled, or stroke after fill)
      if (!filled) {
        const tempStroke = ctx.strokeStyle;
        ctx.stroke(); // Draw outline first
        ctx.beginPath(); // Start inner lines
        ctx.moveTo(p5.x, p5.y); ctx.lineTo(p3.x, p3.y);
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p5.x, p5.y);
        ctx.moveTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
        ctx.stroke();
        return; // Special handling for diamond lines
      }
    }

    if (filled && currentTool !== 'line') {
        ctx.fill();
    } else {
        ctx.stroke();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (e.cancelable) e.preventDefault();

    const curr = getCoords(e, canvas);

    if (tool === 'brush' || tool === 'eraser') {
      ctx.lineTo(curr.x, curr.y);
      ctx.stroke();
    } else {
      if (snapshot.current) {
        ctx.putImageData(snapshot.current, 0, 0);
      }
      drawShape(ctx, startPos.current, curr, tool, fillShape);
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || !startPos.current) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
        const curr = getCoords(e, canvas);
        const dist = Math.sqrt(Math.pow(curr.x - startPos.current.x, 2) + Math.pow(curr.y - startPos.current.y, 2));
        
        // Single click for shapes
        if (tool !== 'brush' && tool !== 'eraser' && dist < 10) {
            const defaultSize = 150;
            const start = { 
                x: startPos.current.x - defaultSize / 2, 
                y: startPos.current.y - defaultSize / 2 
            };
            const end = { 
                x: startPos.current.x + defaultSize / 2, 
                y: startPos.current.y + defaultSize / 2 
            };
            
            if (snapshot.current) ctx.putImageData(snapshot.current, 0, 0);
            
            ctx.beginPath();
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            drawShape(ctx, start, end, tool, fillShape);
        }

        const newState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory(prev => {
            const newHist = [...prev, newState];
            if (newHist.length > 20) newHist.shift(); 
            return newHist;
        });
        setImageData(canvas.toDataURL('image/png'));
    }
    
    startPos.current = null;
    snapshot.current = null;
  };

  const addStamp = (stamp: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 100;
    const x = canvas.width / 2 - size / 2 + (Math.random() * 200 - 100);
    const y = canvas.height / 2 - size / 2 + (Math.random() * 200 - 100);

    ctx.font = `${size}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stamp, x + size/2, y + size/2);

    const newState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev, newState]);
    setImageData(canvas.toDataURL('image/png'));
  };

  const undo = () => {
      const canvas = canvasRef.current;
      if (canvas && history.length > 1) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
              const newHistory = [...history];
              newHistory.pop(); 
              const previousState = newHistory[newHistory.length - 1];
              ctx.putImageData(previousState, 0, 0);
              setHistory(newHistory);
              setImageData(canvas.toDataURL('image/png'));
          }
      }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const blank = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([blank]);
        setImageData(null);
      }
    }
  };

  const handleSave = () => {
    if (canvasRef.current) {
       onSave(canvasRef.current.toDataURL('image/png'));
    }
  };

  const handleColorChange = (c: string) => {
    setColor(c);
    if (tool === 'eraser') setTool('brush');
  };

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];
  const tools: {id: ToolType, label: string, icon: string}[] = [
      { id: 'brush', label: 'Кисть', icon: '✏️' },
      { id: 'eraser', label: 'Ластик', icon: '🧽' },
      { id: 'line', label: 'Линия', icon: '📏' },
      { id: 'rect', label: 'Квадрат', icon: '⬜' },
      { id: 'circle', label: 'Круг', icon: '⭕' },
      { id: 'diamond', label: 'Алмаз', icon: '💎' },
  ];
  const stamps = ['❄️', '🔥', '⭐', '💎', '❤️', '👀'];

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 text-gray-900">
      <h2 className="text-3xl md:text-4xl hand-font mb-6 text-center text-blue-600 rotate-[-2deg]">
        🎨 Нарисуй своего Маскота!
      </h2>
      
      <div className="w-full flex flex-col lg:flex-row gap-6">
        {/* Toolbar */}
        <DoodleCard className="flex-none lg:w-64 bg-yellow-50 flex flex-col gap-4 text-gray-900" rotate="rotate-1" borderColor="border-orange-500">
           <Tape />
           
           {/* Tools Section */}
           <div>
             <h3 className="text-base font-bold text-center mb-2 text-black">Инструменты</h3>
             <div className="grid grid-cols-3 gap-2">
                 {tools.map(t => (
                     <button
                        key={t.id}
                        onClick={() => setTool(t.id)}
                        className={`
                            flex flex-col items-center justify-center p-2 rounded-lg border-2 
                            transition-all hover:scale-105 active:scale-95
                            ${tool === t.id 
                                ? 'bg-blue-200 border-blue-600 shadow-inner scale-95 ring-2 ring-blue-300' 
                                : 'bg-white border-gray-300 shadow-sm'}
                        `}
                        title={t.label}
                     >
                         <span className="text-2xl">{t.icon}</span>
                     </button>
                 ))}
             </div>
             <div className="mt-2 flex items-center justify-center gap-2">
                <input 
                  type="checkbox" 
                  id="fillShape" 
                  checked={fillShape} 
                  onChange={(e) => setFillShape(e.target.checked)}
                  className="w-5 h-5 accent-blue-500"
                />
                <label htmlFor="fillShape" className="text-sm font-bold cursor-pointer select-none">Заливка фигур</label>
             </div>
           </div>

           {/* Stamps Section */}
           <div>
             <h3 className="text-base font-bold text-center mb-2 text-black">Штампы</h3>
             <div className="flex flex-wrap justify-center gap-2">
                 {stamps.map(s => (
                     <button
                        key={s}
                        onClick={() => addStamp(s)}
                        className="text-2xl p-1 hover:scale-125 transition-transform bg-white border border-gray-200 rounded-md shadow-sm"
                     >
                        {s}
                     </button>
                 ))}
             </div>
           </div>

           {/* Colors Section */}
           <div>
             <h3 className="text-base font-bold text-center mb-2 text-black">Цвет</h3>
             <div className="grid grid-cols-4 gap-2">
               {colors.map(c => (
                 <button
                   key={c}
                   onClick={() => handleColorChange(c)}
                   className={`w-8 h-8 rounded-full border-2 border-black shadow-sm transform transition-transform hover:scale-110 ${color === c && tool !== 'eraser' ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                   style={{ backgroundColor: c }}
                   aria-label={`Select color ${c}`}
                 />
               ))}
             </div>
           </div>

           {/* Size Section */}
           <div className="mt-2">
             <label className="block text-sm font-bold mb-1 text-black">
                 {tool === 'eraser' ? 'Размер ластика' : 'Толщина'}: {Math.round(lineWidth / 3)}
             </label>
             <input 
               type="range" 
               min="3" 
               max="80" 
               value={lineWidth} 
               onChange={(e) => setLineWidth(Number(e.target.value))}
               className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
             />
           </div>

           {/* Actions Section */}
           <div className="mt-auto pt-4 flex flex-col gap-3">
              <button
                onClick={undo}
                disabled={history.length <= 1}
                className={`w-full py-2 px-4 rounded-xl font-bold border-2 border-black flex items-center justify-center gap-2
                    ${history.length <= 1 ? 'bg-gray-200 text-gray-400' : 'bg-white hover:bg-gray-100 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all'}
                `}
              >
                ↩️ Назад
              </button>

              <DoodleButton 
                onClick={handleSave}
                className="w-full text-sm py-2 px-1 bg-green-400 hover:bg-green-300 border-green-900 text-white"
              >
                💾 Сохранить в Галерею
              </DoodleButton>
              <button 
                onClick={clearCanvas}
                className="w-full py-2 px-4 bg-white border-2 border-red-200 rounded-xl font-bold hover:bg-red-50 text-red-500 text-sm"
              >
                🗑️ Очистить всё
              </button>
           </div>
        </DoodleCard>

        {/* Canvas Area */}
        <div className="flex-grow relative select-none">
          <canvas
            ref={canvasRef}
            className={`w-full h-auto aspect-[5/3] bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,0.15)] rounded-sm touch-none ${tool === 'eraser' ? 'cursor-cell' : 'cursor-crosshair'}`}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
          />
          <div className="absolute -bottom-12 right-0 text-gray-500 hand-font rotate-[-2deg] text-xs md:text-sm p-2 bg-yellow-100/50 rounded-lg">
            * Кликни для фигуры | Тяни для размера | ↩️ Кнопка "Назад" спасает!
          </div>
        </div>
      </div>

      <GeminiCritic imageData={imageData} />
    </div>
  );
};