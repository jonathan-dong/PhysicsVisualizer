function rod(x0, y0, x1, y1) {
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
    this.l = null;
}

rod.prototype.drawRod = function(context) {
    context.beginPath();
    context.moveTo(this.x0, this.y0);
    context.lineTo(this.x1, this.y1);
    context.strokeStyle = 'black';
    context.stroke();
}

module.exports = rod;