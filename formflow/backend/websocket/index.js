/**
 * Socket.io: realtime builder collaboration per formId room.
 * Events: field:add | field:update | field:delete — payload includes formId + schema fragment.
 */

function setupWebSocket(io) {
  io.on("connection", (socket) => {
    socket.on("builder:join", (formId) => {
      if (!formId || typeof formId !== "string") return;
      socket.join(`form:${formId}`);
    });

    socket.on("builder:leave", (formId) => {
      if (!formId) return;
      socket.leave(`form:${formId}`);
    });

    socket.on("field:add", (payload) => {
      const { formId } = payload || {};
      if (!formId) return;
      socket.to(`form:${formId}`).emit("field:add", payload);
    });

    socket.on("field:update", (payload) => {
      const { formId } = payload || {};
      if (!formId) return;
      socket.to(`form:${formId}`).emit("field:update", payload);
    });

    socket.on("field:delete", (payload) => {
      const { formId } = payload || {};
      if (!formId) return;
      socket.to(`form:${formId}`).emit("field:delete", payload);
    });

    socket.on("schema:sync", (payload) => {
      const { formId } = payload || {};
      if (!formId) return;
      socket.to(`form:${formId}`).emit("schema:sync", payload);
    });
  });
}

module.exports = { setupWebSocket };
