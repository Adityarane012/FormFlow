"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  GripVertical, 
  Trash2, 
  Settings2,
  Copy,
  Lock,
  Type,
  AlignLeft,
  Mail,
  Hash,
  ChevronDown,
  Radio as RadioIcon,
  CheckSquare,
  Upload
} from "lucide-react";
import { FormField, FieldType } from "@shared/schemaTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface BuilderFieldProps {
  field: FormField;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onRemove?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<FormField>) => void;
  editingBy?: string;
}

const FIELD_ICONS: Record<FieldType, any> = {
  text: Type,
  textarea: AlignLeft,
  email: Mail,
  number: Hash,
  select: ChevronDown,
  checkbox: CheckSquare,
  radio: RadioIcon,
  file: Upload,
};

export function BuilderField({ 
  field, 
  isSelected, 
  onSelect, 
  onRemove, 
  onDuplicate,
  onUpdate,
  editingBy
}: BuilderFieldProps) {
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

  const Icon = FIELD_ICONS[field.type] || Type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        // Only select if not dragging and not clicking on a sub-element (if needed)
        // Actually, select logic usually is fine.
        onSelect?.(field.id);
      }}
      className={cn(
        "group relative flex flex-col gap-3 rounded-[1.5rem] border border-gray-100 bg-white p-6 transition-all duration-300",
        "hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-gray-200",
        isSelected && "ring-2 ring-blue-600 border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.08)] scale-[1.01]",
        isDragging && "opacity-80 shadow-2xl z-50 scale-[1.02] border-blue-200 ring-4 ring-blue-500/10 drop-shadow-2xl cursor-grabbing"
      )}
    >
      {/* Reorder Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-3 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all p-2 text-gray-300 hover:text-indigo-600 border border-gray-100 bg-white shadow-sm rounded-xl z-20"
      >
        <GripVertical className="h-5 w-5" strokeWidth={1.5} />
      </div>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-500 border border-gray-100">
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {field.type}
            </p>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={field.label}
                onChange={(e) => onUpdate?.(field.id, { label: e.target.value })}
                className="mt-0.5 border-none bg-transparent p-0 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-0 placeholder:text-gray-300"
                placeholder="Question label..."
              />
              {field.required && <span className="text-red-500 font-bold ml-1">*</span>}
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate?.(field.id);
            }}
            className="h-8 w-8 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-100 text-gray-400 hover:text-blue-500 hover:bg-white hover:border-blue-100 shadow-sm transition-all"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.(field.id);
            }}
            className="h-8 w-8 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-white hover:border-red-100 shadow-sm transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Field Preview Mockup */}
      <div className="mt-2 pl-12 pointer-events-none opacity-60">
        {field.type === "textarea" ? (
          <div className="h-20 w-full rounded-xl border border-gray-100 bg-gray-50 p-3">
            {field.placeholder && <span className="text-sm text-gray-400">{field.placeholder}</span>}
          </div>
        ) : ["select", "radio", "checkbox"].includes(field.type) ? (
          <div className="flex flex-col gap-2">
            {(field.options || ["Option 1", "Option 2"]).map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={cn(
                  "h-4 w-4 border border-gray-200 bg-white",
                  field.type === "radio" ? "rounded-full" : "rounded"
                )} />
                <span className="text-xs text-gray-500">{opt}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-10 w-full rounded-xl border border-gray-100 bg-gray-50 flex items-center px-3">
            {field.placeholder && <span className="text-sm text-gray-400">{field.placeholder}</span>}
          </div>
        )}
      </div>

      {editingBy && (
        <div className="absolute -top-2.5 right-6 flex items-center gap-1.5 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-md animate-in zoom-in-95 duration-200 ring-2 ring-white">
          <div className="h-1 w-1 animate-pulse rounded-full bg-white" />
          {editingBy} editing...
        </div>
      )}

    </div>
  );
}
