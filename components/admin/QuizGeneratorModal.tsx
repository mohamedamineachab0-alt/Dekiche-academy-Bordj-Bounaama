'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
        <div>
          <Label className="text-neutral-400">Questions Count</Label>
          <Input 
            type="number" 
            className="bg-neutral-900 border-neutral-800 text-white" 
            value={params.numberOfQuestions} 
            onChange={e => setParams({...params, numberOfQuestions: Number(e.target.value)})} 
          />
        </div>
        <div>
          <Label className="text-neutral-400">Total Points</Label>
          <Input 
            type="number" 
            className="bg-neutral-900 border-neutral-800 text-white" 
            value={params.totalPoints} 
            onChange={e => setParams({...params, totalPoints: Number(e.target.value)})} 
          />
        </div>
        <div>
          <Label className="text-neutral-400">Language (Optional)</Label>
          <Input 
            placeholder="e.g. Arabic, French"
            className="bg-neutral-900 border-neutral-800 text-white" 
            value={params.forcedLanguage} 
            onChange={e => setParams({...params, forcedLanguage: e.target.value})} 
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button 
          onClick={handleGenerate} 
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white relative overflow-hidden transition-all"
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
        </Button>
      </div>
    </div>
  );
}
