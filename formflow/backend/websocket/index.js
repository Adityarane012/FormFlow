/**
 * Socket.io: Real-time Multi-user Collaboration
 * This handles presence, schema synchronization, cursors, and undo/redo sharing for all users.
 */

// Track room state: formId -> { users: Map[socketId -> user] }
const formRooms = new Map();

function setupWebSocket(io) {
  io.on("connection", (socket) => {
    let currentFormId = null;

    console.log(`User connected to collaboration: ${socket.id}`);

    // Join a collaboration room for a specific form
    socket.on("join-form", ({ formId, user }) => {
      if (!formId) return;
      currentFormId = formId;
      socket.join(`form:${formId}`);

      if (!formRooms.has(formId)) {
        formRooms.set(formId, { users: new Map() });
      }

      const room = formRooms.get(formId);
      // Associate socket ID with user data
      room.users.set(socket.id, { ...user, socketId: socket.id });

      // Notify the joining user about existing participants
      const usersInRoom = Array.from(room.users.values());
      socket.emit("room-users", usersInRoom);

      // Notify others that someone joined
      socket.to(`form:${formId}`).emit("user-joined", usersInRoom);
      
      console.log(`User ${user.name} joined room: form:${formId}`);
    });

    // Broadcast schema updates across the room
    socket.on("schema-update", ({ formId, schema }) => {
      if (!formId) return;
      socket.to(`form:${formId}`).emit("schema-update", schema);
    });

    // Broadcast field edit focus to prevent editing overlaps
    socket.on("field-edit", ({ formId, fieldId, userId }) => {
      if (!formId) return;
      socket.to(`form:${formId}`).emit("field-edit", { fieldId, userId });
    });

    // Broadcast cursor movements with low latency
    socket.on("cursor-move", ({ formId, userId, x, y }) => {
      if (!formId) return;
      socket.to(`form:${formId}`).emit("cursor-move", { userId, x, y });
    });

    // Broadcast undo/redo operations
    socket.on("undo-redo", ({ formId, schema }) => {
      if (!formId) return;
      socket.to(`form:${formId}`).emit("schema-update", schema);
    });

    // Explicit room exit
    socket.on("leave-form", (formId) => {
      if (!formId) return;
      socket.leave(`form:${formId}`);
      handleLeave(socket, formId);
    });

    // Cleanup on disconnect
    socket.on("disconnect", () => {
      if (currentFormId) {
        handleLeave(socket, currentFormId);
      }
      console.log(`User disconnected from collaboration: ${socket.id}`);
    });

    /**
     * Helper to clean up room state and notify remaining users
     */
    function handleLeave(sock, formId) {
      const room = formRooms.get(formId);
      if (room) {
        room.users.delete(sock.id);
        const remainingUsers = Array.from(room.users.values());
        
        // Always relay current room state to survivors
        io.to(`form:${formId}`).emit("user-left", remainingUsers);
        
        // Clean up empty rooms to save memory
        if (room.users.size === 0) {
          formRooms.delete(formId);
        }
      }
    }
  });
}

module.exports = { setupWebSocket };
