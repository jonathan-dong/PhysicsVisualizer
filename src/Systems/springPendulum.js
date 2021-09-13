const mass = require("./Helpers/mass");
const spring = require("./Helpers/spring");
const getDistance = require("./Helpers/getDistance");

function springPendulum() {
  //Objects
  this.mass = new mass(
    X0,
    Math.floor($(document).height() - navbarHeight) - 100,
    25,
    10
  );

  this.spring = new spring(
    X0,
    Math.floor($(canvas).height() / 50) * 25,
    this.mass.x,
    this.mass.y
  );

  //state
  this.isRunning = false;
  this.selected = true;
  this.traceOn = false;
  this.mouseDown = false;
  this.lockSpring = null;
  this.speed = "fast";
  this.currColor = 0;

  //animation
  this.requireRAF = true;
  this.anim = null;

  //INITIAL CONDITIONS
  this.mass0 = {
    x: this.mass.x,
    y: this.mass.y,
  };

  //Calculation vars
  this.theta = 0;
  this.x =
    getDistance(
      this.spring.x0,
      this.spring.y0,
      this.spring.x1,
      this.spring.y1
    ) - this.spring.l0;
  this.dtheta = 0;
  this.dx = 0;

  this.hasMoved = true;
  this.traceColors = ["#FF7F00", "#FFEF00", "#00F11D", "#0079FF", "violet"];
}

//Starts the simulation and prepares event handlers buttons and interface
springPendulum.prototype.defaultInit = function () {
  this.draw();

  document.getElementById("startButtonStart").onclick = () => {
    if (this.isRunning) {
      document.getElementById("startButtonStart").innerHTML =
        '<button type="button" class="btn btn-outline-success" style="width: 100%">Simulate Spring Pendulum!</button>';
      document.getElementById("springPlRange").disabled = false;
      document.getElementById("springPkRange").disabled = false;
      this.hasMoved = false;
    } else {
      document.getElementById("startButtonStart").innerHTML =
        '<button type="button" class="btn btn-outline-danger" style="width: 100%">Pause Simulation!</button>';
      document.getElementById("springPlRange").disabled = true;
      document.getElementById("springPkRange").disabled = true;
    }
    this.isRunning = !this.isRunning;
  };

  document.onmousedown = (e) => {
    //console.log("mousedown");
    if (!this.isRunning) {
      this.handleMouseDown(e.clientX, e.clientY);
    }
  };

  document.onmousemove = (e) => {
    if (!this.isRunning) {
      this.handleMouseMove(e.clientX, e.clientY);
    }
  };

  document.onmouseup = () => {
    //console.log("mouseup");
    if (!this.isRunning) {
      this.handleMouseUp();
    }
  };

  //TODO: RESET VALUES WHEN K OR L0 ARE CHANGED

  this.anim = window.requestAnimationFrame(() => {
    this.simulate();
  });
};

//Ends the simulation and resets it to its initial conditions
springPendulum.prototype.reset = function () {
  if (this.anim) cancelAnimationFrame(this.anim);
  context.clearRect(0, 0, canvas.width, canvas.height);
  this.isRunning = false;
  document.getElementById("startButtonStart").innerHTML =
    '<button type="button" class="btn btn-outline-success" style="width: 100%">Simulate Spring Pendulum!</button>';
  document.getElementById("springPlRange").disabled = false;
  document.getElementById("springPkRange").disabled = false;

  //RESTORE MASS POSITION
  this.mass.x = this.mass0.x;
  this.mass.y = this.mass0.y;

  //RESTORE SPRING POSITION
  this.spring.x1 = this.mass.x;
  this.spring.y1 = this.mass.y;

  this.anim = null;

  this.hasMoved = false;

  this.dx = 0;
  this.dtheta = 0;

  this.defaultInit();
};

