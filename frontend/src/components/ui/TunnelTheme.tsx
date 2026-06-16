"use client";

import * as THREE from "three";
import { useRef, useEffect, useState, useCallback } from "react";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile("matches" in e ? e.matches : (e as any).matches);

    setIsMobile(mq.matches);
    try {
      mq.addEventListener("change", onChange as any);
      return () => mq.removeEventListener("change", onChange as any);
    } catch {
      mq.addListener(onChange as any);
      return () => mq.removeListener(onChange as any);
    }
  }, [breakpoint]);

  return isMobile;
}

const vertexShader = `void main(){ gl_Position = vec4(position, 1.0); }`;

const fragmentShader = `
uniform float iTime;
uniform vec3 iResolution;

#define TAU 6.2831853071795865
#define TUNNEL_LAYERS 64.0 // Optimisation: Reduced from 96 to 64 for enhanced GPU pipelines
#define RING_POINTS 96.0   // Optimisation: Reduced from 128 to 96 to clear clock cycles
#define POINT_SIZE 2.0
#define POINT_COLOR_A vec3(1.0)
#define POINT_COLOR_B vec3(0.65)
#define SPEED 0.6

float sq(float x){ return x*x; }

vec2 AngRep(vec2 uv, float angle){
  vec2 polar = vec2(atan(uv.y, uv.x), length(uv));
  polar.x = mod(polar.x + angle/2.0, angle) - angle/2.0;
  return polar.y * vec2(cos(polar.x), sin(polar.x));
}

float sdCircle(vec2 uv, float r){ return length(uv) - r; }

vec3 MixShape(float sd, vec3 fill, vec3 target){
  float blend = smoothstep(0.0, 1.5/iResolution.y, sd);
  return mix(fill, target, blend);
}

vec2 TunnelPath(float x){
  vec2 offs = vec2(
    0.2 * sin(TAU * x * 0.5) + 0.4 * sin(TAU * x * 0.2 + 0.3),
    0.3 * cos(TAU * x * 0.3) + 0.2 * cos(TAU * x * 0.1)
  );
  offs *= smoothstep(1.0, 4.0, x);
  return offs;
}

void main(){
  vec2 res = iResolution.xy / iResolution.y;
  vec2 uv = gl_FragCoord.xy / iResolution.y - res/2.0;
  vec3 color = vec3(0.0);
  float repAngle = TAU / RING_POINTS;
  float pointSize = POINT_SIZE / (2.0 * iResolution.y);
  float camZ = iTime * SPEED;
  vec2 camOffs = TunnelPath(camZ);

  for(int i = 1; i <= int(TUNNEL_LAYERS); i++){
    float pz = 1.0 - (float(i) / TUNNEL_LAYERS);
    pz -= mod(camZ, 4.0 / TUNNEL_LAYERS);
    vec2 offs = TunnelPath(camZ + pz) - camOffs;
    float ringRad = 0.18 * (1.0 / sq(pz * 0.8 + 0.4)); // Zoom Fix: Adjusted scale base to map correctly across aspects
    if(abs(length(uv + offs) - ringRad) < pointSize * 1.8){
      vec2 aruv = AngRep(uv + offs, repAngle);
      float pdist = sdCircle(aruv - vec2(ringRad, 0), pointSize);
      vec3 ptColor = (mod(float(i/2), 2.0) == 0.0) ? POINT_COLOR_A : POINT_COLOR_B;
      float shade = (1.0 - pz) * smoothstep(0.0, 0.4, pz); // Smooth fade-out in distance
      color = MixShape(pdist, ptColor * shade, color);
    }
  }

  gl_FragColor = vec4(color, 1.0);
}
`;

type ThreeContext = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  material: THREE.ShaderMaterial;
  mesh: THREE.Mesh;
  geometry: THREE.PlaneGeometry;
};

function createThreeForCanvas(canvas: HTMLCanvasElement, width: number, height: number): ThreeContext {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  
  // PERFORMANCE FIX: Downsample WebGL grid internal rendering scale by 0.75 
  // This reduces pixel fill rate load by half without compromising high contrast lines
  const scaleFactor = 0.75;
  renderer.setPixelRatio(scaleFactor);
  renderer.setSize(width, height, false); // false prevents inline element scale inflation

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      iTime: { value: 0 },
      // Important: Multiply dimensions by scaleFactor to keep calculations matched
      iResolution: { value: new THREE.Vector3(width * scaleFactor, height * scaleFactor, 1) },
    },
    vertexShader,
    fragmentShader,
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  return { renderer, scene, camera, material, mesh, geometry };
}

function disposeThree(ctx: ThreeContext) {
  try {
    ctx.scene.remove(ctx.mesh);
    ctx.mesh.geometry.dispose();
    ctx.material.dispose();
    ctx.renderer.dispose();
  } catch (e) {}
}

export function TunnelTheme() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<ThreeContext | null>(null);
  const lastTimeRef = useRef<number>(0);
  const animRef = useRef<number | null>(null);
  const pausedRef = useRef<boolean>(false);
  const rafResizeRef = useRef<boolean>(false);

  const animate = useCallback((time: number) => {
    if (!ctxRef.current) return;
    animRef.current = requestAnimationFrame(animate);
    if (pausedRef.current) {
      lastTimeRef.current = time;
      return;
    }
    time *= 0.001;
    const delta = time - (lastTimeRef.current || time);
    lastTimeRef.current = time;
    
    // Smooth out animation stepping pace
    ctxRef.current.material.uniforms.iTime.value += Math.min(delta, 0.1) * 0.4;
    ctxRef.current.renderer.render(ctxRef.current.scene, ctxRef.current.camera);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;

    const container = canvas.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const ctx = createThreeForCanvas(canvas, width, height);
    ctxRef.current = ctx;

const resizeObserver = new ResizeObserver(() => {
  // If the component is already unmounting and context is gone, exit immediately
  if (!ctxRef.current) return;
  if (rafResizeRef.current) return;
  
  rafResizeRef.current = true;
  requestAnimationFrame(() => {
    rafResizeRef.current = false;
    
    // Double check inside the async frame that it hasn't unmounted in the last few milliseconds
    if (!ctxRef.current) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    const scale = 0.75;
    
    ctxRef.current.renderer.setSize(w, h, false);
    if (ctxRef.current.material?.uniforms?.iResolution?.value) {
      (ctxRef.current.material.uniforms.iResolution.value as THREE.Vector3).set(
        w * scale, 
        h * scale, 
        1
      );
    }
  });
});
    resizeObserver.observe(container);

    const handleVisibility = () => {
      pausedRef.current = !!document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);
    handleVisibility();

    animRef.current = requestAnimationFrame(animate);

    return () => {
      resizeObserver.disconnect();
      if (animRef.current) cancelAnimationFrame(animRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (ctxRef.current) {
        disposeThree(ctxRef.current);
        ctxRef.current = null;
      }
    };
  }, [animate]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
}