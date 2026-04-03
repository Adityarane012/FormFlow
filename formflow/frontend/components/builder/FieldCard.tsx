"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import type { FormField } from "@shared/schemaTypes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FieldCardProps = {
  field: FormField;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
};

export function FieldCard({
  field,
  selected,
  onSelect,
  onDelete,
}: FieldCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-xl border bg-white shadow-sm transition",
        selected
          ? "border-blue-500 ring-2 ring-blue-200"
          : "border-gray-200 hover:border-gray-300",
        isDragging && "z-40 opacity-80 shadow-lg"
      )}
    >
      <div className="flex items-stretch gap-1">
        <button
          type="button"
          className="flex w-10 shrink-0 cursor-grab items-center justify-center rounded-l-xl border-r border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-gray-600 active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 flex-col items-start gap-2 px-4 py-4 text-left"
        >
          <div className="flex w-full items-center gap-2">
            <Badge variant="outline" className="font-normal capitalize">
              {field.type}
            </Badge>
            {field.required && (
              <span className="text-xs text-red-500">Required</span>
            )}
          </div>
          <p className="text-base font-medium text-gray-900">{field.label}</p>
          {field.showIf && (
            <p className="text-xs text-gray-500">
              Visible when{" "}
              <span className="font-mono text-gray-700">{field.showIf.field}</span>{" "}
              = {field.showIf.equals}
            </p>
          )}
        </button>
        <div className="flex shrink-0 items-start pr-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-gray-400 hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Delete field"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
