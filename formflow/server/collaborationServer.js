const { Server } = require("socket.io");
const http = require("http");

const PORT = 3001;
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Track room state: formId -> { users: Map[socketId -> user], schema }
const formRooms = new Map();

io.on("connection", (socket) => {
  let currentFormId = null;

  socket.on("join-form", ({ formId, user }) => {
    currentFormId = formId;
    socket.join(`form:${formId}`);

    if (!formRooms.has(formId)) {
      formRooms.set(formId, { users: new Map() });
    }

    const room = formRooms.get(formId);
    room.users.set(socket.id, { ...user, socketId: socket.id });

    // Send room state to the joining user
    const usersInRoom = Array.from(room.users.values());
    socket.emit("room-users", usersInRoom);

    // Broadcast to others
    socket.to(`form:${formId}`).emit("user-joined", usersInRoom);
    
    console.log(`User ${user.name} joined form: ${formId}`);
  });

  socket.on("schema-update", ({ formId, schema }) => {
    socket.to(`form:${formId}`).emit("schema-update", schema);
  });

  socket.on("cursor-move", ({ formId, userId, x, y }) => {
    socket.to(`form:${formId}`).emit("cursor-move", { userId, x, y });
  });

  socket.on("undo-redo", ({ formId, schema }) => {
    socket.to(`form:${formId}`).emit("schema-update", schema);
  });

  socket.on("leave-form", (formId) => {
    socket.leave(`form:${formId}`);
    handleLeave(socket, formId);
  });

  socket.on("disconnect", () => {
    if (currentFormId) {
      handleLeave(socket, currentFormId);
    }
  });

  function handleLeave(sock, formId) {
    const room = formRooms.get(formId);
    if (room) {
      room.users.delete(sock.id);
      const remainingUsers = Array.from(room.users.values());
      io.to(`form:${formId}`).emit("user-left", remainingUsers);
      
      if (room.users.size === 0) {
        formRooms.delete(formId);
      }
    }
  }
});

server.listen(PORT, () => {
  console.log(`Collaboration server running on port ${PORT}`);
});
