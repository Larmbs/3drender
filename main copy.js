//Declare Vars//
//Declare Vars//
//Declare Vars//
//Declare Vars//
//Declare Vars//

//Canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.width = window_width;
canvas.height = window_height;
canvas.style.background = '#aee5e6';

//Mouse cursor
//document.body.style.cursor = "none";
var rect = canvas.getBoundingClientRect();
canvas.addEventListener("mousemove", handleMouseMove);
var mouse_x;
var mouse_y;

//Click detector
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mouseup", handleMouseUp);






const image = new Image();
image.src = 'https://i.ibb.co/S68kpNC/F-86.png';

const cloudPack = new Image();
cloudPack.src = 'https://i.ibb.co/vVMpdqP/8614580.png';

var imageUrls = ['//i.ibb.co/djd4QJt/px-Art-1-copy-2.png',
'https://i.ibb.co/3RcZRk1/px-Art-1-copy.png', 
'https://i.ibb.co/JxtwGgb/px-Art-1.png',
'https://i.ibb.co/SRV0M3d/px-Art-2.png',
'https://i.ibb.co/qJhk5Vf/px-Art-3.png',
'https://i.ibb.co/PtgH00W/px-Art-4.png',
'https://i.ibb.co/zRb8czd/px-Art-5.png',
'https://i.ibb.co/zRb8czd/px-Art-5.png']


//Key press vars
var trottledown = false, trottleup = false, trottleInterval;

var zoomout = false, zoomin = false, zoomLevel = 0.09, zoomInterval, zoomScale = 0.01;

var screenScroll = [0, 0];

var particles = [];

var firing = false, shotCountMax = 50, shotCount = 0, coolDown = 200, ready = 200;

var bullets = [];

let f86;


//Classes//
//Classes//
//Classes//
//Classes//
//Classes//

//Plane Sprite Class 
class Player {
  //Declare this.vars
  constructor(name, Vx, Vy, liftForce, turnRate, maxThrust, thrust, thrustRate, angle, dragForce, img, flipped, x ,y) {
    this.name = name;
    this.Vx = Vx;
    this.Vy = Vy;
    this.liftForce = liftForce;
    this.turnRate = turnRate;
    this.maxThrust = maxThrust;
    this.thrust = thrust;
    this.thrustRate = thrustRate;
    this.angle = angle;
    this.dragForce = dragForce;
    this.img = img;
    this.Wx = window.innerWidth / 2;
    this.Wy = window.innerHeight / 2;
    this.gravity = 30;
    this.flipped = flipped;
    this.x = x;
    this.y = y;
    this.v = 0;
    this.airSpeedAngle = 0;
  }
  //Run calc on forces
  updateForces() {
    var v = Math.sqrt((this.Vx ** 2) + (this.Vy ** 2));
    var attack = this.angle - this.airSpeedAngle;
    this.airSpeedAngle = this.angle;
    var bodyDragCoefficient = 0.05;
    var D = (this.dragForce * Math.sin(attack) + bodyDragCoefficient) * Math.pow(v, 2) / 10;
    var tX = this.thrust * Math.cos(this.angle) * 0.5;
    var tY = this.thrust * Math.sin(this.angle) * 0.5;
    //lX = 0 * v * this.liftForce * Math.cos(this.angle - Math.PI / 2) * Math.abs(Math.cos(this.angle - Math.PI / 2)) / 100;
    var lY = Math.abs(v * this.liftForce * Math.pow(Math.sin(this.angle + Math.PI / 2), 2)) / 200;
    this.Vx = Math.floor((Math.cos(this.angle) * (v - D) + tX + 0) * 10000) / 10000;
    this.Vy = Math.floor((Math.sin(this.angle) * (v - D) + tY + lY - this.gravity) * 100) / 100;
    this.x += this.Vx;
    this.y += this.Vy;
    this.v = v;

    if (this.y <= 25 && this.Vy < 0) {
      this.y = 25;
      this.Vy = 0;
      this.Vx /= 2
    };
    //particles

    //Smoke trail
    particles.push(new Trail(this.x + Math.cos(this.angle) * -100 - Math.sin(this.angle) * -10, this.y + Math.sin(this.angle) * -100 - Math.cos(this.angle) * 10, 'rgba(255, 255, 255, 0.5', Math.floor(Math.abs(this.v / 10)) , 30, 0, 0, Math.atan2(this.Vy, this.Vx) + Math.PI));
    
    //particles.push(new Trail(this.x + Math.cos(-this.angle) * -90 - Math.sin(-this.angle) * -10, this.y + Math.sin(-this.angle) * -90 - Math.cos(-this.angle) * 10, 'rgba(252, 98, 3, 0.7', Math.floor(Math.abs(this.v / 32)) , 30, 0, 0, -this.angle + Math.PI));

    if (firing && shotCount <= shotCountMax && coolDown == ready) {
    bullets.push(new Bullet(this.angle, 5, this.x , this.y, this.Vx + Math.cos(this.angle) * 160  + Math.floor(Math.random() * 4) - 2, this.Vy + Math.sin(this.angle) * 160  + Math.floor(Math.random() * 4) - 2, "#511a19"));
    shotCount += 1;
    if (shotCount > shotCountMax) {
      coolDown = 0
      shotCount = 0;
      
    }
    } else if (coolDown < ready) {
      coolDown += 1
     } 
  }
  
