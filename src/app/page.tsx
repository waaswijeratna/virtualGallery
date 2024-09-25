"use client"; // This marks the component as a Client Component

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader, FirstPersonControls } from 'three-stdlib'; // Import GLTFLoader and FirstPersonControls from three-stdlib

export default function Home() {
  const mountRef = useRef<HTMLDivElement>(null); // Reference to the DOM element

  useEffect(() => {
    // Step 1: Scene
    const scene = new THREE.Scene();

    // Step 2: Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5; // Move the camera away from the model

    // Step 3: Renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth , window.innerHeight ); // Set size to 80vw and 60vh

    if (mountRef.current) {  // Ensure that mountRef.current is not null
      mountRef.current.appendChild(renderer.domElement); // Add the renderer to the page
    }

    // Step 4: First-Person Controls (Move around like in FPS games)
    const controls = new FirstPersonControls(camera, renderer.domElement);
    controls.lookSpeed = 0.001; // Base speed of looking around
    controls.movementSpeed = 2; // Speed of movement
    controls.lookVertical = true; // Enable vertical camera movement
    controls.constrainVertical = true; // Constrain vertical rotation
    controls.verticalMin = 1.0; // Lower vertical limit (in radians)
    controls.verticalMax = 2.0; // Upper vertical limit (in radians)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // Soft white ambient light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // Bright directional light
    directionalLight.position.set(5, 10, 7.5); // Set the light position
    scene.add(directionalLight);

    const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
    scene.add(lightHelper);

    // Load the GLTF model using GLTFLoader
    const loader = new GLTFLoader();

    loader.load('/assets/threeD/vr_gallery/scene.gltf', (gltf) => {
      const model = gltf.scene;
      scene.add(model);
      model.position.set(0, 0, 0); // Set model position
      model.scale.set(1, 1, 1); // Set model scale

      

    },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.error('An error happened while loading the model', error);
      });

    // Mouse control
    let mouseX = 0, mouseY = 0;
    const windowCenterX = window.innerWidth / 2;
    const windowCenterY = window.innerHeight / 2;

    const onMouseMove = (event: { clientX: number; clientY: number; }) => {
      mouseX = event.clientX - windowCenterX;
      mouseY = event.clientY - windowCenterY;
    };

    window.addEventListener('mousemove', onMouseMove);

    const threshold = 200; // Define how close to the center the mouse needs to be for no movement

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Adjust the look speed based on mouse distance from the center
      const distanceFromCenterX = Math.abs(mouseX) / windowCenterX;
      const distanceFromCenterY = Math.abs(mouseY) / windowCenterY;
      const distanceFactor = Math.max(distanceFromCenterX, distanceFromCenterY);

      if (distanceFactor < threshold / window.innerWidth) {
        controls.lookSpeed = 0; // Stop movement near the center
      } else {
        // More gradual increase in speed towards the edges, using a quadratic scale for smoothness
        controls.lookSpeed = 0.01 * Math.pow(distanceFactor, 2);
      }

      controls.update(0.1); // Update controls
      renderer.render(scene, camera); // Render scene
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="canvasScene">
    <div className="testt"></div>
      <div ref={mountRef} className="h-[60vh] w-[80vw]" />
    </div>
  );
}
