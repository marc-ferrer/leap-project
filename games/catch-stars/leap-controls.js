/* global vectorToString :true */
// TODO: Import of vectorToString from util and remove the line above
const controller = new Leap.Controller();
window.controller = controller;
const socket = io('http://localhost:3000/catch-stars', {
  autoConnect: false
});

controller
  .use('handEntry')
  .use('socket-networking', {
    socket: socket
  })
  .connect();

let minDistance = 1000;
let maxDistance = 0;
function getFingersDistance(f1, f2) {
  let output = {};
  const frame = controller.frame();
  if (frame.hands && frame.hands.length === 1) {
		const capturedHand = frame.hands[0];
    const fingerA = capturedHand[f1];
    const fingerB = capturedHand[f2];
    const middleVector = [fingerA.direction[0], fingerA.direction[2]];
    const ringVector = [fingerB.direction[0], fingerB.direction[2]];

    const dotProduct = Leap.glMatrix.vec2.dot(middleVector, ringVector);
    const lengths = Leap.glMatrix.vec2.len(middleVector) * Leap.glMatrix.vec2.len(ringVector); // eslint-disable-line
    const cosinus = dotProduct / lengths;
    output.angle = Math.acos(cosinus) * 180 / Math.PI;

    // console.log('Distance vars', fingerA.tipPosition[0], fingerB.tipPosition[0]);
    const distance = Math.abs(fingerA.tipPosition[0] - fingerB.tipPosition[0]);
    console.log('Distance ', distance);
    if (distance > maxDistance) {
      maxDistance = distance;
    }
    if (distance < minDistance) {
      minDistance = distance;
    }
    output.distance = distance;
    output.max = maxDistance;
    output.min = minDistance;
	}
  return output;
}

window.leapControls = {
  getFingersDistance: getFingersDistance
};

/*setInterval(() => {
  const frame = controller.frame();
  if (frame.hands && frame.hands.length === 1) {
		const capturedHand = frame.hands[0];
    const mFinger = capturedHand.middleFinger;
    const rFinger = capturedHand.ringFinger;
    const middleVector = [mFinger.direction[0], mFinger.direction[2]];
    const ringVector = [rFinger.direction[0], rFinger.direction[2]];

    const dotProduct = Leap.glMatrix.vec2.dot(middleVector, ringVector);
    const lengths = Leap.glMatrix.vec2.len(middleVector) * Leap.glMatrix.vec2.len(ringVector); // eslint-disable-line
    const cosinus = dotProduct / lengths;
    const vectorsAngle = Math.acos(cosinus) * 180 / Math.PI;

    rot.innerText = capturedHand.roll();
    pitch.innerText = capturedHand.pitch();
    mFingerAtt.innerText = vectorToString(mFinger.tipPosition);
    rFingerAtt.innerText = vectorToString(rFinger.tipPosition);
    const distance = Math.abs(capturedHand.middleFinger.tipPosition[0] -
      capturedHand.ringFinger.tipPosition[0]);
    mrDistance.innerText = distance
    angle.innerText = vectorsAngle;
    mDirection.innerText = vectorToString(mFinger.direction, 3);
    rDirection.innerText = vectorToString(rFinger.direction, 3);

    window.fingerControls = {
      mrDistance: distance
    };
	}else {
    window.fingerControls = null;
  }
}, 200);*/
