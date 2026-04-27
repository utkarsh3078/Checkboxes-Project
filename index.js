import http from "node:http";
import path from "node:path";

import express from "express";
import { Server } from "socket.io";

//adding state so that new tabs also can be in synced
//Simply shifting frontend code to backend for storage
const CHECKBOX_COUNT = 100;
const state = {
  checkboxes: new Array(CHECKBOX_COUNT).fill(false),
};

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
      state.checkboxes[data.index] = data.checked; //Updating the state when any change happens, so that new tabs can be in sync
    });
  });

  //express handlers
  app.use(express.static(path.resolve("./public")));
  app.get("/health", (req, res) => res.json({ healthy: true }));
  app.get("/checkboxes", (req, res) => {
    return res.json({ checkboxes: state.checkboxes }); //Sennding the state to frontend, so that it can be in sync when new tab is opened
  });

  server.listen(port, () => {
    console.log(`Server is listening on port http://localhost:${port}`);
  });
}

main();
