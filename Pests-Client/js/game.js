
var canvas = document.getElementById("canvas");
var date = document.getElementById("updatedDate");
var mouseBox = document.getElementById("mousePos");
var performance = document.getElementById("performance");


var processingUpdate = false;
var ratio;
var scaleRatio;
var updateTwice = 2;
var center = {
    x: 0,
    y: 0,
    dx: 0, //offsets for camera
    dy: 0 //offsets for camera
};

var Game = function () {
    this.foods = [];
    this.hills = [];
    this.ants = [];
    this.player = {};
    this.world;
    this.mousePos;
    this.updateMouse = false;
    this.click;
    this.updateClick = false;
    canvas.addEventListener('mousemove', function(evt) {
        var mousePos = game.getMousePos(canvas, evt);
        var x = Math.round(mousePos.x/scaleRatio + center.dx);
        var y = Math.round(mousePos.y/scaleRatio + center.dy);
        mouseBox.value = "x: " + x + ", y: " + y;
        game.mousePos = {x: x, y: y};
        game.updateMouse = true;
    }, false);
    canvas.addEventListener('click', function(evt) {

        var mousePos = game.getMousePos(canvas, evt);
        var x = Math.round(mousePos.x/scaleRatio + center.dx);
        var y = Math.round(mousePos.y/scaleRatio + center.dy);
        mouseBox.value = "x: " + x + ", y: " + y;
        game.click = {x: x, y: y};
        game.updateClick = true;
    }, false);

    document.addEventListener('keydown', function(e) {
        //using keyinput
    }, false);
}

Game.prototype.update = function(world, player, hills, ants, food) {
    processingUpdate = true;
    //single objects
    this.world = world;
    this.player = player;


    this.updateFood(food);

    this.hills = hills;
    this.ants  = ants;
    processingUpdate = false;
    if(this.updateMouse) {
        sendMsg(encodeMsg(3, this.mousePos));
        this.updateMouse = false;
    }
    if(this.updateClick) {
        sendMsg(encodeMsg(4, this.click));
        this.updateClick = false;
    }
}

