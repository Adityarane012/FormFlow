import { io, Socket } from "socket.io-client";

// Point to the main backend server (port 4000 or production URL)
const SOCKET_SERVER_URL = typeof window !== "undefined"
  ? process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
  : "http://localhost:4000";

class SocketClient {
  private socket: Socket;

  constructor() {
    this.socket = io(SOCKET_SERVER_URL);
  }

  /**
   * STEP 1: Join collaboration room
   */
  joinFormRoom(formId: string, user: { id: string; name: string; color: string }) {
    this.socket.emit("join-form", { formId, user });
  }

  /**
   * STEP 2: Real-time schema synchronization
   */
  emitSchemaUpdate(formId: string, schema: any) {
    this.socket.emit("schema-update", { formId, schema });
  }

  /**
   * STEP 3: Field focus indicators
   */
  emitFieldEdit(formId: string, fieldId: string | null, userId: string) {
    this.socket.emit("field-edit", { formId, fieldId, userId });
  }

  /**
   * STEP 4: Remote cursor tracking
   */
  emitCursorPosition(formId: string, userId: string, x: number, y: number) {
    this.socket.emit("cursor-move", { formId, userId, x, y });
  }

  /**
   * STEP 6: Synchronized Undo/Redo
   */
  emitUndo(formId: string, schema: any) {
    this.socket.emit("undo-redo", { formId, schema });
  }

  emitRedo(formId: string, schema: any) {
    this.socket.emit("undo-redo", { formId, schema });
  }

  leaveForm(formId: string) {
    this.socket.emit("leave-form", formId);
  }

  // Listeners
  onSchemaUpdate(callback: (schema: any) => void) {
    this.socket.on("schema-update", callback);
  }

  onFieldEdit(callback: (payload: { fieldId: string | null; userId: string }) => void) {
    this.socket.on("field-edit", callback);
  }

  onCursorMove(callback: (payload: { userId: string; x: number; y: number }) => void) {
    this.socket.on("cursor-move", callback);
  }

  onUserPresence(callback: (users: any[]) => void) {
    this.socket.on("room-users", (users: any[]) => callback(users));
    this.socket.on("user-joined", (users: any[]) => callback(users));
    this.socket.on("user-left", (users: any[]) => callback(users));
  }

  getSocket() {
    return this.socket;
  }
}

export const socketClient = new SocketClient();
