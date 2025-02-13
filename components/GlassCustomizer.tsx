"use client"

import { useState, useRef, useCallback, useMemo, useEffect } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import Glasses from "./Glasses"
import PreviewModal from "./PreviewModel"
import { ErrorBoundary } from "react-error-boundary"
import * as THREE from "three"
import jsPDF from "jspdf"

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="text-red-500 p-4 bg-red-100 rounded-lg">
      <p className="font-bold">Something went wrong:</p>
      <pre className="mt-2 text-sm">{error.message}</pre>
      <Button onClick={resetErrorBoundary} className="mt-4">
        Try again
      </Button>
    </div>
  )
}

function SceneCapture({ onCapture }) {
  const { scene, camera, gl } = useThree()

  useEffect(() => {
    onCapture({ scene, camera, gl })
  }, [scene, camera, gl, onCapture])

  return null
}



export default function GlassCustomizer() {
  const [activeColor, setActiveColor] = useState("#FFFFFF")
  const [frameWidth, setFrameWidth] = useState(1)
  const [frameHeight, setFrameHeight] = useState(1)
  const [frameDepth, setFrameDepth] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [frameName, setFrameName] = useState("frame")
  const [modelComponents, setModelComponents] = useState<THREE.Object3D[]>([])
  const [activeModel, setActiveModel] = useState<THREE.Object3D | null>(null)
  const [useBasicMaterial, setUseBasicMaterial] = useState(true)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [views, setViews] = useState({
    front: "",
    back: "",
    left: "",
    right: "",
    topFront: "",
    topBack: "",
  })

  const canvasRef = useRef(null)
  const sceneRef = useRef<{ scene: THREE.Scene; camera: THREE.Camera; gl: THREE.WebGLRenderer } | null>(null)

  const handleActiveModelChange = useCallback((model: THREE.Object3D) => {
    setActiveModel(model)
    if (model instanceof THREE.Mesh) {
      const scale = model.scale
      setFrameWidth(scale.x)
      setFrameHeight(scale.y)
      setFrameDepth(scale.z)
      setTempleLength(model.name.toLowerCase().includes("temple") ? scale.z : 1)
      if (model.userData.currentColor) {
        setActiveColor(model.userData.currentColor)
      }
    }
  }, [])

  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setActiveColor(e.target.value)
  }, [])


  const captureView = useCallback((position: THREE.Vector3, lookAt: THREE.Vector3) => {
    if (sceneRef.current) {
      const { scene, camera, gl } = sceneRef.current
      camera.position.copy(position)
      camera.lookAt(lookAt)
      gl.render(scene, camera)
      return gl.domElement.toDataURL()
    }
    return ""
  }, [])

  const handlePreview = useCallback(() => {
    const newViews = {
      front: captureView(new THREE.Vector3(0, 4, 0), new THREE.Vector3(0, 0, 0)),
      back: captureView(new THREE.Vector3(0, -4, 0), new THREE.Vector3(0, 0, 0)),
      left: captureView(new THREE.Vector3(-7, 0, 0), new THREE.Vector3(0, 0, 0)),
      right: captureView(new THREE.Vector3(7, 0, 0), new THREE.Vector3(0, 0, 0)),
      topFront: captureView(new THREE.Vector3(0, 0, 4), new THREE.Vector3(0, 0, 0)),
      topBack: captureView(new THREE.Vector3(0, 0, -4), new THREE.Vector3(0, 0, 0)),
    }
    setViews(newViews)
    setIsPreviewOpen(true)
  }, [captureView])

  const handleDownload = useCallback(() => {
    const pdf = new jsPDF("p", "mm", "a4"); // A4 size (210mm x 297mm)

    const addViewToPDF = (view) => {
      const pageWidth = 210;
      const pageHeight = 297;
      pdf.addImage(view, "PNG", 0, 0, pageWidth, pageHeight); // Fill the entire page
      pdf.addPage();
    };

    const viewsArray = [
      views.front,
      views.back,
      views.left,
      views.right,
      views.topFront,
      views.topBack,
    ];

    viewsArray.forEach((view) => {
      addViewToPDF(view);
    });

    pdf.deletePage(pdf.getNumberOfPages()); // Remove extra empty page
    pdf.save("custom-glasses.pdf");
    setIsPreviewOpen(false);
  }, [views]);

  const handleInputChange = useCallback(
    (setter: (value: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseFloat(e.target.value)
      if (!isNaN(value)) {
        setter(value)
      }
    },
    [],
  )

  const memoizedGlasses = useMemo(
    () => (
      <Glasses
        activeColor={activeColor}
        frameWidth={frameWidth}
        frameHeight={frameHeight}
        frameDepth={frameDepth}
        frameName={frameName}
        modelComponents={modelComponents}
        setModelComponents={setModelComponents}
        onFrameNameChange={setFrameName}
        setActiveModel={handleActiveModelChange}
        activeModel={activeModel}
        onLoad={() => setIsLoading(false)}
        useBasicMaterial={useBasicMaterial}
      />
    ),
    [
      activeColor,
      frameWidth,
      frameHeight,
      frameDepth,
      frameName,
      modelComponents,
      handleActiveModelChange,
      activeModel,
      useBasicMaterial,
    ],
  )

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 bg-gray-100 dark:bg-gray-800">
      <div className="w-full lg:w-2/3 h-[400px] lg:h-[600px] relative bg-white dark:bg-gray-700 rounded-lg shadow-lg">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded-lg">
            <div className="text-center text-gray-600 dark:text-gray-300">Loading 3D model...</div>
          </div>
        )}
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => {
            setActiveColor("#FFFFFF")
            setFrameWidth(1)
            setFrameHeight(1)
            setFrameDepth(1)
            setIsLoading(true)
          }}
        >
          <Canvas ref={canvasRef}>
            <SceneCapture onCapture={(sceneData) => (sceneRef.current = sceneData)} />
            <PerspectiveCamera makeDefault position={[0, 4, 0]} />
            <OrbitControls />
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            {memoizedGlasses}
          </Canvas>
        </ErrorBoundary>
      </div>
      <div className="w-full lg:w-1/3 space-y-6 bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
        <div>
          <Label htmlFor="color">Color</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Input
              id="color"
              type="color"
              value={activeColor}
              onChange={handleColorChange}
              className="w-12 h-12 p-1 rounded-md"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="use-basic-material" checked={useBasicMaterial} onCheckedChange={setUseBasicMaterial} />
          <Label htmlFor="use-basic-material">Use Basic Material</Label>
        </div>
        <div>
          <Label htmlFor="width">Width</Label>
          <Input
            id="width"
            type="number"
            value={frameWidth}
            onChange={handleInputChange(setFrameWidth)}
            step="0.01"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="height">Depth</Label>
          <Input
            id="height"
            type="number"
            value={frameHeight}
            onChange={handleInputChange(setFrameHeight)}
            step="0.01"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="depth">Height</Label>
          <Input
            id="depth"
            type="number"
            value={frameDepth}
            onChange={handleInputChange(setFrameDepth)}
            step="0.01"
            className="mt-2"
          />
        </div>
        <div>
          <Label>Select Component</Label>
          <select
            className="mt-2 p-2 rounded-md shadow-sm border border-input bg-background text-foreground w-full"
            value={activeModel?.name || ""}
            onChange={(e) => {
              const selected = modelComponents.find((c) => c.name === e.target.value)
              if (selected) {
                setFrameName(selected.name)
                handleActiveModelChange(selected)
              }
            }}
          >
            <option value="">None</option>
            {modelComponents.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={handlePreview} className="w-full">
          Preview and Download
        </Button>
      </div>
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        views={views}
        onDownload={handleDownload}
      />
    </div>
  )
}

