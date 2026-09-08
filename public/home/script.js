const socket = io();
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const keys = {};
let lastTime = 0;
let time = 0;
let connected = true;

let messageList = [];

let playerList = [];

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
});
window.addEventListener("keyup", (e) => {
  delete keys[e.code];
});

const colorArr = [
  "#ff8c8c",
  "#ffb88c",
  "#ffe48c",
  "#c2ff8c",
  "#8cb3ff",
  "#f98cff",
  "#f98cff",
];

let hue = Math.floor(Math.random() * 360);

const color = colorArr[Math.floor(Math.random() * 7)];

class PLAYERCONSTRUCTOR {
  constructor(x, y, width, height, speed, name, socketId) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.id = Math.floor(Math.random() * 1000000000000);
    this.color = `hsla(${hue}, 100%, 75%, 1)`;
    this.borderColor = `hsla(${hue}, 100%, 55%, 1)`;
    this.name = name;
    this.socketId = socketId;
  }

  draw() {
    ctx.fillStyle = this.borderColor;
    ctx.fillRect(this.x-5, this.y - 5, this.width + 10, this.height + 10)
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "black";
    ctx.fillRect(this.x+15, this.y+45, 20,20)
    ctx.fillRect(this.x+65, this.y+45, 20,20)
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y - 35, this.width, 24);
    ctx.fillStyle = `hsl(${hue}, 100%, 55%)`;
    ctx.fillText(this.name, this.x, this.y - 35)
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
}

const player = new PLAYERCONSTRUCTOR(0, 0, 100, 100, 1000, "DEFAULT_NAME", "_");
playerList.push(player);

console.log(`You are ${player.id}.`);

function gameLoop(currentTime) {
  if (!lastTime) lastTime = currentTime;
  const dt = (currentTime - lastTime) / 1000;
  lastTime = currentTime;
  if (connected) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    playerList.forEach((player) => {
      player.draw();
    });

    player.draw();
    player.update(dt);

    multiplayer();

    messageList.forEach((message) => {
      chat(message.message, 500 - message.id * 20);
    });

    requestAnimationFrame(gameLoop);
  } else if (!connected) {
    return;
  }
}
requestAnimationFrame(gameLoop);

function multiplayer() {
  socket.emit("playerInfo", {
    x: player.x,
    y: player.y,
    color: player.color,
    borderColor: player.borderColor,
    id: player.id,
  });
}

function chat(message, num) {
    ctx.fillStyle = "white"
    ctx.fillRect(0,num-15,message.length*10 + 20,20)
    ctx.fillStyle = "black"
    ctx.font = '20px "Pixelify Sans", sans-serif';
    ctx.fillText(message, 0, num);
}

socket.on("playerInformation", (data) => {
  if(data.id === player.id && player.socketId !== "_") return;
  playerList.forEach((p) => {
    const existingPlayer = playerList.find((p) => p.id === data.id);

    if (existingPlayer) {
      if(data.id === player.id && player.socketId === "_"){
        player.socketId = data.socketId;
        console.log(player.socketId)
      }
      existingPlayer.x = data.x;
      existingPlayer.y = data.y;
    } else {
      const newPlayer = new PLAYERCONSTRUCTOR(data.x, data.y, 100, 100, 1000, "DEFAULT_NAME", data.socketId);
      console.log(data.socketId)
      newPlayer.id = data.id;
      newPlayer.color = data.color;
      newPlayer.borderColor = data.borderColor;
      playerList.push(newPlayer);
    }
  });
});

socket.on("playerLeft", (data) => {
  playerList = playerList.filter((player) => player.id !== data.id);
  messageList.push({
    message: `Player#${data.id} Left the game. [${new Date().toLocaleTimeString("en-US",{ hour: "2-digit", minute: "2-digit", hour12: false })}]`,
    id: messageList.length + 1
  })
});

socket.on('playerJoined', (data)=>{
  const joinedMessages=[
    `Player#${data.id} Wants to have fun. Welcome.   [${new Date().toLocaleTimeString("en-US",{ hour: "2-digit", minute: "2-digit", hour12: false })}]`,
    `Player#${data.id} Came to play :D   [${new Date().toLocaleTimeString("en-US",{ hour: "2-digit", minute: "2-digit", hour12: false })}]`
  ]
  playerList = playerList.filter((player) => player.id !== data.id);
  messageList.push({
    message: `Player#${data.id} Joined the game.   [${new Date().toLocaleTimeString("en-US",{ hour: "2-digit", minute: "2-digit", hour12: false })}]`,
    id: messageList.length + 1
  })
  console.log("new player joined")
  player.socketId = socket.id;
})

socket.emit("join", {
  id: player.id,
});

setTimeout(() => {
  playerList.forEach((p) => {
    console.log(p);
  });
}, 10000);
socket.on('name', (data)=>{
  console.log(`PLAYERLIST BEFORE SECP: ` + playerList);

  let secondPlayer = playerList.find((p) => p.socketId === data.id.socketId);

  playerList.forEach((p)=>{
    console.log(`pid: `+p.socketId)
  })

  console.log(`recieved Data.SOCKET.ID`+data.id.socketId);
  console.log("UR SOCKETID: " + player.socketId)
  console.log('SECP: '+secondPlayer)
  console.log(data.name)
  secondPlayer.name = data.name;
  console.log(player.socketId)
})
console.log(player.socketId)
