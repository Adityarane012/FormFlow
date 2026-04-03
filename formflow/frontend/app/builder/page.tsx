"use client";

import Link from "next/link";
import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FORM_TEMPLATES } from "@/lib/formTemplates";
import { socketClient } from "@/lib/socketClient";
import { useAuth } from "@/contexts/AuthContext";
import { RemoteCursor } from "@/components/collaboration/RemoteCursor";
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
  X,
  Undo2,
  Redo2,
  Users
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
import { createForm, updateForm, getFormById } from "@/lib/dataService";
import { toast } from "sonner";
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
  const { user } = useAuth();
  const { 
    schema, 
    addField, 
    moveField, 
    removeField, 
    duplicateField,
    updateField, 
    updateTitle,
    updateTheme,
    updateMode,
    undo,
    redo,
    canUndo,
    canRedo,
    setSchema
  } = useFormBuilder();

  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [remoteCursors, setRemoteCursors] = useState<Record<string, { x: number; y: number; color: string; name: string }>>({});
  const [userColor] = useState(() => `#${Math.floor(Math.random() * 16777215).toString(16)}`);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [formId, setFormId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("draft");
  const [isSaving, setIsSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<FieldType | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  // Sync Guard to prevent infinite loops
  const skipNextEmit = useRef(false);

  // Collaboration Connection
  useEffect(() => {
    const editId = searchParams.get("id") || searchParams.get("formId");
    if (!editId || !user) return;
    
    setFormId(editId);
    
    socketClient.connectToForm(editId, { 
      id: user.id, 
      name: user.name || user.email.split('@')[0], 
      color: userColor 
    });
    
    socketClient.onSchemaUpdate((newSchema) => {
      skipNextEmit.current = true;
      setSchema(newSchema, true); // bypass history
    });
    
    socketClient.onCursorMove(({ userId, x, y }) => {
      setRemoteCursors(prev => ({
        ...prev,
        [userId]: { ...prev[userId], x, y }
      }));
    });
    
    socketClient.onUserPresence((users) => {
      setCollaborators(users);
      setRemoteCursors(prev => {
        const next = { ...prev };
        users.forEach(u => {
          if (u.id !== user.id) {
            next[u.id] = { ...next[u.id], name: u.name, color: u.color };
          }
        });
        return next;
      });
    });
    
    return () => {
      socketClient.leaveForm(editId);
    };
  }, [searchParams, user, setSchema, userColor]);

  // Schema Sync
  useEffect(() => {
    if (formId && schema) {
      if (skipNextEmit.current) {
        skipNextEmit.current = false;
        return;
      }
      socketClient.emitSchemaUpdate(formId, schema);
    }
  }, [schema, formId]);

  // Remote Cursor Tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (formId && user) {
        socketClient.emitCursorMove(formId, user.id, e.clientX, e.clientY);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [formId, user]);

  useEffect(() => {
    const templateId = searchParams.get("template");
    const editId = searchParams.get("id") || searchParams.get("formId");

    if (editId) {
      setFormId(editId);
      getFormById(editId).then(existingForm => {
        if (existingForm) {
          setSchema(existingForm.schema);
          setStatus(existingForm.status);
        }
      });
    } else if (templateId && FORM_TEMPLATES[templateId]) {
      setSchema(FORM_TEMPLATES[templateId]);
    } else {
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleSave(newStatus: string) {
    if (!schema.title) {
      toast.error("Please enter a title for your form");
      return;
    }

    setIsSaving(true);
    try {
      let res;
      if (formId) {
        res = await updateForm(formId, { schema, status: newStatus });
        setStatus(newStatus);
      } else {
        res = await createForm({ 
          title: schema.title, 
          schema, 
          status: newStatus,
          created_by: user?.id
        });
        if (res && res.id) {
          setFormId(res.id);
          setStatus(newStatus);
          router.replace(`/builder?id=${res.id}`);
        }
      }
      toast.success(newStatus === "published" ? "Form published!" : "Draft saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save form");
    } finally {
      setIsSaving(false);
    }
  }

  function handlePublish() {
    handleSave("published");
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveType(active.data.current?.type as FieldType);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = schema.fields.findIndex((f) => f.id === active.id);
      const newIndex = schema.fields.findIndex((f) => f.id === over.id);

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
        <header className="relative z-50 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6 shadow-sm">
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
             </div>
             
             {/* Collaborative Presence */}
             <div className="flex items-center -space-x-2 ml-4">
                {collaborators.map((c) => (
                  <div 
                    key={c.id} 
                    className="h-8 w-8 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-bold text-white shadow-sm transition-transform hover:scale-110 cursor-default"
                    style={{ backgroundColor: c.color }}
                    title={c.name}
                  >
                    {c.name.substring(0, 1).toUpperCase()}
                  </div>
                ))}
                {collaborators.length > 0 && (
                  <span className="ml-4 text-[10px] font-medium text-muted-foreground animate-in fade-in slide-in-from-left-2 transition-all">
                    {collaborators.length} user{collaborators.length > 1 ? 's' : ''} editing
                  </span>
                )}
             </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-2 bg-muted/30 p-1 rounded-xl border border-border/50">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={undo} 
                disabled={!canUndo}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={redo} 
                disabled={!canRedo}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>

            <ThemeToggle />
            <Button onClick={() => {
              localStorage.setItem("formflow_preview_schema", JSON.stringify(schema));
              router.push("/preview");
            }} variant="ghost" size="sm" className="h-9 gap-2 rounded-xl font-medium text-muted-foreground transition-all hover:text-foreground">
              <Play className="h-3.5 w-3.5" />
              Preview
            </Button>
            <Button 
              onClick={() => handleSave("draft")} 
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

        <main className="flex flex-1 overflow-hidden relative">
          <FieldSidebar />
          
          <div className="flex-1 overflow-y-auto px-12 py-10 relative">
            <FormCanvas 
              fields={schema.fields} 
              selectedFieldId={selectedFieldId}
              onSelect={setSelectedFieldId}
              onRemove={removeField}
              onDuplicate={duplicateField}
              onUpdate={updateField}
            />

            {/* Remote Cursors Layer */}
            {Object.entries(remoteCursors).map(([id, cursor]) => (
              cursor.name && (
                <RemoteCursor 
                  key={id} 
                  name={cursor.name} 
                  color={cursor.color} 
                  x={cursor.x} 
                  y={cursor.y} 
                />
              )
            ))}
          </div>

          <aside className={cn(
            "h-full overflow-hidden border-l border-border bg-card transition-all duration-300 ease-in-out",
            "translate-x-0 opacity-100"
          )}>
            <FieldSettingsPanel 
                 field={schema.fields.find(f => f.id === selectedFieldId)}
                 allFields={schema.fields}
                 theme={schema.theme}
                 mode={schema.mode || "standard"}
                 onUpdate={updateField}
                 onUpdateTheme={updateTheme}
                 onUpdateMode={updateMode}
                 closePanel={() => setSelectedFieldId(null)}
            />
          </aside>
        </main>

        <DragOverlay>
          {activeId ? (
            <div className="flex w-64 items-center gap-3 rounded-xl border border-blue-200 bg-white p-4 shadow-xl ring-2 ring-blue-500/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <ActiveIcon className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold capitalize text-gray-700">{activeType}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-muted/20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
      <BuilderPageContent />
    </Suspense>
  );
}