Game.prototype.updateFood = function(newFoods) {

    if(this.foods.length == 0){
        //first update
        this.foods = newFoods;
    }
    //multiple changing objects/arrays
    var tempArray = [];
    for(var i = 0; i < this.foods.length; ++i) {
        var curr = this.foods[i];
        curr.updated = false;
        for(var j = 0; j < newFoods.length; ++j) {
            var newF = newFoods[j];
            if(curr.id == newF.id){
                newF.found = true;
                curr.updated = true;
                var dist = getDist(curr.position.x, curr.position.y, newF.position.x, newF.position.y);
                if(dist > 1 || dist < -1){
                    curr.dist = dist;
                    curr.destination = newF.position;
                }
                curr.isOrbiting = newF.isOrbiting;
                curr.size = newF.size;
                curr.value = newF.value;
                tempArray.push(curr);
            }
            //if we've searched all the current food didn't find a new food, add the new food to the list;
            if(i == this.foods.length - 1 && !newF.found) {
                tempArray.push(newF);
            }
        }
    }
    this.foods = tempArray;
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
    this.renderFoods(ctx);
}
Game.prototype.renderHills = function(ctx) {
    for(var i = 0; i < this.hills.length; ++i){
        ctx.fillStyle="#FF0000";
        ctx.beginPath();
        ctx.arc(getXPos(this.hills[i].position.x), getYPos(this.hills[i].position.y), this.hills[i].radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle="#11FF00";
        ctx.fillRect(getXPos(this.hills[i].position.x), getYPos(this.hills[i].position.y),2,2);

        //HILL TEXT - NAME AND POSITION ON MAP RELATIVE TO PLAYER
        ctx.font = "7px Arial";
        ctx.fillText(this.hills[i].playerNick, getXPos(this.hills[i].position.x) - 10, getYPos(this.hills[i].position.y) + 15);
        var xdif = this.hills[i].position.x - this.player.hill.position.x;
        var ydif = this.hills[i].position.y - this.player.hill.position.y;
        ctx.font = "6px Arial";
        ctx.fillText("(x: " + xdif + ", y: " + ydif + ")", getXPos(this.hills[i].position.x) - 20, getYPos(this.hills[i].position.y) + 30);
    }
}

Game.prototype.renderFoods = function(ctx) {
    var food;
    for(var i = 0; i < this.foods.length; ++i){
        if(this.foods[i] == undefined) { continue; }
        if(this.foods[i].dist != undefined && this.foods[i].dist > 1){
            if(this.foods[i].isOrbiting) {
                this.foods[i].color = "white";
            }
            moveLinear(this.foods[i].position, this.foods[i].destination, 1);
        }
        this.renderFood(ctx, this.foods[i]);
    }
}
Game.prototype.renderFood = function(ctx, food) {
    ctx.save();//SAVE BEFORE MOVING THE CONTEXT
    ctx.translate(getXPos(food.position.x - food.size/2),  getYPos(food.position.y - food.size/2));
    ctx.beginPath();
    ctx.strokeStyle = "rgba(10, 10, 10, .2)";
    ctx.rect(food.size/4, food.size/4, food.size/2, food.size/2);
    ctx.stroke();
    ctx.closePath();

    //SET THE MAIN COLOR:
    ctx.fillStyle= convertHex(food.color, 60);
    ctx.beginPath();
    ctx.arc(food.size/2, food.size/2, food.size/4, 0, Math.PI * 2, true);
    ctx.shadowBlur = 10;
    ctx.shadowColor = "black";
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "black";
    ctx.fillRect(food.size/2 - .5, food.size/2-.5, 1, 1);
    renderText(ctx, food.size, food.size/2, food.size/2, 4, "#11FF00");

    ctx.restore();//RESTORE THE CONTEXT
}

function update(data) {
    if(!lastMsg) { return; }
    if(!game) { return; };
    game.update(lastMsg.world, lastMsg.player, lastMsg.hill, null, lastMsg.food);
}

function render(lagOffset) {
    if(!game && game.player == undefined) { return; };
    var ctx = (document.getElementById("canvas")).getContext("2d");
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;


    //ratio for screen.
    ratio = ctx.canvas.width/ctx.canvas.height;
    scaleRatio = ctx.canvas.width/game.player.viewBox.width;
    widthVsSightRatio = canvas.width/game.player.viewBox.width;
    heightVsSightRatio = canvas.height/game.player.viewBox.height;

    ctx.center = center;
    center.x = ctx.canvas.width / (2 * scaleRatio);
    center.y = ctx.canvas.height / (2 * scaleRatio);
    center.dx = game.player.position.x - center.x;
    center.dy = game.player.position.y - center.y;



    //ctx.scale(2,2);
    //ctx.translate(game.player.position.x, game.player.position.y);
    //clear screen
    //console.log(game.player.position.x + " " + game.player.position.y);


    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scaleRatio, scaleRatio);

    //center dot
    ctx.fillStyle="#33FF32";
    ctx.fillRect(center.x, center.y, 2, 2);
    var negXSight = game.player.position.x - game.player.viewBox.width;
    var posXSight = game.player.position.x + game.player.viewBox.width;
    var negYSight = game.player.position.y - game.player.viewBox.height;
    var posYSight = game.player.position.y + game.player.viewBox.height;
    ctx.fillStyle="rgba(255, 0, 0, .5)";
    if(negXSight < game.world.mapBorderLeft - 1) {
        ctx.fillStyle="rgba(255, 0, 0, .5)";
        ctx.fillRect(0, 0, getXPos(0), ctx.canvas.height/scaleRatio);
        ctx.stroke();
    }
    if(posXSight > game.world.mapBorderRight) {
        ctx.fillStyle="rgba(255, 0, 0, .5)";
        ctx.fillRect(getXPos(game.world.mapBorderRight), 0, (ctx.canvas.width/scaleRatio) - getXPos(game.world.mapBorderRight), ctx.canvas.height/scaleRatio);
        ctx.stroke();
    }
    if(negYSight < game.world.mapBorderTop - 1) {
        ctx.fillStyle="rgba(255, 0, 0, .5)";
        ctx.fillRect(0, 0, (ctx.canvas.width/scaleRatio), getYPos(0));
        ctx.stroke();
    }
    if(posYSight > game.world.mapBorderBottom) {
        ctx.fillStyle="rgba(255, 0, 0, .5)";
        ctx.fillRect(0, getYPos(game.world.mapBorderBottom), (ctx.canvas.width/scaleRatio), ctx.canvas.height/scaleRatio - getYPos(game.world.mapBorderBottom));
        ctx.stroke();
    }
    ctx.fillStyle="rgba(255, 255, 255, 1)";

    //render game
    ctx.beginPath();
    ctx.strokeStyle = "rgba(10, 10, 10, .8)";
    ctx.rect(getXPos(game.player.viewBox.leftX), getYPos(game.player.viewBox.topY), game.player.viewBox.width, game.player.viewBox.height);
    ctx.stroke();
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
    performance.value = "ms: " + elapsed + " fps: " + actualFps;
    performance.value += " lag: " + Math.floor(lag);
    performance.value += " offset: " + lagOffset;
}

function getXPos(x) {
    return (x - center.dx);
}

function getYPos(y) {
    return (y - center.dy);
}

function convertHex(hex,opacity){
    hex = hex.replace('#','');
    r = parseInt(hex.substring(0,2), 16);
    g = parseInt(hex.substring(2,4), 16);
    b = parseInt(hex.substring(4,6), 16);

    result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
    return result;
}


function renderText(ctx, text, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.font = size+"px Arial";
    var width = ctx.measureText(text).width;
    ctx.fillText(text, x - width/2, y + size/3);

}
//***** MATH STUFF
function abs(x) { // Because Math.abs is slow
    return x < 0 ? -x : x;
};


function moveLinear(position, destination, speed) {
    var dist = getDist(destination.x, destination.y, position.x, position.y);
    var angle = getAngle(destination.x, destination.y, position.x, position.y);
    var speed = Math.min(dist / 30, speed);
    position.x = position.x + speed * Math.sin(angle)
    position.y = position.y + speed * Math.cos(angle);
}

function getAngle(x1, y1, x2, y2) {
    var deltaY = y1 - y2;
    var deltaX = x1 - x2;
    return Math.atan2(deltaX, deltaY);
};

function getDist(x1, y1, x2, y2) { // Use Pythagoras theorem
    var deltaX = this.abs(x1 - x2);
    var deltaY = this.abs(y1 - y2);
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};

function rotatePoint(point, center, angle){
      angle = (angle ) * (Math.PI/180); // Convert to radians
      var rotatedX = Math.cos(angle) * (point.x - center.x) - Math.sin(angle) * (point.y-center.y) + center.x;
      var rotatedY = Math.sin(angle) * (point.x - center.x) + Math.cos(angle) * (point.y - center.y) + center.y;

      return {x: rotatedX, y: rotatedY};
  }
