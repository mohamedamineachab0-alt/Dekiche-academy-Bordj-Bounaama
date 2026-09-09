'use client'

import { useState, useRef } from 'react'
import { Loader2, Upload } from 'lucide-react'

export function FileUploadForm({ uploadAction }: { uploadAction: (formData: FormData) => Promise<any> }) {
  const [isUploading, setIsUploading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsUploading(true)
    
    const formData = new FormData(e.currentTarget)
    await uploadAction(formData)
    
    formRef.current?.reset()
    setIsUploading(false)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="relative border border-dashed border-line rounded-lg p-10 hover:border-line transition-colors flex flex-col items-center justify-center bg-surface-muted">
        <Upload className="w-10 h-10 text-muted mb-4" />
        <p className="text-sm text-neutral-300 font-medium">Click or drag files to upload</p>
        <p className="text-xs text-muted mt-1">Accepts all file types</p>
        <input 
          type="file" 
          name="files" 
          multiple 
          accept="*/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          required 
        />
      </div>
      <button 
        type="submit" 
        disabled={isUploading}
        className="self-end px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors flex items-center disabled:opacity-50"
      >
        {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        {isUploading ? 'Uploading...' : 'Upload Files'}
      </button>
    </form>
  )
}
