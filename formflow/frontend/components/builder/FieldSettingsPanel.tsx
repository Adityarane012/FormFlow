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
  X,
  Palette,
  Type as FontIcon,
  Image as ImageIcon,
  ArrowRight
} from "lucide-react";
import { FormField, FieldType, FormTheme } from "@shared/schemaTypes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FieldSettingsPanelProps {
  field?: FormField;
  allFields?: FormField[];
  theme?: FormTheme;
  mode?: "standard" | "one-question";
  onUpdate?: (id: string, updates: Partial<FormField>) => void;
  onUpdateTheme?: (theme: Partial<FormTheme>) => void;
  onUpdateMode?: (mode: "standard" | "one-question") => void;
  closePanel?: () => void;
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

const FONTS = ["Inter", "Geist", "Roboto", "Lexend", "Outfit", "Space Grotesk"];

export function FieldSettingsPanel({ 
  field, 
  allFields = [],
  theme,
  mode = "standard",
  onUpdate,
  onUpdateTheme,
  onUpdateMode,
  closePanel
}: FieldSettingsPanelProps) {
  // If no field is selected, show Form Appearance (Branding)
  if (!field) {
    return (
      <aside className="w-[320px] bg-white border-l border-gray-100 flex flex-col h-full shrink-0 shadow-[-4px_0_24px_rgb(0,0,0,0.02)] z-10 transition-all duration-300">
        <div className="p-4 border-b border-gray-100/80 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-3">
             <div className="flex h-8 w-8 items-center justify-center rounded-[0.6rem] bg-indigo-50 border border-indigo-100/50 shadow-[0_2px_8px_rgb(79,70,229,0.15)] text-indigo-600">
                <Palette className="h-4 w-4" />
             </div>
             <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] leading-none mb-1">Branding</p>
                <h2 className="text-xs font-bold text-gray-900 leading-none">
                  Form Appearance
                </h2>
             </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            {/* Layout Mode Selection */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                Form Layout
                <div className="h-px flex-1 bg-gray-100" />
              </h3>
              
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-50 rounded-[1.2rem] border border-gray-100 shadow-inner">
                <button
                  onClick={() => onUpdateMode?.("standard")}
                  className={cn(
                    "flex flex-col items-center gap-2 py-3 rounded-[0.9rem] transition-all duration-300",
                    mode === "standard" 
                      ? "bg-white text-indigo-600 shadow-[0_4px_12px_rgb(0,0,0,0.05)] border border-indigo-100/50" 
                      : "text-gray-400 hover:text-gray-600 hover:bg-white/50"
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Standard</span>
                </button>
                <button
                  onClick={() => onUpdateMode?.("one-question")}
                  className={cn(
                    "flex flex-col items-center gap-2 py-3 rounded-[0.9rem] transition-all duration-300",
                    mode === "one-question" 
                      ? "bg-white text-indigo-600 shadow-[0_4px_12px_rgb(0,0,0,0.05)] border border-indigo-100/50" 
                      : "text-gray-400 hover:text-gray-600 hover:bg-white/50"
                  )}
                >
                  <ArrowRight className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Immersive</span>
                </button>
              </div>
            </div>

            {/* Colors Section */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                Brand Colors
                <div className="h-px flex-1 bg-gray-100" />
              </h3>
              
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-gray-700">Primary Color</Label>
                <div className="flex items-center gap-3">
                  <div 
                    className="h-10 w-10 rounded-xl shadow-sm border border-gray-200 shrink-0 overflow-hidden relative"
                    style={{ backgroundColor: theme?.primaryColor || "#4f46e5" }}
                  >
                    <input 
                      type="color" 
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                      value={theme?.primaryColor || "#4f46e5"}
                      onChange={(e) => onUpdateTheme?.({ primaryColor: e.target.value })}
                    />
                  </div>
                  <Input 
                    value={theme?.primaryColor || "#4f46e5"}
                    onChange={(e) => onUpdateTheme?.({ primaryColor: e.target.value })}
                    className="h-10 rounded-xl border-gray-200 font-mono text-xs"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>

            {/* Typography Section */}
            <div className="space-y-4 pt-2">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                Typography
                <div className="h-px flex-1 bg-gray-100" />
              </h3>
              
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-gray-700">Font Family</Label>
                <div className="relative">
                  <FontIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select 
                    className="w-full h-10 pl-10 pr-4 rounded-xl border-gray-200 text-sm font-medium focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    value={theme?.font || "Inter"}
                    onChange={(e) => onUpdateTheme?.({ font: e.target.value })}
                  >
                    {FONTS.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Logo Section */}
            <div className="space-y-4 pt-2">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                Logos & Icons
                <div className="h-px flex-1 bg-gray-100" />
              </h3>
              
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-gray-700">Logo Image URL</Label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    value={theme?.logoUrl || ""}
                    onChange={(e) => onUpdateTheme?.({ logoUrl: e.target.value })}
                    className="h-10 pl-10 rounded-xl border-gray-200 text-sm font-medium"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                {theme?.logoUrl && (
                  <div className="p-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                    <img src={theme.logoUrl} alt="Logo Preview" className="max-h-12 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100/50 space-y-2">
               <div className="flex items-center gap-2 text-indigo-700">
                  <Info className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Note</span>
               </div>
               <p className="text-[11px] text-indigo-600/80 leading-relaxed font-medium">
                 These branding settings will be applied to the public form and the share page.
               </p>
            </div>
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t border-gray-100 bg-white">
          <Button onClick={closePanel} variant="ghost" className="w-full h-11 rounded-xl text-xs font-bold text-gray-700 hover:text-white hover:bg-indigo-600 shadow-sm border border-gray-200 transition-all hover:border-indigo-600">
            Apply Styling
          </Button>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="required-toggle" className="text-xs font-semibold text-gray-900">Required</Label>
                <Switch 
                    id="required-toggle"
                    checked={field.validation?.required || field.required}
                    onCheckedChange={(checked) => onUpdate?.(field.id, { 
                      validation: { ...field.validation, required: checked },
                      required: checked 
                    })}
                />
              </div>
              <div className="space-y-2 text-right">
                <Label htmlFor="step-index" className="text-xs font-semibold text-gray-900">Form Step</Label>
                <Input 
                    id="step-index"
                    type="number"
                    min="1"
                    max="20"
                    value={field.step || 1}
                    onChange={(e) => onUpdate?.(field.id, { step: parseInt(e.target.value) || 1 })}
                    className="h-9 rounded-xl border-gray-200 text-right font-bold w-full"
                />
              </div>
            </div>
          </div>

          {/* Validation Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              Validation
              <div className="h-px flex-1 bg-gray-100" />
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-length" className="text-xs font-semibold text-gray-700">Min Length</Label>
                <Input 
                  id="min-length"
                  type="number"
                  value={field.validation?.minLength || ""}
                  onChange={(e) => onUpdate?.(field.id, { 
                    validation: { ...field.validation, minLength: parseInt(e.target.value) || undefined } 
                  })}
                  className="h-10 rounded-xl border-gray-200"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-length" className="text-xs font-semibold text-gray-700">Max Length</Label>
                <Input 
                  id="max-length"
                  type="number"
                  value={field.validation?.maxLength || ""}
                  onChange={(e) => onUpdate?.(field.id, { 
                    validation: { ...field.validation, maxLength: parseInt(e.target.value) || undefined } 
                  })}
                  className="h-10 rounded-xl border-gray-200"
                  placeholder="Unlimited"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="regex-pattern" className="text-xs font-semibold text-gray-700">Regex Pattern</Label>
              <Input 
                id="regex-pattern"
                value={field.validation?.regex || ""}
                onChange={(e) => onUpdate?.(field.id, { 
                  validation: { ...field.validation, regex: e.target.value } 
                })}
                className="h-10 rounded-xl border-gray-200 font-mono text-xs"
                placeholder="^[0-9]+$"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="error-message" className="text-xs font-semibold text-gray-700">Custom Error Message</Label>
              <Input 
                id="error-message"
                value={field.validation?.message || ""}
                onChange={(e) => onUpdate?.(field.id, { 
                  validation: { ...field.validation, message: e.target.value } 
                })}
                className="h-10 rounded-xl border-gray-200"
                placeholder="Invalid entry"
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
