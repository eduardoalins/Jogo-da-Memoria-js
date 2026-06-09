"use strict";

const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const { handleConnection } = require("./wsHandler");

const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
  handleConnection(ws);
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", rooms: wss.clients.size });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
