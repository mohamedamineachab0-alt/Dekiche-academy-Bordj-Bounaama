"use client";

import React from "react";

interface MonthSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  // Add any specific props if needed
}

export function MonthSelect({ className, ...props }: MonthSelectProps) {
  return (
    <select
      {...props}
      className={`input-field ${className || ""}`}
    >
      <option value="">اختر الشهر..</option>
      {[...Array(12)].map((_, i) => {
        const monthNum = i + 1;
        const formatted = monthNum.toString().padStart(2, '0');
        return (
          <option key={monthNum} value={monthNum}>
            الشهر {formatted}
          </option>
        );
      })}
    </select>
  );
}
