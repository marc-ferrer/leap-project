(function() {
  const CONTROLS_HEIGHT = 90;

  let controller;
  let controls;
  let initScene;
  const playSlider = document.getElementById('play-slider');
  const toggleButton = document.getElementById('toggle-playback');

  let scene;
  let renderer;
  let camera;

  function togglePlayback(player) {
    player.toggle();
  }

  function togglePlayIcon(player, button) {
    if (player.state === 'playing') {
      button.innerHTML = '<i class="fa fa-pause" aria-hidden="true"></i> Pause';
    }else {
      button.innerHTML = '<i class="fa fa-play" aria-hidden="true"></i> Play';
    }
  }


  window.scene = scene;
  window.renderer = renderer;
  window.camera = camera;

  function initSlider(min, max) {
    playSlider.max = max;
    playSlider.min = min;
    setInterval(() => {
      if (player.state === 'playing') {
        playSlider.value = player.recording.frameIndex;
      }
    }, 5);
    playSlider.oninput = (event) => {
      player.setFrameIndex(parseInt(event.target.value) - 1);
    }
  }

  initScene = function(element) {
    let axis;
    let pointLight;
    const viewHeight = window.innerHeight - CONTROLS_HEIGHT;
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({
      alpha: true
    });
    // renderer.setClearColor(0x000000, 1);
    renderer.setSize(window.innerWidth, viewHeight);
    element.appendChild(renderer.domElement);
    axis = new THREE.AxisHelper(40);
    scene.add(axis);
    scene.add(new THREE.AmbientLight(0x888888));
    pointLight = new THREE.PointLight(0xFFffff);
    pointLight.position = new THREE.Vector3(-20, 10, 0);
    pointLight.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(pointLight);
    camera = new THREE.PerspectiveCamera(
      45, window.innerWidth / viewHeight, 1, 3000);
    camera.position.fromArray([0, 160, 400]);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    window.controls = controls = new THREE.TrackballControls(
      camera, renderer.domElement);
    scene.add(camera);
    window.addEventListener('resize', function() {
      const viewHeight = window.innerHeight - CONTROLS_HEIGHT;
      camera.aspect = window.innerWidth / viewHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, viewHeight);
      controls.handleResize();
      return renderer.render(scene, camera);
    }, false);
    return renderer.render(scene, camera);
  };

  // via Detector.js:
  let webglAvailable  = (function () {
    try {
      const canvas = document.createElement( 'canvas' );
      return !! window.WebGLRenderingContext &&
        ( canvas.getContext( 'webgl' ) ||
          canvas.getContext( 'experimental-webgl' ) );
    }catch(e) {
      return false;
    }
  })();

  if (webglAvailable) {
    initScene(document.getElementById('playback-renderer'));
  }

  window.controller = controller = new Leap.Controller;

  toggleButton.addEventListener('click', function() {
    togglePlayback(player);
    togglePlayIcon(player, this);
  })

  controller
    .use('handHold')
    .use('transform', {
      position: new THREE.Vector3(1, 0, 0)
    })
    .use('handEntry')
    .use('screenPosition')
    .use('playback', {
      recording: './leap-output.json',
      requiredProtocolVersion: 6,
      pauseOnHand: true,
      loop: false
    })
    .use('riggedHand', {
      parent: scene,
      renderer: renderer,
      // scale: 1.5,
      positionScale: 0.5,
      helper: true,
      offset: new THREE.Vector3(0, 0, 0),
      renderFn: function() {
        renderer.render(scene, camera);
        return controls.update();
      },
      materialOptions: {
        // wireframe: getParam('wireframe'),
        color: new THREE.Color(0x333333)
      },
      // dotsMode: true,
      camera: camera,
      checkWebGL: true
    }).connect();

  const player = controller.plugins['playback'].player
  window.player = player;

  window.cropRight = function(frameIndex) {
    if (frameIndex < 0 || frameIndex >= player.recording.frameCount) {
      return;
    }
    player.setFrameIndex(frameIndex);
    player.recording.rightCrop();
  };

  controller.on('playback.ajax:complete', () => {
    initSlider(1, player.recording.frameCount);
  });

  controller.on('playback.playbackFinished', () => {
    togglePlayIcon(player, toggleButton);
  });

  // Uses bone hand instead of rigged hand
  /*controller.use('boneHand', {
      renderer: renderer,
      scene: scene,
      camera: camera,
      render: function() {
        renderer.render(scene, camera);
        return controls.update();
      },
      arm: true
    })
  controller.stopUsing('riggedHand');*/

}).call(this);
