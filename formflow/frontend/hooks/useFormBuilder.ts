"use client";

import { useState, useCallback } from "react";
import { 
  FormField, 
  FormSchema, 
  FieldType, 
  generateFieldId 
} from "@shared/schemaTypes";
import { arrayMove } from "@dnd-kit/sortable";

export function useFormBuilder(initialSchema?: FormSchema) {
  const [schema, setSchema] = useState<FormSchema>(
    initialSchema || { title: "Untitled form", fields: [] }
  );

  const addField = useCallback((type: FieldType, index?: number) => {
    const newField: FormField = {
      id: generateFieldId(),
      type,
      label: `Untitled ${type} question`,
      required: false,
      options: ["select", "radio", "checkbox"].includes(type) 
        ? ["Option 1", "Option 2"] 
        : undefined,
    };

    setSchema((prev) => {
      const fields = [...prev.fields];
      if (typeof index === "number") {
        fields.splice(index, 0, newField);
      } else {
        fields.push(newField);
      }
      return { ...prev, fields };
    });

    return newField;
  }, []);

  const moveField = useCallback((fromIndex: number, toIndex: number) => {
    setSchema((prev) => ({
      ...prev,
      fields: arrayMove(prev.fields, fromIndex, toIndex),
    }));
  }, []);

  const removeField = useCallback((id: string) => {
    setSchema((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== id),
    }));
  }, []);

  const updateField = useCallback((id: string, updates: Partial<FormField>) => {
    setSchema((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  }, []);

  const updateTitle = useCallback((title: string) => {
    setSchema((prev) => ({ ...prev, title }));
  }, []);

  return {
    schema,
    addField,
    moveField,
    removeField,
    updateField,
    updateTitle,
    setSchema,
  };
}
