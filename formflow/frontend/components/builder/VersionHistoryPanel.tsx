import React from "react";
import { X, History, RotateCcw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SchemaVersion {
  version: number;
  schema: any;
  timestamp: number;
}

interface VersionHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  versions: SchemaVersion[];
  onRestore: (version: SchemaVersion) => void;
}

export function VersionHistoryPanel({
  isOpen,
  onClose,
  versions,
  onRestore
}: VersionHistoryPanelProps) {
  if (!isOpen) return null;

  // Show newest versions first
  const sortedVersions = [...versions].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="fixed inset-y-0 right-0 z-[120] w-80 bg-white shadow-2xl border-l border-gray-100 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gray-900 flex items-center justify-center text-white shadow-lg">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">History</h2>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Schema Versions</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl hover:bg-gray-100">
           <X className="h-5 w-5 text-gray-400" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedVersions.length === 0 ? (
          <div className="py-12 text-center space-y-4">
             <div className="mx-auto h-16 w-16 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-300">
                <Clock className="h-8 w-8" />
             </div>
             <div>
                <p className="text-sm font-bold text-gray-400">No versions yet</p>
                <p className="text-[11px] font-medium text-gray-400">Changes appear after you save</p>
             </div>
          </div>
        ) : (
          sortedVersions.map((v) => (
            <div 
              key={v.version} 
              className="p-4 rounded-2xl border border-gray-100 bg-white hover:border-blue-100 hover:bg-blue-50/20 transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-900">Version {v.version}</span>
                <span className="text-[10px] font-medium text-gray-400">
                   {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-[11px] font-medium text-gray-500 mb-4 flex items-center gap-1.5">
                 <Clock className="h-3 w-3" />
                 {new Date(v.timestamp).toLocaleDateString()}
              </p>
              
              <Button 
                onClick={() => onRestore(v)}
                variant="outline" 
                size="sm" 
                className="w-full h-9 rounded-xl border-gray-200 bg-white font-bold text-[11px] gap-2 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restore this version
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="p-6 bg-gray-50/50 border-t border-gray-100">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center flex items-center justify-center gap-2">
           <History className="h-3 w-3" />
           Version history is permanent
        </p>
      </div>
    </div>
  );
}
