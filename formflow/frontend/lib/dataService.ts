import { getCurrentUser } from "./authService";
import * as mockDb from "./mockDatabase";

export type { Form, FormResponse, Collaborator } from "./mockDatabase";

// We intercept forms to ensure `schema` properties are populated, because some places
// expect form.schema instead of just form.fields (since older mock stored everything in schema)
const enrichForm = (f: mockDb.Form | null) => {
  if (!f) return null;
  // Make sure fields are accessible at top-level to satisfy dashboard which now looks for `form.fields`
  // as well as `form.schema.fields`.
  const schemaFields = f.schema?.fields || f.fields || [];
  // Normalize legacy collaborators (string[] -> Collaborator[])
  let collaborators = f.collaborators || [];
  if (Array.isArray(collaborators) && collaborators.length > 0 && typeof collaborators[0] === "string") {
    collaborators = (collaborators as any).map((id: string) => ({ userId: id, role: "editor" }));
  }

  return {
    ...f,
    owner_id: f.owner_id || (f as any).ownerId,
    created_by: f.created_by || (f as any).createdBy,
    collaborators,
    fields: schemaFields,
    schema: {
      ...(f.schema || {}),
      title: f.title || f.schema?.title,
      fields: schemaFields,
    }
  };
};

export const getForms = async (): Promise<any[]> => {
  const user = getCurrentUser();
  if (!user) return [];
  const allForms = mockDb.getForms();
  
  // Filter for matching owner, creator, or collaborator
  return allForms.filter((f) => {
    const ownerId = f.owner_id || (f as any).ownerId;
    const creatorId = f.created_by || (f as any).createdBy;
    return (
      ownerId === user.id || 
      creatorId === user.id || 
      (f.collaborators && f.collaborators.some(c => c.userId === user.id))
    );
  }).map(enrichForm);
};

export const fetchForms = getForms;

export const getFormById = async (id: string) => {
  return enrichForm(mockDb.getFormById(id));
};

export const fetchFormById = getFormById;

export const createForm = async (form: any) => {
  const user = getCurrentUser();
  const schema = form.schema || {
    title: form.title || "Untitled Form",
    fields: form.fields || [],
  };
  
  const res = mockDb.createForm({
    title: form.title || schema.title,
    schema,
    status: form.status || "draft",
    created_by: user?.id,
    owner_id: user?.id,
    collaborators: form.collaborators || [],
    is_public_edit: !!form.is_public_edit,
  });
  return enrichForm(res);
};

export const saveForm = createForm;

export const updateForm = async (id: string, updates: any) => {
  const prevForm = mockDb.getFormById(id);
  if (!prevForm) return null;

  const finalUpdates: any = { ...updates };
  
  // Reconstruct schema ONLY if schema-related updates are present
  if (updates.schema || updates.fields || updates.title) {
    const schema = updates.schema || prevForm.schema || {};
    if (updates.fields) {
      schema.fields = updates.fields;
    }
    if (updates.title) {
      schema.title = updates.title;
    }
    finalUpdates.schema = schema;
  }
  
  // Step 2 — Generate share token when form is published
  if (updates.status === "published" && (!prevForm.shareToken && !updates.shareToken)) {
      finalUpdates.shareToken = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 5) + "-" + Math.random().toString(36).substring(2, 5);
  }
  
  const res = mockDb.updateForm(id, finalUpdates);
  return enrichForm(res);
};

export const updateFormData = updateForm;

export const deleteForm = async (id: string) => mockDb.deleteForm(id);

export const getResponses = async (formId: string) => {
  const user = getCurrentUser();
  if (!user) return [];
  
  const form = mockDb.getFormById(formId);
  if (!form) return [];

  const ownerId = form.owner_id || (form as any).ownerId;
  const creatorId = form.created_by || (form as any).createdBy;
  const isOwner = ownerId === user.id || creatorId === user.id;
  const isCollaborator = form.collaborators?.some((c: any) => 
    typeof c === 'string' ? c === user.id : c.userId === user.id
  );

  if (!isOwner && !isCollaborator) {
    throw new Error("You do not have permission to view responses");
  }

  return mockDb.getResponses(formId);
};
export const fetchResponses = getResponses;

export const createResponse = async (response: any) => mockDb.createResponse(response);
export const saveResponse = createResponse;

// Collaboration helpers
export const getFormCollaborators = async (formId: string) => {
  const form = mockDb.getFormById(formId);
  if (!form) throw new Error("Form not found");
  
  const owner = mockDb.findUserById(form.owner_id || form.created_by || "");
  const collaborators = (form.collaborators || []).map(c => {
    const user = mockDb.findUserById(c.userId);
    return {
      userId: c.userId,
      name: user?.name || "Unknown User",
      email: user?.email || "Unknown email",
      role: c.role
    };
  });
  
  return { owner, collaborators };
};

// Collaboration helpers
export const inviteCollaborator = async (formId: string, email: string, role: "editor" | "viewer" = "editor") => {
  const user = getCurrentUser();
  if (!user) throw new Error("Must be logged in to invite");

  const form = mockDb.getFormById(formId);
  if (!form) throw new Error("Form not found");

  const ownerId = form.owner_id || (form as any).ownerId;
  const creatorId = form.created_by || (form as any).createdBy;
  const isOwner = ownerId === user.id || creatorId === user.id;

  if (!isOwner) {
    throw new Error("Only the owner can invite collaborators");
  }

  const invitee = mockDb.findUserByEmail(email);
  if (!invitee) {
    throw new Error(`No user found with email ${email}`);
  }

  const userId = invitee.id;
  if (userId === user.id) {
    throw new Error("You are already the owner");
  }

  const collaborators = [...(form.collaborators || [])];
  
  // Update role if already exists, else add
  const existingIndex = collaborators.findIndex(c => (typeof c === 'string' ? c === userId : c.userId === userId));
  if (existingIndex !== -1) {
    collaborators[existingIndex] = { userId, role };
  } else {
    collaborators.push({ userId, role });
  }

  await mockDb.updateForm(formId, { collaborators });
};

export const removeCollaborator = async (formId: string, userId: string) => {
  const form = mockDb.getFormById(formId);
  if (!form) throw new Error("Form not found");

  const collaborators = (form.collaborators || []).filter(c => c.userId !== userId);
  await mockDb.updateForm(formId, { collaborators });
};
