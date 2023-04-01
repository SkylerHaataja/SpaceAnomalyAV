
/**
 * 
 * The p5.EasyCam library - Easy 3D CameraControl for p5.js and WEBGL.
 *
 *   Copyright 2018 by Thomas Diewald (https://www.thomasdiewald.com)
 *
 *   Source: https://github.com/diwi/p5.EasyCam
 *
 *   MIT License: https://opensource.org/licenses/MIT
 * 
 * 
 * explanatory notes:
 * 
 * p5.EasyCam is a derivative of the original PeasyCam Library by Jonathan Feinberg 
 * and combines new useful features with the great look and feel of its parent.
 * 
 * 
 */

/*
  Remixed from Martin Andersen's Audio Visualizer https://openprocessing.org/sketch/730611
  
  //////////////////////////
  Song used
  https://soundcloud.com/yungolus/disco-lines-baby-girl-extended-airplane-mix-nightcoresped-up
  All rights go to disco lines 
  Disco Lines - BABY GIRL (Extended Airplane Mix) [Nightcore/Sped up] By yung olus is licensed under a Creative Commons License
*/

var easycam;
var stars = [];
var starCount = 100;
var starRange = 3500;
var starSpeed = 5;
var blue1;
var track = 1;
var song = 1;

function setup() {
    blue1=color('rgba(255,150,150, 20)');
    fill(0);
    
	setupEasyCam();
	background(0);
    magAverage = 1;

	sound = 1; // Used by load to check if sound has been properly loaded or not
    
	//Load the first song
	sound =	loadSound("3.mp3"); // This function just loads in a song by number
	radius = 75; // Radius of the circle made

	number = 41; // Number of points making up the circle
	size = 410 / number // Change the thickness of the blocks based on number so there is always a gap

	baseAngle = HALF_PI;
	angle = baseAngle; // Used to draw the circle of points

	frameRate(60);

	fft = new p5.FFT(); // This allows us to then generate a waveform and spectrum

	amplitude = new p5.Amplitude();
	amplitude.setInput(sound);
	add = TWO_PI / number;
    makeStars();
    
}


function draw() {
    
    
	drawEasyCam();
	normalMaterial();

	if (sound.isLoaded()) {
		if (sound.isPlaying() == false && sound.isPaused() == false) { // Will return true if a sound has just been loaded in
		  sound.setVolume(0.1);
          sound.play();
			fft = new p5.FFT(); // Generate a new Fourier Transform for the new track
			amplitude.setInput(sound);
		}
	} else {
		sound.pause(); // This will trigger while waiting for a new track to load
	}

	magnitude = radius / 20
	angle = baseAngle;

	var spectrum = fft.analyze(); // This is what gives us the shape
	var waveform = fft.waveform(); // I am not using waveform but it's here if you want it
	////////

    for(var i = 0; i < 2; i++){
      push();
      noFill();
      stroke(blue1);
  strokeWeight(0.25);
      if( i == 0){
        translate(500*cos(frameCount/500),500*sin(frameCount/500), 500*sin(frameCount/500));
        sphere(radius*(1+((magAverage-1)/20)));
      }
      else{
        stroke(blue1);
        translate(500*sin(frameCount/1000),500*cos(frameCount/1000), 100*cos(frameCount/1000));
        sphere((radius/2)*(1+((magAverage-1)/20)));
      }
      pop();
    }

    
	for (var i = 0; i < number; i++) {
        
		push();

		spec = spectrum[i * 2]; // Most of the 1024 parts of the spectrum are unused, we only need 1-200ish really (does depend on the song)

		tallness = sq(map(spec, 0, 255, 0, 5)); // Squaring the map() just means there is a bigger difference between the highs and the lows

		level = amplitude.getLevel(); // Get the current volume

		x1 = sin(angle) * radius; // Get the inner coords of the point on the circle using trig
		y1 = cos(angle) * radius;

		modifier = (1 + tallness / 1) * (1 + level / 10); // This basically calculates the length of each line, play around with the values!
        
	    strokeWeight(modifier/30);
        stroke(255,10*modifier,10*modifier);
        //stroke(10*modifier,10*modifier,255);
        noFill();
		translate(x1, y1, 0) // Move the box to its point on the circle and adjust the height so it appears to stay still
		rotateZ(-angle + 1.571+ 3.14159*sin((frameCount+(magAverage))/1000));
		cylinder(size , 75*modifier, 20);
        

		angle += add;
		pop();
		
	}
for (var i = 0; i < number; i++) {
		push();

		spec = spectrum[i * 2]; // Most of the 1024 parts of the spectrum are unused, we only need 1-200ish really (does depend on the song)

		tallness = sq(map(spec, 0, 255, 0, 5)); // Squaring the map() just means there is a bigger difference between the highs and the lows

		level = amplitude.getLevel(); // Get the current volume

		x1 = sin(angle) * radius; // Get the inner coords of the point on the circle using trig
		y1 = cos(angle) * radius;

		modifier = (1 + tallness / 1) * (1 + level / 10); // This basically calculates the length of each line, play around with the values!

        if (i == 0)
          magAverage = 1;
        else if ((i + 1) == number){
          magAverage /= number;
        }
        magAverage = magAverage + modifier;        

	    strokeWeight(modifier/5);
        stroke(255,20*(modifier-1),20 * (modifier-1));
        //stroke(20*(modifier-1),20*(modifier-1),255);
        noFill();
		translate(x1, y1, 1) // Move the box to its point on the circle and adjust the height so it appears to stay still
		rotateZ(-angle + 1.571);
        rotateX(1.571)
		cylinder(size , + 20*(modifier-1), 20)
        

		angle += add;
		pop();
		
	}
	//////	

}


