const controller = new Leap.Controller({
  background: true,
  checkVersion: false
});
window.controller = controller;

const socket = io('http://localhost:3000', {
  autoConnect: false
});

// socket.connect();

controller.use('handHold', {})
  .use('handEntry', {})
  .use('networking', {
    peer: socket
  })
  .use('riggedHand', {
  // turns out that this function is horrendously slow.
  //      boneLabels: function(boneMesh, leapHand){
  //        if (boneMesh.name != "Wrist") return;
  //        return leapHand.id
  //      }
});

controller.connect();
