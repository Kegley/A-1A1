var exampleSocket = new WebSocket("ws://localhost:443");
setTimeout(function() {
    exampleSocket.close();
}, 20000);
