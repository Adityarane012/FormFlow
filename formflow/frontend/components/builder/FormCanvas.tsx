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
  onDuplicate?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<FormField>) => void;
}

export function FormCanvas({
  fields,
  selectedFieldId,
  onSelect,
  onRemove,
  onDuplicate,
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
        "relative block flex min-h-screen flex-1 flex-col items-center overflow-y-auto bg-[#fbfbfb] p-12 transition-colors dark:bg-background",
        isOver && "bg-blue-50/50 dark:bg-blue-950/20"
      )}
    >
      {/* Subtle Dot Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-60" />

      <div className="relative z-10 mb-20 flex min-h-[800px] w-full max-w-2xl flex-col rounded-[2rem] border border-border bg-card/90 p-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all dark:border-border dark:shadow-none">
        {/* Glow effect behind canvas */}
        <div className="absolute -inset-[1px] rounded-[2rem] bg-gradient-to-b from-gray-100 to-white -z-10 blur-[2px]" />

        <div className="p-8 pb-4 relative z-10">
          <div className="flex bg-gradient-to-b from-gray-800 to-gray-900 h-10 w-10 items-center justify-center rounded-xl shadow-lg ring-4 ring-white border border-gray-700/50 -mt-12 mb-4 mx-auto transition-transform hover:scale-105">
             <LayoutGrid className="h-4 w-4 text-white" strokeWidth={2} />
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
                onDuplicate={onDuplicate}
                onUpdate={onUpdate}
              />
            ))}
          </SortableContext>

          {fields.length === 0 && (
            <div className={cn(
              "flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200/60 rounded-[2rem] min-h-[400px] transition-all duration-300",
              isOver && "border-blue-300/50 bg-blue-50/30 scale-[1.01]"
            )}>
              <div className="flex bg-gradient-to-tr from-gray-50 to-white h-16 w-16 items-center justify-center rounded-[1.25rem] shadow-sm border border-gray-100 mb-6 transition-transform group-hover:scale-110">
                <Plus className="h-6 w-6 text-gray-400" strokeWidth={1.5} />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Your canvas is empty
              </p>
              <p className="text-gray-500 max-w-xs text-center text-sm leading-relaxed px-10">
                Drag building blocks from the left sidebar to start designing your form.
              </p>
              
              <div className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-widest shadow-sm">
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
