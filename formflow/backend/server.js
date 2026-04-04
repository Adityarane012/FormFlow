const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const formsRouter = require("./routes/forms");
const responsesRouter = require("./routes/responses");
const uploadRouter = require("./routes/upload");
const usersRouter = require("./routes/users");
const { setupWebSocket } = require("./websocket");

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN.split(",").map((s) => s.trim()),
    methods: ["GET", "POST", "PATCH"],
  },
});

app.use(
  cors({
    origin: CLIENT_ORIGIN.split(",").map((s) => s.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "formflow-api" });
});

app.use("/forms", formsRouter);
app.use("/responses", responsesRouter);
app.use("/api/upload", uploadRouter);
app.use("/users", usersRouter);

setupWebSocket(io);
server.listen(PORT, () => {
  console.log(`API + Socket.io listening on http://localhost:${PORT}`);
});
