"use client";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Float, Environment } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { gsap } from "gsap/gsap-core";
import { useGLTF } from "@react-three/drei";

export default function Shapes() {
  return (
    <div className="row-span-1 row-start-1 w-full max-w-full overflow-hidden -mt-9 aspect-square md:col-span-1 md:col-start-2 md:mt-0">
      <Canvas
        className="z-0"
        shadows
        gl={{ antialias: true }} // Enable anti-aliasing
        dpr={[1, 1.5]} // Device pixel ratio for sharper rendering
        camera={{ position: [0, 0, 25], fov: 30, near: 1, far: 40 }}
      >
        <Suspense fallback={null}>
          {/* Background Particles */}
          <BackgroundParticles />
          <Geometries />
          <ContactShadows
            position={[0, -3.5, 0]}
            opacity={0.65}
            scale={40}
            blur={1}
            far={9}
          />
          <Environment preset="apartment" />
        </Suspense>
      </Canvas>
    </div>
  );
}

function BackgroundParticles() {
  const particlesRef = useRef();

  // Number of particles
  const particleCount = 5000; // Increase the number of particles

  // Create particle geometry
  const positions = new Float32Array(particleCount * 3); // XYZ coordinates for each particle
  const colors = new Float32Array(particleCount * 3); // RGB colors for each particle

  // Randomize particle positions and colors
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 200; // X
    positions[i * 3 + 1] = (Math.random() - 0.5) * 200; // Y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 200; // Z

    // Assign random colors
    colors[i * 3] = Math.random(); // R
    colors[i * 3 + 1] = Math.random(); // G
    colors[i * 3 + 2] = Math.random(); // B
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  // Create particle material
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.2, // Particle size
    vertexColors: true, // Enable vertex colors
    transparent: true,
    opacity: 0.8,
  });

  // Animate particles
  useEffect(() => {
    const animateParticles = () => {
      if (particlesRef.current) {
        const positions =
          particlesRef.current.geometry.attributes.position.array;

        // Move particles in a circular motion
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] += Math.sin(Date.now() * 0.001 + i) * 0.01; // X
          positions[i * 3 + 1] += Math.cos(Date.now() * 0.001 + i) * 0.01; // Y
        }

        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      requestAnimationFrame(animateParticles);
    };

    animateParticles();
  }, []);

  return (
    <points
      ref={particlesRef}
      geometry={particleGeometry}
      material={particleMaterial}
    />
  );
}

function Geometries() {
  const geometries = [
    {
      position: [0, 0, 0],
      r: 0.5,
      type: "model2", // New Blender model
    },
    {
      position: [1, -0.75, 4],
      r: 0.4,
      type: "model", // Blender model
    },
    {
      position: [-1.4, 2, -4],
      r: 0.6,
      type: "model", // Blender model (replaces DodecahedronGeometry)
    },
    {
      position: [-0.8, -0.75, 5],
      r: 0.5,
      type: "model2", // New Blender model
    },
    {
      position: [1.6, 1.6, -4],
      r: 0.7,
      type: "model", // Blender model (replaces OctahedronGeometry)
    },
  ];

  const soundEffects = [
    new Audio("/sounds/knock1.ogg"),
    new Audio("/sounds/knock2.ogg"),
    new Audio("/sounds/knock3.ogg"),
  ];

  return (
    <>
      {geometries.map(({ position, r, type }, index) =>
        type === "model" ? (
          <BlenderModel
            key={`blender-model-${index}`} // Unique key
            position={position.map((p) => p * 2)}
            r={r}
            soundEffects={soundEffects}
          />
        ) : type === "model2" ? (
          <BlenderModel2
            key={`blender-model2-${index}`} // Unique key
            position={position.map((p) => p * 2)}
            r={r}
            soundEffects={soundEffects}
          />
        ) : (
          <Geometry
            key={JSON.stringify(position)}
            position={position.map((p) => p * 2)}
            geometry={geometry}
            soundEffects={soundEffects}
            r={r}
          />
        )
      )}
    </>
  );
}

