"use client";

import { useState } from "react";
import { updateLesson, previewQuizForMaterial } from "@/actions/lessons";
import { Upload, X, Loader2, Save, BrainCircuit, Image as ImageIcon, Plus, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MonthSelect } from "@/components/shared/MonthSelect";
import { compressImageForAi } from "@/lib/utils/image-compression";
import { MathPreview } from "@/components/shared/MathPreview";
import { Stream } from "@/generated/prisma";

const STREAMS: Stream[] = [
  'COMMON_SCIENCE', 'COMMON_LETTERS', 'EXPERIMENTAL_SCIENCES', 
  'MATHEMATICS', 'TECHNICAL_MATH', 'MANAGEMENT_ECONOMY', 
  'LITERATURE_PHILOSOPHY', 'FOREIGN_LANGUAGES'
];

const STREAM_ARABIC: Record<string, string> = {
  NONE: 'بدون شعبة',
  COMMON_SCIENCE: 'جذع مشترك علوم',
  COMMON_LETTERS: 'جذع مشترك آداب',
  EXPERIMENTAL_SCIENCES: 'علوم تجريبية',
  MATHEMATICS: 'رياضيات',
  TECHNICAL_MATH: 'تقني رياضي',
  MANAGEMENT_ECONOMY: 'تسيير واقتصاد',
  LITERATURE_PHILOSOPHY: 'آداب وفلسفة',
  FOREIGN_LANGUAGES: 'لغات أجنبية'
};

const LEVEL_ARABIC: Record<string, string> = {
  PRIMARY_1: 'الأولى ابتدائي',
  PRIMARY_2: 'الثانية ابتدائي',
  PRIMARY_3: 'الثالثة ابتدائي',
  PRIMARY_4: 'الرابعة ابتدائي',
  PRIMARY_5: 'الخامسة ابتدائي',
  MIDDLE_1: 'الأولى متوسط',
  MIDDLE_2: 'الثانية متوسط',
  MIDDLE_3: 'الثالثة متوسط',
  MIDDLE_4: 'الرابعة متوسط',
  SECONDARY_1: 'الأولى ثانوي',
  SECONDARY_2: 'الثانية ثانوي',
  SECONDARY_3: 'الثالثة ثانوي'
};

