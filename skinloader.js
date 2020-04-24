const ASSETS_URL = "";

const skinMario={
	IDLE: [0xD0,0x00],
	WALK1: [0xC0,0x00],
	WALK2: [0xB0,0x00],
	WALK3: [0xA0,0x00],
	DRIFT: [0x90,0x00],
	JUMP: [0x80,0x00],
	CLIMB1: [0x70,0x00],
	CLIMB2: [0x60,0x00],
	DEAD: [0x00,0x00],

	crop: [0x10,0x10],
	crop1: [0x10,0x10],
	scale: [0x20,0x20],
	scale1: [0x20,0x20]
};

const skinBigMario={
	GROW: [0xE0,0x10],
	IDLE: [0xD0,0x10],
	CROUCH: [0xC0,0x10],
	WALK1: [0xB0,0x10],
	WALK2: [0xA0,0x10],
	WALK3: [0x90,0x10],
	DRIFT: [0x80,0x10],
	JUMP: [0x70,0x10],
	CLIMB1: [0x60,0x10],
	CLIMB2: [0x50,0x10],

	crop: [0x10,0x20],
	crop1: [0x10,0x20],
	scale: [0x20,0x40],
	scale1: [0x20,0x40]
};

const skinFlowerMario={
	FIRE: [0xE0,0x30],
	GROW: [0xD0,0x30],
	IDLE: [0xB0,0x30],
	CROUCH: [0xA0,0x30],
	WALK1: [0x80,0x30],
	WALK2: [0x60,0x30],
	WALK3: [0x40,0x30],
	DRIFT: [0x20,0x30],
	JUMP: [0x00,0x30],
	CLIMB1: [0x40,0x10],
	CLIMB2: [0x30,0x10],

	crop: [0x20,0x20],
	crop1: [0x10,0x20],
	scale: [0x40,0x40],
	scale1: [0x20,0x40]
};

const spastic_text = ["Today we slide.",
					  "Today is vine day.",
					  "Today we blj.",
					  "Oh! Look at the lava!"];

var current_text = spastic_text[Math.floor((Math.random()*100))%spastic_text.length]

document.getElementById("spastic-quote").innerHTML = current_text;

