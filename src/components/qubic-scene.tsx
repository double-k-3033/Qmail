"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function QubicLogo() {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      meshRef.current.rotation.y += 0.005;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x += 0.01;
      innerRef.current.rotation.z += 0.008;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.8}>
      <group>
        {/* Outer sphere */}
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1.4, 1]} />
          <MeshDistortMaterial
            color="#6ebbd6"
            speed={2}
            distort={0.15}
            radius={1}
            transparent
            opacity={0.15}
            wireframe
          />
        </mesh>

        {/* Inner core */}
        <mesh ref={innerRef} scale={0.7}>
          <octahedronGeometry args={[1, 0]} />
          <MeshDistortMaterial
            color="#71eafc"
            speed={3}
            distort={0.2}
            radius={1}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Center glow */}
        <mesh scale={0.3}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color="#6ebbd6" transparent opacity={0.9} />
        </mesh>

        {/* Orbiting particles */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const radius = 1.8;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * radius,
                Math.sin(angle * 2) * 0.3,
                Math.sin(angle) * radius,
              ]}
              scale={0.06}
            >
              <sphereGeometry args={[1, 16, 16]} />
              <meshBasicMaterial color="#71eafc" transparent opacity={0.8} />
            </mesh>
          );
        })}
      </group>
    </Float>
  );
}

export function QubicScene() {
  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#5b8193" />
          <QubicLogo />
        </Suspense>
      </Canvas>
    </div>
  );
}
