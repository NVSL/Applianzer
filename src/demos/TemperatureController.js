/* eslint-disable */
export default {
  html: `<div id="container">
  <div id="thermostat"></div>
</div>
<br \ />
<button id="tempUP" onclick="targetTempUp_click()">UP</button>
<button id="tempDOWN" onclick="targetTempDown_click()">DOWN</button>
<input type="range" id="mySensor" min="10" max="40" step="1" value="25" />
<span id="myOutput"> OFF </span>`,
  css: `body {
    background-color: #cccccc;
  }
  #thermostat {
    width: 55%;
    height: 60%;
    margin: 0 auto;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }
  .dial {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .dial.away .dial__ico__leaf {
    visibility: hidden;
  }
  .dial.away .dial__lbl--target {
    visibility: hidden;
  }
  .dial.away .dial__lbl--target--half {
    visibility: hidden;
  }
  .dial.away .dial__lbl--away {
    opacity: 1;
  }
  .dial .dial__shape {
    -webkit-transition: fill 0.5s;
    transition: fill 0.5s;
  }
  .dial__ico__leaf {
    fill: #13eb13;
    opacity: 0;
    -webkit-transition: opacity 0.5s;
    transition: opacity 0.5s;
    pointer-events: none;
  }
  .dial.has-leaf .dial__ico__leaf {
    display: block;
    opacity: 1;
    pointer-events: initial;
  }
  .dial__editableIndicator {
    fill: white;
    fill-rule: evenodd;
    opacity: 0;
    -webkit-transition: opacity 0.5s;
    transition: opacity 0.5s;
  }
  .dial--edit .dial__editableIndicator {
    opacity: 1;
  }
  .dial--state--off .dial__shape {
    fill: #222;
  }
  .dial--state--heating .dial__shape {
    fill: #e36304;
  }
  .dial--state--cooling .dial__shape {
    fill: #007af1;
  }
  .dial__ticks path {
    fill: rgba(255, 255, 255, 0.3);
  }
  .dial__ticks path.active {
    fill: rgba(255, 255, 255, 0.8);
  }
  .dial text {
    fill: white;
    text-anchor: middle;
    font-family: Helvetica, sans-serif;
    alignment-baseline: central;
  }
  .dial__lbl--target {
    font-size: 120px;
    font-weight: bold;
  }
  .dial__lbl--hvac {
    font-size: 18px;
  }
  .dial__lbl--target--half {
    font-size: 40px;
    font-weight: bold;
    opacity: 0;
    -webkit-transition: opacity 0.1s;
    transition: opacity 0.1s;
  }
  .dial__lbl--target--half.shown {
    opacity: 1;
    -webkit-transition: opacity 0s;
    transition: opacity 0s;
  }
  .dial__lbl--ambient {
    font-size: 22px;
    font-weight: bold;
  }
  .dial__lbl--away {
    font-size: 72px;
    font-weight: bold;
    opacity: 0;
    pointer-events: none;
  }
  @font-face {
    font-family: "Open Sans";
    font-style: normal;
    font-weight: 300;
    src: local("Open Sans Light"), local("OpenSans-Light"),
      url(https://fonts.gstatic.com/s/opensans/v17/mem5YaGs126MiZpBA-UN_r8OUuhs.ttf)
        format("truetype");
  }
  #controls {
    font-family: Open Sans;
    background-color: rgba(255, 255, 255, 0.25);
    padding: 20px;
    border-radius: 5px;
    position: absolute;
    left: 50%;
    -webkit-transform: translatex(-50%);
    transform: translatex(-50%);
    margin-top: 20px;
  }
  #controls label {
    text-align: left;
    display: block;
  }
  #controls label span {
    display: inline-block;
    width: 200px;
    text-align: right;
    font-size: 0.8em;
    text-transform: uppercase;
  }
  #controls p {
    margin: 0;
    margin-bottom: 1em;
    padding-bottom: 1em;
    border-bottom: 2px solid #ccc;
  }`,
  js: `/*
  Disclaimer - all credits to the original creator:
  https://codepen.io/dalhundal/pen/KpabZB
*/
var thermostatDial = (function () {
  /*
   * Utility functions
   */

  // Create an element with proper SVG namespace, optionally setting its attributes and appending it to another element
  function createSVGElement(tag, attributes, appendTo) {
    var element = document.createElementNS(
      "http://www.w3.org/2000/svg",
      tag
    );
    attr(element, attributes);
    if (appendTo) {
      appendTo.appendChild(element);
    }
    return element;
  }

  // Set attributes for an element
  function attr(element, attrs) {
    for (var i in attrs) {
      element.setAttribute(i, attrs[i]);
    }
  }

  // Rotate a cartesian point about given origin by X degrees
  function rotatePoint(point, angle, origin) {
    var radians = (angle * Math.PI) / 180;
    var x = point[0] - origin[0];
    var y = point[1] - origin[1];
    var x1 = x * Math.cos(radians) - y * Math.sin(radians) + origin[0];
    var y1 = x * Math.sin(radians) + y * Math.cos(radians) + origin[1];
    return [x1, y1];
  }

  // Rotate an array of cartesian points about a given origin by X degrees
  function rotatePoints(points, angle, origin) {
    return points.map(function (point) {
      return rotatePoint(point, angle, origin);
    });
  }

  // Given an array of points, return an SVG path string representing the shape they define
  function pointsToPath(points) {
    return (
      points
        .map(function (point, iPoint) {
          return (iPoint > 0 ? "L" : "M") + point[0] + " " + point[1];
        })
        .join(" ") + "Z"
    );
  }

  function circleToPath(cx, cy, r) {
    return [
      "M",
      cx,
      ",",
      cy,
      "m",
      0 - r,
      ",",
      0,
      "a",
      r,
      ",",
      r,
      0,
      1,
      ",",
      0,
      r * 2,
      ",",
      0,
      "a",
      r,
      ",",
      r,
      0,
      1,
      ",",
      0,
      0 - r * 2,
      ",",
      0,
      "z"
    ]
      .join(" ")
      .replace(/\s,\s/g, ",");
  }

  function donutPath(cx, cy, rOuter, rInner) {
    return (
      circleToPath(cx, cy, rOuter) + " " + circleToPath(cx, cy, rInner)
    );
  }

  // Restrict a number to a min + max range
  function restrictToRange(val, min, max) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
  }

  // Round a number to the nearest 0.5
  function roundHalf(num) {
    return Math.round(num * 2) / 2;
  }

  function setClass(el, className, state) {
    el.classList[state ? "add" : "remove"](className);
  }

  /*
   * The "MEAT"
   */

  return function (targetElement, options) {
    var self = this;

    /*
     * Options
     */
    options = options || {};
    options = {
      diameter: options.diameter || 400,
      minValue: options.minValue || 10, // Minimum value for target temperature
      maxValue: options.maxValue || 40, // Maximum value for target temperature
      numTicks: options.numTicks || 150 // Number of tick lines to display around the dial
    };

    /*
     * Properties - calculated from options in many cases
     */
    var properties = {
      tickDegrees: 300, //  Degrees of the dial that should be covered in tick lines
      rangeValue: options.maxValue - options.minValue,
      radius: options.diameter / 2,
      ticksOuterRadius: options.diameter / 30,
      ticksInnerRadius: options.diameter / 8,
      hvac_states: ["off", "heating", "cooling"],
      dragLockAxisDistance: 15
    };
    properties.lblAmbientPosition = [
      properties.radius,
      properties.ticksOuterRadius -
        (properties.ticksOuterRadius - properties.ticksInnerRadius) / 2
    ];
    properties.offsetDegrees = 180 - (360 - properties.tickDegrees) / 2;

    /*
     * Object state
     */
    var state = {
      target_temperature: options.minValue,
      ambient_temperature: options.minValue,
      hvac_state: properties.hvac_states[0],
      has_leaf: false,
      away: false
    };

    /*
     * Property getter / setters
     */
    Object.defineProperty(this, "target_temperature", {
      get: function () {
        return state.target_temperature;
      },
      set: function (val) {
        state.target_temperature = restrictTargetTemperature(+val);
        render();
      }
    });
    Object.defineProperty(this, "ambient_temperature", {
      get: function () {
        return state.ambient_temperature;
      },
      set: function (val) {
        state.ambient_temperature = roundHalf(+val);
        render();
      }
    });
    Object.defineProperty(this, "hvac_state", {
      get: function () {
        return state.hvac_state;
      },
      set: function (val) {
        if (properties.hvac_states.indexOf(val) >= 0) {
          state.hvac_state = val;
          render();
        }
      }
    });
    Object.defineProperty(this, "has_leaf", {
      get: function () {
        return state.has_leaf;
      },
      set: function (val) {
        state.has_leaf = !!val;
        render();
      }
    });
    Object.defineProperty(this, "away", {
      get: function () {
        return state.away;
      },
      set: function (val) {
        state.away = !!val;
        render();
      }
    });

    /*
     * SVG
     */
    var svg = createSVGElement(
      "svg",
      {
        width: "100%", //options.diameter+'px',
        height: "100%", //options.diameter+'px',
        viewBox: "0 0 " + options.diameter + " " + options.diameter,
        class: "dial"
      },
      targetElement
    );
    // CIRCULAR DIAL
    var circle = createSVGElement(
      "circle",
      {
        cx: properties.radius,
        cy: properties.radius,
        r: properties.radius,
        class: "dial__shape"
      },
      svg
    );
    // EDITABLE INDICATOR
    var editCircle = createSVGElement(
      "path",
      {
        d: donutPath(
          properties.radius,
          properties.radius,
          properties.radius - 4,
          properties.radius - 8
        ),
        class: "dial__editableIndicator"
      },
      svg
    );

    /*
     * Ticks
     */
    var ticks = createSVGElement(
      "g",
      {
        class: "dial__ticks"
      },
      svg
    );
    var tickPoints = [
      [properties.radius - 1, properties.ticksOuterRadius],
      [properties.radius + 1, properties.ticksOuterRadius],
      [properties.radius + 1, properties.ticksInnerRadius],
      [properties.radius - 1, properties.ticksInnerRadius]
    ];
    var tickPointsLarge = [
      [properties.radius - 2, properties.ticksOuterRadius],
      [properties.radius + 2, properties.ticksOuterRadius],
      [properties.radius + 2, properties.ticksInnerRadius + 20],
      [properties.radius - 2, properties.ticksInnerRadius + 20]
    ];
    var tickPointsMedium = [
      [properties.radius - 2, properties.ticksOuterRadius],
      [properties.radius + 2, properties.ticksOuterRadius],
      [properties.radius + 2, properties.ticksInnerRadius],
      [properties.radius - 2, properties.ticksInnerRadius]
    ];
    var theta = properties.tickDegrees / options.numTicks;
    var tickArray = [];
    for (var iTick = 0; iTick < options.numTicks; iTick++) {
      tickArray.push(
        createSVGElement("path", { d: pointsToPath(tickPoints) }, ticks)
      );
    }

    /*
     * Labels
     */
    var lblTarget = createSVGElement(
      "text",
      {
        x: properties.radius,
        y: properties.radius,
        class: "dial__lbl dial__lbl--target"
      },
      svg
    );
    var lblTarget_text = document.createTextNode("");
    lblTarget.appendChild(lblTarget_text);
    //
    var lblTargetHalf = createSVGElement(
      "text",
      {
        x: properties.radius + properties.radius / 2.5,
        y: properties.radius - properties.radius / 8,
        class: "dial__lbl dial__lbl--target--half"
      },
      svg
    );
    var lblTargetHalf_text = document.createTextNode("5");
    lblTargetHalf.appendChild(lblTargetHalf_text);
    //
    var lblAmbient = createSVGElement(
      "text",
      {
        class: "dial__lbl dial__lbl--ambient"
      },
      svg
    );
    var lblAmbient_text = document.createTextNode("");
    lblAmbient.appendChild(lblAmbient_text);
    //
    var lblAway = createSVGElement(
      "text",
      {
        x: properties.radius,
        y: properties.radius,
        class: "dial__lbl dial__lbl--away"
      },
      svg
    );
    var lblAway_text = document.createTextNode("AWAY");
    lblAway.appendChild(lblAway_text);
    //
    var lblHvac = createSVGElement(
      "text",
      {
        x: properties.radius,
        y: properties.radius - 65,
        class: "dial__lbl dial__lbl--hvac"
      },
      svg
    );
    var lblHvac_text = document.createTextNode("COOLING");
    lblHvac.appendChild(lblHvac_text);
    //
    var icoLeaf = createSVGElement(
      "path",
      {
        class: "dial__ico__leaf"
      },
      svg
    );

    /*
     * LEAF
     */
    var leafScale = properties.radius / 5 / 100;
    var leafDef = [
      "M",
      3,
      84,
      "c",
      24,
      17,
      51,
      18,
      73,
      -6,
      "C",
      100,
      52,
      100,
      22,
      100,
      4,
      "c",
      -13,
      15,
      -37,
      9,
      -70,
      19,
      "C",
      4,
      32,
      0,
      63,
      0,
      76,
      "c",
      6,
      -7,
      18,
      -17,
      33,
      -23,
      24,
      -9,
      34,
      -9,
      48,
      -20,
      -9,
      10,
      -20,
      16,
      -43,
      24,
      "C",
      22,
      63,
      8,
      78,
      3,
      84,
      "z"
    ]
      .map(function (x) {
        return isNaN(x) ? x : x * leafScale;
      })
      .join(" ");
    var translate = [
      properties.radius - leafScale * 100 * 0.5,
      properties.radius * 1.5
    ];
    var icoLeaf = createSVGElement(
      "path",
      {
        class: "dial__ico__leaf",
        d: leafDef,
        transform: "translate(" + translate[0] + "," + translate[1] + ")"
      },
      svg
    );

    /*
     * RENDER
     */
    function render() {
      renderAway();
      renderHvacState();
      renderTicks();
      renderTargetTemperature();
      renderAmbientTemperature();
      renderLeaf();
    }
    render();

    /*
     * RENDER - ticks
     */
    function renderTicks() {
      var vMin, vMax;
      if (self.away) {
        vMin = self.ambient_temperature;
        vMax = vMin;
      } else {
        vMin = Math.min(
          self.ambient_temperature,
          self.target_temperature
        );
        vMax = Math.max(
          self.ambient_temperature,
          self.target_temperature
        );
      }
      var min = restrictToRange(
        Math.round(
          ((vMin - options.minValue) / properties.rangeValue) *
            options.numTicks
        ),
        0,
        options.numTicks - 1
      );
      var max = restrictToRange(
        Math.round(
          ((vMax - options.minValue) / properties.rangeValue) *
            options.numTicks
        ),
        0,
        options.numTicks - 1
      );
      // Check where is ambient
      var isMinAmbient = false;
      if (self.ambient_temperature < self.target_temperature) {
        isMinAmbient = true;
      } else {
        isMinAmbient = false;
      }
      // Fill ticks
      tickArray.forEach(function (tick, iTick) {
        var isActive = iTick >= min && iTick <= max;
        var tickPointSize;
        if (iTick == min && iTick == max) {
          // Ambient and Target are equal
          tickPointSize = tickPointsLarge;
        } else if (iTick == min) {
          // Ambient is on the left side?
          tickPointSize = isMinAmbient
            ? tickPointsMedium
            : tickPointsLarge;
        } else if (iTick == max) {
          // Ambient is on the righ side?
          tickPointSize = !isMinAmbient
            ? tickPointsMedium
            : tickPointsLarge;
        } else {
          tickPointSize = tickPoints;
        }
        attr(tick, {
          d: pointsToPath(
            rotatePoints(
              tickPointSize,
              iTick * theta - properties.offsetDegrees,
              [properties.radius, properties.radius]
            )
          ),
          class: isActive ? "active" : ""
        });
      });
    }

    /*
     * RENDER - ambient temperature
     */
    function renderAmbientTemperature() {
      lblAmbient_text.nodeValue = Math.floor(self.ambient_temperature);
      if (self.ambient_temperature % 1 != 0) {
        lblAmbient_text.nodeValue += "⁵";
      }
      var peggedValue = restrictToRange(
        self.ambient_temperature,
        options.minValue,
        options.maxValue
      );
      degs =
        (properties.tickDegrees * (peggedValue - options.minValue)) /
          properties.rangeValue -
        properties.offsetDegrees;
      if (peggedValue > self.target_temperature) {
        degs += 8;
      } else {
        degs -= 8;
      }
      var pos = rotatePoint(properties.lblAmbientPosition, degs, [
        properties.radius,
        properties.radius
      ]);
      attr(lblAmbient, {
        x: pos[0],
        y: pos[1]
      });
    }

    /*
     * RENDER - target temperature
     */
    function renderTargetTemperature() {
      lblTarget_text.nodeValue = Math.floor(self.target_temperature);
      setClass(lblTargetHalf, "shown", self.target_temperature % 1 != 0);
    }

    /*
     * RENDER - leaf
     */
    function renderLeaf() {
      setClass(svg, "has-leaf", self.has_leaf);
    }

    /*
     * RENDER - HVAC state
     */
    function renderHvacState() {
      Array.prototype.slice.call(svg.classList).forEach(function (c) {
        if (c.match(/^dial--state--/)) {
          svg.classList.remove(c);
        }
      });
      svg.classList.add("dial--state--" + self.hvac_state);
      // Change HVAC Text
      let hvacText = document.querySelector(".dial__lbl--hvac");
      switch (self.hvac_state) {
        case "cooling":
          hvacText.textContent = "COOLING";
          break;
        case "heating":
          hvacText.textContent = "HEATING";
          break;
        default:
          hvacText.textContent = "";
          break;
      }
    }

    /*
     * RENDER - away
     */
    function renderAway() {
      svg.classList[self.away ? "add" : "remove"]("away");
    }

    /*
     * Helper functions
     */
    function restrictTargetTemperature(t) {
      return restrictToRange(
        roundHalf(t),
        options.minValue,
        options.maxValue
      );
    }

    function angle(point) {
      var dx = point[0] - properties.radius;
      var dy = point[1] - properties.radius;
      var theta = Math.atan(dx / dy) / (Math.PI / 180);
      if (point[0] >= properties.radius && point[1] < properties.radius) {
        theta = 90 - theta - 90;
      } else if (
        point[0] >= properties.radius &&
        point[1] >= properties.radius
      ) {
        theta = 90 - theta + 90;
      } else if (
        point[0] < properties.radius &&
        point[1] >= properties.radius
      ) {
        theta = 90 - theta + 90;
      } else if (
        point[0] < properties.radius &&
        point[1] < properties.radius
      ) {
        theta = 90 - theta + 270;
      }
      return theta;
    }

    function getSizeRatio() {
      return options.diameter / targetElement.clientWidth;
    }
  };
})();

/* ==== NEST CODE */
var SETPOINT = 25;
document.getElementById("thermostat").innerHTML = "";
var nest = new thermostatDial(document.getElementById("thermostat"));
nest.target_temperature = SETPOINT;
nest.ambient_temperature = SETPOINT;

function checkSetPointTemp() {
  let myOutput = document.getElementById("myOutput");
  if (nest.ambient_temperature > nest.target_temperature) {
    myOutput.innerText = "ON";
    nest.hvac_state = "cooling";
  } else {
    myOutput.innerText = "OFF";
    nest.hvac_state = "off";
  }
}

function targetTempUp_click() {
  nest.target_temperature += 1;
  checkSetPointTemp();
}

function targetTempDown_click() {
  nest.target_temperature -= 1;
  checkSetPointTemp();
}

var mySensor = document.getElementById("mySensor");
mySensor.oninput = function () {
  nest.ambient_temperature = this.value;
  checkSetPointTemp();
};

// Nest options
// nest.target_temperature 	// Target Temp
// nest.ambient_temperature	// Ambient Temp
// nest.hvac_state // Hvac State (cooling, heating, off)
// nest.has_leaf // ECO mode (true, false)
// next.away // Away (true, false)`
};
