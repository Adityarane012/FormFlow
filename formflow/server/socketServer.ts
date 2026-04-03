import { Server, Socket } from "socket.io";
import { createServer } from "http";

const PORT = 3001;
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust as necessary for security
  },
});

interface User {
  id: string;
  name: string;
  color: string;
}

interface FormRoom {
  users: Map<string, User>;
  schema: any;
}

const formRooms = new Map<string, FormRoom>();

io.on("connection", (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-form", ({ formId, user }: { formId: string; user: User }) => {
    socket.join(`form:${formId}`);
    
    if (!formRooms.has(formId)) {
      formRooms.set(formId, { users: new Map(), schema: null });
    }
    
    const room = formRooms.get(formId)!;
    room.users.set(socket.id, user);
    
    // Notify others in the room
    socket.to(`form:${formId}`).emit("user-joined", Array.from(room.users.values()));
    
    // Send current users back to the joining user
    socket.emit("room-users", Array.from(room.users.values()));
    
    console.log(`User ${user.name} joined form ${formId}`);
  });

  socket.on("schema-update", ({ formId, schema }: { formId: string; schema: any }) => {
    const room = formRooms.get(formId);
    if (room) {
      room.schema = schema;
      socket.to(`form:${formId}`).emit("schema-update", schema);
    }
  });

  socket.on("cursor-move", ({ formId, userId, x, y }: { formId: string; userId: string; x: number; y: number }) => {
    socket.to(`form:${formId}`).emit("cursor-move", { userId, x, y });
  });

  socket.on("undo-redo", ({ formId, schema }: { formId: string; schema: any }) => {
    socket.to(`form:${formId}`).emit("schema-update", schema);
  });

  socket.on("leave-form", (formId: string) => {
    socket.leave(`form:${formId}`);
    const room = formRooms.get(formId);
    if (room) {
      room.users.delete(socket.id);
      socket.to(`form:${formId}`).emit("user-left", Array.from(room.users.values()));
    }
  });

  socket.on("disconnect", () => {
    formRooms.forEach((room, formId) => {
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id);
        io.to(`form:${formId}`).emit("user-left", Array.from(room.users.values()));
      }
    });
    console.log(`User disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});
