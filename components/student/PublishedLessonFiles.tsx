import { Download, Eye } from 'lucide-react'

type LessonMaterial = { id: string, title: string, fileUrl: string }

export function PublishedLessonFiles({ materials }: { materials: LessonMaterial[] }) {
  if (!materials?.length) return null

  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-lg font-black text-black tracking-tight">الملحقات المرفقة</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map((material) => (
          <div key={material.id} className="flex items-center justify-between p-4 bg-white border-[3px] border-black rounded-xl hover:bg-[#FACC15]/20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
            <span className="text-sm font-bold text-black truncate pr-4">{material.title}</span>
            <div className="flex gap-2 shrink-0">
              {/* Trigger inline View/Preview */}
              <a 
                href={`${material.fileUrl}?preview=true`} 
                target="_blank" 
                rel="noreferrer"
                className="p-2 text-black hover:bg-black hover:text-white rounded-lg border-[2px] border-black transition-colors shadow-sm"
                title="View File"
              >
                <Eye className="w-4 h-4" />
              </a>
              {/* Force Attachment Download */}
              <a 
                href={material.fileUrl} 
                download
                className="p-2 text-black hover:bg-purple-600 hover:text-white rounded-lg border-[2px] border-black transition-colors shadow-sm"
                title="Download File"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
