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
  Upload,
  Plus,
  X
} from "lucide-react";
import { FormField, FieldType } from "@shared/schemaTypes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface FieldSettingsPanelProps {
  field?: FormField;
  allFields?: FormField[];
  onUpdate?: (id: string, updates: Partial<FormField>) => void;
  closePanel?: () => void;
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
  allFields = [],
  onUpdate,
  closePanel
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
  const hasPlaceholder = ["text", "textarea", "email"].includes(field.type);
  const hasOptions = ["select", "radio", "checkbox"].includes(field.type);

  function handleOptionChange(index: number, val: string) {
    const newOpts = [...(field?.options || [])];
    newOpts[index] = val;
    onUpdate?.(field!.id, { options: newOpts });
  }

  function addOption() {
    const newOpts = [...(field?.options || []), `Option ${(field?.options?.length || 0) + 1}`];
    onUpdate?.(field!.id, { options: newOpts });
  }

  function removeOption(index: number) {
    const newOpts = [...(field?.options || [])];
    newOpts.splice(index, 1);
    onUpdate?.(field!.id, { options: newOpts });
  }

  return (
    <aside className="w-[320px] bg-white border-l border-gray-100 flex flex-col h-full shrink-0 shadow-[-4px_0_24px_rgb(0,0,0,0.02)] z-10">
      <div className="p-4 border-b border-gray-100/80 flex items-center justify-between bg-gray-50/30">
        <div className="flex items-center gap-3">
           <div className="flex h-8 w-8 items-center justify-center rounded-[0.6rem] bg-blue-50 border border-blue-100/50 shadow-[0_2px_8px_rgb(59,130,246,0.15)] text-blue-600">
              <Icon className="h-4 w-4" />
           </div>
           <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] leading-none mb-1">Edit Field</p>
              <h2 className="text-xs font-bold text-gray-900 leading-none capitalize">
                {field.type}
              </h2>
           </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 border border-green-100/50">
           <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
           <span className="text-[9px] font-bold text-green-700 uppercase tracking-widest leading-none">Live</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8 pb-20">
          {/* General Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              General
              <div className="h-px flex-1 bg-gray-100" />
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="field-label" className="text-xs font-semibold text-gray-700">Label</Label>
              <Input 
                id="field-label"
                value={field.label}
                onChange={(e) => onUpdate?.(field.id, { label: e.target.value })}
                className="h-10 rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all font-medium text-sm"
              />
            </div>

            {hasPlaceholder && (
              <div className="space-y-2 pt-1">
                <Label htmlFor="field-placeholder" className="text-xs font-semibold text-gray-700">Placeholder text</Label>
                <Input 
                  id="field-placeholder"
                  value={field.placeholder || ""}
                  onChange={(e) => onUpdate?.(field.id, { placeholder: e.target.value })}
                  className="h-10 rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all font-medium text-sm placeholder:text-gray-300"
                  placeholder="e.g. Enter your answer"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5">
                <Label htmlFor="required-toggle" className="text-xs font-semibold text-gray-900">Required</Label>
                <p className="text-[11px] text-gray-400 font-medium">Must be filled before submit</p>
              </div>
              <Switch 
                id="required-toggle"
                checked={field.required}
                onCheckedChange={(checked) => onUpdate?.(field.id, { required: checked })}
              />
            </div>
          </div>

          {/* Options Section */}
          {hasOptions && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                Options
                <div className="h-px flex-1 bg-gray-100" />
              </h3>

              <div className="space-y-2.5 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                {(field.options || []).map((opt, i) => (
                  <div key={i} className="flex items-center gap-2 group relative">
                    <Input 
                      value={opt} 
                      onChange={(e) => handleOptionChange(i, e.target.value)} 
                      className="h-9 rounded-[0.6rem] border-gray-200 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium shadow-sm bg-white pr-9"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeOption(i)} 
                      className="absolute right-1 top-0.5 h-8 w-8 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all rounded-md"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addOption} 
                  className="w-full h-9 mt-1 text-xs font-semibold gap-2 rounded-[0.6rem] border-dashed border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Option
                </Button>
              </div>
            </div>
          )}

          {/* Logic & Advanced */}
          <div className="space-y-4 pt-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              Conditional Visibility
              <div className="h-px flex-1 bg-gray-100" />
            </h3>
            
            <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3">
              <p className="text-xs font-semibold text-gray-700">Show this question if:</p>
              
              <div className="space-y-2">
                <select 
                  className="w-full h-9 rounded-xl border-gray-200 text-xs font-medium focus:ring-blue-500 focus:border-blue-500"
                  value={field.showIf?.field || ""}
                  onChange={e => {
                    const val = e.target.value;
                    if (!val) {
                       onUpdate?.(field.id, { showIf: undefined });
                    } else {
                       onUpdate?.(field.id, { showIf: { field: val, equals: field.showIf?.equals || "" } });
                    }
                  }}
                >
                  <option value="">Always show (No logic)</option>
                  {allFields?.filter(f => f.id !== field.id).map(f => (
                    <option key={f.id} value={f.id}>{f.label || f.type}</option>
                  ))}
                </select>

                {field.showIf?.field && (
                  <>
                    <div className="flex items-center gap-2">
                      <select className="flex-1 h-9 rounded-xl border-gray-200 text-xs font-medium focus:ring-blue-500 focus:border-blue-500" disabled>
                        <option>equals</option>
                      </select>
                    </div>
                    <Input 
                      placeholder="Value"
                      value={field.showIf?.equals || ""}
                      onChange={e => {
                         onUpdate?.(field.id, { showIf: { field: field.showIf!.field, equals: e.target.value } });
                      }}
                      className="h-9 rounded-xl text-xs bg-white"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-gray-100 bg-white">
        <Button onClick={closePanel} variant="ghost" className="w-full h-11 rounded-xl text-xs font-bold text-gray-700 hover:text-white hover:bg-gray-900 shadow-sm border border-gray-200 transition-all group overflow-hidden relative">
          <span className="relative z-10">Done Editing</span>
        </Button>
      </div>
    </aside>
  );
}
