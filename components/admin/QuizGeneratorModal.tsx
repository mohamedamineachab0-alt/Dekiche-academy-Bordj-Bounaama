'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Wand2 } from 'lucide-react';

export default function QuizGeneratorModal({ lessonId, lessonTitle, subjectTitle, level }: any) {
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({ numberOfQuestions: 10, totalPoints: 20, forcedLanguage: '' });
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, lessonTitle, subjectTitle, level, ...params }),
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
    <div className="p-6 bg-neutral-950 text-neutral-50 rounded-xl shadow-2xl w-full max-w-md border border-neutral-800">
      <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
        <Wand2 className="w-5 h-5 text-purple-500" />
        AI Quiz Generator
      </h2>
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-400">Questions Count</label>
          <input 
            type="number" 
            className="w-full px-3 py-2 rounded-md bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" 
            value={params.numberOfQuestions} 
            onChange={e => setParams({...params, numberOfQuestions: Number(e.target.value)})} 
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-400">Total Points</label>
          <input 
            type="number" 
            className="w-full px-3 py-2 rounded-md bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" 
            value={params.totalPoints} 
            onChange={e => setParams({...params, totalPoints: Number(e.target.value)})} 
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-400">Language (Optional)</label>
          <input 
            placeholder="e.g. Arabic, French"
            className="w-full px-3 py-2 rounded-md bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" 
            value={params.forcedLanguage} 
            onChange={e => setParams({...params, forcedLanguage: e.target.value})} 
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="w-full py-2 px-4 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-medium relative overflow-hidden transition-colors disabled:opacity-50"
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              </motion.div>
            ) : (
              <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Generate Quiz
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
