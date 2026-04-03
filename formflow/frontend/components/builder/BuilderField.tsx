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
}

const FIELD_ICONS: Record<FieldType, any> = {
  text: Type,
  textarea: AlignLeft,
  email: Mail,
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
  onUpdate 
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
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const Icon = FIELD_ICONS[field.type] || Type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect?.(field.id)}
      className={cn(
        "group relative flex flex-col gap-3 rounded-[1.5rem] border border-gray-100 bg-white p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-gray-200",
        isSelected && "ring-2 ring-blue-600 border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.08)] scale-[1.01] hover:border-transparent",
        isDragging && "opacity-50 grayscale scale-[0.98] z-0 shadow-none border-dashed"
      )}
    >
      {/* Reorder Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1.5 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-gray-900"
      >
        <GripVertical className="h-5 w-5" />
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
            <input
              type="text"
              value={field.label}
              onChange={(e) => onUpdate?.(field.id, { label: e.target.value })}
              className="mt-0.5 border-none bg-transparent p-0 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-0 placeholder:text-gray-300"
              placeholder="Question label..."
            />
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate?.(field.id);
            }}
            className="h-8 w-8 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
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
            className="h-8 w-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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

      {field.required && (
        <div className="absolute top-2 right-2 flex bg-gray-900 h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white">
          *
        </div>
      )}
    </div>
  );
}
