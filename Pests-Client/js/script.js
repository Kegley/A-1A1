var exampleSocket;
var lastMsg;
var game;

function connect() {
    if(exampleSocket != undefined && exampleSocket.readyState == 1) {
        console.log("Already Connected");
        return;
    }
    game = new Game();
    exampleSocket = new WebSocket("ws://localhost:443");
    exampleSocket.onmessage = function(event) {
        if(processingUpdate) { return; }
        //Recieve MSG and Update STAMP
        lastMsg = JSON.parse(event.data).msg;
        updateDate = new Date();
        date.value = (updateDate.getHours() % 12) + ':' + updateDate.getMinutes() + ':' +  updateDate.getSeconds();
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

function antHill() {
    console.log("Attacking Anthill");
    sendMsg(encodeMsg(2, "Attacking Hill"));
}


function encodeMsg(id, msg) {
    var encodedMsg = {};
    encodedMsg.id = id;
    encodedMsg.msg = msg;
    return JSON.stringify(encodedMsg);
}

function joinGame() {
    console.log("Joined Game");
    var names = ["Joe", "Jamie", "Johnathan", "Jesabel", "Jasmine", "Jack", "JoJo", "Jill", "Jabby", "Jessie", "TIM"];
    sendMsg(encodeMsg(0, names[(Math.floor((Math.random() * 10) + 1))]));
}

function sendMsg(msg) {
    exampleSocket.send(msg);
}

function updateFood(food) {
    foods = food;
}
