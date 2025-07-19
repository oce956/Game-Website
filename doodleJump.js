//board
let board;
let boardWidth = 360;
let boardHeight = 576;
let context;

//doodler
let doodlerWidth = 46;
let doodlerHeight = 46;
let doodlerX = boardWidth/2 - doodlerWidth/2;
let doodlerY = boardHeight*7/8 - doodlerHeight;
let doodlerRightImg;
let doodlerLeftImg;
let doodler = {
    img: null,
    x: doodlerX,
    y: doodlerY,
    width: doodlerWidth,
    height: doodlerHeight
}

//physics
let velocityX = 0;
let velocityY = 0;
let initialVelocityY = -8;
let gravity = 0.4;

//platforms
let platformsArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;

let score = 0;
let maxScore = 0;
let doodleJumpbestScore;
let gameOver = false;

window.onload = function(){
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    doodleJumpbestScore = localStorage.getItem("doodleJumpbestScore") || 0;
    doodleJumpbestScore = parseInt(doodleJumpbestScore);

    //load image
    doodlerRightImg = new Image();
    doodlerRightImg.src = "doodler-right.png";
    doodler.img = doodlerRightImg;
    doodlerRightImg.onload = function (){
        context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
    }
    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "doodler-left.png";

    platformImg = new Image();
    platformImg.src="platform.png";
    velocityY = initialVelocityY;
    placePlatforms();

    document.getElementById("start-btn").addEventListener("click", startGame);
}

function startGame() {
    // Hide the start button
    document.getElementById("start-btn").style.display = "none";

    gameOver = false;
    doodler = {
        img: doodlerRightImg,
        x: doodlerX,
        y: doodlerY,
        width: doodlerWidth,
        height: doodlerHeight
    };
    velocityX = 0;
    velocityY = initialVelocityY;
    score = 0;
    maxScore = 0;
    placePlatforms();

    document.addEventListener("keydown", moveDoodler);
    requestAnimationFrame(update);
}



function update(){
    requestAnimationFrame(update);
    if(gameOver){
        return;
    }
    context.clearRect(0, 0, boardWidth, boardHeight);

    doodler.x += velocityX;
    if(doodler.x > boardWidth){
        doodler.x = 0;
    }
    else if(doodler.x + doodler.width < 0){
        doodler.x = boardWidth;
    }

    velocityY += gravity;
    doodler.y += velocityY; 
    if(doodler.y > board.height){
        gameOver = true;
    }
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    //platforms
    for(let i = 0; i < platformsArray.length; i++){
        let platform = platformsArray[i];
        if(velocityY < 0 && doodler.y < boardHeight*3/4){
            platform.y -= initialVelocityY // slide platform down
        }
        if(detectCollision(doodler, platform)&&velocityY >= 0){
            velocityY = initialVelocityY; //jump off platform
        }
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    //clear platforms and add new ones
    while (platformsArray.length > 0 && platformsArray[0].y >=boardHeight){
        platformsArray.shift();
        newPlatform();
    }

    //score
    updateScore();
    context.fillStyle = "black";
    context.font = "14px sans-serif";
    context.fillText(score, 5, 20);
    context.fillText("Best score: " + doodleJumpbestScore, 5, 40);

    if(gameOver){
        context.fillText("Game Over: press 'Space' to restart", boardWidth/7, boardHeight*7/8)
        if (score > doodleJumpbestScore) {
            doodleJumpbestScore = score;
            localStorage.setItem("doodleJumpbestScore", doodleJumpbestScore);
        }
        context.fillText("Score: " + String(score), boardWidth/7, boardHeight*7/8 + 20);
        return;
    }
}

function moveDoodler(e){
    if(e.code == "ArrowRight" || e.code =="KeyD"){
        velocityX = 4;
        doodler.img = doodlerRightImg;
    }

    else if(e.code == "ArrowLeft"|| e.code =="KeyA"){
        velocityX = -4;
        doodler.img = doodlerLeftImg;
    }
    else if(e.code == "Space"&& gameOver){
        gameOver = false;
        doodler = {
            img: doodlerRightImg,
            x: doodlerX,
            y: doodlerY,
            width: doodlerWidth,
            height: doodlerHeight
        }
        velocityX = 0;
        velocityY = initialVelocityY;
        score = 0;
        maxScore = 0;
        placePlatforms(); 
    }
}

function placePlatforms(){
    platformsArray = [];

    //starting platform
    let platform = {
        img: platformImg,
        x: boardWidth/2,
        y: boardHeight - 50,
        width: platformWidth,
        height: platformHeight
    }
    platformsArray.push(platform);

    for (let i = 0; i < 6; i++){
        let randomX = Math.floor(Math.random()*boardWidth*3/4);
        let platform = {
            img: platformImg,
            x: randomX,
            y: boardHeight -75*i- 150,
            width: platformWidth,
            height: platformHeight
        }
    platformsArray.push(platform);
    }

}

function newPlatform(){
    let randomX = Math.floor(Math.random()*boardWidth*3/4);
    let platform = {
        img: platformImg,
        x: randomX,
        y: -platformHeight,
        width: platformWidth,
        height: platformHeight
    }
    platformsArray.push(platform);
}

function detectCollision(a, b){
    return a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;
}

function updateScore(){
    let points = Math.floor(30*Math.random());
    if(velocityY < 0){
        maxScore += points;
        if(score < maxScore){
            score = maxScore;
        }
    }
    else if(velocityY >=0){
        maxScore -= points;
    }
}