// EXPRESS NO SQL
// npm start
// npm install --save (module)
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");
const fs = require("fs-extra");
const path = require("path");

// Get requests shouldn't change any data (Ony for getting info)
// - Variables are embedded in the URL
// Post request make important changes (Buy, create account, upload, etc)
// - Variables are embedded in the body of the msg.
// - Refreching a POST request will pupop an alert

// build mini web app
const app = express();
app.use(morgan("combined")); // Prints all devices that have requested data.
app.use(bodyParser.json()); // Allows getting req.body.{jsonparam} in POST
app.use(cors());
app.use(fileUpload()); // Allows getting req.files with the file data.

const CLIENT_URL = "http://localhost:8080";

// Run Server
app.listen(process.env.PORT || 8081);
console.log("Server Running...");

// Without sequelize
// Send JSON
app.get("/status", (req, res) => {
  res.send({
    message: "hello world!"
  });
});

// Get FILE (will download as (file.zip))
app.get("/file", (req, res) => {
  res.sendFile(__dirname + "/lol.zip");
});

// Get FILE (will download as (:name.zip))
app.get("/file/:name", (req, res, next) => {
  var fileName = req.params.name;
  res.sendFile(__dirname + "/" + fileName, function(err) {
    if (err) {
      next(err);
    } else {
      console.log("Sent:", fileName);
    }
  });
});

// Upload Files
app.post("/upload", function(req, res) {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send("No files were uploaded.");
  }
  console.log("Files to Upload:", req.files);
  let userFile = req.files.file;

  // Use the mv() method to place the file somewhere on your server
  userFile.mv(__dirname + "/uploads/" + userFile.name, function(err) {
    if (err) return res.status(500).send(err);
    res.send("File uploaded!");
  });
});
// TEST FILE UPLOAD:
/*
<html>
  <body>
    <form ref='uploadForm' 
      id='uploadForm' 
      action='http://localhost:8081/upload' 
      method='post' 
      encType="multipart/form-data">
        <input type="file" name="file" />
        <input type='submit' value='Upload!' />
    </form>     
  </body>
</html>
*/

// Authenticate user
app.post("/register", function(req, res) {
  res.send({
    message: `Hello ${req.body.email}! your user was registered!`
  });
});

// ####
// In Production QUERIES
// ####

// Download files (GET, /download/{filename})
app.get("/download/:file(*)", (req, res) => {
  var file = req.params.file;
  var fileLocation = path.join("./files", file);
  console.log(fileLocation);
  res.download(fileLocation, file);
});

app.get("/amalgamFiles", (req, res) => {
  // Read amalgam.html
  var amalgamHTML = fs.readFileSync(
    "../public/amalgamNative/amalgam.html",
    "utf8"
  );

  // Read amalgam.js
  var amalgamJS = fs.readFileSync("../public/amalgamNative/amalgam.js", "utf8");

  // Read physical-button.js
  var physicalButtonJS = fs.readFileSync(
    "../public/amalgamNative/physical-button.js",
    "utf8"
  );

  // Read physical-motorized-pot.js
  var physicalMotorizedPotJS = fs.readFileSync(
    "../public/amalgamNative/physical-motorized-pot.js",
    "utf8"
  );

  // Read physical-pot.js
  var physicalPotJS = fs.readFileSync(
    "../public/amalgamNative/physical-pot.js",
    "utf8"
  );

  // Read physical-rgb-led.js
  var physicalRgbLedJS = fs.readFileSync(
    "../public/amalgamNative/physical-rgb-led.js",
    "utf8"
  );

  // Read physical-servo-motor.js
  var physicalServoMotorJS = fs.readFileSync(
    "../public/amalgamNative/physical-servo-motor.js",
    "utf8"
  );

  // Read physical-output.js
  var physicalOutputJS = fs.readFileSync(
    "../public/amalgamNative/physical-output.js",
    "utf8"
  );

  // Read test-physical-button.js
  var testPhysicalButtonJS = fs.readFileSync(
    "../public/amalgamNative/test-physical-button.js",
    "utf8"
  );

  // Read test-physical-submit.js
  var testPhysicalSubmitJS = fs.readFileSync(
    "../public/amalgamNative/test-physical-submit.js",
    "utf8"
  );

  // Read board pinouts / raspberrypi_pinout.css
  var raspberryPinoutCSS = fs.readFileSync(
    "../public/amalgamNative/boards_pinout/raspberrypi_pinout.css",
    "utf8"
  );

  res.send({
    message: [
      { filename: "amalgam.html", data: amalgamHTML, folder: "" },
      { filename: "amalgam.js", data: amalgamJS, folder: "" },
      { filename: "physical-button.js", data: physicalButtonJS, folder: "" },
      {
        filename: "physical-motorized-pot.js",
        data: physicalMotorizedPotJS,
        folder: ""
      },
      { filename: "physical-pot.js", data: physicalPotJS, folder: "" },
      { filename: "physical-rgb-led.js", data: physicalRgbLedJS, folder: "" },
      {
        filename: "physical-servo-motor.js",
        data: physicalServoMotorJS,
        folder: ""
      },
      { filename: "physical-output.js", data: physicalOutputJS, folder: "" },
      {
        filename: "test-physical-button.js",
        data: testPhysicalButtonJS,
        folder: ""
      },
      {
        filename: "test-physical-submit.js",
        data: testPhysicalSubmitJS,
        folder: ""
      },
      {
        filename: "raspberrypi_pinout.css",
        data: raspberryPinoutCSS,
        folder: "boards_pinout"
      }
    ]
  });
});

