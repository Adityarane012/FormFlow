import { io, Socket } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:3001";

class SocketClient {
  private socket: Socket;

  constructor() {
    this.socket = io(SOCKET_SERVER_URL);
  }

  connectToForm(formId: string, user: { id: string; name: string; color: string }) {
    this.socket.emit("join-form", { formId, user });
  }

  emitSchemaUpdate(formId: string, schema: any) {
    this.socket.emit("schema-update", { formId, schema });
  }

  emitCursorMove(formId: string, userId: string, x: number, y: number) {
    this.socket.emit("cursor-move", { formId, userId, x, y });
  }

  emitUndoRedo(formId: string, schema: any) {
    this.socket.emit("undo-redo", { formId, schema });
  }

  leaveForm(formId: string) {
    this.socket.emit("leave-form", formId);
  }

  onSchemaUpdate(callback: (schema: any) => void) {
    this.socket.on("schema-update", callback);
  }

  onCursorMove(callback: (payload: { userId: string; x: number; y: number }) => void) {
    this.socket.on("cursor-move", callback);
  }

  onUserPresence(callback: (users: any[]) => void) {
    this.socket.on("user-joined", callback);
    this.socket.on("user-left", callback);
    this.socket.on("room-users", callback);
  }

  getSocket() {
    return this.socket;
  }
}

export const socketClient = new SocketClient();