function BlenderModel({ position, r, soundEffects }) {
  const meshRef = useRef();
  const [visible, setVisible] = useState(false);
  const { nodes } = useGLTF("/Phile.glb");

  // Define only light blue, light yellow, and gold materials
  const materials = [
    new THREE.MeshStandardMaterial({ color: 0xadd8e6 }), // Light Blue
    new THREE.MeshStandardMaterial({ color: 0xffffe0 }), // Light Yellow
    new THREE.MeshStandardMaterial({ color: 0xffd700 }), // Gold
  ];

  const [currentMaterialIndex, setCurrentMaterialIndex] = useState(0);

  function handleClick(e) {
    const mesh = e.object;

    gsap.utils.random(soundEffects).play();

    gsap.to(mesh.rotation, {
      x: `+=${gsap.utils.random(0, 2)}`,
      y: `+=${gsap.utils.random(0, 2)}`,
      z: `+=${gsap.utils.random(0, 2)}`,
      duration: 1.3,
      ease: "elastic.out(1,0.3)",
      yoyo: true,
    });

    // Cycle through light blue, light yellow, and gold
    setCurrentMaterialIndex((prevIndex) => (prevIndex + 1) % materials.length);
    mesh.material = materials[currentMaterialIndex];
  }

  const handlePointerOver = () => {
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    document.body.style.cursor = "default";
  };

  useEffect(() => {
    let ctx = gsap.context(() => {
      setVisible(true);
      gsap.from(meshRef.current.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: gsap.utils.random(0.8, 1.2),
        ease: "elastic.out(1,0.3)",
        delay: gsap.utils.random(0, 0.5),
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <group position={position} ref={meshRef}>
      <Float speed={5 * r} rotationIntensity={6 * r} floatIntensity={5 * r}>
        <mesh
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          visible={visible}
          castShadow
          receiveShadow
          geometry={nodes.Circle011.geometry}
          material={materials[currentMaterialIndex]} // Use the current material
          rotation={[Math.PI / 2, 0, 0]}
        ></mesh>
      </Float>
    </group>
  );
}

function BlenderModel2({ position, r, soundEffects }) {
  const meshRef = useRef();
  const [visible, setVisible] = useState(false);
  const { nodes } = useGLTF("/Phile2.glb");

  // Define only white and red materials
  const materials = [
    new THREE.MeshStandardMaterial({ color: 0xffffff }), // White
    new THREE.MeshStandardMaterial({ color: 0xff0000 }), // Red
  ];

  const [currentMaterialIndex, setCurrentMaterialIndex] = useState(0);

  function handleClick(e) {
    const mesh = e.object;

    gsap.utils.random(soundEffects).play();

    gsap.to(mesh.rotation, {
      x: `+=${gsap.utils.random(0, 2)}`,
      y: `+=${gsap.utils.random(0, 2)}`,
      z: `+=${gsap.utils.random(0, 2)}`,
      duration: 1.3,
      ease: "elastic.out(1,0.3)",
      yoyo: true,
    });

    // Toggle between white and red
    setCurrentMaterialIndex((prevIndex) => (prevIndex === 0 ? 1 : 0));
    mesh.material = materials[currentMaterialIndex === 0 ? 1 : 0];
  }

  const handlePointerOver = () => {
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    document.body.style.cursor = "default";
  };

  useEffect(() => {
    let ctx = gsap.context(() => {
      setVisible(true);
      gsap.from(meshRef.current.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: gsap.utils.random(0.8, 1.2),
        ease: "elastic.out(1,0.3)",
        delay: gsap.utils.random(0, 0.5),
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <group position={position} ref={meshRef}>
      <Float speed={5 * r} rotationIntensity={6 * r} floatIntensity={5 * r}>
        <mesh
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          visible={visible}
          castShadow
          receiveShadow
          geometry={nodes.Cylinder005.geometry}
          material={materials[currentMaterialIndex]} // Use the current material
          scale={[0.832, 0.302, 0.832]}
        ></mesh>
      </Float>
    </group>
  );
}

function Geometry({ r, position, geometry, soundEffects }) {
  const meshRef = useRef();
  const [visible, setVisible] = useState(false);

  const materials = [
    new THREE.MeshStandardMaterial({ color: 0xadd8e6 }), // Light Blue
    new THREE.MeshStandardMaterial({ color: 0xffffe0 }), // Light Yellow
    new THREE.MeshStandardMaterial({ color: 0xffd700 }), // Gold
  ];

  const [currentMaterialIndex, setCurrentMaterialIndex] = useState(0);

  function handleClick(e) {
    const mesh = e.object;

    gsap.utils.random(soundEffects).play();

    gsap.to(mesh.rotation, {
      x: `+=${gsap.utils.random(0, 2)}`,
      y: `+=${gsap.utils.random(0, 2)}`,
      z: `+=${gsap.utils.random(0, 2)}`,
      duration: 1.3,
      ease: "elastic.out(1,0.3)",
      yoyo: true,
    });

    // Cycle through light blue, light yellow, and gold
    setCurrentMaterialIndex((prevIndex) => (prevIndex + 1) % materials.length);
    mesh.material = materials[currentMaterialIndex];
  }

  const handlePointerOver = () => {
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    document.body.style.cursor = "default";
  };

  useEffect(() => {
    let ctx = gsap.context(() => {
      setVisible(true);
      gsap.from(meshRef.current.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: gsap.utils.random(0.8, 1.2),
        ease: "elastic.out(1,0.3)",
        delay: gsap.utils.random(0, 0.5),
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <group position={position} ref={meshRef}>
      <Float speed={5 * r} rotationIntensity={6 * r} floatIntensity={5 * r}>
        <mesh
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          visible={visible}
          castShadow
          receiveShadow
          geometry={geometry}
          material={materials[currentMaterialIndex]} // Use the current material
        ></mesh>
      </Float>
    </group>
  );
}

useGLTF.preload("/Phile.glb");
useGLTF.preload("/Phile2.glb");
