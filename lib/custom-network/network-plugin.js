
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

function packArray(structure, data){
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
        out.push(
          this.packArray(
            nameOrHash,
            data[j]
          )
        );
      }
    } else { // key-value (nested object) such as interactionBox
      for (var key in nameOrHash) break;
      out.push(this.packArray(
        nameOrHash[key],
        data[key]
      ));
    }
  }
  return out;
}

class FramePacker{
  constructor(options) {
    this.packingStructure = [
      'id', 'timestamp', 'sentAt', {
        hands: [['id', 'type', 'direction', 'palmNormal', 'palmPosition', 'pinchStrength', 'grabStrength']]
      }, {
        pointables: [['id', 'direction', 'handId', 'length', 'tipPosition', 'carpPosition', 'mcpPosition', 'pipPosition', 'dipPosition', 'btipPosition', 'type']]
      }
    ];
    this.packingStructure = packingStructureV2;
  }

  packData(structure, data) {
    let datum;
    let key;
    let nameOrHash;
    let out = [];
    let _i;
    let _j;
    let _len;
    let _len1;
    for (_i = 0, _len = structure.length; _i < _len; _i++) {
      nameOrHash = structure[_i];
      if (typeof nameOrHash === 'string') {
        out.push(data[nameOrHash]);
      } else if (Object.prototype.toString.call(nameOrHash) === '[object Array]') {
        for (_j = 0, _len1 = data.length; _j < _len1; _j++) {
          datum = data[_j];
          out.push(this.packData(nameOrHash, datum));
        }
      } else {
        for (key in nameOrHash) {
          break;
        }
        out.push(this.packData(nameOrHash[key], data[key]));
      }
    }
    return out;
  }

  pack(frameData) {
    return packArray(this.packingStructure, frameData);
    // return this.packData(this.packingStructure, frameData);
  }
}

(function() {
  'use strict';

  Leap.plugin('socket-networking', function(scope) {
    const controller = this;
    let framePacker;
    let _this = this;
    if (!scope.socket) {
      console.warn('No socket supplied');
      return;
    }
    scope.connection = null;
    scope.sendFrames = false;
    scope.maxSendRate = 60;
    scope.frozenHandTimeout = 250;
    scope.framePacker = framePacker = new FramePacker;

    scope.socket.on('error', function(error) {
      console.log('error sending frames:', error, error.type);
      return scope.sendFrames = false;
    });
    scope.connect = function(id) {
      scope.connection = scope.socket.connect(id);
      return scope.connectionEstablished();
    };
    scope.connectionEstablished = function() {
      scope.sendFrames = true;
    };

    controller.on('streamingStopped', function() {
      // TODO: disconnect from socket if still connected
      console.log('StreamingStopped event received');
    });
    controller.on('streamingStarted', function() {
      console.log('StreamingStarted, proceeding to connect to socket');
      // TODO: refactor scope.connect function and use it here.
      scope.connection = scope.socket.connect(function() {
        console.log('Connection stablished successfully');
      });
      scope.connection.on('connect', () => {
        const id = scope.connection.id;
        console.log('Socket connected successfully ', scope.connection.id);
        if (!scope.sendFrames) {
          scope.connectionEstablished();
        }
      });
    });
    scope.lastFrame = null;
    scope.shouldSendFrame = function(frameData) {
      if (scope.lastFrame && (scope.lastFrame.sentAt + scope.maxSendRate) > (new Date).getTime()) {
        return false;
      }
      if (!scope.lastFrame && frameData.hands.length === 0) {
        return false;
      }
      if (scope.lastFrame && scope.lastFrame.hands.length === 0 && frameData.hands.length === 0) {
        return false;
      }
      return true;
    };
    scope.sendFrame = function(frameData) {
      if (!scope.shouldSendFrame(frameData)) {
        return;
      }
      console.log('Sending data to socket server');
      scope.connection.emit('frameData', {
        frameData: framePacker.pack(frameData)
      });
      return scope.lastFrame = frameData;
    };
    return {
      beforeFrameCreated: function(frameData) {
        if (!scope.sendFrames) {
          return;
        }
        scope.sendFrame(frameData);
      }
    };
  });

}).call(this);
