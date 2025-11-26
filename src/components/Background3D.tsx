import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Layers, Activity, Disc } from 'lucide-react';

// -----------------------
// COMMON UTILS
// -----------------------
const commonUniforms = {
  uTime: { value: 0 },
  uResolution: { value: new THREE.Vector2(0, 0) }, // Initialize zero, set in effect
  uMouse: { value: new THREE.Vector2(0.5, 0.5) },
};

// -----------------------
// SHADER 1: FLUID (Original)
// -----------------------
const fluidFragment = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;

  // --- NOISE FUNCTIONS ---
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ; m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 3; i++) {
          value += amplitude * snoise(st);
          st *= 2.0;
          amplitude *= 0.5;
      }
      return value;
  }

  float find_closest(int x, int y, float v) {
      int d = 0;
      if(x==0) { if(y==0) d=0; else if(y==1) d=8; else if(y==2) d=2; else d=10; }
      else if(x==1) { if(y==0) d=12; else if(y==1) d=4; else if(y==2) d=14; else d=6; }
      else if(x==2) { if(y==0) d=3; else if(y==1) d=11; else if(y==2) d=1; else d=9; }
      else { if(y==0) d=15; else if(y==1) d=7; else if(y==2) d=13; else d=5; }
      float limit = float(d) / 16.0;
      return step(limit, v);
  }

  void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    st.x *= uResolution.x / uResolution.y;

    vec2 mouse = uMouse * vec2(uResolution.x/uResolution.y, 1.0);
    float dist = distance(st, mouse);
    float force = smoothstep(0.4, 0.0, dist);
    
    vec2 q = vec2(0.);
    q.x = fbm( st + 0.05*uTime );
    q.y = fbm( st + vec2(1.0));

    vec2 r = vec2(0.);
    r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ 0.15*uTime + (force * 0.5) ); 
    r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ 0.126*uTime - (force * 0.5));

    float f = fbm(st + r);
    float intensity = (f * f * 4.0 + 0.5 * f);
    intensity = clamp(intensity, 0.0, 1.0);
    
    // Boosted intensity for better visibility
    intensity = smoothstep(0.2, 0.9, intensity); 

    int x = int(mod(gl_FragCoord.x, 4.0));
    int y = int(mod(gl_FragCoord.y, 4.0));
    float dither = find_closest(x, y, intensity);

    vec3 cBlack = vec3(0.03, 0.03, 0.03);
    // Much brighter white for high contrast
    vec3 cWhite = vec3(0.5, 0.5, 0.55); 
    
    vec3 finalColor = mix(cBlack, cWhite, dither * 0.4); // Increased mix factor
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// -----------------------
// SHADER 2: TERRAIN (Retro Grid)
// -----------------------
const terrainFragment = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;

  // Dithering
  float find_closest(int x, int y, float v) {
      int d = 0;
      if(x==0) { if(y==0) d=0; else if(y==1) d=8; else if(y==2) d=2; else d=10; }
      else if(x==1) { if(y==0) d=12; else if(y==1) d=4; else if(y==2) d=14; else d=6; }
      else if(x==2) { if(y==0) d=3; else if(y==1) d=11; else if(y==2) d=1; else d=9; }
      else { if(y==0) d=15; else if(y==1) d=7; else if(y==2) d=13; else d=5; }
      float limit = float(d) / 16.0;
      return step(limit, v);
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
    
    // Pseudo 3D Projection
    float horizon = 0.2;
    float fov = 0.5;
    float scaling = 1.0 / (uv.y + horizon); // Perspective division
    
    // Create Grid
    vec2 gridUV = uv * scaling;
    gridUV.x *= 2.0; // Widen
    
    // Movement
    gridUV.y += uTime * 1.0;
    
    // Grid Lines
    vec2 grid = fract(gridUV * 3.0);
    float line = smoothstep(0.9, 1.0, grid.x) + smoothstep(0.9, 1.0, grid.y);
    
    // Fog / Distance Fade
    float fog = smoothstep(0.0, 1.5, abs(uv.y + horizon));
    
    // Sky vs Ground
    float ground = step(-horizon, uv.y); // 0 for sky, 1 for ground
    ground = step(uv.y, -horizon * 0.1);

    float intensity = line * scaling * 0.08 * ground; // Boosted scaling factor
    
    // Mouse Warp
    float distToMouse = distance(uv, (uMouse - 0.5) * vec2(uResolution.x/uResolution.y, 1.0));
    intensity += smoothstep(0.3, 0.0, distToMouse) * 0.3;

    intensity = clamp(intensity, 0.0, 1.0);

    // Dither
    int x = int(mod(gl_FragCoord.x, 4.0));
    int y = int(mod(gl_FragCoord.y, 4.0));
    float dither = find_closest(x, y, intensity * 3.0); // Stronger intensity multiplier

    vec3 cBlack = vec3(0.02, 0.02, 0.02);
    vec3 cGrid = vec3(0.4, 0.45, 0.55); // Brighter, bluish metal
    
    vec3 finalColor = mix(cBlack, cGrid, dither * 0.6); // Higher visibility
    
    // Add scanline
    if (mod(gl_FragCoord.y, 4.0) < 1.0) finalColor *= 0.8;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// -----------------------
// SHADER 3: VORTEX
// -----------------------
const vortexFragment = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;

  float find_closest(int x, int y, float v) {
      int d = 0;
      if(x==0) { if(y==0) d=0; else if(y==1) d=8; else if(y==2) d=2; else d=10; }
      else if(x==1) { if(y==0) d=12; else if(y==1) d=4; else if(y==2) d=14; else d=6; }
      else if(x==2) { if(y==0) d=3; else if(y==1) d=11; else if(y==2) d=1; else d=9; }
      else { if(y==0) d=15; else if(y==1) d=7; else if(y==2) d=13; else d=5; }
      float limit = float(d) / 16.0;
      return step(limit, v);
  }

  void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
      
      float r = length(uv);
      float a = atan(uv.y, uv.x);
      
      // Twist
      float twist = r * 2.0 * sin(uTime * 0.5);
      
      // Pattern
      float f = sin(a * 10.0 + twist + uTime) * sin(r * 20.0 - uTime * 2.0);
      
      // Tunnel depth
      float depth = 0.15 / r; // Sharper depth
      f += depth;

      // Mouse interaction
      vec2 mouse = (uMouse - 0.5) * vec2(uResolution.x/uResolution.y, 1.0);
      float mDist = distance(uv, mouse);
      f += smoothstep(0.4, 0.0, mDist) * 1.5;

      float intensity = clamp(f, 0.0, 1.0);
      
      int x = int(mod(gl_FragCoord.x, 4.0));
      int y = int(mod(gl_FragCoord.y, 4.0));
      float dither = find_closest(x, y, intensity * 0.7);

      vec3 cBlack = vec3(0.01, 0.01, 0.01);
      vec3 cColor = vec3(0.4, 0.4, 0.45); // Much brighter

      vec3 finalColor = mix(cBlack, cColor, dither);
      gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ScreenQuad = ({ mode }: { mode: 'FLUID' | 'TERRAIN' | 'VORTEX' }) => {
  const mesh = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5));

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        const x = e.clientX / window.innerWidth;
        const y = 1.0 - (e.clientY / window.innerHeight);
        mouseRef.current.set(x, y);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const uniforms = useMemo(() => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    }), [size]); // Update when size changes

  // Update resolution uniform if window resizes
  useEffect(() => {
      uniforms.uResolution.value.set(size.width, size.height);
  }, [size, uniforms]);


  useFrame((state) => {
    if (mesh.current) {
      const material = mesh.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.getElapsedTime();
      material.uniforms.uMouse.value.lerp(mouseRef.current, 0.05);
    }
  });

  const getFragment = () => {
      switch(mode) {
          case 'TERRAIN': return terrainFragment;
          case 'VORTEX': return vortexFragment;
          default: return fluidFragment;
      }
  };

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        key={mode} // Force re-compile on mode change
        vertexShader={vertexShader}
        fragmentShader={getFragment()}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};

