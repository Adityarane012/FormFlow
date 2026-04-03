"use client";

import { 
  Info, 
  Settings2, 
  SlidersHorizontal,
  LayoutGrid,
  ChevronRight,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface FieldSettingsPanelProps {
  field?: FormField;
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

export function FieldSettingsPanel({ 
  field, 
  onUpdate 
}: FieldSettingsPanelProps) {
  if (!field) {
    return (
      <aside className="w-[320px] bg-white border-l border-gray-200 flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <Settings2 className="h-3 w-3" />
            Field Settings
          </h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/10">
          <div className="h-16 w-16 flex items-center justify-center rounded-3xl bg-white shadow-sm border border-gray-100 mb-6 transition-all group-hover:scale-105">
            <SlidersHorizontal className="h-6 w-6 text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-900">
            No field selected
          </p>
          <p className="text-xs text-gray-400 mt-2 max-w-[180px] leading-relaxed">
            Select any field on the canvas to edit its properties, validation, and logic.
          </p>
        </div>
      </aside>
    );
  }

  const Icon = FIELD_ICONS[field.type] || Type;

  return (
    <aside className="w-[320px] bg-white border-l border-gray-200 flex flex-col h-full shrink-0 shadow-lg">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-2">
           <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-gray-100 shadow-sm text-gray-500">
              <Icon className="h-3.5 w-3.5" />
           </div>
           <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Edit Field</p>
              <h2 className="text-xs font-semibold text-gray-900 leading-none capitalize">
                {field.type}
              </h2>
           </div>
        </div>
        <div className="flex items-center gap-1">
           <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8 pb-20">
          {/* General Section */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2">
              General
              <div className="h-px flex-1 bg-gray-100" />
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="field-label" className="text-xs font-medium text-gray-600">Label</Label>
              <Input 
                id="field-label"
                value={field.label}
                onChange={(e) => onUpdate?.(field.id, { label: e.target.value })}
                className="h-10 rounded-xl border-gray-200 focus:ring-gray-900 transition-all font-medium text-sm"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="required-toggle" className="text-xs font-medium text-gray-900">Required</Label>
                <p className="text-[11px] text-gray-400">Must be filled before submit</p>
              </div>
              <Switch 
                id="required-toggle"
                checked={field.required}
                onCheckedChange={(checked) => onUpdate?.(field.id, { required: checked })}
              />
            </div>
          </div>

          {/* Logic & Advanced (Mockup) */}
          <div className="space-y-4 pt-4">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2">
              Advanced logic
              <div className="h-px flex-1 bg-gray-100" />
            </h3>
            
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-600">Conditional visibility</p>
                <ChevronRight className="h-3 w-3 text-gray-400" />
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Show this question only if user selects "Yes" in a previous field.
              </p>
            </div>
          </div>
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <Button variant="ghost" className="w-full h-10 rounded-xl text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 gap-2 border border-transparent hover:border-red-100 transition-all">
          Discard changes
        </Button>
      </div>
    </aside>
  );
}

// Add Switch component since it might not be in components/ui
// If it is, this will be redundant but safe if imported correctly.
// (In a real scenario I'd check or install it).
