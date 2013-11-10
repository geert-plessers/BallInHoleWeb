window.onload = init;

var winW, winH;
var ball;
var hole;
var mouseDownInsideball;
var touchDownInsideball;
var movementTimer;
var lastMouse, lastOrientation, lastTouch;
var seconds = 0;
var minutes = 0;
var isRunning = false;
var isCounting = false;
var timer = document.getElementById("timervalue");

// Initialisation on opening of the window
function init() {
	lastOrientation = {};
	window.addEventListener('resize', doLayout, false);
	document.body.addEventListener('mousemove', onMouseMove, false);
	document.body.addEventListener('mousedown', onMouseDown, false);
	document.body.addEventListener('mouseup', onMouseUp, false);
	document.body.addEventListener('touchmove', onTouchMove, false);
	document.body.addEventListener('touchstart', onTouchDown, false);
	document.body.addEventListener('touchend', onTouchUp, false);
	window.addEventListener('deviceorientation', deviceOrientationTest, false);
    lastMouse = {x:0, y:0};
	lastTouch = {x:0, y:0};
	mouseDownInsideball = false;
	touchDownInsideball = false;
	doLayout(document);
}

// Does the gyroscope or accelerometer actually work?
function deviceOrientationTest(event) {
	window.removeEventListener('deviceorientation', deviceOrientationTest);
	if (event.beta != null && event.gamma != null) {
		window.addEventListener('deviceorientation', onDeviceOrientationChange, false);
		movementTimer = setInterval(onRenderUpdate, 10); 
	}
}

function doLayout(event) {
    var windowHeight = window.innerHeight;
    document.body.style.height = windowHeight + "px";
	winW = window.innerWidth;
	winH = window.innerHeight;
	var surface = document.getElementById('surface');
	surface.width = winW;
	surface.height = winH*0.7;
	var radius = window.innerHeight*0.7*0.05;
	ball = {	radius:radius,
				x:Math.round(winW/2),
				y:Math.round(winH/2),
				color:'rgba(255, 0, 0, 255)'};
	hole = {    radius:window.innerHeight*0.7*0.075,
                x:Math.round(winW/2),
                y:Math.round(winH/4),
                color:'rgba(0, 0, 0, 255)'};
	renderBallAndHole();
}
	
function renderBallAndHole() {
	var surface = document.getElementById('surface');
	var context = surface.getContext('2d');
	context.clearRect(0, 0, surface.width, surface.height);

    context.beginPath();
    context.arc(hole.x, hole.y, hole.radius, 0, 2 * Math.PI, false);
    context.fillStyle = hole.color;
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = hole.color;
    context.stroke();

	context.beginPath();
	context.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI, false);
	context.fillStyle = ball.color;
	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = ball.color;
	context.stroke();
}

function onRenderUpdate(event) {
	var xDelta, yDelta;
	switch (window.orientation) {
		case 0: // portrait - normal
			xDelta = lastOrientation.gamma;
			yDelta = lastOrientation.beta;
			break;
		case 180: // portrait - upside down
			xDelta = lastOrientation.gamma * -1;
			yDelta = lastOrientation.beta * -1;
			break;
		case 90: // landscape - bottom right
			xDelta = lastOrientation.beta;
			yDelta = lastOrientation.gamma * -1;
			break;
		case -90: // landscape - bottom left
			xDelta = lastOrientation.beta * -1;
			yDelta = lastOrientation.gamma;
			break;
		default:
			xDelta = lastOrientation.gamma;
			yDelta = lastOrientation.beta;
	}
	moveBall(xDelta, yDelta);
    if(ball.x > hole.x - hole.radius/3 && ball.x < hole.x + hole.radius/3 && ball.y > hole.y - hole.radius/3 && ball.y < hole.y + hole.radius/3){
        var secondstring = seconds;
        var minutestring = minutes;
        if(seconds < 10){
            secondstring = 0 + '' + seconds;
        }
        if(minutes < 10){
            minutestring = 0 + '' + minutestring;
        }
        isRunning = false;
        isCounting = false;
        seconds = 0;
        minutes = 0;
        ball.x = Math.round(winW/2);
        ball.y = Math.round(winH/2);
        var surface = document.getElementById('surface');
        var context = surface.getContext('2d');
        context.clearRect(0, 0, surface.width, surface.height);

        context.font="30px Arial";
        context.fillText("You won! time: " + minutestring + ":" + secondstring,winW/2 - 145,winH/3);

    }
}