// Custom functions

function keyPressed() {
	if(keyCode == RIGHT_ARROW){next()} // Next track (loops back to start if at end)
	if(keyCode == LEFT_ARROW){prev()} // Previous track (loops back to end if at start)
	if(keyCode == DOWN_ARROW){noLoop(); sound.pause()} // noLoop() is used to make sure the wave freezes
	if(keyCode == UP_ARROW){loop(); if(sound.isPaused() === true) sound.play()}
	if(keyCode == 32){setOrtho *= -1}
}

function next() {
	if (song < 3) {
		song++
	} else {
		song = 1
	}
	load(song)
}

function prev() {
	if (song > 1) {
		song--
	} else {
		song = 3
	}
	load(song)
}

function load(num) {
	if (sound != 1) {
		sound.stop();
	} // Stop current sound from playing, unless its the very first time loading
	sound = loadSound(num + '.mp3')
}





// Easy Cam Code (look at my Easy Cam Template sketch)


function setupEasyCam() {
	pixelDensity(pixelDensity());
	setOrtho = 1;
	createCanvas(windowWidth, windowHeight, WEBGL);
	setAttributes('antialias', true);
	easycam = new Dw.EasyCam(this._renderer, {
		distance: 200,
		rotation : [0.81915, 0.57358, 0, 0]
	});
	easycam.setDistance(400, 2500);
}

function drawEasyCam() {
	if (!easycam) return;
	// projection
	var cam_dist = easycam.getDistance();
	var oscale = cam_dist * 0.001;
	var ox = width / 2 * oscale;
	var oy = height / 2 * oscale;
	if (setOrtho == 1) {
		ortho(-ox, +ox, -oy, +oy, -10000, 10000)
	}
	else{
		perspective()
	}
	easycam.setPanScale(0.004 / sqrt(cam_dist));
	ambientLight(0);
	pointLight(255, 10, 255, 100, 100, 100);
	background(0);
    
    drawStars();
}


function windowResized() {
	if (!easycam) return;
	resizeCanvas(windowWidth, windowHeight);
	easycam.setViewport([0, 0, windowWidth, windowHeight]);
}

function makeStars(){
  for(let i = 0; i < starCount ; i++){
    stars.push({x : random(-starRange, starRange), y: random(-starRange, starRange), z:random(-starRange, starRange)})
  }
}

function drawStars(){
  for(let i = 0; i < starCount; i++){
    push();
    translate(stars[i].x, stars[i].y, stars[i].z);
    stroke(255,100,100);
    //stroke(100,100,255);
    strokeWeight(2);
    rotateX(1.571)
    plane(0.0001,30+magAverage*30)
    if (stars[i].z > starRange){
      resetStar(i);
    }
    stars[i].z += starSpeed;
    
    pop();
  }
}

function resetStar(index){
  stars[index].x = random(-starRange, starRange);
  stars[index].y = random(-starRange, starRange);
  stars[index].z = -starRange;
}