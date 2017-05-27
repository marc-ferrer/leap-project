'use strict';

const HAND_UP_THRESHOLD = 0.23;
const controller = new Leap.Controller();
window.controller = controller;
const socket = io('http://localhost:3000/runner-boy', {
  autoConnect: false
});
// Leap.loopController.setBackground(true);
controller
.use('handHold').use('transform', {
	position: new THREE.Vector3(1, 0, 0)
})
.use('handEntry')
.use('socket-networking', {
	socket: socket
})
.use('screenPosition')
.connect();

let handUpstarted = false;
let palmDotValues = [];
let eventFired = false;
function onFrame(frame) {
	if (frame.hands && frame.hands.length === 1) {
		const capturedHand = frame.hands[0];
		let palmVector = [capturedHand.palmNormal[1], capturedHand.palmNormal[2]];
		let armVector = [
			capturedHand.arm.direction()[1], capturedHand.arm.direction()[2]
		];
		let palmDot = Leap.glMatrix.vec2.dot(palmVector, armVector);

		if (palmDot > HAND_UP_THRESHOLD) {
			if (!handUpstarted) {
				palmDotValues = [];
				handUpstarted = true;
			}
			palmDotValues.push(palmDot);
			if (handUpstarted && palmDotValues.length > 4) {
				let greaterCount = 0;
				let lesserCount = 0;
				palmDotValues.forEach(dotValue => {
					if (dotValue < palmDot) {
						greaterCount++;
					}else {
						lesserCount++;
					}
				});
				const gestureFinished = lesserCount > greaterCount;
				if (gestureFinished && !eventFired) {
					const upEvent = new CustomEvent('handUp', {
						hand: capturedHand,
						strength: palmDot
					});
					window.dispatchEvent(upEvent);
					eventFired = true;
				}
			}
		}
		if (palmDot < HAND_UP_THRESHOLD && handUpstarted) {
			handUpstarted = false;
			palmDotValues = [];
			const downEvent = new CustomEvent('handDown', {
				hand: capturedHand
			});
			window.dispatchEvent(downEvent);
			eventFired = false;
		}
	}
}

controller.on('frame', onFrame);
