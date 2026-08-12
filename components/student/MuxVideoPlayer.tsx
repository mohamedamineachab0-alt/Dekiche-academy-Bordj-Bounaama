"use client";

import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-mux";

type Props = {
  playbackId: string;
  title: string;
  className?: string;
};

export function MuxVideoPlayer({ playbackId, title, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Fallback to a Mux test stream if the playbackId is purely numeric (old Vimeo ID)
    const isOldVimeoId = /^[0-9]+$/.test(playbackId);
    const activePlaybackId = isOldVimeoId ? "yb2L3z3Z4IKQH02HYkf9xPToVYkOC85WA" : playbackId;
    const src = `https://stream.mux.com/${activePlaybackId}.m3u8`;

    if (!playerRef.current) {
      playerRef.current = videojs(videoRef.current, {
        sources: [{ src, type: "application/x-mpegURL" }],
        fluid: true,
        plugins: {
          mux: {
            debug: false,
            data: {
              env_key: process.env.NEXT_PUBLIC_MUX_ENV_KEY || "",
              video_id: activePlaybackId,
              video_title: title,
              player_name: "Dekich Academy Main Player",
            }
          }
        }
      });
    } else {
      const player = playerRef.current;
      player.src({ src, type: "application/x-mpegURL" });
      
      // Signal Mux that a new video started
      player.mux.emit('videochange', {
        video_id: activePlaybackId,
        video_title: title,
      });
    }
  }, [playbackId, title]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div data-vjs-player className={className}>
      <video
        ref={videoRef}
        className="video-js vjs-default-skin vjs-big-play-centered"
        controls
        playsInline
      />
    </div>
  );
}
