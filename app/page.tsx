"use client"

import { useEffect, useState } from "react"

type GlassDesign = {
  frameColor: string;
  lensColor: string;
}
import { ThemeProvider } from "next-themes"
import GlassCustomizer from "../components/GlassCustomizer"
import ModelSidebar from "@/components/SidebarComponent";
import { Canvas, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { Center, OrbitControls, PerspectiveCamera, PivotControls } from "@react-three/drei"

export default function Home() {
  const [activeComponent, setActiveComponent] = useState<THREE.Object3D | null>(null);
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-gray-200 text-foreground">
        <main className="flex mx-auto px-4 py-8">
          <div className="flex-[0_0_25%] bg-white">
            <ModelSidebar
              setActiveComponent={setActiveComponent}
            />
          </div>
          <div className="flex-[0_0_50%] bg-white">
            <Canvas>
              <ambientLight intensity={0.8} />
              <spotLight position={[10, 10, 10]} angle={0.9} intensity={1} />
              <PerspectiveCamera makeDefault position={[0, 5, 0]} fov={50} />
              <OrbitControls enableRotate={false} enableZoom={true} enablePan={false} />
              <Center>
                {activeComponent && (
                  <PivotControls
                    anchor={[0, 0, 0]} // Adjust the pivot point here
                    depthTest={false} // Keeps the pivot visible
                    lineWidth={2}
                  >
                    <primitive object={activeComponent.clone()} />
                  </PivotControls>
                )}
              </Center>
            </Canvas>
          </div>
          {/* <div className="flex-[0_0_80%]">
          <GlassCustomizer
          />
          +
          </div> */}
        </main>
      </div>
    </ThemeProvider>
  )
}

