const socket = io();
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const keys = {};


let lastTime = 0;
let time = 0;
let messageList = [];

let playerList = [];

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
});
window.addEventListener("keyup", (e) => {
  delete keys[e.code];
});

let hue = Math.floor(Math.random() * 360);

class PLAYERCONSTRUCTOR {
  constructor(x, y, width, height, speed, name) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.id = Math.floor(Math.random() * 1000000000000);
    this.color = `hsla(${hue}, 100%, 75%, 1)`;
    this.borderColor = `hsla(${hue}, 100%, 55%, 1)`;
    this.name = name;
  }

  draw() {
    ctx.fillStyle = this.borderColor;
    ctx.fillRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "black";
    ctx.fillRect(this.x + 15, this.y + 45, 20, 20);
    ctx.fillRect(this.x + 65, this.y + 45, 20, 20);
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y - 35, this.width, 24);
    ctx.fillStyle = `hsl(${hue}, 100%, 15%)`;
    ctx.fillText(this.name, this.x, this.y - 17);
  }

  update(dt) {
    if (keys["ArrowUp"] || keys["KeyW"]) {
      this.y -= this.speed * dt;
    }
    if (keys["ArrowDown"] || keys["KeyS"]) {
      this.y += this.speed * dt;
    }
    if (keys["ArrowRight"] || keys["KeyD"]) {
      this.x += this.speed * dt;
    }
    if (keys["ArrowLeft"] || keys["KeyA"]) {
      this.x -= this.speed * dt;
    }

    this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
    this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));
  }
  specialFunction(){
    console.log('special Function!;/')
  }
}

ctx.font = '20px "Pixelify Sans", sans-serif';

const player = new PLAYERCONSTRUCTOR(0, 0, 100, 100, 1000, "DEFAULT_NAME", "_");
player.name = localStorage.getItem("name");
player.id = localStorage.getItem("id");
playerList.push(player);

if(player.name == undefined || player.id == undefined){
  window.location.href = '../'
}

console.log(localStorage.getItem('name'))
console.log(localStorage.getItem('id'))

socket.emit('savePlayerName', player.name)

function gameLoop(currentTime) {
  if (!lastTime) lastTime = currentTime;
  const dt = (currentTime - lastTime) / 1000;
  lastTime = currentTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    playerList.forEach(p => {
      p.draw();
    });

    player.draw();
    player.update(dt);

    multiplayer();

    messageList.forEach((message) => {
      chat(message.message, 500 - message.id * 20);
    });

    requestAnimationFrame(gameLoop);
  }
requestAnimationFrame(gameLoop);

function multiplayer() {
  socket.emit("playerInfo", {
    x: player.x,
    y: player.y,
    color: player.color,
    borderColor: player.borderColor,
    id: player.id,
    name: player.name
  });
}

function chat(message, num) {
  ctx.fillStyle = "white";
  ctx.fillRect(0, num - 15, message.length * 10 + 20, 20);
  ctx.fillStyle = "black";
  ctx.font = '20px "Pixelify Sans", sans-serif';
  ctx.fillText(message, 0, num);
}

socket.on("nameAndId", async (data) => {
  const namedPlayer = playerList.find((p) => p.id == data.id);

  if(namedPlayer != undefined){
    namedPlayer.name = data.name;
    namedPlayer.id = data.id;
    console.log('namedPlayer.id ' + namedPlayer.id)
    console.log('namedPlayer.name ' + namedPlayer.name)
  }
  if(namedPlayer == undefined){
    console.log(namedPlayer);
  }
});

socket.on("playerInformation", (data) => {
  if (data.id === player.id && player.socketId !== "_") return;
    const existingPlayer = playerList.find((p) => p.id === data.id);

    if (existingPlayer) {
      existingPlayer.x = data.x;
      existingPlayer.y = data.y;
    } else {
      const newPlayer = new PLAYERCONSTRUCTOR(
        data.x,
        data.y,
        100,
        100,
        1000,
        "DEFAULT_NAME",
      );
      newPlayer.id = data.id;
      newPlayer.color = data.color;
      newPlayer.borderColor = data.borderColor;
      playerList.push(newPlayer);
    }
  });

socket.on("playerLeft", (data) => {
  playerList = playerList.filter((player) => player.id !== data.id);
  messageList.push({
    message: `${data.name} Left the game. [${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}]`,
    id: messageList.length + 1,
  });
});

socket.on("playerJoined", (data) => {
  const joinedId = String(data.id);

  socket.emit('updateName', {
    name: player.name,
    id: player.id
  })

  const existingPlayer = playerList.find(p=> String(p.id) === joinedId)
  if(!existingPlayer && joinedId !== player.id){
    const newPlayer = new PLAYERCONSTRUCTOR(data.x || 0, data.y || 0, 100, 100, 1000, data.name, data.id);
    if(data.color) newPlayer.color = data.color;
    if(data.borderColor) newPlayer.borderColor = data.borderColor;
    messageList.push({
    message: `${data.name} Joined the game.   [${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}]`,
    id: messageList.length + 1,
  });
  }
  const joinedMessages = [
    `Player#${data.id} Wants to have fun. Welcome.   [${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}]`,
    `Player#${data.id} Came to play :D   [${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}]`,
  ];
  playerList.forEach((p) => {
    console.log(
      `[playerJoined] (playerList): \n{\n  id: ${p.id}\n  name: ${p.name}\n}`,
    );
  });
});

socket.emit("join", {
  name: player.name,
});

setTimeout(() => {
  playerList.forEach((p) => {
    console.log(p);
  });
}, 10000);
