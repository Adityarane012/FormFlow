import { FieldType } from "@shared/schemaTypes";

interface GeneratedField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

interface GeneratedSchema {
  title: string;
  fields: GeneratedField[];
}

const TEMPLATES: Record<string, GeneratedSchema> = {
  feedback: {
    title: "Customer Feedback Form",
    fields: [
      { id: "f1", type: "text", label: "Full Name", placeholder: "Enter your name" },
      { id: "f2", type: "email", label: "Email Address", placeholder: "your@email.com" },
      { id: "f3", type: "select", label: "How did you hear about us?", options: ["Social Media", "Friend", "Advertisement", "Other"] },
      { id: "f4", type: "radio", label: "Overall Satisfaction", options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"] },
      { id: "f5", type: "textarea", label: "Your Message", placeholder: "Tell us more..." },
    ]
  },
  job: {
    title: "Job Application Form",
    fields: [
      { id: "j1", type: "text", label: "Full Name", placeholder: "John Doe" },
      { id: "j2", type: "email", label: "Email Address", placeholder: "john@example.com" },
      { id: "j3", type: "text", label: "Phone Number", placeholder: "+1 (555) 000-0000" },
      { id: "j4", type: "select", label: "Position Applied For", options: ["Software Engineer", "Product Manager", "Designer", "Sales"] },
      { id: "j5", type: "file", label: "Upload Resume" },
      { id: "j6", type: "textarea", label: "Why do you want to work with us?", placeholder: "Tell us about your motivation..." },
    ]
  },
  event: {
    title: "Event Registration",
    fields: [
      { id: "e1", type: "text", label: "Attendee Name", placeholder: "Full Name" },
      { id: "e2", type: "email", label: "Email Address", placeholder: "participant@event.com" },
      { id: "e3", type: "number", label: "Number of Tickets", placeholder: "1" },
      { id: "e4", type: "checkbox", label: "Dietary Requirements", options: ["Vegetarian", "Vegan", "Gluten-Free", "None"] },
      { id: "e5", type: "textarea", label: "Special Requests", placeholder: "Any additional notes..." },
    ]
  },
  contact: {
    title: "Contact Us",
    fields: [
      { id: "c1", type: "text", label: "Name", placeholder: "Your Name" },
      { id: "c2", type: "email", label: "Email", placeholder: "Email address" },
      { id: "c3", type: "text", label: "Subject", placeholder: "How can we help?" },
      { id: "c4", type: "textarea", label: "Message", placeholder: "Your message here..." },
    ]
  }
};

export async function generateSchemaFromPrompt(prompt: string): Promise<GeneratedSchema> {
  const p = prompt.toLowerCase();
  
  // Keyword detection
  if (p.includes("feedback") || p.includes("review") || p.includes("customer")) {
    return TEMPLATES.feedback;
  }
  if (p.includes("job") || p.includes("apply") || p.includes("hiring") || p.includes("career")) {
    return TEMPLATES.job;
  }
  if (p.includes("event") || p.includes("registration") || p.includes("signup") || p.includes("meetup")) {
    return TEMPLATES.event;
  }
  if (p.includes("contact") || p.includes("support") || p.includes("reach out")) {
    return TEMPLATES.contact;
  }

  // Generic fallback if no keyword matches but user typed something
  return {
    title: "AI Generated Form",
    fields: [
      { id: "g1", type: "text", label: "Full Name", placeholder: "Your Name", required: true },
      { id: "g2", type: "email", label: "Email Address", placeholder: "Your Email", required: true },
      { id: "g3", type: "textarea", label: "Notes", placeholder: "Additional information..." },
    ]
  };
}
