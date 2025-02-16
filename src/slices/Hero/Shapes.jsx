"use client";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Float, Environment } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { gsap } from "gsap/gsap-core";
import { useGLTF } from "@react-three/drei";

export default function Shapes() {
  return (
    <div className="row-span-1 row-start-1 -mt-9 aspect-square md:col-span-1 md:col-start-2 md:mt-0">
      <Canvas
        className="z-0"
        shadows
        gl={{ antialias: true }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 25], fov: 30, near: 1, far: 40 }}
      >
        <Suspense fallback={null}>
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
  const particleCount = 5000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

    colors[i * 3] = Math.random();
    colors[i * 3 + 1] = Math.random();
    colors[i * 3 + 2] = Math.random();
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
  });

  useEffect(() => {
    const animateParticles = () => {
      if (particlesRef.current) {
        const positions =
          particlesRef.current.geometry.attributes.position.array;

        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] += Math.sin(Date.now() * 0.001 + i) * 0.01;
          positions[i * 3 + 1] += Math.cos(Date.now() * 0.001 + i) * 0.01;
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
      type: "model2",
      scale: [1.5, 0.4, 1.5], // Default scale for model2
    },
    {
      position: [1, -0.75, 4],
      r: 0.4,
      type: "model",
      scale: [1.0, 1.0, 1.0], // Larger scale for this model
    },
    {
      position: [-1.4, 2, -4],
      r: 0.6,
      type: "model",
      scale: [1.5, 1.5, 1.5], // Smaller scale for this model
    },
    {
      position: [-0.8, -0.75, 5],
      r: 0.5,
      type: "model2",
      scale: [1.2, 0.4, 1.2], // Slightly larger scale for this model2
    },
    {
      position: [1.6, 1.6, -4],
      r: 0.7,
      type: "model",
      scale: [1.5, 1.5, 1.5], // Much larger scale for this model
    },
  ];

  const soundEffects = [
    new Audio("/sounds/knock1.ogg"),
    new Audio("/sounds/knock2.ogg"),
    new Audio("/sounds/knock3.ogg"),
  ];

  // Track the number of BlenderModel components rendered
  let blenderModelCount = 0;

  return (
    <>
      {geometries.map(({ position, r, type, scale }, index) => {
        if (type === "model") {
          // Assign initialColorIndex based on BlenderModel count (0, 1, 2)
          const initialColorIndex = blenderModelCount % 3;
          blenderModelCount++;

          return (
            <BlenderModel
              key={`blender-model-${index}`}
              position={position.map((p) => p * 2)}
              r={r}
              soundEffects={soundEffects}
              initialColorIndex={initialColorIndex} // Assign unique color index
              scale={scale} // Pass the scale prop
            />
          );
        } else if (type === "model2") {
          return (
            <BlenderModel2
              key={`blender-model2-${index}`}
              position={position.map((p) => p * 2)}
              r={r}
              soundEffects={soundEffects}
              initialColorIndex={index % 2} // Assign unique color index for model2
              scale={scale} // Pass the scale prop
            />
          );
        } else {
          return null;
        }
      })}
    </>
  );
}

function BlenderModel({ position, r, soundEffects, initialColorIndex, scale }) {
  const meshRef = useRef();
  const [visible, setVisible] = useState(false);
  const { nodes } = useGLTF("/Phile.glb");

  // Define 3 distinct materials
  const materials = [
    new THREE.MeshStandardMaterial({ color: 0x38bdf8 }), // Light Blue
    new THREE.MeshStandardMaterial({ color: 0xfacc15 }), // Brown
    new THREE.MeshStandardMaterial({ color: 0xca8a04 }), // Gold
  ];

  // Use the initialColorIndex to set the starting color
  const [currentMaterialIndex, setCurrentMaterialIndex] =
    useState(initialColorIndex);

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

    // Cycle through the 3 colors
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
          scale={scale} // Apply the scale prop
        ></mesh>
      </Float>
    </group>
  );
}

function BlenderModel2({
  position,
  r,
  soundEffects,
  initialColorIndex,
  scale,
}) {
  const meshRef = useRef();
  const [visible, setVisible] = useState(false);
  const { nodes } = useGLTF("/Phile2.glb");

  // Define 2 distinct materials
  const materials = [
    new THREE.MeshStandardMaterial({ color: 0xffffff }), // White
    new THREE.MeshStandardMaterial({ color: 0xff0000 }), // Red
  ];

  // Use the initialColorIndex to set the starting color
  const [currentMaterialIndex, setCurrentMaterialIndex] =
    useState(initialColorIndex);

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

    // Toggle between the 2 colors
    setCurrentMaterialIndex((prevIndex) => (prevIndex === 0 ? 1 : 0));
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
          geometry={nodes.Cylinder005.geometry}
          material={materials[currentMaterialIndex]} // Use the current material
          scale={scale} // Apply the scale prop
        ></mesh>
      </Float>
    </group>
  );
}

useGLTF.preload("/Phile.glb");
useGLTF.preload("/Phile2.glb");
