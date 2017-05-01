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

setInterval(() => {
  frame = controller.frame();
  if (frame.hands && frame.hands.length === 1) {
		const capturedHand = frame.hands[0];

    rot.innerText = capturedHand.roll();
    pitch.innerText = capturedHand.pitch();
    mFingerAtt.innerText = vectorToString(capturedHand.middleFinger.tipPosition);
    rFingerAtt.innerText = vectorToString(capturedHand.ringFinger.tipPosition);
    const distance = Math.abs(
      capturedHand.middleFinger.tipPosition[0] - capturedHand.ringFinger.tipPosition[0]);
    mrDistance.innerText = distance
    
    window.fingerControls = {
      mrDistance: distance
    };

    // console.log('Middle finger: ', capturedHand.middleFinger);
    // console.log('Ring finger: ', capturedHand.ringFinger);
	}else {
    window.fingerControls = null;
  }
}, 200);
