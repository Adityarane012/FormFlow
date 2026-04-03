"use client";

import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FORM_TEMPLATES } from "@/lib/formTemplates";
import { 
  ChevronLeft, 
  Play, 
  Save, 
  Rocket, 
  MousePointer2,
  Type,
  AlignLeft,
  Mail,
  ChevronDown,
  Radio as RadioIcon,
  CheckSquare,
  Upload,
  Copy,
  ExternalLink,
  X
} from "lucide-react";
import { 
  DndContext, 
  DragOverlay, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent, 
  DragStartEvent,
  closestCorners,
  KeyboardSensor
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FieldSidebar } from "@/components/builder/FieldSidebar";
import { FormCanvas } from "@/components/builder/FormCanvas";
import { FieldSettingsPanel } from "@/components/builder/FieldSettingsPanel";
import { useFormBuilder } from "@/hooks/useFormBuilder";
import { FormField, FieldType } from "@shared/schemaTypes";
import { cn } from "@/lib/utils";
import { createForm, updateForm } from "@/lib/forms";
import { ThemeToggle } from "@/components/ThemeToggle";

const FIELD_ICONS: Record<FieldType, any> = {
  text: Type,
  textarea: AlignLeft,
  email: Mail,
  select: ChevronDown,
  checkbox: CheckSquare,
  radio: RadioIcon,
  file: Upload,
};

