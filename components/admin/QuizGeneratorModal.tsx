'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Wand2 } from 'lucide-react';
import { buildQuizGenerationFormData } from '@/lib/utils/quiz-request';

export default function QuizGeneratorModal({ lessonId, lessonTitle, subjectTitle, level }: any) {
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({ numberOfQuestions: 10, totalPoints: 20, forcedLanguage: '' });
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const formData = await buildQuizGenerationFormData({
        lessonId,
        persist: true,
        title: lessonTitle,
        subjectName: subjectTitle,
        level,
        numberOfQuestions: params.numberOfQuestions,
        totalPoints: params.totalPoints,
        language: params.forcedLanguage,
      });
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-surface text-ink rounded-xl shadow-2xl w-full max-w-md border border-line">
      <h2 className="text-xl font-semibold mb-4 text-ink flex items-center gap-2">
        <Wand2 className="w-5 h-5 text-muted" />
        توليد اختبار بالذكاء الاصطناعي
      </h2>
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-muted">عدد الأسئلة</label>
          <input 
            type="number" 
            className="w-full px-3 py-2 rounded-md bg-surface border border-line text-ink focus:outline-none focus:ring-2 focus:ring-primary-mid" 
            value={params.numberOfQuestions} 
            onChange={e => setParams({...params, numberOfQuestions: Number(e.target.value)})} 
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-muted">مجموع النقاط</label>
          <input 
            type="number" 
            className="w-full px-3 py-2 rounded-md bg-surface border border-line text-ink focus:outline-none focus:ring-2 focus:ring-primary-mid" 
            value={params.totalPoints} 
            onChange={e => setParams({...params, totalPoints: Number(e.target.value)})} 
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-muted">اللغة (اختياري)</label>
          <input 
            placeholder="العربية، الفرنسية..."
            className="w-full px-3 py-2 rounded-md bg-surface border border-line text-ink focus:outline-none focus:ring-2 focus:ring-primary-mid" 
            value={params.forcedLanguage} 
            onChange={e => setParams({...params, forcedLanguage: e.target.value})} 
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="w-full py-2 px-4 rounded-md bg-primary hover:bg-primary-hover text-white font-medium relative overflow-hidden transition-colors disabled:opacity-50"
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              </motion.div>
            ) : (
              <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                توليد الاختبار
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
