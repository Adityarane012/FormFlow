"use client";

import Link from "next/link";
import { useState } from "react";
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
  Upload
} from "lucide-react";
import { 
  DndContext, 
  DragOverlay, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent, 
  DragStartEvent,
  closestCorners
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FieldSidebar, SidebarFieldItem } from "@/components/builder/FieldSidebar";
import { FormCanvas } from "@/components/builder/FormCanvas";
import { FieldSettingsPanel } from "@/components/builder/FieldSettingsPanel";
import { useFormBuilder } from "@/hooks/useFormBuilder";
import { FormField, FieldType } from "@shared/schemaTypes";
import { cn } from "@/lib/utils";

const FIELD_ICONS: Record<FieldType, any> = {
  text: Type,
  textarea: AlignLeft,
  email: Mail,
  select: ChevronDown,
  checkbox: CheckSquare,
  radio: RadioIcon,
  file: Upload,
};

export default function BuilderPage() {
  const { 
    schema, 
    addField, 
    moveField, 
    removeField, 
    updateField, 
    updateTitle 
  } = useFormBuilder();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<FieldType | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
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
        const type = active.data.current.fieldType as FieldType;
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
    <div className="flex h-screen flex-col bg-gray-50 overflow-hidden font-sans">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* ── Builder Header ── */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shrink-0 relative z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-xl hover:bg-gray-100 transition-colors">
              <Link href="/">
                <ChevronLeft className="h-5 w-5 text-gray-400" />
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2 group">
               <Input 
                  className="h-10 w-[240px] border-transparent bg-transparent text-sm font-semibold tracking-tight text-gray-900 group-hover:bg-gray-50 group-hover:border-gray-200 focus:bg-white focus:border-gray-300 transition-all rounded-xl pl-2 placeholder:text-gray-400"
                  value={schema.title}
                  onChange={(e) => updateTitle(e.target.value)}
                  placeholder="Enter form title…"
               />
               <div className="flex bg-gray-100 h-6 w-9 items-center justify-center rounded-lg text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                 Auto
               </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-9 gap-2 rounded-xl text-gray-500 hover:text-gray-900 transition-all font-medium">
              <Play className="h-3.5 w-3.5" />
              Preview
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2 rounded-xl border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm font-medium">
              <Save className="h-3.5 w-3.5" />
              Save draft
            </Button>
            <div className="mx-1 h-4 w-px bg-gray-200" />
            <Button size="sm" className="h-9 gap-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-md px-5 font-semibold">
              <Rocket className="h-3.5 w-3.5" />
              Publish
            </Button>
          </div>
        </header>

        {/* ── Builder Workspace ── */}
        <div className="flex flex-1 overflow-hidden">
          <FieldSidebar />
          
          <FormCanvas 
            fields={schema.fields}
            selectedFieldId={selectedFieldId}
            onSelect={setSelectedFieldId}
            onRemove={removeField}
            onUpdate={updateField}
          />
          
          <FieldSettingsPanel 
             field={schema.fields.find(f => f.id === selectedFieldId)}
             onUpdate={updateField}
          />
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="flex items-center gap-3 rounded-xl border-2 border-gray-900 bg-white p-3 text-sm font-semibold text-gray-900 shadow-2xl cursor-grabbing rotate-2 scale-105 transition-transform origin-top-left">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white">
                <ActiveIcon className="h-4 w-4" />
              </div>
              <span className="flex-1 opacity-90">
                {activeType ? `Add ${activeType}...` : `Moving Question...`}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
