const mass = require("./Helpers/mass");
const rod = require("./Helpers/rod");
const getDistance = require("./Helpers/getDistance");

function doublePendulum() {
  //Objects
  this.mass1 = new mass(X0, Math.floor($(canvas).height() / 50) * 37.5, 25, 10);
  this.mass2 = new mass(
    X0,
    Math.floor($(document).height() - navbarHeight) - 100,
    25,
    10
  );
  this.rod1 = new rod(
    this.mass1.x,
    Math.floor($(canvas).height() / 50) * 25,
    this.mass1.x,
    this.mass1.y
  );
  this.rod2 = new rod(this.mass1.x, this.mass1.y, this.mass2.x, this.mass2.y);

  //state
  this.isRunning = false;
  this.selected = true; // MAYBE CHANGE THIS
  this.traceOn = false;
  this.mouseDown = false;
  this.lockRods = null;

  //animation
  this.requireRAF = true;
  this.anim = null;

  //INITIAL CONDITIONS
  this.mass10 = {
    x: this.mass1.x,
    y: this.mass1.y,
  };

  this.mass20 = {
    x: this.mass2.x,
    y: this.mass2.y,
  };

  //consider adding
  //this.temppos = {
  //  x1: this.mass1.x,
  //  y1: this.mass1.y,
  //  x2: this.mass2.x,
  //  y2: this.mass2.y,
  //};

  //calculation
  this.theta1 = 0;
  this.theta2 = 0;
  this.dtheta1 = 0;
  this.dtheta2 = 0;

  this.currColor = 0;
  this.hasMoved = true;
  this.traceColors = ["#FF7F00", "#FFEF00", "#00F11D", "#0079FF", "violet"];

  this.speed = "fast";
}

doublePendulum.prototype.reset = function () {
  if (this.anim) cancelAnimationFrame(this.anim);
  context.clearRect(0, 0, canvas.width, canvas.height);
  this.isRunning = false;
  document.getElementById("startButtonStart").innerHTML =
    '<button type="button" class="btn btn-outline-success" style="width: 100%">Simulate Double Pendulum!</button>';
  document.getElementById("LockRodsCheck").disabled = false;
  document.getElementById("LockRodsCheck").checked = this.lockRods;

  this.mass1.x = this.mass10.x;
  this.mass1.y = this.mass10.y;
  this.mass2.x = this.mass20.x;
  this.mass2.y = this.mass20.y;

  this.updateRods();

  this.anim = null;

  this.hasMoved = false;

  this.dtheta1 = 0;
  this.dtheta2 = 0;

  this.defaultInit();
};