  //Update pos of plane and draw
  update() {
  ctx.save();
  ctx.translate(this.Wx, this.Wy);
  ctx.rotate(-this.angle);
  ctx.scale(-1 * zoomLevel,1 * zoomLevel);
  ctx.drawImage(image, -this.img.width / 2, -this.img.height / 2, this.img.width, this.img.height);
  ctx.restore();

  
    
}
};

// Ground object class
class Ground {
  //Declare this.vars
  constructor(x, y, color, width, height, parallaxFactor, collider) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.width = width;
    this. height = height;
    this.m = parallaxFactor;
    this.collider = collider;
  }
  render() {
    ctx.fillStyle = this.color;
    // Draw the filled rectangle
    ctx.save();
    ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
    ctx.scale(zoomLevel,zoomLevel);
    ctx.fillRect(this.x  - screenScroll[0] * this.m, this.y + screenScroll[1], this.width, this.height);
    ctx.restore();
  }
}

//Bullets class
class Bullet {
  constructor(direction, size, x, y, vx, vy, color) {
    this.direction = direction;
    this.size = size;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.time = 0;
    this.color = color;
  }
  update() {
    this.vx = this.vx;
    this.vy = this.vy - (1 * 1);
    this.x += this.vx;
    this.y += this.vy;
    this.time += 1;
    
    if (this.y >= 0) {
      ctx.save();
      ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
      ctx.scale(zoomLevel,zoomLevel);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x - screenScroll[0], -this.y + screenScroll[1], this.size, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    } else {
      delete this;
      bullets.shift();
      
    }
    particles.push(new Trail(this.x, this.y, 'rgba(243, 247, 7, 0.5', 1 , 10, 0, 0, Math.atan2(this.vy  , this.vx) + Math.PI));

  }
}

//Trail
class Trail {
  constructor(x, y, color, time, size, vx, vy, angle) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.time = time;
    this.size = size;
    this.rate = size / time;
    this.vx = vx;
    this.vy = vy;
    this.angle = angle;
  }

  updateBasic() {
    
    if (this.size >= this.rate) {
      this.time -= 1;
      this.size -= this.rate
      
      ctx.save();
      ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
      ctx.scale(zoomLevel,zoomLevel);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x - screenScroll[0], -this.y + screenScroll[1], this.size, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    }
    if (this.time = 0) {
      delete this;
      particles.shift();
    }
    }
  
    updateTri() {

      if (this.size >= this.rate) {
        
        let VX1 = 1 * Math.cos(-this.angle) * this.size * 6;
        let VY1 = 1 * Math.sin(-this.angle) * this.size * 6;

        let VX2 = -1 * Math.sin(this.angle) * this.size * 0.5;
        let VY2 = -1 * Math.cos(this.angle) * this.size * 0.5;

        let VX3 = Math.sin(this.angle) * this.size * 0.5;
        let VY3 = Math.cos(this.angle) * this.size * 0.5;

        this.time -= 1;
        this.size -= this.rate

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
        ctx.scale(zoomLevel,zoomLevel);
        ctx.beginPath();
        ctx.moveTo(this.x + VX1 - screenScroll[0], -this.y + VY1 + screenScroll[1]);
        ctx.lineTo(this.x + VX2 - screenScroll[0], -this.y + VY2 + screenScroll[1]);
        ctx.lineTo(this.x + VX3 - screenScroll[0], -this.y + VY3 + screenScroll[1]);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
        
      if (this.time = 0) {
        delete this;
        particles.shift();
      }
    }
}

