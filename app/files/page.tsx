import { uploadFiles, getFiles } from '@/actions/file-actions'
import { FileUploadForm } from '@/components/FileUploadForm'
import { FileList } from '@/components/FileList'

export default async function FilesPage() {
  const files = await getFiles()

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">File Management</h1>
          <p className="text-neutral-400 mt-2">Upload and manage system files.</p>
        </div>
        
        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
          <FileUploadForm uploadAction={uploadFiles} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Recent Files</h2>
          <FileList files={files} />
        </div>
      </div>
    </div>
  )
}
