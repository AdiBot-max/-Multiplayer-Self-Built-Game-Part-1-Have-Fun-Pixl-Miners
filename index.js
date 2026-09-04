import express from "express";
import { createServer } from "node:http";
import { SocketAddress } from "node:net";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static("./public/"))

io.on('connection', (socket)=>{
    socket.on('disconnect', ()=>{
        socket.broadcast.emit("playerLeft", {
            id: socket.playerId
        })
    })
    socket.on('join', (data)=>{
        socket.playerId = data.id;

        socket.broadcast.emit("playerJoined", {
            id: socket.playerId
        })
    })
    socket.on('playerX', (x)=>{
        io.emit('thisPlayerX', x);
    })
    socket.on('playerY', (y)=>{
        io.emit('thisPlayerY', y);
    })
    socket.on('playerColor', (color)=>{
        io.emit('thisPlayerColor', color);
    })
    socket.on('playerInfo', (data)=>{
        io.emit("playerInformation", data);
    })
})

server.listen(3000, ()=>{
    console.log("listening to port 3000, server active")
})