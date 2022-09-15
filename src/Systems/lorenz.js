const mass = require("./Helpers/mass");

function lorenz() {
  this.xscale = Math.round(canvas.width / 40);
  this.yscale = -Math.round(canvas.height / 80);

  this.X0 = Math.round(canvas.width / 50) * 25;
  this.Y0 = Math.round(canvas.height / 25) * 25 - 100;

  this.mass = new mass(10, 10, 5, 0, this.xscale, this.yscale);

  this.rndMass = new mass(10, 10, 5, 0, this.xscale, this.yscale);

  this.isRunning = false;
  this.rnd = false;
  this.selected = true;
  this.mouseDown = false;
  this.currColor = 0;
  this.speed = "fast";

  //animation
  this.requireRAF = true;
  this.anim = null;

  //INITIAL CONDITIONS
  this.mass0 = {
    x: this.mass.x,
    y: this.mass.y,
    z: this.mass.z,
  };

  this.hasMoved = true;
  this.traceColors = ["#FF7F00", "#FFEF00", "#00F11D", "#0079FF", "violet"];
}

//Starts the simulation and prepares event handlers buttons and interface
lorenz.prototype.defaultInit = function () {
  //Transform Origin
  context.save();
  context.translate(this.X0, this.Y0);

  this.mass.drawMass(context);
  context.restore();

  document.getElementById("TraceLink").classList.add("disabled");

  document.getElementById("startButtonStart").onclick = () => {
    if (this.isRunning) {
      document.getElementById("startButtonStart").innerHTML =
        '<button type="button" class="btn btn-outline-success" style="width: 100%">Simulate Lorenz System!</button>';
      this.hasMoved = false;
    } else {
      document.getElementById("startButtonStart").innerHTML =
        '<button type="button" class="btn btn-outline-danger" style="width: 100%">Pause Simulation!</button>';
    }
    this.isRunning = !this.isRunning;
  };

  document.getElementById("lorenzRndBtn").onclick = () => {
    if (this.isRunning) {
      this.round = true;
      contextT2.clearRect(0, 0, canvas.width, canvas.height);
      //ROUND mass
      this.rndMass.x = Number.parseFloat(this.mass.x.toFixed(1));
      this.rndMass.y = Number.parseFloat(this.mass.y.toFixed(1));
      this.rndMass.z = Number.parseFloat(this.mass.z.toFixed(1));
    }
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
};

//Ends the simulation and resets it to its initial conditions
lorenz.prototype.reset = function () {
  if (this.anim) cancelAnimationFrame(this.anim);
  context.clearRect(0, 0, canvas.width, canvas.height);
  contextT2.clearRect(0, 0, canvas.width, canvas.height);
  this.isRunning = false;
  this.round = false;
  document.getElementById("startButtonStart").innerHTML =
    '<button type="button" class="btn btn-outline-success" style="width: 100%">Simulate Lorenz System!</button>';

  //RESTORE MASS POSITION
  this.mass.x = this.mass0.x;
  this.mass.y = this.mass0.y;
  this.mass.z = this.mass0.z;

  this.anim = null;
  this.hasMoved = false;

  this.defaultInit();
};

//Ends the simulation preparing for the selection of a new simulation. Clears the display and stops the calling of RAF
lorenz.prototype.end = function () {
  this.selected = false;
  if (this.anim) cancelAnimationFrame(this.anim);
  context.clearRect(0, 0, canvas.width, canvas.height);
  contextT.clearRect(0, 0, canvas.width, canvas.height);
  contextT2.clearRect(0, 0, canvas.width, canvas.height);
  //console.log("Lorenz System Simulation Terminated");
  document.getElementById("TraceLink").classList.remove("disabled");
  document.getElementById("ClearTraceLink").classList.remove("disabled");
};

//Called every animation frame to calculate the next rendered position of the mass and spring and draw them
lorenz.prototype.simulate = function () {
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
    this.fixMassPos();
  }

  this.updateData();
  context.save();
  context.translate(this.X0, this.Y0);

  if (this.round) this.rndMass.drawMass(context);
  this.mass.drawMass(context);
  context.restore();

  if (this.mass.isDragging) {
    this.mass0.x = this.mass.x;
    this.mass0.y = this.mass.y;
    this.mass0.z = this.mass.z;
  }

  this.requireRAF = true;
  this.anim = window.requestAnimationFrame(() => {
    this.simulate();
  });
};