//Functions//
//Functions//
//Functions//
//Functions//
//Functions//

// Key Down Listner
document.addEventListener("keydown", function (event) {
  if (event.repeat) return;
 
  if (event.key === "s" && f86.thrust > 0) {
    trottledown = true;
    trottleInterval = setInterval(trottleDown, 16);
  } else if (event.key === "w" && f86.thrust < 100) {
    trottleup = true;
    trottleInterval = setInterval(trottleUp, 16);
  } else if (event.key === "z") {
    zoomout = true;
    zoomInterval = setInterval(zoomOut, 16);
  } else if (event.key === "x") {
    zoomin = true;
    zoomInterval = setInterval(zoomIn, 16);
  } else if (event.key === " ") {
    firing = true;
  }
});

// Key Up Listener
document.addEventListener("keyup", function (event) {
  
   if (event.key === "w") {
    trottleup = false;
  } else if (event.key === "s") {
    trottledown = false;
  } else if (event.key === "z") {
    zoomout = false;
  } else if (event.key === "x") {
    zoomin = false;
  } else if (event.key === " ") {
    firing = false;
  };


  if (!trottleup && !trottledown) {
    clearInterval(trottleInterval);
  }
  if (!zoomout && !zoomin) {
    clearInterval(zoomInterval);
  }});


  //functions for key presses 
  
  function trottleUp() {
    if (f86.thrust < 100) {f86.thrust += 1;}}
  function trottleDown() {
    if (f86.thrust > 0) {f86.thrust -= 1;}}

  function zoomIn() {zoomLevel += zoomScale;}
  function zoomOut() {
    zoomLevel -= zoomScale;
    if (zoomLevel < zoomScale) {zoomLevel = zoomScale;}}


  function handleMouseMove(event) {
    mouse_x = event.clientX - rect.left;
    mouse_y = event.clientY - rect.top;
    //f86.angle = Math.atan2(-mouse_y + window.innerHeight / 2, mouse_x - window.innerWidth / 2)
    }

  function handleMouseDown() {firing = true;}
  function handleMouseUp() {firing = false;}


  function findAngle() {

    var nAngle = Math.atan2(-mouse_y + window.innerHeight / 2, mouse_x - window.innerWidth / 2)
    if (nAngle === NaN) {nAngle == 0};
    var dif = nAngle - f86.angle
  
    var result;
    if (dif != 0) {
      var min = Math.min(Math.abs(dif), Math.abs(dif + (Math.PI * 2)), Math.abs(dif - (Math.PI * 2)));

      if (Math.abs(dif) === min) {
        result = dif;
      } else if (Math.abs(dif - Math.PI * 2) === min) {
        result = dif - Math.PI * 2;
      } else {
        result = dif + Math.PI * 2;
      }   
  
          if (Math.abs(result) > f86.turnRate) {
  
            if (result < 0) {f86.angle -= f86.turnRate;}
  
            else {f86.angle += f86.turnRate;}} 
  
          else{f86.angle === nAngle;}
  
    }
    

  }

  /*function drawCursor(){
    ctx.save()
    ctx.scale(0.5, 0.5)
    ctx.fillStyle = "rgba(60, 255, 0, 1)";
    ctx.strokeStyle = "rgba(60, 255, 0, 1)";
    ctx.lineWidth = 10;
    
    ctx.beginPath();
    ctx.arc(mouse_x , mouse_y + window_height / 2, 160, 0, Math.PI * 2 );
    ctx.stroke();

  
    // Transform "Rectangle"
   
    // Draw "Rectangle"
    ctx.beginPath();
    ctx.rect(-48, 0, 352, 32);
    ctx.fill();
    

   
    
    // Draw "Rectangle 1"
    ctx.beginPath();
    ctx.rect(0, -80, 32, 352);
    ctx.fill();
    
    ctx.restore()
  }*/
  
