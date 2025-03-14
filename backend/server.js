import "dotenv/config";
import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Project  from "./models/project.model.js";
import { generateResult } from "./services/ai.service.js";

const port = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    const projectId = socket.handshake.query.projectId;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Invalid project ID"));
    }

    socket.project = await Project.findById(projectId);

    if (!token) {
      return next(new Error("No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return next(new Error("Invalid token"));
    }
    socket.user = decoded;
    next();
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    next(error);
  }
});

io.on("connection", async (socket) => {
  console.log("A user connected:", socket.id);

  socket.roomId = socket.handshake.query.projectId.toString();
  socket.join(socket.roomId);

  socket.on("project-message", async (data) => {
    const message = data.message;
    socket.broadcast.to(socket.roomId).emit("project-message", data);
    if (message.includes("@ai")) {
      // Found @ai keyword in message

      const prompt = message.replace("@ai", "");
      const result = await generateResult(prompt);

      io.to(socket.roomId).emit("project-message", {
        message: result,
        sender: "AI",
        projectId: data.projectId,
      });
      return;
    }
  });

  // Handle file updates
  socket.on("file-update", (data) => {
    console.log(`File update in project ${socket.roomId} by user ${data.userId}: ${data.file.filename}`);
    // Broadcast to all other users in the same project room
    socket.broadcast.to(socket.roomId).emit("file-update", data);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    socket.leave(socket.roomId);
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
