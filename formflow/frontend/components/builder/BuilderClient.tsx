"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Share2 } from "lucide-react";
import type { FieldType, FormField, FormSchema } from "@shared/schemaTypes";
import { FieldSidebar } from "@/components/builder/FieldSidebar";
import { FieldCard } from "@/components/builder/FieldCard";
import { FieldSettingsPanel } from "@/components/builder/FieldSettingsPanel";
import { CanvasDropZone } from "@/components/builder/CanvasDropZone";
import { useBuilderSocket } from "@/hooks/useBuilderSocket";
import { apiPatch } from "@/lib/api";
import { makeField } from "@/lib/builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BuilderClientProps = {
  formId: string;
  initialSchema: FormSchema;
};

const SAVE_MS = 650;

export function BuilderClient({ formId, initialSchema }: BuilderClientProps) {
  const [schema, setSchema] = useState<FormSchema>(initialSchema);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);

  const onRemoteSchema = useCallback((remote: FormSchema) => {
    setSchema(remote);
    setSaved(true);
  }, []);

  const { broadcastSchema, emitFieldAdd, emitFieldDelete, emitFieldUpdate } =
    useBuilderSocket(formId, onRemoteSchema);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function setFields(next: FormField[]) {
    setSchema((s) => ({ ...s, fields: next }));
    setSaved(false);
  }

  useEffect(() => {
    const t = setTimeout(async () => {
      setSaving(true);
      try {
        await apiPatch(`/forms/${formId}`, {
          title: schema.title,
          fields: schema.fields,
        });
        broadcastSchema(schema);
        setSaved(true);
      } catch (e) {
        console.error(e);
      } finally {
        setSaving(false);
      }
    }, SAVE_MS);
    return () => clearTimeout(t);
  }, [schema, formId, broadcastSchema]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeStr = String(active.id);
    if (activeStr.startsWith("palette:")) {
      const type = activeStr.replace("palette:", "") as FieldType;
      const newField = makeField(type);

      if (over.id === "canvas-empty") {
        setFields([...schema.fields, newField]);
        setSelectedId(newField.id);
        emitFieldAdd({ formId, field: newField });
        return;
      }

      const overIndex = schema.fields.findIndex((f) => f.id === over.id);
      if (overIndex >= 0) {
        const next = [...schema.fields];
        next.splice(overIndex, 0, newField);
        setFields(next);
        setSelectedId(newField.id);
        emitFieldAdd({ formId, field: newField });
      } else {
        setFields([...schema.fields, newField]);
        setSelectedId(newField.id);
        emitFieldAdd({ formId, field: newField });
      }
      return;
    }

    if (active.id !== over.id && over.id) {
      const fields = schema.fields;
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return;
      setFields(arrayMove(fields, oldIndex, newIndex));
    }
  }

  const selectedField =
    schema.fields.find((f) => f.id === selectedId) ?? null;

  function updateField(next: FormField) {
    setSchema((s) => ({
      ...s,
      fields: s.fields.map((f) => (f.id === next.id ? next : f)),
    }));
    setSaved(false);
    emitFieldUpdate({ formId, field: next });
  }

  function quickAdd(type: FieldType) {
    const nf = makeField(type);
    setFields([...schema.fields, nf]);
    setSelectedId(nf.id);
    emitFieldAdd({ formId, field: nf });
  }

  const fieldIds = schema.fields.map((f) => f.id);

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: "0.5" } },
    }),
  };

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/form/${formId}`
      : `/form/${formId}`;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-[100dvh] min-h-0 flex-col bg-white">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-200 px-6 py-4">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <Button variant="secondary" size="sm" asChild>
              <Link href="/" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Home
              </Link>
            </Button>
            <div className="min-w-0 flex-1 max-w-xl">
              <Input
                className="h-10 border-gray-200 bg-white text-base font-semibold"
                value={schema.title}
                onChange={(e) => {
                  setSchema((s) => ({ ...s, title: e.target.value }));
                  setSaved(false);
                }}
                placeholder="Form title"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-gray-500 sm:inline">
              {saving ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </span>
              ) : saved ? (
                "Saved"
              ) : (
                "Unsaved changes"
              )}
            </span>
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/dashboard/${formId}`}>Responses</Link>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() =>
                navigator.clipboard.writeText(
                  `${window.location.origin}/form/${formId}`
                )
              }
            >
              <Share2 className="h-4 w-4" />
              Copy public link
            </Button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <FieldSidebar onQuickAdd={quickAdd} />

          <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
            <div className="border-b border-gray-200 px-8 py-6">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Form canvas
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Public URL:{" "}
                <span className="font-mono text-xs text-gray-700">
                  {publicUrl}
                </span>
              </p>
            </div>

            <div className="flex-1 overflow-auto px-8 py-8">
              <SortableContext
                items={fieldIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="mx-auto flex max-w-2xl flex-col gap-3">
                  {schema.fields.map((f) => (
                    <FieldCard
                      key={f.id}
                      field={f}
                      selected={selectedId === f.id}
                      onSelect={() => setSelectedId(f.id)}
                      onDelete={() => {
                        emitFieldDelete({ formId, fieldId: f.id });
                        setFields(schema.fields.filter((x) => x.id !== f.id));
                        if (selectedId === f.id) setSelectedId(null);
                      }}
                    />
                  ))}
                  <CanvasDropZone hasFields={schema.fields.length > 0} />
                </div>
              </SortableContext>
            </div>
          </section>

          <FieldSettingsPanel
            field={selectedField}
            allFields={schema.fields}
            onChange={updateField}
          />
        </div>
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeId?.startsWith("palette:") ? (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-lg">
            Adding field…
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
