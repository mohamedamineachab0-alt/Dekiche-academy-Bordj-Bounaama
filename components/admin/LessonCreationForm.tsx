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
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-3xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="space-y-4">
        <input name="title" placeholder="Lesson Title" required className="w-full bg-[#F8F9FA] border-[3px] border-black p-3 rounded-xl text-black font-bold placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-600/20" />
        
        <div className="grid grid-cols-2 gap-4">
          <input name="month" type="number" placeholder="Month (e.g. 1)" required className="w-full bg-[#F8F9FA] border-[3px] border-black p-3 rounded-xl text-black font-bold placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-600/20" />
          <input name="vimeoVideoId" placeholder="Vimeo Video ID" required className="w-full bg-[#F8F9FA] border-[3px] border-black p-3 rounded-xl text-black font-bold placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-600/20" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-black text-black mb-2 block">Assign Subjects (Multi-Select)</label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-3 bg-[#F8F9FA] border-[3px] border-black rounded-xl">
              {subjects.map(sub => (
                <label key={sub.id} className="flex items-center space-x-3 space-x-reverse text-sm font-bold text-gray-700 hover:text-black cursor-pointer">
                  <input type="checkbox" name="subjects" value={sub.id} className="w-4 h-4 rounded border-[2px] border-black text-purple-600 focus:ring-purple-600" />
                  <span>{sub.title}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-black text-black mb-2 block">Assign Branches/Tracks (Multi-Select)</label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-3 bg-[#F8F9FA] border-[3px] border-black rounded-xl">
              {STREAMS.map(stream => (
                <label key={stream} className="flex items-center space-x-3 space-x-reverse text-sm font-bold text-gray-700 hover:text-black cursor-pointer">
                  <input type="checkbox" name="streams" value={stream} className="w-4 h-4 rounded border-[2px] border-black text-purple-600 focus:ring-purple-600" />
                  <span>{stream.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="relative border-[3px] border-dashed border-black rounded-xl p-8 hover:bg-purple-50 transition-colors flex flex-col items-center justify-center bg-[#F8F9FA] group cursor-pointer">
          <Upload className="w-8 h-8 text-black mb-2" />
          <p className="text-sm font-black text-black">Click or Drag unrestricted files here</p>
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
              <div key={i} className="flex justify-between p-3 bg-white rounded-xl border-[2px] border-black text-sm font-bold text-black">
                <span>{f.name}</span>
                <span>{(f.size / 1024).toFixed(1)} KB</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-[#FACC15] hover:bg-[#FDE047] text-black font-black text-lg rounded-xl border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:shadow-none flex items-center justify-center disabled:opacity-50 mt-6">
        {isSubmitting ? <Loader2 className="w-5 h-5 ml-2 animate-spin" /> : null}
        Publish Lesson
      </button>
    </form>
  )
}
