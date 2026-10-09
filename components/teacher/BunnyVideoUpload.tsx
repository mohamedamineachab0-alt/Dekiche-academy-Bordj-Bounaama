"use client";

import React, { useState, useRef } from "react";
import * as tus from "tus-js-client";
import { Upload, CheckCircle2, Copy, Video, Loader2, StopCircle } from "lucide-react";
import { createBunnyVideo, saveVideoToDatabase } from "@/actions/bunny-actions";

export default function BunnyVideoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "creating" | "uploading" | "done">("idle");
  const [finalVideoUrl, setFinalVideoUrl] = useState("");
  const [copied, setCopied] = useState(false);
  
  const tusUploadRef = useRef<tus.Upload | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadStatus("creating");
    setUploadProgress(0);

    try {
      // 1. Call server action to create video and get secure signature
      const result = await createBunnyVideo(title || file.name);
      if (result.error) {
        throw new Error(result.error);
      }
      
      const { videoId, libraryId, expirationTime, signature } = result;

      setUploadStatus("uploading");

      // 2. Start TUS upload directly to Bunny.net
      const upload = new tus.Upload(file, {
        endpoint: "https://video.bunnycdn.com/tusupload",
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          AuthorizationSignature: signature!,
          AuthorizationExpire: expirationTime!.toString(),
          VideoId: videoId!,
          LibraryId: libraryId!,
        },
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
        onError: function (error) {
          console.error("Failed because: " + error);
          setIsUploading(false);
          setUploadStatus("idle");
          alert("حدث خطأ أثناء الرفع.");
        },
        onProgress: function (bytesUploaded, bytesTotal) {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(0);
          setUploadProgress(Number(percentage));
        },
        onSuccess: async function () {
          // You can construct the delivery URL using the stream hostname or the iframe format
          const finalUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`;
          setFinalVideoUrl(finalUrl);
          setUploadStatus("done");
          setIsUploading(false);

          // 3. Save to database
          await saveVideoToDatabase(videoId, title || file.name);
        },
      });

      tusUploadRef.current = upload;
      upload.start();

    } catch (error) {
      console.error(error);
      alert("فشل تهيئة الرفع. تأكد من إعدادات الشبكة ومفاتيح Bunny.net");
      setIsUploading(false);
      setUploadStatus("idle");
    }
  };

  const cancelUpload = () => {
    if (tusUploadRef.current) {
      tusUploadRef.current.abort();
      setIsUploading(false);
      setUploadStatus("idle");
      setUploadProgress(0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(finalVideoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="max-w-2xl mx-auto p-8 bg-white border border-purple-100 rounded-3xl shadow-sm space-y-6"
      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
      dir="rtl"
    >
      <div className="flex items-center gap-3 border-b border-purple-50 pb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
          <Video className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">رفع درس جديد (Bunny.net)</h2>
          <p className="text-sm text-gray-500">رفع الفيديوهات بأمان وسرعة فائقة مباشرة من المتصفح</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">عنوان الدرس</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: مقدمة في الدوال العددية..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
            disabled={isUploading || uploadStatus === "done"}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">ملف الفيديو</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-600 hover:file:bg-purple-100"
            disabled={isUploading || uploadStatus === "done"}
          />
        </div>

        {uploadStatus === "idle" && (
          <button
            onClick={handleUpload}
            disabled={!file}
            className="w-full py-3 mt-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Upload className="w-5 h-5" />
            بدء الرفع المباشر
          </button>
        )}

        {(uploadStatus === "creating" || uploadStatus === "uploading") && (
          <div className="mt-6 p-5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-4">
            <div className="flex items-center justify-between text-sm font-medium text-purple-900">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                {uploadStatus === "creating" ? "جاري تجهيز الخادم..." : "جاري رفع الفيديو..."}
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2.5 w-full bg-purple-100/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            
            <button
              onClick={cancelUpload}
              className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 mt-2"
            >
              <StopCircle className="w-4 h-4" />
              إلغاء الرفع
            </button>
          </div>
        )}

        {uploadStatus === "done" && (
          <div className="mt-6 p-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-12 h-12 mx-auto bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-900">اكتمل الرفع بنجاح!</h3>
              <p className="text-sm text-emerald-600 mt-1">تم إرسال الفيديو ومعالجته.</p>
            </div>
            
            <div className="flex items-center gap-2 mt-4 max-w-md mx-auto">
              <input
                type="text"
                readOnly
                value={finalVideoUrl}
                className="flex-1 px-3 py-2 text-sm text-left font-mono rounded-lg border border-emerald-200 bg-white text-gray-600 outline-none"
                dir="ltr"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> تم النسخ
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> نسخ الرابط
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
