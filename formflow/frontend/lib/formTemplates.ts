export const formTemplates = [
  {
    id: "feedback",
    title: "Customer Feedback",
    description: "Gather insights from your customers about their experience.",
    schema: {
      title: "Customer Feedback",
      fields: [
        { id: "q1", type: "text", label: "Name", required: true },
        { id: "q2", type: "email", label: "Email" },
        { id: "q3", type: "radio", label: "Experience", options: ["Good", "Average", "Bad"] }
      ]
    }
  },
  {
    id: "event",
    title: "Event Registration",
    description: "Easy attendee signup for your next workshop or seminar.",
    schema: {
      title: "Event Registration",
      fields: [
        { id: "q1", type: "text", label: "Full Name", required: true },
        { id: "q2", type: "email", label: "Email", required: true },
        { id: "q3", type: "select", label: "Session", options: ["Morning", "Afternoon", "Evening"] }
      ]
    }
  },
  {
    id: "job",
    title: "Job Application",
    description: "Streamline your hiring process with a modern application form.",
    schema: {
      title: "Job Application",
      fields: [
        { id: "q1", type: "text", label: "Full Name" },
        { id: "q2", type: "email", label: "Email" },
        { id: "q3", type: "file", label: "Resume Upload" }
      ]
    }
  }
];

// Compatibility alias for the existing builder calls if any
export const FORM_TEMPLATES: Record<string, any> = {};
formTemplates.forEach(t => {
  FORM_TEMPLATES[t.id] = t.schema;
});
