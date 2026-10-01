"use client";

import { useState } from "react";
import { Upload, Plus, BrainCircuit, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { createDailyExercise } from "@/actions/exercises";
import { EDUCATION_STAGES, EDUCATION_LEVELS, getStreamsForLevel } from "@/lib/constants/education";
import { MonthSelect } from "@/components/shared/MonthSelect";
import { buildQuizGenerationFormData } from "@/lib/utils/quiz-request";
import { MathPreview } from "@/components/shared/MathPreview";
import { SubjectSelector } from "@/components/shared/SubjectSelector";

type Subject = {
  id: string;
  title: string;
  phase: string;
  levels: string[];
  streams: string[];
};

type QuizQuestion = {
  question: string;
  options: [string, string, string, string];
  correctAnswerIndex: number;
};

export function DailyExerciseForm({ subjects }: { subjects: any[] }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [quizMaxScore, setQuizMaxScore] = useState(20);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiLanguage, setAiLanguage] = useState("العربية");

  const [quizType, setQuizType] = useState<"MANUAL" | "AI">("MANUAL");
  const [manualQuestions, setManualQuestions] = useState<QuizQuestion[]>([{ question: "", options: ["", "", "", ""], correctAnswerIndex: 0 }]);

  const [subjectId, setSubjectId] = useState("");

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
    if (!file && !title.trim()) {
      setError("أدخل عنوان التمرين أو ارفع ملفاً لتوليد الاختبار");
      return;
    }

    setIsGeneratingAi(true);
    setError(null);

    try {
      // We don't have subjectName easily without searching, fallback to title
      const subjectName = title;
      const formData = await buildQuizGenerationFormData({
        files: file ? [file] : [],
        numberOfQuestions,
        totalPoints: quizMaxScore,
        language: aiLanguage,
        title,
        subjectName,
      });

      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "فشل توليد الأسئلة");
      }

      if (data.questions && Array.isArray(data.questions)) {
        setManualQuestions(data.questions);
        setQuizType("MANUAL");
      } else {
        setError("لم يتم التعرف على أي أسئلة صالحة");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Removed manual subject filtering logic since SubjectSelector handles it


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
    } catch (err: any) {
      console.error(err);
      setError("حدث خطأ أثناء حفظ التمرين. حاول مجدداً.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="surface-card p-6 sticky top-6">
      <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5 text-primary" />
        إضافة تمرين جديد
      </h2>

      {error && (
        <div className="bg-primary-soft text-primary p-3 rounded-lg text-sm font-bold mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-bold text-primary">عنوان التمرين</label>
          <input 
            type="text" 
            name="title" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            required 
            className="input-field" 
            placeholder="مثال: تمرين حول المتتاليات" 
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-bold text-primary block mb-2">صورة التمرين (A4)</label>
          <label className="block border border-dashed border-line hover:border-line rounded-2xl p-6 text-center cursor-pointer transition-colors bg-white hover:bg-primary-soft">
            <Upload className="w-6 h-6 mx-auto text-muted mb-2" />
            <span className="font-bold text-muted text-sm">
              {file ? file.name : "اضغط لرفع صورة أو اسحبها هنا"}
            </span>
            <input 
              type="file" 
              accept="*/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {file && (
          <div className="bg-primary-soft p-6 rounded-2xl border border-line space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary block">عدد الأسئلة</label>
                <input 
                  type="number" 
                  value={numberOfQuestions}
                  onChange={e => setNumberOfQuestions(Number(e.target.value))}
                  min={1}
                  max={20}
                  className="w-full bg-white border border-line rounded-lg px-4 py-2.5 font-bold focus:ring-2 focus:ring-primary-mid outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary block">مجموع النقاط</label>
                <input 
                  type="number" 
                  value={quizMaxScore}
                  onChange={e => setQuizMaxScore(Number(e.target.value))}
                  min={1}
                  className="w-full bg-white border border-line rounded-lg px-4 py-2.5 font-bold focus:ring-2 focus:ring-primary-mid outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary block">لغة الأسئلة</label>
                <select
                  value={aiLanguage}
                  onChange={(e) => setAiLanguage(e.target.value)}
                  className="w-full bg-white border border-line rounded-lg px-4 py-2.5 font-bold focus:ring-2 focus:ring-primary-mid outline-none"
                >
                  <option value="العربية">العربية (Arabic)</option>
                  <option value="English">الإنجليزية (English)</option>
                  <option value="Français">الفرنسية (French)</option>
                  <option value="Español">الإسبانية (Spanish)</option>
                  <option value="LATEX">لاتيكس (LaTeX - للرياضيات)</option>
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={isGeneratingAi}
              className="btn-ghost w-full"
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

        <div className="space-y-4">
          <label className="text-sm font-bold text-primary">المادة الأساسية</label>
          <SubjectSelector subjects={subjects} name="subjectId" />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-primary">المادة الثانوية (اختياري)</label>
          <SubjectSelector subjects={subjects} name="secondarySubjectId" required={false} />
        </div>

        <div className="bg-primary-soft p-6 rounded-2xl border border-line space-y-4">
          <h3 className="font-bold text-ink flex items-center gap-2">
            <Plus className="w-4 h-4" /> ملحقات أخرى (اختياري)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary">عنوان المرفقات</label>
              <input type="text" name="materialTitle" className="w-full px-4 py-2.5 bg-white border border-line rounded-xl text-ink font-medium focus:ring-2 focus:ring-primary-mid focus:outline-none" placeholder="مثال: ملخص الدرس" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary block">رفع الملفات</label>
              <input type="file" name="materials" multiple className="w-full px-4 py-2 bg-white border border-line rounded-xl text-sm font-medium file:ml-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:font-bold file:bg-primary-soft file:text-primary hover:file:bg-primary-soft" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary">الشهر</label>
            <MonthSelect name="month" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-primary">العلامة القصوى</label>
            <input 
              type="number" 
              name="maxScore" 
              defaultValue={20} 
              required 
              className="input-field" 
            />
          </div>
        </div>

        <div className="space-y-6 bg-white p-6 rounded-2xl border border-line">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <label className="text-sm font-bold text-primary">التنقيط الإجمالي للكويز (ثابت)</label>
            <input 
              type="number" 
              value={quizMaxScore}
              disabled
              className="w-24 bg-surface-muted border border-line rounded-lg px-3 py-1.5 text-center font-bold text-muted cursor-not-allowed"
            />
          </div>
            
            <div className="space-y-6">
              {manualQuestions.map((q, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-line relative group shadow-sm">
                  <button 
                    type="button" 
                    onClick={() => handleRemoveQuestion(i)}
                    className="absolute top-4 left-4 text-muted hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="font-bold text-lg leading-none">&times;</span>
                  </button>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-primary mb-2">
                        السؤال {i + 1} <span className="text-muted font-medium mr-2">({(quizMaxScore / manualQuestions.length).toFixed(1).replace(/\.0$/, '')} نقاط)</span>
                      </label>
                      <input 
                        type="text" 
                        value={q.question}
                        onChange={e => handleQuestionChange(i, e.target.value)}
                        placeholder="نص السؤال"
                        className="w-full bg-white border border-line rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-mid text-sm font-medium"
                      />
                      <MathPreview text={q.question} />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((opt, optIndex) => (
                        <div 
                          key={optIndex} 
                          className={`flex items-center gap-3 border rounded-lg p-2 transition-colors ${q.correctAnswerIndex === optIndex ? 'border-line bg-primary-soft' : 'border-line bg-white hover:border-line'}`}
                        >
                          <button
                            type="button"
                            onClick={() => handleCorrectAnswerChange(i, optIndex)}
                            className="shrink-0 flex items-center justify-center"
                          >
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${q.correctAnswerIndex === optIndex ? 'bg-primary border-line text-white' : 'border-line'}`}>
                              {q.correctAnswerIndex === optIndex && <span className="text-xs">✓</span>}
                            </div>
                          </button>
                          <div className="flex-1 min-w-0">
                            <input 
                              type="text" 
                              value={opt}
                              onChange={e => handleOptionChange(i, optIndex, e.target.value)}
                              placeholder={`الخيار ${optIndex + 1}`}
                              className="w-full bg-transparent text-sm font-medium focus:outline-none text-primary"
                            />
                            <MathPreview text={opt} />
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
              className="flex items-center gap-2 text-primary hover:text-primary font-bold text-sm bg-primary-soft hover:bg-primary-soft px-4 py-2.5 rounded-lg transition-colors mt-4 w-full justify-center border border-line"
            >
              <Plus className="w-4 h-4" /> إضافة سؤال جديد
            </button>
          </div>

        <button  
          type="submit" 
          disabled={uploading}
          className="btn-primary w-full mt-4"
        >
          {uploading ? "جاري النشر..." : "نشر التمرين"}
        </button>
      </form>
    </div>
  );
}
