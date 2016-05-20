var exampleSocket;
var lastMsg;
var game;
function antHill() {
    console.log("Attacking Anthill");
    sendMsg(encodeMsg(2, "Attacking Hill"));
}

function connect() {
    if(exampleSocket != undefined && exampleSocket.readyState == 1) {
        console.log("Already Connected");
        return;
    }
    game = new Game();
    exampleSocket = new WebSocket("ws://localhost:443");
    exampleSocket.onmessage = function(event) {
        //Recieve MSG and Update STAMP
        lastMsg = JSON.parse(event.data).msg;
        updateDate = new Date();
        date.innerHTML = "Date: " + (updateDate.getHours() % 12) + ':' + updateDate.getMinutes() + ':' +  updateDate.getSeconds();
    };
    exampleSocket.onclose = function(event) {
        stopGame();
    }

}

function disconnect() {
    exampleSocket.close();
}

function eatFood() {
    console.log("Ate Food");
    sendMsg(encodeMsg(1, "Eating Food"));
}

function encodeMsg(id, msg) {
    var encodedMsg = [];
    encodedMsg.push(id);
    encodedMsg.push(msg);
    return encodedMsg;
}

function joinGame() {
    console.log("Joined Game");
    sendMsg(encodeMsg(0, "Joshy"));
}

function sendMsg(msg) {
    exampleSocket.send(msg);
}

function updateFood(food) {
    foods = food;
}
