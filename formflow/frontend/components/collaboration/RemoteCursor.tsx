"use client";

import React from "react";
import { MousePointer2 } from "lucide-react";

interface RemoteCursorProps {
  name: string;
  color: string;
  x: number;
  y: number;
}

export function RemoteCursor({ name, color, x, y }: RemoteCursorProps) {
  return (
    <div
      className="pointer-events-none absolute z-[100] flex flex-col items-start gap-1 transition-all duration-150 ease-out"
      style={{
        left: x,
        top: y,
      }}
    >
      <MousePointer2
        className="h-5 w-5"
        style={{ color, fill: color, stroke: "white", strokeWidth: 2 }}
      />
      <div
        className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-sm"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  );
}
