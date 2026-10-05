"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Video,
  Mic,
  MicOff,
  Monitor,
  Play,
  Square,
  Pause,
  Upload,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Clock,
  Film,
  Scissors,
  HelpCircle,
  FileCheck,
  ChevronLeft,
  FileText,
  Trash2,
  MonitorPlay,
  Download
} from "lucide-react";
import Link from "next/link";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

interface SubjectOption {
  id: string;
  title: string;
}

interface TeacherRecordingPortalProps {
  subjects: SubjectOption[];
  teacherName?: string;
}

const LEVELS = [
  { value: "SECONDARY_3", label: "السنة الثالثة ثانوي (بكالوريا)" },
  { value: "SECONDARY_2", label: "السنة الثانية ثانوي" },
  { value: "SECONDARY_1", label: "السنة الأولى ثانوي" },
  { value: "MIDDLE_4", label: "السنة الرابعة متوسط (بيام)" },
  { value: "MIDDLE_3", label: "السنة الثالثة متوسط" },
  { value: "MIDDLE_2", label: "السنة الثانية متوسط" },
  { value: "MIDDLE_1", label: "السنة الأولى متوسط" },
  { value: "PRIMARY_5", label: "السنة الخامسة ابتدائي" },
];

const STREAMS = [
  { value: "EXPERIMENTAL_SCIENCES", label: "علوم تجريبية" },
  { value: "MATHEMATICS", label: "رياضيات" },
  { value: "TECHNICAL_MATH", label: "تقني رياضي" },
  { value: "MANAGEMENT_ECONOMY", label: "تسيير واقتصاد" },
  { value: "LITERATURE_PHILOSOPHY", label: "آداب وفلسفة" },
  { value: "FOREIGN_LANGUAGES", label: "لغات أجنبية" },
  { value: "COMMON_SCIENCE", label: "جذع مشترك علوم وتكنولوجيا" },
  { value: "COMMON_LETTERS", label: "جذع مشترك آداب" },
  { value: "NONE", label: "بدون شعبة / عام" },
];

const QUICK_NOTES = [
  "قص بداية الفيديو حتى ظهور لوحة الشرح",
  "حذف التوقف المؤقت في منتصف الفيديو",
  "يرجى تحسين جودة الصوت وإزالة الضجيج الخلفي",
  "قص آخر 30 ثانية بعد خاتمة الدرس",
  "تكبير شاشة الرسم البياني في الشرح",
];