//Ends the simulation preparing for the selection of a new simulation. Clears the display and stops the calling of RAF
springPendulum.prototype.end = function () {
  this.selected = false;
  if (this.anim) cancelAnimationFrame(this.anim);
  context.clearRect(0, 0, canvas.width, canvas.height);
  contextT.clearRect(0, 0, canvas.width, canvas.height);
  //console.log("Spring Pendulum Simulation Terminated");
};

//Draws both the mass and the spring
springPendulum.prototype.draw = function () {
  this.mass.drawMass(context);
  this.spring.drawSpring(context);

  context.beginPath();
  context.arc(
    this.spring.x0 + this.spring.l0 * Math.sin(this.theta),
    this.spring.y0 + this.spring.l0 * Math.cos(this.theta),
    5,
    0,
    2 * Math.PI,
    false
  );
  context.fillStyle = "red";
  context.fill();
  context.lineWidth = 5;
  context.strokeStyle = "red";
  context.stroke();
};

//Called every animation frame to calculate the next rendered position of the mass and spring and draw them
springPendulum.prototype.simulate = function () {
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (!this.selected) window.cancelAnimationFrame(this.anim);
  //UPDATE VALUES BASED ON INITIAL CONDITIONS
  this.requireRAF = false;

  if (this.isRunning) {
    //SIMULATE
    for (let i = 0; i < 5; i++) this.calculate();
    if (this.speed === "fast") {
      for (let i = 0; i < 5; i++) this.calculate();
      for (let i = 0; i < 5; i++) this.calculate();
    } else if (this.speed === "average") {
      for (let i = 0; i < 5; i++) this.calculate();
    }
  } else {
    //RUNNING MORE SOMEHOW IMPROVES EDGE DETECTION PERFORMANCE?
    this.lockRods = document.getElementById("LockRodsCheck").checked;
    this.fixMassPos();
    this.fixMassPos();
    this.fixMassPos();
    this.fixMassPos();
    //
    this.spring.k = Number.parseFloat(
      document.getElementById("springPkRange").value
    );
    this.spring.l0 = Number.parseFloat(
      document.getElementById("springPlRange").value
    );
  }

  //TODO: update display data and update spring position based on calculated mass position
  this.spring.x1 = this.mass.x;
  this.spring.y1 = this.mass.y;
  this.updateData();
  this.draw();

  if (this.mass.isDragging) {
    this.mass0.x = this.mass.x;
    this.mass0.y = this.mass.y;
  }

  this.requireRAF = true;
  this.anim = window.requestAnimationFrame(() => {
    this.simulate();
  });
};

springPendulum.prototype.calculate = function () {
  let d2x =
    (this.spring.l0 + this.x) * Math.pow(this.dtheta, 2) -
    (this.spring.k * this.x) / this.mass.m +
    g * Math.cos(this.theta);
  let d2theta =
    (-g * Math.sin(this.theta)) / (this.spring.l0 + this.x) -
    (2 * this.dx * this.dtheta) / (this.spring.l0 + this.x);

  this.dtheta += d2theta * t;
  this.dx += d2x * t;

  this.theta += this.dtheta * t;
  this.x += this.dx * t;

  this.mass.x =
    this.spring.x0 + (this.spring.l0 + this.x) * Math.sin(this.theta);
  this.mass.y =
    this.spring.y0 + (this.spring.l0 + this.x) * Math.cos(this.theta);

  //TRACE
  if (this.traceOn) {
    contextT.fillStyle = this.traceColors[this.currColor];
    contextT.fillRect(this.mass.x, this.mass.y, 1, 1);
  }
};

