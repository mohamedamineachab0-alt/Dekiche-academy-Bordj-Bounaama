"use client";

import Link from "next/link";
import { ReactNode } from "react";

export function CraftedButton({
  href,
  variant = "gold",
  children,
  icon,
  onClick,
  type = "link",
}: {
  href?: string;
  variant?: "gold" | "royal";
  children: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  type?: "link" | "button";
}) {
  const className = variant === "gold" ? "btn-primary" : "btn-hero-outline";

  if (type === "button" || !href) {
    return (
      <button onClick={onClick} className={className}>
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </button>
    );
  }

  return (
    <Link href={href} className={className}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </Link>
  );
}