export function TeacherRecordingPortal({
  subjects,
  teacherName = "الأستاذ",
}: TeacherRecordingPortalProps) {
  // Form State
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [level, setLevel] = useState("SECONDARY_3");
  const [stream, setStream] = useState("EXPERIMENTAL_SCIENCES");
  const [month, setMonth] = useState(1);
  const [order, setOrder] = useState(1);
  const [editingNotes, setEditingNotes] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [deviceError, setDeviceError] = useState<string | null>(null);

  // FFmpeg State
  const ffmpegRef = useRef<any>(null);
  const playbackVideoRef = useRef<HTMLVideoElement>(null);
  const [isFfmpegLoaded, setIsFfmpegLoaded] = useState(false);
  const [isTrimming, setIsTrimming] = useState(false);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);

  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<"idle" | "vimeo" | "saving" | "done">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedLesson, setCompletedLesson] = useState<{
    id: string;
    title: string;
    vimeoVideoId: string;
  } | null>(null);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const liveVideoPreviewRef = useRef<HTMLVideoElement | null>(null);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Start Screen or Camera + Mic recording
  const startRecording = async (type: "screen" | "camera" = "screen") => {
    setDeviceError(null);
    setErrorMessage(null);
    try {
      let combinedStream: MediaStream;

      if (type === "screen") {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: "monitor", frameRate: { ideal: 30, max: 60 } },
          audio: true, // system audio if supported
        });
        
        combinedStream = displayStream;
        
        if (audioEnabled) {
          try {
            const micStream = await navigator.mediaDevices.getUserMedia({
              audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
            });
            const audioCtx = new AudioContext();
            const dest = audioCtx.createMediaStreamDestination();
            if (displayStream.getAudioTracks().length > 0) {
              const sysSource = audioCtx.createMediaStreamSource(displayStream);
              sysSource.connect(dest);
            }
            const micSource = audioCtx.createMediaStreamSource(micStream);
            micSource.connect(dest);
            combinedStream = new MediaStream([
              ...displayStream.getVideoTracks(),
              ...dest.stream.getAudioTracks(),
            ]);
          } catch (micErr) {
            console.warn("Microphone not available:", micErr);
          }
        }
      } else {
        // Camera Mode: Get Video and Audio together (safer for mobile)
        combinedStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: audioEnabled ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true } : false,
        });
      }

      streamRef.current = combinedStream;

      // The video element might not be rendered yet. We'll attach it in a useEffect.

      // Handle user stopping stream from browser banner or device
      combinedStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      // Determine mime type
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 3000000, // 3 Mbps high quality
      });

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(chunks, { type: mimeType });
        setRecordedBlob(fullBlob);
        const url = URL.createObjectURL(fullBlob);
        setPreviewUrl(url);

        // Stop all tracks
        combinedStream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000); // 1-second chunks

      setIsRecording(true);
      setIsPaused(false);
      setRecordingDuration(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Failed to start recording:", err);
      if (err.name === "NotAllowedError") {
        setDeviceError("تم إلغاء الإذن بمشاركة الشاشة أو الكاميرا.");
      } else {
        setDeviceError(err?.message || "تعذر بدء التقاط الشاشة والميكروفون.");
      }
    }
  };

  // Pause / Resume
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsRecording(false);
    setIsPaused(false);
  };

  // Attach stream to live preview when isRecording becomes true
  useEffect(() => {
    if (isRecording && liveVideoPreviewRef.current && streamRef.current) {
      liveVideoPreviewRef.current.srcObject = streamRef.current;
      liveVideoPreviewRef.current.play().catch((err) => console.error("Preview play failed:", err));
    }
  }, [isRecording]);

  // Reset & Re-record
  const resetRecording = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setRecordedBlob(null);
    setPreviewUrl(null);
    setRecordingDuration(0);
    setDeviceError(null);
    setErrorMessage(null);
    setCompletedLesson(null);
    setUploadStep("idle");
    setPdfFile(null);
  };

  const loadFfmpeg = async () => {
    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpeg();
    }
    const ffmpeg = ffmpegRef.current;
    if (ffmpeg.loaded) return;
    try {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      setIsFfmpegLoaded(true);
    } catch (e) {
      console.error("FFmpeg load error:", e);
      setErrorMessage("فشل في تحميل مكتبة المونتاج المدمجة (تأكد من اتصالك بالإنترنت).");
    }
  };

  const performTrim = async () => {
    if (!recordedBlob) return;
    if (trimStart >= trimEnd || trimEnd === 0) {
      setErrorMessage("تأكد من اختيار نقطة بداية ونهاية صحيحة.");
      return;
    }
    setIsTrimming(true);
    setErrorMessage(null);
    try {
      await loadFfmpeg();
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.writeFile("input.webm", await fetchFile(recordedBlob));
      
      const duration = trimEnd - trimStart;
      await ffmpeg.exec([
        "-i", "input.webm",
        "-ss", trimStart.toString(),
        "-t", duration.toString(),
        "-c", "copy",
        "output.webm"
      ]);
      
      const data = await ffmpeg.readFile("output.webm");
      const trimmedBlob = new Blob([data as any], { type: "video/webm" });
      setRecordedBlob(trimmedBlob);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(trimmedBlob));
      
      setTrimStart(0);
      setTrimEnd(0);
      setRecordingDuration(Math.floor(duration));
      
      await ffmpeg.deleteFile("input.webm");
      await ffmpeg.deleteFile("output.webm");
    } catch (err: any) {
      console.error("Trim error:", err);
      setErrorMessage("حدث خطأ أثناء محاولة قص الفيديو.");
    } finally {
      setIsTrimming(false);
    }
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setRecordedBlob(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPdfFile(e.target.files[0]);
    }
  };

  // Append quick note tag
  const addQuickNote = (noteText: string) => {
    setEditingNotes((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return `• ${noteText}`;
      return `${trimmed}\n• ${noteText}`;
    });
  };

  // Submit and Upload directly to Vimeo & Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("يرجى كتابة عنوان الدرس أولاً.");
      return;
    }

    if (!subjectId) {
      setErrorMessage("يرجى اختيار المادة المقررة.");
      return;
    }

    if (!recordedBlob && !youtubeUrl.trim()) {
      setErrorMessage("يرجى تسجيل الفيديو أولاً، أو وضع رابط يوتيوب.");
      return;
    }

    setIsUploading(true);
    setUploadStep("vimeo");
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("subjectId", subjectId);
      formData.append("stream", stream);
      formData.append("level", level);
      formData.append("month", month.toString());
      formData.append("order", order.toString());
      formData.append("editingNotes", editingNotes.trim());
      
      if (youtubeUrl.trim()) {
        formData.append("youtubeUrl", youtubeUrl.trim());
      }

      if (recordedBlob) {
        const fileName = `lesson_recording_${Date.now()}.webm`;
        formData.append("video", recordedBlob, fileName);
      }

      if (pdfFile) {
        formData.append("pdf", pdfFile);
      }

      setUploadProgress(45);

      const res = await fetch("/api/teacher/recordings/upload", {
        method: "POST",
        body: formData,
      });

      setUploadStep("saving");
      setUploadProgress(85);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل رفع التسجيل إلى المنصة.");
      }

      setUploadProgress(100);
      setUploadStep("done");
      setCompletedLesson({
        id: data.pendingLesson.id,
        title: data.pendingLesson.title,
        vimeoVideoId: data.pendingLesson.vimeoVideoId,
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage(err.message || "حدث خطأ غير متوقع أثناء الرفع.");
      setUploadStep("idle");
    } finally {
      setIsUploading(false);
    }
  };

  // Clean up urls on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [previewUrl]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16" dir="rtl">
      {/* Top Banner */}
      <div className="surface-card p-6 md:p-8 relative overflow-hidden border border-purple-500/20 bg-gradient-to-br from-purple-950/20 via-neutral-900/60 to-neutral-950">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              استوديو تسجيل الدروس المباشر
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-ink">
              تسجيل ورفع الدرس الجديد
            </h1>
          </div>
          <Link
            href="/dashboard/teacher"
            className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors shrink-0"
          >
            العودة للرئيسية
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Completion Modal / Banner */}
      {completedLesson && (
        <div className="surface-card p-8 border-2 border-emerald-500/40 bg-emerald-950/20 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-bold text-ink">تم إرسال الدرس وحفظه بنجاح!</h2>
          <p className="text-muted max-w-lg mx-auto text-sm">
            تم رفع الفيديو بأمان برقم تعريف{" "}
            <span className="text-purple-400 font-mono font-bold">{completedLesson.vimeoVideoId}</span>.
            لقد تم اعتماد الدرس ونشره مباشرة للطلاب على المنصة.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <button
              onClick={resetRecording}
              className="px-6 py-2.5 rounded-xl font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-600/20"
            >
              تسجيل درس آخر
            </button>
            <Link
              href="/dashboard/teacher"
              className="px-6 py-2.5 rounded-xl font-semibold bg-surface hover:bg-surface-muted text-ink border border-line transition-all"
            >
              الذهاب إلى لوحة التحكم
            </Link>
          </div>
        </div>
      )}

      {/* Main Recording Grid */}
      {!completedLesson && (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left/Main Column: Video Recorder & Montage Notes */}
            <div className="lg:col-span-7 space-y-6">
              {/* Recorder Viewport */}
              <div className="surface-card p-5 border border-line bg-neutral-950 flex flex-col items-center justify-center min-h-[380px] rounded-2xl relative overflow-hidden group">
                {/* Active live recording display */}
                {isRecording && (
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                    <video
                      ref={liveVideoPreviewRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full max-h-[320px] rounded-xl object-contain bg-black border border-purple-500/30 shadow-2xl"
                    />
                    <div className="flex items-center gap-3">
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                      </span>
                      <span className="font-mono text-lg font-bold text-rose-400">
                        {formatTime(recordingDuration)}
                      </span>
                      {isPaused && (
                        <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          متوقف مؤقتاً
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Post-recording preview */}
                {!isRecording && previewUrl && (
                  <div className="w-full flex flex-col items-center space-y-3">
                    <video
                      ref={playbackVideoRef}
                      src={previewUrl}
                      controls
                      playsInline
                      className="w-full max-h-[320px] rounded-xl object-contain bg-black border border-line shadow-2xl"
                    />
                    
                    {/* Trimming UI */}
                    <div className="w-full p-4 rounded-xl bg-surface border border-line space-y-3 shadow-inner">
                      <div className="flex items-center justify-between">
                         <span className="text-sm font-semibold text-ink flex items-center gap-2"><Scissors className="w-4 h-4 text-purple-400" /> قص الفيديو بداخل المنصة</span>
                      </div>
                      <div className="space-y-4">
                         <div className="space-y-2">
                           <div className="flex justify-between text-xs">
                             <span className="text-muted">نقطة البداية (من)</span>
                             <span className="font-mono text-purple-400 font-bold">{formatTime(trimStart)}</span>
                           </div>
                           <input 
                             type="range" 
                             min={0} 
                             max={recordingDuration || 100} 
                             value={trimStart} 
                             onChange={e => {
                               const val = Number(e.target.value);
                               setTrimStart(val);
                               if (playbackVideoRef.current) playbackVideoRef.current.currentTime = val;
                             }} 
                             className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500" 
                           />
                           <button type="button" onClick={() => { if(playbackVideoRef.current) setTrimStart(Math.floor(playbackVideoRef.current.currentTime)) }} className="text-[10px] text-purple-400 hover:underline">تحديد من موقع المشغل الحالي</button>
                         </div>
                         <div className="space-y-2">
                           <div className="flex justify-between text-xs">
                             <span className="text-muted">نقطة النهاية (إلى)</span>
                             <span className="font-mono text-rose-400 font-bold">{formatTime(trimEnd)}</span>
                           </div>
                           <input 
                             type="range" 
                             min={0} 
                             max={recordingDuration || 100} 
                             value={trimEnd} 
                             onChange={e => {
                               const val = Number(e.target.value);
                               setTrimEnd(val);
                               if (playbackVideoRef.current) playbackVideoRef.current.currentTime = val;
                             }} 
                             className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500" 
                           />
                           <button type="button" onClick={() => { if(playbackVideoRef.current) setTrimEnd(Math.floor(playbackVideoRef.current.currentTime)) }} className="text-[10px] text-purple-400 hover:underline">تحديد من موقع المشغل الحالي</button>
                         </div>
                      </div>
                      <button type="button" onClick={performTrim} disabled={isTrimming || trimStart >= trimEnd || trimEnd === 0} className="w-full py-2 bg-purple-600/10 text-purple-400 border border-purple-500/30 rounded-lg text-sm font-semibold hover:bg-purple-600 hover:text-white transition-colors disabled:opacity-50">
                        {isTrimming ? "جاري القص والمعالجة... قد يستغرق بعض الوقت" : "قص وتأكيد المدة"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between w-full px-2 text-xs text-muted">
                      <span>مدة التسجيل: {formatTime(recordingDuration)}</span>
                      <span>الحجم التقريبي: {recordedBlob ? (recordedBlob.size / (1024 * 1024)).toFixed(2) + " MB" : ""}</span>
                    </div>
                  </div>
                )}

                {/* Idle / Initial State */}
                {!isRecording && !previewUrl && (
                  <div className="text-center py-12 px-4 space-y-4 max-w-sm">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
                      <Monitor className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="font-bold text-ink text-lg">جاهز لبدء التسجيل</h3>
                      <p className="text-muted text-xs mt-1 leading-relaxed">
                        اختر الشاشة أو نافذة العرض التقديمي واشرح الدرس بكل أريحية. يمكنك إيقاف التسجيل ومراجعته قبل الإرسال.
                      </p>
                    </div>
                  </div>
                )}

                {/* Recorder Control Bar */}
                <div className="w-full mt-4 pt-4 border-t border-line/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {!isRecording && !previewUrl && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startRecording("screen")}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          بدء تسجيل الشاشة
                        </button>
                        <button
                          type="button"
                          onClick={() => startRecording("camera")}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                        >
                          <Video className="w-4 h-4" />
                          تصوير الكاميرا
                        </button>
                        <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-surface border border-line hover:bg-surface-muted text-ink transition-all cursor-pointer">
                          <Film className="w-4 h-4 text-purple-400" />
                          رفع من الجهاز
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}

                    {isRecording && (
                      <>
                        <button
                          type="button"
                          onClick={togglePause}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-surface hover:bg-surface-muted text-ink border border-line transition-all"
                        >
                          <Pause className="w-4 h-4" />
                          {isPaused ? "استئناف" : "إيقاف مؤقت"}
                        </button>
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                        >
                          <Square className="w-4 h-4 fill-white" />
                          إنهاء التسجيل
                        </button>
                      </>
                    )}

                    {!isRecording && previewUrl && (
                      <button
                        type="button"
                        onClick={resetRecording}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-surface hover:bg-surface-muted text-rose-400 border border-line transition-all"
                      >
                        <RotateCcw className="w-4 h-4" />
                        إعادة التسجيل من البداية
                      </button>
                    )}
                  </div>

                  {/* Audio Toggle */}
                  <button
                    type="button"
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    disabled={isRecording}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      audioEnabled
                        ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                        : "bg-neutral-800 border-neutral-700 text-muted"
                    }`}
                  >
                    {audioEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                    {audioEnabled ? "الميكروفون مفعّل" : "الميكروفون معطل"}
                  </button>
                </div>
              </div>

              {deviceError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{deviceError}</span>
                </div>
              )}


              <div className="surface-card p-5 border border-line space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary">أو ضع رابط يوتيوب مباشر (YouTube Link)</label>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    dir="ltr"
                    className="w-full bg-surface border border-line rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-mid"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-muted">إذا وضعت الرابط هنا، فلن تحتاج لتسجيل أو رفع فيديو.</p>
                </div>
              </div>
            </div>

            {/* Right Column: Metadata Selector & Publish Trigger */}
            <div className="lg:col-span-5 space-y-6">
              <div className="surface-card p-6 border border-line space-y-5">
                <h3 className="font-bold text-ink text-base flex items-center gap-2 border-b border-line pb-3">
                  <Film className="w-4 h-4 text-purple-400" />
                  بيانات وتصنيف الدرس
                </h3>

                {/* Lesson Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">عنوان الدرس *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: مدخل إلى الأعداد المركبة وتمثيلها الهندسي"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-line focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-ink text-sm transition-all"
                  />
                </div>

                {/* Subject Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">المادة المقررة *</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-line focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-ink text-sm transition-all"
                  >
                    {subjects.length === 0 ? (
                      <option value="">لا توجد مواد مسندة</option>
                    ) : (
                      subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.title}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Lesson Order */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">رقم ترتيب الدرس *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full p-3.5 rounded-xl bg-background border border-line focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-ink text-sm transition-all"
                  />
                </div>

                {/* Level Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">المستوى الدراسي *</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-line focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-ink text-sm transition-all"
                  >
                    {LEVELS.map((lvl) => (
                      <option key={lvl.value} value={lvl.value}>
                        {lvl.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stream Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">الشعبة المقررة *</label>
                  <select
                    value={stream}
                    onChange={(e) => setStream(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-line focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-ink text-sm transition-all"
                  >
                    {STREAMS.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Month Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">الشهر الأكاديمي</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-line focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-ink text-sm transition-all"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        الشهر {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PDF Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">ملف الدرس (PDF) <span className="text-muted font-normal">(اختياري)</span></label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-surface border border-line hover:border-purple-500/50 text-ink/80 hover:text-ink transition-all text-xs cursor-pointer">
                      <FileText className="w-4 h-4 text-purple-400" />
                      {pdfFile ? pdfFile.name : "اختر ملف PDF من جهازك"}
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfUpload}
                        className="hidden"
                      />
                    </label>
                    {pdfFile && (
                      <button
                        type="button"
                        onClick={() => setPdfFile(null)}
                        className="p-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="حذف الملف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit Action & Download */}
                <div className="pt-2 flex flex-col gap-3">
                  {recordedBlob && !isUploading && (
                    <a
                      href={previewUrl!}
                      download={`درس_${title || "مسجل"}.webm`}
                      className="w-full py-3 px-4 rounded-xl font-bold bg-surface border-2 border-line hover:border-purple-500/50 hover:bg-surface-muted text-ink shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                      title="تحميل الفيديو لقصه وتعديله على جهازك"
                    >
                      <Download className="w-4 h-4 text-purple-400" />
                      <span>تحميل الفيديو (اختياري)</span>
                    </a>
                  )}

                  <button
                    type="submit"
                    disabled={isUploading || isRecording || !recordedBlob}
                    className="w-full py-3.5 px-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-600/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>جاري المعالجة والرفع...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        <span>إرسال الدرس ونشره مباشرة</span>
                      </>
                    )}
                  </button>

                  {!recordedBlob && !isRecording && (
                    <p className="text-[11px] text-muted text-center mt-2">
                      * يجب تسجيل مقطع الفيديو أولاً لتتمكن من الإرسال
                    </p>
                  )}
                </div>

                {/* Upload Status Indicator */}
                {isUploading && (
                  <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
                      <span>
                        {uploadStep === "vimeo" && "1. جاري رفع وإرسال الفيديو للإدارة..."}
                        {uploadStep === "saving" && "2. تسجيل البيانات والملاحظات في قاعدة البيانات..."}
                        {uploadStep === "done" && "3. اكتمل الرفع بنجاح!"}
                      </span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Informational Card */}
              <div className="surface-card p-5 border border-line space-y-2 text-xs text-muted">
                <div className="flex items-center gap-2 text-ink font-semibold">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  كيف تعمل العملية؟
                </div>
                <p className="leading-relaxed">
                  1. يتم رفع الفيديو مباشرة إلى حساب Vimeo المحمي للمنصة بنظام التجزئة (Tus Upload) بدون استهلاك مساحة السيرفر المحلي.
                </p>
                <p className="leading-relaxed">
                  2. تُسجَّل ملاحظاتك وعنوان الدرس في جدول <span className="font-mono text-purple-400">pending_lessons</span> بالحالة المعلقة.
                </p>
                <p className="leading-relaxed">
                  3. يقوم الأدمن بمراجعة الفيديو واعتماده ليظهر في قائمة دروس الطلاب.
                </p>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