var Game = function(pos, context){
	this.pos = pos;
	this.ctx = context;

	this.px = 32;
	this.py = 360;
	this.pstate = 0; // 0 = small, 1 = big, 2 = flower
	this.pdrc = false; // false = left, true = right
	this.protateoffset = 0;

	this.scale = 32;
	this.image = new Image();
	this.map = [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
				[1,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,0,0,0,1],
				[1,0,0,0,0,0,0,0,0,0,0,0,2,0,2,2,0,2,0,0,0,0,1],
				[1,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,1],
				[1,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1],
				[1,0,0,0,0,0,0,0,0,5,0,0,0,0,2,0,0,0,0,0,0,0,1],
				[1,0,0,0,0,0,0,0,1,1,1,0,0,0,2,0,0,0,0,0,0,0,1],
				[1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
				[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
				[1,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
				[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
				[1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,1],
				[1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
				[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
				[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,1],
				[1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1],
				[1,1,1,1,1,1,1,1,1,1,1,3,3,3,1,1,1,1,1,1,1,1,1]]

	this.keyMap={"65": false, "68": false, "32": false, "16": false, "83": false};
	this.keyPressed = 0;

	this.hspeed = 0;
	this.vspeed = 0;

	this.maxhspeed = 0.8;
	if(current_text == "Today we slide.") {this.acc = 0.0075;} else {this.acc = 0.01;};
	

	this.grav = 0.05;
	if(current_text == "Today we blj.") {this.maxvspeed = 4;} else {this.maxvspeed = 3.5;};
	
	this.jumpTime = 0;

	this.frameloop = 20;
	this.framewalk = 0;
	this.statewalk = 0;

	this.frameclimb = 0;
	this.stateclimb = 0;

	this.attached = false;

	this.up = false;
	this.down = false;

	this.dead = false;
	this.disableInput = false;
};

Game.prototype.setImage = function(source){
	this.image.src = source;
	console.log("2!")
};

Game.prototype.collision = function(x, y, tile){
	try{
		if ((this.map[Math.floor(y/this.scale)][Math.floor(x/this.scale)] === tile) ||
			(this.map[Math.floor(1+y/this.scale)][Math.floor(x/this.scale)] === tile) ||
			(this.map[Math.floor(y/this.scale)][Math.floor(1+x/this.scale)] === tile) ||
			(this.map[Math.floor(1+y/this.scale)][Math.floor(1+x/this.scale)] === tile)){
			return true;
		}
	} catch(err){

	}
}

Game.prototype.DrawMario = function( mario, offset, xpos){
	if (this.down === true && this.pstate > 0 && this.attached === false) {
		this.ctx.drawImage(skin, mario.CROUCH[0], mario.CROUCH[1], mario.crop1[0], mario.crop1[1],
						   xpos+this.protateoffset, this.pos[1]+this.py+offset, mario.scale1[0], mario.scale1[1]);
	} else
	if (this.hspeed != 0 && this.vspeed == 0){
		if (this.statewalk == 0){
			this.ctx.drawImage(skin, mario.WALK1[0], mario.WALK1[1], mario.crop[0], mario.crop[1],
								xpos+this.protateoffset, this.pos[1]+this.py+offset, mario.scale[0], mario.scale[1]);
		} else
		if (this.statewalk == 1) {
			this.ctx.drawImage(skin, mario.WALK2[0], mario.WALK2[1], mario.crop[0], mario.crop[1],
								xpos+this.protateoffset, this.pos[1]+this.py+offset, mario.scale[0], mario.scale[1]);
		} else
		if (this.statewalk == 2){
			this.ctx.drawImage(skin, mario.WALK3[0], mario.WALK3[1], mario.crop[0], mario.crop[1],
								xpos+this.protateoffset, this.pos[1]+this.py+offset, mario.scale[0], mario.scale[1]);
		} 
	} else if (this.attached){
		if (this.stateclimb == 0){
			this.ctx.drawImage(skin, mario.CLIMB1[0], mario.CLIMB1[1], mario.crop1[0], mario.crop1[1],
								xpos+this.protateoffset, this.pos[1]+this.py+offset, mario.scale1[0], mario.scale1[1]);
		} else
		if (this.stateclimb == 1) {
			this.ctx.drawImage(skin, mario.CLIMB2[0], mario.CLIMB2[1], mario.crop1[0], mario.crop1[1],
								xpos+this.protateoffset, this.pos[1]+this.py+offset, mario.scale1[0], mario.scale1[1]);
		}
	}
	
	else if (this.vspeed != 0){
		this.ctx.drawImage(skin, mario.JUMP[0], mario.JUMP[1], mario.crop[0], mario.crop[1],
							xpos+this.protateoffset, this.pos[1]+this.py+offset, mario.scale[0], mario.scale[1]);
	} 

	else {
		this.ctx.drawImage(skin, mario.IDLE[0], mario.IDLE[1], mario.crop[0], mario.crop[1],
		   xpos+this.protateoffset, this.pos[1]+this.py+offset, mario.scale[0], mario.scale[1]);
	};
}

Game.prototype.drawPlayer = function(){
	this.ctx.save();
	if(this.pstate == 0){
		if(this.pdrc){
			this.ctx.translate(0,0)
			this.ctx.scale(1,1);
			this.DrawMario(skinMario,0,this.px+this.pos[0])
		} else {
			this.ctx.translate(Math.floor(this.px+this.pos[0])+this.scale, 0);
			this.ctx.scale(-1,1);
			this.DrawMario(skinMario,0,0)
		}
	} else if(this.pstate == 1){
		if(this.pdrc){
			this.ctx.translate(0,0)
			this.ctx.scale(1,1);
			this.DrawMario(skinBigMario,-this.scale,this.px+this.pos[0])
		} else {
			this.ctx.translate(Math.floor(this.px+this.pos[0])+this.scale, 0);
			this.ctx.scale(-1,1);
			this.DrawMario(skinBigMario,-this.scale,0)
		}
	} else if(this.pstate == 2){
		if(this.pdrc){
			this.ctx.translate(0,0)
			this.ctx.scale(1,1);
			this.DrawMario(skinFlowerMario,-this.scale,this.px+this.pos[0])
		} else {
			this.ctx.translate(Math.floor(this.px+this.pos[0])+this.scale, 0);
			this.ctx.scale(-1,1);
			this.DrawMario(skinFlowerMario,-this.scale,0)
		}
	}
	this.ctx.restore();
};

Game.prototype.registerKeyRelease = function(keyCode){

	this.keyMap[keyCode] = false;
};

Game.prototype.registerKeyPress = function(keyCode){
	this.keyMap[keyCode] = true;
};

Game.prototype.movePlayer = function(){
	if(this.dead) {return;};
	//console.log(Math.floor(-this.ctx.canvas.width+this.px));
	this.keyPressed = (this.keyMap[65] - this.keyMap[68]);

	if(this.keyPressed == 1 && this.down === false){
		this.framewalk += Math.abs(this.hspeed)*1.2;
		
		this.pdrc = true;
		this.hspeed += this.acc;
		if (this.hspeed >= this.maxhspeed) {this.hspeed = this.maxhspeed}
	}	
	else if(this.hspeed > 0){
		this.hspeed -= this.acc;
		if (this.hspeed <= 0) {this.hspeed = 0};
	};
	if(this.keyPressed == -1 && this.down === false){
		this.framewalk += Math.abs(this.hspeed)*1.2;
		
		this.pdrc = false;
		this.hspeed -= this.acc;
		if (this.hspeed <= -this.maxhspeed) {this.hspeed = -this.maxhspeed}
	}
	else if(this.hspeed < 0){
		this.hspeed += this.acc;
		if (this.hspeed >= 0) {this.hspeed = 0};
	};

	if(this.keyMap[16] === true){
		
		this.maxhspeed = 1.3
		if(current_text == "Today we blj.") {this.maxvspeed = 4.4;} else {this.maxvspeed = 3.9;};

	}else if(this.keyMap[16] === false){
		
		this.maxhspeed = 0.8
		if(current_text == "Today we blj.") {this.maxvspeed = 4;} else {this.maxvspeed = 3.5;};

	}

	if(this.vspeed < 10) {this.vspeed -= this.grav};
	if(this.keyMap[32] === true) {
		this.jumpTime += 1;
		if(this.jumpTime < 10) {this.vspeed = this.maxvspeed};
	} else if(this.collision(this.px, this.py+1, 1)) {this.jumpTime = 0}
	else {this.jumpTime = 20};

	if(this.collision(this.px-this.hspeed, this.py, 1)){
		while (!(this.collision(this.px-Math.sign(this.hspeed),this.py, 1))) {this.px -= Math.sign(this.hspeed)};
		this.hspeed = 0;
	}
	this.px -= this.hspeed;

	if(this.collision(this.px, this.py-this.vspeed, 1)){
		while (!(this.collision(this.px,this.py-Math.sign(this.vspeed), 1))) {this.py -= Math.sign(this.vspeed)};
		this.vspeed = 0;
	}

	this.py -= this.vspeed;
}

Game.prototype.vinePlayer = function(){
	if(this.dead) {return;};
	var dirxtemp = (this.keyMap[65] - this.keyMap[68]);
	var dirytemp = (this.keyMap[87] - this.keyMap[83]);

	if (dirxtemp == 1) {this.pdrc = true; this.frameclimb += 0.5;} else if (dirxtemp == -1) {this.pdrc = false; this.frameclimb += 0.5;};

	if (dirytemp != 0) {this.frameclimb += 0.75;};

	if(this.collision(this.px-dirxtemp, this.py, 1)) {this.px += dirxtemp/2;}
	else {this.px -= dirxtemp/2;};

	if(this.collision(this.px, this.py-dirytemp, 1)) {this.py += dirytemp/2;}
	else {this.py -= dirytemp/2;};
	
}

Game.prototype.dieAnimation = function(){
	this.disableInput = true;
	/*
	var now = new Date().getTime();
	for ( var i = 0; i < 1e7; i++ )
	{
		if ( ( new Date().getTime() - now ) > 1000 )
		{
			break;
		}
	}
    */
}

Game.prototype.resetGame = function(){
	this.dead = false;
	this.disableInput = false;

	this.px = 32;
	this.py = 360;
	this.pstate = 0; // 0 = small, 1 = big, 2 = flower
	this.pdrc = false; // false = left, true = right
	this.protateoffset = 0;

	this.hspeed = 0;
	this.vspeed = 0;
}


Game.prototype.runThis = function(){
	// xcrop, ycrop, wcrop, hcrop, x,y, wresize, hresize
	if (this.framewalk > this.frameloop) {this.framewalk=0; this.statewalk+=1;};
	if (this.statewalk >= 3) {this.framewalk=0; this.statewalk=0;};

	if (this.frameclimb > this.frameloop) {this.frameclimb=0; this.stateclimb+=1;};
	if (this.stateclimb >= 2) {this.frameclimb=0; this.stateclimb=0;};

	for(var y = 0; y < this.map.length; y++){
		for(var x = 0; x < this.map[0].length; x++){
			if(this.map[y][x] == 1){  //solid block
				this.ctx.drawImage(this.image, 192, 352, 16, 16, this.pos[0]+x*this.scale, this.pos[1]+y*this.scale, this.scale, this.scale);
			};
			if(this.map[y][x] == 2){  //vine
				this.ctx.drawImage(this.image, 416, 160, 16, 16, this.pos[0]+x*this.scale, this.pos[1]+y*this.scale, this.scale, this.scale);
			};
			if(this.map[y][x] == 3){  //lava
				if(current_text == "Oh! Look at the lava!") {
					this.ctx.drawImage(this.image, 48, 384, 16, 16, this.pos[0]+x*this.scale, (Math.sin(frames/100+(x))*10)+this.pos[1]+y*this.scale, this.scale, this.scale);
				} else {
					this.ctx.drawImage(this.image, 48, 384, 16, 16, this.pos[0]+x*this.scale, this.pos[1]+y*this.scale, this.scale, this.scale);
				};
				
			};
			if(this.map[y][x] == 5){  //poison mushroom totem
				this.ctx.drawImage(this.image, 240, 672, 16, 16, this.pos[0]+x*this.scale, this.pos[1] - 8 + y*this.scale, this.scale, this.scale);
				this.ctx.drawImage(this.image, 272, 688, 16, 16, this.pos[0]+x*this.scale, this.pos[1] + 22 + y*this.scale, this.scale, this.scale);
			};
			if(this.map[y][x] == 6){  //mushroom totem
				this.ctx.drawImage(this.image, 256, 672, 16, 16, this.pos[0]+x*this.scale, this.pos[1] - 8 + y*this.scale, this.scale, this.scale);
				this.ctx.drawImage(this.image, 272, 688, 16, 16, this.pos[0]+x*this.scale, this.pos[1] + 22 + y*this.scale, this.scale, this.scale);
			};
			if(this.map[y][x] == 7){  //flower totem
				this.ctx.drawImage(this.image, 272, 672, 16, 16, this.pos[0]+x*this.scale, this.pos[1] - 8 + y*this.scale, this.scale, this.scale);
				this.ctx.drawImage(this.image, 272, 688, 16, 16, this.pos[0]+x*this.scale, this.pos[1] + 22 + y*this.scale, this.scale, this.scale);
			};
		}
	}

	if(this.collision(this.px, this.py, 3)){
		this.dead = true;
		this.pstate = 0;
		this.dieAnimation();
		this.resetGame();
	}

	if(this.collision(this.px, this.py, 5)){
		this.protateoffset = 0;
		this.pstate = 0;
	}

	if(this.collision(this.px, this.py, 6)){
		this.protateoffset = 0;
		this.pstate = 1;
	}

	if(this.collision(this.px, this.py, 7)){
		this.pstate = 2;
	}

	if(this.keyMap[83] === true){
		this.down = true;
		if(this.pstate == 2 && this.attached === false) {this.protateoffset = 0;}
		
		//if(this.pstate == 2 && this.vspeed != 0) {this.protateoffset = 0;};
		
	} else if(this.keyMap[83] === false){
		this.down = false;
		if(this.pstate == 2){this.protateoffset = -this.scale;};

	}

	if(this.keyMap[87] === true){
		this.up = true;
	} else if(this.keyMap[87] === false){
		this.up = false;
	}

	if(this.up === true && this.collision(this.px, this.py, 2)) {this.attached = true;}
	else if (!(this.collision(this.px, this.py, 2))) {this.attached = false;};
	if(this.disableInput) {} else
	if(this.attached) {this.vinePlayer(); this.hspeed = 0; this.vspeed = 0;} else {this.movePlayer();};

	if(this.pstate == 2 && this.attached) {this.protateoffset = 0;}

	this.drawPlayer();
	
};

const scale = 64;

const walkspeed = 20;
var walkframes = 0;
var walkposes = 3;

const climbspeed = 40;
var climbframes = 0;
var climbposes = false;

const driftspeed = 10;
var driftframes = 0;

var frames = 0;

var skinCanvas = document.getElementById("show-skin-canvas");

var skin = new Image();

c = skinCanvas.getContext("2d");
c.imageSmoothingEnabled=false;

var game = new Game([512,0], c);
game.setImage(ASSETS_URL + "map.png");

function resize(event){
	skinCanvas.width = window.innerWidth-6;
	skinCanvas.height = window.innerHeight-36;
	refreshCanvas();
};

function callerDown(event){
	game.registerKeyPress(event.keyCode);
};

function callerUp(event){
	game.registerKeyRelease(event.keyCode);
};

function refreshCanvas(){
	c.clearRect(0, 0, c.canvas.width, c.canvas.height);
	c.fillStyle = "#A0A0A0";
	c.fillRect(0,0,skinCanvas.width,skinCanvas.height);
	if (skin.src == "") {return;};

	// xcrop, ycrop, wcrop, hcrop, x,y, wresize, hresize
	c.imageSmoothingEnabled=false;
	// little mario walking
	c.strokeRect(0x00,0x00,0x80,0x100)
	c.strokeRect(0x00,0x100,0x80,0x100)

	c.strokeRect(0x80,0x00,0x80,0x100)
	c.strokeRect(0x80,0x100,0x80,0x100)

	c.strokeRect(0x100,0x00,0x80,0x100)
	c.strokeRect(0x100,0x100,0x80,0x100)

	if (walkposes == 3){
		c.drawImage(skin, skinMario.WALK1[0],skinMario.WALK1[1],skinMario.crop[0],skinMario.crop[1],0,0,scale,scale)
		c.drawImage(skin, skinBigMario.WALK1[0],skinBigMario.WALK1[1],skinBigMario.crop[0],skinBigMario.crop[1],0x40,0,scale,scale*2)
		c.drawImage(skin, skinFlowerMario.WALK1[0],skinFlowerMario.WALK1[1],skinFlowerMario.crop[0],skinFlowerMario.crop[1],0,0x80,scale*2,scale*2)
	} else if (walkposes == 2) {
		c.drawImage(skin, skinMario.WALK2[0],skinMario.WALK2[1],skinMario.crop[0],skinMario.crop[1],0,0,scale,scale)
		c.drawImage(skin, skinBigMario.WALK2[0],skinBigMario.WALK2[1],skinBigMario.crop[0],skinBigMario.crop[1],0x40,0,scale,scale*2)
		c.drawImage(skin, skinFlowerMario.WALK2[0],skinFlowerMario.WALK2[1],skinFlowerMario.crop[0],skinFlowerMario.crop[1],0,0x80,scale*2,scale*2)
	} else if (walkposes == 1) {
		c.drawImage(skin, skinMario.WALK3[0],skinMario.WALK3[1],skinMario.crop[0],skinMario.crop[1],0,0,scale,scale)
		c.drawImage(skin, skinBigMario.WALK3[0],skinBigMario.WALK3[1],skinBigMario.crop[0],skinBigMario.crop[1],0x40,0,scale,scale*2)
		c.drawImage(skin, skinFlowerMario.WALK3[0],skinFlowerMario.WALK3[1],skinFlowerMario.crop[0],skinFlowerMario.crop[1],0,0x80,scale*2,scale*2)
	}

	c.drawImage(skin, skinMario.IDLE[0],skinMario.IDLE[1],skinMario.crop[0],skinMario.crop[1],0,0x100,scale,scale)
	c.drawImage(skin, skinBigMario.IDLE[0],skinBigMario.IDLE[1],skinBigMario.crop[0],skinBigMario.crop[1],0x40,0x100,scale,scale*2)
	c.drawImage(skin, skinFlowerMario.IDLE[0],skinFlowerMario.IDLE[1],skinFlowerMario.crop[0],skinFlowerMario.crop[1],0,0x180,scale*2,scale*2)

	c.save();
	if (driftframes % 4){
		c.translate(0, 0);
		c.scale(1,1);
		c.drawImage(skin, skinMario.DRIFT[0],skinMario.DRIFT[1],skinMario.crop[0],skinMario.crop[1],0x80,0x00,scale,scale);
		
	} else {
		c.translate(1920-0x640, 0);
		c.scale(-1,1)
		c.drawImage(skin, skinMario.DRIFT[0],skinMario.DRIFT[1],skinMario.crop[0],skinMario.crop[1],0x80,0x00,scale,scale);
	};
	c.restore();

	c.drawImage(skin, skinBigMario.DRIFT[0],skinBigMario.DRIFT[1],skinBigMario.crop[0],skinBigMario.crop[1],0xC0,0x00,scale,scale*2);
	c.drawImage(skin, skinFlowerMario.DRIFT[0],skinFlowerMario.DRIFT[1],skinFlowerMario.crop[0],skinFlowerMario.crop[1],0x80,0x80,scale*2,scale*2);

	c.drawImage(skin, skinMario.JUMP[0], skinMario.JUMP[1], skinMario.crop[0], skinMario.crop[1], 0x100, 0x100, scale, scale)
	c.drawImage(skin, skinBigMario.JUMP[0], skinBigMario.JUMP[1], skinBigMario.crop[0], skinBigMario.crop[1], 0x140, 0x100, scale, scale*2)
	c.drawImage(skin, skinFlowerMario.JUMP[0], skinFlowerMario.JUMP[1], skinFlowerMario.crop[0], skinFlowerMario.crop[1], 0x100, 0x180, scale*2, scale*2)

	c.drawImage(skin, skinMario.DEAD[0], skinMario.DEAD[1], skinMario.crop[0], skinMario.crop[1], 0x80, 0x100, scale, scale)
	c.drawImage(skin, skinBigMario.GROW[0], skinBigMario.GROW[1], skinBigMario.crop[0], skinBigMario.crop[1], 0xC0, 0x100, scale, scale*2)
	c.drawImage(skin, skinFlowerMario.GROW[0], skinFlowerMario.GROW[1], skinFlowerMario.crop1[0], skinFlowerMario.crop1[1], 0xC0, 0x180, scale, scale*2)


	if(climbposes){
		c.drawImage(skin, skinMario.CLIMB1[0], skinMario.CLIMB1[1], skinMario.crop[0], skinMario.crop[1], 0x100, 0x00, scale, scale)
		c.drawImage(skin, skinBigMario.CLIMB1[0], skinBigMario.CLIMB1[1], skinBigMario.crop[0], skinBigMario.crop[1], 0x140, 0x00, scale, scale*2)
		c.drawImage(skin, skinFlowerMario.CLIMB1[0], skinFlowerMario.CLIMB1[1], skinFlowerMario.crop1[0], skinFlowerMario.crop1[1], 0x140, 0x80, scale, scale*2)
	} else {
		c.drawImage(skin, skinMario.CLIMB2[0], skinMario.CLIMB2[1], skinMario.crop[0], skinMario.crop[1], 0x100, 0x00, scale, scale)
		c.drawImage(skin, skinBigMario.CLIMB2[0], skinBigMario.CLIMB2[1], skinBigMario.crop[0], skinBigMario.crop[1], 0x140, 0x00, scale, scale*2)
		c.drawImage(skin, skinFlowerMario.CLIMB2[0], skinFlowerMario.CLIMB2[1], skinFlowerMario.crop1[0], skinFlowerMario.crop1[1], 0x140, 0x80, scale, scale*2)
	}

	c.fillStyle = "#000000";

	c.fillText("If you see this, 1920x1080 gang 8)", 1920-200,1080-200);

	game.runThis();
};



function countAnim(){
	frames += 1;
	walkframes += 1;
	if (walkframes > walkspeed) {walkframes=0; walkposes-=1;};
	if (walkposes <= 0) {walkframes=0; walkposes=3;};
	driftframes += 1;
	if (driftframes > 32) {driftframes = 0;};
	climbframes += 1;
	if (climbframes > climbspeed) {climbframes = 0; climbposes = !climbposes;};
	refreshCanvas();
}

resize(null);

window.addEventListener('resize', resize);

window.addEventListener('keydown', callerDown);
window.addEventListener('keyup', callerUp);

document.getElementById("openInput").onchange = e => { 

   // getting a hold of the file reference
   var file = e.target.files[0]; 

   // setting up the reader
   var reader = new FileReader();
   reader.readAsDataURL(file);

   // here we tell the reader what to do when it's done reading...
   reader.onload = readerEvent => {
      skin.src = readerEvent.target.result; // this is the content!
      skinCanvas.focus();
   }
}

setInterval(countAnim, 2);
