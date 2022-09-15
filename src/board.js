import _ from "lodash";

const doublePendulum = require("./Systems/doublePendulum");
const springPendulum = require("./Systems/springPendulum");
const lorenz = require("./Systems/lorenz");

function Board(height, width) {
  this.height = height;
  this.width = width;

  // System state variables
  this.currentSystem = null;
  this.systemObj = null;
  this.speed = "fast";
  this.isRunning = false;
  this.traceOn = false;
}

Board.prototype.initialize = function () {
  this.createGrid();
  this.activateButtons();
};

Board.prototype.createGrid = function () {
  let tableHTML = "";
  for (let r = 0; r < this.height; r++) {
    let currentHTMLRow = `<tr id="row ${r}">`;
    for (let c = 0; c < this.width; c++) {
      let newNodeId = `${r}-${c}`;
      currentHTMLRow += `<td id="${newNodeId}"></td>`;
    }
    tableHTML += `${currentHTMLRow}</tr>`;
  }
  let board = document.getElementById("board");
  board.innerHTML = tableHTML;

  //Set canvas dimensions to match grid dimensions
  let canvas = document.getElementById("systemCanvas");
  canvas.height = $(board).height();
  canvas.width = $(board).width();
  canvas = document.getElementById("traceCanvas");
  canvas.height = $(board).height();
  canvas.width = $(board).width();
  canvas = document.getElementById("traceCanvas2");
  canvas.height = $(board).height();
  canvas.width = $(board).width();
};

Board.prototype.activateButtons = function () {
  document.getElementById("refreshButton").onclick = () => {
    window.location.reload(true);
  };

  document.getElementById("startButtonStart").onclick = () => {
    if (!this.currentSystem) {
      document.getElementById("startButtonStart").innerHTML =
        '<button type="button" class="btn btn-outline-warning" style="width: 100%">Pick a System!</button>';
    }
  };

  document.getElementById("adjustFast").onclick = () => {
    this.speed = "fast";
    if (this.systemObj) this.systemObj.speed = this.speed;
    document.getElementById("adjustSpeed").innerHTML = "Speed: Fast";
  };

  document.getElementById("adjustAverage").onclick = () => {
    this.speed = "average";
    if (this.systemObj) this.systemObj.speed = this.speed;
    document.getElementById("adjustSpeed").innerHTML = "Speed: Average";
  };

  document.getElementById("adjustSlow").onclick = () => {
    this.speed = "slow";
    if (this.systemObj) this.systemObj.speed = this.speed;
    document.getElementById("adjustSpeed").innerHTML = "Speed: Slow";
  };

  document.getElementById("startButtonDoublePendulum").onclick = () => {
    document.getElementById("startButtonStart").innerHTML =
      '<button type="button" class="btn btn-outline-success" style="width: 100%">Simulate Double Pendulum!</button>';
    document.getElementById("LockRodsCheck").checked = false;
    document.getElementById("displayDefault").style.display = "none";
    document.getElementById("tableDataSP").style.display = "none";
    document.getElementById("tableDataL").style.display = "none";
    document.getElementById("tableDataDP").style.display = "block";
    this.currentSystem = "doublePendulum";
    //ADJUST DISPLAYED
    if (this.systemObj) this.systemObj.end();
    this.systemObj = new doublePendulum();
    this.systemObj.traceOn = this.traceOn;
    this.systemObj.speed = this.speed;
    this.systemObj.defaultInit();
  };

  document.getElementById("startButtonSpringPendulum").onclick = () => {
    document.getElementById("startButtonStart").innerHTML =
      '<button type="button" class="btn btn-outline-success" style="width: 100%">Simulate Spring Pendulum!</button>';
    document.getElementById("displayDefault").style.display = "none";
    document.getElementById("tableDataDP").style.display = "none";
    document.getElementById("tableDataL").style.display = "none";
    document.getElementById("tableDataSP").style.display = "block";
    this.currentSystem = "SpringPendulum";
    //ADJUST DISPLAYED
    if (this.systemObj) this.systemObj.end();
    this.systemObj = new springPendulum();
    this.systemObj.traceOn = this.traceOn;
    this.systemObj.speed = this.speed;
    this.systemObj.defaultInit();
  };

  document.getElementById("startButtonLorenz").onclick = () => {
    document.getElementById("startButtonStart").innerHTML =
      '<button type="button" class="btn btn-outline-success" style="width: 100%">Simulate Lorenz System!</button>';
    document.getElementById("displayDefault").style.display = "none";
    document.getElementById("tableDataDP").style.display = "none";
    document.getElementById("tableDataSP").style.display = "none";
    document.getElementById("tableDataL").style.display = "block";
    this.currentSystem = "Lorenz";
    //ADJUST DISPLAYED
    if (this.systemObj) this.systemObj.end();
    this.systemObj = new lorenz();
    this.systemObj.speed = this.speed;
    this.systemObj.defaultInit();
  };

  document.getElementById("startButtonTrace").onclick = () => {
    if (
      !this.systemObj ||
      document.getElementById("TraceLink").classList.contains("disabled")
    )
      return;
    if (this.systemObj.traceOn) {
      document.getElementById(
        "startButtonTrace"
      ).innerHTML = `<a id="TraceLink" class="nav-link" href="#">Show Path</a>`;
    } else {
      document.getElementById(
        "startButtonTrace"
      ).innerHTML = `<a id="TraceLink" class="nav-link" href="#">Hide Path</a>`;
    }
    this.systemObj.traceOn = !this.systemObj.traceOn;
    this.traceOn = this.systemObj.traceOn;
  };

  document.getElementById("startButtonClearTrace").onclick = () => {
    if (
      document.getElementById("ClearTraceLink").classList.contains("disabled")
    )
      return;
    let canvasT = document.getElementById("traceCanvas");
    let contextT = canvasT.getContext("2d"); //Trace Canvas
    contextT.clearRect(0, 0, canvasT.width, canvasT.height);

    canvasT = document.getElementById("traceCanvas2");
    contextT = canvasT.getContext("2d"); //Trace Canvas
    contextT.clearRect(0, 0, canvasT.width, canvasT.height);

    if (this.systemObj) this.systemObj.currColor = 0;
  };

  document.getElementById("startButtonReset").onclick = () => {
    if (this.systemObj) this.systemObj.reset();
  };
};

let navbarHeight = $("#navbarDiv").height();
let height = Math.floor(($(document).height() - navbarHeight) / 27);
let width = Math.floor($("#mainGrid").width() / 25);

// Create Board
let newBoard = new Board(height, width);
newBoard.initialize();

document.getElementById("footer").style.height =
  window.innerHeight -
  document.getElementById("display").scrollHeight -
  document.getElementById("navbarDiv").scrollHeight -
  15 +
  "px";
