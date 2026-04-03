"use client";

import { useDroppable } from "@dnd-kit/core";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export function CanvasDropZone({ hasFields }: { hasFields: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-empty" });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[140px] flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition",
        hasFields ? "mt-3 border-gray-200 bg-gray-50/30" : "border-gray-300",
        isOver && "border-gray-400 bg-gray-50"
      )}
    >
      <Layers className="mb-2 h-8 w-8 text-gray-300" />
      <p className="text-sm font-medium text-gray-700">
        {hasFields ? "Drop more fields here" : "Drag a field here to start"}
      </p>
      <p className="mt-1 max-w-xs text-xs text-gray-500">
        Reorder with the handle on the left. Double-click items in the library
        to add quickly.
      </p>
    </div>
  );
}
