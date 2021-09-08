const getDistance = require("./getDistance");

function spring(x0, y0, x1, y1) {
  this.x0 = x0;
  this.y0 = y0;
  this.x1 = x1;
  this.y1 = y1;
  this.k = Number.parseFloat(document.getElementById("springPkRange").value);
  this.l0 = Number.parseFloat(document.getElementById("springPlRange").value); //natural length
}

//Draws a sin wave from x0,y0 to x1,y1 with a number of periods according to l
spring.prototype.drawSpring = function (ctx) {
  let dist = getDistance(this.x0, this.y0, this.x1, this.y1);
  let xdiff = this.x1 - this.x0;
  let ydiff = this.y1 - this.y0;
  let nx = xdiff / dist;
  let ny = ydiff / dist;
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.moveTo(this.x0, this.y0);
  let step = 20 / this.l0; //TODO: change?
  let width = 50 / this.k;
  for (let i = step; i < 1 - step; i += step) {
    for (let j = 0; j < 1; j += 0.1) {
      let xx = this.x0 + xdiff * (i + j * step);
      let yy = this.y0 + ydiff * (i + j * step);
      xx -= Math.sin(j * Math.PI * 2) * ny * width;
      yy += Math.sin(j * Math.PI * 2) * nx * width;
      ctx.lineTo(xx, yy);
    }
  }
  ctx.lineTo(this.x1, this.y1);

  ctx.lineWidth = 5;
  ctx.strokeStyle = "black";

  ctx.stroke();
};

module.exports = spring;
