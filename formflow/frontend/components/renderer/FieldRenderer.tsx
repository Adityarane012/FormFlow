"use client";

import { useMemo, useState } from "react";
import type { FormField } from "@shared/schemaTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadFile } from "@/lib/api";
import { cn } from "@/lib/utils";

type FieldRendererProps = {
  field: FormField;
  value: string | string[] | undefined;
  error?: string | null;
  onChange: (fieldId: string, value: string | string[]) => void;
  disabled?: boolean;
  primaryColor?: string;
  isUploading?: boolean;
};

export function FieldRenderer({
  field,
  value,
  error,
  onChange,
  disabled,
  primaryColor = "#4f46e5",
  isUploading = false,
}: FieldRendererProps) {
  const [fileError, setFileError] = useState<string | null>(null);

  const options = useMemo(
    () => field.options?.filter(Boolean) ?? [],
    [field.options]
  );

  const errorDisplay = error || (field.type === "file" ? fileError : null);

  if (field.type === "text" || field.type === "email" || field.type === "number") {
    return (
      <div className="space-y-2">
        <Label className={cn("text-base text-gray-800", errorDisplay && "text-red-600")}>
          {field.label}
          {(field.required || field.validation?.required) && <span className="text-red-500"> *</span>}
        </Label>
        <Input
          type={field.type}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(field.id, e.target.value)}
          disabled={disabled}
          className={cn(
            "h-11 rounded-xl border-gray-200 transition-all focus:ring-2",
            errorDisplay && "border-red-300 bg-red-50/50 focus:ring-red-500/20"
          )}
          style={{ "--tw-ring-color": errorDisplay ? undefined : primaryColor } as any}
          placeholder={field.placeholder || "Your answer"}
        />
        {errorDisplay && (
          <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
            {errorDisplay}
          </p>
        )}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="space-y-2">
        <Label className="text-base text-gray-800">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </Label>
        <Textarea
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(field.id, e.target.value)}
          disabled={disabled}
          rows={5}
          className="rounded-xl border-gray-200"
          placeholder="Your answer"
        />
      </div>
    );
  }

  if (field.type === "select") {
    const v = typeof value === "string" ? value : "";
    return (
      <div className="space-y-2">
        <Label className="text-base text-gray-800">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </Label>
        <Select
          value={v || undefined}
          onValueChange={(nv) => onChange(field.id, nv)}
          disabled={disabled}
        >
          <SelectTrigger className="h-11 rounded-xl border-gray-200">
            <SelectValue placeholder="Choose an option" />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (field.type === "radio") {
    const v = typeof value === "string" ? value : "";
    return (
      <div className="space-y-3 font-sans">
        <Label className="text-base text-gray-800">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </Label>
        <RadioGroup
          value={v}
          onValueChange={(nv) => onChange(field.id, nv)}
          disabled={disabled}
          className="gap-3"
        >
          {options.map((opt) => {
            const isSelected = v === opt;
            return (
              <label
                key={opt}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:bg-gray-50",
                  isSelected && "border-opacity-100",
                  disabled && "pointer-events-none opacity-60"
                )}
                style={{ 
                  borderColor: isSelected ? primaryColor : undefined,
                  borderWidth: isSelected ? '2px' : '1px'
                }}
              >
                <RadioGroupItem value={opt} id={`${field.id}-${opt}`} />
                <span className="text-sm text-gray-800 font-medium">{opt}</span>
              </label>
            );
          })}
        </RadioGroup>
      </div>
    );
  }

  if (field.type === "checkbox") {
    const selected = Array.isArray(value) ? value : [];
    const toggle = (opt: string, checked: boolean) => {
      const next = new Set(selected);
      if (checked) next.add(opt);
      else next.delete(opt);
      onChange(field.id, Array.from(next));
    };
    return (
      <div className="space-y-3 font-sans">
        <Label className="text-base text-gray-800">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </Label>
        <div className="flex flex-col gap-2">
          {options.map((opt) => {
            const isSelected = selected.includes(opt);
            return (
              <label
                key={opt}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:bg-gray-50",
                  isSelected && "border-opacity-100"
                )}
                style={{ 
                    borderColor: isSelected ? primaryColor : undefined,
                    borderWidth: isSelected ? '2px' : '1px'
                }}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(c) => toggle(opt, c === true)}
                  disabled={disabled}
                />
                <span className="text-sm text-gray-800 font-medium">{opt}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.type === "file") {
    const isFileObject = value instanceof File;
    const url = typeof value === "string" ? value : "";
    const fileName = isFileObject ? (value as File).name : "";

    return (
      <div className="space-y-2">
        <Label className="text-base text-gray-800">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </Label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            type="file"
            disabled={disabled || isUploading}
            className="h-11 cursor-pointer rounded-xl border-gray-200"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setFileError(null);
              onChange(field.id, file as any);
            }}
          />
          {isUploading && (
            <span className="flex items-center gap-2 text-sm text-blue-600 font-medium animate-pulse">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Uploading…
            </span>
          )}
        </div>

        {isFileObject && (
          <p className="text-sm font-medium text-blue-600 bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
            Selected: {fileName}
          </p>
        )}

        {url && !isFileObject ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-gray-700 underline underline-offset-4"
          >
            View uploaded file
          </a>
        ) : null}
        {fileError ? (
          <p className="text-sm text-red-600">{fileError}</p>
        ) : null}
      </div>
    );
  }

  return null;
}
