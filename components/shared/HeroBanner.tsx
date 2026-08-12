import React from "react";

export function HeroBanner({
  title,
  description,
  action,
  icon: Icon,
  bgClass = "bg-purple-700",
  showGridPattern = true,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ElementType;
  bgClass?: string;
  gradientClass?: string; // Kept for backwards compatibility, but ignored
  showGridPattern?: boolean;
}) {
  return (
    <div className={`${bgClass} rounded-3xl p-4 md:p-8 shadow-xl text-white relative overflow-hidden`}>
      {showGridPattern && (
        <div className="absolute inset-0 bg-white/5 opacity-20 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      )}
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-white w-full">
      {Icon && (
        <div className="hidden md:flex w-16 h-16 rounded-2xl bg-white/10 items-center justify-center shrink-0 shadow-inner border border-white/20">
          <Icon className="w-8 h-8 text-white" />
        </div>
      )}
      <div className="flex-1 space-y-1 text-center md:text-right">
        <h2 className="text-xl md:text-2xl font-black">{title}</h2>
        <p className="text-purple-100 font-medium text-sm md:text-base">{description}</p>
      </div>
      
      {action && (
        <div className="w-full md:w-auto flex shrink-0 justify-center">
          {action}
        </div>
      )}
      </div>
    </div>
  );
}
