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

const packingStructure = [
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

function leapRecorder(socket){
  let fileName = socket.id.substring(socket.nsp.name.length + 1);
  fileName = socket.nsp.name.substring(1) + '-' + fileName + '.json';
  const ws = fs.createWriteStream(fileName);
  const fileData = {
    metadata: {
      formatVersion: 2,
      generatedBy: 'Socket.io saver',
      frames: 0,
      protocolVersion: 6,
      frameRate: '1.1e+2',
      modified: new Date()
    },
    frames: [packingStructure]
  }
  const str = JSON.stringify(fileData);
  ws.write(str.substring(0, str.length - 2));

  socket.on('disconnect', () => {
    ws.write(']}');
    ws.close();
  });

  socket.on('frameData', (data) => {
    ws.write(',' + JSON.stringify(data.frameData));
  });

  socket.on('frameBuffer', data => {
    let buffer = JSON.stringify(data[0]);
    for (let i = 1; i < data.length; i++) {
      buffer = buffer + ',' + JSON.stringify(data[i]);
    }
    ws.write(',' + buffer);
  });
}

io.of('/catch-stars')
  .on('connection', leapRecorder);
io.of('/runner-boy')
  .on('connection', leapRecorder);
io.of('cubes-road')
  .on('connection', leapRecorder);

http.listen(PORT, function () {
  console.log(`'App listening on port ${PORT}!'`);
});
