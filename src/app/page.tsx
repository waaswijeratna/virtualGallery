"use client";//use this

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader, FirstPersonControls } from 'three-stdlib';
import GUI from 'lil-gui';

export default function Home() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    const loader = new GLTFLoader();
    let galleryModel: THREE.Object3D;
    let camera: THREE.PerspectiveCamera | null = null;

    loader.load('/assets/threeD/test5/scene.gltf', (gltf) => {
      const model = gltf.scene;
      galleryModel = model;
      scene.add(model);

      if (gltf.cameras && gltf.cameras.length > 0) {
        camera = gltf.cameras[0] as THREE.PerspectiveCamera;
      }

      if (camera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        // Set the camera height to 1.6
        camera.position.y = 1.6;

        const box = new THREE.Box3().setFromObject(model);
        const minY = box.min.y;
        model.position.set(0, -minY, 0);
        model.scale.set(1, 1, 1);

        const controls = new FirstPersonControls(camera, renderer.domElement);
        controls.lookSpeed = 0.003;
        controls.movementSpeed = 0.4;
        controls.lookVertical = true;
        controls.constrainVertical = true;
        controls.verticalMin = 1.0;
        controls.verticalMax = 2.0;

        const gui = new GUI();
        const cameraFolder = gui.addFolder('Camera');

        const cameraPositionX = cameraFolder.add(camera.position, 'x', -100, 100, 0.01).name('Position X');
        const cameraPositionY = cameraFolder.add(camera.position, 'y', -100, 100, 0.01).name('Position Y');
        const cameraPositionZ = cameraFolder.add(camera.position, 'z', -100, 100, 0.01).name('Position Z');

        const cameraRotationX = cameraFolder.add(camera.rotation, 'x', -Math.PI, Math.PI, 0.01).name('Rotation X');
        const cameraRotationY = cameraFolder.add(camera.rotation, 'y', -Math.PI, Math.PI, 0.01).name('Rotation Y');
        const cameraRotationZ = cameraFolder.add(camera.rotation, 'z', -Math.PI, Math.PI, 0.01).name('Rotation Z');

        cameraFolder.open();

        const raycaster = new THREE.Raycaster();
        const moveDirection = new THREE.Vector3();

        const checkCollision = () => {
          const directions = [
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(0, 0, -1)
          ];

          for (const direction of directions) {
            raycaster.set(camera!.position, direction);
            const intersects = raycaster.intersectObjects(scene.children, true);
            if (intersects.length > 0 && intersects[0].distance < 0.5) {
              moveDirection.copy(direction).negate();
              camera!.position.add(moveDirection.multiplyScalar(0.1));
            }
          }
        };

        const animate = () => {
          requestAnimationFrame(animate);

          controls.update(0.1);
          checkCollision();

          // Keep the camera height fixed at 1.6
          if (camera) {
            camera.position.y = 1.6;
          }

          cameraPositionX.updateDisplay();
          cameraPositionY.updateDisplay();
          cameraPositionZ.updateDisplay();
          cameraRotationX.updateDisplay();
          cameraRotationY.updateDisplay();
          cameraRotationZ.updateDisplay();

          renderer.render(scene, camera!);
        };

        animate();
      }
    },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.error('An error happened while loading the model', error);
      });

    return () => {
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