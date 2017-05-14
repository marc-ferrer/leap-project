const controller = new Leap.Controller();
window.controller = controller;
// Leap.loopController.setBackground(true);
controller
.use('handEntry')
.connect();

// base min and max yaws
let minYaw = -1.1;
let maxYaw = 1.3;

export function getPosition(leftLimit, rightLimit) {
  const frame = controller.frame();
  if (frame.hands && frame.hands.length > 0) {
    const hand = frame.hands[0];

    const yaw = hand.yaw();
    // TODO: Check if yaw exceeded min or max yaw and update them if so.
    if (yaw > 0) {
      return yaw * rightLimit / maxYaw;
    }else {
      return yaw * leftLimit / minYaw;
    }
  }else {
    return null;
  }
}
