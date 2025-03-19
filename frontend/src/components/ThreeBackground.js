import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points } from '@react-three/drei';
import * as THREE from 'three';

// Function to generate random points in a sphere
function randomInSphere(count, radius) {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = radius * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    points[i * 3] = x;
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = z;
  }
  return points;
}

// StarField component
function StarField({ count = 5000, size = 0.01 }) {
  const points = useMemo(() => randomInSphere(count, 3), [count]);
  const starRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 0.1;
    if (starRef.current) {
      starRef.current.rotation.set(Math.sin(t / 4), Math.sin(t / 4), Math.cos(t / 4));
    }
  });

  return (
    <Points ref={starRef} positions={points} stride={3} frustumCulled={false}>
      <pointsMaterial
        transparent
        color="#ffffff"
        size={size}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// Main Three.js Background component
function ThreeBackground() {
  return (
    <Canvas
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
      camera={{ position: [0, 0, 1] }}
    >
      <ambientLight intensity={0.5} />
      <StarField />
    </Canvas>
  );
}

export default ThreeBackground;
