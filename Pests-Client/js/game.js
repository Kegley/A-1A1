var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
var date = document.getElementById("updatedDate");

var output = document.createElement("p");
date.appendChild(output);

var Game = function () {
    var foods = [];
    var hills = [];
    var ants = [];
}

Game.prototype.update = function(hills, ants, foods) {
    this.hills = hills;
    this.ants  = ants;
    this.foods = foods;
}

Game.prototype.render = function() {
    this.renderHills();
    this.renderFood();
}
Game.prototype.renderHills = function() {
    for(var i = 0; i < this.hills.length; ++i){
        ctx.fillStyle="#FF0000";
        ctx.beginPath();
        ctx.arc(this.hills[i].position.x, this.hills[i].position.y, this.hills[i].radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

Game.prototype.renderFood = function() {
    for(var i = 0; i < this.foods.length; ++i){
        ctx.fillStyle="#000632";
        ctx.fillRect(this.foods[i].position.x, this.foods[i].position.y, 2,2);
    }
}


function update(data) {
    if(!lastMsg) { return; }
    if(!game) { return; };
    game.update(lastMsg.hill, null, lastMsg.food);
}


function render(lagOffset) {
    if(!game) { return; };
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render();

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

function startGame() {
    if(isPause) {
        isPause = false;
        gameLoop();
    }
}

function stopGame() {
    isPause = true;
}
