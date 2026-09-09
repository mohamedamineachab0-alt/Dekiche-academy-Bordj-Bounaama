'use client'

import { useState } from 'react'
import { Loader2, Upload } from 'lucide-react'
import { createPublishedLesson } from '@/actions/lesson-actions'
import { Stream } from '@/generated/prisma'

const STREAMS: Stream[] = [
  'COMMON_SCIENCE', 'COMMON_LETTERS', 'EXPERIMENTAL_SCIENCES', 
  'MATHEMATICS', 'TECHNICAL_MATH', 'MANAGEMENT_ECONOMY', 
  'LITERATURE_PHILOSOPHY', 'FOREIGN_LANGUAGES'
]

export function LessonCreationForm({ subjects }: { subjects: { id: string, title: string }[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    await createPublishedLesson(new FormData(e.currentTarget))
    window.location.href = '/dashboard/admin/lessons/new'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl border border-line shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="space-y-4">
        <input name="title" placeholder="Lesson Title" required className="w-full bg-primary-soft border border-line p-3 rounded-xl text-ink font-bold placeholder-muted focus:outline-none focus:ring-4 focus:ring-primary-mid/20" />
        
        <div className="grid grid-cols-2 gap-4">
          <input name="month" type="number" placeholder="Month (e.g. 1)" required className="w-full bg-primary-soft border border-line p-3 rounded-xl text-ink font-bold placeholder-muted focus:outline-none focus:ring-4 focus:ring-primary-mid/20" />
          <input name="vimeoVideoId" placeholder="Vimeo Video ID" required className="w-full bg-primary-soft border border-line p-3 rounded-xl text-ink font-bold placeholder-muted focus:outline-none focus:ring-4 focus:ring-primary-mid/20" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-bold text-ink mb-2 block">Assign Subjects (Multi-Select)</label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-3 bg-primary-soft border border-line rounded-xl">
              {subjects.map(sub => (
                <label key={sub.id} className="flex items-center space-x-3 space-x-reverse text-sm font-bold text-muted hover:text-ink cursor-pointer">
                  <input type="checkbox" name="subjects" value={sub.id} className="w-4 h-4 rounded border-[2px] border-line text-primary focus:ring-primary-mid" />
                  <span>{sub.title}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-ink mb-2 block">Assign Branches/Tracks (Multi-Select)</label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-3 bg-primary-soft border border-line rounded-xl">
              {STREAMS.map(stream => (
                <label key={stream} className="flex items-center space-x-3 space-x-reverse text-sm font-bold text-muted hover:text-ink cursor-pointer">
                  <input type="checkbox" name="streams" value={stream} className="w-4 h-4 rounded border-[2px] border-line text-primary focus:ring-primary-mid" />
                  <span>{stream.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="relative border border-dashed border-line rounded-xl p-8 hover:bg-primary-soft transition-colors flex flex-col items-center justify-center bg-primary-soft group cursor-pointer">
          <Upload className="w-8 h-8 text-ink mb-2" />
          <p className="text-sm font-bold text-ink">Click or Drag unrestricted files here</p>
          <input 
            type="file" 
            name="files" 
            multiple 
            accept="*/*"
            onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          />
        </div>
        
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            {selectedFiles.map((f, i) => (
              <div key={i} className="flex justify-between p-3 bg-white rounded-xl border-[2px] border-line text-sm font-bold text-ink">
                <span>{f.name}</span>
                <span>{(f.size / 1024).toFixed(1)} KB</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-6">
        {isSubmitting ? <Loader2 className="w-5 h-5 ml-2 animate-spin" /> : null}
        Publish Lesson
      </button>
    </form>
  )
}
