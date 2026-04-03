import { FormSchema, generateFieldId } from "@shared/schemaTypes";

export const FORM_TEMPLATES: Record<string, FormSchema> = {
  "feedback-form": {
    title: "Feedback Form",
    fields: [
      {
        id: generateFieldId(),
        type: "text",
        label: "Your Name",
        required: true,
        placeholder: "e.g. John Doe",
      },
      {
        id: generateFieldId(),
        type: "email",
        label: "Email Address",
        required: true,
        placeholder: "Example: hello@world.com",
      },
      {
        id: generateFieldId(),
        type: "select",
        label: "Overall Satisfaction",
        required: true,
        options: ["Very Satisfied", "Satisfied", "Neutral", "Unsatisfied"],
      },
      {
        id: generateFieldId(),
        type: "textarea",
        label: "How can we improve?",
        required: false,
        placeholder: "Your suggestions...",
      },
    ],
  },
  "event-registration": {
    title: "Event Registration",
    fields: [
      {
        id: generateFieldId(),
        type: "text",
        label: "Full Name",
        required: true,
      },
      {
        id: generateFieldId(),
        type: "email",
        label: "Email",
        required: true,
      },
      {
        id: generateFieldId(),
        type: "radio",
        label: "Will you attend in person?",
        required: true,
        options: ["Yes", "No, joining virtually"],
      },
      {
        id: generateFieldId(),
        type: "checkbox",
        label: "Workshops of interest",
        options: ["Design Thinking", "React Deep Dive", "Cloud Architecture"],
      },
    ],
  },
  "job-application": {
    title: "Job Application",
    fields: [
      {
        id: generateFieldId(),
        type: "text",
        label: "Applied Position",
        required: true,
        placeholder: "e.g. Senior Frontend Engineer",
      },
      {
        id: generateFieldId(),
        type: "text",
        label: "LinkedIn Profile URL",
        required: true,
      },
      {
        id: generateFieldId(),
        type: "file",
        label: "Upload Resume/CV",
        required: true,
      },
      {
        id: generateFieldId(),
        type: "textarea",
        label: "Why do you want to join us?",
        required: true,
      },
    ],
  },
  "customer-survey": {
    title: "Customer Survey",
    fields: [
      {
        id: generateFieldId(),
        type: "select",
        label: "How did you hear about us?",
        options: ["Social Media", "Friend/Colleague", "Advertisement", "Other"],
      },
      {
        id: generateFieldId(),
        type: "radio",
        label: "Likely to recommend us?",
        options: ["Most Likely", "Likely", "Neutral", "Unlikely"],
      },
      {
        id: generateFieldId(),
        type: "textarea",
        label: "Additional comments",
      },
    ],
  },
};
