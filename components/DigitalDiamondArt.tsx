
import React, { useEffect, useRef } from 'react';
import { DoodleCard, DoodleButton, Tape } from './DoodleComponents';

export const DigitalDiamondArt: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size high for crisp rendering
    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = 1200; 
        canvas.height = 1200; 
      }
    };
    resize();

    const fontSize = 14; 
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(1);
    
    // Character sets
    const charsMatrix = '01';
    const charsDiamond = '█▓▒░💎♦✦✧★AZ';
    
    // Stars configuration
    const stars = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.6, // Only in sky
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.05
    }));

    let time = 0;

    // --- GEOMETRY FUNCTIONS ---
    
    const isInsideDiamond = (dx: number, dy: number, scale: number) => {
        // Classic Brilliant Cut Shape
        const topY = -scale * 0.5;
        const girdleY = -scale * 0.15;
        const bottomY = scale * 0.85;
        const tableWidth = scale * 0.5;
        const girdleWidth = scale * 0.95;

        // Top part (Crown) trapezoid
        if (dy >= topY && dy < girdleY) {
            const progress = (dy - topY) / (girdleY - topY);
            const currentWidth = tableWidth + (girdleWidth - tableWidth) * progress;
            return Math.abs(dx) < currentWidth;
        }
        // Bottom part (Pavilion) triangle
        if (dy >= girdleY && dy <= bottomY) {
            const progress = (dy - girdleY) / (bottomY - girdleY);
            const currentWidth = girdleWidth * (1 - progress);
            return Math.abs(dx) < currentWidth;
        }
        return false;
    };

    const isInsideLimbs = (dx: number, dy: number, scale: number, t: number) => {
        // Arms
        const armY = -scale * 0.1;
        const armWidth = scale * 0.15;
        const armLength = scale * 0.5;
        
        // Happy Waving animation (Arms go UP!)
        const waveLeft = Math.sin(t * 0.1) * (scale * 0.1) - (scale * 0.2); // Arms raised
        const waveRight = Math.cos(t * 0.1) * (scale * 0.1) - (scale * 0.2);

        // Left Arm
        if (dx < -scale * 0.5 && dx > -scale * 0.5 - armWidth) {
             if (dy > armY + waveLeft && dy < armY + armLength + waveLeft) return true;
        }
        // Right Arm
        if (dx > scale * 0.5 && dx < scale * 0.5 + armWidth) {
             if (dy > armY + waveRight && dy < armY + armLength + waveRight) return true;
        }

        // Legs
        const legXOffset = scale * 0.25;
        const legWidth = scale * 0.12;
        const legLength = scale * 0.35;
        const legStart = scale * 0.5; // Start from lower pavilion
        
        // Jumping kick animation
        const kick = Math.sin(t * 0.2) * (scale * 0.05);

        if (dy > legStart && dy < legStart + legLength) {
            // Left Leg
            if (Math.abs(dx + legXOffset) < legWidth && dy < legStart + legLength + kick) return true;
            // Right Leg
            if (Math.abs(dx - legXOffset) < legWidth && dy < legStart + legLength - kick) return true;
        }

        return false;
    };

    let animationId: number;

    const draw = () => {
      time++;
      
      // 1. Background (Dark Cyber Void)
      ctx.fillStyle = '#0f172a'; // Slate 900
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Stars
      ctx.fillStyle = '#ffffff';
      stars.forEach(star => {
          const brightness = Math.sin(time * star.speed + star.x) * 0.5 + 0.5;
          ctx.globalAlpha = brightness;
          ctx.fillRect(star.x, star.y, star.size, star.size);
      });
      ctx.globalAlpha = 1;

      // 3. Cyber Grid (Digital Tundra) - MOVING FORWARD
      ctx.strokeStyle = '#d946ef'; // Fuchsia
      ctx.lineWidth = 1;
      const horizonY = canvas.height * 0.75;
      const gridSpeed = (time * 2) % 100; // Movement speed
      
      // Perspective Vertical Lines
      for (let i = -15; i <= 15; i++) {
         const xBase = canvas.width / 2 + i * 100;
         const xTop = canvas.width / 2 + i * 10;
         
         ctx.beginPath();
         ctx.moveTo(xTop, horizonY);
         ctx.lineTo(xBase, canvas.height);
         ctx.globalAlpha = 0.2;
         ctx.stroke();
      }
      
      // Horizontal Lines (Moving)
      let z = 0;
      for (let y = canvas.height; y > horizonY; y -= z) {
          const moveY = y + gridSpeed * (z/50); // Move faster closer to camera
          if (moveY < canvas.height && moveY > horizonY) {
            ctx.beginPath();
            ctx.moveTo(0, moveY);
            ctx.lineTo(canvas.width, moveY);
            ctx.globalAlpha = 0.3;
            ctx.stroke();
          }
          z += 5 + (z * 0.1); 
      }
      ctx.globalAlpha = 1;

      // 4. Matrix Rain (Subtle)
      ctx.font = `bold ${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        if (i % 4 === 0) { 
            const char = charsMatrix[Math.floor(Math.random() * charsMatrix.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;
            
            ctx.fillStyle = '#1e40af'; 
            ctx.globalAlpha = 0.5;
            ctx.fillText(char, x, y);
            ctx.globalAlpha = 1;

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) {
                drops[i] = 0;
            }
            drops[i]++;
        }
      }

      // 5. Northern Lights (Aurora) - Enhanced
      for (let x = 0; x < canvas.width; x += fontSize/2) {
          const y1 = Math.sin(x * 0.003 + time * 0.02) * 60 + 120;
          const y2 = Math.cos(x * 0.005 - time * 0.03) * 60 + 160;
          const y3 = Math.sin(x * 0.004 + time * 0.01) * 40 + 200;
          
          ctx.fillStyle = `hsl(${(time + x/5) % 360}, 70%, 60%)`; 
          ctx.fillText('░', x, y1);
          
          ctx.fillStyle = '#22d3ee'; 
          ctx.fillText('▒', x, y2);

          ctx.fillStyle = '#818cf8'; 
          ctx.fillText('≈', x, y3);
      }


      // 6. THE MASCOT (Foreground)
      const centerX = canvas.width / 2;
      const centerY = canvas.height * 0.45; 
      const scale = 420; 

      // BOUNCE / JUMP Animation (Happy!)
      const jumpY = Math.abs(Math.sin(time * 0.1)) * -30;

      const startX = centerX - scale;
      const endX = centerX + scale;
      const startY = centerY - scale;
      const endY = centerY + scale;

      for (let y = startY; y < endY; y += fontSize) {
          for (let x = startX; x < endX; x += fontSize) {
              const dx = x - centerX;
              const dy = y - (centerY + jumpY);

              const inBody = isInsideDiamond(dx, dy, scale);
              const inLimbs = isInsideLimbs(dx, dy, scale, time);

              if (inBody || inLimbs) {
                  let char = charsDiamond[Math.floor(Math.random() * charsDiamond.length)];
                  let color = '#60a5fa'; 

                  // -- FACIAL FEATURES --
                  // Eyes (Big & Happy)
                  const eyeY = -scale * 0.15;
                  const eyeX = scale * 0.22;
                  const eyeSize = scale * 0.13;
                  
                  const isBlinking = Math.sin(time * 0.05) > 0.96;

                  const isLeftEye = Math.abs(dx + eyeX) < eyeSize && Math.abs(dy - eyeY) < eyeSize;
                  const isRightEye = Math.abs(dx - eyeX) < eyeSize && Math.abs(dy - eyeY) < eyeSize;

                  if ((isLeftEye || isRightEye) && inBody) {
                      if (isBlinking) {
                          // Happy closed eyes ^ ^
                          if (Math.abs(dy - eyeY) < fontSize && Math.abs(dy - (eyeY - Math.abs(dx + (isRightEye ? -eyeX : eyeX)) * 0.5)) < fontSize ) {
                             char = '^'; color = '#000000';
                          } else {
                             continue;
                          }
                      } else {
                          // Open shiny eyes
                          char = '█'; color = '#ffffff'; 
                          // Pupil (Looking slightly up/right randomly)
                          const lookX = Math.sin(time * 0.02) * 10;
                          if (Math.abs(dx - (isRightEye ? eyeX : -eyeX) - lookX) < eyeSize * 0.4 && Math.abs(dy - eyeY) < eyeSize * 0.4) {
                              char = '●'; color = '#000000';
                          }
                      }
                  } 
                  // HAPPY SMILE :D
                  else if (inBody && dy > scale * 0.1) {
                      // Formula for U shape: y = CenterY - A*x^2 (on canvas coordinate system, decreasing Y is going UP)
                      // We want corners UP (lower Y) and center DOWN (higher Y).
                      // So as |x| increases, y should decrease? No.
                      // Center (x=0) is lowest point on face (Highest Y value).
                      // Corners are higher on face (Lowest Y value).
                      // So y should decrease as |x| increases.
                      // Smile curve target Y = SmileBottom - curvature * x^2
                      
                      const smileBottom = scale * 0.25;
                      const curvature = 0.003;
                      const targetY = smileBottom - curvature * Math.pow(dx, 2);
                      
                      // Draw mouth line
                      if (Math.abs(dy - targetY) < fontSize * 1.5 && Math.abs(dx) < scale * 0.25) {
                          char = '▀'; color = '#000000'; // Upper block looks like teeth/smile
                      }
                  }
                  // Cheeks (Blushing)
                  else if (inBody && Math.abs(dy - scale * 0.05) < fontSize * 2 && (Math.abs(dx + scale*0.35) < fontSize * 2 || Math.abs(dx - scale*0.35) < fontSize * 2)) {
                      char = '░'; color = '#f472b6'; 
                  }
                  // General Body
                  else {
                      if (inLimbs) {
                          color = '#2563eb'; 
                          char = '#';
                      } else {
                          // Diamond Gradient 
                          const gradient = (dx + dy + time * 3) % 100;
                          if (gradient < 10) {
                              color = '#ffffff'; // Sparkle
                              char = '✦';
                          } else if (Math.abs(dx) > scale * 0.35 && dy < -scale * 0.15) {
                               color = '#bfdbfe'; // Light Blue
                          } else {
                               color = '#3b82f6'; // Blue
                          }
                      }
                  }

                  ctx.fillStyle = color;
                  if (color !== '#000000') {
                    ctx.shadowColor = color;
                    ctx.shadowBlur = 8;
                  } else {
                    ctx.shadowBlur = 0;
                  }
                  ctx.fillText(char, x, y);
                  ctx.shadowBlur = 0;
              }
          }
      }

      // 6. Foreground Text Overlay
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px monospace';
      ctx.fillText(`STATUS: HAPPY`, 20, 40);
      ctx.fillText(`JUMPS: ${Math.floor(time / 30)}`, 20, 70);

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, []);

  const downloadArt = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return;

    tCtx.fillStyle = '#0f172a';
    tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tCtx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = 'Happy_Diamond_Mascot.jpg';
    link.href = tempCanvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  return (
    <div className="flex flex-col items-center py-8 px-4 w-full bg-slate-900 min-h-screen">
      <h2 className="text-3xl md:text-5xl hand-font text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 mb-8 text-center animate-bounce">
        🌟 ЖИВОЙ ЦИФРОВОЙ АЛМАЗ 🌟
      </h2>
      
      <DoodleCard className="p-2 bg-slate-800 border-cyan-500 w-full max-w-5xl shadow-[0_0_50px_rgba(34,211,238,0.3)]" rotate="rotate-0">
        <div className="relative w-full aspect-square md:aspect-[4/3] rounded-xl overflow-hidden border-4 border-white/20 bg-black">
           <canvas 
             ref={canvasRef} 
             className="w-full h-full object-contain"
           />
        </div>
        
        <div className="mt-6 flex flex-col md:flex-row justify-between items-center px-4 pb-4 gap-4">
            <div className="text-cyan-300 font-mono text-sm">
                &gt; NAME: SPARKY<br/>
                &gt; MISSION: MAKE YOU SMILE<br/>
                &gt; REGION: YAKUTIA_NET
            </div>
            <DoodleButton 
                onClick={downloadArt}
                className="bg-pink-500 hover:bg-pink-400 border-pink-900 text-white shadow-[0_0_15px_#ec4899]"
            >
                📸 СФОТКАТЬ МАСКОТА
            </DoodleButton>
        </div>
      </DoodleCard>
    </div>
  );
};
