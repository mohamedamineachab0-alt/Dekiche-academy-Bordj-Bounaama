"use client";

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { UploadCloud, Loader2, Wand2 } from 'lucide-react';

type GenerationType = 'daily_exercise' | 'exam';

interface AIGenerationFormProps {
  type: GenerationType;
}

export default function AIGenerationForm({ type }: AIGenerationFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      metadata: { level: '', stream: '', subject: '', month: '', maxScore: 20 },
      questions: [] as any[]
    }
  });

  const { fields: questions, replace } = useFieldArray({ 
    control, 
    name: 'questions' 
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageBase64(reader.result as string);
      reader.readAsDataURL(file);
      setStatusMsg(null);
    }
  };

  const handleGenerate = async (data: any) => {
    if (!imageBase64) {
      setStatusMsg({ type: 'error', text: 'Please upload an image first.' });
      return;
    }
    
    setIsGenerating(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageBase64: imageBase64.split(',')[1], 
          metadata: data.metadata, 
          type 
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate questions, please try a clearer image');
      }

      const result = await res.json();
      if (result.questions && Array.isArray(result.questions)) {
        replace(result.questions);
        setStatusMsg({ type: 'success', text: 'Generated successfully!' });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 p-6 bg-neutral-950 text-purple-950 rounded-xl w-full max-w-4xl mx-auto border border-neutral-900 shadow-2xl font-arabic">
      
      <form onSubmit={handleSubmit(handleGenerate)} className="space-y-6">
        {/* Metadata configuration */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <input {...register('metadata.level')} placeholder="Education Level" className="bg-neutral-900 border border-neutral-800 rounded-md p-2.5 text-sm focus:ring-1 focus:ring-purple-500 outline-none" required />
          <input {...register('metadata.stream')} placeholder="Academic Track" className="bg-neutral-900 border border-neutral-800 rounded-md p-2.5 text-sm focus:ring-1 focus:ring-purple-500 outline-none" />
          <input {...register('metadata.subject')} placeholder="Subject" className="bg-neutral-900 border border-neutral-800 rounded-md p-2.5 text-sm focus:ring-1 focus:ring-purple-500 outline-none" required />
          <input {...register('metadata.month')} type="number" placeholder="Month" className="bg-neutral-900 border border-neutral-800 rounded-md p-2.5 text-sm focus:ring-1 focus:ring-purple-500 outline-none" required />
          <input {...register('metadata.maxScore')} type="number" placeholder="Max Score" className="bg-neutral-900 border border-neutral-800 rounded-md p-2.5 text-sm focus:ring-1 focus:ring-purple-500 outline-none" required />
        </div>

        {/* Dropzone */}
        <div className="border-2 border-dashed border-neutral-800 rounded-xl p-10 text-center hover:bg-neutral-900/50 transition-colors relative group">
          <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
          <UploadCloud className="mx-auto h-12 w-12 text-neutral-500 mb-3 group-hover:text-purple-500 transition-colors" />
          <p className="text-sm text-neutral-400 font-medium">Drag & drop your file here, or click to select</p>
          {imageBase64 && <p className="text-xs text-emerald-400 mt-2 font-semibold">Image loaded and ready for processing</p>}
        </div>

        {statusMsg && (
          <div className={`p-3 rounded-md text-sm font-semibold text-center ${statusMsg.type === 'error' ? 'bg-purple-600/10 text-purple-600 border border-purple-600/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
            {statusMsg.text}
          </div>
        )}

        {/* Trigger Button */}
        <button type="submit" disabled={isGenerating} className="w-full bg-white text-black hover:bg-neutral-200 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          {isGenerating ? <Loader2 className="animate-spin mr-2" size={20} /> : <Wand2 className="mr-2 text-purple-600" size={20} />}
          {isGenerating ? 'جاري التوليد...' : 'توليد بالذكاء الاصطناعي'}
        </button>
      </form>

      {/* Dynamic Form Builder Area */}
      {questions.length > 0 && (
        <div className="space-y-6 mt-8 border-t border-neutral-900 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xl font-bold text-purple-950">Generated Form</h3>
          
          <div className="space-y-4">
            {questions.map((q, index) => (
              <div key={q.id} className="bg-neutral-900/50 p-6 rounded-lg border border-neutral-800 space-y-5">
                <textarea 
                  {...register(`questions.${index}.question`)} 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-3 text-sm focus:ring-1 focus:ring-purple-500 outline-none text-purple-950 placeholder-neutral-500" 
                  rows={3} 
                  placeholder="Question Text" 
                />
                
                {type === 'daily_exercise' && (
                  <div className="grid grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map((optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-3 rtl:space-x-reverse bg-neutral-950 p-2 rounded-md border border-neutral-800 focus-within:border-purple-500 transition-colors">
                        <input 
                          type="radio" 
                          {...register(`questions.${index}.correctAnswerIndex`)} 
                          value={optIndex} 
                          className="text-purple-600 focus:ring-purple-500 bg-neutral-900 border-neutral-700" 
                        />
                        <input 
                          {...register(`questions.${index}.options.${optIndex}`)} 
                          className="w-full bg-transparent border-none text-sm focus:ring-0 outline-none text-purple-950 placeholder-neutral-600" 
                          placeholder={`Option ${optIndex + 1}`} 
                        />
                      </div>
                    ))}
                  </div>
                )}

                {type === 'exam' && (
                  <div className="space-y-4">
                    <textarea 
                      {...register(`questions.${index}.modelAnswer`)} 
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-emerald-50 placeholder-neutral-500" 
                      rows={2} 
                      placeholder="Suggested Model Answer" 
                    />
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <span className="text-sm text-neutral-400">Allocated Marks:</span>
                      <input 
                        type="number" 
                        {...register(`questions.${index}.allocatedMarks`)} 
                        className="w-24 bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm focus:ring-1 focus:ring-purple-500 outline-none text-center font-bold" 
                        placeholder="Marks" 
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