//MainLoop//
//MainLoop//
//MainLoop//
//MainLoop//
//MainLoop//
//MainLoop//

ground = new Ground(-500000, 0, "#315e33", 1000000, 50000, 0, true);
tower1 = new Ground(-5000, -5000, "rgba(113, 122, 163, 1)", 1000, 5000, 1, false);
tower2 = new Ground(-2000, -6000, "rgba(66, 70, 94, 1)", 1000, 6000, 1, false);
tower3 = new Ground(1000, -3000, "rgba(87, 130, 116, 1)", 1000, 3000, 1, false);
tower4 = new Ground(5000, -2000, "rgba(102, 112, 109, 1)", 1000, 2000, 1, false);
tower5 = new Ground(8000, -5000, "rgba(113, 122, 163, 1)", 1000, 5000, 1, false);
tower6 = new Ground(11000, -6000, "rgba(66, 70, 94, 1)", 1000, 6000, 1, false);
tower7 = new Ground(14000, -3000, "rgba(87, 130, 116, 1)", 1000, 3000, 1, false);
tower8 = new Ground(17000, -2000, "rgba(102, 112, 109, 1)", 1000, 2000, 1, false);
tower9 = new Ground(20000, -5000, "rgba(113, 122, 163, 1)", 1000, 5000, 1, false);
tower10 = new Ground(23000, -6000, "rgba(66, 70, 94, 1)", 1000, 6000, 1, false);
tower11 = new Ground(26000, -3000, "rgba(87, 130, 116, 1)", 1000, 3000, 1, false);
tower12 = new Ground(28500, -2000, "rgba(102, 112, 109, 1)", 1000, 2000, 1, false);

var grounds = [tower12, tower11, tower10, tower9, tower8, tower7, tower6, tower5, tower4, tower3, tower2, tower1, ground];

image.onload = () => {
  // Create an instance of the Plane class with the image object
  //(name, Vx, Vy, liftForce, turnRate, maxThrust, thrust, thrustRate, angle, dragForce, img, flipped, x , y)
  f86 = new Player("f86", 0, 0, 20, Math.PI / 90, 100, 0, 1, 0, 0.003125, image, true, 0 ,10000);

  // Call the update method in each frame to draw the plane on the canvas
  function mainLoop() {


    ctx.clearRect(0, 0, canvas.width, canvas.height);
    f86.updateForces();
    screenScroll = [f86.x, f86.y];

    for (i = 0; i < grounds.length; i++) {
      grounds[i].render();
    }

    for (i = 0; i < bullets.length; i++) {
      bullets[i].update();
    }
    findAngle()
    f86.update();
    for (i = 0; i < particles.length; i++) {
      particles[i].updateTri(0);
    }
   

    //drawCursor()

    
    ctx.font = '20px B612 Mono';
    ctx.fillStyle = 'rgba(46, 46, 46, 0.5)';
    ctx.fillRect(-1, -1, 150, 280)
    ctx.fillStyle = 'rgba(60, 255, 0, 1)';
    ctx.strokeStyle = 'rgba(60, 255, 0, 1)';
    ctx.strokeRect(-1, -1, 150, 280);
    ctx.fillText(`XCor:${Math.floor(f86.x / 10)}`, 5, 25);
    ctx.fillText(`YCor:${Math.floor(f86.y / 10)}`, 5, 55);
    ctx.fillText(`Speed:${Math.floor(f86.v * 2)}`, 5, 85);
    ctx.fillText(`VX:${Math.abs(Math.floor(f86.Vx * 2))}`, 5, 115);
    ctx.fillText(`VY:${Math.abs(Math.floor(f86.Vy * 2))}`, 5, 145);
    ctx.fillText(`Ammo:${coolDown == ready ? 50 - shotCount: "--"}`, 5, 175);
    ctx.fillText(`Power:${f86.thrust}`, 5, 205);
    ctx.fillText(`Ammo:${coolDown < ready ? coolDown: "--"}`, 5, 235);
    
    requestAnimationFrame(mainLoop);
  }

  mainLoop();
  
};