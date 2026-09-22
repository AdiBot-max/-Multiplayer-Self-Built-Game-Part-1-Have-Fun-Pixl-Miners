import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { createClient } from "@supabase/supabase-js";

const anon_key =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImludW56eGVzdGd6bXJiamxsaWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTUzMTAsImV4cCI6MjEwNDUzMTMxMH0.8MXt6h9moB316wDCahPn23Vbr8G092kH45WKqNnMTOU";
const supabase = createClient(
  "https://inunzxestgzmrbjllibb.supabase.co",
  anon_key,
);
const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static("./public/"));

io.on("connection", (socket) => {
  socket.on("join", (data) => {
    socket.playerName = data.name;

    socket.broadcast.emit("playerJoined", {
      name: socket.playerName,
    });
    console.log(`player ${data.name} Joined.`)
  });
  socket.on("disconnect", () => {
    socket.broadcast.emit("playerLeft", {
      name: socket.playerName,
    });
    console.log(`player ${socket.playerName} Disconnected.`)
  });
  socket.on("playerX", (x) => {
    io.emit("thisPlayerX", x);
    console.log(socket.playerId);
  });
  socket.on("playerY", (y) => {
    io.emit("thisPlayerY", y);
  });
  socket.on("playerColor", (color) => {
    io.emit("thisPlayerColor", color);
  });
  socket.on("playerInfo", (data) => {
    io.emit("playerInformation", {
      x: data.x,
      y: data.y,
      color: data.color,
      borderColor: data.borderColor,
      id: data.id,
      name: data.name
    });
  });
  socket.emit("socketIdSignScript", {
    socketId: socket.id,
  });
  socket.on("savePlayerName", async (name) => {
    console.log("savePlayerName RANN");
    await createUser(name);
    const { data, error } = await supabase
      .from("user_data")
      .select("*")
      .eq("name", name);
    if (error) {
      console.log(
        "[savePlayerName] (ERROR):\nMessage: " +
          error.message +
          "\nHint: " +
          error.hint +
          "\nCode: " +
          error.code,
      );
    } else if (data) {
      io.emit("nameAndId", {
        id: data[0].id,
        name: data[0].name,
      });
      console.log(
        "[savePlayerName] (Success):\nId: " +
          data[0].id +
          "\nName: " +
          data[0].name,
      );
      console.log(data);
    }
    console.log("[savePlayerName](?): name: " + name);
  });
  socket.on("public script data request", async (name) => {
    const { data, error } = await supabase
      .from("user_data")
      .select("id")
      .eq("name", name);

    if (error) {
      console.log(
        "Error while sending ID to /public/script.js:\nMessage: " +
          error.message,
      );
    } else if (data && data.length > 0) {
      socket.emit("id", {
        id: data[0].id,
      });
      console.log("Hiel? " + data[0].id)
    } else{
      console.log('result: ', data)
    }
    socket.id = data[0].id;
  });
  socket.on('updateName', (data)=>{
    io.emit("nameAndId", {
      id: data.id,
      name: data.name,
    });
  })
});

server.listen(3000, "0.0.0.0", () => {
  console.log("listening to port 3000, server active");
});

async function createUser(name, id) {
  console.log("createUser() ran~!");
  const { data, error } = await supabase
    .from("user_data")
    .insert({ name: name })
    .select("id")
    .single();
  if (error) {
    console.log(
      "[supabase] (ERROR):\nMessage: " +
        error.message +
        "\nHint: " +
        error.hint +
        "\nCode: " +
        error.code,
    );
  } else if (data) {
    id = data.id;
    console.log(
      "[supabase] (SUCCESS):\n{\n  Id: " + id + "\n  Name: " + name + "\n}",
    );
  }
}
