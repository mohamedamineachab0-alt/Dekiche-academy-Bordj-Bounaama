"use client";

import React, { useState, useRef } from "react";
import { Play, AlertCircle, ExternalLink, Video as VideoIcon, Sparkles } from "lucide-react";

export function extractYoutubeId(input?: string | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);
  return match ? match[1] : null;
}

export function isDirectVideoUrl(input?: string | null): boolean {
  if (!input) return false;
  const s = input.trim().toLowerCase();
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/")) {
    if (
      s.includes(".mp4") ||
      s.includes(".webm") ||
      s.includes(".ogg") ||
      s.includes(".mov") ||
      s.includes(".m3u8") ||
      s.includes("/api/videos/") ||
      s.includes("/uploads/") ||
      s.includes("/storage/") ||
      s.includes("supabase.co/storage")
    ) {
      return true;
    }
  }
  return false;
}

export function isBunnyId(input?: string | null): boolean {
  if (!input) return false;
  const s = input.trim();
  return s.includes("-") && s.length >= 30 && !s.startsWith("http");
}

export function isVimeoNumericId(input?: string | null): boolean {
  if (!input) return false;
  const s = input.trim();
  return /^\d{6,12}$/.test(s);
}

interface PlatformVideoPlayerProps {
  youtubeVideoId?: string | null;
  vimeoVideoId?: string | null;
  videoUrl?: string | null;
  title?: string;
  autoplay?: boolean;
  className?: string;
  onEnded?: () => void;
}

export function PlatformVideoPlayer({
  youtubeVideoId,
  vimeoVideoId,
  videoUrl,
  title = "فيديو الدرس",
  autoplay = false,
  className = "",
  onEnded,
}: PlatformVideoPlayerProps) {
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 1. Check YouTube first (Primary non-expiring free video source)
  const ytId =
    extractYoutubeId(youtubeVideoId) ||
    extractYoutubeId(videoUrl) ||
    extractYoutubeId(vimeoVideoId);

  if (ytId) {
    return (
      <div className={`relative w-full aspect-video bg-black rounded-2xl overflow-hidden ${className}`}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1&playsinline=1${
            autoplay ? "&autoplay=1" : ""
          }`}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={title}
        />
      </div>
    );
  }

  // 2. Check Direct Video file (HTML5 MP4 / WebM / Storage URL)
  const directUrl =
    (videoUrl && isDirectVideoUrl(videoUrl) ? videoUrl : null) ||
    (vimeoVideoId && isDirectVideoUrl(vimeoVideoId) ? vimeoVideoId : null);

  if (directUrl) {
    const handleSpeedChange = (speed: number) => {
      setPlaybackSpeed(speed);
      if (videoRef.current) {
        videoRef.current.playbackRate = speed;
      }
    };

    return (
      <div className={`relative w-full aspect-video bg-black rounded-2xl overflow-hidden group ${className}`}>
        <video
          ref={videoRef}
          src={directUrl}
          controls
          playsInline
          autoPlay={autoplay}
          onEnded={onEnded}
          className="w-full h-full object-contain"
        >
          متصفحك لا يدعم تشغيل هذا الفيديو مباشرة.
        </video>

        {/* Speed Controls Overlay on Hover */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-md px-2 py-1 rounded-xl flex items-center gap-1.5 text-xs text-white border border-white/10 z-20">
          <span className="text-[10px] text-white/60 font-semibold">السرعة:</span>
          {[0.75, 1, 1.25, 1.5, 2].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSpeedChange(s)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono cursor-pointer transition ${
                playbackSpeed === s
                  ? "bg-primary text-white font-bold"
                  : "hover:bg-white/20 text-white/80"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 3. Check Bunny.net Stream UUID
  const rawVimeo = vimeoVideoId?.trim();
  if (rawVimeo && isBunnyId(rawVimeo)) {
    const bunnyLib = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || "773860";
    return (
      <div className={`relative w-full aspect-video bg-black rounded-2xl overflow-hidden ${className}`}>
        <iframe
          src={`https://iframe.mediadelivery.net/embed/${bunnyLib}/${rawVimeo}?autoplay=${
            autoplay ? "true" : "false"
          }&loop=false&muted=false&preload=true&responsive=true`}
          className="absolute inset-0 w-full h-full border-0"
          loading="lazy"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          title={title}
        />
      </div>
    );
  }

  // 4. Check Vimeo numeric ID
  if (rawVimeo && isVimeoNumericId(rawVimeo)) {
    return (
      <div className={`relative w-full aspect-video bg-black rounded-2xl overflow-hidden ${className}`}>
        <iframe
          src={`https://player.vimeo.com/video/${rawVimeo}?app_id=122963&dnt=1&title=0&byline=0&portrait=0${
            autoplay ? "&autoplay=1" : ""
          }`}
          className="absolute inset-0 w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          title={title}
        />
      </div>
    );
  }

  // 5. Empty / Missing Video State
  return (
    <div
      className={`relative w-full aspect-video rounded-2xl overflow-hidden border border-line bg-linear-to-br from-neutral-900 to-neutral-950 flex flex-col items-center justify-center p-6 text-center space-y-3 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted">
        <VideoIcon className="w-7 h-7 text-primary/70" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-ink">الفيديو غير متوفر حالياً</h4>
        <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
          لم يتم ربط فيديو بهذا الدرس بعد، أو أن رابط الفيديو بحاجة للتحديث.
        </p>
      </div>
    </div>
  );
}
