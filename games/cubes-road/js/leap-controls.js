const controller = new Leap.Controller();
window.controller = controller;
const io = window.io;
console.log('io', window.io);
const socket = io('http://localhost:3000/cubes-road', {
  autoConnect: false
});
// Leap.loopController.setBackground(true);
controller
.use('handEntry')
.use('socket-networking', {
	socket: socket
})
.connect();

let maxRightYaw = 0.9;
let maxLeftYaw = 0.6;
export function getPosition(leftLimit, rightLimit) {
  const frame = controller.frame();
  if (frame.hands && frame.hands.length > 0) {
    const hand = frame.hands[0];

    const handVector = [hand.direction[0], hand.direction[2]];
    const armVector = [hand.arm.direction()[0], hand.arm.direction()[2]];
    const dotProduct = Leap.glMatrix.vec2.dot(handVector, armVector);
    const lengths = Leap.glMatrix.vec2.len(handVector) * Leap.glMatrix.vec2.len(armVector); // eslint-disable-line
    const cos = dotProduct / lengths;
    const yawAngle = Math.acos(cos);
    if (handVector[0] > armVector[0]) {
      if (yawAngle > maxRightYaw) {
        console.log('Updating max yaw angle to the right', yawAngle);
        maxRightYaw = yawAngle;
      }
      return yawAngle * rightLimit / maxRightYaw;
    }else {
      if (yawAngle > maxLeftYaw) {
        console.log('Updating max yaw angle to the left', yawAngle);
        maxLeftYaw = yawAngle;
      }
      return yawAngle * leftLimit / maxLeftYaw;
    }
  }else {
    return null;
  }
}
