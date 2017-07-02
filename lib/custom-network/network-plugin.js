
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

class FramePacker{
  constructor() {
    this.packingStructure = packingStructure;
  }

  packArray(structure, data){
    let out = []
    let nameOrHash;
    for (let i = 0, len1 = structure.length; i < len1; i++){
      // e.g., nameOrHash is either 'id' or {hand: [...]}
      nameOrHash = structure[i];
      if ( typeof  nameOrHash === 'string'){
        out.push(data[nameOrHash]);
      }else if (Object.prototype.toString.call(nameOrHash) == '[object Array]') {
        // nested array, such as hands or fingers
        for (let j = 0, len2 = data.length; j < len2; j++){
          out.push(this.packArray(nameOrHash, data[j]));
        }
      } else { // key-value (nested object) such as interactionBox
        let key;
        // Gets object first key
        for (key in nameOrHash){
          break;
        }
        out.push(this.packArray(nameOrHash[key], data[key]));
      }
    }
    return out;
  }

  pack(frameData) {
    return this.packArray(this.packingStructure, frameData);
  }
}

(function() {
  'use strict';

  Leap.plugin('socket-networking', function(scope) {
    const controller = this;
    let framesBuffer = [];
    let framePacker;
    if (!scope.socket) {
      console.warn('No socket supplied');
      return;
    }
    scope.connection = null;
    scope.sendFrames = false;
    scope.framePacker = framePacker = new FramePacker();
    if (!scope.bufferWindow && scope.bufferWindow !== 0) {
      scope.bufferWindow = 30;
    }

    scope.socket.on('error', function(error) {
      console.log('error sending frames:', error, error.type);
      return scope.sendFrames = false;
    });
    scope.connect = function() {
      scope.connection = scope.socket.connect(function() {
        console.log('Connection stablished successfully');
      });
      scope.connection.on('connect', () => {
        if (!scope.sendFrames) {
          scope.connectionEstablished();
        }
      });
    };
    scope.connectionEstablished = function() {
      scope.sendFrames = true;
    };

    controller.on('streamingStopped', function() {
      console.log('StreamingStopped event received', framesBuffer.length);
    });
    controller.on('streamingStarted', function() {
      scope.connect();
    });
    scope.lastFrame = null;
    scope.shouldSendFrame = function(frameData) {
      if (!scope.lastFrame && frameData.hands.length === 0) {
        return false;
      }
      if (scope.lastFrame &&
        scope.lastFrame.hands.length === 0 &&
        frameData.hands.length === 0) {
        return false;
      }
      return true;
    };
    scope.sendFrame = function(frameData) {
      if (!scope.shouldSendFrame(frameData)) {
        return;
      }
      scope.connection.emit('frameData', {
        frameData: framePacker.pack(frameData)
      });
      return scope.lastFrame = frameData;
    };
    scope.sendFramesBuffer = function() {
      scope.connection.emit('frameBuffer', framesBuffer);
    }
    return {
      beforeFrameCreated: function(frameData) {
        if (!scope.sendFrames) {
          return;
        }
        if (scope.bufferWindow && frameData.hands && frameData.hands.length > 0) {
          framesBuffer.push(framePacker.pack(frameData));
          if (framesBuffer.length >= scope.bufferWindow) {
            scope.sendFramesBuffer();
            framesBuffer = [];
          }
        }else {
          scope.sendFrame(frameData);
        }
      }
    };
  });

}).call(this);
