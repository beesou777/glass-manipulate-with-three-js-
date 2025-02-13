"use client"
import React, { useEffect, useState, useMemo } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { Center, OrbitControls, PerspectiveCamera, useGLTF } from "@react-three/drei"
import * as THREE from "three"

const normalizeModelSize = (model: THREE.Object3D) => {
  const boundingBox = new THREE.Box3().setFromObject(model)
  const size = new THREE.Vector3()
  boundingBox.getSize(size)

  const maxDim = Math.max(size.x, size.y, size.z)
  const scaleFactor = THREE.MathUtils.clamp(1 / maxDim, 0.5, 3)

  // Apply scaling
  model.scale.set(scaleFactor, scaleFactor, scaleFactor)

  // Center the model
  boundingBox.setFromObject(model)
  const center = new THREE.Vector3()
  boundingBox.getCenter(center)
  model.position.sub(center)
}

const Sidebar = ({
  setActiveComponent,
}: { setActiveComponent: (component: THREE.Object3D) => void }) => {
  const { scene, error } = useGLTF("/assets/3d/glasses4.glb")
  const [components, setComponents] = useState<THREE.Object3D[]>([])

  const componentList = useMemo(() => {
    if (!scene) return []

    const clonedModel = scene.clone()
    normalizeModelSize(clonedModel)

    const newComponents: THREE.Object3D[] = []
    clonedModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        newComponents.push(child)
      }
    })
    return newComponents
  }, [scene])

  useEffect(() => {
    if (componentList.length > 0) {
      setComponents(componentList)
    }
  }, [componentList])

  if (error) {
    console.error("Error loading GLTF model:", error)
    return <div>Model loading failed!</div>
  }

  return (
    <div style={{ width: "250px", height: "80vh", overflowY: "auto" }}>
      {components.map((item, index) => (
        <div key={index} style={{ width: "100%", height: "150px" }}>
          <Canvas onClick={() => setActiveComponent(item)}>
            <CameraSetup model={item} />
            <ambientLight intensity={0.8} />
            <spotLight position={[10, 10, 10]} angle={0.9} intensity={1} />
            <PerspectiveCamera makeDefault position={[0, 5, 5]} fov={40} />
            <OrbitControls enableRotate={false} enableZoom={false} enablePan={false} />
            <Center>
              <primitive object={item}  />
            </Center>
          </Canvas>
        </div>
      ))}
    </div>
  )
}

const CameraSetup = ({ model }: { model: THREE.Object3D }) => {
  const { camera } = useThree()

  useEffect(() => {
    const boundingBox = new THREE.Box3().setFromObject(model)
    const size = new THREE.Vector3()
    boundingBox.getSize(size)

    const maxDim = Math.max(size.x, size.y, size.z)
    const objectRadius = maxDim / 2

    const fovRad = (camera.fov * Math.PI) / 180
    const distance = objectRadius / Math.tan(fovRad / 2) + 1

    camera.position.set(0, 0, distance)
    camera.lookAt(0, 0, 0)
  }, [model, camera])

  return null
}

export default Sidebar
