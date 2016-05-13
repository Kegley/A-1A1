var exampleSocket = new WebSocket("ws://localhost:443");

exampleSocket.onmessage = function(event) {
    console.log(event);
}

function antHill() {
    console.log("Attacking Anthill");
    sendMsg(encodeMsg(2, "Attacking Hill"));
}

function connect() {
    if(exampleSocket.readyState == 1) {
        console.log("Already Connected");
        return;
    }
    exampleSocket = new WebSocket("ws://localhost:443");
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



exampleSocket.onmessage = function(event) {
  var f = document.getElementById("chatbox").contentDocument;
  var text = "";
  var msg = JSON.parse(event.data);
  var time = new Date(msg.date);
  var timeStr = time.toLocaleTimeString();

  console.log(msg);
};


var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
ctx.beginPath();
ctx.arc(95,50,10,0,2*Math.PI);
ctx.stroke();
