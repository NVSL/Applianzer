/* eslint-disable */
export default {
  html: `<div id="myTemp">25C</div>
<button id="tempUP" onclick="tempUp_click()">UP</button>
<button id="tempDOWN" onclick="tempDown_click()">DOWN</button>
<input type="range" id="mySensor" min="-45" max="125" step="1" value="25" />
<span id="myOutput"> OFF </span>`,
  css: "",
  js: `var SETPOINT = 25;
var NEW_SETPOINT = SETPOINT;
var CURRENT_TEMP = SETPOINT;
function changeTemp(temp) {
  let myTemp = document.getElementById("myTemp");
  myTemp.innerText = temp + "°C";
}
function displayTemp() {
  let myTemp = document.getElementById("myTemp");
  myTemp.style.visibility = "visible";
}
function hideTemp() {
  let myTemp = document.getElementById("myTemp");
  myTemp.style.visibility = "hidden";
}
function toogleTempVisibility() {
  let myTemp = document.getElementById("myTemp");
  let tempVisibility = myTemp.style.visibility;
  if (tempVisibility == "visible") {
    hideTemp();
  } else {
    displayTemp();
  }
}
function tempColor(color) {
  document.getElementById("myTemp").style.color = color;
}

function checkSetPointTemp(SETPOINT) {
  let myOutput = document.getElementById("myOutput");
  if (CURRENT_TEMP > SETPOINT) {
    myOutput.innerText = "ON";
  } else {
    myOutput.innerText = "OFF";
  }
}

var mySensor = document.getElementById("mySensor");
mySensor.oninput = function() {
  if (sixSecTimer != null) return;
  CURRENT_TEMP = this.value;
  console.log("Sensor Temp:", this.value)
  changeTemp(CURRENT_TEMP);
  checkSetPointTemp(SETPOINT);
};

// Init SETPOINT
changeTemp(SETPOINT);

// Hide and display text (blink)
var oneSecTimer = null;
function startOneSecTimer() {
  oneSecTimer = setInterval(() => {
    toogleTempVisibility();
  }, 500);
}

// Set new set point after 6 seconds
var sixSecTimer = null;
function startSixSecTimer() {
  displayTemp();
  if (sixSecTimer == null) startOneSecTimer();
  if (sixSecTimer != null) clearTimeout(sixSecTimer);
  tempColor("blue");
  sixSecTimer = setTimeout(() => {
    clearInterval(oneSecTimer);
    if (NEW_SETPOINT != SETPOINT) {
      SETPOINT = NEW_SETPOINT;
      console.log("New Set point: ", SETPOINT);
    }
    changeTemp(CURRENT_TEMP);
    checkSetPointTemp(SETPOINT);
    displayTemp();
    tempColor("black");
    sixSecTimer = null;
  }, 6000);
}

function tempUp_click() {
  startSixSecTimer();
  NEW_SETPOINT += 1;
  changeTemp(NEW_SETPOINT);
};

function tempDown_click() {
  startSixSecTimer();
  NEW_SETPOINT -= 1;
  changeTemp(NEW_SETPOINT);
}`
};