lorenz.prototype.calculate = function () {
  let dx = 10 * (this.mass.z - this.mass.x);
  let dy = this.mass.x * this.mass.z - (8 / 3) * this.mass.y;
  let dz = this.mass.x * (28 - this.mass.y) - this.mass.z;

  this.mass.x += dx * t;
  this.mass.y += dy * t;
  this.mass.z += dz * t;

  //TRACE
  contextT.save();
  contextT.translate(this.X0, this.Y0);
  contextT.fillStyle = this.traceColors[this.currColor];
  contextT.fillRect(this.mass.x * this.xscale, this.mass.y * this.yscale, 1, 1);
  contextT.restore();

  //ROUND MASS FUNCTIONALITY
  if (this.round) {
    dx = 10 * (this.rndMass.z - this.rndMass.x);
    dy = this.rndMass.x * this.rndMass.z - (8 / 3) * this.rndMass.y;
    dz = this.rndMass.x * (28 - this.rndMass.y) - this.rndMass.z;

    this.rndMass.x += dx * t;
    this.rndMass.y += dy * t;
    this.rndMass.z += dz * t;

    contextT2.save();
    contextT2.translate(this.X0, this.Y0);
    contextT2.fillStyle = "#001EFF";
    contextT2.fillRect(
      this.rndMass.x * this.xscale,
      this.rndMass.y * this.yscale,
      1,
      1
    );
    contextT2.restore();
  }
};

lorenz.prototype.updateData = function () {
  edit = document.getElementById("xLorenz");
  edit.innerHTML = `${this.mass.x.toFixed(2)}`;
  edit = document.getElementById("yLorenz");
  edit.innerHTML = `${this.mass.z.toFixed(2)}`;
  edit = document.getElementById("zLorenz");
  edit.innerHTML = `${this.mass.y.toFixed(2)}`;
};

//Fixes the mass position to ensure it cannot be dragged out of the view / Enables fixed spring length at natural length
lorenz.prototype.fixMassPos = function () {
  //Disallow manual movement outside of canvas
  if (this.xscale * this.mass.x > canvas.width - this.X0)
    this.mass.x = (canvas.width - this.X0) / this.xscale;
  if (this.xscale * this.mass.x < -this.X0)
    this.mass.x = -this.X0 / this.xscale;
  if (this.yscale * this.mass.y > canvas.height - this.Y0)
    this.mass.y = (canvas.height - this.Y0) / this.yscale;
  if (this.yscale * this.mass.y < -this.Y0)
    this.mass.y = -this.Y0 / this.yscale;
};

//Helper for mouse down
lorenz.prototype.handleMouseDown = function (x, y) {
  this.mouseDown = true;
  if (!this.requireRAF) return;

  //find x and y of mouse relative to canvas
  let mousePos = {
    x: parseInt(x - offsetX - this.X0),
    y: parseInt(y - offsetY - this.Y0),
  };
  //find x and y of mouse relative to origin of mass to see if it is contained (x-h)^2 + (y-k)^2 = r^2
  if (this.mass.containsMouse(mousePos)) {
    //console.log("in mass");
    this.mass.isDragging = true;
    //Clear and stop rounding mass display
    contextT2.clearRect(0, 0, canvas.width, canvas.height);
    this.round = false;
  }
};

//Helper for mouse move
lorenz.prototype.handleMouseMove = function (x, y) {
  if (!this.mouseDown) return;
  if (!this.requireRAF) return;

  let mousePos = {
    x: parseInt(x - offsetX - this.X0),
    y: parseInt(y - offsetY - this.Y0),
  };

  if (this.mass.isDragging) {
    this.mass.x = mousePos.x / this.xscale;
    this.mass.y = mousePos.y / this.yscale;

    //Change trace color
    if (!this.hasMoved) {
      this.currColor =
        this.currColor >= this.traceColors.length - 1 ? 0 : ++this.currColor;
      this.hasMoved = true;
    }
  }
};

//Helper for mouse up
lorenz.prototype.handleMouseUp = function () {
  if (!this.requireRAF) return;
  this.mouseDown = false;
  this.mass.isDragging = false;
};

let canvas = document.getElementById("systemCanvas");
let canvasT = document.getElementById("traceCanvas");
let canvasT2 = document.getElementById("traceCanvas2");
let context = canvas.getContext("2d"); //System Canvas
let contextT = canvasT.getContext("2d"); //Trace Canvas
let contextT2 = canvasT2.getContext("2d");

let bounds = canvas.getBoundingClientRect();
let offsetX = bounds.left;
let offsetY = bounds.top;

//constants
let t = 0.001;

module.exports = lorenz;
