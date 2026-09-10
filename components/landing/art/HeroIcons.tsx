type IconProps = { className?: string; size?: number };

const stroke = "currentColor";

export function DashboardIcon({ className, size = 22 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.5" y="3.5" width="8" height="7" rx="1.5" stroke={stroke} strokeWidth="1.6" />
      <rect x="13.5" y="3.5" width="8" height="7" rx="1.5" stroke={stroke} strokeWidth="1.6" />
      <rect x="2.5" y="13.5" width="8" height="7" rx="1.5" stroke={stroke} strokeWidth="1.6" />
      <rect x="13.5" y="13.5" width="8" height="7" rx="1.5" stroke={stroke} strokeWidth="1.6" />
      <path d="M6.5 7H7.5M16.5 7H17.5M6.5 17H7.5M16.5 17H17.5" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function VideoLessonsIcon({ className, size = 22 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3 6.5C3 5.11929 4.11929 4 5.5 4H14.5C15.8807 4 17 5.11929 17 6.5V17.5C17 18.8807 15.8807 20 14.5 20H5.5C4.11929 20 3 18.8807 3 17.5V6.5Z"
        stroke={stroke}
        strokeWidth="1.6"
      />
      <path d="M10 9L14 12L10 15V9Z" fill={stroke} opacity="0.85" />
      <path d="M19 8.5L21 7V17L19 15.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DailyExercisesIcon({ className, size = 22 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 5.5C4 4.67157 4.67157 4 5.5 4H18.5C19.3284 4 20 4.67157 20 5.5V18.5C20 19.3284 19.3284 20 18.5 20H5.5C4.67157 20 4 19.3284 4 18.5V5.5Z" stroke={stroke} strokeWidth="1.6" />
      <path d="M8 10L10.5 12.5L16 7" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 16H16" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ExamsReviewIcon({ className, size = 22 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 4C6 3.44772 6.44772 3 7 3H17C17.5523 3 18 3.44772 18 4V20C18 20.5523 17.5523 21 17 21H7C6.44772 21 6 20.5523 6 20V4Z" stroke={stroke} strokeWidth="1.6" />
      <path d="M9 8H15" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9 12H15" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9 16H12" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M19 6L21 4.5V19.5L19 18" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ParentFollowIcon({ className, size = 22 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="9" cy="7" r="3.5" stroke={stroke} strokeWidth="1.6" />
      <path d="M3 18C3 14.6863 5.68629 12 9 12C10.8 12 12.4 12.8 13.5 14.1" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="17" cy="17" r="3.5" stroke={stroke} strokeWidth="1.6" />
      <path d="M17 13.5V11" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M15 15H14.5C13.6716 15 13 15.6716 13 16.5V20.5C13 21.3284 13.6716 22 14.5 22H19.5C20.3284 22 21 21.3284 21 20.5V16.5C21 15.6716 20.3284 15 19.5 15H19" stroke={stroke} strokeWidth="1.6" />
      <path d="M15 18.5H19" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function WhyClockIcon({ className, size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="1.5" />
      <path d="M12 7V12L15.5 14.5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WhyUnifiedIcon({ className, size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3L20 8V16L12 21L4 16V8L12 3Z" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 8L16 10.5V15.5L12 18L8 15.5V10.5L12 8Z" stroke={stroke} strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="1.5" fill={stroke} />
    </svg>
  );
}

export function WhyCompleteIcon({ className, size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 6H19" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 10H19" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 14H14" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 18H11" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17 14L19 18L23 12" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WhyPathIcon({ className, size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="6" cy="18" r="2.5" stroke={stroke} strokeWidth="1.5" />
      <circle cx="18" cy="6" r="2.5" stroke={stroke} strokeWidth="1.5" />
      <circle cx="18" cy="18" r="2.5" stroke={stroke} strokeWidth="1.5" />
      <path d="M8.2 16.5L15.8 7.5" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M16.5 17.5L17.5 16.5" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function WhyLiveIcon({ className, size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="6" width="16" height="12" rx="2" stroke={stroke} strokeWidth="1.5" />
      <path d="M18 11L22 8V16L18 13" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="12" r="2" fill={stroke} />
      <path d="M12 15C13.5 13.5 14.5 10.5 12 9" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function WhyParentsIcon({ className, size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M7 11C7 9.34315 8.34315 8 10 8C11.6569 8 13 9.34315 13 11" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="5" r="2.5" stroke={stroke} strokeWidth="1.5" />
      <path d="M4 20C4 16.6863 6.68629 14 10 14" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="17" cy="6" r="2" stroke={stroke} strokeWidth="1.5" />
      <path d="M14 13C14 11.3431 15.3431 10 17 10C18.6569 10 20 11.3431 20 13" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 20C13 17.2386 15.2386 15 18 15" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
