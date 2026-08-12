"use client";

import { useState } from "react";
import { Upload, Plus, BrainCircuit, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { createDailyExercise } from "@/actions/exercises";
import { EDUCATION_STAGES, EDUCATION_LEVELS, getStreamsForLevel } from "@/lib/constants/education";
import { MonthSelect } from "@/components/shared/MonthSelect";
import { compressImageForAi } from "@/lib/utils/image-compression";
import { MathPreview } from "@/components/shared/MathPreview";

type Subject = {
  id: string;
  title: string;
  phase: string;
  level: string;
  stream: string;
};

type QuizQuestion = {
  question: string;
  options: [string, string, string, string];
  correctAnswerIndex: number;
};

export function DailyExerciseForm({ subjects }: { subjects: Subject[] }) {
  const [phase, setPhase] = useState("");
  const [level, setLevel] = useState("");
  const [stream, setStream] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [quizMaxScore, setQuizMaxScore] = useState(20);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const [quizType, setQuizType] = useState<"MANUAL" | "AI">("MANUAL");
  const [manualQuestions, setManualQuestions] = useState<QuizQuestion[]>([{ question: "", options: ["", "", "", ""], correctAnswerIndex: 0 }]);

  const handleQuestionChange = (index: number, value: string) => {
    const newQs = [...manualQuestions];
    newQs[index].question = value;
    setManualQuestions(newQs);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const newQs = [...manualQuestions];
    newQs[qIndex].options[optIndex] = value;
    setManualQuestions(newQs);
  };

  const handleCorrectAnswerChange = (qIndex: number, optIndex: number) => {
    const newQs = [...manualQuestions];
    newQs[qIndex].correctAnswerIndex = optIndex;
    setManualQuestions(newQs);
  };

  const handleAddQuestion = () => {
    setManualQuestions([...manualQuestions, { question: "", options: ["", "", "", ""], correctAnswerIndex: 0 }]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (manualQuestions.length > 1) {
      const newQs = manualQuestions.filter((_, i) => i !== index);
      setManualQuestions(newQs);
    }
  };

  const handleAiGenerate = async () => {
    if (!file) {
      setError("يرجى رفع صورة أولاً");
      return;
    }

    setIsGeneratingAi(true);
    setError(null);

    try {
      const base64Data = await compressImageForAi(file);
      
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          numberOfQuestions: numberOfQuestions,
          totalPoints: quizMaxScore
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل توليد الأسئلة");
      }

      const data = await response.json();
      if (data.questions && Array.isArray(data.questions)) {
        setManualQuestions(data.questions);
        setQuizType("MANUAL");
      } else {
        setError("لم يتم التعرف على أي أسئلة صالحة في الصورة");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const filteredSubjects = subjects.filter(s => {
    if (phase && s.phase !== phase) return false;
    if (level && s.level !== level) return false;
    if (stream && s.stream !== stream && stream !== "NONE") return false;
    return true;
  });

  const currentLevels = phase ? EDUCATION_LEVELS[phase as keyof typeof EDUCATION_LEVELS] : [];
  const currentStreams = getStreamsForLevel(phase, level);
  const shouldShowStreams = phase === "SECONDARY" && currentStreams.length > 1;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError("يرجى إرفاق صورة أو ملف التمرين");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Upload to Supabase bucket 'daily-excercicse'
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("daily-excercicse")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("daily-excercicse")
        .getPublicUrl(filePath);

      // Add to formData
      formData.set("a4ImageUrl", publicUrl);
      
      // Append manual questions if selected
      if (quizType === "MANUAL") {
        formData.set("manualQuestions", JSON.stringify(manualQuestions));
      }
      formData.set("quizType", quizType);

      await createDailyExercise(formData);
      
      // Reset form
      const formEl = e.target as HTMLFormElement;
      formEl.reset();
      setFile(null);
      setLevel("");
      setStream("");
    } catch (err: any) {
      console.error(err);
      setError("حدث خطأ أثناء حفظ التمرين. حاول مجدداً.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sticky top-6">
      <h2 className="text-lg font-black text-purple-950 mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5 text-purple-700" />
        إضافة تمرين جديد
      </h2>

      {error && (
        <div className="bg-purple-50 text-purple-800 p-3 rounded-lg text-sm font-bold mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-bold text-purple-800">عنوان التمرين</label>
          <input type="text" name="title" required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-purple-950 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="مثال: تمرين حول المتتاليات" />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-bold text-purple-800 block mb-2">صورة التمرين (A4)</label>
          <label className="block border-2 border-dashed border-slate-200 hover:border-purple-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-white hover:bg-purple-50">
            <Upload className="w-6 h-6 mx-auto text-slate-400 mb-2" />
            <span className="font-bold text-slate-600 text-sm">
              {file ? file.name : "اضغط لرفع صورة أو اسحبها هنا"}
            </span>
            <input 
              type="file" 
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {file && file.type.startsWith("image/") && (
          <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-purple-800 block">عدد الأسئلة</label>
                <input 
                  type="number" 
                  value={numberOfQuestions}
                  onChange={e => setNumberOfQuestions(Number(e.target.value))}
                  min={1}
                  max={20}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 font-bold focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-purple-800 block">مجموع النقاط</label>
                <input 
                  type="number" 
                  value={quizMaxScore}
                  onChange={e => setQuizMaxScore(Number(e.target.value))}
                  min={1}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 font-bold focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={isGeneratingAi}
              className="w-full py-3 bg-white hover:bg-white text-purple-950 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isGeneratingAi ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري استخراج الأسئلة...
                </>
              ) : (
                <>
                  <BrainCircuit className="w-5 h-5" />
                  استخراج الأسئلة وتوليد كويز رقمي
                </>
              )}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-purple-800">الطور</label>
            <select
              name="phase"
              value={phase}
              onChange={e => { setPhase(e.target.value); setLevel(""); setStream(""); }}
              required
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-purple-950 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="">اختر الطور..</option>
              {EDUCATION_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-purple-800">المستوى</label>
            <select
              name="level"
              value={level}
              onChange={e => { setLevel(e.target.value); setStream(""); }}
              required
              disabled={!phase}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-purple-950 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
            >
              <option value="">اختر المستوى..</option>
              {currentLevels.map((lvl: any) => (
                <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-purple-800">الشعبة</label>
            {shouldShowStreams ? (
              <select
                name="stream"
                value={stream}
                onChange={e => setStream(e.target.value)}
                required
                disabled={!level}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-purple-950 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
              >
                <option value="">اختر الشعبة..</option>
                {currentStreams.map((str: any) => (
                  <option key={str.value} value={str.value}>{str.label}</option>
                ))}
              </select>
            ) : (
              <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 font-medium text-center">
                غير مطبق
                <input type="hidden" name="stream" value="NONE" />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-purple-800">المادة الأساسية</label>
            <select
              name="subjectId"
              required
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-purple-950 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="">اختر المادة..</option>
              {filteredSubjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-purple-800">المادة الثانوية (اختياري)</label>
            <select
              name="secondarySubjectId"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-purple-950 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="">بدون مادة ثانوية</option>
              {filteredSubjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-purple-800">الشهر</label>
            <MonthSelect name="month" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-purple-800">العلامة القصوى</label>
            <input 
              type="number" 
              name="maxScore" 
              defaultValue={20} 
              required 
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-purple-950 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none" 
            />
          </div>
        </div>

        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <label className="text-sm font-bold text-purple-800">التنقيط الإجمالي للكويز (ثابت)</label>
            <input 
              type="number" 
              value={quizMaxScore}
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
                    <span className="font-bold text-lg leading-none">&times;</span>
                  </button>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-purple-700 mb-2">
                        السؤال {i + 1} <span className="text-slate-400 font-medium mr-2">({(quizMaxScore / manualQuestions.length).toFixed(1).replace(/\.0$/, '')} نقاط)</span>
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
                      {q.options.map((opt, optIndex) => (
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
                              {q.correctAnswerIndex === optIndex && <span className="text-xs">✓</span>}
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

        <button  
          type="submit" 
          disabled={uploading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-slate-950 font-black font-bold py-3 rounded-xl transition-all shadow-sm shadow-purple-600/20 mt-4 disabled:opacity-50"
        >
          {uploading ? "جاري النشر..." : "نشر التمرين"}
        </button>
      </form>
    </div>
  );
}
