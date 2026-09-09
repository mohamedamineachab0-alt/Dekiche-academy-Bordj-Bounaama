export function watchSecondsStorageKey(userId: string) {
  return `lesson-watch-seconds:${userId}`;
}

export function formatWatchDuration(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);

  if (hours <= 0 && minutes <= 0) {
    return { label: "0 د", hours: 0, minutes: 0 };
  }

  if (hours <= 0) {
    return { label: `${minutes} د`, hours: 0, minutes };
  }

  return { label: `${hours} س ${minutes} د`, hours, minutes };
}
