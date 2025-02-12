import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  views: {
    front: string
    back: string
    left: string
    right: string
    topFront: string
    topBack: string
  }
  onDownload: () => void
}

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, views, onDownload }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1450px] max-h-[90vh] overflow-auto mx-auto">
        <DialogHeader>
          <DialogTitle>Preview</DialogTitle>
          <DialogDescription>Review your customized glasses before downloading</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 ">
          {Object.entries(views).map(([key, value]) => (
            <div key={key}>
              <h3 className="mb-2 text-center capitalize">{key.replace(/([A-Z])/g, " $1").trim()} View</h3>
              <div className="aspect-square h-[600px] w-full">
              <Image height={500} width={500} src={value || ""} alt={`${key} View`} className="aspect-square h-[600px] w-full object-cover" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={onDownload}>Download PDF</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PreviewModal