doublePendulum.prototype.defaultInit = function () {
  this.draw();

  document.getElementById("startButtonStart").onclick = () => {
    if (this.isRunning) {
      document.getElementById("startButtonStart").innerHTML =
        '<button type="button" class="btn btn-outline-success" style="width: 100%">Simulate Double Pendulum!</button>';
      document.getElementById("LockRodsCheck").disabled = false;
      document.getElementById("LockRodsCheck").checked = this.lockRods;
      this.hasMoved = false;
    } else {
      document.getElementById("startButtonStart").innerHTML =
        '<button type="button" class="btn btn-outline-danger" style="width: 100%">Pause Simulation!</button>';
      document.getElementById("LockRodsCheck").disabled = true;
      document.getElementById("LockRodsCheck").checked = true;
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

  this.anim = window.requestAnimationFrame(() => {
    this.simulate();
  });
  //var init = setInterval(function() {
  //IF SELECTION SWITCHES
  //    if (!_self.selected) {
  //        console.log("END");
  //        clearInterval(init);
  //    } else {
  //        _self.simulate();
  //    }
  //}, 10);
};

doublePendulum.prototype.draw = function () {
  this.mass1.drawMass(context);
  this.mass2.drawMass(context);
  this.rod1.drawRod(context);
  this.rod2.drawRod(context);
};

doublePendulum.prototype.handleMouseDown = function (x, y) {
  this.mouseDown = true;
  if (!this.requireRAF) return;

  //find x and y of mouse relative to canvas
  let mousePos = {
    x: parseInt(x - offsetX),
    y: parseInt(y - offsetY),
  };

  //find x and y of mouse relative to origin of mass to see if it is contained (x-h)^2 + (y-k)^2 = r^2
  if (this.mass1.containsMouse(mousePos)) {
    //console.log("in mass1");
    this.dtheta1 = 0;
    this.dtheta2 = 0;
    this.mass1.isDragging = true;
  }

  if (this.mass2.containsMouse(mousePos)) {
    //console.log("in mass2");
    this.dtheta1 = 0;
    this.dtheta2 = 0;
    this.mass2.isDragging = true;
  }
};

doublePendulum.prototype.handleMouseMove = function (x, y) {
  if (!this.mouseDown) return;
  if (!this.requireRAF) return;

  let mousePos = {
    x: parseInt(x - offsetX),
    y: parseInt(y - offsetY),
  };

  if (this.mass1.isDragging) {
    this.mass1.x = mousePos.x;
    this.mass1.y = mousePos.y;

    //Change trace color
    if (!this.hasMoved) {
      this.currColor =
        this.currColor >= this.traceColors.length - 1 ? 0 : ++this.currColor;
      this.hasMoved = true;
    }
  }

  if (this.mass2.isDragging) {
    this.mass2.x = mousePos.x;
    this.mass2.y = mousePos.y;

    //Change trace color
    if (!this.hasMoved) {
      this.currColor =
        this.currColor >= this.traceColors.length - 1 ? 0 : ++this.currColor;
      this.hasMoved = true;
    }
  }

  this.updateRods();
};

doublePendulum.prototype.handleMouseUp = function () {
  if (!this.requireRAF) return;
  this.mouseDown = false;
  this.mass1.isDragging = false;
  this.mass2.isDragging = false;
};

doublePendulum.prototype.simulate = function () {
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (!this.selected) window.cancelAnimationFrame(this.anim);
  //UPDATE VALUES BASED ON INITIAL CONDITIONS
  this.requireRAF = false;

  if (this.isRunning) {
    //SIMULATE
    for (let i = 0; i < 8; i++) this.calculate();
    if (this.speed === "fast") {
      for (let i = 0; i < 8; i++) this.calculate();
      for (let i = 0; i < 8; i++) this.calculate();
    } else if (this.speed === "average") {
      for (let i = 0; i < 8; i++) this.calculate();
    }
  } else {
    //RUNNING TWICE IMPROVES EDGE DETECTION PERFORMANCE?
    this.lockRods = document.getElementById("LockRodsCheck").checked;
    this.fixMassPos();
    this.fixMassPos();
    this.fixMassPos();
    this.fixMassPos();
    //
  }

  this.updateRods();
  this.updateData();
  this.draw();

  if (this.mass1.isDragging || this.mass2.isDragging) {
    this.mass10.x = this.mass1.x;
    this.mass10.y = this.mass1.y;
    this.mass20.x = this.mass2.x;
    this.mass20.y = this.mass2.y;
  }

  this.requireRAF = true;
  this.anim = window.requestAnimationFrame(() => {
    this.simulate();
  });
};

doublePendulum.prototype.calculate = function () {
  let mu = 1 + this.mass1.m / this.mass2.m;
  let d2theta1 =
    (g *
      (Math.sin(this.theta2) * Math.cos(this.theta1 - this.theta2) -
        mu * Math.sin(this.theta1)) -
      (this.rod2.l * this.dtheta2 * this.dtheta2 +
        this.rod1.l *
          this.dtheta1 *
          this.dtheta1 *
          Math.cos(this.theta1 - this.theta2)) *
        Math.sin(this.theta1 - this.theta2)) /
    (this.rod1.l *
      (mu -
        Math.cos(this.theta1 - this.theta2) *
          Math.cos(this.theta1 - this.theta2)));
  let d2theta2 =
    (mu *
      g *
      (Math.sin(this.theta1) * Math.cos(this.theta1 - this.theta2) -
        Math.sin(this.theta2)) +
      (mu * this.rod1.l * this.dtheta1 * this.dtheta1 +
        this.rod2.l *
          this.dtheta2 *
          this.dtheta2 *
          Math.cos(this.theta1 - this.theta2)) *
        Math.sin(this.theta1 - this.theta2)) /
    (this.rod2.l *
      (mu -
        Math.cos(this.theta1 - this.theta2) *
          Math.cos(this.theta1 - this.theta2)));
  this.dtheta1 += d2theta1 * t;
  this.dtheta2 += d2theta2 * t;
  this.theta1 += this.dtheta1 * t;
  this.theta2 += this.dtheta2 * t;

  this.mass1.x = this.rod1.x0 + this.rod1.l * Math.sin(this.theta1);
  this.mass1.y = this.rod1.y0 + this.rod1.l * Math.cos(this.theta1);
  this.mass2.x =
    this.rod1.x0 +
    this.rod1.l * Math.sin(this.theta1) +
    this.rod2.l * Math.sin(this.theta2);
  this.mass2.y =
    this.rod1.y0 +
    this.rod1.l * Math.cos(this.theta1) +
    this.rod2.l * Math.cos(this.theta2);

  //TRACE
  if (this.traceOn) {
    contextT.fillStyle = this.traceColors[this.currColor];
    contextT.fillRect(this.mass2.x, this.mass2.y, 1, 1);
  }
};

doublePendulum.prototype.updateRods = function () {
  this.rod1.x1 = this.mass1.x;
  this.rod1.y1 = this.mass1.y;
  this.rod2.x0 = this.mass1.x;
  this.rod2.y0 = this.mass1.y;
  this.rod2.x1 = this.mass2.x;
  this.rod2.y1 = this.mass2.y;
};

doublePendulum.prototype.updateData = function () {
  if (!this.isRunning) {
    this.theta1 = Math.atan2(
      this.rod1.x1 - this.rod1.x0,
      this.rod1.y1 - this.rod1.y0
    );
    this.theta2 = Math.atan2(
      this.rod2.x1 - this.rod2.x0,
      this.rod2.y1 - this.rod2.y0
    );
    if (!document.getElementById("LockRodsCheck").checked) {
      this.rod1.l = getDistance(
        this.rod1.x0,
        this.rod1.y0,
        this.rod1.x1,
        this.rod1.y1
      );
      this.rod2.l = getDistance(
        this.rod2.x0,
        this.rod2.y0,
        this.rod2.x1,
        this.rod2.y1
      );
    }
  }

  let edit = document.getElementById("theta1");
  edit.innerHTML = `${Number.parseFloat((this.theta1 * 180) / Math.PI).toFixed(
    2
  )}`;
  edit = document.getElementById("theta2");
  edit.innerHTML = `${Number.parseFloat((this.theta2 * 180) / Math.PI).toFixed(
    2
  )}`;
  edit = document.getElementById("l1");
  edit.innerHTML = `${Number.parseFloat(this.rod1.l).toFixed(2)}`;
  edit = document.getElementById("l2");
  edit.innerHTML = `${Number.parseFloat(this.rod2.l).toFixed(2)}`;
};

doublePendulum.prototype.end = function () {
  this.selected = false;
  if (this.anim) cancelAnimationFrame(this.anim);
  context.clearRect(0, 0, canvas.width, canvas.height);
  contextT.clearRect(0, 0, canvas.width, canvas.height);
  //console.log("Double Pendulum Simulation Terminated");
};

//FIXES the mouse position relative to the canvas to avoid bad behavior (moving masses outside of canvas, putting masses on top of one another, length of rods)
doublePendulum.prototype.fixMassPos = function () {
  //Disallow manual movement outside of canvas
  if (this.mass1.x > canvas.width) this.mass1.x = canvas.width;
  if (this.mass1.x < 0) this.mass1.x = 0;
  if (this.mass1.y > canvas.height) this.mass1.y = canvas.height;
  if (this.mass1.y < 0) this.mass1.y = 0;

  if (this.mass2.x > canvas.width) this.mass2.x = canvas.width;
  if (this.mass2.x < 0) this.mass2.x = 0;
  if (this.mass2.y > canvas.height) this.mass2.y = canvas.height;
  if (this.mass2.y < 0) this.mass2.y = 0;

  //Avoid overlapping mass2 while moving mass1 ENABLE RODLOCK
  if (this.mass1.isDragging) {
    if (document.getElementById("LockRodsCheck").checked) {
      this.mass1.x =
        this.rod1.x0 +
        this.rod1.l *
          ((this.mass1.x - this.rod1.x0) /
            Math.sqrt(
              Math.pow(this.mass1.x - this.rod1.x0, 2) +
                Math.pow(this.mass1.y - this.rod1.y0, 2)
            ));
      this.mass1.y =
        this.rod1.y0 +
        this.rod1.l *
          ((this.mass1.y - this.rod1.y0) /
            Math.sqrt(
              Math.pow(this.mass1.x - this.rod1.x0, 2) +
                Math.pow(this.mass1.y - this.rod1.y0, 2)
            ));
      this.mass2.x =
        this.mass1.x +
        this.rod2.l *
          ((this.mass2.x - this.mass1.x) /
            Math.sqrt(
              Math.pow(this.mass2.x - this.mass1.x, 2) +
                Math.pow(this.mass2.y - this.mass1.y, 2)
            ));
      this.mass2.y =
        this.mass1.y +
        this.rod2.l *
          ((this.mass2.y - this.mass1.y) /
            Math.sqrt(
              Math.pow(this.mass2.x - this.mass1.x, 2) +
                Math.pow(this.mass2.y - this.mass1.y, 2)
            ));
    } else if (
      getDistance(this.mass1.x, this.mass1.y, this.mass2.x, this.mass2.y) <
      this.mass1.r + this.mass2.r
    ) {
      this.mass1.x =
        this.mass2.x +
        (this.mass2.r + this.mass1.r) *
          ((this.mass1.x - this.mass2.x) /
            Math.sqrt(
              Math.pow(this.mass1.x - this.mass2.x, 2) +
                Math.pow(this.mass1.y - this.mass2.y, 2)
            ));
      this.mass1.y =
        this.mass2.y +
        (this.mass2.r + this.mass1.r) *
          ((this.mass1.y - this.mass2.y) /
            Math.sqrt(
              Math.pow(this.mass1.x - this.mass2.x, 2) +
                Math.pow(this.mass1.y - this.mass2.y, 2)
            ));
    }
  }
  //Avoid overlapping mass1 while moving mass2
  if (this.mass2.isDragging) {
    if (document.getElementById("LockRodsCheck").checked) {
      this.mass2.x =
        this.mass1.x +
        this.rod2.l *
          ((this.mass2.x - this.mass1.x) /
            Math.sqrt(
              Math.pow(this.mass2.x - this.mass1.x, 2) +
                Math.pow(this.mass2.y - this.mass1.y, 2)
            ));
      this.mass2.y =
        this.mass1.y +
        this.rod2.l *
          ((this.mass2.y - this.mass1.y) /
            Math.sqrt(
              Math.pow(this.mass2.x - this.mass1.x, 2) +
                Math.pow(this.mass2.y - this.mass1.y, 2)
            ));
    } else if (
      getDistance(this.mass2.x, this.mass2.y, this.mass1.x, this.mass1.y) <
      this.mass1.r + this.mass2.r
    ) {
      this.mass2.x =
        this.mass1.x +
        (this.mass2.r + this.mass1.r) *
          ((this.mass2.x - this.mass1.x) /
            Math.sqrt(
              Math.pow(this.mass2.x - this.mass1.x, 2) +
                Math.pow(this.mass2.y - this.mass1.y, 2)
            ));
      this.mass2.y =
        this.mass1.y +
        (this.mass2.r + this.mass1.r) *
          ((this.mass2.y - this.mass1.y) /
            Math.sqrt(
              Math.pow(this.mass2.x - this.mass1.x, 2) +
                Math.pow(this.mass2.y - this.mass1.y, 2)
            ));
    }
  }
};

let canvas = document.getElementById("systemCanvas");
let canvasT = document.getElementById("traceCanvas");
let context = canvas.getContext("2d"); //System Canvas
let contextT = canvasT.getContext("2d"); //Trace Canvas

let navbarHeight = $("#navbarDiv").height();

let bounds = canvas.getBoundingClientRect();
let offsetX = bounds.left;
let offsetY = bounds.top;

//constants
let g = 9.81;
let t = 0.01;
let X0 = Math.round($("#mainGrid").width() / 50) * 25;

module.exports = doublePendulum;