//Fixes the mass position to ensure it cannot be dragged out of the view / Enables fixed spring length at natural length
springPendulum.prototype.fixMassPos = function () {
  //Disallow manual movement outside of canvas
  if (this.mass.x > canvas.width) this.mass.x = canvas.width;
  if (this.mass.x < 0) this.mass.x = 0;
  if (this.mass.y > canvas.height) this.mass.y = canvas.height;
  if (this.mass.y < 0) this.mass.y = 0;

  //lock spring length
  if (this.mass.isDragging) {
    if (this.lockSpring) {
      this.mass.x =
        this.spring.x0 +
        (this.spring.l0 + this.x) *
          ((this.mass.x - this.spring.x0) /
            Math.sqrt(
              Math.pow(this.mass.x - this.spring.x0, 2) +
                Math.pow(this.mass.y - this.spring.y0, 2)
            ));
      this.mass.y =
        this.spring.y0 +
        (this.spring.l0 + this.x) *
          ((this.mass.y - this.spring.y0) /
            Math.sqrt(
              Math.pow(this.mass.x - this.spring.x0, 2) +
                Math.pow(this.mass.y - this.spring.y0, 2)
            ));
    }
    if (true) {
      //DISALLOW DISPLACEMENT ABOVE 2/k
      if (Math.abs(this.x) > 100 + 400 / this.spring.k) {
        //console.log("out");
      }
    }
  }
};

springPendulum.prototype.updateData = function () {
  if (!this.isRunning) {
    this.theta = Math.atan2(
      this.spring.x1 - this.spring.x0,
      this.spring.y1 - this.spring.y0
    );
    this.x =
      getDistance(
        this.spring.x0,
        this.spring.y0,
        this.spring.x1,
        this.spring.y1
      ) - this.spring.l0;
  }

  let edit = document.getElementById("thetaSpringP");
  edit.innerHTML = `${Number.parseFloat((this.theta * 180) / Math.PI).toFixed(
    2
  )}`;
  edit = document.getElementById("l0SpringP");
  edit.innerHTML = `${Number.parseFloat(this.spring.l0).toFixed(2)}`;
  edit = document.getElementById("xSpringP");
  edit.innerHTML = `${Number.parseFloat(this.x).toFixed(2)}`;
};

//Helper for mouse down
springPendulum.prototype.handleMouseDown = function (x, y) {
  this.mouseDown = true;
  if (!this.requireRAF) return;

  //find x and y of mouse relative to canvas
  let mousePos = {
    x: parseInt(x - offsetX),
    y: parseInt(y - offsetY),
  };

  //find x and y of mouse relative to origin of mass to see if it is contained (x-h)^2 + (y-k)^2 = r^2
  if (this.mass.containsMouse(mousePos)) {
    //console.log("in mass");
    this.mass.isDragging = true;
    this.dtheta = 0;
    this.dx = 0;
  }
};

//Helper for mouse move
springPendulum.prototype.handleMouseMove = function (x, y) {
  if (!this.mouseDown) return;
  if (!this.requireRAF) return;

  let mousePos = {
    x: parseInt(x - offsetX),
    y: parseInt(y - offsetY),
  };

  if (this.mass.isDragging) {
    this.mass.x = mousePos.x;
    this.mass.y = mousePos.y;

    if (!this.hasMoved) {
      this.currColor =
        this.currColor >= this.traceColors.length - 1 ? 0 : ++this.currColor;
      this.hasMoved = true;
    }
  }

  this.spring.x1 = this.mass.x;
  this.spring.y1 = this.mass.y;
};

//Helper for mouse up
springPendulum.prototype.handleMouseUp = function () {
  if (!this.requireRAF) return;
  this.mouseDown = false;
  this.mass.isDragging = false;
};

let canvas = document.getElementById("systemCanvas");
let canvasT = document.getElementById("traceCanvas");
let context = canvas.getContext("2d"); //System Canvas
let contextT = canvasT.getContext("2d"); //Trace Canvas

let X0 = Math.round($("#mainGrid").width() / 50) * 25;
let navbarHeight = $("#navbarDiv").height();

let bounds = canvas.getBoundingClientRect();
let offsetX = bounds.left;
let offsetY = bounds.top;

//constants
let g = 9.81;
let t = 0.01;

module.exports = springPendulum;
