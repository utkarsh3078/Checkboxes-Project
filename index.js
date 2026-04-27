import http from "node:http";
import path from "node:path";

import express from "express";
import { Server } from "socket.io";

async function main() {
  const port = process.env.PORT || 8000;

  const app = express();
  const server = http.createServer(app);

  const io = new Server();
  io.attach(server);

  //Socket IO handler
  io.on("connection", (socket) => {
    console.log(`Socket connected`, { id: socket.id });

    socket.on("client:checkbox:change", (data) => {
      console.log(`[Socket:${socket.id}]:client:checkbox:change`, data);
      io.emit("server:checkbox:change", data);
    });
  });

  //express handlers
  app.use(express.static(path.resolve("./public")));
  app.get("/health", (req, res) => res.json({ healthy: true }));

  server.listen(port, () => {
    console.log(`Server is listening on port http://localhost:${port}`);
  });
}

main();
