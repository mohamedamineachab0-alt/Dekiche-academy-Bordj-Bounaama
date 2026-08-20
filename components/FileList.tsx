import { Download, Eye } from 'lucide-react'

export function FileList({ files }: { files: any[] }) {
  if (files.length === 0) {
    return (
      <div className="text-center p-8 border border-neutral-800 rounded-lg text-neutral-500 bg-neutral-900/50">
        No files uploaded yet.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {files.map((file) => (
        <div key={file.id} className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors">
          <div className="overflow-hidden mr-4">
            <p className="text-sm font-medium text-neutral-200 truncate" title={file.originalName}>
              {file.originalName}
            </p>
            <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wider">
              {(file.size / 1024).toFixed(1)} KB • {file.mimeType.split('/')[1] || file.mimeType}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {/* View Preview */}
            <a 
              href={`/api/files/${file.id}?preview=true`} 
              target="_blank" 
              rel="noreferrer"
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
              title="Preview"
            >
              <Eye className="w-4 h-4" />
            </a>
            {/* Direct Download */}
            <a 
              href={`/api/files/${file.id}`} 
              download
              className="p-2 text-neutral-400 hover:text-purple-400 hover:bg-purple-900/20 rounded-md transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}
