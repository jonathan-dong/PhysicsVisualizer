//abstract function providing default values for variables commonly used in inheriting functions, and functions that must be defined to prevent errors

function system() {
  if (this.constructor === system) {
    throw new Error("Can't instantiate abstract class system");
  }

  this.currColor = 0; //current color of trace for cycling through array of colors
  this.speed = "fast"; //current simulation speed
  this.isRunning = false;
  this.selected = true;
  this.traceOn = false;
  this.mouseDown = false;

  this.requireRAF = true;
  this.anim = null;
}

system.prototype.end = function () {
  throw new Error("Abstract method end() must be defined");
};

system.prototype.defaultInit = function () {
  throw new Error("Abstract method defaultInit() must be defined");
};

system.prototype.reset = function () {
  throw new Error("Abstract method reset() must be defined");
};
