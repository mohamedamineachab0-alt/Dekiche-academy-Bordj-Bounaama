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
import * as tus from "tus-js-client";
import { createBunnyVideo } from "@/actions/bunny-actions";

interface SubjectOption {
  id: string;
  title: string;
  levels?: string[];
  streams?: string[];
}

interface TeacherRecordingPortalProps {
  subjects: SubjectOption[];
  teacherName?: string;
}

const STAGES = [
  { value: "SECONDARY", label: "التعليم الثانوي" },
  { value: "MIDDLE", label: "التعليم المتوسط" },
  { value: "PRIMARY", label: "التعليم الابتدائي" },
];

const LEVELS = [
  { value: "SECONDARY_3", label: "السنة الثالثة ثانوي (بكالوريا)", stage: "SECONDARY" },
  { value: "SECONDARY_2", label: "السنة الثانية ثانوي", stage: "SECONDARY" },
  { value: "SECONDARY_1", label: "السنة الأولى ثانوي", stage: "SECONDARY" },
  { value: "MIDDLE_4", label: "السنة الرابعة متوسط (بيام)", stage: "MIDDLE" },
  { value: "MIDDLE_3", label: "السنة الثالثة متوسط", stage: "MIDDLE" },
  { value: "MIDDLE_2", label: "السنة الثانية متوسط", stage: "MIDDLE" },
  { value: "MIDDLE_1", label: "السنة الأولى متوسط", stage: "MIDDLE" },
  { value: "PRIMARY_5", label: "السنة الخامسة ابتدائي (السانكيام)", stage: "PRIMARY" },
  { value: "PRIMARY_4", label: "السنة الرابعة ابتدائي", stage: "PRIMARY" },
  { value: "PRIMARY_3", label: "السنة الثالثة ابتدائي", stage: "PRIMARY" },
  { value: "PRIMARY_2", label: "السنة الثانية ابتدائي", stage: "PRIMARY" },
  { value: "PRIMARY_1", label: "السنة الأولى ابتدائي", stage: "PRIMARY" },
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
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([subjects[0]?.id].filter(Boolean));
  const [stage, setStage] = useState("SECONDARY");
  const [selectedLevels, setSelectedLevels] = useState<string[]>(["SECONDARY_3"]);
  const [selectedStreams, setSelectedStreams] = useState<string[]>(["EXPERIMENTAL_SCIENCES"]);
  const [month, setMonth] = useState(1);
  const [order, setOrder] = useState(1);
  const [editingNotes, setEditingNotes] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  // Auto-populate levels and streams when selected subjects change
  useEffect(() => {
    const newLevels = new Set<string>();
    const newStreams = new Set<string>();
    
    selectedSubjectIds.forEach(id => {
      const sub = subjects.find(s => s.id === id);
      if (sub) {
        sub.levels?.forEach(l => newLevels.add(l));
        sub.streams?.forEach(s => newStreams.add(s));
      }
    });
    
    if (newLevels.size > 0) setSelectedLevels(Array.from(newLevels));
    if (newStreams.size > 0) setSelectedStreams(Array.from(newStreams));
    
    // Auto-detect stage based on levels
    if (newLevels.size > 0) {
      const firstLevel = Array.from(newLevels)[0];
      if (firstLevel.startsWith("PRIMARY")) setStage("PRIMARY");
      else if (firstLevel.startsWith("MIDDLE")) setStage("MIDDLE");
      else if (firstLevel.startsWith("SECONDARY")) setStage("SECONDARY");
    }
  }, [selectedSubjectIds, subjects]);

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
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadPaused, setIsUploadPaused] = useState(false);
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
  const xhrRef = useRef<any>(null);

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
      setIsLoadingVideo(true);
      const file = e.target.files[0];
      
      // Simulate loading for better UX and allow the thread to breathe
      setTimeout(() => {
        setRecordedBlob(file);
        setPreviewUrl(URL.createObjectURL(file));
        setIsLoadingVideo(false);
      }, 800);
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

    if (selectedSubjectIds.length === 0) {
      setErrorMessage("يرجى اختيار مادة مقررة واحدة على الأقل.");
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
      selectedSubjectIds.forEach(id => formData.append("subjectIds", id));
      selectedStreams.forEach(st => formData.append("streams", st));
      selectedLevels.forEach(lvl => formData.append("levels", lvl));
      formData.append("month", month.toString());
      formData.append("order", order.toString());
      formData.append("editingNotes", editingNotes.trim());
      
      if (youtubeUrl.trim()) {
        formData.append("youtubeUrl", youtubeUrl.trim());
      }

      if (pdfFile) {
        formData.append("pdf", pdfFile);
      }

      setUploadProgress(0);

      let bunnyVideoId = null;

      if (recordedBlob) {
        setUploadStep("vimeo"); // UI string "جاري الرفع..."
        
        const fileName = `lesson_recording_${Date.now()}.webm`;
        // 1. Get secure upload signature
        const result = await createBunnyVideo(title.trim() || fileName);
        if (result.error) {
          throw new Error(result.error);
        }
        
        const { videoId, libraryId, expirationTime, signature } = result;
        bunnyVideoId = videoId as string;
        formData.append("bunnyVideoId", bunnyVideoId);
        
        // 2. Upload directly to Bunny CDN
        await new Promise<void>((resolve, reject) => {
          const upload = new tus.Upload(recordedBlob as Blob, {
            endpoint: "https://video.bunnycdn.com/tusupload",
            retryDelays: [0, 3000, 5000, 10000, 20000],
            headers: {
              AuthorizationSignature: signature!,
              AuthorizationExpire: expirationTime!.toString(),
              VideoId: videoId!,
              LibraryId: libraryId!,
            },
            metadata: {
              filename: fileName,
              filetype: "video/webm",
            },
            onError: (err) => reject(new Error("حدث خطأ أثناء رفع الفيديو: " + err)),
            onProgress: (bytesUploaded, bytesTotal) => {
              const percent = Math.round((bytesUploaded / bytesTotal) * 100);
              setUploadProgress(Math.min(percent * 0.85, 85)); // 85% for upload
            },
            onSuccess: () => resolve(),
          });
          
          xhrRef.current = upload;
          upload.start();
        });
      }

      setUploadStep("saving");
      setUploadProgress(95);

      // 3. Send metadata (and optional PDF) to Next.js API
      const res = await fetch("/api/teacher/recordings/upload", {
        method: "POST",
        body: formData,
      });

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

                {/* Loading State for Uploaded Video */}
                {isLoadingVideo && (
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-4 py-16">
                    <div className="w-16 h-16 rounded-3xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-sm font-semibold text-muted">جاري تحميل وتجهيز الفيديو...</p>
                  </div>
                )}

                {/* Post-recording preview */}
                {!isRecording && !isLoadingVideo && previewUrl && (
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
                {!isRecording && !isLoadingVideo && !previewUrl && (
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
                    {!isRecording && !isLoadingVideo && !previewUrl && (
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
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-ink">المواد المقررة (يمكنك اختيار أكثر من مادة) *</label>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto p-3 bg-background border border-line rounded-xl">
                    {subjects.length === 0 ? (
                      <span className="text-sm text-muted">لا توجد مواد مسندة</span>
                    ) : (
                      subjects.map((sub) => (
                        <label key={sub.id} className="flex items-center gap-3 cursor-pointer hover:bg-surface p-1.5 rounded-lg transition-colors">
                          <input 
                            type="checkbox" 
                            checked={selectedSubjectIds.includes(sub.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedSubjectIds([...selectedSubjectIds, sub.id]);
                              else setSelectedSubjectIds(selectedSubjectIds.filter(id => id !== sub.id));
                            }}
                            className="w-4 h-4 text-purple-600 rounded border-line focus:ring-purple-500 bg-background accent-purple-600 cursor-pointer"
                          />
                          <span className="text-sm text-ink">{sub.title}</span>
                        </label>
                      ))
                    )}
                  </div>
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

                {/* Stage Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">الطور المقرّر (لتصفية المستويات)</label>
                  <select
                    value={stage}
                    onChange={(e) => {
                      setStage(e.target.value);
                      // Update level to first available for this stage
                      const newLevels = LEVELS.filter(l => l.stage === e.target.value);
                      if (newLevels.length > 0) {
                        setSelectedLevels([newLevels[0].value]);
                      }
                      // If PRIMARY or MIDDLE, we typically don't have streams, so default to NONE
                      if (e.target.value !== "SECONDARY") {
                        setSelectedStreams(["NONE"]);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-line focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-ink text-sm transition-all"
                  >
                    {STAGES.map((stg) => (
                      <option key={stg.value} value={stg.value}>
                        {stg.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Level Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-ink">المستويات الدراسية (يمكنك اختيار أكثر من مستوى) *</label>
                  <div className="flex flex-col gap-2 p-3 bg-background border border-line rounded-xl">
                    {LEVELS.filter(l => l.stage === stage).map((lvl) => (
                      <label key={lvl.value} className="flex items-center gap-3 cursor-pointer hover:bg-surface p-1.5 rounded-lg transition-colors">
                        <input 
                          type="checkbox" 
                          checked={selectedLevels.includes(lvl.value)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedLevels([...selectedLevels, lvl.value]);
                            else setSelectedLevels(selectedLevels.filter(v => v !== lvl.value));
                          }}
                          className="w-4 h-4 text-purple-600 rounded border-line focus:ring-purple-500 bg-background accent-purple-600 cursor-pointer"
                        />
                        <span className="text-sm text-ink">{lvl.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Stream Selector */}
                {stage === "SECONDARY" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-ink">الشُعب المقررة (يمكنك اختيار أكثر من شعبة) *</label>
                    <div className="flex flex-col gap-2 p-3 bg-background border border-line rounded-xl max-h-48 overflow-y-auto">
                      {STREAMS.map((st) => (
                        <label key={st.value} className="flex items-center gap-3 cursor-pointer hover:bg-surface p-1.5 rounded-lg transition-colors">
                          <input 
                            type="checkbox" 
                            checked={selectedStreams.includes(st.value)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedStreams([...selectedStreams, st.value]);
                              else setSelectedStreams(selectedStreams.filter(v => v !== st.value));
                            }}
                            className="w-4 h-4 text-purple-600 rounded border-line focus:ring-purple-500 bg-background accent-purple-600 cursor-pointer"
                          />
                          <span className="text-sm text-ink">{st.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

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
                    disabled={isUploading || isRecording || (!recordedBlob && !youtubeUrl.trim())}
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

                  {!recordedBlob && !youtubeUrl.trim() && !isRecording && (
                    <p className="text-[11px] text-muted text-center mt-2">
                      * يجب تسجيل أو رفع مقطع فيديو أولاً أو وضع رابط يوتيوب لتتمكن من الإرسال
                    </p>
                  )}
                </div>

                {/* Upload Status Indicator */}
                {isUploading && (
                  <div className="p-6 rounded-2xl bg-emerald-950/20 border-2 border-emerald-500/30 space-y-4 animate-in fade-in zoom-in-95 duration-300 shadow-xl shadow-emerald-900/10">
                    <div className="flex items-center justify-between font-bold text-emerald-400">
                      <span className="flex items-center gap-2 text-sm md:text-base">
                        <Loader2 className={`w-5 h-5 ${isUploadPaused ? "" : "animate-spin"}`} />
                        {isUploadPaused && "الرفع متوقف مؤقتاً..."}
                        {!isUploadPaused && uploadStep === "vimeo" && "جاري رفع الدرس ونشره في المنصة..."}
                        {!isUploadPaused && uploadStep === "saving" && "جاري حفظ وتوثيق البيانات..."}
                        {!isUploadPaused && uploadStep === "done" && "تم الرفع بنجاح!"}
                      </span>
                      <span className="text-lg">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-neutral-900 rounded-full h-4 overflow-hidden border border-emerald-900/50 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out relative"
                        style={{ width: `${uploadProgress}%` }}
                      >
                        {!isUploadPaused && <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_ease-in-out_infinite]" />}
                      </div>
                    </div>
                    {uploadStep !== "done" && (
                      <div className="flex gap-3 mt-4">
                        {isUploadPaused ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (xhrRef.current) {
                                xhrRef.current.start();
                                setIsUploadPaused(false);
                              }
                            }}
                            className="flex-1 py-2 text-sm font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl transition-colors border border-emerald-500/20 flex items-center justify-center gap-2"
                          >
                            <Play className="w-4 h-4" />
                            استئناف الرفع
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (xhrRef.current) {
                                xhrRef.current.abort();
                                setIsUploadPaused(true);
                              }
                            }}
                            className="flex-1 py-2 text-sm font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl transition-colors border border-amber-500/20 flex items-center justify-center gap-2"
                          >
                            <Pause className="w-4 h-4" />
                            إيقاف مؤقت
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (xhrRef.current) {
                              xhrRef.current.abort(true);
                              setIsUploading(false);
                              setUploadStep("idle");
                              setUploadProgress(0);
                              setIsUploadPaused(false);
                            }
                          }}
                          className="flex-1 py-2 text-sm font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-colors border border-rose-500/20 flex items-center justify-center gap-2"
                        >
                          <Square className="w-4 h-4" />
                          إلغاء الرفع نهائياً
                        </button>
                      </div>
                    )}
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
                  1. يتم رفع الفيديو مباشرة إلى السيرفرات المحمية للمنصة بنظام التجزئة السريع بدون استهلاك مساحة السيرفر المحلي.
                </p>
                <p className="leading-relaxed text-emerald-400 font-semibold">
                  2. يتم اعتماد الدرس ونشره مباشرة للطلاب بمجرد اكتمال الرفع، دون الحاجة لانتظار موافقة إضافية.
                </p>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
