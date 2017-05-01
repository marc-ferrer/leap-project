const controller = new Leap.Controller();
window.controller = controller;
// Leap.loopController.setBackground(true);
controller
.use('handEntry')
.connect();

function onFrame(frame) {
	// TODO: Program frame filtering here
	if (frame.hands && frame.hands.length === 1) {
		// console.log(`Frame id: ${frame.id} hand: `, frame.hands[0]);
		const capturedHand = frame.hands[0];
	}
}

controller.on('frame', onFrame);

const rot = document.getElementById('hand-rotation');
const pitch = document.getElementById('hand-pitch');
const mFingerAtt = document.getElementById('middle-tip');
const rFingerAtt = document.getElementById('ring-tip');
const mrDistance = document.getElementById('mr-distance');
const mDirection = document.getElementById('middle-direction');
const rDirection = document.getElementById('ring-direction');
const angle = document.getElementById('angle');

setInterval(() => {
  frame = controller.frame();
  if (frame.hands && frame.hands.length === 1) {
		const capturedHand = frame.hands[0];
    const mFinger = capturedHand.middleFinger;
    const rFinger = capturedHand.ringFinger;
    const middleVector = [mFinger.direction[0], mFinger.direction[2]];
    const ringVector = [rFinger.direction[0], rFinger.direction[2]];

    const dotProduct = Leap.glMatrix.vec2.dot(middleVector, ringVector);
    const lengths = Leap.glMatrix.vec2.len(middleVector) * Leap.glMatrix.vec2.len(ringVector);
    const cosinus = dotProduct / lengths;
    const vectorsAngle = Math.acos(cosinus) * 180 / Math.PI;

    rot.innerText = capturedHand.roll();
    pitch.innerText = capturedHand.pitch();
    mFingerAtt.innerText = vectorToString(mFinger.tipPosition);
    rFingerAtt.innerText = vectorToString(rFinger.tipPosition);
    const distance = Math.abs(
      capturedHand.middleFinger.tipPosition[0] - capturedHand.ringFinger.tipPosition[0]);
    mrDistance.innerText = distance
    angle.innerText = vectorsAngle;
    mDirection.innerText = vectorToString(mFinger.direction, 3);
    rDirection.innerText = vectorToString(rFinger.direction, 3);
    
    window.fingerControls = {
      mrDistance: distance
    };

    // console.log('Middle finger: ', capturedHand.middleFinger);
    // console.log('Ring finger: ', capturedHand.ringFinger);
	}else {
    window.fingerControls = null;
  }
}, 200);
