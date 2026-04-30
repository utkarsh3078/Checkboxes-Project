import http from "node:http";
import path from "node:path";

import express from "express";
import { Server } from "socket.io";
import { publisher, subscriber } from "./redis-connection.js";
import { channel } from "node:diagnostics_channel";

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

  await subscriber.subscribe("Internal-server:checkbox:change");
  subscriber.on("message", (channel, message) => {
    if (channel === "Internal-server:checkbox:change") {
      const { index, checked } = JSON.parse(message);
      //Now update state of all servers, so that when new tab is opened, it can be in sync
      state.checkboxes[index] = checked;
      io.emit("server:checkbox:change", { index, checked });
    }
  });

  //Socket IO handler
  io.on("connection", (socket) => {
    // console.log(`Socket connected`, { id: socket.id });

    socket.on("client:checkbox:change", async (data) => {
      console.log(`[Socket:${socket.id}]:client:checkbox:change`, data);
      // io.emit("server:checkbox:change", data);
      // state.checkboxes[data.index] = data.checked;
      //Updating the state when any change happens, so that new tabs can be in sync

      await publisher.publish(
        "Internal-server:checkbox:change",
        JSON.stringify(data),
      );
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
