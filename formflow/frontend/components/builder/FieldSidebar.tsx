"use client";

import { useDraggable } from "@dnd-kit/core";
import { 
  Type, 
  AlignLeft, 
  Mail, 
  Hash, 
  ChevronDown, 
  Radio as RadioIcon, 
  CheckSquare, 
  Upload, 
  Calendar, 
  Star,
  GripVertical
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  icon: Icon 
}: { 
  type: FieldType; 
  label: string; 
  icon: any; 
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${type}`,
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
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-900 hover:shadow-md cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 ring-2 ring-gray-900 border-transparent shadow-none grayscale"
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500 group-hover:bg-gray-900 group-hover:text-white transition-colors">
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1">{label}</span>
      <GripVertical className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

export function FieldSidebar() {
  return (
    <aside className="w-[280px] bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden shrink-0">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Field Library
        </h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6 pb-20">
          {FIELD_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
                {group.title}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {group.fields.map((field) => (
                  <SidebarFieldItem
                    key={field.id}
                    type={field.id as FieldType}
                    label={field.label}
                    icon={field.icon}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
