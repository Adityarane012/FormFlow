"use client";

import { useState, useCallback, useRef } from "react";
import { 
  FormField, 
  FormSchema, 
  FieldType, 
  FormTheme, 
  generateFieldId 
} from "@shared/schemaTypes";
import { arrayMove } from "@dnd-kit/sortable";

export function useFormBuilder(initialSchema?: FormSchema) {
  const [schema, setSchemaState] = useState<FormSchema>(
    initialSchema || { title: "Untitled form", fields: [] }
  );
  const [history, setHistory] = useState<FormSchema[]>([]);
  const [future, setFuture] = useState<FormSchema[]>([]);

  const setSchema = useCallback((newSchema: FormSchema | ((prev: FormSchema) => FormSchema), bypassHistory = false) => {
    setSchemaState((prev) => {
      const resolvedSchema = typeof newSchema === "function" ? newSchema(prev) : newSchema;
      
      if (!bypassHistory) {
        setHistory((h) => [...h, prev]);
        setFuture([]); // Clear future on new change
      }
      
      return resolvedSchema;
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const previous = h[h.length - 1];
      const newHistory = h.slice(0, -1);
      
      setSchemaState((current) => {
        setFuture((f) => [current, ...f]);
        return previous;
      });
      
      return newHistory;
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      const newFuture = f.slice(1);
      
      setSchemaState((current) => {
        setHistory((h) => [...h, current]);
        return next;
      });
      
      return newFuture;
    });
  }, []);

  const updateTheme = useCallback((theme: Partial<FormTheme>) => {
    setSchema((prev) => ({
      ...prev,
      theme: {
        primaryColor: prev.theme?.primaryColor || "#4f46e5",
        font: prev.theme?.font || "Inter",
        ...prev.theme,
        ...theme,
      },
    }));
  }, [setSchema]);

  const addField = useCallback((type: FieldType, index?: number) => {
    let defaultLabel = "Question";
    let defaultPlaceholder = "";

    switch (type) {
      case "text":
        defaultLabel = "What is your name?";
        defaultPlaceholder = "e.g. John Doe";
        break;
      case "email":
        defaultLabel = "What is your email address?";
        defaultPlaceholder = "e.g. hello@example.com";
        break;
      case "textarea":
        defaultLabel = "Can you provide more details?";
        defaultPlaceholder = "Type your detailed answer here...";
        break;
      case "select":
        defaultLabel = "Please select an option from the list";
        break;
      case "radio":
        defaultLabel = "Choose your preferred option";
        break;
      case "checkbox":
        defaultLabel = "Select all that apply";
        break;
      case "file":
        defaultLabel = "Please upload your relevant documents";
        break;
      case "number":
        defaultLabel = "How many?";
        defaultPlaceholder = "0";
        break;
    }

    const newField: FormField = {
      id: generateFieldId(),
      type,
      label: defaultLabel,
      required: false,
      placeholder: defaultPlaceholder,
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
  }, [setSchema]);

  const moveField = useCallback((fromIndex: number, toIndex: number) => {
    setSchema((prev) => ({
      ...prev,
      fields: arrayMove(prev.fields, fromIndex, toIndex),
    }));
  }, [setSchema]);

  const removeField = useCallback((id: string) => {
    setSchema((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== id),
    }));
  }, [setSchema]);

  const updateField = useCallback((id: string, updates: Partial<FormField>) => {
    setSchema((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  }, [setSchema]);

  const updateTitle = useCallback((title: string) => {
    setSchema((prev) => ({ ...prev, title }));
  }, [setSchema]);

  const duplicateField = useCallback((id: string) => {
    setSchema((prev) => {
      const fieldIndex = prev.fields.findIndex(f => f.id === id);
      if (fieldIndex === -1) return prev;
      
      const fieldToDuplicate = prev.fields[fieldIndex];
      const newField = {
        ...fieldToDuplicate,
        id: generateFieldId(),
      };
      
      const newFields = [...prev.fields];
      newFields.splice(fieldIndex + 1, 0, newField);
      
      return { ...prev, fields: newFields };
    });
  }, [setSchema]);

  const updateMode = useCallback((mode: "standard" | "one-question") => {
    setSchema((prev) => ({ ...prev, mode }));
  }, [setSchema]);

  return {
    schema,
    addField,
    moveField,
    removeField,
    updateField,
    duplicateField,
    updateTitle,
    updateTheme,
    updateMode,
    undo,
    redo,
    canUndo: history.length > 0,
    canRedo: future.length > 0,
    setSchema,
  };
}
