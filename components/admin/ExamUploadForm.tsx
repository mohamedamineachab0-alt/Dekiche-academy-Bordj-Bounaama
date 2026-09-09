"use client";

import { useState } from "react";
import { Upload, Plus, BrainCircuit, Loader2, BookOpen } from "lucide-react";
import { createExamAndExtractQuiz } from "@/actions/exams";
import { EDUCATION_STAGES, EDUCATION_LEVELS, getStreamsForLevel } from "@/lib/constants/education";
import { useRouter } from "next/navigation";
import { MonthSelect } from "@/components/shared/MonthSelect";
import { buildQuizGenerationFormData } from "@/lib/utils/quiz-request";
import { MathPreview } from "@/components/shared/MathPreview";

type QuizQuestion = {
  question: string;
  options: [string, string, string, string];
  correctAnswerIndex: number;
};

export function ExamUploadForm({ subjects }: { subjects: { id: string, title: string, phase: string, levels: any[], streams: any[] }[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [phase, setPhase] = useState("");
  const [level, setLevel] = useState("");
  const [stream, setStream] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [quizMaxScore, setQuizMaxScore] = useState(20);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiLanguage, setAiLanguage] = useState("العربية");

  const [quizType, setQuizType] = useState<"MANUAL" | "AI">("MANUAL");
  const [manualQuestions, setManualQuestions] = useState<QuizQuestion[]>([{ question: "", options: ["", "", "", ""], correctAnswerIndex: 0 }]);

  const [subjectId, setSubjectId] = useState("");

  const filteredSubjects = subjects.filter(s => {
    if (phase && s.phase !== phase) return false;
    if (level && !s.levels?.includes(level)) return false;
    if (stream && stream !== "NONE" && !s.streams?.includes(stream)) return false;
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
      setError("أدخل عنوان الاختبار أو ارفع ملفاً لتوليد الأسئلة");
      return;
    }

    setIsGeneratingAi(true);
    setError("");

    try {
      const subjectName = subjects.find(s => s.id === subjectId)?.title;
      const formData = await buildQuizGenerationFormData({
        files: file ? [file] : [],
        numberOfQuestions,
        totalPoints: quizMaxScore,
        language: aiLanguage,
        title,
        subjectName,
        level,
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError("يرجى إرفاق صورة الاختبار");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      formData.append("file", file); // attach file explicitly since we replaced the standard input with a custom one
      formData.set("quizType", quizType);
      
      if (quizType === "MANUAL") {
        formData.set("manualQuestions", JSON.stringify(manualQuestions));
      } else {
        formData.set("triggerAi", "true");
      }

      const result = await createExamAndExtractQuiz(formData);

      if (result?.error) {
        setError(result.error);
      } else {
        router.refresh();
        const formEl = e.target as HTMLFormElement;
        formEl.reset();
        setFile(null);
        setLevel("");
        setStream("");
        setQuizType("MANUAL");
        setManualQuestions([{ question: "", options: ["", "", "", ""], correctAnswerIndex: 0 }]);
      }
    } catch (err: any) {
      console.error(err);
      setError("حدث خطأ أثناء حفظ الاختبار. حاول مجدداً.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="surface-card p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3 border-b border-line pb-4">
        <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-bold text-ink text-lg">إضافة اختبار جديد</h3>
      </div>

      {error && (
        <div className="p-4 bg-primary-soft text-primary rounded-xl border border-line font-bold text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-primary">عنوان الاختبار</label>
          <input
            type="text"
            name="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="مثال: فرض الفصل الأول في الرياضيات"
            className="input-field"
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary block mb-2">صورة الاختبار (A4)</label>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary">الطور</label>
            <select
              name="phase"
              value={phase}
              onChange={e => { setPhase(e.target.value); setLevel(""); setStream(""); }}
              required
              className="input-field"
            >
              <option value="">اختر الطور..</option>
              {EDUCATION_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-primary">المستوى</label>
            <select
              name="level"
              value={level}
              onChange={e => { setLevel(e.target.value); setStream(""); }}
              required
              disabled={!phase}
              className="input-field disabled:opacity-50"
            >
              <option value="">اختر المستوى..</option>
              {currentLevels.map((lvl: any) => (
                <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-primary">الشعبة</label>
            {shouldShowStreams ? (
              <select
                name="stream"
                value={stream}
                onChange={e => setStream(e.target.value)}
                required
                disabled={!level}
                className="input-field disabled:opacity-50"
              >
                <option value="">اختر الشعبة..</option>
                {currentStreams.map((str: any) => (
                  <option key={str.value} value={str.value}>{str.label}</option>
                ))}
              </select>
            ) : (
              <div className="w-full px-4 py-3 bg-surface-muted border border-line rounded-xl text-muted font-medium text-center">
                غير مطبق
                <input type="hidden" name="stream" value="NONE" />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary">المادة الأساسية</label>
            <select
              name="subjectId"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
              className="input-field"
            >
              <option value="">اختر المادة..</option>
              {filteredSubjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-primary">المادة الثانوية (اختياري)</label>
            <select
              name="secondarySubjectId"
              className="input-field"
            >
              <option value="">بدون مادة ثانوية</option>
              {filteredSubjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.title}</option>
              ))}
            </select>
          </div>
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
                      {q.question.includes('$') && <MathPreview text={q.question} />}
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
            className="flex items-center gap-2 text-primary hover:text-primary font-bold text-sm bg-primary-soft hover:bg-primary-soft px-4 py-2.5 rounded-lg transition-colors mt-4 w-full justify-center border border-line"
          >
            <Plus className="w-4 h-4" /> إضافة سؤال جديد
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              جاري الرفع وتحليل البيانات..
            </>
          ) : (
            "نشر الاختبار"
          )}
        </button>

      </form>
    </div>
  );
}
