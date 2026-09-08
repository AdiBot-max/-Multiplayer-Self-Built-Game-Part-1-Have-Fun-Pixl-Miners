const socket = io();
const submitBtn = document.getElementById("submit");
const nameInput = document.getElementById("name");
let socketId;

socket.on('socketIdSignScript', (data)=>{
    socketId = data;
})

submitBtn.addEventListener('click', ()=>{
    socket.emit('sendPlayerNameToPublicScript', {
        name: nameInput.value,
        id: socketId
    })
    window.location.href = "./home";
})

console.log(socketId)

