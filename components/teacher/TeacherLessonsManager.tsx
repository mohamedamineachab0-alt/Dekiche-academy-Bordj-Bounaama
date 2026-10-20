"use client";

import React, { useState, useTransition } from "react";
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  HelpCircle,
  CheckCircle2,
  PlayCircle,
  ExternalLink,
  Search,
  Filter,
  X,
  Sparkles,
  BookOpen,
  Eye,
  AlertCircle,
  Check
} from "lucide-react";
import { MathPreview } from "@/components/shared/MathPreview";
import {
  uploadTeacherLessonMaterial,
  deleteTeacherLessonMaterial,
  saveTeacherLessonQuiz,
  deleteTeacherLessonQuiz,
  saveTeacherLessonVideo,
  removeTeacherLessonVideo,
  createTeacherLessonWithVideo,
} from "@/actions/teacher-dashboard";
import { levelMap, streamMap } from "@/lib/subject-formatter";

export interface TeacherLessonSubject {
  id: string;
  title: string;
  levels: string[];
}

export interface TeacherMaterial {
  id: string;
  title: string;
  fileUrl: string;
  createdAt?: string | Date;
}

export interface TeacherQuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  points: number;
}

export interface TeacherQuiz {
  id: string;
  maxScore: number;
  questions: any;
  aiGenerated: boolean;
  _count?: { completions: number };
}

export interface TeacherLesson {
  id: string;
  title: string;
  description?: string | null;
  month: number;
  order: number;
  youtubeVideoId?: string | null;
  vimeoVideoId?: string | null;
  image?: string | null;
  isTeacherUploaded?: boolean;
  createdAt?: string | Date;
  subjects: TeacherLessonSubject[];
  materials: TeacherMaterial[];
  quiz?: TeacherQuiz | null;
  _count: {
    completions: number;
    mistakes: number;
  };
}

export type FilterView = "ALL" | "MY_UPLOADED" | "YOUTUBE" | "WITH_MATERIALS" | "NO_VIDEO";

export interface TeacherSubjectInfo {
  id: string;
  title: string;
  levels: string[];
  streams: string[];
  _count: {
    lessons: number;
    enrollments: number;
  };
}

export function parseYoutubeId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);
  return match ? match[1] : null;
}

interface Props {
  subjects: TeacherSubjectInfo[];
  lessons: TeacherLesson[];
}

