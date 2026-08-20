"use client";

import { useState } from "react";
import { createLesson, LessonPayload } from "@/actions/lessons";
import { generateQuizFromImage } from "@/actions/ai";
import { Upload, X, Plus, Loader2, PlayCircle, Save, CheckCircle2, FileText, BrainCircuit } from "lucide-react";
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

type Subject = {
  id: string;
  title: string;
  level: string;
  stream: string;
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
  const [month, setMonth] = useState("1");
  const [vimeoVideoId, setVimeoVideoId] = useState("");

  const [quizType, setQuizType] = useState<"MANUAL" | "AI">("MANUAL");
  const [quizMaxScore, setQuizMaxScore] = useState(20);
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [aiImageFile, setAiImageFile] = useState<File | null>(null);
  const [manualQuestions, setManualQuestions] = useState<QuizQuestion[]>([{ question: "", options: ["", "", "", ""], correctAnswerIndex: 0 }]);
  
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
    if (!aiImageFile) {
      setError("يرجى رفع صورة أولاً");
      return;
    }

    setIsGeneratingAi(true);
    setError(null);

    try {
      const base64Data = await compressImageForAi(aiImageFile);
      
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        title: materialTitle.trim() !== "" ? materialTitle : file.name.split(".")[0]
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

      setUploadingFiles(false);

      const payload: LessonPayload = {
        title,
        subjectIds,
        streams,
        month: parseInt(month),
        vimeoVideoId,
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
        <div className="bg-purple-50 text-purple-800 p-4 rounded-xl font-bold border border-purple-200">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
        <h2 className="text-xl font-black text-purple-950 ">معلومات الدرس الأساسية</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-purple-800 ">عنوان الدرس</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="مثال درس الاحتمالات"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-purple-800 ">المواد والشعب الموجه لها الدرس</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-3 block">المواد (يمكن اختيار أكثر من مادة)</label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 bg-white border border-slate-200 rounded-lg">
                  {subjects.map(s => (
                    <label key={s.id} className="flex items-center space-x-3 space-x-reverse text-sm font-bold text-slate-600 cursor-pointer">
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
                        className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-600" 
                      />
                      <span>{s.title} ({LEVEL_ARABIC[s.level] || s.level}{s.stream && s.stream !== 'NONE' ? ` - ${STREAM_ARABIC[s.stream] || s.stream}` : ''})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-3 block">الشعب (يمكن اختيار أكثر من شعبة)</label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 bg-white border border-slate-200 rounded-lg">
                  {STREAMS.map(stream => (
                    <label key={stream} className="flex items-center space-x-3 space-x-reverse text-sm font-bold text-slate-600 cursor-pointer">
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
                        className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-600" 
                      />
                      <span>{STREAM_ARABIC[stream as string] || stream}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-purple-800 ">الشهر</label>
            <MonthSelect 
              value={month}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMonth(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-purple-800 ">Vimeo Video ID (أو رابط الفيديو)</label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
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
                className="w-full bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 text-base font-medium"
                placeholder="مثال: 123456789"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
        <h2 className="text-xl font-black text-purple-950 ">ملحقات الدرس كويز</h2>
        
        <div className="flex gap-4 p-1 bg-slate-100 rounded-xl w-max">
          <button
            type="button"
            onClick={() => setQuizType("MANUAL")}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${quizType === "MANUAL" ? "bg-white text-purple-700 shadow-sm" : "text-slate-500 hover:text-purple-800"}`}
          >
            توليد كويز يدويا مع التنقيط
          </button>
          <button
            type="button"
            onClick={() => setQuizType("AI")}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${quizType === "AI" ? "bg-white text-purple-700 shadow-sm" : "text-slate-500 hover:text-purple-800"}`}
          >
            <BrainCircuit className="w-4 h-4" />
            توليد كويز بالذكاء الاصطناعي
          </button>
        </div>

        {quizType === "MANUAL" ? (
          <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 ">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <label className="text-sm font-bold text-purple-800 ">التنقيط الإجمالي للكويز (ثابت)</label>
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
                      {q.options.map((opt, optIndex) => (
                        <div 
                          key={optIndex} 
                          className={`flex items-center gap-3 border rounded-lg p-2 transition-colors ${q.correctAnswerIndex === optIndex ? 'border-purple-700 bg-purple-50 dark:bg-purple-950/10' : 'border-slate-200 bg-white hover:border-purple-300'}`}
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
                              className="w-full bg-transparent text-sm font-medium focus:outline-none text-purple-800 "
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
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
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

            <div className="border-2 border-dashed border-purple-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-purple-50/50">
              <label className="flex flex-col items-center gap-4 cursor-pointer w-full">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-700">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-800 text-lg mb-1">
                    {aiImageFile ? aiImageFile.name : "اضغط لرفع صورة أو اسحبها هنا"}
                  </h3>
                  <p className="text-slate-500 text-sm max-w-md mx-auto">سيتم قراءة المحتوى وتوليد الأسئلة بشكل دقيق</p>
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files?.[0]) setAiImageFile(e.target.files[0]);
                  }}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={isGeneratingAi || !aiImageFile}
              className="w-full py-3.5 bg-white hover:bg-white text-purple-950 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isGeneratingAi ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري التوليد...
                </>
              ) : (
                <>
                  <BrainCircuit className="w-5 h-5" />
                  توليد الآن
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Materials Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
        <h2 className="text-xl font-black text-purple-950 ">ملحقات أخرى</h2>
        
        <div className="space-y-4">
          <label className="block border-2 border-dashed border-slate-200 hover:border-purple-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-white hover:bg-purple-50 ">
            <Upload className="w-8 h-8 mx-auto text-slate-400 mb-3" />
            <span className="font-bold text-slate-600 ">صور مع الدرس يأخذ التمام حجمهم كيما نرفعهم في Bucket Lessons Materials</span>
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
            <label className="block text-sm font-medium text-gray-700 mb-1 font-ibm-plex-sans-arabic text-right">
              عنوان المرفق (مثال: ملخص الوحدة الأولى)
            </label>
            <input
              type="text"
              placeholder="اكتب عنوان المرفق هنا..."
              value={materialTitle}
              onChange={(e) => setMaterialTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-purple-700 bg-white text-right font-ibm-plex-sans-arabic"
            />
          </div>

          {materials.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {materials.map((mat, i) => (
                <div key={i} className="flex flex-col gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-sm relative group">
                  <button 
                    type="button"
                    onClick={() => removeMaterial(i)}
                    className="absolute top-2 left-2 p-1.5 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-3 pr-2">
                    <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 truncate" dir="ltr">{mat.file.name}</p>
                      <p className="text-[10px] text-slate-400">{(mat.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 mt-1 border-t border-slate-200 pt-3">
                    <label className="text-xs font-bold text-purple-800 block">عنوان المرفق</label>
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
                      className="w-full text-sm font-bold text-purple-800 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
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
        className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-slate-950 font-black font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all disabled:opacity-70"
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
