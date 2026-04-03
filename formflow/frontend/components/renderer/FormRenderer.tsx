"use client";

import { useMemo, useState } from "react";
import type { FormField, FormSchema } from "@shared/schemaTypes";
import { isFieldVisible } from "@/lib/conditional";
import { FieldRenderer } from "@/components/renderer/FieldRenderer";
import { Button } from "@/components/ui/button";
import { createResponse } from "@/lib/dataService";
import { CheckCircle2, Loader2, RotateCcw, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

import { OneQuestionMode } from "@/components/forms/OneQuestionMode";

type FormRendererProps = {
  formId: string;
  schema: FormSchema;
  previewMode?: boolean;
  onSuccess?: () => void;
};

export function FormRenderer({ formId, schema, previewMode, onSuccess }: FormRendererProps) {
  const [answers, setAnswers] = useState<
    Record<string, string | string[] | undefined>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Multi-step state
  const [currentStep, setCurrentStep] = useState(1);

  const theme = schema.theme || {
    primaryColor: "#4f46e5",
    font: "Inter",
  };

  const visibleFields = useMemo(() => {
    return schema.fields.filter((f) => isFieldVisible(f, answers));
  }, [schema.fields, answers]);

  const totalSteps = useMemo(() => {
    const steps = visibleFields.map(f => f.step || 1);
    return steps.length === 0 ? 1 : Math.max(...steps);
  }, [visibleFields]);

  const stepFields = useMemo(() => {
    return visibleFields.filter(f => (f.step || 1) === currentStep);
  }, [visibleFields, currentStep]);

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  const progress = totalSteps > 1 ? Math.round(((currentStep) / totalSteps) * 100) : 0;

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function setAnswer(fieldId: string, value: string | string[]) {
    setAnswers((a) => ({ ...a, [fieldId]: value }));
    // Clear error for this field when user types
    if (fieldErrors[fieldId]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  }

  function validate(fields: FormField[]): boolean {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    for (const f of fields) {
      const value = answers[f.id];
      const validation = f.validation || (f.required ? { required: true } : {});
      const valText = value === undefined || value === null ? "" : String(value).trim();
      
      // Default validations for types
      if (f.type === "email" && !validation.regex && valText !== "") {
        validation.regex = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";
        if (!validation.message) validation.message = "Please enter a valid email address.";
      }

      // Check Required
      if (validation.required) {
        let isEmpty = false;
        if (f.type === "checkbox") {
          isEmpty = !Array.isArray(value) || value.length === 0;
        } else {
          isEmpty = valText === "";
        }
        if (isEmpty) {
          newErrors[f.id] = validation.message || `${f.label} is required.`;
          isValid = false;
          continue; // Skip further validation if empty and required
        }
      }

      // If empty and not required, skip other validations
      if (valText === "" && !validation.required) continue;

      // Min Length
      if (validation.minLength && valText.length < validation.minLength) {
        newErrors[f.id] = validation.message || `${f.label} must be at least ${validation.minLength} characters.`;
        isValid = false;
      }

      // Max Length
      if (validation.maxLength && valText.length > validation.maxLength) {
        newErrors[f.id] = validation.message || `${f.label} cannot exceed ${validation.maxLength} characters.`;
        isValid = false;
      }

      // Regex
      if (validation.regex) {
        try {
          const re = new RegExp(validation.regex);
          if (!re.test(valText)) {
            newErrors[f.id] = validation.message || `${f.label} is invalid.`;
            isValid = false;
          }
        } catch (e) {
          console.error(`Invalid regex for field ${f.id}:`, e);
        }
      }
    }

    setFieldErrors(newErrors);
    return isValid;
  }

  const handleNext = () => {
    if (!validate(stepFields)) return;
    setError(null);
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handlePrev = () => {
    setError(null);
    setFieldErrors({});
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  async function onSubmit(e: React.FormEvent) {
    if (e && e.preventDefault) e.preventDefault();
    if (previewMode) return;
    setError(null);
    
    if (!validate(visibleFields)) {
      // Find the first step that has an error and jump to it
      const firstErrorFieldId = Object.keys(fieldErrors)[0] || stepFields.find(f => fieldErrors[f.id])?.id;
      if (firstErrorFieldId) {
        const errorField = schema.fields.find(f => f.id === firstErrorFieldId);
        if (errorField && errorField.step && errorField.step !== currentStep) {
          setCurrentStep(errorField.step);
        }
      }
      return;
    }

    const payload: Record<string, string | string[]> = {};
    for (const f of visibleFields) {
      const val = answers[f.id];
      if (val === undefined) continue;
      payload[f.id] = val;
    }
    setSubmitting(true);
    try {
      await createResponse({
        form_id: formId,
        answers: payload,
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (schema.mode === "one-question") {
    return (
      <OneQuestionMode
        fields={visibleFields}
        answers={answers}
        setAnswer={setAnswer}
        onSubmit={onSubmit}
        submitting={submitting}
        error={error}
        title={schema.title}
        theme={theme}
      />
    );
  }

  return (
    <div className="relative mx-auto max-w-xl" style={{ fontFamily: theme.font }}>
      <div className="absolute -inset-1 -z-10 rounded-[2.5rem] bg-gradient-to-b from-gray-200/50 to-transparent opacity-50 blur-xl font-sans" />
      <form
        onSubmit={onSubmit}
        className="relative space-y-10 overflow-hidden rounded-[2rem] border border-gray-100 bg-white px-8 py-12 object-cover shadow-[0_20px_40px_rgb(0,0,0,0.04)] sm:px-12 dark:bg-card dark:border-border"
      >
        <div 
          className="absolute left-0 right-0 top-0 h-1.5" 
          style={{ backgroundColor: theme.primaryColor }}
        />

        <div className="border-b border-gray-100 pb-4 dark:border-border">
          {theme.logoUrl && (
            <img 
              src={theme.logoUrl} 
              alt="Logo" 
              className="max-h-12 w-auto mb-6 object-contain" 
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          )}

          {totalSteps > 1 && (
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted p-1 px-2 rounded-md">
                        Step {currentStep} of {totalSteps}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {progress}% Complete
                    </span>
                </div>
                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden dark:bg-muted/30">
                    <div 
                        className="h-full transition-all duration-500 ease-out" 
                        style={{ width: `${progress}%`, backgroundColor: theme.primaryColor }} 
                    />
                </div>
            </div>
          )}

          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-foreground">
            {schema.title || "Untitled Form"}
          </h1>
          <p className="mt-3 text-sm font-medium text-gray-500">
            {totalSteps > 1 ? `Please complete step ${currentStep} to continue.` : "Please fill out the details below."}
          </p>
        </div>

        <div className="space-y-8 min-h-[140px] animate-in fade-in slide-in-from-right-4 duration-300">
          {stepFields.map((field) => (
            <FieldRenderer
              key={field.id}
              field={field}
              value={answers[field.id]}
              onChange={(id, val) => setAnswer(id, val)}
              disabled={submitting}
              primaryColor={theme.primaryColor}
            />
          ))}
          {stepFields.length === 0 && totalSteps > 0 && (
             <div className="py-12 text-center text-muted-foreground font-medium">
               No fields in this step. Please proceed.
             </div>
          )}
        </div>

        {error ? (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        <div className="flex items-center gap-4 pt-6">
            {!isFirstStep && (
                <Button 
                    type="button"
                    variant="outline"
                    className="h-12 rounded-xl px-6 border-gray-200"
                    onClick={handlePrev}
                    disabled={submitting}
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            )}

            {!isLastStep ? (
                <Button
                    type="button"
                    onClick={handleNext}
                    className="h-12 flex-1 rounded-xl text-base shadow-sm font-bold gap-2"
                    style={{ backgroundColor: theme.primaryColor, color: '#fff' }}
                >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                </Button>
            ) : (
                <Button
                    type="submit"
                    disabled={submitting || previewMode}
                    className="h-12 flex-1 rounded-xl text-base shadow-sm font-bold gap-2"
                    style={{ backgroundColor: theme.primaryColor, color: '#fff' }}
                >
                    {submitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting
                        </>
                    ) : (
                        <>
                            {previewMode ? "Submit (Preview)" : "Submit Form"}
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </Button>
            )}
        </div>
      </form>
    </div>
  );
}
