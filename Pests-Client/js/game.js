
var canvas = document.getElementById("canvas");
var date = document.getElementById("updatedDate");
var mouseBox = document.getElementById("mousePos");
var ratio;
var center = {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0
};

var output = document.createElement("p");
date.appendChild(output);

var Game = function () {
    this.foods = [];
    this.hills = [];
    this.ants = [];
    this.player = {};
    canvas.addEventListener('mousemove', function(evt) {
        var mousePos = game.getMousePos(canvas, evt);
        mouseBox.value = "x: " + mousePos.x + ", y: " + mousePos.y;
    }, false);

}

Game.prototype.update = function(player, hills, ants, foods) {
    this.player = player;
    this.hills = hills;
    this.ants  = ants;
    this.foods = foods;
}

Game.prototype.getMousePos = function (canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

Game.prototype.render = function(ctx) {
    this.renderHills(ctx);
    this.renderFood(ctx);
}
Game.prototype.renderHills = function(ctx) {
    for(var i = 0; i < this.hills.length; ++i){
        ctx.fillStyle="#FF0000";
        ctx.beginPath();
        ctx.arc(this.hills[i].position.x - ctx.center.dx, this.hills[i].position.y - ctx.center.dy, this.hills[i].radius * ratio, 0, Math.PI * 2);


        ctx.fill();
        //HILL TEXT - NAME AND POSITION ON MAP RELATIVE TO PLAYER
        ctx.font = "15px Arial";
        ctx.fillText(this.hills[i].playerNick, this.hills[i].position.x - ctx.center.dx - 10, this.hills[i].position.y - ctx.center.dy + 15);
        var xdif = this.player.hill.position.x - this.hills[i].position.x;
        var ydif = this.player.hill.position.y - this.hills[i].position.y;
        ctx.font = "10px Arial";
        ctx.fillText("(x: " + xdif + ", y: " + ydif + ")", this.hills[i].position.x - ctx.center.dx - 20, this.hills[i].position.y - ctx.center.dy + 30);
    }
}

Game.prototype.renderFood = function(ctx) {
    for(var i = 0; i < this.foods.length; ++i){
        ctx.fillStyle="#000632";
        ctx.fillRect((this.foods[i].position.x - ctx.center.dx), this.foods[i].position.y - ctx.center.dy, 2,2);
    }
}


function update(data) {
    if(!lastMsg) { return; }
    if(!game) { return; };
    game.update(lastMsg.player, lastMsg.hill, null, lastMsg.food);
}

function render(lagOffset) {
    if(!game) { return; };
    var ctx = (document.getElementById("canvas")).getContext("2d");
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    ratio = ctx.canvas.width/ctx.canvas.height;
    center.x = ctx.canvas.width / 2;
    center.y = ctx.canvas.height / 2;
    ctx.center = center;
    if(game.player) {
        center.dx = game.player.position.x - center.x;
        center.dy = game.player.position.y - center.y;
    }




    //clear screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //center dot
    ctx.fillStyle="#33FF32";
    ctx.fillRect(center.x, center.y, 2, 2);
    //draw grid


    function drawBoard(){
        var p = 10 * ratio;
        for (var x = 0; x <= ctx.canvas.width; x += 40) {
            ctx.moveTo(0.5 + x + p, p);
            ctx.lineTo(0.5 + x + p, ctx.canvas.height + p);
        }


        for (var x = 0; x <= ctx.canvas.height; x += 40) {
            ctx.moveTo(p, 0.5 + x + p);
            ctx.lineTo(ctx.canvas.width + p, 0.5 + x + p);
        }
        ctx.strokeStyle = "rgba(10, 10, 10, .5)";
        ctx.stroke();

    }
    drawBoard();
    //render game
    game.render(ctx);

}

function startGame() {
    if(isPause) {
        isPause = false;
        gameLoop();
    }
}

function stopGame() {
    isPause = true;
}


//*** GAME LOOP ****/

//Set the frame rate
var fps = 10,
//Get the start time
start = Date.now(),
//Set the frame duration in milliseconds
frameDuration = 1000 / fps,
//Initialize the lag offset
lag = 0,

lastUpdated = 0,
isPause = true;
//Start the game loop

function gameLoop() {
    if(isPause) { return; }
    requestAnimationFrame(gameLoop, canvas);

    //Calcuate the time that has elapsed since the last frame
    var current = Date.now(),
    elapsed = current - start;
    start = current;
    //Add the elapsed time to the lag counter
    lag += elapsed;

    //Update the frame if the lag counter is greater than or
    //equal to the frame duration
    while (lag >= frameDuration){
        //Update the logic
        update();
        //Reduce the lag counter by the frame duration
        lag -= frameDuration;
    }
    //Calculate the lag offset and use it to render the sprites
    var lagOffset = lag / frameDuration;
    render(lagOffset);

    //Frame data output:
    actualFps = Math.floor(1000 / elapsed);
    output.innerHTML = "ms: " + elapsed + " fps: " + actualFps;
    output.innerHTML += " lag: " + Math.floor(lag);
    output.innerHTML += " offset: " + lagOffset;
}
