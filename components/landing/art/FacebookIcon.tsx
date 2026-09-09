import { Phone } from "lucide-react";

const FACEBOOK_URL = "https://www.facebook.com/share/1FFjYRYGNe/";
const INSTAGRAM_URL = "https://www.instagram.com/dekiche_academy";
export const ACADEMY_PHONE_DISPLAY = "07 92 91 62 04";
export const ACADEMY_PHONE_TEL = "tel:+213792916204";

const linkClass =
  "w-11 h-11 rounded-full bg-white text-primary inline-flex items-center justify-center hover:bg-primary-soft transition-colors";

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M14 8.2V6.4c0-1 .3-1.4 1.2-1.4H16.5V3h-2.3C11.6 3 10.2 4.6 10.2 7v1.2H8v2.9h2.2V21h3.2v-8.9h2.5l.5-2.9H13.6Z" />
    </svg>
  );
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookLink({ className }: { className?: string }) {
  return (
    <a
      href={FACEBOOK_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="صفحتنا على فيسبوك"
      className={className || linkClass}
    >
      <FacebookIcon className="w-5 h-5" />
    </a>
  );
}

export function InstagramLink({ className }: { className?: string }) {
  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="صفحتنا على إنستغرام"
      className={className || linkClass}
    >
      <InstagramIcon className="w-5 h-5" />
    </a>
  );
}

export function PhoneLink({
  className,
  showNumber = false,
}: {
  className?: string;
  showNumber?: boolean;
}) {
  return (
    <a
      href={ACADEMY_PHONE_TEL}
      dir="ltr"
      aria-label="اتصل بنا"
      className={
        showNumber
          ? `inline-flex items-center gap-2 font-bold tabular-nums ${className || ""}`
          : className || linkClass
      }
    >
      <Phone className="w-5 h-5 shrink-0" />
      {showNumber ? <span>{ACADEMY_PHONE_DISPLAY}</span> : null}
    </a>
  );
}

export function SocialLinks({
  className,
  includePhone = true,
}: {
  className?: string;
  includePhone?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {includePhone ? <PhoneLink className={className} /> : null}
      <FacebookLink className={className} />
      <InstagramLink className={className} />
    </div>
  );
}