const Background3D = () => {
  const [mode, setMode] = useState<'FLUID' | 'TERRAIN' | 'VORTEX'>('FLUID');

  return (
    <>
        <div className="fixed inset-0 z-0 bg-[#030303] pointer-events-none">
        <Canvas 
            camera={{ position: [0, 0, 1] }} 
            gl={{ antialias: false, powerPreference: "high-performance" }}
            dpr={[1, 2]} 
        >
            <ScreenQuad mode={mode} />
        </Canvas>
        </div>

        {/* Shader Controls - Subtly placed bottom left */}
        <div className="fixed bottom-8 left-8 z-50 flex flex-col gap-2 pointer-events-auto mix-blend-difference">
            <span className="text-[8px] font-mono text-gray-500 mb-1 tracking-widest uppercase">Visual Engine</span>
            <div className="flex gap-1">
                <button 
                    onClick={() => setMode('FLUID')}
                    className={`p-2 border ${mode === 'FLUID' ? 'bg-white text-black border-white' : 'border-gray-800 text-gray-500 hover:border-gray-600'} transition-all`}
                    title="Fluid Dynamics"
                >
                    <Activity className="w-3 h-3" />
                </button>
                <button 
                    onClick={() => setMode('TERRAIN')}
                    className={`p-2 border ${mode === 'TERRAIN' ? 'bg-white text-black border-white' : 'border-gray-800 text-gray-500 hover:border-gray-600'} transition-all`}
                    title="Grid Landscape"
                >
                    <Layers className="w-3 h-3" />
                </button>
                <button 
                    onClick={() => setMode('VORTEX')}
                    className={`p-2 border ${mode === 'VORTEX' ? 'bg-white text-black border-white' : 'border-gray-800 text-gray-500 hover:border-gray-600'} transition-all`}
                    title="Vortex"
                >
                    <Disc className="w-3 h-3" />
                </button>
            </div>
        </div>
    </>
  );
};

export default Background3D;