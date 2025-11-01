import React, { useEffect, useRef } from 'react';

export const MinimalBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationFrameId: number;
    let time = 0;

    // Minimal floating dots
    class Dot {
      x: number;
      y: number;
      baseY: number;
      size: number;
      speed: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseY = this.y;
        this.size = Math.random() * 2 + 1;
        this.speed = Math.random() * 0.5 + 0.2;
        this.opacity = Math.random() * 0.15 + 0.05;
      }

      update(time: number) {
        this.y = this.baseY + Math.sin(time * this.speed + this.x * 0.01) * 20;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(147, 51, 234, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Create minimal dots
    const dots: Dot[] = [];
    for (let i = 0; i < 50; i++) {
      dots.push(new Dot());
    }

    const animate = () => {
      time += 0.01;
      
      // Clear with very subtle fade
      ctx.fillStyle = 'rgba(3, 7, 18, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle gradient lines
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.03)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 20) {
          const y = canvas.height / 2 + 
                    Math.sin(x * 0.005 + time * 0.5 + i * 2) * 30 +
                    Math.sin(x * 0.003 + time * 0.3 + i) * 20;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Update and draw dots
      dots.forEach(dot => {
        dot.update(time);
        dot.draw();
      });

      // Draw very subtle grid
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.02)';
      ctx.lineWidth = 0.5;
      
      // Vertical lines
      for (let x = 0; x < canvas.width; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y < canvas.height; y += 100) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw a single subtle circle in center
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 200 + Math.sin(time * 0.5) * 20;

      ctx.strokeStyle = 'rgba(147, 51, 234, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner circle
      const innerRadius = 150 + Math.sin(time * 0.7) * 15;
      ctx.strokeStyle = 'rgba(219, 39, 119, 0.04)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: 'transparent' }}
    />
  );
};
