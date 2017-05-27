'use strict';

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
function onFrame(frame) {
	// TODO: Program frame filtering here
	if (frame.hands && frame.hands.length === 1) {
		// console.log(`Frame id: ${frame.id} hand: `, frame.hands[0]);
		const capturedHand = frame.hands[0];
		if (capturedHand.palmNormal[2] < -0.33 && !handUpstarted) {
			console.log(`Starting new gesture in frame: ${frame.id}`);
			handUpstarted = true;
			const upEvent = new CustomEvent('handUp', {
				hand: capturedHand
			});
			window.dispatchEvent(upEvent);
		}
		if (capturedHand.palmNormal[2] > -0.33 && handUpstarted) {
			handUpstarted = false;
			const downEvent = new CustomEvent('handDown', {
				hand: capturedHand
			});
			window.dispatchEvent(downEvent);
		}
	}
}

controller.on('frame', onFrame);