// Generate web page
app.post("/generateWebPage", function(req, res) {
  console.log("\n USER NAME: ", req.body.userName);
  console.log("\n USER HTML: ", req.body.htmlDoc);
  console.log("\n USER CSS: ", req.body.cssDoc);

  const userName = req.body.userName;
  // Create index.html file
  fs.writeFile(
    `../public/userapps/${userName}/index.html`,
    req.body.htmlDoc,
    function(err) {
      if (err) {
        res.status(500).send({
          error: "Server error when creating html File"
        });
        throw err;
      }
    }
  );

  // Create hardware.css file
  fs.writeFile(
    `../public/userapps/${userName}/hardware.css`,
    req.body.cssDoc,
    function(err) {
      if (err) {
        res.status(500).send({
          error: "Server error when creating css File"
        });
        throw err;
      }
    }
  );

  // Copy amalgamNative folder to the user folder
  fs.copySync(
    `../public/amalgamNative`,
    `../public/userapps/${userName}/amalgam`
  );

  // If success send the user a link back
  res.send({ link: `${CLIENT_URL}/userapps/${userName}/index.html` });
});

// Generate PCB
app.post("/generatePCB", function(req, res) {
  console.log("\n######\n###### Generate PCB\n######");
  console.log("PCB Height:", req.body.pcbHeight);
  console.log("PCB Width :", req.body.pcbWidth);
  console.log("Board Pin Map :", req.body.pinMap);
  console.log("PCB parts :\n", req.body.parts);

  // Generate new JSON of parts
  var pcbInput = {}; // Empty object
  pcbInput["pcbHeight"] = req.body.pcbHeight;
  pcbInput["pcbWidth"] = req.body.pcbWidth;
  pcbInput["availableGpio"] = req.body.pinMap.gpio;
  pcbInput["availableI2c"] = req.body.pinMap.i2c;
  pcbInput["availableSpi"] = req.body.pinMap.spi;
  pcbInput["availableSerial"] = req.body.pinMap.spi;
  // Get gpios
  var partNum = 0;
  for (var key in req.body.parts) {
    // Get I/Os
    pcbInput["part" + partNum] = {
      componentName: req.body.parts[key].componentName,
      componentWidth: req.body.parts[key].componentWidth,
      componentHeight: req.body.parts[key].componentHeight,
      componentX: req.body.parts[key].componentCenterLeft,
      componentY: req.body.parts[key].componentCenterTop,
      gpio: req.body.parts[key].gpio,
      i2c: req.body.parts[key].i2c,
      spi: req.body.parts[key].spi,
      serial: req.body.parts[key].spi
    };
    partNum++;
  }
  console.log("\n######\n###### Final PCB data\n######");
  console.log(pcbInput);

  // Create pcbInput.json file
  fs.writeFile(
    "./gadgetron/pcbInput.json",
    JSON.stringify(pcbInput, null, 2),
    "utf8",
    function(err) {
      if (err) {
        res.status(500).send({
          error: "Server error when creating psbInput.json File"
        });
        throw err;
      }
    }
  );

  // #####
  // DO SOMETHING WITH GADGETRON HERE!!!
  // #####

  // Return OK
  res.status(200).send({
    msg: "OK"
  });
});
