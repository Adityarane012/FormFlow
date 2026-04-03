"use client";

import type { ComponentType } from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  Type,
  AlignLeft,
  Mail,
  ChevronDown,
  Radio as RadioIcon,
  CheckSquare,
  Upload,
  GripVertical,
} from "lucide-react";
import { FieldType } from "@shared/schemaTypes";
import { cn } from "@/lib/utils";

const FIELD_GROUPS = [
  {
    title: "Basic Fields",
    fields: [
      { id: "text", label: "Short Text", icon: Type },
      { id: "textarea", label: "Long Text", icon: AlignLeft },
      { id: "email", label: "Email", icon: Mail },
    ],
  },
  {
    title: "Choice Fields",
    fields: [
      { id: "select", label: "Dropdown", icon: ChevronDown },
      { id: "radio", label: "Radio", icon: RadioIcon },
      { id: "checkbox", label: "Checkbox", icon: CheckSquare },
    ],
  },
  {
    title: "Advanced Fields",
    fields: [
      { id: "file", label: "File Upload", icon: Upload },
    ],
  },
];

export function SidebarFieldItem({ 
  type, 
  label, 
  icon: Icon,
  onQuickAdd,
}: { 
  type: FieldType; 
  label: string; 
  icon: ComponentType<{ className?: string }>;
  onQuickAdd?: (t: FieldType) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: {
      type: "sidebar",
      fieldType: type,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onDoubleClick={(e) => {
        e.preventDefault();
        onQuickAdd?.(type);
      }}
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 text-sm font-medium text-gray-700 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all duration-200 hover:border-gray-300 hover:shadow-[0_4px_12px_rgb(0,0,0,0.05)] hover:-translate-y-0.5 cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 ring-2 ring-blue-500 border-transparent shadow-none grayscale"
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500 shadow-sm border border-gray-100/50 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1">{label}</span>
      <GripVertical className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

export function FieldSidebar({
  onQuickAdd,
}: {
  onQuickAdd?: (type: FieldType) => void;
}) {
  return (
    <aside className="z-10 flex h-full w-[280px] shrink-0 flex-col overflow-hidden border-r border-border bg-card shadow-[4px_0_24px_rgb(0,0,0,0.02)] dark:shadow-none">
      <div className="border-b border-border bg-muted/30 p-4">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500">
          Field Library
        </h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-8 p-4 pb-20">
          {FIELD_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 flex items-center gap-2 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                {group.title}
                <div className="h-px flex-1 bg-gray-100" />
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {group.fields.map((field) => (
                  <SidebarFieldItem
                    key={field.id}
                    type={field.id as FieldType}
                    label={field.label}
                    icon={field.icon}
                    onQuickAdd={onQuickAdd}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
