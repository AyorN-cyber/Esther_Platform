/**
 * Flowing Purple Waves WebGL Background
 * Matches the elegant purple wave aesthetic from the image
 * Features: Flowing wave forms with depth and lighting
 */

import { useEffect, useRef } from 'react';

export default function PurpleWebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      // Fallback to CSS gradient if WebGL not supported
      return;
    }

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_uv = a_position * 0.5 + 0.5;
      }
    `;

    // Fragment shader - Flowing purple waves
    const fragmentShaderSource = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      varying vec2 v_uv;
      
      // Noise function for organic wave patterns
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      // Smooth noise
      float smoothNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        
        float a = noise(i);
        float b = noise(i + vec2(1.0, 0.0));
        float c = noise(i + vec2(0.0, 1.0));
        float d = noise(i + vec2(1.0, 1.0));
        
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      
      // Multiple octaves for flowing effect
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for(int i = 0; i < 4; i++) {
          value += amplitude * smoothNoise(p);
          p *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }
      
      void main() {
        vec2 uv = v_uv;
        vec2 p = uv * 3.0;
        
        // Animate the waves
        p.y += u_time * 0.2;
        p.x += sin(u_time * 0.15) * 0.3;
        
        // Create flowing wave patterns
        float wave1 = sin(p.y * 2.0 + u_time * 0.5) * 0.5 + 0.5;
        float wave2 = sin(p.x * 1.5 + p.y * 2.5 + u_time * 0.3) * 0.5 + 0.5;
        float wave3 = fbm(p * 0.8 + vec2(u_time * 0.1, u_time * 0.15));
        
        // Combine waves for flowing effect
        float combined = wave1 * 0.4 + wave2 * 0.3 + wave3 * 0.3;
        
        // Create depth with multiple layers
        float depth1 = smoothstep(0.3, 0.7, combined);
        float depth2 = smoothstep(0.5, 0.9, combined);
        float depth3 = smoothstep(0.7, 1.0, combined);
        
        // Purple color palette matching the image
        // Deep black base
        vec3 baseColor = vec3(0.0, 0.0, 0.0);
        
        // Deep purple shadows (plum/indigo)
        vec3 shadowColor = vec3(0.15, 0.05, 0.25);
        
        // Medium purple
        vec3 midColor = vec3(0.35, 0.15, 0.50);
        
        // Vibrant purple highlights (magenta-purple)
        vec3 highlightColor = vec3(0.65, 0.25, 0.85);
        
        // Bright magenta highlights
        vec3 brightColor = vec3(0.85, 0.40, 0.95);
        
        // Mix colors based on depth - More visible waves
        vec3 color = baseColor;
        color = mix(color, shadowColor, depth1 * 0.8);
        color = mix(color, midColor, depth2 * 0.7);
        color = mix(color, highlightColor, depth3 * 0.6);
        color = mix(color, brightColor, smoothstep(0.85, 1.0, combined) * 0.5);
        
        // Add subtle lighting from top-left
        vec2 lightDir = normalize(vec2(-0.5, -0.5));
        vec2 toLight = lightDir;
        float light = dot(normalize(vec2(combined - 0.5, 0.1)), toLight) * 0.5 + 0.5;
        color *= (0.8 + light * 0.4);
        
        // Add subtle texture overlay
        float texture = smoothNoise(uv * 20.0 + u_time * 0.1) * 0.05 + 0.95;
        color *= texture;
        
        // Make waves more visible - higher alpha
        float alpha = max(combined * 1.2, 0.3);
        
        gl_FragColor = vec4(color, alpha);
      }
    `;

    // Compile shader
    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    // Create program
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Get locations
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

    // Create buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Enable blending for smooth edges
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Animation loop
    let animationFrame: number;
    let startTime = Date.now();

    const animate = () => {
      const currentTime = (Date.now() - startTime) / 1000;
      
      gl.uniform1f(timeLocation, currentTime);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      
      gl.clearColor(0.0, 0.0, 0.0, 1.0); // Deep black
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <>
      {/* WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />
      
      {/* Fallback CSS gradient for non-WebGL browsers */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top left, rgba(168, 85, 247, 0.15) 0%, rgba(107, 33, 168, 0.1) 30%, #000000 70%)',
          zIndex: 0
        }}
      />
      
      {/* Subtle overlay for depth */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle at 30% 20%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)',
          zIndex: 1
        }}
      />
    </>
  );
}
