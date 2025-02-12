"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Center, useGLTF } from "@react-three/drei"
import * as THREE from "three"
import type { GLTF } from "three-stdlib"

type GLTFResult = GLTF & {
  nodes: {
    [key: string]: THREE.Mesh
  }
  materials: {
    [key: string]: THREE.Material
  }
}

const GLASSES_WIDTH = 5
const GLASSES_SCALE = GLASSES_WIDTH / 2

interface GlassesProps {
  activeColor: string
  frameWidth: number
  frameHeight: number
  frameDepth: number
  frameName: string
  onFrameNameChange: (frameName: string) => void
  setModelComponents: (components: THREE.Object3D[]) => void
  setActiveModel: (model: THREE.Object3D) => void
  activeModel: THREE.Object3D | null
  modelComponents: THREE.Object3D[]
  onLoad: () => void
  useBasicMaterial: boolean
}

export default function Glasses({
  activeColor,
  frameWidth,
  frameHeight,
  frameDepth,
  frameName,
  onFrameNameChange,
  setModelComponents,
  setActiveModel,
  activeModel,
  modelComponents,
  onLoad,
  useBasicMaterial,
  ...props
}: GlassesProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [model, setModel] = useState<THREE.Group | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { scene } = useGLTF("/assets/3d/glasses4.glb") as GLTFResult

  useEffect(() => {
    const loadModel = async () => {
      try {
        await useGLTF.preload("/assets/3d/glasses4.glb")
        onLoad()
      } catch (err) {
        console.error("Error preloading glasses model:", err)
        setError("Failed to preload glasses model: " + (err instanceof Error ? err.message : "Unknown error"))
      }
    }
    loadModel()
  }, [onLoad])

  useEffect(() => {
    if (scene) {
      try {
        const clonedScene = scene.clone()
        clonedScene.scale.set(GLASSES_SCALE, GLASSES_SCALE, GLASSES_SCALE)
        const box = new THREE.Box3().setFromObject(clonedScene)
        const size = box.getSize(new THREE.Vector3())
        const scaleFactor = GLASSES_WIDTH / size.x

        clonedScene.scale.multiplyScalar(scaleFactor)
        setModel(clonedScene)

        const components: THREE.Object3D[] = []
        clonedScene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.userData.originalScale = child.scale.clone()
            child.userData.originalMaterial = child.material.clone()
            child.userData.currentScale = child.scale.clone()
            child.userData.currentColor = "#FFFFFF"
            if (child.name === "Object_4") {
              child.material = new THREE.MeshPhysicalMaterial({
                opacity: 0.9,
                transparent: true,
                transmission: 0.2,
                metalness: 0.0,
                roughness: 0.1,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
              });
            }
            components.push(child)
          }
        })
        setModelComponents(components)

        console.log("Glasses model cloned and scaled successfully")
      } catch (err) {
        console.error("Error processing glasses model:", err)
        setError("Failed to process glasses model: " + (err instanceof Error ? err.message : "Unknown error"))
      }
    }
  }, [scene, setModelComponents])

  const updateActiveModel = useCallback(() => {
    if (activeModel && activeModel instanceof THREE.Mesh) {
      const newScale = new THREE.Vector3(frameWidth, frameHeight, frameDepth)

      activeModel.scale.copy(newScale)
      activeModel.userData.currentScale = newScale.clone()

      activeModel.geometry.computeBoundingBox()
      activeModel.geometry.computeBoundingSphere()

      const material = activeModel.material as THREE.MeshStandardMaterial
    }
  }, [activeModel, frameWidth, frameHeight, frameDepth])

  useEffect(() => {
    updateActiveModel()
  }, [updateActiveModel])

  useEffect(() => {
    if (activeModel instanceof THREE.Mesh) {
      if (activeModel.name === "Object_4") {
        const glassMaterial = new THREE.MeshPhysicalMaterial({
          color: activeColor,              // Base color
          emissive: activeColor,           // Emissive color (if desired)
          opacity: 0.9,                    // 90% opaque
          transparent: true,               // Enable transparency
          transmission: 0.2,               // Adjust for glass-like light transmission
          metalness: 0.0,
          roughness: 0.1,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          // Optionally add envMap, etc.
        });

        activeModel.material = glassMaterial;
        activeModel.userData.currentColor = activeColor;
      } else {
        // Otherwise, continue using the previous MeshStandardMaterial behavior.
        const material = activeModel.material as THREE.MeshStandardMaterial;
        material.color.setStyle(activeColor);
        material.emissive.setStyle(activeColor);
        // If these objects are not intended to be glass, no need to adjust opacity/transparency.
        activeModel.userData.currentColor = activeColor;
      }
    }
  }, [activeColor]);


  const updateDesign = useCallback(
    (component: THREE.Object3D) => {
      if (component instanceof THREE.Mesh) {
        onFrameNameChange(component.name)
        setActiveModel(component)
      }
    },
    [onFrameNameChange, setActiveModel],
  )

  if (error) {
    return (
      <Center>
        <mesh {...props}>
          <boxGeometry args={[0.1, 0.05, 0.02]} />
          <meshBasicMaterial color={activeColor} />
        </mesh>
      </Center>
    )
  }

  if (!modelComponents.length) {
    return null
  }

  return (
    <Center>
      {modelComponents.map((component, index) => (
        <primitive onClick={() => updateDesign(component)} key={index} object={component} ref={groupRef} {...props} />
      ))}
    </Center>
  )
}