function moveBall(xDelta, yDelta) {
    if(isRunning == true){
        if(ball.x < 0 + ball.radius){
            ball.x = 0 + ball.radius;
        }else if(ball.x > window.innerWidth - ball.radius){
            ball.x = window.innerWidth - ball.radius;
        }else{
            ball.x += xDelta;
        }

        if(ball.y < 0 + ball.radius){
            ball.y = 0 + ball.radius;
        }else if(ball.y > window.innerHeight*0.7 - ball.radius){
            ball.y = window.innerHeight*0.7 - ball.radius;
        }else{
            ball.y += yDelta;
        }
        renderBallAndHole();
    }
}

function onMouseMove(event) {
	if(mouseDownInsideball){
		var xDelta, yDelta;
		xDelta = event.clientX - lastMouse.x;
		yDelta = event.clientY - lastMouse.y;
		moveBall(xDelta, yDelta);
		lastMouse.x = event.clientX;
		lastMouse.y = event.clientY;
	}
}

function onMouseDown(event) {
	var x = event.clientX;
	var y = event.clientY;
	if(	x > ball.x - ball.radius &&
		x < ball.x + ball.radius &&
		y > ball.y - ball.radius &&
		y < ball.y + ball.radius){
		mouseDownInsideball = true;
		lastMouse.x = x;
		lastMouse.y = y;
	} else {
		mouseDownInsideball = false;
	}
} 

function onMouseUp(event) {
	mouseDownInsideball = false;
}

function onTouchMove(event) {
	event.preventDefault();	
	if(touchDownInsideball){
		var touches = event.changedTouches;
		var xav = 0;
		var yav = 0;
		for (var i=0; i < touches.length; i++) {
			var x = touches[i].pageX;
			var y =	touches[i].pageY;
			xav += x;
			yav += y;
		}
		xav /= touches.length;
		yav /= touches.length;
		var xDelta, yDelta;

		xDelta = xav - lastTouch.x;
		yDelta = yav - lastTouch.y;
		moveBall(xDelta, yDelta);
		lastTouch.x = xav;
		lastTouch.y = yav;
	}
}

function onTouchDown(event) {
	event.preventDefault();
	touchDownInsideball = false;
	var touches = event.changedTouches;
	for (var i=0; i < touches.length && !touchDownInsideball; i++) {
		var x = touches[i].pageX;
		var y = touches[i].pageY;
		if(	x > ball.x - ball.radius &&
			x < ball.x + ball.radius &&
			y > ball.y - ball.radius &&
			y < ball.y + ball.radius){
			touchDownInsideball = true;		
			lastTouch.x = x;
			lastTouch.y = y;			
		}
	}
} 

function onTouchUp(event) {
	touchDownInsideball = false;
}

function onDeviceOrientationChange(event) {
	lastOrientation.gamma = event.gamma;
	lastOrientation.beta = event.beta;
}

function startTimer(){
    if(isCounting == true){
    if(seconds == 60){
        minutes++;
        seconds = 0;
    }else{
        seconds++;
    }
    var secondstring = seconds;
    var minutestring = minutes;
    if(seconds < 10){
        secondstring = 0 + '' + seconds;
    }
    if(minutes < 10){
        minutestring = 0 + '' + minutestring;
    }
        timer.innerHTML = minutestring + ':' + secondstring;
        setTimeout(startTimer,1000);
    }
}

function startOnClick(){
    isCounting = true;
    isRunning = true;
    startTimer();
}

function pauseOnClick(){
    isCounting = false;
    isRunning = false;
}

function stopOnClick(){
    isRunning = false;
    isCounting = false;
    seconds = 0;
    minutes = 0;
    timer.innerHTML = '00:00';
    ball.x = Math.round(winW/2);
    ball.y = Math.round(winH/2);
}
