"use client";

import React, { useState } from "react";
import {
  Film,
  Scissors,
  CheckCircle2,
  Clock,
  User,
  BookOpen,
  Calendar,
  Trash2,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Search,
  Filter,
  Layers,
  ChevronDown,
} from "lucide-react";
import { LEVEL_ARABIC, STREAM_ARABIC } from "@/lib/education-labels";

export interface PendingLessonItem {
  id: string;
  title: string;
  stream: string;
  level: string;
  month: number;
  editingNotes: string;
  vimeoVideoId: string;
  vimeoUrl?: string | null;
  status: string; // 'pending' | 'published'
  createdAt: string | Date;
  subject: {
    id: string;
    title: string;
    teacherName: string;
  };
  teacher?: {
    id: string;
    fullName: string;
    phoneNumber: string;
  } | null;
  publishedLesson?: {
    id: string;
    title: string;
    createdAt: string | Date;
  } | null;
}

interface PendingLessonsReviewProps {
  initialLessons: PendingLessonItem[];
}

export function PendingLessonsReview({ initialLessons }: PendingLessonsReviewProps) {
  const [lessons, setLessons] = useState<PendingLessonItem[]>(initialLessons);
  const [selectedFilter, setSelectedFilter] = useState<"pending" | "published" | "all">("pending");
  const [searchQuery, setSearchQuery] = useState("");

  // Editing state per lesson (store edited title, description, month)
  const [editStates, setEditStates] = useState<
    Record<
      string,
      {
        title: string;
        description: string;
        month: number;
      }
    >
  >(() => {
    const map: Record<string, { title: string; description: string; month: number }> = {};
    initialLessons.forEach((l) => {
      map[l.id] = {
        title: l.title,
        description: "",
        month: l.month || 1,
      };
    });
    return map;
  });

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Filter lessons
  const filteredLessons = lessons.filter((l) => {
    if (selectedFilter !== "all" && l.status !== selectedFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = l.title.toLowerCase().includes(q);
      const matchSubject = l.subject.title.toLowerCase().includes(q);
      const matchTeacher = l.teacher?.fullName.toLowerCase().includes(q) || false;
      const matchNotes = l.editingNotes.toLowerCase().includes(q);
      return matchTitle || matchSubject || matchTeacher || matchNotes;
    }
    return true;
  });

  // Handle Edit Field Change
  const handleFieldChange = (id: string, field: "title" | "description" | "month", value: any) => {
    setEditStates((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || { title: "", description: "", month: 1 }),
        [field]: value,
      },
    }));
  };

  // Approve and Publish Lesson
  const handleApprove = async (id: string) => {
    setProcessingId(id);
    setActionMessage(null);
    try {
      const editState = editStates[id] || {
        title: lessons.find((l) => l.id === id)?.title || "",
        description: "",
        month: 1,
      };

      const res = await fetch(`/api/admin/pending-lessons/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editState.title,
          description: editState.description,
          month: editState.month,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل اعتماد ونشر الدرس");
      }

      // Update state locally
      setLessons((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "published",
                title: editState.title,
                publishedLesson: {
                  id: data.lesson.id,
                  title: data.lesson.title,
                  createdAt: new Date(),
                },
              }
            : item
        )
      );

      setActionMessage({
        type: "success",
        text: `تم اعتماد الدرس "${editState.title}" ونشره للطلاب بنجاح!`,
      });
    } catch (err: any) {
      console.error(err);
      setActionMessage({
        type: "error",
        text: err.message || "حدث خطأ أثناء اعتماد الدرس",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Delete / Reject Lesson
  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا الدرس من قائمة المراجعة؟")) return;

    setProcessingId(id);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/pending-lessons?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل حذف الدرس");

      setLessons((prev) => prev.filter((item) => item.id !== id));
      setActionMessage({
        type: "success",
        text: "تم حذف الدرس بنجاح من القائمة",
      });
    } catch (err: any) {
      console.error(err);
      setActionMessage({
        type: "error",
        text: err.message || "حدث خطأ أثناء حذف الدرس",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Stats calculation
  const pendingCount = lessons.filter((l) => l.status === "pending").length;
  const publishedCount = lessons.filter((l) => l.status === "published").length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16" dir="rtl">
      {/* Header */}
      <div className="surface-card p-6 md:p-8 border border-purple-500/20 bg-gradient-to-br from-purple-950/20 via-neutral-900/60 to-neutral-950">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              لوحة الإدارة والمونتاج
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-ink">
              مراجعة واعتماد الدروس المسجلة
            </h1>
            <p className="text-muted text-sm mt-1">
              استعراض فيديوهات الأساتذة المسجلة مباشرة على Vimeo، قراءة ملاحظات المونتاج والقص، ثم اعتماد الدرس ونشره للطلاب بضغطة واحدة.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-line/60">
          <div className="surface-card p-4 border border-line bg-surface/50">
            <span className="text-xs text-muted block">دروس قيد المراجعة (Pending)</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-black text-amber-400">{pendingCount}</span>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="surface-card p-4 border border-line bg-surface/50">
            <span className="text-xs text-muted block">دروس تم اعتمادها ونشرها</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-black text-emerald-400">{publishedCount}</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="surface-card p-4 border border-line bg-surface/50">
            <span className="text-xs text-muted block">إجمالي التسجيلات</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-black text-purple-400">{lessons.length}</span>
              <Film className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Message Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm animate-in fade-in duration-200 ${
            actionMessage.type === "success"
              ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
              : "bg-rose-950/30 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs text-muted hover:text-ink transition-colors"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Controls Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-surface border border-line">
          <button
            onClick={() => setSelectedFilter("pending")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              selectedFilter === "pending"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-muted hover:text-ink"
            }`}
          >
            معلقة ({pendingCount})
          </button>
          <button
            onClick={() => setSelectedFilter("published")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              selectedFilter === "published"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-muted hover:text-ink"
            }`}
          >
            منشورة ({publishedCount})
          </button>
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              selectedFilter === "all"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-muted hover:text-ink"
            }`}
          >
            الكل ({lessons.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="بحث بالعنوان، الأستاذ، أو الملاحظات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-10 py-2 rounded-xl bg-surface border border-line focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs text-ink placeholder:text-muted transition-all"
          />
        </div>
      </div>

      {/* Lessons List */}
      {filteredLessons.length === 0 ? (
        <div className="surface-card p-12 text-center border border-line rounded-2xl space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-neutral-900 border border-line flex items-center justify-center text-muted">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-ink text-base">لا توجد دروس مسجلة مطابقة</h3>
          <p className="text-muted text-xs max-w-sm mx-auto">
            لم يتم العثور على أي تسجيلات ضمن هذا التصنيف أو تطابق عملية البحث الحالية.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredLessons.map((lesson) => {
            const currentEdit = editStates[lesson.id] || {
              title: lesson.title,
              description: "",
              month: lesson.month || 1,
            };
            const isPending = lesson.status === "pending";
            const isProcessing = processingId === lesson.id;
            const levelLabel = LEVEL_ARABIC[lesson.level] || lesson.level;
            const streamLabel = STREAM_ARABIC[lesson.stream] || lesson.stream;

            return (
              <div
                key={lesson.id}
                className={`surface-card border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isPending
                    ? "border-purple-500/30 bg-neutral-950 shadow-xl"
                    : "border-line/70 bg-surface/30 opacity-90"
                }`}
              >
                {/* Lesson Header Bar */}
                <div className="p-4 sm:p-6 bg-surface/60 border-b border-line flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        isPending
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      {isPending ? "قيد المراجعة والمونتاج" : "تم النشر للطلاب"}
                    </span>

                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      {lesson.subject.title}
                    </span>

                    <span className="px-2.5 py-1 rounded-md text-xs bg-neutral-800 text-ink/80 border border-line">
                      {levelLabel}
                    </span>

                    {lesson.stream !== "NONE" && (
                      <span className="px-2.5 py-1 rounded-md text-xs bg-neutral-800 text-ink/80 border border-line">
                        {streamLabel}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-purple-400" />
                      {lesson.teacher?.fullName || lesson.subject.teacherName || "الأستاذ"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(lesson.createdAt).toLocaleDateString("ar-DZ")}
                    </span>
                  </div>
                </div>

                {/* Main Body: Vimeo Player + Review Data */}
                <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Video Player Column */}
                  <div className="lg:col-span-6 space-y-3">
                    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-line relative shadow-lg">
                      <iframe
                        src={`https://player.vimeo.com/video/${lesson.vimeoVideoId}?title=0&byline=0&portrait=0`}
                        className="w-full h-full border-0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={lesson.title}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted px-1">
                      <span>معرف Vimeo: <strong className="font-mono text-purple-400">{lesson.vimeoVideoId}</strong></span>
                      <a
                        href={`https://vimeo.com/${lesson.vimeoVideoId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        فتح على Vimeo
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Teacher's Notes & Editing Column */}
                  <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      {/* Teacher's Montage Notes Highlight Box */}
                      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                            <Scissors className="w-4 h-4 text-amber-400" />
                            ملاحظات المونتاج والتعديل المرسلة من الأستاذ:
                          </span>
                        </div>
                        <div className="text-xs text-amber-100/90 whitespace-pre-wrap leading-relaxed font-sans bg-amber-900/20 p-2.5 rounded-lg border border-amber-500/20">
                          {lesson.editingNotes.trim() ? (
                            lesson.editingNotes
                          ) : (
                            <span className="italic text-muted">لا توجد ملاحظات مونتاج مرفقة بهذا الدرس.</span>
                          )}
                        </div>
                      </div>

                      {/* Admin Pre-publish Edits */}
                      {isPending ? (
                        <div className="space-y-3 bg-surface/40 p-3.5 rounded-xl border border-line">
                          <span className="text-xs font-bold text-ink block">
                            تعديل بيانات النشر النهائية (اختياري):
                          </span>

                          <div className="space-y-1">
                            <label className="text-[11px] text-muted block">عنوان الدرس للطلاب:</label>
                            <input
                              type="text"
                              value={currentEdit.title}
                              onChange={(e) => handleFieldChange(lesson.id, "title", e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-background border border-line text-xs text-ink focus:border-purple-500 transition-all"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[11px] text-muted block">الشهر الأكاديمي:</label>
                              <select
                                value={currentEdit.month}
                                onChange={(e) =>
                                  handleFieldChange(lesson.id, "month", parseInt(e.target.value))
                                }
                                className="w-full px-3 py-1.5 rounded-lg bg-background border border-line text-xs text-ink focus:border-purple-500 transition-all"
                              >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                  <option key={m} value={m}>
                                    الشهر {m}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] text-muted block">وصف اختياري:</label>
                              <input
                                type="text"
                                placeholder="وصف موجز للدرس..."
                                value={currentEdit.description}
                                onChange={(e) =>
                                  handleFieldChange(lesson.id, "description", e.target.value)
                                }
                                className="w-full px-3 py-1.5 rounded-lg bg-background border border-line text-xs text-ink focus:border-purple-500 transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs space-y-1">
                          <span className="text-emerald-400 font-bold block">
                            تم اعتماد هذا الدرس ونشره بنجاح:
                          </span>
                          <span className="text-muted block">
                            العنوان المنشور: <strong>{lesson.title}</strong>
                          </span>
                          {lesson.publishedLesson && (
                            <span className="text-muted block">
                              معرف الدرس النهائي: <code className="text-purple-400">{lesson.publishedLesson.id}</code>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line/60">
                      <div className="flex items-center gap-2">
                        {isPending ? (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleApprove(lesson.id)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all text-xs cursor-pointer disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            اعتماد ونشر للطلاب (Approve & Publish)
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle2 className="w-4 h-4" />
                            معتمد ومنشور للطلاب
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleDelete(lesson.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
                        title="حذف من قائمة المراجعة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
