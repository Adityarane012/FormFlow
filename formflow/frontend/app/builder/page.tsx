"use client";

import Link from "next/link";
import { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FORM_TEMPLATES } from "@/lib/formTemplates";
import { socketClient } from "@/lib/socketClient";
import { useAuth } from "@/contexts/AuthContext";
import { RemoteCursor } from "@/components/collaboration/RemoteCursor";
import { ShareModal } from "@/components/modals/ShareModal";
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
  Users,
  UserPlus,
  Hash,
  History
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
import { VersionHistoryPanel } from "@/components/builder/VersionHistoryPanel";
import { createForm, updateForm, getFormById } from "@/lib/dataService";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

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
  const [editingFields, setEditingFields] = useState<Record<string, string>>({}); // fieldId -> userName

  const router = useRouter();
  const searchParams = useSearchParams();
  const [formId, setFormId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("draft");
  const [isSaving, setIsSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<FieldType | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"owner" | "editor" | "viewer">("viewer");
  const isReadOnly = userRole === "viewer";
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [formAccessError, setFormAccessError] = useState<string | null>(null);
  const [fullForm, setFullForm] = useState<any>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Sync Guard to prevent infinite loops
  const skipNextEmit = useRef(false);

  // Collaboration Connection
  useEffect(() => {
    const editId = searchParams.get("id") || searchParams.get("formId");
    if (!editId || !user) return;
    
    setFormId(editId);
    
    socketClient.joinFormRoom(editId, { 
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
      setCollaborators(users.filter(u => u.id !== user.id));
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

    socketClient.onFieldEdit(({ fieldId, userId }) => {
      setEditingFields(prev => {
        const next = { ...prev };
        // Remove userId from any existing field
        Object.keys(next).forEach(fid => {
          if (next[fid] === userId) delete next[fid];
        });
        // Add to new field if it exists
        if (fieldId) {
          const collab = collaborators.find(c => c.id === userId);
          const userName = collab?.name || "Collaborator";
          next[fieldId] = userName;
        }
        return next;
      });
    });
    
    return () => {
      socketClient.leaveForm(editId);
    };
  }, [searchParams, user, setSchema, userColor, collaborators]);

  // Step 3: Broadcast current field focus
  useEffect(() => {
    if (formId && user) {
      socketClient.emitFieldEdit(formId, selectedFieldId, user.id);
    }
  }, [selectedFieldId, formId, user]);

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

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const lastCursorUpdate = useRef(0);

  // STEP 10: Remote Cursor Tracking (Throttled & Relative)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (formId && user && canvasContainerRef.current) {
        const now = Date.now();
        if (now - lastCursorUpdate.current < 50) return; // 50ms throttle
        
        const rect = canvasContainerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        socketClient.emitCursorPosition(formId, user.id, x, y);
        lastCursorUpdate.current = now;
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
      const urlToken = searchParams.get("token");
      
      getFormById(editId)
        .then(existingForm => {
          if (existingForm) {
            // Step 6 — Access Control
            const isOwner = user && (existingForm.owner_id === user.id || existingForm.created_by === user.id);
            const col = user ? (existingForm.collaborators || []).find((c: any) => 
               typeof c === 'string' ? c === user.id : c.userId === user.id
            ) : null;
            const isCollaborator = !!col;
            const isTokenMatch = urlToken && existingForm.shareToken === urlToken;
            const canAccess = isOwner || isCollaborator || isTokenMatch || existingForm.is_public_edit;

            if (!canAccess) {
               setFormAccessError("You don't have permission to edit this form. Please request access from the owner.");
               return;
            }

            // Set role
            if (isOwner) setUserRole("owner");
            else if (col?.role === "editor") setUserRole("editor");
            else if (isTokenMatch || existingForm.is_public_edit) setUserRole("editor"); 
            else setUserRole("viewer");

            setFullForm(existingForm);
            setSchema({
              title: existingForm.title,
              fields: existingForm.fields || [],
            });
            setStatus(existingForm.status);
          } else {
            setFormAccessError("Form not found. The link might be broken or the form has been deleted.");
          }
        })
        .catch(err => {
          setFormAccessError(err.message || "Failed to load form");
          toast.error(err.message || "Permission Denied");
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
      const payload = {
        title: schema.title,
        fields: schema.fields,
        status: newStatus
      };

      if (formId) {
        res = await updateForm(formId, payload);
        setStatus(newStatus);
      } else {
        res = await createForm({ 
          ...payload,
          ownerId: user?.id
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

  const handleRestore = async (v: any) => {
     try {
       setSchema(v.schema);
       // Step 4 — Save as new version
       const payload = {
         title: v.schema.title,
         fields: v.schema.fields,
         status: status
       };
       if (formId) {
         const updated = await updateForm(formId, payload);
         setFullForm(updated);
       }
       toast.success(`Restored to Version ${v.version}`);
       setIsHistoryOpen(false);
     } catch (err) {
       toast.error("Failed to restore version");
     }
  };

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id as string);
    const data = active.data.current;
    if (data?.type === "sidebar") {
      setActiveType(data.fieldType as FieldType);
    } else {
      const field = schema.fields.find(f => f.id === active.id);
      if (field) {
        setActiveType(field.type);
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over) return;

    if (active.id.toString().startsWith("palette:")) {
      const fieldType = active.data.current?.fieldType as FieldType;
      
      let targetIndex = schema.fields.length;
      if (over.id !== "canvas") {
        const overIndex = schema.fields.findIndex((f) => f.id === over.id);
        if (overIndex !== -1) {
          targetIndex = overIndex;
        }
      }
      
      addField(fieldType, targetIndex);
      return;
    }

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
                     {collaborators[0].name} {collaborators.length > 1 ? `and ${collaborators.length - 1} other${collaborators.length > 2 ? 's' : ''} are` : 'is'} editing
                  </span>
                )}
             </div>
             {isReadOnly && (
               <div className="ml-4 px-2.5 py-1 rounded-lg bg-amber-50 text-[10px] font-bold text-amber-700 uppercase tracking-widest border border-amber-100 flex items-center gap-1.5 shadow-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Read Only
               </div>
             )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-2 bg-muted/30 p-1 rounded-xl border border-border/50">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  undo();
                  if (formId) socketClient.emitUndo(formId, schema);
                }} 
                disabled={!canUndo}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  redo();
                  if (formId) socketClient.emitRedo(formId, schema);
                }} 
                disabled={!canRedo}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>

            <ThemeToggle />
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsHistoryOpen(true)}
                disabled={isReadOnly}
                className="h-9 gap-2 rounded-xl font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all ml-2"
              >
                <History className="h-3.5 w-3.5" />
                History
              </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsShareModalOpen(true)}
              disabled={isReadOnly}
              className="h-9 gap-2 rounded-xl font-medium text-blue-600 bg-blue-50/50 hover:bg-blue-100/50 hover:text-blue-700 transition-all ml-2"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Share
            </Button>
            <Button onClick={() => {
              localStorage.setItem("formflow_preview_schema", JSON.stringify(schema));
              router.push("/preview");
            }} variant="ghost" size="sm" className="h-9 gap-2 rounded-xl font-medium text-muted-foreground transition-all hover:text-foreground">
              <Play className="h-3.5 w-3.5" />
              Preview
            </Button>
            {!isReadOnly && (
              <>
                <Button 
                  onClick={() => handleSave(status)} 
                  disabled={isSaving} 
                  variant="outline" 
                  size="sm" 
                  className="h-9 gap-2 rounded-xl border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm font-medium"
                >
                  <Save className="h-3.5 w-3.5" />
                  {isSaving ? "Saving..." : "Save changes"}
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
              </>
            )}
          </div>
        </header>

        <main className="flex flex-1 overflow-hidden relative">
          <FieldSidebar onQuickAdd={(type) => addField(type)} />
          
          <div 
            ref={canvasContainerRef}
            className="flex-1 overflow-y-auto px-12 py-10 relative"
          >
            <FormCanvas 
              fields={schema.fields} 
              selectedFieldId={selectedFieldId}
              onSelect={setSelectedFieldId}
              onRemove={removeField}
              onDuplicate={duplicateField}
              onUpdate={updateField}
              editingFields={editingFields}
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
            "fixed inset-y-0 right-0 z-[60] w-80 border-l border-border bg-card shadow-2xl transition-all duration-300 ease-in-out",
            selectedFieldId ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
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

      {/* Share Modal */}
      {formId && (
        <ShareModal
          formId={formId}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          publicUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/builder/${formId}${fullForm?.shareToken ? `?token=${fullForm.shareToken}` : ''}`}
          isPublicEdit={fullForm?.is_public_edit}
          onTogglePublic={async (val) => {
            try {
              const updated = await updateForm(formId, { is_public_edit: val });
              setFullForm(updated);
              toast.success(`Public edit access ${val ? 'enabled' : 'disabled'}`);
            } catch (err) {
              toast.error("Failed to update access settings");
            }
          }}
        />
      )}

      {/* Version History Side Panel */}
      <VersionHistoryPanel 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        versions={fullForm?.schemaVersions || []}
        onRestore={handleRestore}
      />

      {/* Access Denied Overlay */}
      {formAccessError && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-background/90 backdrop-blur-md">
          <div className="w-full max-w-sm text-center space-y-6 animate-in zoom-in-95 duration-300">
             <div className="mx-auto h-20 w-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-600 shadow-xl shadow-red-100 drop-shadow-sm border border-red-100">
                <X className="h-10 w-10" />
             </div>
             <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Access Denied</h2>
                <p className="text-muted-foreground font-medium leading-relaxed">
                   {formAccessError}
                </p>
             </div>
             <Button variant="outline" size="lg" className="w-full rounded-2xl h-12 font-bold shadow-sm" asChild>
                <Link href="/">Return to Dashboard</Link>
             </Button>
          </div>
        </div>
      )}
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
