'use strict';
const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const glob = require('glob');
const fs = require('fs');

const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(express.static(path.resolve(__dirname, 'games')));

const controllers = glob.sync(__dirname + '/app/controllers/**/*.js');
controllers.forEach(function(controller) {
  require(controller)(app);
});

const packingStructureV2 = [
  'id',
  'timestamp',
  // this should be replace/upgraded with a whitelist instead of a blacklist.
  // leaving out r,s,y, and gestures
  {hands: [[
    'id',
    'type',
    'direction',
    'palmNormal',
    'palmPosition',
    'palmVelocity',
    'stabilizedPalmPosition',
    'pinchStrength',
    'grabStrength',
    'confidence',
    'armBasis',
    'armWidth',
    'elbow',
    'wrist'
    // leaving out r, s, t, sphereCenter, sphereRadius
  ]]},
  {pointables: [[
    'id',
    'direction',
    'handId',
    'length',
    'stabilizedTipPosition',
    'tipPosition',
    'tipVelocity',
    'tool',
    'carpPosition',
    'mcpPosition',
    'pipPosition',
    'dipPosition',
    'btipPosition',
    'bases',
    'type'
    // leaving out touchDistance, touchZone
  ]]},
  {interactionBox: [
    'center', 'size'
  ]}
];

let ws;
io.on('connection', (socket) => {
  console.log('Client connected through socket.io');
  /* @type fs.WriteStream */
  ws = fs.createWriteStream('leap-output.txt');
  const metadata = {
    metadata: {
      formatVersion: 2,
      generatedBy: 'Socket.io saver',
      frames: 0,
      protocolVersion: 6,
      frameRate: '1.1e+2',
      modified: new Date()
    },
    frames: [packingStructureV2]
  }
  const str = JSON.stringify(metadata);
  ws.write(str.substring(0, str.length - 2));
  socket.on('disconnect', () => {
    console.log('user disconnected');
    ws.write(']}');
    ws.close();
  });

  socket.on('data', (data) => {
    console.log('Data received from leapjs networking', data);
  });

  let dataWritten = 0;
  socket.on('message', (data) => {
    console.log('Message received from leapjs networking', data);
    if (dataWritten < 200) {
      ws.write(',' + JSON.stringify(data.frameData));
      dataWritten++;
    }
  });
});

http.listen(PORT, function () {
  console.log(`'App listening on port ${PORT}!'`);
});
