"use client";

import { useState, useEffect } from "react";
import { createLesson, LessonPayload } from "@/actions/lessons";
import { Upload, X, Plus, Loader2, PlayCircle, Save, CheckCircle2, FileText, BrainCircuit, Image as ImageIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MonthSelect } from "@/components/shared/MonthSelect";
import { buildQuizGenerationFormData } from "@/lib/utils/quiz-request";
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

type Subject = {
  id: string;
  title: string;
  levels: string[];
  streams: string[];
};

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  points?: number;
};

export function LessonForm({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [month, setMonth] = useState("1");
  const [vimeoVideoId, setVimeoVideoId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const [quizType, setQuizType] = useState<"MANUAL" | "AI">("MANUAL");
  const [quizMaxScore, setQuizMaxScore] = useState(20);
  const [numberOfQuestions, setNumberOfQuestions] = useState(20);
  const [aiLanguage, setAiLanguage] = useState("العربية");
  const [aiSourceNote, setAiSourceNote] = useState<string | null>(null);
  const [manualQuestions, setManualQuestions] = useState<QuizQuestion[]>([{ question: "", options: ["", "", "", ""], correctAnswerIndex: 0 }]);
  
  useEffect(() => {
    const hasMath = subjectIds.some(id => {
      const subject = subjects.find(s => s.id === id);
      return subject && subject.title.includes("رياضيات");
    });
    if (hasMath) {
      setAiLanguage("LATEX");
    }
  }, [subjectIds, subjects]);

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const [materials, setMaterials] = useState<{ file: File; title: string }[]>([]);
  const [materialTitle, setMaterialTitle] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const handleAddQuestion = () => {
    setManualQuestions([...manualQuestions, { question: "", options: ["", "", "", ""], correctAnswerIndex: 0 }]);
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
    setManualQuestions(manualQuestions.filter((_, i) => i !== index));
  };

  const handleAiGenerate = async () => {
    if (!title.trim() && materials.length === 0) {
      setError("أدخل عنوان الدرس أو ارفع ملحقات لتوليد الاختبار");
      return;
    }

    setIsGeneratingAi(true);
    setError(null);
    setAiSourceNote(null);

    try {
      const formData = await buildQuizGenerationFormData({
        files: materials.map((mat) => mat.file),
        numberOfQuestions,
        totalPoints: quizMaxScore,
        language: aiLanguage,
        title,
        subjectName: subjects.find((s) => s.id === subjectIds[0])?.title,
      });

      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "فشل توليد الأسئلة");
      }

      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setManualQuestions(data.questions);
        setQuizType("MANUAL");
        setAiSourceNote(
          data.source === "title"
            ? "تعذّر الاعتماد على الملفات، فوُلِّد الاختبار من عنوان الدرس."
            : "تم استخراج الأسئلة وتصحيحها من الملحقات."
        );
      } else {
        setError("لم يتم التعرف على أي أسئلة صالحة");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        title: materialTitle.trim() !== "" 
          ? materialTitle 
          : (title.trim() !== "" ? title : file.name.split(".")[0])
      }));
      setMaterials([...materials, ...newFiles]);
      setMaterialTitle(""); // Reset for next file
    }
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || subjectIds.length === 0 || !month || !vimeoVideoId) {
      setError("جميع الحقول الأساسية مطلوبة (ويجب اختيار مادة واحدة على الأقل)");
      return;
    }

    setLoading(true);
    setError(null);
    setUploadingFiles(true);

    try {
      const uploadedMaterials = [];

      for (const mat of materials) {
        const fileExt = mat.file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${subjectIds[0]}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("lesson-materials")
          .upload(filePath, mat.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("lesson-materials")
          .getPublicUrl(filePath);

        uploadedMaterials.push({
          title: mat.title,
          fileUrl: publicUrl
        });
      }

      let uploadedImage = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `lesson-covers/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("lesson-materials")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("lesson-materials")
          .getPublicUrl(filePath);
          
        uploadedImage = publicUrl;
      }

      setUploadingFiles(false);

      const payload: LessonPayload = {
        title,
        subjectIds,
        streams,
        levels,
        month: parseInt(month),
        vimeoVideoId,
        image: uploadedImage,
        materials: uploadedMaterials,
        quiz: manualQuestions[0].question ? {
          maxScore: 20, // Forced max score
          aiGenerated: false,
          questions: manualQuestions.map(q => ({
            ...q,
            points: Number((20 / manualQuestions.length).toFixed(2))
          }))
        } : null
      };

      const result = await createLesson(payload);

      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        router.push("/dashboard/admin/lessons");
      }

    } catch (err: any) {
      console.error(err);
      setError("حدث خطأ أثناء رفع الملفات");
      setLoading(false);
      setUploadingFiles(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-arabic" dir="rtl">
      
      {error && (
        <div className="bg-primary-soft text-primary p-4 rounded-xl font-bold border border-line">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="surface-card p-8 space-y-6">
        <h2 className="text-xl font-bold text-ink">معلومات الدرس الأساسية</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary">عنوان الدرس</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-white border border-line rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-mid"
              placeholder="مثال درس الاحتمالات"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-primary">المواد والشعب الموجه لها الدرس</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-muted p-4 rounded-xl border border-line">
              <div>
                <label className="text-sm font-bold text-ink mb-3 block">المواد (يمكن اختيار أكثر من مادة)</label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 bg-white border border-line rounded-lg">
                  {subjects.map(s => (
                    <label key={s.id} className="flex items-center space-x-3 space-x-reverse text-sm font-bold text-muted cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={subjectIds.includes(s.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSubjectIds([...subjectIds, s.id]);
                          } else {
                            setSubjectIds(subjectIds.filter(id => id !== s.id));
                          }
                        }}
                        className="w-4 h-4 rounded text-primary border-line focus:ring-primary-mid" 
                      />
                      <span>{s.title} ({s.levels?.map(l => LEVEL_ARABIC[l] || l).join(', ')}{s.streams?.length && !s.streams.includes('NONE') ? ` - ${s.streams.map(st => STREAM_ARABIC[st] || st).join(', ')}` : ''})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-ink mb-3 block">المستويات (يمكن اختيار أكثر من مستوى)</label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 bg-white border border-line rounded-lg mb-4">
                  {Object.entries(LEVEL_ARABIC).map(([key, label]) => (
                    <label key={key} className="flex items-center space-x-3 space-x-reverse text-sm font-bold text-muted cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={levels.includes(key)}
                        onChange={(e) => {
                          if (e.target.checked) setLevels([...levels, key]);
                          else setLevels(levels.filter(l => l !== key));
                        }}
                        className="w-4 h-4 rounded text-primary border-line focus:ring-primary-mid" 
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                <label className="text-sm font-bold text-ink mb-3 block">الشعب (يمكن اختيار أكثر من شعبة)</label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 bg-white border border-line rounded-lg">
                  {STREAMS.map(stream => (
                    <label key={stream} className="flex items-center space-x-3 space-x-reverse text-sm font-bold text-muted cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={streams.includes(stream)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setStreams([...streams, stream]);
                          } else {
                            setStreams(streams.filter(st => st !== stream));
                          }
                        }}
                        className="w-4 h-4 rounded text-primary border-line focus:ring-primary-mid" 
                      />
                      <span>{STREAM_ARABIC[stream as string] || stream}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-ink block">صورة غلاف الدرس (1920x1080)</label>
            <div className="relative border border-dashed border-line rounded-xl p-8 hover:border-purple-400 transition-colors bg-white group text-center aspect-video flex flex-col items-center justify-center overflow-hidden">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center">
                  <ImageIcon className="w-8 h-8 text-muted mb-3 group-hover:text-muted transition-colors" />
                  <span className="text-sm font-bold text-muted group-hover:text-primary">اضغط لرفع صورة الغلاف</span>
                  <span className="text-xs text-muted mt-1">PNG, JPG (1920x1080)</span>
                </div>
              )}
              <input 
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImageFile(e.target.files[0]);
                    setImageUrl(URL.createObjectURL(e.target.files[0]));
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-primary">الشهر</label>
            <MonthSelect 
              value={month}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMonth(e.target.value)}
              className="w-full bg-white border border-line rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-mid"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-primary">Vimeo Video ID (أو رابط الفيديو)</label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                <PlayCircle className="w-5 h-5" />
              </span>
              <input 
                type="text" 
                value={vimeoVideoId}
                onChange={e => {
                  // Allow user to paste full URL and extract ID, or just paste ID
                  const val = e.target.value;
                  const match = val.match(/vimeo\.com\/(?:video\/)?(\d+)/);
                  setVimeoVideoId(match ? match[1] : val);
                }}
                dir="ltr"
                className="w-full bg-white border border-line rounded-xl pr-10 pl-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-mid text-base font-medium"
                placeholder="مثال: 123456789"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Section */}
      <div className="surface-card p-8 space-y-6">
        <h2 className="text-xl font-bold text-ink">ملحقات الدرس كويز</h2>
        
        <div className="flex gap-4 p-1 bg-surface-muted rounded-xl w-max">
          <button
            type="button"
            onClick={() => setQuizType("MANUAL")}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${quizType === "MANUAL" ? "bg-white text-primary shadow-sm" : "text-muted hover:text-primary"}`}
          >
            توليد كويز يدويا مع التنقيط
          </button>
          <button
            type="button"
            onClick={() => setQuizType("AI")}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${quizType === "AI" ? "bg-white text-primary shadow-sm" : "text-muted hover:text-primary"}`}
          >
            <BrainCircuit className="w-4 h-4" />
            توليد كويز بالذكاء الاصطناعي
          </button>
        </div>

        {quizType === "MANUAL" ? (
          <div className="space-y-6 bg-white p-6 rounded-2xl border border-line">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <label className="text-sm font-bold text-primary">التنقيط الإجمالي للكويز (ثابت)</label>
              <input 
                type="number" 
                value={20}
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
                    <X className="w-5 h-5" />
                  </button>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-primary mb-2">
                        السؤال {i + 1} <span className="text-muted font-medium mr-2">({(20 / manualQuestions.length).toFixed(1).replace(/\.0$/, '')} نقاط)</span>
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
                          className={`flex items-center gap-3 border rounded-lg p-2 transition-colors ${q.correctAnswerIndex === optIndex ? 'border-line bg-primary-soft dark:bg-primary/10' : 'border-line bg-white hover:border-line'}`}
                        >
                          <button
                            type="button"
                            onClick={() => handleCorrectAnswerChange(i, optIndex)}
                            className="shrink-0 flex items-center justify-center"
                          >
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${q.correctAnswerIndex === optIndex ? 'bg-primary border-line text-white' : 'border-line'}`}>
                              {q.correctAnswerIndex === optIndex && <CheckCircle2 className="w-3.5 h-3.5" />}
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
        ) : (
          <div className="bg-white border border-line rounded-2xl p-6 md:p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
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
            </div>
            <div className="space-y-2 mb-4">
              <label className="text-sm font-bold text-primary block">لغة الكويز</label>
              <select
                value={aiLanguage}
                onChange={(e) => setAiLanguage(e.target.value)}
                className="w-full bg-white border border-line rounded-lg px-4 py-2.5 font-bold focus:ring-2 focus:ring-primary-mid outline-none"
              >
                <option value="العربية">العربية (Arabic)</option>
                <option value="English">الإنجليزية (English)</option>
                <option value="Français">الفرنسية (French)</option>
                <option value="Español">الإسبانية (Spanish)</option>
                <option value="LATEX">لاتيكس (LaTeX - للرياضيات المتقدمة)</option>
              </select>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm font-bold text-primary">المصدر</p>
              <p className="text-sm text-muted leading-6">
                يقرأ الذكاء الاصطناعي كل الملحقات (PDF وWord والصور والجداول) ويصحّح الأسئلة الموجودة فيها. إن تعذّر ذلك يُنشئ الاختبار من عنوان الدرس.
              </p>
              {materials.length > 0 ? (
                <ul className="text-sm font-bold text-ink bg-primary-soft rounded-xl border border-line px-4 py-3 space-y-1">
                  {materials.map((mat, idx) => (
                    <li key={idx}>{mat.title} — {mat.file.name}</li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 bg-primary-soft text-muted rounded-lg text-sm font-bold flex items-center gap-2 border border-line">
                  <FileText className="w-5 h-5 shrink-0" />
                  لا ملحقات بعد. سيُولَّد الاختبار من عنوان الدرس.
                </div>
              )}
            </div>

            {aiSourceNote && (
              <p className="text-sm font-bold text-primary mb-3">{aiSourceNote}</p>
            )}

            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={isGeneratingAi}
              className="btn-ghost w-full"
            >
              {isGeneratingAi ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري القراءة والتوليد...
                </>
              ) : (
                <>
                  <BrainCircuit className="w-5 h-5" />
                  توليد من كل الملحقات
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Materials Section */}
      <div className="surface-card p-8 space-y-6">
        <h2 className="text-xl font-bold text-ink">ملحقات أخرى</h2>
        
        <div className="space-y-4">
          <label className="block border border-dashed border-line hover:border-line rounded-2xl p-8 text-center cursor-pointer transition-colors bg-white hover:bg-primary-soft">
            <Upload className="w-8 h-8 mx-auto text-muted mb-3" />
            <span className="font-bold text-muted">صور مع الدرس يأخذ التمام حجمهم كيما نرفعهم في Bucket Lessons Materials</span>
            <input 
              type="file" 
              multiple 
              accept="*/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* خانة عنوان المرفق */}
          <div className="mt-4 w-full">
            <label className="block text-sm font-medium text-muted mb-1 font-ibm-plex-sans-arabic text-right">
              عنوان المرفق (مثال: ملخص الوحدة الأولى)
            </label>
            <input
              type="text"
              placeholder="اكتب عنوان المرفق هنا..."
              value={materialTitle}
              onChange={(e) => setMaterialTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-line focus:outline-none focus:border-line bg-white text-right font-ibm-plex-sans-arabic"
            />
          </div>

          {materials.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {materials.map((mat, i) => (
                <div key={i} className="flex flex-col gap-3 bg-white border border-line p-4 rounded-xl shadow-sm relative group">
                  <button 
                    type="button"
                    onClick={() => removeMaterial(i)}
                    className="absolute top-2 left-2 p-1.5 text-muted hover:text-primary hover:bg-primary-soft rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-3 pr-2">
                    <div className="w-10 h-10 bg-primary-soft text-primary rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted truncate" dir="ltr">{mat.file.name}</p>
                      <p className="text-[10px] text-muted">{(mat.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 mt-1 border-t border-line pt-3">
                    <label className="text-xs font-bold text-primary block">عنوان المرفق</label>
                    <input 
                      type="text" 
                      value={mat.title}
                      placeholder="عنوان المرفق (مثال: ملخص الوحدة الأولى)"
                      required
                      onChange={e => {
                        const updated = [...materials];
                        updated[i].title = e.target.value;
                        setMaterials(updated);
                      }}
                      className="w-full text-sm font-bold text-primary bg-white border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-mid"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {uploadingFiles ? "جاري رفع الملفات" : "جاري الحفظ"}
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            نشر الدرس
          </>
        )}
      </button>
    </form>
  );
}
