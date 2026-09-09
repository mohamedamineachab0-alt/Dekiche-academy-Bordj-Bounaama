import { uploadFiles, getFiles } from '@/actions/file-actions'
import { FileUploadForm } from '@/components/FileUploadForm'
import { FileList } from '@/components/FileList'

export default async function FilesPage() {
  const files = await getFiles()

  return (
    <div className="min-h-screen bg-surface text-ink p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">File Management</h1>
          <p className="text-muted mt-2">Upload and manage system files.</p>
        </div>
        
        <div className="p-6 bg-surface border border-line rounded-xl">
          <FileUploadForm uploadAction={uploadFiles} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-ink">Recent Files</h2>
          <FileList files={files} />
        </div>
      </div>
    </div>
  )
}