export function EditLessonForm({ subjects, initialData }: { subjects: any[], initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [quizLoadingId, setQuizLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData.title);
  
  const [manualQuestions, setManualQuestions] = useState<any[]>(
    initialData.quiz?.questions?.map((q: any) => ({
      question: q.question,
      options: q.options || ["", "", "", ""],
      correctAnswerIndex: q.correctAnswerIndex ?? 0,
      points: q.points ?? 4
    })) || []
  );
  const [showQuizEditor, setShowQuizEditor] = useState(initialData.quiz?.questions?.length > 0);
  const [subjectIds, setSubjectIds] = useState<string[]>(initialData.subjects.map((s: any) => s.id));
  const [streams, setStreams] = useState<Stream[]>(initialData.streams);
  const [levels, setLevels] = useState<string[]>(initialData.levels);
  const [month, setMonth] = useState(initialData.month.toString());
  const [vimeoVideoId, setVimeoVideoId] = useState(initialData.vimeoVideoId);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData.image || null);

  const availableLevels = subjectIds.length > 0 
    ? Array.from(new Set(subjects.filter(s => subjectIds.includes(s.id)).flatMap(s => s.levels)))
    : [];

  const availableStreams = subjectIds.length > 0 
    ? Array.from(new Set(subjects.filter(s => subjectIds.includes(s.id)).flatMap(s => s.streams)))
    : [];

  const handleSubjectChange = (subjectId: string, checked: boolean) => {
    setSubjectIds(prev => checked ? [...prev, subjectId] : prev.filter(id => id !== subjectId));
  };

  const handleStreamChange = (stream: Stream, checked: boolean) => {
    setStreams(prev => checked ? [...prev, stream] : prev.filter(s => s !== stream));
  };

  const handleLevelChange = (level: string, checked: boolean) => {
    setLevels(prev => checked ? [...prev, level] : prev.filter(l => l !== level));
  };

  const handleAddQuestion = () => {
    setManualQuestions([...manualQuestions, { question: "", options: ["", "", "", ""], correctAnswerIndex: 0, points: 4 }]);
    setShowQuizEditor(true);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updated = [...manualQuestions];
    updated[index].question = value;
    setManualQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...manualQuestions];
    updated[qIndex].options[optIndex] = value;
    setManualQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIndex: number, optIndex: number) => {
    const updated = [...manualQuestions];
    updated[qIndex].correctAnswerIndex = optIndex;
    setManualQuestions(updated);
  };

  const handleRemoveQuestion = (index: number) => {
    const updated = manualQuestions.filter((_, i) => i !== index);
    setManualQuestions(updated);
    if (updated.length === 0) setShowQuizEditor(false);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("صورة الغلاف يجب أن لا تتجاوز 2 ميغابايت");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (subjectIds.length === 0 || !title || !vimeoVideoId || !month) {
      setError("الرجاء ملء جميع الحقول المطلوبة (المادة، العنوان، فيديو فيميو، والشهر)");
      return;
    }
    setLoading(true);
    setError(null);

    let imageUrl = initialData.image;

    try {
      if (imageFile) {
        const compressedImage = await compressImageForAi(imageFile);
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from("subject-covers").upload(fileName, compressedImage, { upsert: false });
        
        if (uploadError) throw new Error("فشل رفع صورة الغلاف");
        
        if (uploadData) {
          const { data: publicUrlData } = supabase.storage.from("subject-covers").getPublicUrl(fileName);
          imageUrl = publicUrlData.publicUrl;
        }
      }

      const result = await updateLesson({
        id: initialData.id,
        title,
        subjectIds,
        streams,
        levels,
        month: parseInt(month),
        vimeoVideoId,
        image: imageUrl,
        quiz: manualQuestions.length > 0 ? {
          maxScore: 20,
          aiGenerated: initialData.quiz?.aiGenerated ?? true,
          questions: manualQuestions.map((q: any) => ({
            ...q,
            points: Number((20 / manualQuestions.length).toFixed(2))
          }))
        } : null
      });

      if (result.error) throw new Error(result.error);
      
      router.push("/dashboard/admin/lessons");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateQuiz(materialId: string, materialTitle: string) {
    setQuizLoadingId(materialId);
    setError(null);
    try {
      // Auto determine language based on first subject title (very basic logic)
      const firstSubject = subjects.find(s => s.id === subjectIds[0])?.title || "";
      const isMath = firstSubject.includes("رياضيات");
      const language = isMath ? "LATEX" : "arabic";
      
      const fullTitle = `${title} - ${materialTitle}`;
      const result = await previewQuizForMaterial(materialId, language, firstSubject, fullTitle);
      if (result.error) throw new Error(result.error);
      
      if (result.questions && result.questions.length > 0) {
        setManualQuestions(result.questions);
        setShowQuizEditor(true);
      }
    } catch (err: any) {
      setError(err.message || "فشل توليد الكويز");
    } finally {
      setQuizLoadingId(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-bold border border-red-200">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-purple-950 mb-2">عنوان الدرس *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 font-bold"
            placeholder="مثال: الحصة 01 - مقدمة في الدوال"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-purple-950 mb-2">رابط فيديو Vimeo *</label>
            <input
              type="text"
              value={vimeoVideoId}
              onChange={(e) => setVimeoVideoId(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono"
              placeholder="مثال: 123456789"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-purple-950 mb-2">الشهر *</label>
            <MonthSelect value={month} onChange={setMonth} />
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-purple-950 mb-2">صورة الغلاف (اختياري)</label>
        <div className="flex items-center gap-4">
          <label className="flex-1 border-2 border-dashed border-purple-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 transition-colors">
            <ImageIcon className="w-8 h-8 text-purple-400 mb-2" />
            <span className="text-sm font-bold text-purple-700">تغيير صورة الغلاف</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
          {imagePreview && (
            <div className="relative w-32 h-24 rounded-lg overflow-hidden border border-slate-200 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(initialData.image || null); }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Associations */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-purple-950 mb-2">المواد *</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {subjects.map(subject => (
              <label key={subject.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={subjectIds.includes(subject.id)}
                  onChange={(e) => handleSubjectChange(subject.id, e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-600"
                />
                <span className="text-sm font-bold text-slate-700">{subject.title}</span>
              </label>
            ))}
          </div>
        </div>

        {availableStreams.length > 0 && (
          <div>
            <label className="block text-sm font-bold text-purple-950 mb-2">الشعب المستهدفة</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {STREAMS.filter(s => availableStreams.includes(s) || s === 'NONE').map(stream => (
                <label key={stream} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={streams.includes(stream)}
                    onChange={(e) => handleStreamChange(stream, e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-600"
                  />
                  <span className="text-sm font-bold text-slate-700">{STREAM_ARABIC[stream] || stream}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {availableLevels.length > 0 && (
          <div>
            <label className="block text-sm font-bold text-purple-950 mb-2">المستويات المستهدفة</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableLevels.map(level => (
                <label key={level as string} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={levels.includes(level as string)}
                    onChange={(e) => handleLevelChange(level as string, e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-600"
                  />
                  <span className="text-sm font-bold text-slate-700">{LEVEL_ARABIC[level as string] || level}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Materials and Quiz */}
      <div className="border-t border-slate-200 pt-6 space-y-4">
        <h3 className="font-black text-purple-950">ملحقات الدرس والكويز</h3>
        
        {initialData.materials.length === 0 ? (
          <p className="text-slate-500 text-sm font-bold">لا يوجد ملحقات مرفقة مع هذا الدرس.</p>
        ) : (
          <div className="space-y-3">
            {initialData.materials.map((mat: any) => (
              <div key={mat.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
                <span className="font-bold text-purple-900 text-sm">{mat.title}</span>
                <button
                  type="button"
                  onClick={() => handleGenerateQuiz(mat.id, mat.title)}
                  disabled={quizLoadingId === mat.id}
                  className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                  {quizLoadingId === mat.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BrainCircuit className="w-3.5 h-3.5" />}
                  توليد واستخراج كويز جديد
                </button>
              </div>
            ))}
          </div>
        )}

        {showQuizEditor && (
          <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 mt-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <label className="text-sm font-bold text-purple-800">التنقيط الإجمالي للكويز (ثابت)</label>
              <input 
                type="number" 
                value={20}
                disabled
                className="w-24 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-center font-bold text-slate-500 cursor-not-allowed"
              />
            </div>
            
            <div className="space-y-6">
              {manualQuestions.map((q, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 relative group shadow-sm">
                  <button 
                    type="button" 
                    onClick={() => handleRemoveQuestion(i)}
                    className="absolute top-4 left-4 text-slate-400 hover:text-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-purple-700 mb-2">
                        السؤال {i + 1} <span className="text-slate-400 font-medium mr-2">({(20 / manualQuestions.length).toFixed(1).replace(/\.0$/, '')} نقاط)</span>
                      </label>
                      <input 
                        type="text" 
                        value={q.question}
                        onChange={e => handleQuestionChange(i, e.target.value)}
                        placeholder="نص السؤال"
                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm font-medium"
                      />
                      {q.question.includes('$') && <MathPreview text={q.question} />}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((opt: string, optIndex: number) => (
                        <div 
                          key={optIndex} 
                          className={`flex items-center gap-3 border rounded-lg p-2 transition-colors ${q.correctAnswerIndex === optIndex ? 'border-purple-700 bg-purple-50' : 'border-slate-200 bg-white hover:border-purple-300'}`}
                        >
                          <button
                            type="button"
                            onClick={() => handleCorrectAnswerChange(i, optIndex)}
                            className="shrink-0 flex items-center justify-center"
                          >
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${q.correctAnswerIndex === optIndex ? 'bg-purple-700 border-purple-700 text-white' : 'border-slate-300'}`}>
                              {q.correctAnswerIndex === optIndex && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </div>
                          </button>
                          <div className="flex-1 min-w-0">
                            <input 
                              type="text" 
                              value={opt}
                              onChange={e => handleOptionChange(i, optIndex, e.target.value)}
                              placeholder={`الخيار ${optIndex + 1}`}
                              className="w-full bg-transparent text-sm font-medium focus:outline-none text-purple-800"
                            />
                            {opt.includes('$') && <MathPreview text={opt} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              type="button"
              onClick={handleAddQuestion}
              className="flex items-center gap-2 text-purple-700 hover:text-purple-800 font-bold text-sm bg-purple-50 hover:bg-purple-100 px-4 py-2.5 rounded-lg transition-colors mt-4 w-full justify-center border border-purple-100"
            >
              <Plus className="w-4 h-4" /> إضافة سؤال جديد
            </button>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={loading || quizLoadingId !== null}
          className="w-full flex items-center justify-center gap-2 bg-purple-950 hover:bg-purple-900 text-white font-bold py-4 rounded-xl transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </div>

    </form>
  );
}
