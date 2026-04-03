"use client";

import { useDroppable } from "@dnd-kit/core";
import { 
  SortableContext, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { Plus, LayoutGrid, MousePointer2 } from "lucide-react";
import { FormField } from "@shared/schemaTypes";
import { BuilderField } from "./BuilderField";
import { cn } from "@/lib/utils";

interface FormCanvasProps {
  fields: FormField[];
  selectedFieldId?: string | null;
  onSelect?: (id: string) => void;
  onRemove?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<FormField>) => void;
}

export function FormCanvas({
  fields,
  selectedFieldId,
  onSelect,
  onRemove,
  onUpdate,
}: FormCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas",
    data: {
      isCanvas: true,
    },
  });

  return (
    <main 
      ref={setNodeRef}
      className={cn(
        "flex-1 bg-gray-50 flex flex-col items-center p-12 overflow-y-auto min-h-screen transition-colors",
        isOver && "bg-gray-100"
      )}
    >
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-gray-200 shadow-sm min-h-[800px] flex flex-col p-1 mb-20 relative">
        <div className="p-8 pb-4">
          <div className="flex bg-gray-900 h-9 w-9 items-center justify-center rounded-xl shadow-md border border-white -mt-12 mb-4 mx-auto">
             <LayoutGrid className="h-4 w-4 text-white" strokeWidth={1.5} />
          </div>
          <div className="h-px w-full bg-gray-100 mb-8" />
        </div>

        <div className="flex-1 px-8 pb-12 flex flex-col gap-4">
          <SortableContext 
            items={fields.map((f) => f.id)} 
            strategy={verticalListSortingStrategy}
          >
            {fields.map((field) => (
              <BuilderField
                key={field.id}
                field={field}
                isSelected={selectedFieldId === field.id}
                onSelect={onSelect}
                onRemove={onRemove}
                onUpdate={onUpdate}
              />
            ))}
          </SortableContext>

          {fields.length === 0 && (
            <div className={cn(
              "flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[2.5rem] min-h-[400px] transition-all",
              isOver && "border-gray-900/30 border-solid bg-gray-50/50"
            )}>
              <div className="flex bg-white h-16 w-16 items-center justify-center rounded-2xl shadow-lg border border-gray-100 mb-6 group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6 text-gray-400" strokeWidth={1.5} />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Empty Canvas
              </p>
              <p className="text-gray-500 max-w-xs text-center text-sm leading-relaxed px-10">
                Drag and drop fields from the left library to start building your form structure.
              </p>
              
              <div className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900/5 text-gray-400 text-xs font-bold uppercase tracking-widest">
                <MousePointer2 className="h-3 w-3" />
                Drop field here
              </div>
            </div>
          )}
          
          {fields.length > 0 && isOver && (
            <div className="h-20 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-widest">
              Drop to add here
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
