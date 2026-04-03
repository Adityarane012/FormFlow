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
  onChange: (fieldId: string, value: string | string[]) => void;
  disabled?: boolean;
};

export function FieldRenderer({
  field,
  value,
  onChange,
  disabled,
}: FieldRendererProps) {
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const options = useMemo(
    () => field.options?.filter(Boolean) ?? [],
    [field.options]
  );

  if (field.type === "text" || field.type === "email") {
    return (
      <div className="space-y-2">
        <Label className="text-base text-gray-800">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </Label>
        <Input
          type={field.type === "email" ? "email" : "text"}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(field.id, e.target.value)}
          disabled={disabled}
          className="h-11 rounded-xl border-gray-200"
          placeholder="Your answer"
        />
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
      <div className="space-y-3">
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
          {options.map((opt) => (
            <label
              key={opt}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:bg-gray-50",
                disabled && "pointer-events-none opacity-60"
              )}
            >
              <RadioGroupItem value={opt} id={`${field.id}-${opt}`} />
              <span className="text-sm text-gray-800">{opt}</span>
            </label>
          ))}
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
      <div className="space-y-3">
        <Label className="text-base text-gray-800">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </Label>
        <div className="flex flex-col gap-2">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:bg-gray-50"
            >
              <Checkbox
                checked={selected.includes(opt)}
                onCheckedChange={(c) => toggle(opt, c === true)}
                disabled={disabled}
              />
              <span className="text-sm text-gray-800">{opt}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "file") {
    const url = typeof value === "string" ? value : "";
    return (
      <div className="space-y-2">
        <Label className="text-base text-gray-800">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </Label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            type="file"
            disabled={disabled || uploading}
            className="h-11 cursor-pointer rounded-xl border-gray-200"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setFileError(null);
              setUploading(true);
              try {
                const { url: uploaded } = await uploadFile(file);
                onChange(field.id, uploaded);
              } catch (err) {
                setFileError(
                  err instanceof Error ? err.message : "Upload failed"
                );
              } finally {
                setUploading(false);
              }
            }}
          />
          {uploading && (
            <span className="text-sm text-gray-500">Uploading…</span>
          )}
        </div>
        {url ? (
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
