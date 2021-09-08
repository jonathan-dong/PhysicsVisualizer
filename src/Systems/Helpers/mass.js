function mass(x, y, r, m, xscale = 1, yscale = 1, color = "#000") {
  this.x = x;
  this.y = y;
  this.z = 0;
  this.r = r;
  this.m = m;
  this.xscale = xscale;
  this.yscale = yscale;
  this.color = color;
  this.isDragging = false;
}

mass.prototype.containsMouse = function (mousePos) {
  return (
    Math.pow(mousePos.x - this.xscale * this.x, 2) +
      Math.pow(mousePos.y - this.yscale * this.y, 2) <=
    Math.pow(this.r + 5, 2)
  );
};

mass.prototype.drawMass = function (context) {
  context.beginPath();
  context.arc(
    this.xscale * this.x,
    this.yscale * this.y,
    this.r,
    0,
    2 * Math.PI,
    false
  );
  context.fillStyle = this.color;
  context.fill();
  context.lineWidth = 5;
  context.strokeStyle = this.color;
  context.stroke();
};

module.exports = mass;