export function TeacherLessonsManager({ subjects, lessons }: Props) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("ALL");
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<FilterView>("ALL");

  // Modal states
  const [activeUploadLesson, setActiveUploadLesson] = useState<TeacherLesson | null>(null);
  const [activeQuizLesson, setActiveQuizLesson] = useState<TeacherLesson | null>(null);
  const [activeVideoLesson, setActiveVideoLesson] = useState<TeacherLesson | null>(null);
  const [activeWatchLesson, setActiveWatchLesson] = useState<TeacherLesson | null>(null);
  const [isNewLessonOpen, setIsNewLessonOpen] = useState(false);

  // Video Editor State
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [videoError, setVideoError] = useState("");
  const [isSavingVideo, startVideoTransition] = useTransition();

  // New Lesson Form State
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonSubjectId, setNewLessonSubjectId] = useState(subjects[0]?.id || "");
  const [newLessonMonth, setNewLessonMonth] = useState<number>(1);
  const [newLessonYoutubeUrl, setNewLessonYoutubeUrl] = useState("");
  const [newLessonDescription, setNewLessonDescription] = useState("");
  const [newLessonError, setNewLessonError] = useState("");
  const [isCreatingLesson, startCreateTransition] = useTransition();

  // Upload Form State
  const [materialTitle, setMaterialTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [isUploading, startUploadTransition] = useTransition();

  // Quiz Editor State
  const [quizQuestions, setQuizQuestions] = useState<TeacherQuizQuestion[]>([]);
  const [quizMaxScore, setQuizMaxScore] = useState<number>(20);
  const [quizError, setQuizError] = useState("");
  const [isSavingQuiz, startQuizTransition] = useTransition();

  // Pre-calculated stats for tabs
  const myUploadedCount = lessons.filter(
    (l) => l.isTeacherUploaded || !!l.youtubeVideoId
  ).length;
  const youtubeCount = lessons.filter((l) => !!l.youtubeVideoId).length;
  const materialsCount = lessons.filter((l) => l.materials && l.materials.length > 0).length;
  const noVideoCount = lessons.filter((l) => !l.youtubeVideoId && !l.vimeoVideoId).length;

  // Filter lessons
  const filteredLessons = lessons.filter((lesson) => {
    if (activeView === "MY_UPLOADED") {
      if (!lesson.isTeacherUploaded && !lesson.youtubeVideoId) return false;
    } else if (activeView === "YOUTUBE") {
      if (!lesson.youtubeVideoId) return false;
    } else if (activeView === "WITH_MATERIALS") {
      if (!lesson.materials || lesson.materials.length === 0) return false;
    } else if (activeView === "NO_VIDEO") {
      if (lesson.youtubeVideoId || lesson.vimeoVideoId) return false;
    }

    if (selectedSubjectId !== "ALL") {
      const matchSub = lesson.subjects.some((s) => s.id === selectedSubjectId);
      if (!matchSub) return false;
    }
    if (selectedMonth !== "ALL") {
      if (lesson.month.toString() !== selectedMonth) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = lesson.title.toLowerCase().includes(q);
      const matchSub = lesson.subjects.some((s) => s.title.toLowerCase().includes(q));
      if (!matchTitle && !matchSub) return false;
    }
    return true;
  });

  // Open Upload Modal
  const handleOpenUpload = (lesson: TeacherLesson) => {
    setActiveUploadLesson(lesson);
    setMaterialTitle(`ملخص ${lesson.title}`);
    setSelectedFile(null);
    setUploadError("");
  };

  // Submit Upload
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUploadLesson || !selectedFile || !materialTitle.trim()) {
      setUploadError("يرجى اختيار ملف وإدخال عنوان للملف");
      return;
    }

    startUploadTransition(async () => {
      const formData = new FormData();
      formData.append("lessonId", activeUploadLesson.id);
      formData.append("title", materialTitle.trim());
      formData.append("file", selectedFile);

      const res = await uploadTeacherLessonMaterial(formData);
      if (res.error) {
        setUploadError(res.error);
      } else {
        // Update local lesson materials
        if (res.data) {
          activeUploadLesson.materials.unshift(res.data);
        }
        setActiveUploadLesson(null);
      }
    });
  };

  // Delete Material
  const handleDeleteMaterial = (lesson: TeacherLesson, materialId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الملف المرفق؟")) return;

    startUploadTransition(async () => {
      const res = await deleteTeacherLessonMaterial(materialId);
      if (res.success) {
        lesson.materials = lesson.materials.filter((m) => m.id !== materialId);
      } else if (res.error) {
        alert(res.error);
      }
    });
  };

  // Open Quiz Modal
  const handleOpenQuiz = (lesson: TeacherLesson) => {
    setActiveQuizLesson(lesson);
    setQuizError("");

    if (lesson.quiz && Array.isArray(lesson.quiz.questions) && lesson.quiz.questions.length > 0) {
      setQuizQuestions(JSON.parse(JSON.stringify(lesson.quiz.questions)));
      setQuizMaxScore(lesson.quiz.maxScore || 20);
    } else {
      // Default template 4 questions tailored to lesson
      setQuizQuestions([
        {
          question: `سؤال تدريبي حول ${lesson.title}: ما هي القاعدة الأساسية التي تعتمد عليها في هذا الدرس؟`,
          options: [
            "تطبيق القواعد والخطوات المنهجية الصحيحة",
            "إجراء الحساب بشكل عشوائي دون ترتيب",
            "إهمال الإشارات والأولويات",
            "الاعتماد على التخمين فقط",
          ],
          correctAnswerIndex: 0,
          points: 5,
        },
        {
          question: `في سياق درس ${lesson.title}، اختر الإجابة الأدق:`,
          options: [
            "التحقق من صحة النتيجة بمطابقة المعطيات",
            "كتابة الناتج بدون خطوات",
            "تخطي شروط التطبيق",
            "تغيير المعطيات لتسهيل الحل",
          ],
          correctAnswerIndex: 0,
          points: 5,
        },
        {
          question: `ما هو الاستنتاج الرئيسي المستفاد من درس ${lesson.title}؟`,
          options: [
            "الالتزام بالقوانين المعرفية المقررة",
            "لا توجد فائدة مباشرة",
            "تطبيق القواعد في بعض الحالات فقط",
            "جميع الخيارات السابقة خاطئة",
          ],
          correctAnswerIndex: 0,
          points: 5,
        },
        {
          question: `تطبيق عملي: ما هي الخطوة الأولى التي يجب البدء بها عند حل مسألة حول ${lesson.title}؟`,
          options: [
            "قراءة المعطيات وتحديد المطلوب بدقة",
            "البدء في الحساب مباشرة بدون قراءة",
            "رسم شكل غير دقيق",
            "تسليم الإجابة فوراً",
          ],
          correctAnswerIndex: 0,
          points: 5,
        },
      ]);
      setQuizMaxScore(20);
    }
  };

  // Add question to quiz
  const handleAddQuestion = () => {
    const pts = 5;
    setQuizQuestions([
      ...quizQuestions,
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswerIndex: 0,
        points: pts,
      },
    ]);
  };

  // Remove question
  const handleRemoveQuestion = (idx: number) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== idx));
  };

  // Save Quiz
  const handleSaveQuiz = () => {
    if (!activeQuizLesson) return;
    if (quizQuestions.length === 0) {
      setQuizError("يجب إضافة سؤال واحد على الأقل");
      return;
    }

    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i];
      if (!q.question.trim()) {
        setQuizError(`يرجى كتابة نص السؤال رقم ${i + 1}`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setQuizError(`يرجى إكمال خيارات السؤال رقم ${i + 1}`);
          return;
        }
      }
    }

    startQuizTransition(async () => {
      const res = await saveTeacherLessonQuiz(
        activeQuizLesson.id,
        quizQuestions,
        quizMaxScore
      );
      if (res.error) {
        setQuizError(res.error);
      } else {
        activeQuizLesson.quiz = {
          id: res.data?.id || "temp",
          maxScore: quizMaxScore,
          questions: quizQuestions,
          aiGenerated: false,
        };
        setActiveQuizLesson(null);
      }
    });
  };

  // Delete Quiz
  const handleDeleteQuiz = () => {
    if (!activeQuizLesson) return;
    if (!confirm("هل أنت متأكد من حذف هذا الكويز من الدرس؟")) return;

    startQuizTransition(async () => {
      const res = await deleteTeacherLessonQuiz(activeQuizLesson.id);
      if (res.success) {
        activeQuizLesson.quiz = null;
        setActiveQuizLesson(null);
      } else if (res.error) {
        setQuizError(res.error);
      }
    });
  };

  // Open Video Modal
  const handleOpenVideo = (lesson: TeacherLesson) => {
    setActiveVideoLesson(lesson);
    setVideoUrlInput(
      lesson.youtubeVideoId
        ? `https://www.youtube.com/watch?v=${lesson.youtubeVideoId}`
        : ""
    );
    setVideoError("");
  };

  // Save Video URL
  const handleSaveVideo = () => {
    if (!activeVideoLesson) return;
    const extracted = parseYoutubeId(videoUrlInput);
    if (!extracted) {
      setVideoError("يرجى إدخال رابط يوتيوب صحيح (مثال: https://www.youtube.com/watch?v=... أو https://youtu.be/...)");
      return;
    }
    setVideoError("");
    startVideoTransition(async () => {
      const res = await saveTeacherLessonVideo(activeVideoLesson.id, videoUrlInput);
      if (res.error) {
        setVideoError(res.error);
      } else {
        activeVideoLesson.youtubeVideoId = extracted;
        setActiveVideoLesson(null);
      }
    });
  };

  // Remove Video
  const handleRemoveVideo = () => {
    if (!activeVideoLesson) return;
    if (!confirm("هل أنت متأكد من حذف رابط الفيديو من هذا الدرس؟")) return;

    startVideoTransition(async () => {
      const res = await removeTeacherLessonVideo(activeVideoLesson.id);
      if (res.error) {
        setVideoError(res.error);
      } else {
        activeVideoLesson.youtubeVideoId = null;
        setActiveVideoLesson(null);
      }
    });
  };

  // Open New Lesson Modal
  const handleOpenNewLesson = () => {
    setNewLessonTitle("");
    setNewLessonSubjectId(subjects[0]?.id || "");
    setNewLessonMonth(1);
    setNewLessonYoutubeUrl("");
    setNewLessonDescription("");
    setNewLessonError("");
    setIsNewLessonOpen(true);
  };

  // Submit New Lesson
  const handleCreateLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) {
      setNewLessonError("يرجى إدخال عنوان الدرس");
      return;
    }
    if (!newLessonSubjectId) {
      setNewLessonError("يرجى اختيار المادة المشرف عليها");
      return;
    }
    const extracted = parseYoutubeId(newLessonYoutubeUrl);
    if (!extracted) {
      setNewLessonError("يرجى إدخال رابط فيديو يوتيوب صحيح (مثال: https://www.youtube.com/watch?v=...)");
      return;
    }

    setNewLessonError("");
    startCreateTransition(async () => {
      const res = await createTeacherLessonWithVideo({
        title: newLessonTitle,
        subjectId: newLessonSubjectId,
        month: newLessonMonth,
        youtubeUrlOrId: newLessonYoutubeUrl,
        description: newLessonDescription,
      });

      if (res.error) {
        setNewLessonError(res.error);
      } else {
        setIsNewLessonOpen(false);
        window.location.reload();
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Quick View / Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-3">
        <button
          type="button"
          onClick={() => setActiveView("ALL")}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeView === "ALL"
              ? "bg-primary text-white shadow-xs"
              : "bg-surface text-muted hover:text-ink border border-line"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>جميع الدروس</span>
          <span className="font-mono text-[11px] opacity-80 ms-1 px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/10">
            {lessons.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView("MY_UPLOADED")}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeView === "MY_UPLOADED"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-surface text-muted hover:text-ink border border-line"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>الدروس التي رفعتها</span>
          <span className="font-mono text-[11px] ms-1 px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-800 dark:text-emerald-200">
            {myUploadedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView("YOUTUBE")}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeView === "YOUTUBE"
              ? "bg-red-600 text-white shadow-xs"
              : "bg-surface text-muted hover:text-ink border border-line"
          }`}
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span>فيديوهات يوتيوب</span>
          <span className="font-mono text-[11px] ms-1 px-1.5 py-0.2 rounded-md bg-red-500/20 text-red-800 dark:text-red-200">
            {youtubeCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView("WITH_MATERIALS")}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeView === "WITH_MATERIALS"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-surface text-muted hover:text-ink border border-line"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>ملفات PDF</span>
          <span className="font-mono text-[11px] ms-1 px-1.5 py-0.2 rounded-md bg-blue-500/20 text-blue-800 dark:text-blue-200">
            {materialsCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView("NO_VIDEO")}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeView === "NO_VIDEO"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-surface text-muted hover:text-ink border border-line"
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>بدون فيديو</span>
          <span className="font-mono text-[11px] ms-1 px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-200">
            {noVideoCount}
          </span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="surface-card p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border border-line">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute inset-s-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث عن درس بالاسم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface ps-10 pe-4 py-2.5 rounded-xl border border-line text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="bg-surface px-3 py-2.5 rounded-xl border border-line text-sm text-ink focus:outline-none focus:border-primary"
          >
            <option value="ALL">كل المواد المشرف عليها</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.title} ({sub.levels.map((l) => levelMap[l] || l).join("، ")})
              </option>
            ))}
          </select>

          {/* Month Filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-surface px-3 py-2.5 rounded-xl border border-line text-sm text-ink focus:outline-none focus:border-primary"
          >
            <option value="ALL">كل الأشهر</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m.toString()}>
                الشهر {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 shrink-0">
          <div className="text-xs font-semibold text-muted flex items-center gap-2">
            <span>الدروس:</span>
            <span className="font-mono text-sm font-bold bg-primary-soft text-primary px-2.5 py-1 rounded-lg">
              {filteredLessons.length}
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenNewLesson}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>نشر درس جديد برابط يوتيوب</span>
          </button>
        </div>
      </div>

      {/* Lessons List Table/Grid */}
      {filteredLessons.length === 0 ? (
        <div className="surface-card p-12 text-center rounded-2xl border border-line space-y-3">
          {activeView === "MY_UPLOADED" ? (
            <>
              <Sparkles className="w-12 h-12 text-muted/40 mx-auto mb-1" />
              <h3 className="text-base font-bold text-ink">لم تقم برفع أي دروس بعد</h3>
              <p className="text-sm text-muted max-w-md mx-auto">
                يمكنك نشر درس جديد برابط يوتيوب مباشرة أو إضافة رابط فيديو لأي من دروس المواد المسندة إليك.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleOpenNewLesson}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>نشر درسك الأول برابط يوتيوب</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <BookOpen className="w-12 h-12 text-muted/40 mx-auto mb-1" />
              <h3 className="text-base font-bold text-ink">لا توجد دروس مطابقة</h3>
              <p className="text-sm text-muted max-w-md mx-auto">
                لم يتم العثور على أي دروس وفق معايير البحث والفلترة المحددة.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLessons.map((lesson) => {
            const hasQuiz = !!lesson.quiz;
            const qCount = hasQuiz && Array.isArray(lesson.quiz?.questions) ? lesson.quiz.questions.length : 0;
            const materialsCount = lesson.materials?.length || 0;

            return (
              <div
                key={lesson.id}
                className="surface-card p-4 sm:p-5 rounded-2xl border border-line hover:border-primary/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Lesson Info */}
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge-soft text-xs font-mono">
                      الشهر {lesson.month} | #{lesson.order}
                    </span>
                    {lesson.isTeacherUploaded && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        <Check className="w-3 h-3" />
                        درس رفعته أنت
                      </span>
                    )}
                    {lesson.youtubeVideoId && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-red-600 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                        <PlayCircle className="w-3 h-3" />
                        يوتيوب
                      </span>
                    )}
                    {lesson.subjects.map((sub) => (
                      <span
                        key={sub.id}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-surface-muted text-muted border border-line"
                      >
                        {sub.title}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-base font-bold text-ink leading-snug wrap-break-word">
                    {lesson.title}
                  </h3>

                  {/* Materials & Stats preview */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted pt-1">
                    <span className="inline-flex items-center gap-1 font-mono">
                      <Eye className="w-3.5 h-3.5 text-primary" />
                      {lesson._count.completions} مشاهدة / إتمام
                    </span>

                    {/* PDF Materials count */}
                    <span className="inline-flex items-center gap-1 font-mono">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      {materialsCount} ملف مرفق (PDF)
                    </span>

                    {/* Quiz status */}
                    <span
                      className={`inline-flex items-center gap-1 font-medium ${
                        hasQuiz ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      {hasQuiz ? `كويز مفعّل (${qCount} أسئلة - ${lesson.quiz?.maxScore || 20}ن)` : "بدون كويز"}
                    </span>
                  </div>

                  {/* PDF Materials list */}
                  {materialsCount > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2">
                      {lesson.materials.map((mat) => (
                        <div
                          key={mat.id}
                          className="inline-flex items-center gap-1.5 bg-surface text-ink px-2.5 py-1 rounded-lg border border-line text-xs font-medium"
                        >
                          <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                          <a
                            href={mat.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline hover:text-primary truncate max-w-45"
                            title={mat.title}
                          >
                            {mat.title}
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteMaterial(lesson, mat.id)}
                            className="text-muted hover:text-red-600 p-0.5 rounded transition-colors cursor-pointer"
                            title="حذف الملف"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions: Watch, YouTube Video, Upload PDF & Manage Quiz */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-line">
                  {/* Watch Video button */}
                  {(lesson.youtubeVideoId || lesson.vimeoVideoId) && (
                    <button
                      type="button"
                      onClick={() => setActiveWatchLesson(lesson)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer bg-primary-soft text-primary hover:bg-primary hover:text-white"
                      title="مشاهدة الفيديو المرفوع"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>مشاهدة الفيديو</span>
                    </button>
                  )}

                  {/* YouTube Video button */}
                  <button
                    type="button"
                    onClick={() => handleOpenVideo(lesson)}
                    className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      lesson.youtubeVideoId
                        ? "bg-red-500/10 text-red-600 border border-red-500/30 hover:bg-red-500/20"
                        : "bg-surface text-ink border border-line hover:border-red-500 hover:text-red-600"
                    }`}
                  >
                    <PlayCircle className={`w-3.5 h-3.5 ${lesson.youtubeVideoId ? "text-red-600" : "text-muted"}`} />
                    <span>{lesson.youtubeVideoId ? "فيديو يوتيوب" : "+ رابط يوتيوب"}</span>
                  </button>

                  {/* Upload PDF button */}
                  <button
                    type="button"
                    onClick={() => handleOpenUpload(lesson)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-line bg-surface text-ink hover:border-primary hover:text-primary transition-all shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-primary" />
                    <span>رفع ملف PDF</span>
                  </button>

                  {/* Manage Quiz button */}
                  <button
                    type="button"
                    onClick={() => handleOpenQuiz(lesson)}
                    className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      hasQuiz
                        ? "bg-primary text-white hover:bg-primary-hover"
                        : "bg-surface text-primary border border-primary/40 hover:bg-primary-soft"
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{hasQuiz ? "تعديل الكويز" : "إنشاء كويز"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: Upload PDF Material                              */}
      {/* ========================================================= */}
      {activeUploadLesson && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="surface-card w-full max-w-md rounded-3xl border border-line shadow-2xl p-6 relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-ink">رفع ملحق PDF للدرس</h3>
                <p className="text-xs text-muted mt-0.5 line-clamp-1">
                  الدرس: {activeUploadLesson.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveUploadLesson(null)}
                className="text-muted hover:text-ink p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {uploadError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600">
                  {uploadError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  عنوان الملحق / الوثيقة:
                </label>
                <input
                  type="text"
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  placeholder="مثال: ملخص الدرس / ورقة التمارين / واجب منزلي"
                  className="w-full bg-surface px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  حدد ملف PDF:
                </label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-ink file:me-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover cursor-pointer"
                  required
                />
                <p className="text-[11px] text-muted mt-1.5">
                  يقبل ملفات PDF ليتمكن التلاميذ من تحميلها ومراجعتها.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveUploadLesson(null)}
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-ink transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="btn-primary text-xs px-5 py-2.5 rounded-xl font-bold flex items-center gap-1.5"
                >
                  {isUploading ? (
                    <span>جارٍ الرفع...</span>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع وحفظ الملحق</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: Quiz Management & Question Editor                 */}
      {/* ========================================================= */}
      {activeQuizLesson && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="surface-card w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border border-line shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-line flex items-center justify-between shrink-0 bg-surface">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <h3 className="text-base sm:text-lg font-bold text-ink">
                    إدارة وتعديل كويز الدرس
                  </h3>
                </div>
                <p className="text-xs text-muted mt-0.5 truncate max-w-md">
                  الدرس: {activeQuizLesson.title}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-bold bg-primary-soft text-primary px-3 py-1.5 rounded-xl">
                  <span>العلامة:</span>
                  <span>{quizMaxScore} / 20</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveQuizLesson(null)}
                  className="text-muted hover:text-ink p-1.5 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Scrollable Question Editor */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              {quizError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{quizError}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-muted/60 p-3.5 rounded-2xl border border-line text-xs">
                <span className="text-muted leading-relaxed">
                  يمكنك استخدام صيغ الرياضيات $...$ في نص السؤال والخيارات (مثال: $A = \frac{1}{2}$).
                </span>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="btn-primary text-xs px-3.5 py-1.5 rounded-xl font-bold inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة سؤال جديد</span>
                </button>
              </div>

              {/* Questions List */}
              <div className="space-y-5">
                {quizQuestions.map((q, qIndex) => (
                  <div
                    key={qIndex}
                    className="p-4 sm:p-5 rounded-2xl bg-surface border border-line space-y-4 relative"
                  >
                    {/* Question Header */}
                    <div className="flex items-center justify-between gap-2 border-b border-line pb-3">
                      <span className="font-bold text-sm text-ink flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-mono">
                          {qIndex + 1}
                        </span>
                        السؤال {qIndex + 1}
                      </span>

                      <div className="flex items-center gap-3">
                        <label className="text-xs text-muted flex items-center gap-1.5">
                          <span>النقاط:</span>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={q.points}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              const updated = [...quizQuestions];
                              updated[qIndex].points = val;
                              setQuizQuestions(updated);
                            }}
                            className="w-14 bg-surface-muted px-2 py-1 rounded-lg border border-line text-xs font-mono text-center text-ink"
                          />
                        </label>

                        {quizQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIndex)}
                            className="text-muted hover:text-red-600 p-1 rounded-lg transition-colors"
                            title="حذف هذا السؤال"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Question Input */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-ink">
                        نص السؤال:
                      </label>
                      <textarea
                        rows={2}
                        value={q.question}
                        onChange={(e) => {
                          const updated = [...quizQuestions];
                          updated[qIndex].question = e.target.value;
                          setQuizQuestions(updated);
                        }}
                        placeholder="أدخل نص السؤال هنا..."
                        className="w-full bg-surface-muted px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink focus:outline-none focus:border-primary resize-y"
                      />
                      {q.question && (
                        <div className="bg-surface px-3 py-1.5 rounded-lg border border-line/60">
                          <span className="text-[11px] text-muted block mb-0.5">معاينة نص السؤال:</span>
                          <MathPreview text={q.question} className="text-xs text-ink" />
                        </div>
                      )}
                    </div>

                    {/* Options (Choices) */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-semibold text-ink">
                        الخيارات (اختر الدائرة بجانب الإجابة الصحيحة):
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options.map((opt, optIndex) => {
                          const isCorrect = q.correctAnswerIndex === optIndex;
                          return (
                            <div
                              key={optIndex}
                              className={`p-2.5 rounded-xl border transition-all ${
                                isCorrect
                                  ? "bg-emerald-500/10 border-emerald-500/30"
                                  : "bg-surface-muted border-line"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <input
                                  type="radio"
                                  name={`correct-${qIndex}`}
                                  checked={isCorrect}
                                  onChange={() => {
                                    const updated = [...quizQuestions];
                                    updated[qIndex].correctAnswerIndex = optIndex;
                                    setQuizQuestions(updated);
                                  }}
                                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                                />
                                <span className="text-xs font-bold text-ink">
                                  الخيار {String.fromCharCode(65 + optIndex)}
                                  {isCorrect && (
                                    <span className="text-emerald-700 font-semibold ms-1.5 text-[11px]">
                                      (الإجابة الصحيحة)
                                    </span>
                                  )}
                                </span>
                              </div>

                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const updated = [...quizQuestions];
                                  updated[qIndex].options[optIndex] = e.target.value;
                                  setQuizQuestions(updated);
                                }}
                                placeholder={`نص الخيار ${String.fromCharCode(65 + optIndex)}...`}
                                className="w-full bg-surface px-3 py-1.5 rounded-lg border border-line text-xs text-ink focus:outline-none focus:border-primary"
                              />

                              {opt && (
                                <div className="mt-1">
                                  <MathPreview text={opt} className="text-[11px] text-muted truncate" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-line bg-surface flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              {activeQuizLesson.quiz ? (
                <button
                  type="button"
                  onClick={handleDeleteQuiz}
                  disabled={isSavingQuiz}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف الكويز نهائياً</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveQuizLesson(null)}
                  disabled={isSavingQuiz}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-muted hover:text-ink transition-colors"
                >
                  إلغاء
                </button>

                <button
                  type="button"
                  onClick={handleSaveQuiz}
                  disabled={isSavingQuiz}
                  className="btn-primary text-xs px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5"
                >
                  {isSavingQuiz ? (
                    <span>جارٍ الحفظ...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>حفظ الكويز وتفعيله للدرس</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: YouTube Video Manager                            */}
      {/* ========================================================= */}
      {activeVideoLesson && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="surface-card w-full max-w-xl rounded-3xl border border-line shadow-2xl p-6 relative space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-ink">إدارة رابط فيديو يوتيوب</h3>
                <p className="text-xs text-muted mt-0.5 line-clamp-1">
                  الدرس: {activeVideoLesson.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideoLesson(null)}
                className="text-muted hover:text-ink p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {videoError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{videoError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  رابط فيديو يوتيوب أو معرّف الفيديو (Video ID):
                </label>
                <input
                  type="text"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder="مثال: https://www.youtube.com/watch?v=dQw4w9WgXcQ أو https://youtu.be/..."
                  className="w-full bg-surface px-3.5 py-2.5 rounded-xl border border-line text-xs text-ink placeholder:text-muted focus:outline-none focus:border-primary font-mono"
                  dir="ltr"
                />
                <p className="text-[11px] text-muted mt-1">
                  يدعم الروابط العادية، روابط الاختصار youtu.be، روابط Shorts، أو معرّف الفيديو مباشرة (11 حرف).
                </p>
              </div>

              {(() => {
                const parsedId = parseYoutubeId(videoUrlInput);
                if (parsedId) {
                  return (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-ink">معاينة الفيديو مباشرة:</span>
                        <span className="font-mono text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 text-[11px]">
                          ID: {parsedId}
                        </span>
                      </div>
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-line bg-black">
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${parsedId}?rel=0`}
                          title="معاينة فيديو يوتيوب"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  );
                }
                if (videoUrlInput.trim()) {
                  return (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>لم يتم التعرف على معرّف فيديو صالح بعد. تأكد من صحة الرابط المدخل.</span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-line">
              {activeVideoLesson.youtubeVideoId ? (
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  disabled={isSavingVideo}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف الفيديو من الدرس</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveVideoLesson(null)}
                  disabled={isSavingVideo}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-ink transition-colors cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="button"
                  onClick={handleSaveVideo}
                  disabled={isSavingVideo || !parseYoutubeId(videoUrlInput)}
                  className="btn-primary text-xs px-5 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingVideo ? (
                    <span>جارٍ الحفظ...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>حفظ وتفعيل الفيديو</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: Create New Lesson with YouTube                   */}
      {/* ========================================================= */}
      {isNewLessonOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="surface-card w-full max-w-xl rounded-3xl border border-line shadow-2xl p-6 relative space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-ink">نشر درس جديد برابط يوتيوب</h3>
                <p className="text-xs text-muted mt-0.5">
                  إضافة درس جديد مع رابط يوتيوب ليكون متاحاً لطلابك في المنصة مباشرة.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewLessonOpen(false)}
                className="text-muted hover:text-ink p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {newLessonError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{newLessonError}</span>
              </div>
            )}

            <form onSubmit={handleCreateLessonSubmit} className="space-y-4">
              {/* Supervised Subject */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  المادة المشرف عليها:
                </label>
                <select
                  value={newLessonSubjectId}
                  onChange={(e) => setNewLessonSubjectId(e.target.value)}
                  className="w-full bg-surface px-3 py-2.5 rounded-xl border border-line text-sm text-ink focus:outline-none focus:border-primary"
                  required
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.title} ({sub.levels.map((l) => levelMap[l] || l).join("، ")})
                    </option>
                  ))}
                </select>
              </div>

              {/* Lesson Title */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  عنوان الدرس:
                </label>
                <input
                  type="text"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="مثال: الدرس 01 - العمليات على الأعداد الطبيعية والعشرية"
                  className="w-full bg-surface px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primary"
                  required
                />
              </div>

              {/* Month */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  الشهر الدراسي:
                </label>
                <select
                  value={newLessonMonth}
                  onChange={(e) => setNewLessonMonth(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-surface px-3 py-2.5 rounded-xl border border-line text-sm text-ink focus:outline-none focus:border-primary"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      الشهر {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* YouTube Link */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  رابط فيديو يوتيوب:
                </label>
                <input
                  type="text"
                  value={newLessonYoutubeUrl}
                  onChange={(e) => setNewLessonYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-surface px-3.5 py-2.5 rounded-xl border border-line text-xs text-ink placeholder:text-muted focus:outline-none focus:border-primary font-mono"
                  dir="ltr"
                  required
                />
              </div>

              {/* Preview */}
              {(() => {
                const parsedId = parseYoutubeId(newLessonYoutubeUrl);
                if (parsedId) {
                  return (
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-ink">معاينة الفيديو:</span>
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-line bg-black">
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${parsedId}?rel=0`}
                          title="معاينة الدرس الجديد"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Optional Description */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  ملاحظات أو وصف الدرس (اختياري):
                </label>
                <textarea
                  value={newLessonDescription}
                  onChange={(e) => setNewLessonDescription(e.target.value)}
                  rows={2}
                  placeholder="إرشادات للطلبة قبل مشاهدة الدرس..."
                  className="w-full bg-surface px-3.5 py-2 rounded-xl border border-line text-xs text-ink placeholder:text-muted focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsNewLessonOpen(false)}
                  disabled={isCreatingLesson}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-ink transition-colors cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isCreatingLesson || !newLessonTitle.trim() || !parseYoutubeId(newLessonYoutubeUrl)}
                  className="btn-primary text-xs px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isCreatingLesson ? (
                    <span>جارٍ النشر...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>نشر الدرس الآن</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: Watch Lesson Video                               */}
      {/* ========================================================= */}
      {activeWatchLesson && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="surface-card w-full max-w-2xl rounded-3xl border border-line shadow-2xl p-6 relative space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="badge-soft text-xs font-mono">الشهر {activeWatchLesson.month}</span>
                  {activeWatchLesson.isTeacherUploaded && (
                    <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      درس رفعته أنت
                    </span>
                  )}
                  {activeWatchLesson.youtubeVideoId ? (
                    <span className="text-[11px] font-mono text-red-600 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                      يوتيوب
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                      فيميو
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-ink">{activeWatchLesson.title}</h3>
                <p className="text-xs text-muted mt-0.5">
                  {activeWatchLesson.subjects.map((s) => s.title).join(" • ")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveWatchLesson(null)}
                className="text-muted hover:text-ink p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-line bg-black">
              {activeWatchLesson.youtubeVideoId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeWatchLesson.youtubeVideoId}?rel=0&modestbranding=1`}
                  title={activeWatchLesson.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : activeWatchLesson.vimeoVideoId ? (
                <iframe
                  src={`https://player.vimeo.com/video/${activeWatchLesson.vimeoVideoId}`}
                  title={activeWatchLesson.title}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : null}
            </div>

            {/* Lesson details / materials */}
            {activeWatchLesson.materials && activeWatchLesson.materials.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-semibold text-ink">الملفات المرفقة بالدرس (PDF):</span>
                <div className="flex flex-wrap gap-2">
                  {activeWatchLesson.materials.map((mat) => (
                    <a
                      key={mat.id}
                      href={mat.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-surface text-ink px-3 py-1.5 rounded-xl border border-line text-xs font-medium hover:border-primary hover:text-primary transition-all"
                    >
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      <span>{mat.title}</span>
                      <ExternalLink className="w-3 h-3 text-muted" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Actions footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line">
              <a
                href={`/dashboard/student/lessons/${activeWatchLesson.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>عرض صفحة الدرس كما تظهر للطالب</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const l = activeWatchLesson;
                    setActiveWatchLesson(null);
                    handleOpenVideo(l);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-surface text-ink border border-line hover:border-red-500 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>تعديل رابط الفيديو</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveWatchLesson(null)}
                  className="btn-primary text-xs px-5 py-2 rounded-xl font-bold cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
