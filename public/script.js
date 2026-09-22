const socket = io();
const submitBtn = document.getElementById("submit");
const nameInput = document.getElementById("name");
const errorScreen = document.getElementById("error");
let name = localStorage.getItem("name");
let id = localStorage.getItem("id");

submitBtn.addEventListener("click", async () => {
  if (nameInput.value.length < 3) {
    errorScreen.textContent = `name can't be shorter than three characters!`;
    return;
  }
  if (nameInput.value.length > 18) {
    errorScreen.textContent = `name can't be longer than 18 characters!`;
    return;
  }

  if (name != null) {
    await socket.emit('savePlayerName', name);
    await send(name);
  } else {
    name = nameInput.value;
    localStorage.setItem('name', name)
    await socket.emit("savePlayerName", nameInput.value);
    await send(nameInput.value);
  }
});
let door = "close";
let task = false;
async function send(name) {
  await socket.emit("public script data request", name);
  await socket.on("id", (data) => {
    localStorage.setItem("id", data.id);
    id = localStorage.getItem("id", data.id);
    console.log(id);
  });
}

function contineu(){
  if(id != null){
    window.location.href = '/home'
  }
  else if(id == null){
    return;
  }
}
contineu()

let lastTime = 0;

function gameLoop(currentTime){
  if (!lastTime) lastTime = currentTime;
  const dt = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  contineu();
  requestAnimationFrame(gameLoop)
}
requestAnimationFrame(gameLoop)