function BuilderPageContent() {
  const { 
    schema, 
    addField, 
    moveField, 
    removeField, 
    duplicateField,
    updateField, 
    updateTitle,
    setSchema
  } = useFormBuilder();

  const searchParams = useSearchParams();

  useEffect(() => {
    const templateId = searchParams.get("template");
    if (templateId && FORM_TEMPLATES[templateId]) {
      setSchema(FORM_TEMPLATES[templateId]);
    } else {
      // Try to restore from localStorage (returning from preview)
      const savedSchema = localStorage.getItem("formflow_preview_schema");
      if (savedSchema) {
        try {
          setSchema(JSON.parse(savedSchema));
        } catch (e) {
          console.error("Failed to restore schema from localStorage", e);
        }
      }
    }
  }, [searchParams, setSchema]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<FieldType | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  
  const router = useRouter();
  const [formId, setFormId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  async function handleSave() {
    try {
      setIsSaving(true);
      let currentId = formId;
      if (currentId) {
        await updateForm(currentId, schema);
      } else {
        currentId = await createForm(schema);
        setFormId(currentId);
      }
      return currentId;
    } catch (err) {
      console.error("Save error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to save the form.\n\nError: ${errorMessage}`);
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublish() {
    const id = await handleSave();
    if (id) {
      setShowPublishModal(true);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id as string);
    if (active.data.current?.type === "sidebar") {
      setActiveType(active.data.current.fieldType);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over) return;

    const isActiveSidebar = active.data.current?.type === "sidebar";
    const isActiveCanvasItem = !isActiveSidebar;

    // 1. Dropping Sidebar Item onto Canvas or into the sortable list
    if (isActiveSidebar) {
      if (over.id === "canvas" || schema.fields.find(f => f.id === over.id)) {
        const type = active.data.current?.fieldType as FieldType;
        let index = schema.fields.length;
        
        if (over.id !== "canvas") {
           index = schema.fields.findIndex(f => f.id === over.id);
        }
        
        addField(type, index);
      }
      return;
    }

    // 2. Reordering existing fields
    if (isActiveCanvasItem && active.id !== over.id) {
      const oldIndex = schema.fields.findIndex(f => f.id === active.id);
      const newIndex = schema.fields.findIndex(f => f.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        moveField(oldIndex, newIndex);
      }
    }
  }

  const ActiveIcon = activeType ? FIELD_ICONS[activeType] : MousePointer2;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/40 font-sans dark:bg-background">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* ── Builder Header ── */}
        <header className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-xl transition-colors">
              <Link href="/">
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <div className="group flex items-center gap-2">
               <Input 
                  className="h-10 w-[240px] rounded-xl border-transparent bg-transparent pl-2 text-sm font-semibold tracking-tight text-foreground transition-all placeholder:text-muted-foreground group-hover:border-border group-hover:bg-muted/50 focus:border-border focus:bg-background"
                  value={schema.title}
                  onChange={(e) => updateTitle(e.target.value)}
                  placeholder="Enter form title…"
               />
               <div className="flex h-6 w-9 items-center justify-center rounded-lg bg-muted text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                 Auto
               </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={() => {
              localStorage.setItem("formflow_preview_schema", JSON.stringify(schema));
              router.push("/preview");
            }} variant="ghost" size="sm" className="h-9 gap-2 rounded-xl font-medium text-muted-foreground transition-all hover:text-foreground">
              <Play className="h-3.5 w-3.5" />
              Preview
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving} 
              variant="outline" 
              size="sm" 
              className="h-9 gap-2 rounded-xl border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm font-medium"
            >
              <Save className="h-3.5 w-3.5" />
              {isSaving ? "Saving..." : "Save draft"}
            </Button>
            <div className="mx-1 h-4 w-px bg-gray-200" />
            <Button 
              onClick={handlePublish} 
              disabled={isSaving} 
              size="sm" 
              className="h-9 gap-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-md px-5 font-semibold"
            >
              <Rocket className="h-3.5 w-3.5" />
              {isSaving ? "Submitting..." : "Publish"}
            </Button>
          </div>
        </header>

        {/* ── Builder Workspace ── */}
        <div
          className={cn(
            "grid flex-1 overflow-hidden transition-all duration-300 ease-in-out",
            selectedFieldId ? "grid-cols-[280px_1fr_320px]" : "grid-cols-[280px_1fr]"
          )}
        >
          <FieldSidebar />
          
          <FormCanvas 
            fields={schema.fields}
            selectedFieldId={selectedFieldId}
            onSelect={setSelectedFieldId}
            onRemove={removeField}
            onDuplicate={duplicateField}
            onUpdate={updateField}
          />
          
          <div
            className={cn(
              "h-full overflow-hidden border-l border-border bg-card transition-all duration-300 ease-in-out",
              selectedFieldId ? "translate-x-0 opacity-100" : "hidden translate-x-full opacity-0"
            )}
          >
            {selectedFieldId && (
              <FieldSettingsPanel 
                 field={schema.fields.find(f => f.id === selectedFieldId)}
                 allFields={schema.fields}
                 onUpdate={updateField}
                 closePanel={() => setSelectedFieldId(null)}
              />
            )}
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="flex items-center gap-3 rounded-xl border-2 border-gray-900 bg-white p-3 text-sm font-semibold text-gray-900 shadow-2xl cursor-grabbing rotate-2 scale-105 transition-transform origin-top-left">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white">
                <ActiveIcon className="h-4 w-4" />
              </div>
              <span className="flex-1 opacity-90">
                {activeType ? `Add ${activeType}...` : (schema.fields.find(f => f.id === activeId)?.label || `Moving Question...`)}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Publish Modal */}
      {showPublishModal && formId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Form Published</h3>
            <p className="text-sm text-gray-500 mb-6">Your form is now live and ready to be shared with the world.</p>
            
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-2 rounded-xl mb-6">
              <Input 
                readOnly 
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/form/${formId}`}
                className="border-none bg-transparent shadow-none focus-visible:ring-0 text-gray-600 font-medium h-8"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full">
              <Button 
                variant="outline" 
                className="flex-1 gap-2 rounded-xl h-11 border-gray-200 text-gray-700 hover:bg-gray-50 font-medium shadow-sm"
                onClick={() => {
                  navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/form/${formId}`);
                  alert("Link copied!");
                }}
              >
                <Copy className="h-4 w-4" />
                Copy Link
              </Button>
              <Button 
                 className="flex-1 gap-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white shadow-sm h-11 font-medium"
                 asChild
              >
                <a href={`/form/${formId}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Open Form
                </a>
              </Button>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 h-8 w-8 rounded-full hover:bg-gray-100"
              onClick={() => setShowPublishModal(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">
          Loading builder…
        </div>
      }
    >
      <BuilderPageContent />
    </Suspense>
  );
}
