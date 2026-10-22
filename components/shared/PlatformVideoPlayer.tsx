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

export function parseVimeoVideo(input?: string | null): { embedUrl: string; videoId: string } | null {
  if (!input) return null;
  const s = input.trim();

  // 1. Direct player embed URL (e.g. https://player.vimeo.com/video/123456?h=abc...)
  if (s.includes("player.vimeo.com/video/")) {
    const match = s.match(/player\.vimeo\.com\/video\/(\d+)(?:\?h=([a-zA-Z0-9]+))?/);
    if (match) {
      const vid = match[1];
      const h = match[2] ? `&h=${match[2]}` : "";
      return {
        videoId: vid,
        embedUrl: `https://player.vimeo.com/video/${vid}?dnt=1&title=0&byline=0&portrait=0${h}`,
      };
    }
  }

  // 2. Format with unlisted hash separated by colon: e.g. "1238216152:f8434b5a21"
  if (/^\d{6,12}:[a-zA-Z0-9]+$/.test(s)) {
    const [vid, h] = s.split(":");
    return {
      videoId: vid,
      embedUrl: `https://player.vimeo.com/video/${vid}?h=${h}&dnt=1&title=0&byline=0&portrait=0`,
    };
  }

  // 3. Vimeo public or unlisted share link: https://vimeo.com/123456789 or https://vimeo.com/123456789/f8434b5a21
  const vimeoUrlMatch = s.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|manage\/videos\/|video\/|)(\d{6,12})(?:\/([a-zA-Z0-9]+))?/);
  if (vimeoUrlMatch) {
    const vid = vimeoUrlMatch[1];
    const h = vimeoUrlMatch[2] ? `&h=${vimeoUrlMatch[2]}` : "";
    return {
      videoId: vid,
      embedUrl: `https://player.vimeo.com/video/${vid}?dnt=1&title=0&byline=0&portrait=0${h}`,
    };
  }

  // 4. Pure numeric ID (6 to 12 digits)
  if (/^\d{6,12}$/.test(s)) {
    return {
      videoId: s,
      embedUrl: `https://player.vimeo.com/video/${s}?dnt=1&title=0&byline=0&portrait=0`,
    };
  }

  return null;
}

export function isVimeoNumericId(input?: string | null): boolean {
  return parseVimeoVideo(input) !== null;
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

  // 4. Check Vimeo Video (ID, unlisted hash, or URL)
  const vimeoParsed = parseVimeoVideo(vimeoVideoId) || parseVimeoVideo(videoUrl);
  if (vimeoParsed) {
    const glue = vimeoParsed.embedUrl.includes("?") ? "&" : "?";
    return (
      <div className={`relative w-full aspect-video bg-black rounded-2xl overflow-hidden ${className}`}>
        <iframe
          src={`${vimeoParsed.embedUrl}${glue}app_id=122963${
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
