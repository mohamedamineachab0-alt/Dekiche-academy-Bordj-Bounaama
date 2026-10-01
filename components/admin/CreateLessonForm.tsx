"use client";

import { useState, useRef } from "react";
import {
  UploadCloud,
  FileVideo,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Shield,
  Play,
  X,
} from "lucide-react";
import Link from "next/link";

export interface SubjectOption {
  id: string;
  title: string;
}

export interface CreateLessonResponse {
  success: boolean;
  message?: string;
  error?: string;
  lesson?: {
    id: string;
    title: string;
    description: string;
    vimeoVideoId: string;
    embedUrl: string;
    subject: string;
    month: number;
  };
}

export function CreateLessonForm({ subjects }: { subjects: SubjectOption[] }) {
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [month, setMonth] = useState<number>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Upload & UI State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdLesson, setCreatedLesson] = useState<CreateLessonResponse["lesson"] | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        setErrorMessage("يرجى اختيار ملف فيديو صالح (MP4, MOV, MKV, WebM)");
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        setErrorMessage("يرجى سحب ملف فيديو صالح");
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("يرجى إدخال عنوان الدرس");
      return;
    }

    if (!subjectId) {
      setErrorMessage("يرجى اختيار المادة أو الكورس التعليمي");
      return;
    }

    if (!selectedFile) {
      setErrorMessage("يرجى تحديد ملف الفيديو المراد رفعه ونشره");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatusText("بدء تجهيز ملف الفيديو وتأمينه...");

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("subjectId", subjectId);
    formData.append("month", month.toString());
    formData.append("video", selectedFile);

    // XMLHttpRequest for precise progress tracking
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        // Map 0-90% to upload progress, last 10% for Vimeo API processing
        const mappedPercent = Math.min(Math.round(percent * 0.9), 90);
        setUploadProgress(mappedPercent);

        if (mappedPercent < 40) {
          setUploadStatusText(`جاري رفع الفيديو إلى الخادم المشفر... (${mappedPercent}%)`);
        } else if (mappedPercent < 85) {
          setUploadStatusText(`جاري النقل والتشفير على منصة Vimeo... (${mappedPercent}%)`);
        } else {
          setUploadStatusText("جاري استلام تأكيد الحماية والخصوصية من Vimeo...");
        }
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      try {
        const response: CreateLessonResponse = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && response.success && response.lesson) {
          setUploadProgress(100);
          setCreatedLesson(response.lesson);
        } else {
          setErrorMessage(response.error || "فشل رفع ومعالجة الدرس. يرجى إعادة المحاولة.");
        }
      } catch (err) {
        setErrorMessage("استجابة غير صالحة من الخادم أثناء حفظ الدرس.");
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setErrorMessage("حدث خطأ في شبكة الاتصال أثناء الرفع.");
    };

    xhr.open("POST", "/api/admin/lessons/upload", true);
    xhr.send(formData);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedFile(null);
    setUploadProgress(0);
    setCreatedLesson(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 font-sans" dir="rtl">
      {/* Success Dialog Modal */}
      {createdLesson && (
        <div className="fixed inset-0 z-50 bg-purple-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-purple-200 w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-purple-950">
                تم نشر الدرس بنجاح!
              </h3>
              <p className="text-sm text-purple-700/80">
                تم رفع الفيديو وحمايته على Vimeo وربطه بالمادة وقاعدة البيانات.
              </p>
            </div>

            <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-purple-200/50">
                <span className="font-semibold text-purple-900">عنوان الدرس:</span>
                <span className="font-bold text-purple-950 truncate max-w-[240px]">
                  {createdLesson.title}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-purple-200/50">
                <span className="font-semibold text-purple-900">المادة التابعة:</span>
                <span className="font-bold text-purple-700">{createdLesson.subject}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-purple-200/50">
                <span className="font-semibold text-purple-900">معرف Vimeo:</span>
                <span className="font-mono font-bold text-purple-950 bg-white px-2 py-0.5 rounded border border-purple-200">
                  {createdLesson.vimeoVideoId}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-semibold text-purple-900">حالة الخصوصية:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  <Shield className="w-3 h-3" />
                  محمي ومخفي (Unlisted)
                </span>
              </div>
            </div>

            {/* Video preview link */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-3 px-4 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-sm transition text-center cursor-pointer"
              >
                نشر درس آخر
              </button>
              <Link
                href="/dashboard/admin/lessons"
                className="flex-1 py-3 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-lg shadow-purple-700/25 transition text-center flex items-center justify-center gap-2"
              >
                <span>الانتقال لقائمة الدروس</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Container */}
      <div className="relative bg-white border border-purple-100 rounded-3xl shadow-xl shadow-purple-950/5 overflow-hidden">
        {/* Subtle Minimalist Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#ddd6fe_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

        <div className="relative p-6 sm:p-10 space-y-8">
          {/* Header */}
          <div className="border-b border-purple-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 text-purple-800 text-xs font-bold border border-purple-200">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>لوحة تحكم المشرف — أكاديمية دكيش</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-purple-950 tracking-tight">
                إنشاء ونشر درس جديد
              </h2>
              <p className="text-sm text-purple-800/70">
                ارفع الفيديو مباشرة إلى Vimeo مع التشفير والحماية التلقائية وحفظه في المنصة.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-purple-700 bg-purple-50 px-3.5 py-2 rounded-xl border border-purple-200/60">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>حماية تلقائية ضد السرقة (Unlisted)</span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3.5 rounded-2xl text-sm font-semibold flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span className="flex-1">{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-500 hover:text-rose-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-purple-950">
                  عنوان الدرس <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مدخل إلى الأعداد المركبة والتحليل التوافقي"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isUploading}
                  className="w-full bg-white border border-purple-200 focus:border-purple-600 rounded-2xl px-4 py-3 text-sm text-purple-950 placeholder:text-purple-300 focus:ring-4 focus:ring-purple-600/10 focus:outline-none transition shadow-sm"
                />
              </div>

              {/* Subject / Module Select */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-purple-950 flex items-center justify-between">
                  <span>المادة التعليمية (الكورس) <span className="text-rose-500">*</span></span>
                  <span className="text-xs text-purple-500 font-normal">
                    {subjects.length} مادة متوفرة
                  </span>
                </label>
                <div className="relative">
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    disabled={isUploading}
                    className="w-full bg-white border border-purple-200 focus:border-purple-600 rounded-2xl px-4 py-3 text-sm text-purple-950 focus:ring-4 focus:ring-purple-600/10 focus:outline-none transition shadow-sm appearance-none"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.title}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-purple-500">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-purple-950">
                وصف ومحتوى الدرس
              </label>
              <textarea
                rows={3}
                placeholder="أدخل ملخصاً أو تفاصيل إضافية عن المفاهيم المشروحة في هذا الفيديو..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
                className="w-full bg-white border border-purple-200 focus:border-purple-600 rounded-2xl px-4 py-3 text-sm text-purple-950 placeholder:text-purple-300 focus:ring-4 focus:ring-purple-600/10 focus:outline-none transition shadow-sm"
              />
            </div>

            {/* Month / Module Level */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-purple-950 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>الشهر الدراسي المقترن بهذا الدرس</span>
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMonth(m)}
                    disabled={isUploading}
                    className={`py-2 rounded-xl text-xs font-mono font-bold border transition ${
                      month === m
                        ? "bg-purple-700 text-white border-purple-700 shadow-md shadow-purple-700/20"
                        : "bg-purple-50 text-purple-900 border-purple-200/60 hover:bg-purple-100"
                    }`}
                  >
                    ش {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Video File Upload Dropzone */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-purple-950">
                ملف الفيديو (Vimeo Video File) <span className="text-rose-500">*</span>
              </label>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-10 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                  selectedFile
                    ? "border-purple-600 bg-purple-50/50"
                    : "border-purple-200 hover:border-purple-400 bg-purple-50/20 hover:bg-purple-50/40"
                } ${isUploading ? "opacity-60 pointer-events-none" : ""}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition shadow-sm ${
                    selectedFile
                      ? "bg-purple-600 text-white"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {selectedFile ? (
                    <FileVideo className="w-7 h-7" />
                  ) : (
                    <UploadCloud className="w-7 h-7" />
                  )}
                </div>

                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="font-bold text-purple-950 text-base">{selectedFile.name}</p>
                    <p className="text-xs text-purple-700 font-mono">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} ميغابايت — جاهز للرفع إلى Vimeo
                    </p>
                    <span className="inline-block text-[11px] text-purple-600 underline font-semibold mt-1">
                      اضغط للتغيير
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-bold text-purple-950 text-sm sm:text-base">
                      اسحب وأفلت ملف الفيديو هنا، أو انقر للتصفح
                    </p>
                    <p className="text-xs text-purple-600/80">
                      يدعم صيغ MP4, MOV, MKV, WebM حتى 5GB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar & Status (Visible during upload) */}
            {isUploading && (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-purple-950">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                    <span>{uploadStatusText}</span>
                  </span>
                  <span className="font-mono text-purple-700 text-sm">{uploadProgress}%</span>
                </div>

                {/* Animated Bar */}
                <div className="w-full h-3 bg-purple-200 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-300 ease-out shadow-sm"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-purple-700/80">
                  <span>يرجى عدم إغلاق الصفحة حتى اكتمال التشفير والحفظ</span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-purple-600" />
                    تشفير Vimeo النشط
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 disabled:opacity-50 text-white font-black text-base shadow-xl shadow-purple-700/25 hover:shadow-purple-700/35 transition flex items-center justify-center gap-3 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>جاري معالجة ورفع الدرس... ({uploadProgress}%)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>رفع الفيديو وتأكيد نشر الدرس</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
